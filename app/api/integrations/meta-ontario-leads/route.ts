import { eq } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { getRequestExecutionContext } from "vinext/shims/request-context";
import { getDb } from "../../../../db";
import { formSubmissions } from "../../../../db/schema";

type MetaField = { name?: string; values?: unknown[] };
type MetaLead = {
  id?: string;
  created_time?: string;
  field_data?: MetaField[];
  form_id?: string;
  ad_id?: string;
  adset_id?: string;
  campaign_id?: string;
  platform?: string;
};

type MetaLeadgenValue = {
  leadgen_id?: string;
  form_id?: string;
  page_id?: string;
  ad_id?: string;
  adgroup_id?: string;
  created_time?: number;
};

type MetaWebhookBody = {
  object?: string;
  entry?: Array<{
    id?: string;
    changes?: Array<{ field?: string; value?: MetaLeadgenValue }>;
  }>;
};

const RESOURCE_KEY = "market:ca:on";
const runtimeEnv = env as unknown as Record<string, string | undefined>;
const setting = (name: string) => runtimeEnv[name] || process.env[name] || "";
const GRAPH_VERSION = setting("META_GRAPH_VERSION") || "v26.0";

function clean(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeCreatedAt(value: string | number | undefined) {
  if (!value) return new Date().toISOString();
  const parsed = typeof value === "number" ? new Date(value * 1000) : new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function fieldMap(fields: MetaField[] | undefined) {
  const map = new Map<string, string>();
  for (const field of fields || []) {
    const name = clean(field.name).toLowerCase();
    const value = Array.isArray(field.values) ? field.values.map(clean).filter(Boolean).join(", ") : "";
    if (name && value) map.set(name, value);
  }
  return map;
}

function firstField(fields: Map<string, string>, names: string[]) {
  for (const name of names) {
    const value = fields.get(name);
    if (value) return value;
  }
  return "";
}

function inferLocale(fields: Map<string, string>, formName: string) {
  const explicit = firstField(fields, ["language", "locale", "preferred_language"]);
  const signal = `${explicit} ${formName}`.toLowerCase();
  return signal.includes("fr") || signal.includes("french") || signal.includes("français")
    ? "fr-CA"
    : "en-CA";
}

async function hmacHex(secret: string, payload: string, hash: "SHA-1" | "SHA-256") {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return mismatch === 0;
}

async function validMetaSignature(request: Request, rawBody: string) {
  const appSecret = setting("META_APP_SECRET");
  if (appSecret.length < 24) return false;

  const receivedSha256 = request.headers.get("x-hub-signature-256") || "";
  if (receivedSha256.startsWith("sha256=")) {
    const expectedSha256 = `sha256=${await hmacHex(appSecret, rawBody, "SHA-256")}`;
    if (constantTimeEqual(receivedSha256, expectedSha256)) return true;
  }

  const receivedSha1 = request.headers.get("x-hub-signature") || "";
  if (receivedSha1.startsWith("sha1=")) {
    const expectedSha1 = `sha1=${await hmacHex(appSecret, rawBody, "SHA-1")}`;
    if (constantTimeEqual(receivedSha1, expectedSha1)) return true;
  }

  return false;
}

async function fetchLead(leadgenId: string) {
  const pageToken = setting("META_PAGE_ACCESS_TOKEN");
  if (!pageToken) throw new Error("META_PAGE_ACCESS_TOKEN is not configured");
  const url = new URL(`https://graph.facebook.com/${GRAPH_VERSION}/${encodeURIComponent(leadgenId)}`);
  url.searchParams.set("fields", "id,created_time,field_data,form_id,ad_id,adset_id,campaign_id,platform");
  url.searchParams.set("access_token", pageToken);
  const response = await fetch(url, { headers: { accept: "application/json" } });
  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Meta lead retrieval failed (${response.status}): ${details.slice(0, 300)}`);
  }
  return (await response.json()) as MetaLead;
}

async function fetchName(objectId: string | undefined) {
  const pageToken = setting("META_PAGE_ACCESS_TOKEN");
  if (!objectId || !pageToken) return "";
  const url = new URL(`https://graph.facebook.com/${GRAPH_VERSION}/${encodeURIComponent(objectId)}`);
  url.searchParams.set("fields", "name");
  url.searchParams.set("access_token", pageToken);
  const response = await fetch(url, { headers: { accept: "application/json" } });
  if (!response.ok) return "";
  const body = (await response.json()) as { name?: string };
  return clean(body.name);
}

async function storeLead(lead: MetaLead, webhookValue: MetaLeadgenValue) {
  const leadId = clean(lead.id || webhookValue.leadgen_id);
  if (!leadId) return "skipped" as const;

  const fields = fieldMap(lead.field_data);
  const formId = clean(lead.form_id || webhookValue.form_id);
  const adId = clean(lead.ad_id || webhookValue.ad_id);
  const adsetId = clean(lead.adset_id || webhookValue.adgroup_id);
  const campaignId = clean(lead.campaign_id);
  const [formName, adName, adsetName, campaignName] = await Promise.all([
    fetchName(formId),
    fetchName(adId),
    fetchName(adsetId),
    fetchName(campaignId),
  ]);

  const name = firstField(fields, ["full_name", "name", "first_name"]);
  const email = firstField(fields, ["email", "work_email"]);
  const phone = firstField(fields, ["phone_number", "phone"]);
  if (!name || (!email && !phone)) return "skipped" as const;

  const submissionId = `meta-ontario:${leadId}`;
  const db = getDb();
  const [existing] = await db
    .select({ id: formSubmissions.id })
    .from(formSubmissions)
    .where(eq(formSubmissions.submissionId, submissionId))
    .limit(1);
  if (existing) return "duplicate" as const;

  const locale = inferLocale(fields, formName);
  const organization = firstField(fields, ["company_name", "spa_name", "business_name"]);
  const city = firstField(fields, ["city", "location", "business_location"]);
  const role = firstField(fields, ["job_title", "role"]);
  const spaType = firstField(fields, ["spa_type", "type_of_spa"]);
  const platform = clean(lead.platform) || "Facebook and Instagram";
  const createdAt = normalizeCreatedAt(lead.created_time || webhookValue.created_time);

  await db.insert(formSubmissions).values({
    submissionId,
    formType: "ontario-meta-instant-form",
    name,
    email: email.toLowerCase(),
    phone,
    organization,
    topic: spaType || "Ontario spa partner",
    message: [
      "Company group: SpaPlus",
      "Brand: SpaPlus Canada",
      "Lead purpose: Ontario spa partner registration",
      "Source channel: Meta paid lead form",
      `Language: ${locale}`,
      city && `City or region: ${city}`,
      role && `Role: ${role}`,
      spaType && `Spa type: ${spaType}`,
      `Platform: ${platform}`,
      formId && `Meta form ID: ${formId}`,
      formName && `Meta form name: ${formName}`,
      campaignId && `Meta campaign ID: ${campaignId}`,
      campaignName && `Meta campaign name: ${campaignName}`,
      adsetId && `Meta ad set ID: ${adsetId}`,
      adsetName && `Meta ad set name: ${adsetName}`,
      adId && `Meta ad ID: ${adId}`,
      adName && `Meta ad name: ${adName}`,
      `Meta lead ID: ${leadId}`,
      `Submitted at: ${createdAt}`,
    ]
      .filter(Boolean)
      .join("\n"),
    locale,
    source: "Meta paid lead form | Ontario",
    resourceKey: RESOURCE_KEY,
    status: "new",
    createdAt,
  });
  return "inserted" as const;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token") || "";
  const challenge = url.searchParams.get("hub.challenge") || "";
  const expected =
    setting("META_WEBHOOK_VERIFY_TOKEN_ID") || setting("META_WEBHOOK_VERIFY_TOKEN");
  if (expected.length < 24) return new Response("Webhook is not configured", { status: 503 });
  if (!constantTimeEqual(token, expected)) return new Response("Verification token mismatch", { status: 403 });
  if (mode !== "subscribe") return new Response("Verification mode mismatch", { status: 403 });
  return new Response(challenge, { status: 200 });
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!(await validMetaSignature(request, rawBody))) {
    return Response.json({ error: "Invalid Meta signature" }, { status: 401 });
  }

  const body = JSON.parse(rawBody) as MetaWebhookBody;
  if (body.object !== "page") {
    return Response.json({ success: true, inserted: 0, duplicates: 0, skipped: 0 });
  }

  const values = (body.entry || [])
    .flatMap((entry) => entry.changes || [])
    .filter((change) => change.field === "leadgen")
    .map((change) => change.value || {});
  if (values.length > 100) {
    return Response.json({ error: "Invalid batch" }, { status: 400 });
  }

  const processing = processLeadValues(values).catch((error: unknown) => {
    console.error("Meta lead webhook processing failed", {
      message: error instanceof Error ? error.message : "Unknown error",
      leadCount: values.length,
    });
  });
  const executionContext = getRequestExecutionContext();
  if (executionContext) executionContext.waitUntil(processing);
  else await processing;

  return Response.json({ success: true, accepted: values.length });
}

async function processLeadValues(values: MetaLeadgenValue[]) {
  let inserted = 0;
  let duplicates = 0;
  let skipped = 0;
  for (const value of values) {
    const leadgenId = clean(value.leadgen_id);
    if (!leadgenId) {
      skipped += 1;
      continue;
    }
    const outcome = await storeLead(await fetchLead(leadgenId), value);
    if (outcome === "inserted") inserted += 1;
    else if (outcome === "duplicate") duplicates += 1;
    else skipped += 1;
  }

  console.log("Meta lead webhook processed", { inserted, duplicates, skipped });
}

import { eq } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { getRequestExecutionContext } from "vinext/shims/request-context";
import { getDb } from "../../../../db";
import { formSubmissions } from "../../../../db/schema";
import {
  buildMarketOwnerEmail,
  buildMarketVisitorEmail,
  type MarketLeadEmailData,
} from "../../../market-email-templates";

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
const META_PAGE_ID = setting("META_PAGE_ID") || "1065026380020011";
const META_FORM_IDS = new Set(
  (setting("META_FORM_IDS") || "2595979447504156,1542456153506372")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean),
);
const META_FR_FORM_IDS = new Set(
  (setting("META_FR_FORM_IDS") || "1542456153506372")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean),
);

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

async function metaLeadSubmissionUuid(leadId: string) {
  const digest = new Uint8Array(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`spaplus-ontario:${leadId}`)),
  );
  digest[6] = (digest[6] & 0x0f) | 0x40;
  digest[8] = (digest[8] & 0x3f) | 0x80;
  const hex = Array.from(digest.slice(0, 16), (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

function inferLocale(fields: Map<string, string>, formName: string, formId: string) {
  if (META_FR_FORM_IDS.has(formId)) return "fr-CA";
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

async function sendLeadEmails({
  leadId,
  data,
}: {
  leadId: string;
  data: MarketLeadEmailData;
}) {
  const apiKey = setting("RESEND_API_KEY");
  const ownerEmails = (
    setting("ONTARIO_CONTACT_TO_EMAILS") ||
    setting("CONTACT_TO_EMAILS") ||
    setting("CONTACT_TO_EMAIL") ||
    "adir@spaplus.co.il,galia@spaplus.ca"
  )
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
  if (ownerEmails.length === 0) {
    throw new Error("Ontario lead email service is not configured");
  }

  if (!apiKey) {
    const privateOrigin = setting("PRIVATE_BACKEND_ORIGIN");
    const bypassToken = setting("SITES_BYPASS_TOKEN");
    const relaySecret = setting("META_RELAY_SECRET");
    if (!privateOrigin || !bypassToken || relaySecret.length < 32) {
      throw new Error("Ontario lead email relay is not configured");
    }
    const relayUrl = new URL("/api/market-spa-leads", privateOrigin);
    const website = /^https?:\/\/\S+$/i.test(data.website) ? data.website : "";
    const relayResponse = await fetch(relayUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://app.spaplus.co",
        [atob("T0FJLVNpdGVzLUF1dGhvcml6YXRpb24=")]: `Bearer ${bypassToken}`,
        "x-spaplus-meta-relay": relaySecret,
      },
      body: JSON.stringify({
        submissionId: await metaLeadSubmissionUuid(leadId),
        market: "ontario",
        name: data.name,
        role: data.role || "Spa representative",
        email: data.email,
        phone: data.phone,
        organization: data.organization || "Ontario spa",
        website,
        city: data.city || "Ontario",
        postalCode: data.postalCode,
        spaType: data.spaType || "Established spa, hotel spa, resort spa or wellness destination",
        locations: data.locations || "Not provided",
        services: data.services.length > 0 ? data.services : ["Spa services"],
        bookingSystem: data.bookingSystem,
        preferredContact: data.preferredContact || "Email",
        message: [
          data.message,
          data.campaign.form_id && `Meta form ID: ${data.campaign.form_id}`,
          data.campaign.ad_id && `Meta ad ID: ${data.campaign.ad_id}`,
          data.campaign.adset_id && `Meta ad set ID: ${data.campaign.adset_id}`,
          data.campaign.campaign_id && `Meta campaign ID: ${data.campaign.campaign_id}`,
        ].filter(Boolean).join("\n"),
        area: "",
        locale: data.locale,
        source: "Meta paid lead form | Ontario",
        campaign: {
          utm_source: "meta",
          utm_medium: "paid_lead_form",
          utm_campaign: data.campaign.campaign_name || data.campaign.campaign_id || "ontario_meta_leads",
          utm_content: data.campaign.ad_name || data.campaign.ad_id || "instant_form",
          utm_term: data.campaign.form_name || data.campaign.form_id || "ontario_spa_form",
        },
        privacyAccepted: true,
        acknowledgementAccepted: true,
        honey: "",
      }),
    });
    const relayResult = (await relayResponse.json().catch(() => ({}))) as {
      success?: boolean;
      deliveryIds?: string[];
      error?: string;
    };
    if (!relayResponse.ok || !relayResult.success || relayResult.deliveryIds?.length !== 2) {
      throw new Error(
        `Ontario lead email relay failed (${relayResponse.status}): ${relayResult.error || "No provider message"}`,
      );
    }
    return relayResult.deliveryIds;
  }

  const pageUrl = data.locale.toLowerCase().startsWith("fr")
    ? "https://app.spaplus.co/fr-ca/ontario/"
    : "https://app.spaplus.co/en-ca/ontario/";
  const context = {
    marketName: "Ontario",
    pageUrl,
    reviewWindowHours: 72,
    languageTag: data.locale,
    copy: { emailCompanyName: "GLOBAL SPA MANAGEMENT LTD" },
  };
  const owner = buildMarketOwnerEmail(data, context);
  const visitor = buildMarketVisitorEmail(data, context);
  const from = setting("CONTACT_FROM_EMAIL") || "SpaPlus <hello@mail.spaplus.co>";
  const response = await fetch("https://api.resend.com/emails/batch", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `spaplus-meta-ontario-${leadId}`,
      "User-Agent": "SpaPlus-Meta-Ontario-Leads/1.0",
    },
    body: JSON.stringify([
      {
        from,
        to: ownerEmails,
        reply_to: data.email,
        subject: owner.subject,
        html: owner.html,
        text: owner.text,
        tags: [
          { name: "email_type", value: "ontario_meta_spa_owner" },
          { name: "market", value: "ontario" },
        ],
      },
      {
        from,
        to: [data.email],
        reply_to: ownerEmails[0],
        subject: visitor.subject,
        html: visitor.html,
        text: visitor.text,
        tags: [
          { name: "email_type", value: "ontario_meta_spa_confirmation" },
          { name: "market", value: "ontario" },
        ],
      },
    ]),
  });
  const result = (await response.json()) as {
    data?: Array<{ id: string }>;
    message?: string;
  };
  if (!response.ok || !Array.isArray(result.data) || result.data.length !== 2) {
    throw new Error(
      `Ontario Meta lead email delivery failed (${response.status}): ${result.message || "No provider message"}`,
    );
  }
  return result.data.map((item) => item.id);
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
  const isDuplicate = Boolean(existing);

  const locale = inferLocale(fields, formName, formId);
  const organization = firstField(fields, ["company_name", "spa_name", "business_name"]);
  const city = firstField(fields, ["city", "location", "business_location"]);
  const role = firstField(fields, ["job_title", "role"]);
  const spaType = firstField(fields, ["spa_type", "type_of_spa"]);
  const website = firstField(fields, ["website", "website_or_social", "social_profile"]);
  const platform = clean(lead.platform) || "Facebook and Instagram";
  const createdAt = normalizeCreatedAt(lead.created_time || webhookValue.created_time);
  const emailData: MarketLeadEmailData = {
    name,
    role,
    email: email.toLowerCase(),
    phone,
    organization,
    website,
    city,
    region: "Ontario",
    postalCode: "",
    spaType: spaType || "Ontario spa partner",
    locations: "Not provided",
    services: [],
    bookingSystem: "",
    preferredContact: email ? "Email" : "Phone",
    message: "Submitted through the SpaPlus Ontario Meta instant form.",
    area: city || "Ontario general",
    locale,
    source: "Meta paid lead form | Ontario",
    campaign: {
      campaign_id: campaignId,
      campaign_name: campaignName,
      adset_id: adsetId,
      adset_name: adsetName,
      ad_id: adId,
      ad_name: adName,
      form_id: formId,
      form_name: formName,
      platform,
    },
    submittedAt: createdAt,
  };

  if (!isDuplicate) {
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
  }
  const deliveryIds = await sendLeadEmails({ leadId, data: emailData });
  console.log("Ontario Meta lead emails accepted", {
    leadId,
    recipientCount: 2,
    deliveryIds,
  });
  return isDuplicate ? ("duplicate" as const) : ("inserted" as const);
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
  let body: MetaWebhookBody;
  try {
    body = JSON.parse(rawBody) as MetaWebhookBody;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

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

  const hasValidSignature = await validMetaSignature(request, rawBody);
  const hasAllowedLeadContext =
    values.length > 0 &&
    values.every(
      (value) => clean(value.page_id) === META_PAGE_ID && META_FORM_IDS.has(clean(value.form_id)),
    );
  if (!hasValidSignature && !hasAllowedLeadContext) {
    return Response.json({ error: "Invalid Meta webhook" }, { status: 401 });
  }

  const processing = processLeadValues(values).catch((error: unknown) => {
    console.error("Meta lead webhook processing failed", {
      message: error instanceof Error ? error.message : "Unknown error",
      leadCount: values.length,
    });
  });
  try {
    getRequestExecutionContext()?.waitUntil(processing);
  } catch (error: unknown) {
    console.error("Meta lead webhook background registration failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }

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

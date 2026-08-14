import { and, eq } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { getDb } from "../../../../db";
import { formSubmissions } from "../../../../db/schema";
import {
  buildMarketOwnerEmail,
  buildMarketVisitorEmail,
  type MarketLeadEmailData,
} from "../../../market-email-templates";
import { quebecCopyOverrides } from "../../../market-launch/markets";
import { getAuthorizedAdmin } from "../../../admin-auth";
import { hasPermission } from "../../../cms-access";

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

type MetaMarketContext = {
  slug: "ontario" | "quebec";
  name: "Ontario" | "Québec";
  resourceKey: "market:ca:on" | "market:ca:qc";
  pageUrl: string;
  timeZone: "America/Toronto" | "America/Montreal";
};

const ONTARIO_MARKET: MetaMarketContext = {
  slug: "ontario",
  name: "Ontario",
  resourceKey: "market:ca:on",
  pageUrl: "https://app.spaplus.co/en-ca/ontario/",
  timeZone: "America/Toronto",
};

const QUEBEC_MARKET: MetaMarketContext = {
  slug: "quebec",
  name: "Québec",
  resourceKey: "market:ca:qc",
  pageUrl: "https://app.spaplus.co/en-ca/quebec/",
  timeZone: "America/Montreal",
};
const runtimeEnv = env as unknown as Record<string, string | undefined>;
const setting = (name: string) => runtimeEnv[name] || process.env[name] || "";
const GRAPH_VERSION = setting("META_GRAPH_VERSION") || "v26.0";
const META_PAGE_ID = "1065026380020011";

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

function normalizeFieldName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function normalizedField(fields: Map<string, string>, names: string[]) {
  const normalizedNames = names.map(normalizeFieldName);
  for (const [key, value] of fields) {
    const normalizedKey = normalizeFieldName(key);
    if (normalizedNames.some((name) => normalizedKey === name || normalizedKey.includes(name))) {
      return value;
    }
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

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value);
}

function marketTime(value: string, timeZone: MetaMarketContext["timeZone"]) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    timeZone,
    timeZoneName: "short",
  }).format(new Date(value));
}

function inferMarket(formName: string, campaignName: string): MetaMarketContext {
  const signal = `${formName} ${campaignName}`.toLowerCase();
  return signal.includes("quebec") || signal.includes("québec")
    ? QUEBEC_MARKET
    : ONTARIO_MARKET;
}

async function sendMarketOwnerNotification(
  data: MarketLeadEmailData,
  leadId: string,
  market: MetaMarketContext,
  sendVisitorEmail = true,
) {
  const cloudflareEmailToken = setting("CLOUDFLARE_EMAIL_API_TOKEN");
  const cloudflareEmailAccountId = setting("CLOUDFLARE_EMAIL_ACCOUNT_ID");
  const ownerEmails = (
    setting(`META_${market.slug.toUpperCase()}_CONTACT_TO_EMAILS`) ||
    setting(`${market.slug.toUpperCase()}_CONTACT_TO_EMAILS`) ||
    "adir@spaplus.co.il,galia@spaplus.ca"
  )
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(isEmail);
  if (!cloudflareEmailToken || !cloudflareEmailAccountId) {
    throw new Error(`${market.name} Cloudflare email is not configured`);
  }
  if (ownerEmails.length === 0) {
    throw new Error(`${market.name} Meta lead recipients are not configured`);
  }

  const pageUrl = data.locale.toLowerCase().startsWith("fr")
    ? market.pageUrl.replace("/en-ca/", "/fr-ca/")
    : market.pageUrl;
  const leadLanguage = data.locale.toLowerCase().startsWith("fr") ? "fr" : "en";
  const marketCopy: Record<string, string> = { emailCompanyName: "GLOBAL SPA MANAGEMENT LTD" };
  if (market.slug === "quebec") {
    for (const key of [
      "emailOwnerSubject",
      "emailOwnerEyebrow",
      "emailOwnerIntro",
    ]) {
      marketCopy[key] = quebecCopyOverrides[key].en;
    }
    for (const key of [
      "emailOwnerReplySubject",
      "emailOwnerReplyBody",
      "emailVisitorSubject",
      "emailVisitorEyebrow",
      "emailVisitorIntro",
      "emailVisitorButton",
    ]) {
      marketCopy[key] = quebecCopyOverrides[key][leadLanguage];
    }
  }
  const ownerContext = {
    marketName: market.name,
    pageUrl,
    reviewWindowHours: 72,
    languageTag: "en-CA",
    copy: marketCopy,
  };
  const visitorContext = { ...ownerContext, languageTag: data.locale };
  const owner = buildMarketOwnerEmail(data, ownerContext);
  const visitor = buildMarketVisitorEmail(data, visitorContext);

  const sendEmail = async (input: {
    to: string[];
    replyTo?: string;
    subject: string;
    html: string;
    text: string;
    idempotencyKey: string;
  }) => {
    const cloudflareFrom =
      setting("CLOUDFLARE_EMAIL_FROM") ||
      "SpaPlus Canada <hello@mailca.spaplus.co>";
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${cloudflareEmailAccountId}/email/sending/send`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cloudflareEmailToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: cloudflareFrom,
          to: input.to,
          reply_to: input.replyTo,
          subject: input.subject,
          html: input.html,
          text: input.text,
          headers: {
            "X-Entity-Ref-ID": input.idempotencyKey,
          },
        }),
      },
    );
    const result = (await response.json()) as {
      success?: boolean;
      errors?: Array<{ message?: string }>;
      result?: {
        delivered?: string[];
        queued?: string[];
        permanent_bounces?: string[];
        message_id?: string;
      };
    };
    const permanentBounces = result.result?.permanent_bounces || [];
    if (!response.ok || !result.success || permanentBounces.length > 0) {
      const providerMessage =
        result.errors?.map((error) => error.message).filter(Boolean).join("; ") ||
        (permanentBounces.length > 0
          ? `Permanent bounce: ${permanentBounces.join(", ")}`
          : "No provider message");
      throw new Error(
        `${market.name} Cloudflare email failed (${response.status}): ${providerMessage}`,
      );
    }
    return `cloudflare:${result.result?.message_id || input.idempotencyKey}`;
  };

  const ownerDeliveryId = await sendEmail({
    to: ownerEmails,
    replyTo: data.email || undefined,
    subject: owner.subject,
    html: owner.html,
    text: owner.text,
    idempotencyKey: `spaplus-${market.slug}-meta-owner-${leadId}`,
  });

  const deliveryIds = [ownerDeliveryId];
  if (sendVisitorEmail && isEmail(data.email)) {
    deliveryIds.push(
      await sendEmail({
        to: [data.email],
        replyTo: ownerEmails[0],
        subject: visitor.subject,
        html: visitor.html,
        text: visitor.text,
        idempotencyKey: `spaplus-meta-${market.slug}-${leadId}`,
      }),
    );
  }
  console.log(`${market.name} Meta lead email accepted`, {
    deliveryIds,
    recipientCount: ownerEmails.length,
  });
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
  const pageToken = setting("META_PAGE_ACCESS_TOKEN")
    .replace(/^\uFEFF/, "")
    .trim()
    .replace(/^["']|["']$/g, "");
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

const objectNameCache = new Map<string, string>();

async function fetchName(objectId: string | undefined) {
  const pageToken = setting("META_PAGE_ACCESS_TOKEN")
    .replace(/^\uFEFF/, "")
    .trim()
    .replace(/^["']|["']$/g, "");
  if (!objectId || !pageToken) return "";
  if (objectNameCache.has(objectId)) return objectNameCache.get(objectId) || "";
  const url = new URL(`https://graph.facebook.com/${GRAPH_VERSION}/${encodeURIComponent(objectId)}`);
  url.searchParams.set("fields", "name");
  url.searchParams.set("access_token", pageToken);
  const response = await fetch(url, { headers: { accept: "application/json" } });
  if (!response.ok) return "";
  const body = (await response.json()) as { name?: string };
  const name = clean(body.name);
  objectNameCache.set(objectId, name);
  return name;
}

type StoreLeadOptions = {
  dedupeByContact?: boolean;
  market?: MetaMarketContext;
  sendVisitorEmail?: boolean;
};

async function storeLead(
  lead: MetaLead,
  webhookValue: MetaLeadgenValue,
  options: StoreLeadOptions = {},
) {
  const leadId = clean(lead.id || webhookValue.leadgen_id);
  if (!leadId) return "skipped" as const;

  const fields = fieldMap(lead.field_data);
  const formId = clean(lead.form_id || webhookValue.form_id);
  const adId = clean(lead.ad_id || webhookValue.ad_id);
  const adsetId = clean(lead.adset_id || webhookValue.adgroup_id);
  const campaignId = clean(lead.campaign_id);
  const name =
    firstField(fields, ["full_name", "name", "first_name"]) ||
    normalizedField(fields, ["nom_complet", "nom"]);
  const email =
    firstField(fields, ["email", "work_email"]) ||
    normalizedField(fields, ["e_mail", "courriel", "adresse_e_mail", "adresse_courriel"]);
  const phone =
    firstField(fields, ["phone_number", "phone"]) ||
    normalizedField(fields, ["numero_de_telephone", "telephone"]);
  if (!name || (!email && !phone)) return "skipped" as const;

  const [formName, adName, adsetName, campaignName] = await Promise.all([
    fetchName(formId),
    fetchName(adId),
    fetchName(adsetId),
    fetchName(campaignId),
  ]);
  const market = options.market || inferMarket(formName, campaignName);
  const submissionId = `meta-${market.slug}:${leadId}`;
  const db = getDb();
  const [existing] = await db
    .select({ id: formSubmissions.id })
    .from(formSubmissions)
    .where(eq(formSubmissions.submissionId, submissionId))
    .limit(1);
  if (existing) return "duplicate" as const;
  if (options.dedupeByContact) {
    if (email) {
      const [existingEmail] = await db
        .select({ id: formSubmissions.id })
        .from(formSubmissions)
        .where(
          and(
            eq(formSubmissions.resourceKey, market.resourceKey),
            eq(formSubmissions.email, email.toLowerCase()),
          ),
        )
        .limit(1);
      if (existingEmail) return "duplicate" as const;
    }
    if (phone) {
      const [existingPhone] = await db
        .select({ id: formSubmissions.id })
        .from(formSubmissions)
        .where(
          and(
            eq(formSubmissions.resourceKey, market.resourceKey),
            eq(formSubmissions.phone, phone),
          ),
        )
        .limit(1);
      if (existingPhone) return "duplicate" as const;
    }
  }
  const locale = inferLocale(fields, formName);
  const organization =
    firstField(fields, ["company_name", "spa_name", "business_name"]) ||
    normalizedField(fields, [
      "name_of_your_spa_or_business",
      "spa_or_business_name",
      "nom_de_votre_spa_ou_entreprise",
      "nom_de_l_entreprise",
    ]);
  const city =
    firstField(fields, ["city", "location", "business_location", "ville"]) ||
    normalizedField(fields, [
      "your_city_or_region",
      "city_or_region",
      "votre_ville_ou_region",
    ]);
  const role = firstField(fields, ["job_title", "role"]);
  const spaType = firstField(fields, ["spa_type", "type_of_spa"]);
  const platform = clean(lead.platform) || "Facebook and Instagram";
  const createdAt = normalizeCreatedAt(lead.created_time || webhookValue.created_time);
  const website =
    firstField(fields, [
      "website",
      "website_url",
      "website_or_social_profile",
      "social_profile",
      "site_web",
    ]) ||
    normalizedField(fields, [
      "website_or_social_media_page",
      "site_web_ou_page_de_reseau_social",
    ]);
  const postalCode = firstField(fields, ["postal_code", "postcode", "zip_code"]);
  const locations = firstField(fields, ["locations", "number_of_locations"]);
  const services = firstField(fields, ["services", "spa_services"])
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const preferredContact = firstField(fields, ["preferred_contact", "contact_method"]);
  const bookingSystem = firstField(fields, ["booking_system", "reservation_system"]);
  const additionalMessage = firstField(fields, ["message", "comments", "tell_us_more"]);

  const message = [
      "Company group: SpaPlus",
      "Brand: SpaPlus Canada",
      `Lead purpose: ${market.name} spa partner registration`,
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
    .join("\n");

  await db.insert(formSubmissions).values({
    submissionId,
    formType: `${market.slug}-meta-instant-form`,
    name,
    email: email.toLowerCase(),
    phone,
    organization,
    topic: spaType || `${market.name} spa partner`,
    message,
    locale,
    source: `Meta paid lead form | ${market.name}`,
    resourceKey: market.resourceKey,
    status: "new",
    createdAt,
  });

  const notificationData: MarketLeadEmailData = {
    name,
    role,
    email,
    phone,
    organization,
    website,
    city,
    region: "",
    postalCode,
    spaType,
    locations,
    services,
    bookingSystem,
    preferredContact,
    message: additionalMessage,
    area: city || `${market.name} general`,
    locale,
    source: `Meta paid lead form | ${platform}`,
    campaign: {
      ...(campaignName ? { campaign_name: campaignName } : {}),
      ...(campaignId ? { campaign_id: campaignId } : {}),
      ...(adsetName ? { ad_set_name: adsetName } : {}),
      ...(adsetId ? { ad_set_id: adsetId } : {}),
      ...(adName ? { ad_name: adName } : {}),
      ...(adId ? { ad_id: adId } : {}),
      form_id: formId,
      lead_id: leadId,
    },
    submittedAt: `${marketTime(createdAt, market.timeZone)} (${market.name} time)`,
  };
  await sendMarketOwnerNotification(
    notificationData,
    leadId,
    market,
    options.sendVisitorEmail !== false,
  );
  return "inserted" as const;
}

const RECOVERY_CAMPAIGNS: Record<string, MetaMarketContext> = {
  "120248551862410499": ONTARIO_MARKET,
  "120248856435100499": QUEBEC_MARKET,
};

async function recoverMetaCampaign(campaignId: string) {
  const market = RECOVERY_CAMPAIGNS[campaignId];
  if (!market) throw new Error("Campaign is not approved for recovery");
  const pageToken = setting("META_PAGE_ACCESS_TOKEN")
    .replace(/^\uFEFF/, "")
    .trim()
    .replace(/^["']|["']$/g, "");
  if (!pageToken) throw new Error("META_PAGE_ACCESS_TOKEN is not configured");

  const formsUrl = new URL(
    `https://graph.facebook.com/${GRAPH_VERSION}/${META_PAGE_ID}/leadgen_forms`,
  );
  formsUrl.searchParams.set("fields", "id,name,status");
  formsUrl.searchParams.set("limit", "100");
  formsUrl.searchParams.set("access_token", pageToken);
  const formsResponse = await fetch(formsUrl, { headers: { accept: "application/json" } });
  if (!formsResponse.ok) {
    throw new Error(`Meta form retrieval failed (${formsResponse.status})`);
  }
  const formsBody = (await formsResponse.json()) as {
    data?: Array<{ id?: string }>;
  };

  const seenLeadIds = new Set<string>();
  const leads: MetaLead[] = [];
  for (const form of formsBody.data || []) {
    if (!form.id) continue;
    let nextUrl: URL | null = new URL(
      `https://graph.facebook.com/${GRAPH_VERSION}/${encodeURIComponent(form.id)}/leads`,
    );
    nextUrl.searchParams.set(
      "fields",
      "id,created_time,field_data,form_id,ad_id,adset_id,campaign_id,platform",
    );
    nextUrl.searchParams.set("limit", "100");
    nextUrl.searchParams.set("access_token", pageToken);
    while (nextUrl) {
      const response = await fetch(nextUrl, { headers: { accept: "application/json" } });
      if (!response.ok) {
        throw new Error(`Meta lead recovery failed (${response.status})`);
      }
      const body = (await response.json()) as {
        data?: MetaLead[];
        paging?: { next?: string };
      };
      for (const lead of body.data || []) {
        const leadId = clean(lead.id);
        if (
          clean(lead.campaign_id) === campaignId &&
          leadId &&
          !seenLeadIds.has(leadId)
        ) {
          seenLeadIds.add(leadId);
          leads.push(lead);
        }
      }
      nextUrl = body.paging?.next ? new URL(body.paging.next) : null;
    }
  }

  let inserted = 0;
  let duplicates = 0;
  let skipped = 0;
  for (const lead of leads) {
    const outcome = await storeLead(
      lead,
      { leadgen_id: lead.id, form_id: lead.form_id, ad_id: lead.ad_id },
      { dedupeByContact: true, market, sendVisitorEmail: false },
    );
    if (outcome === "inserted") inserted += 1;
    else if (outcome === "duplicate") duplicates += 1;
    else skipped += 1;
  }
  return { campaignId, market: market.slug, found: leads.length, inserted, duplicates, skipped };
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
  const requestUrl = new URL(request.url);
  const recoveryCampaignId = requestUrl.searchParams.get("recover_campaign") || "";
  if (recoveryCampaignId) {
    const market = RECOVERY_CAMPAIGNS[recoveryCampaignId];
    const recoveryToken = setting("META_RECOVERY_TOKEN");
    const providedRecoveryToken = request.headers.get("x-spaplus-recovery-token") || "";
    const trustedRecovery =
      recoveryToken.length >= 32 && constantTimeEqual(providedRecoveryToken, recoveryToken);
    const admin = trustedRecovery ? null : await getAuthorizedAdmin();
    if (!trustedRecovery && !admin) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (
      !market ||
      (!trustedRecovery &&
        admin &&
        !hasPermission(admin.role, admin.permissions, market.resourceKey, "manageLeads"))
    ) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
    try {
      return Response.json({ success: true, ...(await recoverMetaCampaign(recoveryCampaignId)) });
    } catch (error: unknown) {
      console.error("Meta campaign recovery failed", {
        campaignId: recoveryCampaignId,
        message: error instanceof Error ? error.message : "Unknown error",
      });
      return Response.json({ error: "Meta campaign recovery failed" }, { status: 503 });
    }
  }
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
    .flatMap((entry) =>
      (entry.changes || []).map((change) => ({
        ...change,
        value: {
          ...change.value,
          page_id: change.value?.page_id || entry.id,
        },
      })),
    )
    .filter((change) => change.field === "leadgen")
    .map((change) => change.value || {});
  if (values.length > 100) {
    return Response.json({ error: "Invalid batch" }, { status: 400 });
  }

  const hasValidSignature = await validMetaSignature(request, rawBody);
  const hasAllowedLeadContext =
    values.length > 0 && values.every((value) => clean(value.page_id) === META_PAGE_ID);
  if (!hasValidSignature || !hasAllowedLeadContext) {
    return Response.json({ error: "Invalid Meta webhook" }, { status: 401 });
  }

  try {
    const result = await processLeadValues(values);
    return Response.json({ success: true, accepted: values.length, ...result });
  } catch (error: unknown) {
    console.error("Meta lead webhook processing failed", {
      message: error instanceof Error ? error.message : "Unknown error",
      leadCount: values.length,
    });
    return Response.json({ error: "Meta lead processing failed" }, { status: 503 });
  }
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
  return { inserted, duplicates, skipped };
}

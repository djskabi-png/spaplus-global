import { getDb } from "../../../../db";
import { formSubmissions } from "../../../../db/schema";
import {
  buildViiVacationOwnerEmail,
  buildViiVacationVisitorEmail,
  type ViiVacationJoinEmailData,
} from "../../../vii-lead-email-templates";

const allowedOrigins = new Set([
  "https://www.vii.co.il",
  "https://vii.co.il",
  "https://vii.spaplus.co",
  "https://djskabi-png.github.io",
  "https://vii-vacation-calendar.adir-naor-7510.chatgpt.site",
]);

const worlds = {
  vacation: "נופש ומקומות אירוח",
  events: "מתחמי אירועים",
  spa: "ספא וטיפולים",
  hourly: "חדרים לפי שעה",
  providers: "ספקים ונותני שירות",
  activities: "אטרקציות ומה עושים בסביבה",
  accessibility: "נגישות",
  general: "פנייה כללית",
} as const;

const purposes = {
  join: "join",
  contact: "contact",
  booking: "booking",
  accessibility: "accessibility",
  whatsapp_enquiry: "whatsapp-enquiry",
} as const;

type World = keyof typeof worlds;
type LeadPurpose = keyof typeof purposes;

const corsHeaders = (origin: string | null) => ({
  "Access-Control-Allow-Origin":
    origin && allowedOrigins.has(origin) ? origin : "https://vii.spaplus.co",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-VII-Leads-Secret",
  "Access-Control-Max-Age": "86400",
  Vary: "Origin",
});

const sanitize = (value: unknown, maxLength = 500) =>
  String(value ?? "").replace(/[<>]/g, "").trim().slice(0, maxLength);

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value);
const isSubmissionId = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const asWorld = (value: unknown): World => {
  const key = sanitize(value, 40) as World;
  return key in worlds ? key : "general";
};

const asPurpose = (value: unknown): LeadPurpose => {
  const key = sanitize(value, 40) as LeadPurpose;
  return key in purposes ? key : "contact";
};

const isTrustedServer = (request: Request) => {
  const expected = process.env.VII_LEADS_SECRET?.trim();
  const supplied = request.headers.get("x-vii-leads-secret")?.trim();
  return Boolean(expected && expected.length >= 32 && supplied === expected);
};

const isDevelopmentOrigin = (origin: string | null) =>
  process.env.NODE_ENV !== "production" &&
  Boolean(origin && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin));

const parseRecipients = (value: string | undefined) =>
  (value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

async function sendVacationJoinEmails(
  data: ViiVacationJoinEmailData,
  submissionId: string,
) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured");

  const recipients = parseRecipients(process.env.VII_JOIN_TO_EMAILS);
  if (recipients.length === 0 || recipients.some((recipient) => !isEmail(recipient))) {
    throw new Error("VII_JOIN_TO_EMAILS is not configured with valid recipients");
  }
  const from =
    process.env.VII_FROM_EMAIL?.trim() ||
    "VII | וי פור ויקיישן <hello@mail.spaplus.co>";
  const ownerEmail = buildViiVacationOwnerEmail(data);
  const visitorEmail = buildViiVacationVisitorEmail(data);

  const response = await fetch("https://api.resend.com/emails/batch", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `vii-vacation-join-${submissionId}`,
    },
    body: JSON.stringify([
      {
        from,
        to: recipients,
        reply_to: data.email,
        subject: ownerEmail.subject,
        html: ownerEmail.html,
        text: ownerEmail.text,
      },
      {
        from,
        to: [data.email],
        reply_to: recipients[0],
        subject: visitorEmail.subject,
        html: visitorEmail.html,
        text: visitorEmail.text,
      },
    ]),
  });

  if (!response.ok) {
    throw new Error(`Resend batch failed with status ${response.status}`);
  }
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin");
  return new Response(null, { status: 204, headers: corsHeaders(origin) });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const headers = corsHeaders(origin);

  if (!isTrustedServer(request) && !isDevelopmentOrigin(origin)) {
    return Response.json(
      { success: false, error: "Forbidden" },
      { status: 403, headers },
    );
  }

  const contentLength = Number(request.headers.get("content-length") || "0");
  if (contentLength > 24_000) {
    return Response.json(
      { success: false, error: "Request too large" },
      { status: 413, headers },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json(
      { success: false, error: "Invalid JSON" },
      { status: 400, headers },
    );
  }

  const submissionId = sanitize(body.submissionId, 120);
  const name = sanitize(body.name, 140);
  const phone = sanitize(body.phone, 40);
  const email = sanitize(body.email, 180).toLowerCase();
  const organization = sanitize(body.organization ?? body.businessName, 180);
  const location = sanitize(body.location, 180);
  const website = sanitize(body.website ?? body.businessWebsite ?? body.websiteUrl, 600);
  const message = sanitize(body.message, 3000);
  const selectedWorld = asWorld(body.selectedWorld ?? body.world);
  const acceptedPurpose = asPurpose(body.purpose);
  const isVacationJoin = acceptedPurpose === "join" && selectedWorld === "vacation";

  if (
    !isSubmissionId(submissionId) ||
    body.privacyAccepted !== true ||
    name.length < 2 ||
    phone.replace(/[^0-9]/g, "").length < 7 ||
    (email && !isEmail(email)) ||
    (acceptedPurpose === "join" && organization.length < 2) ||
    message.length < 5
  ) {
    return Response.json(
      { success: false, error: "Invalid form data" },
      { status: 400, headers },
    );
  }

  if (isVacationJoin && !isEmail(email)) {
    return Response.json(
      { success: false, error: "A valid customer email is required" },
      { status: 400, headers },
    );
  }

  const sourceSite = sanitize(body.sourceSite, 120) || "vii.co.il";
  const sourceHost = sanitize(body.sourceHost, 120) || "vii.spaplus.co";
  const sourceBrand = sanitize(body.sourceBrand, 80) || "VII";
  const sourcePage = sanitize(body.sourcePage, 600);
  const sourceChannel = sanitize(body.sourceChannel, 80) || "website";
  const locale = sanitize(body.locale, 12) || "he";
  const requestedPackage = sanitize(body.package, 180);
  const billingCycle = sanitize(body.billingCycle ?? body.billingPreference, 120);
  const utmSource = sanitize(body.utmSource, 120);
  const utmMedium = sanitize(body.utmMedium, 120);
  const utmCampaign = sanitize(body.utmCampaign, 180);
  const source = sanitize(body.source, 160) || "vii-site";

  const lines = [
    "Company group: Vila4U Group",
    `Brand: ${sourceBrand}`,
    "Website: VII",
    `Source host: ${sourceHost}`,
    `Source channel: ${sourceChannel}`,
    `Lead source: ${sourceSite}`,
    `Purpose: ${purposes[acceptedPurpose]}`,
    `World: ${selectedWorld} | ${worlds[selectedWorld]}`,
    organization && `Business: ${organization}`,
    location && `Location: ${location}`,
    website && `Website or social profile: ${website}`,
    requestedPackage && `Package: ${requestedPackage}`,
    billingCycle && `Billing cycle: ${billingCycle}`,
    sourcePage && `Source page: ${sourcePage}`,
    utmSource && `UTM source: ${utmSource}`,
    utmMedium && `UTM medium: ${utmMedium}`,
    utmCampaign && `UTM campaign: ${utmCampaign}`,
    message && `Message: ${message}`,
  ].filter(Boolean);

  try {
    const db = getDb();
    const result = await db
      .insert(formSubmissions)
      .values({
        submissionId: `vii:${submissionId}`,
        formType: `vii-site-${purposes[acceptedPurpose]}`,
        name,
        phone,
        email,
        organization: organization || name,
        topic: worlds[selectedWorld],
        message: lines.join("\n"),
        locale,
        source,
        resourceKey: "business:vila4u:leads",
        status: "new",
        createdAt: new Date().toISOString(),
      })
      .onConflictDoNothing({ target: formSubmissions.submissionId })
      .returning({ id: formSubmissions.id });

    const reference = `VII-${submissionId.slice(0, 8).toUpperCase()}`;
    if (isVacationJoin) {
      await sendVacationJoinEmails(
        {
          name,
          phone,
          email,
          organization,
          location,
          website,
          packageLabel: requestedPackage,
          billingCycle,
          message,
          sourcePage,
          submittedAt: new Intl.DateTimeFormat("he-IL", {
            dateStyle: "long",
            timeStyle: "short",
            timeZone: "Asia/Jerusalem",
          }).format(new Date()),
          reference,
        },
        submissionId,
      );
    }

    return Response.json(
      {
        success: true,
        duplicate: result.length === 0,
        emailDelivered: isVacationJoin,
        reference,
      },
      { headers },
    );
  } catch (error) {
    console.error("VII lead processing failed", error);
    return Response.json(
      { success: false, error: "Unable to process the lead" },
      { status: 503, headers },
    );
  }
}

import { getDb } from "../../../../db";
import { formSubmissions } from "../../../../db/schema";

const allowedOrigins = new Set([
  "https://www.vii.co.il",
  "https://vii.co.il",
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
  general: "פנייה כללית",
} as const;

type World = keyof typeof worlds;
type LeadPurpose = "join" | "contact";

const corsHeaders = (origin: string | null) => ({
  "Access-Control-Allow-Origin":
    origin && (allowedOrigins.has(origin) || (process.env.NODE_ENV === "development" && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))) ? origin : "https://www.vii.co.il",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
  Vary: "Origin",
});

const clean = (value: unknown, max: number) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, max);

const cleanMultiline = (value: unknown, max: number) =>
  String(value || "")
    .trim()
    .replace(/\r\n/g, "\n")
    .slice(0, max);

const isEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value);

const isSubmissionId = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );

export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(request.headers.get("origin")),
  });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const developmentOrigin = process.env.NODE_ENV === "development" &&
    Boolean(origin && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin));
  const headers = {
    ...corsHeaders(origin),
    "Content-Type": "application/json; charset=utf-8",
  };

  if (
    (origin && !allowedOrigins.has(origin) && !developmentOrigin) ||
    (!origin && process.env.NODE_ENV !== "development")
  ) {
    return Response.json(
      { success: false, error: "Origin not allowed" },
      { status: 403, headers },
    );
  }

  try {
    const contentLength = Number(request.headers.get("content-length") || "0");
    if (contentLength > 24_000) {
      return Response.json(
        { success: false, error: "Request too large" },
        { status: 413, headers },
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    if (clean(body.honey, 200)) {
      return Response.json({ success: true }, { headers });
    }

    const submissionId = clean(body.submissionId, 80);
    const purpose = clean(body.purpose, 20) as LeadPurpose;
    const world = clean(body.world, 30) as World;
    const name = clean(body.name, 100);
    const phone = clean(body.phone, 40);
    const email = clean(body.email, 180).toLowerCase();
    const organization = clean(body.organization, 160);
    const location = clean(body.location, 160);
    const website = clean(body.website, 300);
    const message = cleanMultiline(body.message, 3000);
    const sourcePage = clean(body.sourcePage, 700);
    const privacyAccepted = body.privacyAccepted === true;
    const acceptedWorld = Object.hasOwn(worlds, world) ? world : "general";
    const acceptedPurpose: LeadPurpose = purpose === "contact" ? "contact" : "join";

    if (
      !isSubmissionId(submissionId) ||
      !privacyAccepted ||
      name.length < 2 ||
      phone.replace(/\D/g, "").length < 7 ||
      (email && !isEmail(email)) ||
      (acceptedPurpose === "join" && organization.length < 2) ||
      message.length < 5
    ) {
      return Response.json(
        { success: false, error: "Invalid form data" },
        { status: 400, headers },
      );
    }

    const campaignName = acceptedPurpose === "join" ? "site_join" : "site_contact";
    const source = sourcePage || "https://www.vii.co.il";
    const messageSummary = [
      "Company group: Vila4U Group",
      "Brand: VII",
      `Source channel: VII website`,
      `Lead purpose: ${acceptedPurpose}`,
      `World: ${acceptedWorld}`,
      location && `Location: ${location}`,
      website && `Website or social profile: ${website}`,
      `Campaign: utm_source=vii.co.il, utm_medium=organic, utm_campaign=${campaignName}, utm_content=${acceptedWorld}`,
      `Source page: ${source}`,
      `Message: ${message}`,
    ]
      .filter(Boolean)
      .join("\n");

    const result = await getDb()
      .insert(formSubmissions)
      .values({
        submissionId: `vii:${submissionId}`,
        formType: acceptedPurpose === "join" ? "vii-site-join" : "vii-site-contact",
        name,
        email,
        phone,
        organization: organization || name,
        topic: worlds[acceptedWorld],
        message: messageSummary,
        locale: "he",
        source,
        resourceKey: "business:vila4u:leads",
        status: "new",
        createdAt: new Date().toISOString(),
      })
      .onConflictDoNothing({ target: formSubmissions.submissionId })
      .returning({ id: formSubmissions.id });

    return Response.json(
      {
        success: true,
        duplicate: result.length === 0,
        reference: `VII-${submissionId.slice(0, 8).toUpperCase()}`,
      },
      { headers },
    );
  } catch (error) {
    console.error("VII lead archive failed", error);
    return Response.json(
      { success: false, error: "Unable to save the lead" },
      { status: 503, headers },
    );
  }
}

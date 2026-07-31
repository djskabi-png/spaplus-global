import { getDb } from "../../../db";
import { formSubmissions } from "../../../db/schema";
import {
  buildMarketOwnerEmail,
  buildMarketVisitorEmail,
  type MarketLeadEmailData,
} from "../../market-email-templates";
import { markets, ontarioAreas } from "../../market-launch/markets";

type MarketSlug = keyof typeof markets;

const allowedOrigins = new Set([
  "https://spaplus.co",
  "https://www.spaplus.co",
  "https://app.spaplus.co",
  "https://djskabi-png.github.io",
]);

const corsHeaders = (origin: string | null) => ({
  "Access-Control-Allow-Origin":
    origin && allowedOrigins.has(origin) ? origin : "https://spaplus.co",
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

const campaignKeys = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "fbclid",
]);

export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(request.headers.get("origin")),
  });
}

export async function GET(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return new Response("Not found", { status: 404 });
  }

  const url = new URL(request.url);
  const marketSlug = (url.searchParams.get("market") || "ontario") as MarketSlug;
  const market = markets[marketSlug] || markets.ontario;
  const sample: MarketLeadEmailData = {
    name: "Alex Morgan",
    role: "General Manager",
    email: "alex@example.com",
    phone: "+1 416 555 0182",
    organization: "North Shore Wellness Spa",
    website: "https://example.com",
    city: "Toronto",
    postalCode: "M5V 2T6",
    spaType: "Hotel or resort spa",
    locations: "1",
    services: ["Massage", "Facials and skincare", "Couples experiences"],
    bookingSystem: "Book4Time",
    preferredContact: "Email",
    message: "We are interested in learning more about the Ontario launch.",
    area: url.searchParams.get("area") || "",
    locale: url.searchParams.get("locale") || "en-CA",
    source: "https://spaplus.co/en-ca/ontario/?utm_source=meta",
    campaign: {
      utm_source: "meta",
      utm_medium: "paid-social",
      utm_campaign: "ontario-founding-spas",
    },
    submittedAt: "Jul 31, 2026, 10:30 a.m.",
  };
  const emailContext = {
    marketName: market.marketName,
    pageUrl: sample.locale.toLowerCase().startsWith("fr")
      ? `https://spaplus.co/fr-ca/ontario/${sample.area ? `${sample.area}/` : ""}`
      : `https://spaplus.co/en-ca/ontario/${sample.area ? `${sample.area}/` : ""}`,
    reviewWindowHours: market.reviewWindowHours,
    languageTag: sample.locale,
  };
  const email =
    url.searchParams.get("type") === "owner"
      ? buildMarketOwnerEmail(sample, emailContext)
      : buildMarketVisitorEmail(sample, emailContext);
  return new Response(email.html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const headers = {
    ...corsHeaders(origin),
    "Content-Type": "application/json; charset=utf-8",
  };

  if (
    (origin && !allowedOrigins.has(origin)) ||
    (!origin && process.env.NODE_ENV !== "development")
  ) {
    return Response.json(
      { success: false, error: "Origin not allowed" },
      { status: 403, headers },
    );
  }

  try {
    const contentLength = Number(request.headers.get("content-length") || "0");
    if (contentLength > 32_000) {
      return Response.json(
        { success: false, error: "Request too large" },
        { status: 413, headers },
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    if (clean(body.honey, 200)) {
      return Response.json({ success: true }, { headers });
    }
    const marketSlug = clean(body.market, 80).toLowerCase() as MarketSlug;
    const market = markets[marketSlug];
    if (!market) {
      return Response.json(
        { success: false, error: "Market not supported" },
        { status: 400, headers },
      );
    }

    const submissionId = clean(body.submissionId, 80);
    const services = Array.isArray(body.services)
      ? body.services.map((value) => clean(value, 80)).filter(Boolean).slice(0, 12)
      : [];
    const rawCampaign =
      body.campaign && typeof body.campaign === "object"
        ? (body.campaign as Record<string, unknown>)
        : {};
    const campaign = Object.fromEntries(
      Object.entries(rawCampaign)
        .filter(([key]) => campaignKeys.has(key))
        .map(([key, value]) => [key, clean(value, 180)])
        .filter(([, value]) => value),
    );
    const requestedLocale = clean(body.locale, 20).toLowerCase();
    const acceptedLocale = requestedLocale.startsWith("fr")
      ? "fr-CA"
      : "en-CA";
    const requestedArea = clean(body.area, 100);
    const acceptedArea = ontarioAreas.some(
      (area) => area.slug === requestedArea,
    )
      ? requestedArea
      : "";

    const data: MarketLeadEmailData = {
      name: clean(body.name, 100),
      role: clean(body.role, 100),
      email: clean(body.email, 180).toLowerCase(),
      phone: clean(body.phone, 40),
      organization: clean(body.organization, 160),
      website: clean(body.website, 300),
      city: clean(body.city, 100),
      postalCode: clean(body.postalCode, 12).toUpperCase(),
      spaType: clean(body.spaType, 100),
      locations: clean(body.locations, 40),
      services,
      bookingSystem: clean(body.bookingSystem, 120),
      preferredContact: clean(body.preferredContact, 30),
      message: cleanMultiline(body.message, 1500),
      area: acceptedArea,
      locale: acceptedLocale,
      source: clean(body.source, 700),
      campaign,
      submittedAt: new Intl.DateTimeFormat(acceptedLocale, {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: market.timeZone,
      }).format(new Date()),
    };

    if (
      !isSubmissionId(submissionId) ||
      body.privacyAccepted !== true ||
      body.acknowledgementAccepted !== true ||
      data.name.length < 2 ||
      data.role.length < 2 ||
      !isEmail(data.email) ||
      data.phone.length < 7 ||
      data.organization.length < 2 ||
      !/^https?:\/\/\S+/i.test(data.website) ||
      data.city.length < 2 ||
      data.postalCode.length < 3 ||
      data.spaType.length < 2 ||
      data.locations.length < 1 ||
      data.preferredContact.length < 2 ||
      data.services.length < 1
    ) {
      return Response.json(
        { success: false, error: "Please complete all required fields" },
        { status: 400, headers },
      );
    }

    const messageSummary = [
      `Role: ${data.role}`,
      `Phone: ${data.phone}`,
      `Website: ${data.website}`,
      `Location: ${data.city}, ${market.marketName} ${data.postalCode}`,
      `Campaign area: ${data.area || "Ontario general"}`,
      `Spa type: ${data.spaType}`,
      `Locations: ${data.locations}`,
      `Services: ${data.services.join(", ")}`,
      `Booking system: ${data.bookingSystem || "Not provided"}`,
      `Preferred contact: ${data.preferredContact}`,
      `Message: ${data.message || "No additional message"}`,
      `Campaign: ${
        Object.entries(data.campaign)
          .map(([key, value]) => `${key}=${value}`)
          .join(", ") || "Direct or untagged"
      }`,
    ].join("\n");

    try {
      await getDb()
        .insert(formSubmissions)
        .values({
          submissionId,
          formType: `${marketSlug}_spa_early_access`,
          name: data.name,
          email: data.email,
          phone: data.phone,
          organization: data.organization,
          topic: `${market.marketName} founding spa partner`,
          message: messageSummary,
          locale: data.locale,
          source: data.source,
          status: "new",
          createdAt: new Date().toISOString(),
        })
        .onConflictDoNothing({ target: formSubmissions.submissionId });
    } catch (error) {
      console.error(`${market.marketName} lead archive failed`, error);
      return Response.json(
        { success: false, error: "Unable to save the enquiry" },
        { status: 503, headers },
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    const marketOwnerEmailsKey = `${marketSlug.toUpperCase()}_CONTACT_TO_EMAILS`;
    const ownerEmails = (
      process.env[marketOwnerEmailsKey] ||
      process.env.CONTACT_TO_EMAILS ||
      process.env.CONTACT_TO_EMAIL ||
      "djskabi@gmail.com"
    )
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(isEmail);
    const fromEmail =
      process.env.CONTACT_FROM_EMAIL?.trim() ||
      "SpaPlus <hello@mail.spaplus.co>";

    if (!apiKey || ownerEmails.length === 0) {
      return Response.json(
        { success: false, error: "Email service is not configured" },
        { status: 503, headers },
      );
    }

    const emailContext = {
      marketName: market.marketName,
      pageUrl:
        data.locale.toLowerCase().startsWith("fr")
          ? `https://spaplus.co/fr-ca/ontario/${data.area ? `${data.area}/` : ""}`
          : `https://spaplus.co/en-ca/ontario/${data.area ? `${data.area}/` : ""}`,
      reviewWindowHours: market.reviewWindowHours,
      languageTag: data.locale,
    };
    const owner = buildMarketOwnerEmail(data, emailContext);
    const visitor = buildMarketVisitorEmail(data, emailContext);
    const response = await fetch("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `spaplus-${marketSlug}-${submissionId}`,
        "User-Agent": "SpaPlus-Market-Leads/1.0",
      },
      body: JSON.stringify([
        {
          from: fromEmail,
          to: ownerEmails,
          reply_to: data.email,
          subject: owner.subject,
          html: owner.html,
          text: owner.text,
          tags: [
            { name: "email_type", value: `${marketSlug}_spa_owner` },
            { name: "market", value: marketSlug },
          ],
        },
        {
          from: fromEmail,
          to: [data.email],
          reply_to: ownerEmails[0],
          subject: visitor.subject,
          html: visitor.html,
          text: visitor.text,
          tags: [
            { name: "email_type", value: `${marketSlug}_spa_confirmation` },
            { name: "market", value: marketSlug },
          ],
        },
      ]),
    });

    const result = (await response.json()) as {
      data?: Array<{ id: string }>;
      message?: string;
    };
    if (!response.ok || !Array.isArray(result.data) || result.data.length !== 2) {
      console.error(
        `${market.marketName} email delivery request failed`,
        response.status,
      );
      return Response.json(
        { success: false, error: "Email delivery failed" },
        { status: 502, headers },
      );
    }

    return Response.json(
      { success: true, deliveryIds: result.data.map((item) => item.id) },
      { headers },
    );
  } catch {
    return Response.json(
      { success: false, error: "Unable to process the enquiry" },
      { status: 500, headers },
    );
  }
}

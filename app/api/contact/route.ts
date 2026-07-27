import {
  buildOwnerEmail,
  buildVisitorEmail,
  type ContactEmailData,
} from "../../email-templates";
import { getDb } from "../../../db";
import { formSubmissions } from "../../../db/schema";

const supportedLocales = [
  "en",
  "he",
  "fr-CA",
  "fr",
  "de",
  "nl",
  "sv",
  "nb",
  "ru",
  "el",
  "it",
  "hu",
  "pl",
  "es",
] as const;

type SupportedLocale = (typeof supportedLocales)[number];

const allowedOrigins = new Set([
  "https://spaplus.co",
  "https://www.spaplus.co",
  "https://djskabi-png.github.io",
  "https://spaplus-global-brand.adir-naor-7510.chatgpt.site",
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

export async function GET(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return new Response("Not found", { status: 404 });
  }

  const url = new URL(request.url);
  const localeValue = url.searchParams.get("lang") || "he";
  const locale = supportedLocales.includes(localeValue as SupportedLocale)
    ? (localeValue as SupportedLocale)
    : "he";
  const sample: ContactEmailData = {
    name: locale === "he" ? "אדיר נאור" : "Adir Naor",
    email: "adir@example.com",
    organization: "SpaPlus Global",
    topic: locale === "he" ? "שותפות בינלאומית" : "International partnership",
    message:
      locale === "he"
        ? "אשמח לבחון שיתוף פעולה ולשמוע יותר על החזון של SpaPlus בשווקים חדשים."
        : "I would like to explore a partnership and learn more about the SpaPlus vision for new markets.",
    locale,
    source: "https://spaplus.co",
    submittedAt: new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Jerusalem",
    }).format(new Date()),
  };
  const email =
    url.searchParams.get("type") === "owner"
      ? buildOwnerEmail(sample)
      : buildVisitorEmail(sample);
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

    const localeValue = clean(body.locale, 10);
    const submissionId = clean(body.submissionId, 80);
    const privacyAccepted = body.privacyAccepted === true;
    const locale = supportedLocales.includes(localeValue as SupportedLocale)
      ? (localeValue as SupportedLocale)
      : "en";
    const data: ContactEmailData = {
      name: clean(body.name, 100),
      email: clean(body.email, 180).toLowerCase(),
      organization: clean(body.organization, 160),
      topic: clean(body.topic, 160),
      publicTopic: clean(body.publicTopic, 160),
      message: clean(body.message, 5000),
      locale,
      source: clean(body.source, 500),
      submittedAt: new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Jerusalem",
      }).format(new Date()),
    };

    if (
      !isSubmissionId(submissionId) ||
      !privacyAccepted ||
      data.name.length < 2 ||
      !isEmail(data.email) ||
      data.topic.length < 2 ||
      data.message.length < 5
    ) {
      return Response.json(
        { success: false, error: "Invalid form data" },
        { status: 400, headers },
      );
    }

    try {
      await getDb()
        .insert(formSubmissions)
        .values({
          submissionId,
          formType: "contact",
          name: data.name,
          email: data.email,
          organization: data.organization,
          topic: data.publicTopic || data.topic,
          message: data.message,
          locale: data.locale,
          source: data.source,
          status: "new",
          createdAt: new Date().toISOString(),
        })
        .onConflictDoNothing({ target: formSubmissions.submissionId });
    } catch (error) {
      console.error("Submission archive failed", error);
      return Response.json(
        { success: false, error: "Unable to save the submission" },
        { status: 503, headers },
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    const ownerEmails = (
      process.env.CONTACT_TO_EMAILS ||
      process.env.CONTACT_TO_EMAIL ||
      "djskabi@gmail.com"
    )
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(isEmail);
    const fromEmail =
      process.env.CONTACT_FROM_EMAIL?.trim() ||
      "SpaPlus Global <hello@mail.spaplus.co>";

    if (!apiKey) {
      return Response.json(
        { success: false, error: "Email service is not configured" },
        { status: 503, headers },
      );
    }

    const owner = buildOwnerEmail(data);
    const visitor = buildVisitorEmail(data);
    const idempotencyKey = `spaplus-contact-${submissionId}`;
    const response = await fetch("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
        "User-Agent": "SpaPlus-Global-Contact/1.0",
      },
      body: JSON.stringify([
        {
          from: fromEmail,
          to: ownerEmails,
          reply_to: data.email,
          subject: owner.subject,
          html: owner.html,
          text: owner.text,
          tags: [{ name: "email_type", value: "contact_owner" }],
        },
        {
          from: fromEmail,
          to: [data.email],
          reply_to: ownerEmails[0],
          subject: visitor.subject,
          html: visitor.html,
          text: visitor.text,
          tags: [{ name: "email_type", value: "contact_confirmation" }],
        },
      ]),
    });

    const result = (await response.json()) as {
      data?: Array<{ id: string }>;
      message?: string;
    };
    if (!response.ok || !Array.isArray(result.data) || result.data.length !== 2) {
      console.error("Email delivery request failed", response.status);
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
      { success: false, error: "Unable to process the form" },
      { status: 500, headers },
    );
  }
}

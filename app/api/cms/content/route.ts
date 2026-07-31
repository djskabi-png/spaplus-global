import { and, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { cmsAuditLog, cmsContent } from "../../../../db/schema";
import { getAuthorizedAdmin } from "../../../admin-auth";
import { hasPermission, sectionResource } from "../../../cms-access";

const allowedSections = new Set(["translation", "company", "market.ca-on"]);
const allowedLocales = new Set([
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
  "en-CA",
  "fr-CA",
]);

export async function GET(request: Request) {
  const admin = await getAuthorizedAdmin();
  if (!admin) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const localeValue = new URL(request.url).searchParams.get("locale") || "en";
  const locale = allowedLocales.has(localeValue) ? localeValue : "en";
  const requestedResource = new URL(request.url).searchParams.get("resource") || "site:global";
  if (!hasPermission(admin.role, admin.permissions, requestedResource, "viewContent")) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  const rows = await getDb()
    .select()
    .from(cmsContent)
    .where(eq(cmsContent.locale, locale));

  return Response.json({
    locale,
    rows: rows.filter((row) => sectionResource(row.section) === requestedResource),
  });
}

export async function PUT(request: Request) {
  const admin = await getAuthorizedAdmin();
  if (!admin) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json()) as {
    locale?: string;
    section?: string;
    field?: string;
    value?: string;
  };
  const locale = String(body.locale || "");
  const section = String(body.section || "");
  const field = String(body.field || "").trim();
  const value = String(body.value || "").trim();
  const resourceKey = sectionResource(section);
  if (!hasPermission(admin.role, admin.permissions, resourceKey, "editContent")) {
    return Response.json({ error: "Read only" }, { status: 403 });
  }

  if (
    !allowedLocales.has(locale) ||
    !allowedSections.has(section) ||
    !/^[a-zA-Z][a-zA-Z0-9]{1,80}$/.test(field) ||
    value.length > 8000
  ) {
    return Response.json({ error: "Invalid content" }, { status: 400 });
  }

  const db = getDb();
  const now = new Date().toISOString();
  await db
    .insert(cmsContent)
    .values({
      locale,
      section,
      field,
      value,
      updatedBy: admin.email,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [cmsContent.locale, cmsContent.section, cmsContent.field],
      set: { value, updatedBy: admin.email, updatedAt: now },
    });

  await db.insert(cmsAuditLog).values({
    actorEmail: admin.email,
    action: "content.updated",
    entityType: section,
    entityId: `${locale}:${field}`,
    details: JSON.stringify({ locale, section, field }),
    createdAt: now,
  });

  return Response.json({ success: true });
}

export async function DELETE(request: Request) {
  const admin = await getAuthorizedAdmin();
  if (!admin) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    locale?: string;
    section?: string;
    field?: string;
  };
  const locale = String(body.locale || "");
  const section = String(body.section || "");
  const field = String(body.field || "");
  const resourceKey = sectionResource(section);
  if (!hasPermission(admin.role, admin.permissions, resourceKey, "editContent")) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!allowedLocales.has(locale) || !allowedSections.has(section) || !field) {
    return Response.json({ error: "Invalid content" }, { status: 400 });
  }

  await getDb()
    .delete(cmsContent)
    .where(
      and(
        eq(cmsContent.locale, locale),
        eq(cmsContent.section, section),
        eq(cmsContent.field, field),
      ),
    );
  return Response.json({ success: true });
}

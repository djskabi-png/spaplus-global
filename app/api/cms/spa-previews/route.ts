import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { cmsAuditLog, spaPreviews } from "../../../../db/schema";
import { getAuthorizedAdmin } from "../../../admin-auth";
import { hasPermission } from "../../../cms-access";
import { listSpaPreviews, serializePreview, type SpaPackage, type Treatment } from "../../../spa-preview";

type Payload = {
  id?: number;
  spaName?: string;
  slug?: string;
  status?: "draft" | "shared";
  language?: "en" | "fr-CA";
  address?: string;
  about?: string;
  hours?: string;
  treatments?: Treatment[];
  spaPackage?: SpaPackage;
  logoUrl?: string;
  photoUrls?: string[];
};

const text = (value: unknown, max: number) => String(value || "").trim().slice(0, max);
const url = (value: unknown) => {
  const candidate = text(value, 2048);
  if (!candidate) return "";
  try {
    const parsed = new URL(candidate);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? candidate : "";
  } catch {
    return "";
  }
};
const slugify = (value: string) => text(value, 80).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 64);

function normalize(body: Payload) {
  const spaName = text(body.spaName, 140);
  const treatments = Array.isArray(body.treatments) ? body.treatments.slice(0, 3).map((item) => ({
    name: text(item?.name, 120), description: text(item?.description, 1200), duration: text(item?.duration, 80), price: text(item?.price, 80),
  })) : [];
  const photoUrls = Array.isArray(body.photoUrls) ? body.photoUrls.slice(0, 10).map(url).filter(Boolean) : [];
  const spaPackage: Partial<SpaPackage> = body.spaPackage || {};
  return {
    spaName,
    slug: slugify(String(body.slug || spaName)),
    status: body.status === "draft" ? "draft" as const : "shared" as const,
    language: body.language === "fr-CA" ? "fr-CA" as const : "en" as const,
    address: text(body.address, 500), about: text(body.about, 8000), hours: text(body.hours, 2000),
    treatments, spaPackage: { name: text(spaPackage.name, 120), description: text(spaPackage.description, 1200), price: text(spaPackage.price, 80) },
    logoUrl: url(body.logoUrl), photoUrls,
  };
}

async function editor() {
  const admin = await getAuthorizedAdmin();
  if (!admin) return null;
  return hasPermission(admin.role, admin.permissions, "site:global:spa-previews", "editContent") ? admin : null;
}

export async function GET() {
  const admin = await getAuthorizedAdmin();
  if (!admin) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(admin.role, admin.permissions, "site:global:spa-previews", "viewContent")) return Response.json({ error: "Forbidden" }, { status: 403 });
  return Response.json({ previews: await listSpaPreviews() });
}

export async function POST(request: Request) {
  const admin = await editor();
  if (!admin) return Response.json({ error: "Forbidden" }, { status: 403 });
  const data = normalize(await request.json() as Payload);
  if (!data.spaName || !data.slug || data.treatments.length !== 3 || data.photoUrls.length < 1 || data.photoUrls.length > 10) {
    return Response.json({ error: "Add a spa name, 3 treatments, and between 1 and 10 gallery images." }, { status: 400 });
  }
  const db = getDb();
  const now = new Date().toISOString();
  try {
    const [row] = await db.insert(spaPreviews).values({ ...data, treatments: JSON.stringify(data.treatments), spaPackage: JSON.stringify(data.spaPackage), photoUrls: JSON.stringify(data.photoUrls), createdBy: admin.email, createdAt: now, updatedAt: now }).returning();
    await db.insert(cmsAuditLog).values({ actorEmail: admin.email, action: "spa_preview.created", entityType: "spa_preview", entityId: String(row.id), details: JSON.stringify({ slug: row.slug, status: row.status }), createdAt: now });
    return Response.json({ preview: serializePreview(row) }, { status: 201 });
  } catch {
    return Response.json({ error: "This link name is already in use. Choose a different slug." }, { status: 409 });
  }
}

export async function PUT(request: Request) {
  const admin = await editor();
  if (!admin) return Response.json({ error: "Forbidden" }, { status: 403 });
  const body = await request.json() as Payload;
  const id = Number(body.id);
  const data = normalize(body);
  if (!Number.isInteger(id) || id < 1 || !data.spaName || !data.slug || data.treatments.length !== 3 || data.photoUrls.length < 1 || data.photoUrls.length > 10) return Response.json({ error: "Add a spa name, 3 treatments, and between 1 and 10 gallery images." }, { status: 400 });
  const now = new Date().toISOString();
  try {
    const [row] = await getDb().update(spaPreviews).set({ ...data, treatments: JSON.stringify(data.treatments), spaPackage: JSON.stringify(data.spaPackage), photoUrls: JSON.stringify(data.photoUrls), updatedAt: now }).where(eq(spaPreviews.id, id)).returning();
    if (!row) return Response.json({ error: "Preview not found." }, { status: 404 });
    await getDb().insert(cmsAuditLog).values({ actorEmail: admin.email, action: "spa_preview.updated", entityType: "spa_preview", entityId: String(row.id), details: JSON.stringify({ slug: row.slug, status: row.status }), createdAt: now });
    return Response.json({ preview: serializePreview(row) });
  } catch {
    return Response.json({ error: "This link name is already in use. Choose a different slug." }, { status: 409 });
  }
}

export async function DELETE(request: Request) {
  const admin = await editor();
  if (!admin) return Response.json({ error: "Forbidden" }, { status: 403 });
  const body = await request.json() as { id?: number };
  const id = Number(body.id);
  if (!Number.isInteger(id) || id < 1) return Response.json({ error: "Invalid preview." }, { status: 400 });
  const [removed] = await getDb().delete(spaPreviews).where(eq(spaPreviews.id, id)).returning();
  if (!removed) return Response.json({ error: "Preview not found." }, { status: 404 });
  const now = new Date().toISOString();
  await getDb().insert(cmsAuditLog).values({ actorEmail: admin.email, action: "spa_preview.deleted", entityType: "spa_preview", entityId: String(id), details: JSON.stringify({ slug: removed.slug }), createdAt: now });
  return Response.json({ deleted: true });
}

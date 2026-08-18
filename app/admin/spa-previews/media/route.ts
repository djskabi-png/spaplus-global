import { env } from "cloudflare:workers";
import { desc } from "drizzle-orm";
import { getDb } from "../../../../db";
import { spaPreviewMedia } from "../../../../db/schema";
import { getAuthorizedAdmin } from "../../../admin-auth";
import { hasPermission } from "../../../cms-access";

const resourceKey = "site:global:spa-previews";
const allowedTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
]);

async function authorized(capability: "viewContent" | "editContent") {
  const admin = await getAuthorizedAdmin();
  if (!admin || !hasPermission(admin.role, admin.permissions, resourceKey, capability)) return null;
  return admin;
}

export async function GET() {
  if (!await authorized("viewContent")) return Response.json({ error: "Forbidden" }, { status: 403 });
  const media = await getDb().select().from(spaPreviewMedia).orderBy(desc(spaPreviewMedia.createdAt)).limit(200);
  return Response.json({ media });
}

export async function POST(request: Request) {
  const admin = await authorized("editContent");
  if (!admin) return Response.json({ error: "Forbidden" }, { status: 403 });
  const formData = await request.formData();
  const files = formData.getAll("files").filter((value): value is File => value instanceof File);
  if (!files.length || files.length > 10) return Response.json({ error: "Choose between 1 and 10 images." }, { status: 400 });
  const invalid = files.find((file) => !allowedTypes.has(file.type) || file.size > 8 * 1024 * 1024);
  if (invalid) return Response.json({ error: "Use JPG, PNG, WebP or AVIF images up to 8 MB each." }, { status: 400 });
  const now = new Date().toISOString();
  const uploaded = [];
  for (const file of files) {
    const extension = allowedTypes.get(file.type)!;
    const objectKey = `spa-previews/${now.slice(0, 7)}/${crypto.randomUUID()}.${extension}`;
    await env.PREVIEW_MEDIA.put(objectKey, file.stream(), { httpMetadata: { contentType: file.type, cacheControl: "public, max-age=31536000, immutable" }, customMetadata: { filename: file.name, uploadedBy: admin.email } });
    const url = `https://app.spaplus.co/spa-preview-media/${objectKey}`;
    const [record] = await getDb().insert(spaPreviewMedia).values({ objectKey, url, filename: file.name.slice(0, 240), contentType: file.type, createdBy: admin.email, createdAt: now }).returning();
    uploaded.push(record);
  }
  return Response.json({ media: uploaded }, { status: 201 });
}

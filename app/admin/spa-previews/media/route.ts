import { env } from "cloudflare:workers";
import { desc } from "drizzle-orm";
import { getDb } from "../../../../db";
import { spaPreviewMedia } from "../../../../db/schema";
import { getAuthorizedAdmin } from "../../../admin-auth";
import { hasPermission } from "../../../cms-access";

const resourceKey = "site:global:spa-previews";
const publicMediaUrl = (objectKey: string) => `https://spaplus-global-brand.adir-naor-7510.chatgpt.site/spa-preview-media/${objectKey}`;
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
  return Response.json(
    { media: media.map((item) => ({ ...item, url: publicMediaUrl(item.objectKey) })) },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
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
  const uploadedKeys: string[] = [];
  const rows: Array<{
    objectKey: string;
    url: string;
    filename: string;
    contentType: string;
    createdBy: string;
    createdAt: string;
  }> = [];
  try {
    for (const file of files) {
      const extension = allowedTypes.get(file.type)!;
      const objectKey = `spa-previews/${now.slice(0, 7)}/${crypto.randomUUID()}.${extension}`;
      const bytes = await file.arrayBuffer();
      await env.PREVIEW_MEDIA.put(objectKey, bytes, {
        httpMetadata: { contentType: file.type, cacheControl: "public, max-age=31536000, immutable" },
        customMetadata: { filename: file.name.slice(0, 240), uploadedBy: admin.email },
      });
      uploadedKeys.push(objectKey);
      rows.push({ objectKey, url: publicMediaUrl(objectKey), filename: file.name.slice(0, 240), contentType: file.type, createdBy: admin.email, createdAt: now });
    }
    const uploaded = await getDb().insert(spaPreviewMedia).values(rows).returning();
    return Response.json({ media: uploaded }, { status: 201, headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch (error) {
    await Promise.allSettled(uploadedKeys.map((objectKey) => env.PREVIEW_MEDIA.delete(objectKey)));
    console.error("Spa preview media upload failed", error);
    return Response.json({ error: "The upload did not finish. Please try again." }, { status: 500 });
  }
}

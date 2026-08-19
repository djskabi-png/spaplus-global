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
const maximumFileSize = 8 * 1024 * 1024;

type UploadPart = { filename: string; contentType: string; bytes: ArrayBuffer };

function decodedFilename(value: string | null) {
  if (!value) return "image";
  try { return decodeURIComponent(value).slice(0, 240) || "image"; }
  catch { return "image"; }
}

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
  const parts: UploadPart[] = [];
  try {
    if (request.headers.get("x-spaplus-upload") === "direct-file") {
      const contentType = (request.headers.get("content-type") || "").split(";", 1)[0].toLowerCase();
      const contentLength = Number(request.headers.get("content-length") || 0);
      if (!allowedTypes.has(contentType) || contentLength > maximumFileSize) {
        return Response.json({ error: "Use JPG, PNG, WebP or AVIF images up to 8 MB each." }, { status: 400 });
      }
      const bytes = await request.arrayBuffer();
      if (!bytes.byteLength || bytes.byteLength > maximumFileSize) {
        return Response.json({ error: "Use JPG, PNG, WebP or AVIF images up to 8 MB each." }, { status: 400 });
      }
      parts.push({ filename: decodedFilename(request.headers.get("x-spaplus-filename")), contentType, bytes });
    } else {
      const formData = await request.formData();
      const files = formData.getAll("files").filter((value): value is File => value instanceof File);
      if (!files.length || files.length > 10) return Response.json({ error: "Choose between 1 and 10 images." }, { status: 400 });
      const invalid = files.find((file) => !allowedTypes.has(file.type) || file.size > maximumFileSize);
      if (invalid) return Response.json({ error: "Use JPG, PNG, WebP or AVIF images up to 8 MB each." }, { status: 400 });
      for (const file of files) parts.push({ filename: file.name.slice(0, 240), contentType: file.type, bytes: await file.arrayBuffer() });
    }
  } catch (error) {
    console.error("Spa preview media request could not be read", error);
    return Response.json({ error: "The image request could not be read. Please choose the file again." }, { status: 400 });
  }
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
    for (const part of parts) {
      const extension = allowedTypes.get(part.contentType)!;
      const objectKey = `spa-previews/${now.slice(0, 7)}/${crypto.randomUUID()}.${extension}`;
      await env.PREVIEW_MEDIA.put(objectKey, part.bytes, {
        httpMetadata: { contentType: part.contentType, cacheControl: "public, max-age=31536000, immutable" },
        customMetadata: { filename: part.filename, uploadedBy: admin.email },
      });
      uploadedKeys.push(objectKey);
      rows.push({ objectKey, url: publicMediaUrl(objectKey), filename: part.filename, contentType: part.contentType, createdBy: admin.email, createdAt: now });
    }
    const uploaded = await getDb().insert(spaPreviewMedia).values(rows).returning();
    return Response.json({ media: uploaded }, { status: 201, headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch (error) {
    await Promise.allSettled(uploadedKeys.map((objectKey) => env.PREVIEW_MEDIA.delete(objectKey)));
    console.error("Spa preview media upload failed", error);
    return Response.json({ error: "The upload did not finish. Please try again." }, { status: 500 });
  }
}

import { env } from "cloudflare:workers";

type Context = { params: Promise<{ key: string[] }> };

async function serve(request: Request, context: Context) {
  const { key } = await context.params;
  const objectKey = key.join("/");
  if (!objectKey.startsWith("spa-previews/")) return new Response("Not found", { status: 404 });
  const object = await env.PREVIEW_MEDIA.get(objectKey);
  if (!object) return new Response("Not found", { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  return new Response(request.method === "HEAD" ? null : object.body, { headers });
}

export async function GET(request: Request, context: Context) {
  return serve(request, context);
}

export async function HEAD(request: Request, context: Context) {
  return serve(request, context);
}

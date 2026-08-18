import { env } from "cloudflare:workers";

type AssetRouteContext = { params: Promise<{ path: string[] }> };

function assetUrl(path: string[]) {
  const encodedPath = path.map((segment) => encodeURIComponent(segment)).join("/");
  return `https://app.spaplus.co/assets/${encodedPath}`;
}

async function proxyAsset(request: Request, context: AssetRouteContext) {
  const { path } = await context.params;
  const upstream = await env.ASSETS.fetch(assetUrl(path), {
    method: request.method,
    headers: request.headers,
    redirect: "follow",
  });
  const headers = new Headers(upstream.headers);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  return new Response(request.method === "HEAD" ? null : upstream.body, {
    status: upstream.status,
    headers,
  });
}

export async function GET(request: Request, context: AssetRouteContext) {
  return proxyAsset(request, context);
}

export async function HEAD(request: Request, context: AssetRouteContext) {
  return proxyAsset(request, context);
}

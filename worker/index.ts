/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  SITES_API_ORIGIN?: string;
  SITES_BYPASS_TOKEN?: string;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const hostname = url.hostname.toLowerCase();

    if (hostname === "app.spaplus.co" && url.pathname === "/") {
      url.pathname = "/en-ca/ontario/";
      return Response.redirect(url.toString(), 307);
    }

    if (
      hostname === "app.spaplus.co" &&
      (url.pathname === "/admin" ||
        url.pathname.startsWith("/admin/") ||
        url.pathname === "/tools" ||
        url.pathname.startsWith("/tools/") ||
        url.pathname.startsWith("/api/cms/")) &&
      env.SITES_API_ORIGIN
    ) {
      const adminUrl = new URL(url.pathname + url.search, env.SITES_API_ORIGIN);
      return Response.redirect(adminUrl.toString(), 307);
    }

    if (
      hostname === "app.spaplus.co" &&
      url.pathname === "/api/market-spa-leads" &&
      env.SITES_API_ORIGIN &&
      env.SITES_BYPASS_TOKEN
    ) {
      const upstreamUrl = new URL(url.pathname + url.search, env.SITES_API_ORIGIN);
      const upstreamHeaders = new Headers(request.headers);
      upstreamHeaders.set(
        "OAI-Sites-Authorization",
        `Bearer ${env.SITES_BYPASS_TOKEN}`,
      );
      upstreamHeaders.delete("host");
      upstreamHeaders.delete("content-length");
      return fetch(upstreamUrl, {
        method: request.method,
        headers: upstreamHeaders,
        body:
          request.method === "GET" || request.method === "HEAD"
            ? undefined
            : request.body,
        redirect: "manual",
      });
    }

    if (hostname === "www.spaplus.co") {
      url.hostname = "spaplus.co";
      return Response.redirect(url.toString(), 308);
    }

    if (hostname === "admin.spaplus.co" && url.pathname === "/") {
      url.pathname = "/admin";
      return Response.redirect(url.toString(), 307);
    }

    if (hostname === "tools.spaplus.co" && url.pathname === "/") {
      url.pathname = "/tools";
      return Response.redirect(url.toString(), 307);
    }

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    return handler.fetch(request, env, ctx);
  },
};

export default worker;

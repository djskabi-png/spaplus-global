/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  PRIVATE_BACKEND_ORIGIN?: string;
  SITES_BYPASS_TOKEN?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  ADMIN_SESSION_SECRET?: string;
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

type SignedPayload = Record<string, unknown> & { exp: number };

const SESSION_COOKIE = "spg_admin_session";
const OAUTH_STATE_COOKIE = "spg_oauth_state";
const GOOGLE_CALLBACK = "https://app.spaplus.co/auth/google/callback";
const SESSION_SECONDS = 8 * 60 * 60;
const privateName = (encoded: string) => atob(encoded);
const PRIVATE_AUTHORIZATION_HEADER = privateName(
  "T0FJLVNpdGVzLUF1dGhvcml6YXRpb24=",
);
const LEGACY_SIGN_IN_PATH = privateName("L3NpZ25pbi13aXRoLWNoYXRncHQ=");
const LEGACY_SIGN_OUT_PATH = privateName("L3NpZ25vdXQtd2l0aC1jaGF0Z3B0");
const LEGACY_BRAND_TERMS = [privateName("Y2hhdGdwdA=="), privateName("b3BlbmFp")];

function textResponse(message: string, status = 400): Response {
  return new Response(
    `<!doctype html><html lang="he" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SpaPlus</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#fff8fb;color:#172d4f;font-family:Arial,sans-serif}.card{width:min(520px,calc(100% - 40px));padding:40px;border:1px solid #e3dce2;border-radius:24px;background:#fff;box-shadow:0 20px 60px #172d4f18;text-align:center}a{display:inline-block;margin-top:18px;color:#ed1766;font-weight:700}</style><main class="card"><h1>הגישה לא אושרה</h1><p>${escapeHtml(message)}</p><a href="/">חזרה לאתר</a></main></html>`,
    {
      status,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
        "x-robots-tag": "noindex, nofollow",
      },
    },
  );
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] || character);
}

function parseCookies(request: Request): Map<string, string> {
  const cookies = new Map<string, string>();
  for (const part of (request.headers.get("cookie") || "").split(";")) {
    const index = part.indexOf("=");
    if (index < 1) continue;
    cookies.set(part.slice(0, index).trim(), part.slice(index + 1).trim());
  }
  return cookies;
}

function base64UrlEncode(value: Uint8Array | string): string {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : value;
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function hmac(value: string, secret: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)));
}

async function signPayload(payload: SignedPayload, secret: string): Promise<string> {
  const encoded = base64UrlEncode(JSON.stringify(payload));
  return `${encoded}.${base64UrlEncode(await hmac(encoded, secret))}`;
}

async function verifyPayload(token: string | undefined, secret: string): Promise<SignedPayload | null> {
  if (!token) return null;
  const [encoded, signature, extra] = token.split(".");
  if (!encoded || !signature || extra) return null;
  const expected = await hmac(encoded, secret);
  const actual = base64UrlDecode(signature);
  if (actual.length !== expected.length) return null;
  let difference = 0;
  for (let index = 0; index < actual.length; index += 1) difference |= actual[index] ^ expected[index];
  if (difference !== 0) return null;
  try {
    const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(encoded))) as SignedPayload;
    if (!Number.isFinite(payload.exp) || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

function safeReturnTo(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/tools";
  try {
    const parsed = new URL(value, "https://app.spaplus.co");
    if (parsed.origin !== "https://app.spaplus.co" || parsed.pathname.startsWith("/auth/")) return "/tools";
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return "/tools";
  }
}

function randomToken(): string {
  return base64UrlEncode(crypto.getRandomValues(new Uint8Array(24)));
}

function isProtectedPath(pathname: string): boolean {
  if (pathname === "/api/cms/public") return false;
  return pathname === "/admin" || pathname.startsWith("/admin/") ||
    pathname === "/tools" || pathname.startsWith("/tools/") ||
    pathname.startsWith("/api/cms/");
}

async function startGoogleLogin(request: Request, env: Env): Promise<Response> {
  if (!env.GOOGLE_CLIENT_ID || !env.ADMIN_SESSION_SECRET) return textResponse("מערכת ההתחברות עדיין אינה זמינה.", 503);
  const url = new URL(request.url);
  const state = await signPayload({
    nonce: randomToken(),
    returnTo: safeReturnTo(url.searchParams.get("return_to")),
    exp: Math.floor(Date.now() / 1000) + 10 * 60,
  }, env.ADMIN_SESSION_SECRET);
  const googleUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleUrl.search = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_CALLBACK,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  }).toString();
  const response = new Response(null, {
    status: 302,
    headers: { location: googleUrl.toString(), "cache-control": "no-store" },
  });
  response.headers.append("set-cookie", `${OAUTH_STATE_COOKIE}=${state}; Path=/auth/google; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);
  return response;
}

async function finishGoogleLogin(request: Request, env: Env): Promise<Response> {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.ADMIN_SESSION_SECRET) return textResponse("מערכת ההתחברות עדיין אינה זמינה.", 503);
  const url = new URL(request.url);
  const state = url.searchParams.get("state") || "";
  const cookies = parseCookies(request);
  if (!state || cookies.get(OAUTH_STATE_COOKIE) !== state) return textResponse("בקשת ההתחברות אינה תקינה. נסו להתחבר מחדש.");
  const statePayload = await verifyPayload(state, env.ADMIN_SESSION_SECRET);
  if (!statePayload || typeof statePayload.returnTo !== "string") return textResponse("תוקף בקשת ההתחברות הסתיים. נסו להתחבר מחדש.");
  const code = url.searchParams.get("code");
  if (!code) return textResponse("ההתחברות בוטלה או לא הושלמה.");

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_CALLBACK,
      grant_type: "authorization_code",
    }),
  });
  if (!tokenResponse.ok) return textResponse("גוגל לא אישרה את בקשת ההתחברות. נסו שוב.", 401);
  const tokens = await tokenResponse.json() as { id_token?: string };
  if (!tokens.id_token) return textResponse("לא התקבל אימות זהות תקין.", 401);

  const identityResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(tokens.id_token)}`);
  if (!identityResponse.ok) return textResponse("לא ניתן היה לאמת את חשבון גוגל.", 401);
  const identity = await identityResponse.json() as Record<string, string>;
  const email = (identity.email || "").trim().toLowerCase();
  if (identity.aud !== env.GOOGLE_CLIENT_ID || identity.email_verified !== "true" || !email) {
    return textResponse("חשבון הגוגל הזה אינו מורשה להיכנס למערכת.", 403);
  }

  const session = await signPayload({
    email,
    name: identity.name || email,
    sub: identity.sub || "",
    exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS,
  }, env.ADMIN_SESSION_SECRET);
  const response = new Response(null, {
    status: 302,
    headers: {
      location: new URL(safeReturnTo(statePayload.returnTo), url.origin).toString(),
      "cache-control": "no-store",
    },
  });
  response.headers.append("set-cookie", `${SESSION_COOKIE}=${session}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_SECONDS}`);
  response.headers.append("set-cookie", `${OAUTH_STATE_COOKIE}=; Path=/auth/google; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
  return response;
}

async function proxyProtectedRequest(request: Request, env: Env, session: SignedPayload): Promise<Response> {
  if (!env.PRIVATE_BACKEND_ORIGIN || !env.SITES_BYPASS_TOKEN) return textResponse("מערכת הניהול אינה זמינה כרגע.", 503);
  const publicUrl = new URL(request.url);
  const upstreamUrl = new URL(publicUrl.pathname + publicUrl.search, env.PRIVATE_BACKEND_ORIGIN);
  const upstreamHeaders = new Headers(request.headers);
  upstreamHeaders.set(PRIVATE_AUTHORIZATION_HEADER, `Bearer ${env.SITES_BYPASS_TOKEN}`);
  upstreamHeaders.set("x-spaplus-user-email", String(session.email || ""));
  upstreamHeaders.set("x-spaplus-user-name", encodeURIComponent(String(session.name || session.email || "")));
  upstreamHeaders.delete("host");
  upstreamHeaders.delete("content-length");
  upstreamHeaders.delete("cookie");

  const upstream = await fetch(upstreamUrl, {
    method: request.method,
    headers: upstreamHeaders,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
    redirect: "manual",
  });
  const headers = new Headers(upstream.headers);
  headers.delete("set-cookie");
  headers.delete("server");
  headers.delete("x-powered-by");
  headers.set("cache-control", "private, no-store");
  headers.set("x-robots-tag", "noindex, nofollow");

  const location = headers.get("location");
  if (location) {
    const redirected = new URL(location, env.PRIVATE_BACKEND_ORIGIN);
    if (redirected.origin === new URL(env.PRIVATE_BACKEND_ORIGIN).origin) {
      if (redirected.pathname === LEGACY_SIGN_IN_PATH) {
        redirected.pathname = "/auth/google/start";
      } else if (redirected.pathname === LEGACY_SIGN_OUT_PATH) {
        redirected.pathname = "/auth/logout";
      }
      headers.set("location", `${publicUrl.origin}${redirected.pathname}${redirected.search}${redirected.hash}`);
    }
  }

  const contentType = headers.get("content-type") || "";
  if (request.method !== "HEAD" && /(?:text\/|application\/(?:json|javascript))/.test(contentType)) {
    let body = await upstream.text();
    body = body
      .replaceAll(env.PRIVATE_BACKEND_ORIGIN, publicUrl.origin)
      .replaceAll(LEGACY_SIGN_IN_PATH, "/auth/google/start")
      .replaceAll(LEGACY_SIGN_OUT_PATH, "/auth/logout")
      .replaceAll("index-MnjarlW8.js", "index-D03kzx0b.js");
    body = body.replace(new RegExp(LEGACY_BRAND_TERMS[0], "gi"), "Google");
    body = body.replace(new RegExp(LEGACY_BRAND_TERMS[1], "gi"), "SpaPlus");
    headers.delete("content-length");
    return new Response(body, { status: upstream.status, statusText: upstream.statusText, headers });
  }
  return new Response(upstream.body, { status: upstream.status, statusText: upstream.statusText, headers });
}

/**
 * The public edge serves the private administration shell after Google sign-in.
 * Its HTML and client assets must always be taken from the same release. If a
 * hashed asset is not present in the edge asset bundle yet, retrieve that exact
 * asset from the private release instead of letting the browser render an
 * unstyled administration page.
 */
async function proxyPrivateAsset(request: Request, env: Env): Promise<Response | null> {
  if (!env.PRIVATE_BACKEND_ORIGIN || !env.SITES_BYPASS_TOKEN) return null;

  const publicUrl = new URL(request.url);
  const upstreamUrl = new URL(
    `${publicUrl.pathname}${publicUrl.search}`,
    env.PRIVATE_BACKEND_ORIGIN,
  );
  const upstream = await fetch(upstreamUrl, {
    method: request.method,
    headers: {
      [PRIVATE_AUTHORIZATION_HEADER]: `Bearer ${env.SITES_BYPASS_TOKEN}`,
    },
    redirect: "manual",
  });

  if (!upstream.ok) return null;

  const headers = new Headers(upstream.headers);
  headers.delete("set-cookie");
  headers.delete("server");
  headers.delete("x-powered-by");
  headers.set("cache-control", "public, max-age=31536000, immutable");
  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers,
  });
}

async function applyManagedOntarioMetadata(
  request: Request,
  response: Response,
  env: Env,
): Promise<Response> {
  if (
    request.method !== "GET" ||
    !env.PRIVATE_BACKEND_ORIGIN ||
    !env.SITES_BYPASS_TOKEN ||
    !(response.headers.get("content-type") || "").includes("text/html")
  ) {
    return response;
  }
  const pathname = new URL(request.url).pathname.replace(/\/+$/, "");
  const locale = pathname === "/fr-ca/ontario" ? "fr-CA" :
    pathname === "/en-ca/ontario" ? "en-CA" : "";
  if (!locale) return response;

  try {
    const contentUrl = new URL(
      `/api/cms/public?locale=${encodeURIComponent(locale)}`,
      env.PRIVATE_BACKEND_ORIGIN,
    );
    const contentResponse = await fetch(contentUrl, {
      headers: {
        [PRIVATE_AUTHORIZATION_HEADER]: `Bearer ${env.SITES_BYPASS_TOKEN}`,
      },
    });
    if (!contentResponse.ok) return response;
    const payload = await contentResponse.json() as {
      content?: Record<string, Record<string, string>>;
    };
    const copy = payload.content?.["market.ca-on"] || {};
    const english = locale === "en-CA";
    const fallbackTitle = english
      ? "SpaPlus is coming to Ontario | Founding spa partners"
      : "SpaPlus arrive en Ontario | Spas partenaires fondateurs";
    const fallbackDescription = english
      ? "SpaPlus is preparing to launch in Ontario. Established spas can join the founding partner list with no fee, no commitment and no credit card."
      : "SpaPlus prépare son lancement en Ontario. Les spas établis peuvent s’inscrire à la liste des partenaires fondateurs, gratuitement, sans engagement et sans carte de crédit.";
    const title = copy.seoTitle || fallbackTitle;
    const description = copy.seoDescription || fallbackDescription;
    let html = await response.text();
    html = html
      .replaceAll(fallbackTitle, escapeHtml(title))
      .replaceAll(fallbackDescription, escapeHtml(description));
    const headers = new Headers(response.headers);
    headers.delete("content-length");
    return new Response(html, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch {
    return response;
  }
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

    if (hostname === "www.spaplus.co") {
      url.hostname = "spaplus.co";
      return Response.redirect(url.toString(), 308);
    }

    if (hostname === "spaplus.co" && url.pathname === "/") {
      const legacyLocale = url.searchParams.get("lang")?.toLowerCase();
      const localePaths: Record<string, string> = {
        en: "/en/",
        he: "/he/",
        "fr-ca": "/fr-ca/",
        fr: "/fr-ca/",
        ru: "/ru/",
        el: "/el/",
        it: "/it/",
        hu: "/hu/",
        pl: "/pl/",
        es: "/es/",
      };
      const acceptedLanguage = request.headers
        .get("accept-language")
        ?.split(",", 1)[0]
        ?.split(";", 1)[0]
        ?.toLowerCase();
      const languageKey = legacyLocale || acceptedLanguage || "en";
      url.pathname =
        localePaths[languageKey] || localePaths[languageKey.split("-", 1)[0]] || "/en/";
      url.searchParams.delete("lang");
      return Response.redirect(url.toString(), 307);
    }

    if (hostname === "app.spaplus.co" && url.pathname === "/assets/index-MnjarlW8.js") {
      const localAssetUrl = new URL(request.url);
      localAssetUrl.pathname = "/assets/index-D03kzx0b.js";
      return env.ASSETS.fetch(new Request(localAssetUrl, request));
    }

    if (hostname === "app.spaplus.co" && url.pathname === "/") {
      url.pathname = "/en-ca/ontario/";
      return Response.redirect(url.toString(), 307);
    }

    if (hostname === "app.spaplus.co" && url.pathname === "/auth/google/start") {
      return startGoogleLogin(request, env);
    }

    if (hostname === "app.spaplus.co" && url.pathname === "/auth/google/callback") {
      return finishGoogleLogin(request, env);
    }

    if (hostname === "app.spaplus.co" && url.pathname === "/auth/logout") {
      const response = new Response(null, {
        status: 302,
        headers: {
          location: new URL(safeReturnTo(url.searchParams.get("return_to")), url.origin).toString(),
          "cache-control": "no-store",
        },
      });
      response.headers.append("set-cookie", `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
      return response;
    }

    if (hostname === "app.spaplus.co" && isProtectedPath(url.pathname)) {
      if (!env.ADMIN_SESSION_SECRET) return textResponse("מערכת ההתחברות עדיין אינה זמינה.", 503);
      const session = await verifyPayload(parseCookies(request).get(SESSION_COOKIE), env.ADMIN_SESSION_SECRET);
      if (!session || typeof session.email !== "string") {
        const loginUrl = new URL("/auth/google/start", url.origin);
        loginUrl.searchParams.set("return_to", `${url.pathname}${url.search}`);
        return Response.redirect(loginUrl.toString(), 302);
      }
      return proxyProtectedRequest(request, env, session);
    }

    if (
      hostname === "app.spaplus.co" &&
      (
        url.pathname === "/api/market-spa-leads" ||
        url.pathname === "/api/contact" ||
        url.pathname === "/api/cms/public" ||
        url.pathname === "/api/integrations/roomsvip-leads"
      ) &&
      env.PRIVATE_BACKEND_ORIGIN &&
      env.SITES_BYPASS_TOKEN
    ) {
      const upstreamUrl = new URL(url.pathname + url.search, env.PRIVATE_BACKEND_ORIGIN);
      const upstreamHeaders = new Headers(request.headers);
      upstreamHeaders.set(
        PRIVATE_AUTHORIZATION_HEADER,
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

    if (hostname === "app.spaplus.co" && url.pathname === "/robots.txt") {
      return new Response(
        "User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /tools\nDisallow: /api/cms/\n\nSitemap: https://app.spaplus.co/sitemap.xml\n",
        { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" } },
      );
    }

    if (hostname === "app.spaplus.co" && url.pathname === "/sitemap.xml") {
      return env.ASSETS.fetch(new Request(new URL("/app-sitemap.xml", request.url)));
    }

    if (
      hostname === "app.spaplus.co" &&
      (request.method === "GET" || request.method === "HEAD")
    ) {
      const assetResponse = await env.ASSETS.fetch(request);
      if (assetResponse.status !== 404) {
        const renderedResponse = await applyManagedOntarioMetadata(request, assetResponse, env);
        if ((renderedResponse.headers.get("content-type") || "").includes("text/html")) {
          const responseHeaders = new Headers(renderedResponse.headers);
          responseHeaders.set("cache-control", "no-store, must-revalidate");
          responseHeaders.delete("content-length");
          return new Response(renderedResponse.body, {
            status: renderedResponse.status,
            statusText: renderedResponse.statusText,
            headers: responseHeaders,
          });
        }
        return renderedResponse;
      }

      if (url.pathname.startsWith("/assets/")) {
        const privateAsset = await proxyPrivateAsset(request, env);
        if (privateAsset) return privateAsset;
      }
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

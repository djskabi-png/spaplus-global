import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function documentLanguage(pathname: string) {
  if (pathname === "/fr-ca" || pathname.startsWith("/fr-ca/")) return "fr-CA";
  if (pathname === "/he" || pathname.startsWith("/he/")) return "he";
  return "en";
}

export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-spaplus-document-language", documentLanguage(request.nextUrl.pathname));
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/en-ca/:path*", "/fr-ca/:path*", "/admin/:path*", "/tools/:path*", "/vila4u/:path*"],
};

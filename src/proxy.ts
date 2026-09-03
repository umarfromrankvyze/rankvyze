import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "rv_session";
const PROTECTED_PREFIXES = ["/dashboard", "/onboarding", "/admin", "/checkout"];
const AUTH_ROUTES = ["/login", "/signup"];

/**
 * Cheap cookie-presence gate. Real session validation (expiry, role) happens
 * in the server layouts, which have database access.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = Boolean(req.cookies.get(SESSION_COOKIE)?.value);

  if (PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    if (!hasSession) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  if (AUTH_ROUTES.includes(pathname) && hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*", "/admin/:path*", "/checkout/:path*", "/login", "/signup"],
};

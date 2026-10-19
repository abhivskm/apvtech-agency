import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "agency_session";

/**
 * Cheap first gate for admin routes: no session cookie → redirect to login / 401.
 * This is NOT the security boundary. Every admin page, server action and API handler
 * validates the session against the database and checks role permissions on the server.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasCookie = Boolean(req.cookies.get(SESSION_COOKIE)?.value);

  if (pathname.startsWith("/api/admin")) {
    if (!hasCookie) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!hasCookie) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = pathname === "/admin" ? "" : `?next=${encodeURIComponent(pathname)}`;
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

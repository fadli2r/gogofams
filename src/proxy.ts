import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const session = request.cookies.get("gogomi_session");
  const { pathname } = request.nextUrl;

  // Let Next.js internal requests, API routes (if any), and favicon pass through
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const isLoggedIn = session?.value === "authenticated";

  // If not logged in and trying to access a page other than login, redirect to login
  if (!isLoggedIn && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If logged in and trying to access the login page, redirect to home
  if (isLoggedIn && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Run proxy on all paths except static assets
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

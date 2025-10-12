import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  PASSWORD_API_ROUTE,
  PASSWORD_COOKIE_NAME,
  PASSWORD_COOKIE_VALUE,
  PASSWORD_ROUTE,
} from "@/lib/password-protect";

const PUBLIC_FILE_REGEX = /\.(.*)$/;
const PASSWORD = process.env.SITE_ACCESS_PASSWORD;

export function middleware(request: NextRequest) {
  if (!PASSWORD) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  if (
    pathname === PASSWORD_ROUTE ||
    pathname === PASSWORD_API_ROUTE ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static/") ||
    pathname === "/favicon.ico" ||
    PUBLIC_FILE_REGEX.test(pathname)
  ) {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get(PASSWORD_COOKIE_NAME);

  if (authCookie?.value === PASSWORD_COOKIE_VALUE) {
    return NextResponse.next();
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = PASSWORD_ROUTE;

  if (pathname && pathname !== PASSWORD_ROUTE) {
    const fullPath = `${pathname}${request.nextUrl.search}`;
    redirectUrl.searchParams.set("from", fullPath);
  }

  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ["/(.*)"],
};

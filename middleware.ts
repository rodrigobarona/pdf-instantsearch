import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_FILE = /\.(.*)$/;

// Supported languages
const supportedLanguages = ["pt", "en", "fr"];
const defaultLanguage = "pt";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip Next.js internal routes and public files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Check if the pathname starts with a locale
  const pathnameHasLocale = supportedLanguages.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return NextResponse.next();

  // Redirect if there is no locale
  const locale = defaultLanguage;
  request.nextUrl.pathname = `/${locale}${pathname}`;

  // e.g. incoming request is /products
  // The new URL is now /pt/products
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Skip all internal paths (_next)
  // Skip all api routes
  // Skip all files in the public folder
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

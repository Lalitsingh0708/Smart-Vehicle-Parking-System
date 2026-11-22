import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const AUTH_SECRET =
  process.env.AUTH_SECRET ||
  "where_did_i_park_production_grade_secret_key_32_characters_minimum";
const secretKey = new TextEncoder().encode(AUTH_SECRET);
const COOKIE_NAME = "wdip_session";

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  const isAuthPage = pathname === "/login" || pathname === "/register";

  // If already authenticated and visiting /login or /register, redirect to their role dashboard
  if (isAuthPage) {
    if (token) {
      try {
        const { payload } = await jwtVerify(token, secretKey);
        if (payload.userId && payload.email) {
          let redirectUrl = "/dashboard";
          if (payload.role === "admin") {
            redirectUrl = "/admin";
          } else if (payload.role === "attendant") {
            redirectUrl = "/attendant";
          }
          return NextResponse.redirect(new URL(redirectUrl, request.url));
        }
      } catch {
        // Token invalid, expired, or tampered with: clear it and allow /login
        const response = NextResponse.next();
        response.cookies.delete(COOKIE_NAME);
        return response;
      }
    }
    return NextResponse.next();
  }

  // Protected paths
  const isProtectedPath =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/attendant");

  if (isProtectedPath) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "Authentication required. Please sign in to continue.");
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { payload } = await jwtVerify(token, secretKey);

      // Verify payload contains userId and email
      if (!payload.userId || !payload.email) {
        throw new Error("Invalid session payload");
      }

      // Role authorization checks
      if (pathname.startsWith("/admin") && payload.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      return NextResponse.next();
    } catch {
      // Token is invalid, expired, or tampered with
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "Session expired. Please sign in again.");
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete(COOKIE_NAME);
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/attendant/:path*",
    "/login",
    "/register",
  ],
};

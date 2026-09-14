import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Backend is disconnected — anything gated behind auth (or the account-creation
// flows that would lead there) is inaccessible and reads as a normal 404.
export function middleware(request: NextRequest) {
  return NextResponse.rewrite(new URL("/blocked", request.url));
}

export const config = {
  matcher: [
    "/learn",
    "/learn/:path*",
    "/admin",
    "/admin/:path*",
    "/certificates",
    "/certificates/:path*",
    "/set-password",
    "/sign-up",
    "/forgot-password",
    "/verify-email",
    "/accept-invitation",
  ],
};

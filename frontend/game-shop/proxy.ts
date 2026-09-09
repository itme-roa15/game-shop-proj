import { NextResponse } from "next/server";
import { auth } from "@/auth";
export const proxy = auth((request) => {
  const session = request.auth;
  const active = Boolean(session?.accessToken && session.accessTokenExpiresAt && session.accessTokenExpiresAt > Date.now());
  if (!active) { const login = new URL("/login", request.url); login.searchParams.set("returnTo", request.nextUrl.pathname); return NextResponse.redirect(login); }
  if (request.nextUrl.pathname.startsWith("/admin") && session?.user.role !== "ROLE_ADMIN") return NextResponse.redirect(new URL("/", request.url));
  return NextResponse.next();
});
export const config = { matcher: ["/checkout", "/orders/:path*", "/admin/:path*"] };

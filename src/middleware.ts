import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { canAccessPath, isRole, roleHomePath, type Role } from "@/lib/roles";
import { SESSION_COOKIE } from "@/lib/auth/session";

function getSecret(): Uint8Array {
  const secret =
    process.env.AUTH_SECRET ?? "key2hr-dev-secret-change-me-before-prod";
  return new TextEncoder().encode(secret);
}

async function roleFromRequest(request: NextRequest): Promise<Role | null> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const role = typeof payload.role === "string" ? payload.role : "";
    return isRole(role) ? role : null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = await roleFromRequest(request);
  const isLogin = pathname === "/login";
  const isAuthApi = pathname.startsWith("/api/auth/");

  if (isAuthApi) {
    return NextResponse.next();
  }

  if (!role && !isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (role && isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = roleHomePath(role);
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (role && pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = roleHomePath(role);
    return NextResponse.redirect(url);
  }

  if (role && !canAccessPath(role, pathname) && !isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = roleHomePath(role);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

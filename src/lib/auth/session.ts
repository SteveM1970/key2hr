import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { SessionUser } from "./types";
import { isRole } from "@/lib/roles";

export const SESSION_COOKIE = "key2hr_session";

const SESSION_TTL_SECONDS = 60 * 60 * 12;

/** Demo/local fallback only. Hosted/production must set AUTH_SECRET via secrets. */
const DEV_AUTH_SECRET = "key2hr-dev-secret-change-me-before-prod";

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET?.trim() || DEV_AUTH_SECRET;
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    sub: user.id,
    username: user.username,
    role: user.role,
    employeeId: user.employeeId,
    displayName: user.displayName,
    provider: user.provider,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecret());
}

export async function readSessionToken(
  token: string,
): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const role = typeof payload.role === "string" ? payload.role : "";
    if (!payload.sub || typeof payload.username !== "string" || !isRole(role)) {
      return null;
    }
    return {
      id: payload.sub,
      username: payload.username,
      role,
      employeeId:
        typeof payload.employeeId === "string" ? payload.employeeId : null,
      displayName:
        typeof payload.displayName === "string"
          ? payload.displayName
          : payload.username,
      provider: payload.provider === "entra" ? "entra" : "local",
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(user: SessionUser): Promise<void> {
  const token = await createSessionToken(user);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return readSessionToken(token);
}

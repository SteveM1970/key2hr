import { NextResponse } from "next/server";
import { getSessionUser } from "./session";
import type { SessionUser } from "./types";
import type { Role } from "@/lib/roles";

export async function requireSessionUser(): Promise<
  { ok: true; user: SessionUser } | { ok: false; response: NextResponse }
> {
  const user = await getSessionUser();
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized." }, { status: 401 }),
    };
  }
  return { ok: true, user };
}

export async function requireRole(
  role: Role,
): Promise<
  { ok: true; user: SessionUser } | { ok: false; response: NextResponse }
> {
  const session = await requireSessionUser();
  if (!session.ok) return session;
  if (session.user.role !== role) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden." }, { status: 403 }),
    };
  }
  return session;
}

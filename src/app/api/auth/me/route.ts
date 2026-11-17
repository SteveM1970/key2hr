import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { ensureBootstrapped } from "@/lib/db/bootstrap";

export const runtime = "nodejs";

export async function GET() {
  await ensureBootstrapped();
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  return NextResponse.json({ user });
}

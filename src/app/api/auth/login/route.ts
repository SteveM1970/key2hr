import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateWithPassword, setSessionCookie } from "@/lib/auth";
import { ensureBootstrapped } from "@/lib/db/bootstrap";
import { roleHomePath } from "@/lib/roles";

export const runtime = "nodejs";

const bodySchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  await ensureBootstrapped();

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Username and password are required." },
      { status: 400 },
    );
  }

  const result = await authenticateWithPassword(parsed.data);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }

  await setSessionCookie(result.user);

  return NextResponse.json({
    user: result.user,
    redirectTo: roleHomePath(result.user.role),
  });
}

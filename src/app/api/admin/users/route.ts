import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth/require-session";
import { ensureBootstrapped } from "@/lib/db/bootstrap";
import { ROLES } from "@/lib/roles";
import { createLocalUser, listUsersForAdmin } from "@/lib/users/create-user";

export const runtime = "nodejs";

const createSchema = z.object({
  username: z.string().min(2),
  password: z.string().min(8),
  role: z.enum(ROLES),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
});

export async function GET() {
  await ensureBootstrapped();
  const auth = await requireRole("admin");
  if (!auth.ok) return auth.response;

  const users = await listUsersForAdmin();
  return NextResponse.json({ users });
}

export async function POST(request: Request) {
  await ensureBootstrapped();
  const auth = await requireRole("admin");
  if (!auth.ok) return auth.response;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Username, password (8+), role, and name are required." },
      { status: 400 },
    );
  }

  const result = await createLocalUser({
    username: parsed.data.username,
    password: parsed.data.password,
    role: parsed.data.role,
    firstName: parsed.data.firstName,
    lastName: parsed.data.lastName,
    email: parsed.data.email || null,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ user: result.user }, { status: 201 });
}

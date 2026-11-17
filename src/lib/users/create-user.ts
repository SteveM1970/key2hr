import { asc, eq } from "drizzle-orm";
import { hashPassword } from "@/lib/auth/passwords";
import { getDb } from "@/lib/db";
import { employees, users } from "@/lib/db/schema";
import type { Role } from "@/lib/roles";
import { isRole } from "@/lib/roles";

export type CreateUserInput = {
  username: string;
  password: string;
  role: Role;
  firstName: string;
  lastName: string;
  email?: string | null;
};

export type CreateUserResult =
  | {
      ok: true;
      user: {
        id: string;
        username: string;
        role: Role;
        employeeId: string;
        active: boolean;
        displayName: string;
      };
    }
  | { ok: false; error: string };

function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

function newId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
}

export async function createLocalUser(
  input: CreateUserInput,
): Promise<CreateUserResult> {
  const username = normalizeUsername(input.username);
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const password = input.password;
  const email = input.email?.trim() || null;

  if (!username || username.length < 2) {
    return { ok: false, error: "Username must be at least 2 characters." };
  }
  if (!/^[a-z0-9._-]+$/.test(username)) {
    return {
      ok: false,
      error: "Username may only use letters, numbers, dots, underscores, or hyphens.",
    };
  }
  if (!firstName || !lastName) {
    return { ok: false, error: "First and last name are required." };
  }
  if (!password || password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }
  if (!isRole(input.role)) {
    return { ok: false, error: "Invalid role." };
  }

  const db = await getDb();
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (existing[0]) {
    return { ok: false, error: "That username is already taken." };
  }

  const employeeId = newId("emp");
  const userId = newId("usr");
  const staffNumber = `E${Date.now().toString().slice(-8)}`;
  const passwordHash = await hashPassword(password);

  await db.insert(employees).values({
    id: employeeId,
    staffNumber,
    firstName,
    lastName,
    email,
    active: true,
  });

  await db.insert(users).values({
    id: userId,
    username,
    passwordHash,
    role: input.role,
    employeeId,
    provider: "local",
    providerSubject: `local:${username}`,
    active: true,
  });

  return {
    ok: true,
    user: {
      id: userId,
      username,
      role: input.role,
      employeeId,
      active: true,
      displayName: `${firstName} ${lastName}`,
    },
  };
}

export async function listUsersForAdmin() {
  const db = await getDb();
  const rows = await db
    .select({
      id: users.id,
      username: users.username,
      role: users.role,
      active: users.active,
      employeeId: users.employeeId,
      firstName: employees.firstName,
      lastName: employees.lastName,
      createdAt: users.createdAt,
    })
    .from(users)
    .leftJoin(employees, eq(users.employeeId, employees.id))
    .orderBy(asc(users.username));

  return rows.map((row) => ({
    id: row.id,
    username: row.username,
    role: row.role,
    active: row.active,
    employeeId: row.employeeId,
    displayName:
      row.firstName && row.lastName
        ? `${row.firstName} ${row.lastName}`
        : row.username,
    createdAt: row.createdAt,
  }));
}

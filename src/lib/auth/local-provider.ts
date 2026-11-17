import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { ensureSchema } from "@/lib/db/migrate";
import { employees, users } from "@/lib/db/schema";
import { isRole } from "@/lib/roles";
import { verifyPassword } from "./passwords";
import type { AuthProvider, AuthResult, Credentials } from "./types";

export const localAuthProvider: AuthProvider = {
  id: "local",

  async authenticate(credentials: Credentials): Promise<AuthResult> {
    ensureSchema();
    const db = getDb();
    const username = credentials.username.trim().toLowerCase();

    const row = db
      .select({
        id: users.id,
        username: users.username,
        passwordHash: users.passwordHash,
        role: users.role,
        employeeId: users.employeeId,
        provider: users.provider,
        active: users.active,
        firstName: employees.firstName,
        lastName: employees.lastName,
      })
      .from(users)
      .leftJoin(employees, eq(users.employeeId, employees.id))
      .where(eq(users.username, username))
      .get();

    if (!row || !row.active) {
      return { ok: false, error: "Invalid username or password." };
    }

    if (row.provider !== "local" || !row.passwordHash) {
      return {
        ok: false,
        error: "This account uses a different sign-in method.",
      };
    }

    const valid = await verifyPassword(credentials.password, row.passwordHash);
    if (!valid) {
      return { ok: false, error: "Invalid username or password." };
    }

    if (!isRole(row.role)) {
      return { ok: false, error: "Account role is invalid." };
    }

    const displayName =
      row.firstName && row.lastName
        ? `${row.firstName} ${row.lastName}`
        : row.username;

    return {
      ok: true,
      user: {
        id: row.id,
        username: row.username,
        role: row.role,
        employeeId: row.employeeId,
        displayName,
        provider: "local",
      },
    };
  },
};

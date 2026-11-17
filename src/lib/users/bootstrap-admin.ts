import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { createLocalUser } from "./create-user";

/**
 * Creates a one-time bootstrap admin from env/secrets when missing.
 * Never overwrites an existing account. Passwords must come from env —
 * never hardcode them in source.
 *
 * KEY2HR_BOOTSTRAP_ADMIN_USERNAME
 * KEY2HR_BOOTSTRAP_ADMIN_PASSWORD
 * Optional: KEY2HR_BOOTSTRAP_ADMIN_FIRST_NAME / KEY2HR_BOOTSTRAP_ADMIN_LAST_NAME
 */
export async function ensureBootstrapAdmin(): Promise<void> {
  const username = process.env.KEY2HR_BOOTSTRAP_ADMIN_USERNAME?.trim();
  const password = process.env.KEY2HR_BOOTSTRAP_ADMIN_PASSWORD?.trim();
  if (!username || !password) return;

  const db = await getDb();
  const normalized = username.toLowerCase();
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, normalized))
    .limit(1);

  if (existing[0]) return;

  const firstName =
    process.env.KEY2HR_BOOTSTRAP_ADMIN_FIRST_NAME?.trim() || "Steve";
  const lastName =
    process.env.KEY2HR_BOOTSTRAP_ADMIN_LAST_NAME?.trim() || "Morris";

  const result = await createLocalUser({
    username,
    password,
    role: "admin",
    firstName,
    lastName,
  });

  if (!result.ok) {
    console.error("Bootstrap admin was not created:", result.error);
  }
}

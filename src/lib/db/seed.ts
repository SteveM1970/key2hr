import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/auth/passwords";
import { getDb } from "./index";
import { ensureSchema } from "./migrate";
import {
  companies,
  departments,
  employeeAssignments,
  employees,
  subDepartments,
  users,
} from "./schema";

/** Demo personas (no passwords in source — set via env / Cursor secrets). */
export const DEMO_USERS = [
  {
    username: "admin",
    role: "admin" as const,
    staffNumber: "E1001",
    firstName: "Ava",
    lastName: "Admin",
  },
  {
    username: "manager",
    role: "manager" as const,
    staffNumber: "E2001",
    firstName: "Morgan",
    lastName: "Manager",
  },
  {
    username: "staff",
    role: "staff" as const,
    staffNumber: "E3001",
    firstName: "Sam",
    lastName: "Staff",
  },
] as const;

function id(prefix: string, value: string): string {
  return `${prefix}_${value}`;
}

/**
 * Password for a demo user comes only from environment (never hardcoded).
 * Prefer role-specific `KEY2HR_DEMO_ADMIN_PASSWORD` (etc.), else shared
 * `KEY2HR_DEMO_PASSWORD`. Hosted: set via Cursor app secrets.
 */
function demoPasswordFor(role: "admin" | "manager" | "staff"): string | null {
  const specific = process.env[`KEY2HR_DEMO_${role.toUpperCase()}_PASSWORD`]?.trim();
  if (specific) return specific;
  const shared = process.env.KEY2HR_DEMO_PASSWORD?.trim();
  return shared || null;
}

export async function seedDemoData(): Promise<void> {
  await ensureSchema();
  const db = await getDb();

  const companyId = id("co", "demo");
  const deptId = id("dept", "people");
  const subDeptId = id("sub", "ops");
  const managerEmployeeId = id("emp", "E2001");

  await db
    .insert(companies)
    .values({
      id: companyId,
      reference: "CO-DEMO",
      name: "Key2HR Demo Company",
      active: true,
    })
    .onConflictDoNothing();

  await db
    .insert(departments)
    .values({
      id: deptId,
      companyId,
      reference: "DEPT-PEOPLE",
      name: "People Operations",
      active: true,
    })
    .onConflictDoNothing();

  await db
    .insert(subDepartments)
    .values({
      id: subDeptId,
      departmentId: deptId,
      reference: "SUB-OPS",
      name: "Operations",
      active: true,
    })
    .onConflictDoNothing();

  for (const demo of DEMO_USERS) {
    const employeeId = id("emp", demo.staffNumber);
    await db
      .insert(employees)
      .values({
        id: employeeId,
        staffNumber: demo.staffNumber,
        firstName: demo.firstName,
        lastName: demo.lastName,
        email: `${demo.username}@demo.key2hr.local`,
        companyId,
        departmentId: deptId,
        subDepartmentId: subDeptId,
        managerEmployeeId: demo.role === "staff" ? managerEmployeeId : null,
        active: true,
      })
      .onConflictDoNothing();

    await db
      .insert(employeeAssignments)
      .values({
        id: id("asg", demo.staffNumber),
        employeeId,
        companyId,
        departmentId: deptId,
        subDepartmentId: subDeptId,
        effectiveFrom: "2026-01-01",
        note: "Initial demo assignment",
      })
      .onConflictDoNothing();

    const existing = await db
      .select({ id: users.id, passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.username, demo.username))
      .limit(1);

    // Never overwrite an existing password hash (owner may have changed it).
    if (existing[0]) {
      await db
        .update(users)
        .set({
          role: demo.role,
          employeeId,
          provider: "local",
          providerSubject: `local:${demo.username}`,
          active: true,
        })
        .where(eq(users.id, existing[0].id));
      continue;
    }

    const plain = demoPasswordFor(demo.role);
    const passwordHash = plain ? await hashPassword(plain) : null;

    await db.insert(users).values({
      id: id("usr", demo.username),
      username: demo.username,
      passwordHash,
      role: demo.role,
      employeeId,
      provider: "local",
      providerSubject: `local:${demo.username}`,
      active: true,
    });
  }
}

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

export const DEMO_CREDENTIALS = [
  {
    username: "admin",
    password: "DemoAdmin!",
    role: "admin" as const,
    staffNumber: "E1001",
    firstName: "Ava",
    lastName: "Admin",
  },
  {
    username: "manager",
    password: "DemoManager!",
    role: "manager" as const,
    staffNumber: "E2001",
    firstName: "Morgan",
    lastName: "Manager",
  },
  {
    username: "staff",
    password: "DemoStaff!",
    role: "staff" as const,
    staffNumber: "E3001",
    firstName: "Sam",
    lastName: "Staff",
  },
] as const;

function id(prefix: string, value: string): string {
  return `${prefix}_${value}`;
}

export async function seedDemoData(): Promise<void> {
  ensureSchema();
  const db = getDb();

  const companyId = id("co", "demo");
  const deptId = id("dept", "people");
  const subDeptId = id("sub", "ops");
  const managerEmployeeId = id("emp", "E2001");

  db.insert(companies)
    .values({
      id: companyId,
      reference: "CO-DEMO",
      name: "Key2HR Demo Company",
      active: true,
    })
    .onConflictDoNothing()
    .run();

  db.insert(departments)
    .values({
      id: deptId,
      companyId,
      reference: "DEPT-PEOPLE",
      name: "People Operations",
      active: true,
    })
    .onConflictDoNothing()
    .run();

  db.insert(subDepartments)
    .values({
      id: subDeptId,
      departmentId: deptId,
      reference: "SUB-OPS",
      name: "Operations",
      active: true,
    })
    .onConflictDoNothing()
    .run();

  for (const demo of DEMO_CREDENTIALS) {
    const employeeId = id("emp", demo.staffNumber);
    db.insert(employees)
      .values({
        id: employeeId,
        staffNumber: demo.staffNumber,
        firstName: demo.firstName,
        lastName: demo.lastName,
        email: `${demo.username}@demo.key2hr.local`,
        companyId,
        departmentId: deptId,
        subDepartmentId: subDeptId,
        managerEmployeeId:
          demo.role === "staff" ? managerEmployeeId : null,
        active: true,
      })
      .onConflictDoNothing()
      .run();

    db.insert(employeeAssignments)
      .values({
        id: id("asg", demo.staffNumber),
        employeeId,
        companyId,
        departmentId: deptId,
        subDepartmentId: subDeptId,
        effectiveFrom: "2026-01-01",
        note: "Initial demo assignment",
      })
      .onConflictDoNothing()
      .run();

    const passwordHash = await hashPassword(demo.password);
    const existing = db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, demo.username))
      .get();

    if (existing) {
      db.update(users)
        .set({
          passwordHash,
          role: demo.role,
          employeeId,
          provider: "local",
          providerSubject: `local:${demo.username}`,
          active: true,
        })
        .where(eq(users.id, existing.id))
        .run();
    } else {
      db.insert(users)
        .values({
          id: id("usr", demo.username),
          username: demo.username,
          passwordHash,
          role: demo.role,
          employeeId,
          provider: "local",
          providerSubject: `local:${demo.username}`,
          active: true,
        })
        .run();
    }
  }
}

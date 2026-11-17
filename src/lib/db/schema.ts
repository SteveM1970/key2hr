import { relations, sql } from "drizzle-orm";
import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

/**
 * Relational foundation for Key2HR.
 *
 * Local/dev uses SQLite via better-sqlite3. Schema types stay portable so the
 * same model can move to Postgres / Azure SQL for Power BI without rewriting
 * domain tables. Prefer standard columns (text ids, ISO timestamps, enums as
 * text) over SQLite-only features.
 */

export const companies = sqliteTable(
  "companies",
  {
    id: text("id").primaryKey(),
    reference: text("reference").notNull(),
    name: text("name").notNull(),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
    disestablishedAt: text("disestablished_at"),
  },
  (table) => [uniqueIndex("companies_reference_uidx").on(table.reference)],
);

export const departments = sqliteTable(
  "departments",
  {
    id: text("id").primaryKey(),
    companyId: text("company_id")
      .notNull()
      .references(() => companies.id),
    reference: text("reference").notNull(),
    name: text("name").notNull(),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
    disestablishedAt: text("disestablished_at"),
  },
  (table) => [uniqueIndex("departments_reference_uidx").on(table.reference)],
);

export const subDepartments = sqliteTable(
  "sub_departments",
  {
    id: text("id").primaryKey(),
    departmentId: text("department_id")
      .notNull()
      .references(() => departments.id),
    reference: text("reference").notNull(),
    name: text("name").notNull(),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
    disestablishedAt: text("disestablished_at"),
  },
  (table) => [
    uniqueIndex("sub_departments_reference_uidx").on(table.reference),
  ],
);

export const employees = sqliteTable(
  "employees",
  {
    id: text("id").primaryKey(),
    staffNumber: text("staff_number").notNull(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text("email"),
    companyId: text("company_id").references(() => companies.id),
    departmentId: text("department_id").references(() => departments.id),
    subDepartmentId: text("sub_department_id").references(
      () => subDepartments.id,
    ),
    managerEmployeeId: text("manager_employee_id"),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [
    uniqueIndex("employees_staff_number_uidx").on(table.staffNumber),
  ],
);

/**
 * Auth identities are separate from personnel so Entra/AD SSO can attach to the
 * same employee without rewriting role or org tables.
 * provider: "local" now; later "entra" / "oidc".
 */
export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    username: text("username").notNull(),
    passwordHash: text("password_hash"),
    role: text("role", { enum: ["admin", "manager", "staff"] }).notNull(),
    employeeId: text("employee_id").references(() => employees.id),
    provider: text("provider").notNull().default("local"),
    providerSubject: text("provider_subject"),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [
    uniqueIndex("users_username_uidx").on(table.username),
    uniqueIndex("users_provider_subject_uidx").on(
      table.provider,
      table.providerSubject,
    ),
  ],
);

/** Assignment history stub — personnel moves will append rows here later. */
export const employeeAssignments = sqliteTable("employee_assignments", {
  id: text("id").primaryKey(),
  employeeId: text("employee_id")
    .notNull()
    .references(() => employees.id),
  companyId: text("company_id").references(() => companies.id),
  departmentId: text("department_id").references(() => departments.id),
  subDepartmentId: text("sub_department_id").references(
    () => subDepartments.id,
  ),
  effectiveFrom: text("effective_from").notNull(),
  effectiveTo: text("effective_to"),
  note: text("note"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const companiesRelations = relations(companies, ({ many }) => ({
  departments: many(departments),
  employees: many(employees),
}));

export const departmentsRelations = relations(departments, ({ one, many }) => ({
  company: one(companies, {
    fields: [departments.companyId],
    references: [companies.id],
  }),
  subDepartments: many(subDepartments),
  employees: many(employees),
}));

export const subDepartmentsRelations = relations(
  subDepartments,
  ({ one, many }) => ({
    department: one(departments, {
      fields: [subDepartments.departmentId],
      references: [departments.id],
    }),
    employees: many(employees),
  }),
);

export const employeesRelations = relations(employees, ({ one, many }) => ({
  company: one(companies, {
    fields: [employees.companyId],
    references: [companies.id],
  }),
  department: one(departments, {
    fields: [employees.departmentId],
    references: [departments.id],
  }),
  subDepartment: one(subDepartments, {
    fields: [employees.subDepartmentId],
    references: [subDepartments.id],
  }),
  manager: one(employees, {
    fields: [employees.managerEmployeeId],
    references: [employees.id],
    relationName: "employee_manager",
  }),
  directReports: many(employees, { relationName: "employee_manager" }),
  user: one(users, {
    fields: [employees.id],
    references: [users.employeeId],
  }),
  assignments: many(employeeAssignments),
}));

export const usersRelations = relations(users, ({ one }) => ({
  employee: one(employees, {
    fields: [users.employeeId],
    references: [employees.id],
  }),
}));

export const employeeAssignmentsRelations = relations(
  employeeAssignments,
  ({ one }) => ({
    employee: one(employees, {
      fields: [employeeAssignments.employeeId],
      references: [employees.id],
    }),
  }),
);

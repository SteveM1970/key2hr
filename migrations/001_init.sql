-- Key2HR initial schema (Postgres / PGlite)

CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY NOT NULL,
  reference TEXT NOT NULL,
  name TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TEXT NOT NULL DEFAULT (now()::text),
  disestablished_at TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS companies_reference_uidx ON companies(reference);

CREATE TABLE IF NOT EXISTS departments (
  id TEXT PRIMARY KEY NOT NULL,
  company_id TEXT NOT NULL REFERENCES companies(id),
  reference TEXT NOT NULL,
  name TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TEXT NOT NULL DEFAULT (now()::text),
  disestablished_at TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS departments_reference_uidx ON departments(reference);

CREATE TABLE IF NOT EXISTS sub_departments (
  id TEXT PRIMARY KEY NOT NULL,
  department_id TEXT NOT NULL REFERENCES departments(id),
  reference TEXT NOT NULL,
  name TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TEXT NOT NULL DEFAULT (now()::text),
  disestablished_at TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS sub_departments_reference_uidx ON sub_departments(reference);

CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY NOT NULL,
  staff_number TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  company_id TEXT REFERENCES companies(id),
  department_id TEXT REFERENCES departments(id),
  sub_department_id TEXT REFERENCES sub_departments(id),
  manager_employee_id TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TEXT NOT NULL DEFAULT (now()::text)
);
CREATE UNIQUE INDEX IF NOT EXISTS employees_staff_number_uidx ON employees(staff_number);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY NOT NULL,
  username TEXT NOT NULL,
  password_hash TEXT,
  role TEXT NOT NULL,
  employee_id TEXT REFERENCES employees(id),
  provider TEXT NOT NULL DEFAULT 'local',
  provider_subject TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TEXT NOT NULL DEFAULT (now()::text)
);
CREATE UNIQUE INDEX IF NOT EXISTS users_username_uidx ON users(username);
CREATE UNIQUE INDEX IF NOT EXISTS users_provider_subject_uidx ON users(provider, provider_subject);

CREATE TABLE IF NOT EXISTS employee_assignments (
  id TEXT PRIMARY KEY NOT NULL,
  employee_id TEXT NOT NULL REFERENCES employees(id),
  company_id TEXT REFERENCES companies(id),
  department_id TEXT REFERENCES departments(id),
  sub_department_id TEXT REFERENCES sub_departments(id),
  effective_from TEXT NOT NULL,
  effective_to TEXT,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT (now()::text)
);

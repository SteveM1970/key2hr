# Key2HR

Role-based HR web app foundation: local username/password auth, Admin / Manager / Staff shells, and a relational data model ready to grow into org structure, personnel, leave workflows, and Excel/Power BI.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind CSS
- Drizzle ORM + SQLite (`better-sqlite3`) for local/dev
- Session cookies (JWT via `jose`) behind a clean `AuthProvider` boundary for later Entra/AD SSO
- Portable SQL schema aimed at a BI-friendly store (Postgres / Azure SQL path documented below)

## Quick start

```bash
npm install
cp .env.example .env.local
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Schema + demo users also bootstrap automatically on first authenticated request if you skip `db:seed`.

## Demo credentials

| Username | Password | Role |
| --- | --- | --- |
| `admin` | `DemoAdmin!` | Admin |
| `manager` | `DemoManager!` | Manager |
| `staff` | `DemoStaff!` | Staff |

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local app with Turbopack |
| `npm run build` / `npm start` | Production build & serve |
| `npm run db:seed` | Ensure schema + demo users |
| `npm run db:studio` | Drizzle Studio against local SQLite |
| `npm run lint` | ESLint |

## Auth boundary

- `src/lib/auth/types.ts` — `AuthProvider` contract
- `src/lib/auth/local-provider.ts` — username/password today
- `src/lib/auth/session.ts` — signed HTTP-only session cookie carrying `role` + `employeeId`
- Middleware + role home routes gate Admin / Manager / Staff UI

Add Entra/AD by implementing another `AuthProvider` and composing it in `src/lib/auth/index.ts` without changing personnel or role tables.

## Data model foundation

Tables in `src/lib/db/schema.ts`:

- `companies`, `departments`, `sub_departments` (unique references; disestablish fields)
- `employees` (unique staff number, manager link, org assignment)
- `employee_assignments` (move/history stub)
- `users` (auth identity linked to employee; `provider` / `provider_subject` for SSO)

Default DB file: `data/key2hr.sqlite` (gitignored).

### Path to Postgres / Azure SQL

1. Keep the same Drizzle schema shapes (text IDs, ISO timestamps, enum-as-text).
2. Point `DATABASE_URL` at Postgres.
3. Swap `drizzle-orm/better-sqlite3` for `drizzle-orm/node-postgres` (or equivalent) in `src/lib/db/index.ts`.
4. Generate SQL migrations with `drizzle-kit` for the target dialect.

Power BI can then connect to the SQL store or a read-only view/export of these tables.

## Out of scope in this foundation PR

Full org UI, personnel CRUD, leave workflow, and Excel export — navigation placeholders only.

## License

Private / TBD.

# Key2HR

Role-based HR web app foundation: local username/password auth, Admin / Manager / Staff shells, and a relational data model ready to grow into org structure, personnel, leave workflows, and Excel/Power BI.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind CSS
- Drizzle ORM + **Postgres** when `DATABASE_URL` is set (Cursor publish-app), otherwise **PGlite** in-memory for local/dev
- Session cookies (JWT via `jose`) behind a clean `AuthProvider` boundary for later Entra/AD SSO
- SQL migrations in `migrations/` applied at build (`scripts/migrate.mjs`) when hosted

## Quick start

```bash
npm install
cp .env.example .env.local
# Leave DATABASE_URL unset for local PGlite
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Schema + demo users also bootstrap automatically on first request if you skip `db:seed`.

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
| `npm run build` / `npm start` | Production build; migrate runs after build when `DATABASE_URL` is Postgres |
| `npm run db:seed` | Ensure schema + demo users (local PGlite or Postgres) |
| `npm run db:migrate` | Apply `migrations/*.sql` when `DATABASE_URL` is set |
| `npm run db:studio` | Drizzle Studio (needs a Postgres `DATABASE_URL`) |
| `npm run lint` | ESLint |

## Database: local vs hosted

| Mode | When | Driver |
| --- | --- | --- |
| Local/dev | `DATABASE_URL` unset (or not `postgres://`) | `@electric-sql/pglite` in-memory; migrations applied on first open |
| Hosted | `DATABASE_URL` set by Cursor publish-app | `pg` + `drizzle-orm/node-postgres`; `migrations/` applied in `npm run build` via `scripts/migrate.mjs` |

`cursor-app.json` declares `{ "database": "postgres" }` so publish-app provisions Postgres and injects `DATABASE_URL`. Demo users are seeded on first boot via `ensureBootstrapped` (schema + seed), so hosted cold starts get login accounts even if only DDL ran at build.

If this VM already has a foreign `DATABASE_URL`, run with `env -u DATABASE_URL npm run dev` so local uses PGlite.

## Auth secret

- `AUTH_SECRET` signs session cookies.
- **Local/dev:** if unset, a non-secret demo default is used (`key2hr-dev-secret-change-me-before-prod`).
- **Hosted/production:** set `AUTH_SECRET` via Cursor app secrets (never commit a real value).

## Auth boundary

- `src/lib/auth/types.ts` — `AuthProvider` contract
- `src/lib/auth/local-provider.ts` — username/password today
- `src/lib/auth/session.ts` — signed HTTP-only session cookie carrying `role` + `employeeId`
- Middleware + role home routes gate Admin / Manager / Staff UI

Add Entra/AD by implementing another `AuthProvider` and composing it in `src/lib/auth/index.ts` without changing personnel or role tables.

## Data model foundation

Tables in `src/lib/db/schema.ts` (Postgres dialect):

- `companies`, `departments`, `sub_departments` (unique references; disestablish fields)
- `employees` (unique staff number, manager link, org assignment)
- `employee_assignments` (move/history stub)
- `users` (auth identity linked to employee; `provider` / `provider_subject` for SSO)

DDL lives in `migrations/001_init.sql`.

## Out of scope in this foundation

Full org UI, personnel CRUD, leave workflow, and Excel export — navigation placeholders only.

## License

Private / TBD.

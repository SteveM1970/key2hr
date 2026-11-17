import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";

function isPostgresUrl(url: string): boolean {
  return url.startsWith("postgres://") || url.startsWith("postgresql://");
}

const usePostgres = databaseUrl !== "" && isPostgresUrl(databaseUrl);

type PgDb = ReturnType<typeof drizzlePg<typeof schema>>;
type LocalDb = ReturnType<typeof drizzlePglite<typeof schema>>;
export type Db = PgDb | LocalDb;

const globalForDb = globalThis as unknown as {
  key2hrPgPool?: pg.Pool;
  key2hrPgDb?: PgDb;
  key2hrLocalDb?: Promise<LocalDb>;
};

async function applyPendingMigrations(client: PGlite): Promise<void> {
  await client.exec(`
    create table if not exists schema_migrations (
      name text primary key,
      applied_at timestamptz not null default now()
    )
  `);

  const done = new Set(
    (
      await client.query<{ name: string }>("select name from schema_migrations")
    ).rows.map((r) => r.name),
  );

  const migrationsDir = path.join(process.cwd(), "migrations");
  const files = (await readdir(migrationsDir).catch(() => []))
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    if (done.has(file)) continue;
    await client.exec(await readFile(path.join(migrationsDir, file), "utf8"));
    await client.query("insert into schema_migrations (name) values ($1)", [
      file,
    ]);
  }
}

async function startLocal(): Promise<LocalDb> {
  const client = new PGlite();
  await applyPendingMigrations(client);
  return drizzlePglite(client, { schema });
}

function getPgPool(): pg.Pool {
  if (!globalForDb.key2hrPgPool) {
    globalForDb.key2hrPgPool = new pg.Pool({
      connectionString: databaseUrl,
      max: 5,
    });
  }
  return globalForDb.key2hrPgPool;
}

/**
 * Returns a Drizzle client.
 * - DATABASE_URL=postgres… → node-postgres Pool (hosted publish-app)
 * - otherwise → in-memory PGlite (local/dev; no cloud Postgres needed)
 */
export async function getDb(): Promise<Db> {
  if (usePostgres) {
    if (!globalForDb.key2hrPgDb) {
      globalForDb.key2hrPgDb = drizzlePg(getPgPool(), { schema });
    }
    return globalForDb.key2hrPgDb;
  }

  if (!globalForDb.key2hrLocalDb) {
    globalForDb.key2hrLocalDb = startLocal().catch((error: unknown) => {
      globalForDb.key2hrLocalDb = undefined;
      throw error;
    });
  }
  return globalForDb.key2hrLocalDb;
}

export function isHostedPostgres(): boolean {
  return usePostgres;
}

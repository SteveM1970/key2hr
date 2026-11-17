import { getDb, isHostedPostgres } from "./index";

/**
 * Ensures schema exists before reads/writes.
 *
 * - Local (PGlite): `getDb()` applies `migrations/*.sql` on first open.
 * - Hosted (Postgres): `npm run build` runs `scripts/migrate.mjs` when
 *   DATABASE_URL is set; this is a no-op safety await on the pool.
 */
export async function ensureSchema(): Promise<void> {
  await getDb();
  if (isHostedPostgres()) {
    // Build-time migrate.mjs owns DDL on hosted Postgres.
    return;
  }
}

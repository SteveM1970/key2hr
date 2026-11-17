import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  key2hrSqlite?: Database.Database;
};

function resolveSqlitePath(): string {
  const configured = process.env.DATABASE_URL ?? "file:./data/key2hr.sqlite";
  if (configured.startsWith("postgres://") || configured.startsWith("postgresql://")) {
    throw new Error(
      "Postgres DATABASE_URL is reserved for a later driver switch. Use file:./data/key2hr.sqlite for local SQLite.",
    );
  }
  if (configured.startsWith("file:")) {
    return path.resolve(process.cwd(), configured.slice("file:".length));
  }
  return path.resolve(process.cwd(), configured);
}

function createConnection(): Database.Database {
  const sqlitePath = resolveSqlitePath();
  fs.mkdirSync(path.dirname(sqlitePath), { recursive: true });
  const sqlite = new Database(sqlitePath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  return sqlite;
}

export function getSqlite(): Database.Database {
  if (!globalForDb.key2hrSqlite) {
    globalForDb.key2hrSqlite = createConnection();
  }
  return globalForDb.key2hrSqlite;
}

export function getDb() {
  return drizzle(getSqlite(), { schema });
}

export type Db = ReturnType<typeof getDb>;

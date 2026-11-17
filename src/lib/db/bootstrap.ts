import { ensureSchema } from "./migrate";
import { seedDemoData } from "./seed";

const globalForBootstrap = globalThis as unknown as {
  key2hrBootstrapped?: Promise<void>;
};

async function bootstrapOnce(): Promise<void> {
  ensureSchema();
  await seedDemoData();
}

/** Ensures schema + demo users exist before auth/UI reads the DB. */
export function ensureBootstrapped(): Promise<void> {
  if (!globalForBootstrap.key2hrBootstrapped) {
    globalForBootstrap.key2hrBootstrapped = bootstrapOnce();
  }
  return globalForBootstrap.key2hrBootstrapped;
}

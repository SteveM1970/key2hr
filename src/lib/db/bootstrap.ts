import { ensureSchema } from "./migrate";
import { seedDemoData } from "./seed";

const globalForBootstrap = globalThis as unknown as {
  key2hrBootstrapped?: Promise<void>;
};

async function bootstrapOnce(): Promise<void> {
  await ensureSchema();
  await seedDemoData();
}

/**
 * Ensures schema + demo org/users exist before auth/UI reads the DB.
 * Password hashes are set only when KEY2HR_DEMO_* env/secrets are present,
 * and existing hashes are never overwritten.
 */
export function ensureBootstrapped(): Promise<void> {
  if (!globalForBootstrap.key2hrBootstrapped) {
    globalForBootstrap.key2hrBootstrapped = bootstrapOnce();
  }
  return globalForBootstrap.key2hrBootstrapped;
}

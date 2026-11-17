import { DEMO_CREDENTIALS, seedDemoData } from "../src/lib/db/seed";

async function main() {
  await seedDemoData();
  console.log("Seeded Key2HR demo data.");
  console.log("Demo logins:");
  for (const demo of DEMO_CREDENTIALS) {
    console.log(`  ${demo.username} / ${demo.password} (${demo.role})`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

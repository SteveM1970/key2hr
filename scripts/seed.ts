import { DEMO_USERS, seedDemoData } from "../src/lib/db/seed";

async function main() {
  await seedDemoData();
  console.log("Seeded Key2HR org + demo users.");
  console.log(
    "Passwords are set only when KEY2HR_DEMO_PASSWORD (or KEY2HR_DEMO_<ROLE>_PASSWORD) is in the environment.",
  );
  console.log("Demo usernames:");
  for (const demo of DEMO_USERS) {
    console.log(`  ${demo.username} (${demo.role})`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

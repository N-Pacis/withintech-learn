import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

import { adminSeed } from "../src/routes/auth/auth.service";
import { backfillScores } from "../src/scripts/backfill-scores";
import { prisma } from "../src/db/prisma";
import redis from "../src/db/redis";

async function main() {
  const result = await adminSeed();
  if (result.skipped) {
    console.log(`Admin already exists (${result.email}) — skipping.`);
  } else {
    console.log(`Seeded admin account for ${result.email}.`);
  }

  await backfillScores();
}

main()
  .catch((err: unknown) => {
    console.error("Seed failed:", err instanceof Error ? err.message : err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await redis.quit();
  });

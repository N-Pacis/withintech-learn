import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
import { adminSeed } from '../src/routes/auth/auth.service';
import { prisma } from '../src/db/prisma';

async function main() {
  const result = await adminSeed();
  if (result.skipped) {
    console.log(`Admin already exists (${result.email}) — skipping.`);
    return;
  }
  console.log('Admin seeded successfully.');
  console.log(`Email:    ${result.email}`);
  console.log(`Password: ${result.password}`);
  console.log('Store this password — it will not be shown again.');
}

main()
  .catch((err: unknown) => {
    console.error('Seed failed:', err instanceof Error ? err.message : err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

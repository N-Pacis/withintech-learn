import { prisma } from "../db/prisma";
import { recalculateUserScore } from "../utils/scoring";

async function main() {
  const students = await prisma.user.findMany({
    where: { role: { name: "student" } },
    select: { id: true, firstName: true, lastName: true },
  });

  console.log(`Backfilling scores for ${students.length} students…`);

  for (const s of students) {
    await recalculateUserScore(s.id);
    console.log(`  ✓ ${s.firstName} ${s.lastName}`);
  }

  console.log("Done.");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});

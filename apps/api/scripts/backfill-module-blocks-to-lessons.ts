import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

import { prisma } from "../src/db/prisma";
import type { BlockType } from "@prisma/client";

// One-time migration: wraps any Module's direct ModuleBlock content into a
// new Lesson, so no content is lost when the ModuleBlock model is dropped.
// Must run against staging/production BEFORE `prisma migrate deploy` applies
// the migration that drops the ModuleBlock table (see
// prompts/enforce-lesson-hierarchy.md for the full sequencing).
//
// Reads ModuleBlock via raw SQL rather than the Prisma Client's generated
// model methods: this script ships in the same change as the schema edit
// that removes the ModuleBlock model, so the generated client no longer
// knows about it — raw SQL only depends on the table still existing in the
// database, which it will until the later migration runs.

interface ModuleRow {
  id: string;
  title: string;
}

interface ModuleBlockRow {
  id: string;
  type: BlockType;
  content: string | null;
  storageKey: string | null;
  caption: string | null;
  language: string | null;
  linkedGroupId: string | null;
  playgroundData: unknown;
  orderIndex: number;
  createdAt: Date;
}

async function main() {
  const modules = await prisma.$queryRaw<ModuleRow[]>`
    SELECT DISTINCT m.id, m.title
    FROM "Module" m
    JOIN "ModuleBlock" mb ON mb."moduleId" = m.id
  `;

  if (modules.length === 0) {
    console.log("No modules with direct ModuleBlock content found. Nothing to do.");
    return;
  }

  for (const mod of modules) {
    const blocks = await prisma.$queryRaw<ModuleBlockRow[]>`
      SELECT id, type, content, "storageKey", caption, language,
             "linkedGroupId", "playgroundData", "orderIndex", "createdAt"
      FROM "ModuleBlock"
      WHERE "moduleId" = ${mod.id}
      ORDER BY "orderIndex" ASC
    `;

    const existingLessons = await prisma.lesson.findMany({
      where: { moduleId: mod.id },
      orderBy: { orderIndex: "asc" },
    });

    await prisma.$transaction(async (tx) => {
      // Phase 1: shift existing lessons to temp negative indices to avoid
      // colliding with the @@unique([moduleId, orderIndex]) constraint.
      for (let i = 0; i < existingLessons.length; i++) {
        await tx.lesson.update({
          where: { id: existingLessons[i].id },
          data: { orderIndex: -(i + 1) },
        });
      }
      // Phase 2: set final indices, shifted up by 1 to make room at position 1.
      for (const lesson of existingLessons) {
        await tx.lesson.update({
          where: { id: lesson.id },
          data: { orderIndex: lesson.orderIndex + 1 },
        });
      }

      const newLesson = await tx.lesson.create({
        data: { moduleId: mod.id, title: mod.title, orderIndex: 1 },
      });

      for (const block of blocks) {
        await tx.lessonBlock.create({
          data: {
            lessonId: newLesson.id,
            type: block.type,
            content: block.content,
            storageKey: block.storageKey,
            caption: block.caption,
            language: block.language,
            linkedGroupId: block.linkedGroupId,
            playgroundData: block.playgroundData ?? undefined,
            orderIndex: block.orderIndex,
            createdAt: block.createdAt,
          },
        });
      }

      console.log(
        `Module "${mod.title}" (${mod.id}): moved ${blocks.length} block(s) into new lesson "${newLesson.title}" (${newLesson.id}).`,
      );
    });
  }

  console.log(`Done. Migrated ${modules.length} module(s).`);
}

main()
  .catch((err: unknown) => {
    console.error("Backfill failed:", err instanceof Error ? err.message : err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

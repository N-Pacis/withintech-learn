import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

import { prisma } from "../../src/db/prisma";
import { invalidateCourseCache } from "../../src/services/course-cache.service";
import redis from "../../src/db/redis";
import { curriculum } from "./curriculum";
import { validateCurriculum } from "./validate";
import type { Quiz } from "./types";

// Rebuilds the Python course content from ./curriculum.
//
// This is a REPLACE, not a merge: every module of the target course is deleted
// first, then the curriculum is written fresh. That keeps the script repeatable
// — running it twice gives the same result — but it also destroys student
// progress, because ModuleProgress, LessonProgress and QuizAttempt all cascade
// from the rows being deleted.
//
// Usage:
//   pnpm --filter @withintech-learn/api seed:python -- --dry-run   (check only)
//   pnpm --filter @withintech-learn/api seed:python -- --force     (apply)

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const FORCE = args.includes("--force");

const createQuiz = async (
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  quiz: Quiz,
  owner: { courseId: string } | { moduleId: string } | { lessonId: string },
) => {
  await tx.quiz.create({
    data: {
      ...owner,
      title: quiz.title,
      passingScore: quiz.passingScore,
      maxAttempts: quiz.maxAttempts,
      questions: {
        create: quiz.questions.map((question, qi) => ({
          text: question.text,
          orderIndex: qi + 1,
          options: {
            create: question.options.map((option, oi) => ({
              text: option,
              isCorrect: question.correct.includes(oi),
              orderIndex: oi + 1,
            })),
          },
        })),
      },
    },
  });
};

async function main() {
  // ── 1. Validate the content before touching anything ──
  const errors = validateCurriculum(curriculum);
  if (errors.length) {
    console.error(`Curriculum has ${errors.length} problem(s):\n`);
    errors.forEach((e) => console.error("  - " + e));
    process.exit(1);
  }

  const moduleCount = curriculum.modules.length;
  const lessonCount = curriculum.modules.reduce(
    (n, m) => n + m.lessons.length,
    0,
  );
  const blockCount = curriculum.modules.reduce(
    (n, m) => n + m.lessons.reduce((k, l) => k + l.blocks.length, 0),
    0,
  );
  const quizzes = [
    ...curriculum.modules.flatMap((m) => [
      ...m.lessons.map((l) => l.quiz),
      m.quiz,
    ]),
    curriculum.finalExam,
  ].filter((q): q is Quiz => !!q);
  const questionCount = quizzes.reduce((n, q) => n + q.questions.length, 0);

  console.log("Curriculum is valid.");
  console.log(
    `  ${moduleCount} modules · ${lessonCount} lessons · ${blockCount} blocks · ` +
      `${quizzes.length} quizzes · ${questionCount} questions`,
  );

  // ── 2. Find the course ──
  const course = await prisma.course.findFirst({
    where: { slug: { contains: curriculum.courseSlugContains } },
    select: { id: true, title: true, slug: true, status: true },
  });
  if (!course) {
    console.error(
      `No course found with a slug containing "${curriculum.courseSlugContains}".`,
    );
    process.exit(1);
  }
  console.log(`\nTarget course: "${course.title}" (${course.slug}) [${course.status}]`);

  // ── 3. Report what the replace would destroy ──
  const [existingModules, existingLessons, attemptCount, progressCount] =
    await Promise.all([
      prisma.module.count({ where: { courseId: course.id } }),
      prisma.lesson.count({ where: { module: { courseId: course.id } } }),
      prisma.quizAttempt.count({
        where: {
          quiz: {
            OR: [
              { courseId: course.id },
              { module: { courseId: course.id } },
              { lesson: { module: { courseId: course.id } } },
            ],
          },
        },
      }),
      prisma.lessonProgress.count({
        where: { lesson: { module: { courseId: course.id } } },
      }),
    ]);

  console.log(
    `Will delete: ${existingModules} modules, ${existingLessons} lessons, ` +
      `${attemptCount} quiz attempts, ${progressCount} lesson-progress rows.`,
  );

  if (DRY_RUN) {
    console.log("\n--dry-run: nothing was written.");
    return;
  }
  if (!FORCE) {
    console.error(
      "\nRefusing to write without --force. Re-run with --force to apply.",
    );
    process.exit(1);
  }

  // ── 4. Replace, in one transaction ──
  await prisma.$transaction(
    async (tx) => {
      // Modules cascade to lessons, blocks, lesson/module quizzes and attempts.
      await tx.module.deleteMany({ where: { courseId: course.id } });
      // The course-level quiz hangs off the course, so it needs its own delete.
      await tx.quiz.deleteMany({ where: { courseId: course.id } });

      for (const [mi, mod] of curriculum.modules.entries()) {
        const createdModule = await tx.module.create({
          data: { courseId: course.id, title: mod.title, orderIndex: mi + 1 },
          select: { id: true },
        });

        for (const [li, lesson] of mod.lessons.entries()) {
          const createdLesson = await tx.lesson.create({
            data: {
              moduleId: createdModule.id,
              title: lesson.title,
              orderIndex: li + 1,
              blocks: {
                create: lesson.blocks.map((block, bi) =>
                  block.type === "text"
                    ? {
                        type: "text" as const,
                        content: block.html,
                        orderIndex: bi + 1,
                      }
                    : {
                        type: "code" as const,
                        content: block.code,
                        language: block.language,
                        orderIndex: bi + 1,
                      },
                ),
              },
            },
            select: { id: true },
          });

          if (lesson.quiz)
            await createQuiz(tx, lesson.quiz, { lessonId: createdLesson.id });
        }

        if (mod.quiz) await createQuiz(tx, mod.quiz, { moduleId: createdModule.id });
      }

      if (curriculum.finalExam)
        await createQuiz(tx, curriculum.finalExam, { courseId: course.id });
    },
    { timeout: 120_000, maxWait: 20_000 },
  );

  // ── 5. Clear the Redis cache so students read the new content ──
  await invalidateCourseCache(course.slug);

  console.log("\nDone. Course content replaced and the course cache cleared.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    redis.disconnect();
  });

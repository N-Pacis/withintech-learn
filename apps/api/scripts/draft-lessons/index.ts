import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

import { prisma } from "../../src/db/prisma";
import redis from "../../src/db/redis";
import { invalidateCourseCache } from "../../src/services/course-cache.service";
import { courses } from "./courses";
import { quizDraftErrors, reportCoverage } from "./validate";
import type { CourseDraft, QuizDraft } from "./types";

// Add-only loader for drafted lessons.
//
//   node dist/scripts/draft-lessons/index.js                 dry run, all courses
//   node dist/scripts/draft-lessons/index.js --course ai     dry run, one course
//   node dist/scripts/draft-lessons/index.js --apply [...]   write
//
// For every draft it creates ONE lesson (orderIndex 1) with its blocks, but
// only when the target module exists in the named course and has no lessons;
// and, if the draft has a quiz, a module quiz only when the module has none.
// It never edits or deletes modules, lessons, quizzes, progress or
// certificates, so re-running it is safe and author edits are never touched.

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const courseArg = args.includes("--course")
  ? args[args.indexOf("--course") + 1]
  : undefined;

async function createModuleQuiz(moduleId: string, quiz: QuizDraft): Promise<void> {
  await prisma.quiz.create({
    data: {
      moduleId,
      title: quiz.title,
      passingScore: quiz.passingScore,
      maxAttempts: quiz.maxAttempts,
      questions: {
        create: quiz.questions.map((q, qi) => ({
          text: q.text,
          orderIndex: qi + 1,
          options: {
            create: q.options.map((option, oi) => ({
              text: option,
              isCorrect: q.correct.includes(oi),
              orderIndex: oi + 1,
            })),
          },
        })),
      },
    },
    select: { id: true },
  });
}

async function loadCourse(draft: CourseDraft): Promise<void> {
  const course = await prisma.course.findUnique({
    where: { slug: draft.courseSlug },
    select: { id: true, title: true },
  });
  if (!course) {
    console.log(`\n[${draft.key}] course ${draft.courseSlug} not found, skipped`);
    return;
  }
  console.log(`\n[${draft.key}] ${course.title}`);
  await reportCoverage(draft);

  let created = 0;
  for (const lesson of draft.lessons) {
    const mod = await prisma.module.findFirst({
      where: { id: lesson.moduleId, courseId: course.id },
      select: {
        id: true,
        title: true,
        quiz: { select: { id: true } },
        _count: { select: { lessons: true } },
      },
    });
    if (!mod) {
      console.log(`  skip  ${lesson.moduleTitle}: module not found in course`);
      continue;
    }

    // Quiz: only for modules that have none (existing quizzes stay as-is).
    if (lesson.quiz && !mod.quiz) {
      const n = lesson.quiz.questions.length;
      if (!apply) {
        console.log(`  would add quiz "${lesson.quiz.title}" (${n} questions) to ${mod.title}`);
      } else {
        await createModuleQuiz(mod.id, lesson.quiz);
        created++;
        console.log(`  added quiz "${lesson.quiz.title}" (${n} questions) to ${mod.title}`);
      }
    } else if (lesson.quiz && mod.quiz) {
      console.log(`  skip  quiz for ${mod.title}: module already has a quiz`);
    }

    if (mod._count.lessons > 0) {
      console.log(`  skip  ${mod.title}: already has ${mod._count.lessons} lesson(s)`);
      continue;
    }

    const blockSummary = `${lesson.blocks.length} blocks`;
    if (!apply) {
      console.log(`  would add "${lesson.lessonTitle}" to ${mod.title} (${blockSummary})`);
      continue;
    }

    await prisma.lesson.create({
      data: {
        moduleId: mod.id,
        title: lesson.lessonTitle,
        orderIndex: 1,
        blocks: {
          create: lesson.blocks.map((block, i) =>
            block.type === "text"
              ? { type: "text" as const, content: block.html, orderIndex: i + 1 }
              : {
                  type: "code" as const,
                  content: block.code,
                  language: block.language,
                  orderIndex: i + 1,
                },
          ),
        },
      },
      select: { id: true },
    });
    created++;
    console.log(`  added "${lesson.lessonTitle}" to ${mod.title} (${blockSummary})`);
  }

  if (apply && created > 0) {
    await invalidateCourseCache(draft.courseSlug);
    console.log(`  ${created} lesson(s) added, course cache cleared`);
  }
}

async function main(): Promise<void> {
  const selected = courseArg
    ? courses.filter((c) => c.key === courseArg)
    : courses;
  if (selected.length === 0) {
    throw new Error(
      `Unknown course "${courseArg}". Known: ${courses.map((c) => c.key).join(", ")}`,
    );
  }
  const errors = selected.flatMap(quizDraftErrors);
  if (errors.length > 0) {
    throw new Error(`Fix drafted quizzes first:\n${errors.join("\n")}`);
  }
  console.log(apply ? "APPLY mode: writing lessons" : "DRY RUN: nothing is written");
  for (const draft of selected) await loadCourse(draft);
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

import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

import type { Prisma } from "@prisma/client";
import { prisma } from "../../src/db/prisma";
import redis from "../../src/db/redis";
import { invalidateCourseCache } from "../../src/services/course-cache.service";
import { uploadToS3 } from "../../src/services/storage.service";
import { courses } from "./courses";
import { quizDraftErrors, reportCoverage } from "./validate";
import type { Block, CourseDraft, LessonDraft, QuizDraft } from "./types";

// Add-only loader for drafted lessons.
//
//   node dist/scripts/draft-lessons/index.js                    dry run, all courses
//   node dist/scripts/draft-lessons/index.js --course ai        dry run, one course
//   node dist/scripts/draft-lessons/index.js --apply [...]      write
//   ... --refresh-drafts                                         also update untouched drafts
//
// For every draft it creates ONE lesson (orderIndex 1) with its blocks, but
// only when the target module exists in the named course and has no lessons;
// and, if the draft has a quiz, a module quiz only when the module has none.
//
// --refresh-drafts replaces the blocks of a lesson this seeder created earlier
// (same title, the module's only lesson) as long as nobody has edited any of
// its blocks since. Anything an author changed is skipped and reported.
//
// It never edits or deletes modules, quizzes, progress or certificates, and
// never touches lessons authors created or edited.

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const refresh = args.includes("--refresh-drafts");
const courseArg = args.includes("--course")
  ? args[args.indexOf("--course") + 1]
  : undefined;

/** Set to 1 for local test runs: image blocks get a fake key, nothing is uploaded. */
const fakeUpload = process.env.DRAFT_LESSONS_FAKE_UPLOAD === "1";

/** PNGs live next to the TypeScript sources (dist/ only has compiled JS). */
const ASSETS_DIR = path.resolve(__dirname, "../../../scripts/draft-lessons/assets");

/** A block counts as untouched if it was never saved after creation. */
const UNTOUCHED_MS = 5_000;

async function uploadAsset(file: string): Promise<string> {
  const full = path.join(ASSETS_DIR, file);
  if (!fs.existsSync(full)) throw new Error(`Missing asset ${full}`);
  if (fakeUpload) return `blocks/local-test-${path.basename(file)}`;
  const fileLike = {
    originalname: path.basename(file),
    buffer: fs.readFileSync(full),
    mimetype: "image/png",
  } as Express.Multer.File;
  return uploadToS3(fileLike, "blocks");
}

async function blockData(
  block: Block,
  orderIndex: number,
): Promise<Prisma.LessonBlockCreateWithoutLessonInput> {
  switch (block.type) {
    case "text":
      return { type: "text", content: block.html, orderIndex };
    case "code":
      return { type: "code", content: block.code, language: block.language, orderIndex };
    case "image":
      return {
        type: "image",
        storageKey: await uploadAsset(block.file),
        caption: block.caption || null,
        orderIndex,
      };
    case "playground":
      return {
        type: "playground",
        playgroundData: { html: block.html, css: block.css, js: block.js },
        orderIndex,
      };
  }
}

const blocksData = async (lesson: LessonDraft) =>
  Promise.all(lesson.blocks.map((b, i) => blockData(b, i + 1)));

const summarize = (lesson: LessonDraft): string => {
  const count = (t: Block["type"]) => lesson.blocks.filter((b) => b.type === t).length;
  return `${lesson.blocks.length} blocks: ${count("text")} text, ${count("code")} code, ${count("image")} image, ${count("playground")} playground`;
};

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

/** Returns true if the lesson's content was written (created or refreshed). */
async function loadLesson(courseId: string, lesson: LessonDraft): Promise<boolean> {
  const mod = await prisma.module.findFirst({
    where: { id: lesson.moduleId, courseId },
    select: {
      id: true,
      title: true,
      quiz: { select: { id: true } },
      lessons: {
        select: {
          id: true,
          title: true,
          blocks: { select: { createdAt: true, updatedAt: true } },
        },
      },
    },
  });
  if (!mod) {
    console.log(`  skip  ${lesson.moduleTitle}: module not found in course`);
    return false;
  }

  let wrote = false;

  // Quiz: only for modules that have none (existing quizzes stay as-is).
  if (lesson.quiz && !mod.quiz) {
    const n = lesson.quiz.questions.length;
    if (!apply) {
      console.log(`  would add quiz "${lesson.quiz.title}" (${n} questions) to ${mod.title}`);
    } else {
      await createModuleQuiz(mod.id, lesson.quiz);
      wrote = true;
      console.log(`  added quiz "${lesson.quiz.title}" (${n} questions) to ${mod.title}`);
    }
  }

  // No lessons yet: add the draft.
  if (mod.lessons.length === 0) {
    if (!apply) {
      console.log(`  would add "${lesson.lessonTitle}" to ${mod.title} (${summarize(lesson)})`);
      return wrote;
    }
    await prisma.lesson.create({
      data: {
        moduleId: mod.id,
        title: lesson.lessonTitle,
        orderIndex: 1,
        blocks: { create: await blocksData(lesson) },
      },
      select: { id: true },
    });
    console.log(`  added "${lesson.lessonTitle}" to ${mod.title} (${summarize(lesson)})`);
    return true;
  }

  // Existing lessons: only refresh a previously seeded, untouched draft.
  if (!refresh) {
    console.log(`  skip  ${mod.title}: already has ${mod.lessons.length} lesson(s)`);
    return wrote;
  }
  const existing = mod.lessons[0];
  const isOurDraft = mod.lessons.length === 1 && existing.title === lesson.lessonTitle;
  const untouched = existing.blocks.every(
    (b) => Math.abs(b.updatedAt.getTime() - b.createdAt.getTime()) < UNTOUCHED_MS,
  );
  if (!isOurDraft || !untouched) {
    const why = !isOurDraft ? "lesson isn't the seeded draft" : "an author edited it";
    console.log(`  skip  ${mod.title}: ${why}`);
    return wrote;
  }
  if (!apply) {
    console.log(`  would refresh "${lesson.lessonTitle}" in ${mod.title} (${summarize(lesson)})`);
    return wrote;
  }
  const data = await blocksData(lesson);
  await prisma.$transaction([
    prisma.lessonBlock.deleteMany({ where: { lessonId: existing.id } }),
    prisma.lesson.update({
      where: { id: existing.id },
      data: { blocks: { create: data } },
      select: { id: true },
    }),
  ]);
  console.log(`  refreshed "${lesson.lessonTitle}" in ${mod.title} (${summarize(lesson)})`);
  return true;
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

  let written = 0;
  for (const lesson of draft.lessons) {
    if (await loadLesson(course.id, lesson)) written++;
  }

  if (apply && written > 0) {
    await invalidateCourseCache(draft.courseSlug);
    console.log(`  ${written} module(s) updated, course cache cleared`);
  }
}

function missingAssets(selected: CourseDraft[]): string[] {
  return selected
    .flatMap((c) => c.lessons.flatMap((l) => l.blocks))
    .filter((b): b is Extract<Block, { type: "image" }> => b.type === "image")
    .map((b) => b.file)
    .filter((f) => !fs.existsSync(path.join(ASSETS_DIR, f)));
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
  const errors = [
    ...selected.flatMap(quizDraftErrors),
    ...missingAssets(selected).map((f) => `missing asset ${f}`),
  ];
  if (errors.length > 0) {
    throw new Error(`Fix the drafts first:\n${errors.join("\n")}`);
  }
  console.log(
    `${apply ? "APPLY mode: writing lessons" : "DRY RUN: nothing is written"}${refresh ? " (refreshing untouched drafts)" : ""}${fakeUpload ? " [fake uploads]" : ""}`,
  );
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

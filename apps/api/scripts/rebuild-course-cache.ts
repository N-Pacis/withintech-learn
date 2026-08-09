import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

import { prisma } from "../src/db/prisma";
import redis from "../src/db/redis";
import { buildAndCacheCourse } from "../src/services/course-cache.service";

/*
 * Rebuilds the Redis cache for every published course.
 *
 * Run this after the standalone-quiz-pages change (see
 * context/standalone-quiz-pages.md).
 *
 * There is NO database migration in that change: `hasQuiz`, `quizId` and
 * `quizPassed` are all derived at read time from data that already exists.
 * What can be stale is Redis. `published_course:<slug>` and
 * `published_module:<id>` are written once at publish time and then read for
 * as long as they live, so a course published before the lesson hierarchy
 * landed can still be cached without its `lessons` array. The student
 * services have guards for that (`cachedMod.lessons ?? []`), and those guards
 * make a lesson quiz invisible: no lessons in cache means no quiz rows in the
 * sidebar.
 *
 * The script is safe to run as often as you like. It only rewrites cache
 * entries from the database — it never writes to the database.
 */

async function main() {
  const courses = await prisma.course.findMany({
    where: { status: "published" },
    select: { id: true, slug: true, title: true },
    orderBy: { createdAt: "asc" },
  });

  if (courses.length === 0) {
    console.log("No published courses found. Nothing to do.");
    return;
  }

  let lessonQuizzes = 0;
  let moduleQuizzes = 0;
  let courseQuizzes = 0;

  for (const course of courses) {
    await buildAndCacheCourse(course.id);

    const [lessonQuizCount, moduleQuizCount, courseQuizCount] =
      await Promise.all([
        prisma.quiz.count({
          where: { lesson: { module: { courseId: course.id } } },
        }),
        prisma.quiz.count({ where: { module: { courseId: course.id } } }),
        prisma.quiz.count({ where: { courseId: course.id } }),
      ]);

    lessonQuizzes += lessonQuizCount;
    moduleQuizzes += moduleQuizCount;
    courseQuizzes += courseQuizCount;

    console.log(
      `Rebuilt "${course.title}" (${course.slug}): ` +
        `${lessonQuizCount} lesson quiz(zes), ` +
        `${moduleQuizCount} module quiz(zes), ` +
        `${courseQuizCount} course quiz(zes).`,
    );
  }

  console.log(
    `\nDone. ${courses.length} published course(s) rebuilt. ` +
      `Quizzes now visible in the sidebar: ` +
      `${lessonQuizzes} lesson, ${moduleQuizzes} module, ${courseQuizzes} course.`,
  );
}

main()
  .catch((err: unknown) => {
    console.error(
      "Cache rebuild failed:",
      err instanceof Error ? err.message : err,
    );
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    redis.disconnect();
  });

import { prisma } from "../db/prisma";
import { forbidden } from "./errors";

/*
 * Progress gates.
 *
 * Every quiz sits on top of content the student is supposed to finish first:
 * a module quiz sits on top of that module's lessons, and the course quiz sits
 * on top of every module. The web app hides the links until the content below
 * is done, but a URL is not a permission — these checks are what actually
 * enforce it.
 *
 * Lesson quizzes need no gate here. A lesson quiz can only be reached through
 * the lesson, and `getStudentLesson` already refuses a lesson whose earlier
 * lessons are unfinished.
 */

/** Throws unless every lesson in the module has a LessonProgress row. */
export const assertModuleLessonsCompleted = async (
  userId: string,
  moduleId: string,
): Promise<void> => {
  const lessons = await prisma.lesson.findMany({
    where: { moduleId },
    select: { id: true },
  });
  if (lessons.length === 0) return;

  const completed = await prisma.lessonProgress.count({
    where: { userId, lessonId: { in: lessons.map((l) => l.id) } },
  });
  if (completed < lessons.length) {
    throw forbidden(
      "You must complete every lesson in this module before taking its quiz",
    );
  }
};

/** Throws unless every module in the course has a ModuleProgress row. */
export const assertCourseModulesCompleted = async (
  userId: string,
  courseId: string,
): Promise<void> => {
  const modules = await prisma.module.findMany({
    where: { courseId },
    select: { id: true },
  });
  if (modules.length === 0) return;

  const completed = await prisma.moduleProgress.count({
    where: { userId, moduleId: { in: modules.map((m) => m.id) } },
  });
  if (completed < modules.length) {
    throw forbidden(
      "You must complete every module before taking the final quiz",
    );
  }
};

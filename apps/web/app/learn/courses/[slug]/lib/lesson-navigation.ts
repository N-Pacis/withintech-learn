import type {
  StudentCourse,
  StudentModuleDetail,
} from "@/hooks/queries/courses";

/**
 * The single "where does the student go after this lesson" rule.
 *
 * It lives here because two pages need it: the lesson page (for a lesson with
 * no quiz) and the lesson quiz page (after a pass). Duplicating it is how the
 * two would slowly stop agreeing with each other.
 *
 * Order: next lesson → this module's quiz → next module → the final quiz →
 * the course page.
 */
export function nextAfterLesson({
  slug,
  course,
  mod,
  lessonId,
}: {
  slug: string;
  course: StudentCourse;
  mod: StudentModuleDetail;
  lessonId: string;
}): string {
  const lessons = mod.lessons;
  const lessonIndex = lessons.findIndex((l) => l.id === lessonId);
  const isLastLesson = lessonIndex === lessons.length - 1;

  if (!isLastLesson && lessonIndex !== -1) {
    return `/learn/courses/${slug}/modules/${mod.id}/lessons/${lessons[lessonIndex + 1].id}`;
  }

  if (mod.quiz) return `/learn/courses/${slug}/modules/${mod.id}/quiz`;

  const modules = course.modules;
  const moduleIndex = modules.findIndex((m) => m.id === mod.id);
  const isLastModule = moduleIndex === modules.length - 1;

  if (!isLastModule && moduleIndex !== -1) {
    return `/learn/courses/${slug}/modules/${modules[moduleIndex + 1].id}`;
  }

  if (course.quiz) return `/learn/courses/${slug}/quiz`;

  return `/learn/courses/${slug}`;
}

export const lessonQuizHref = (
  slug: string,
  moduleId: string,
  lessonId: string,
) => `/learn/courses/${slug}/modules/${moduleId}/lessons/${lessonId}/quiz`;

export const moduleQuizHref = (slug: string, moduleId: string) =>
  `/learn/courses/${slug}/modules/${moduleId}/quiz`;

export const courseQuizHref = (slug: string) => `/learn/courses/${slug}/quiz`;

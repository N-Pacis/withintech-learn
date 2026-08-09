"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Trophy,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
} from "lucide-react";
import type {
  StudentCourse,
  StudentModuleDetail,
} from "@/hooks/queries/courses";
import { cn } from "@/lib/utils";
import {
  lessonQuizHref,
  moduleQuizHref,
  courseQuizHref,
} from "../lib/lesson-navigation";
import { useAttemptGuard } from "./AttemptGuard";

interface CourseNavProps {
  slug: string;
  course: StudentCourse;
  pathname: string;
  activeModuleId?: string;
  activeLessonId?: string;
  activeModuleDetail?: StudentModuleDetail;
  /** Closes the mobile drawer. Not passed on desktop. */
  onNavigate?: () => void;
}

/**
 * The course sidebar tree.
 *
 * Quizzes are rows here, not something hidden inside a lesson page. A course
 * with a quiz on every lesson used to look like a course with no quizzes at
 * all, and the module quiz was a label that could not be clicked.
 *
 * Like the lesson rows, quiz rows only appear for the module the student is
 * currently in — the sidebar never loads other modules' details.
 */
export function CourseNav({
  slug,
  course,
  pathname,
  activeModuleId,
  activeLessonId,
  activeModuleDetail,
  onNavigate,
}: CourseNavProps) {
  const router = useRouter();
  const { guardedNavigate } = useAttemptGuard();

  // Exact matching. `pathname.includes("/quiz")` was true for all three quiz
  // levels, so the sidebar highlighted the wrong row.
  const isOnCourseQuiz = pathname === courseQuizHref(slug);
  const isOnLessonQuiz = /\/lessons\/[^/]+\/quiz$/.test(pathname);
  const isOnModuleQuiz = /\/modules\/[^/]+\/quiz$/.test(pathname);

  const modules = course.modules;
  const allModulesDone = modules.every((m) => m.isCompleted);
  const courseQuizPassed = course.lastCourseQuizAttempt?.status === "pass";

  const activeLessons = activeModuleDetail?.lessons ?? [];
  // The module quiz sits on top of the module's lessons, and the API refuses
  // an attempt until they are all done. Lock the row to match. A module with
  // no lessons has nothing to wait for, which matches the API check.
  const moduleQuizUnlocked = activeLessons.every((l) => l.isCompleted);
  const moduleQuizPassed = activeModuleDetail?.lastAttempt?.status === "pass";

  // Every row goes through the guard, so a student mid-attempt is asked before
  // the sidebar can put them back on the lesson.
  function go(href: string) {
    guardedNavigate(() => {
      router.push(href);
      onNavigate?.();
    });
  }

  const totalSteps = modules.length + (course.quiz ? 1 : 0);
  const completedCount =
    modules.filter((m) => m.isCompleted).length + (courseQuizPassed ? 1 : 0);
  const overallProgress =
    totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  return (
    <>
      <div className="px-4 pt-5 pb-4 border-b border-border">
        {/* A real link so it keeps middle-click and "open in new tab", but the
            plain click goes through the guard like every other row. */}
        <Link
          href="/learn"
          className="inline-flex items-center gap-1.5 font-body text-xs text-muted-contrast hover:text-primary transition-colors mb-3"
          onClick={(e) => {
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
            e.preventDefault();
            go("/learn");
          }}
        >
          <ArrowLeft size={13} /> All courses
        </Link>
        <h2 className="font-heading font-bold text-sm text-foreground leading-snug line-clamp-2">
          {course.title}
        </h2>
        <div className="flex items-center gap-2 mt-3">
          <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <span className="font-body text-xs text-muted-contrast shrink-0">
            {overallProgress}%
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {modules.map((m, i) => {
          const isModuleOpen = activeModuleId === m.id;
          const isActive = isModuleOpen && !isOnModuleQuiz;
          const isDone = m.isCompleted;
          const locked = m.isLocked;
          return (
            <div key={m.id}>
              <button
                onClick={() => !locked && go(`/learn/courses/${slug}/modules/${m.id}`)}
                disabled={locked}
                className={cn(
                  "w-full flex items-start gap-3 px-4 py-3 text-left transition-colors",
                  locked
                    ? "opacity-40 cursor-not-allowed"
                    : isActive
                      ? "bg-primary-soft"
                      : "hover:bg-surface dark:hover:bg-editor",
                )}
              >
                <span
                  className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold transition-colors",
                    isDone
                      ? "bg-green-100 text-green-700 dark:bg-green-600 dark:text-white"
                      : isActive
                        ? "bg-primary text-white"
                        : "bg-border text-muted-contrast",
                  )}
                >
                  {isDone ? <CheckCircle2 size={11} /> : i + 1}
                </span>
                <span
                  className={cn(
                    "font-body text-sm leading-snug",
                    isActive
                      ? "font-semibold text-primary"
                      : isDone
                        ? "text-foreground-soft"
                        : "text-muted",
                  )}
                >
                  {m.title}
                </span>
                {(m.hasLessons || m.hasQuiz) && isModuleOpen && (
                  <ChevronDown
                    size={12}
                    className="ml-auto shrink-0 text-muted-contrast transition-transform rotate-180"
                  />
                )}
              </button>

              {/* Lessons, each followed by its own quiz row */}
              {isModuleOpen &&
                (activeLessons.length > 0 || activeModuleDetail?.quiz) && (
                <div className="pl-8 pr-2 pb-1">
                  {activeLessons.map((l, li) => {
                    const isLessonActive =
                      activeLessonId === l.id && !isOnLessonQuiz;
                    const isLessonQuizActive =
                      activeLessonId === l.id && isOnLessonQuiz;
                    return (
                      <div key={l.id}>
                        <button
                          onClick={() =>
                            !l.isLocked &&
                            go(
                              `/learn/courses/${slug}/modules/${m.id}/lessons/${l.id}`,
                            )
                          }
                          disabled={l.isLocked}
                          className={cn(
                            "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors text-xs",
                            l.isLocked
                              ? "opacity-40 cursor-not-allowed"
                              : isLessonActive
                                ? "bg-primary-soft text-foreground font-semibold"
                                : "hover:bg-surface-subtle text-muted",
                          )}
                        >
                          <span
                            className={cn(
                              "w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold",
                              l.isCompleted
                                ? "bg-green-100 text-green-700 dark:bg-green-600 dark:text-white"
                                : isLessonActive
                                  ? "bg-primary text-white"
                                  : "bg-border text-muted-contrast",
                            )}
                          >
                            {l.isCompleted ? <CheckCircle2 size={9} /> : li + 1}
                          </span>
                          <span className="truncate">{l.title}</span>
                        </button>

                        {l.hasQuiz && (
                          <QuizRow
                            label="Quiz"
                            active={isLessonQuizActive}
                            passed={l.quizPassed}
                            locked={l.isLocked}
                            indented
                            onClick={() =>
                              go(lessonQuizHref(slug, m.id, l.id))
                            }
                          />
                        )}
                      </div>
                    );
                  })}

                  {/* Module quiz, after the last lesson */}
                  {activeModuleDetail?.quiz && (
                    <QuizRow
                      label="Module Quiz"
                      active={isOnModuleQuiz}
                      passed={!!moduleQuizPassed}
                      locked={!moduleQuizUnlocked}
                      onClick={() => go(moduleQuizHref(slug, m.id))}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}

        {course.quiz && (
          <button
            onClick={() => allModulesDone && go(courseQuizHref(slug))}
            disabled={!allModulesDone}
            className={cn(
              "w-full flex items-start gap-3 px-4 py-3 text-left transition-colors",
              !allModulesDone
                ? "opacity-40 cursor-not-allowed"
                : isOnCourseQuiz
                  ? "bg-primary-soft"
                  : "hover:bg-surface dark:hover:bg-editor",
            )}
          >
            <span
              className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                courseQuizPassed
                  ? "bg-green-100 text-green-700 dark:bg-green-600 dark:text-white"
                  : isOnCourseQuiz
                    ? "bg-primary text-white"
                    : "bg-border text-muted-contrast",
              )}
            >
              {courseQuizPassed ? (
                <CheckCircle2 size={11} />
              ) : (
                <Trophy size={10} />
              )}
            </span>
            <span
              className={cn(
                "font-body text-sm leading-snug",
                isOnCourseQuiz ? "font-semibold text-primary" : "text-muted",
              )}
            >
              Final Quiz
            </span>
          </button>
        )}
      </nav>
    </>
  );
}

/** A quiz row. The icon replaces the number so a quiz never reads as content. */
function QuizRow({
  label,
  active,
  passed,
  locked,
  indented = false,
  onClick,
}: {
  label: string;
  active: boolean;
  passed: boolean;
  locked: boolean;
  indented?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={() => !locked && onClick()}
      disabled={locked}
      className={cn(
        "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors text-xs",
        indented && "pl-6",
        locked
          ? "opacity-40 cursor-not-allowed"
          : active
            ? "bg-primary-soft text-foreground font-semibold"
            : "hover:bg-surface-subtle text-muted",
      )}
    >
      <span
        className={cn(
          "w-4 h-4 rounded-full flex items-center justify-center shrink-0",
          passed
            ? "bg-green-100 text-green-700 dark:bg-green-600 dark:text-white"
            : active
              ? "bg-primary text-white"
              : "bg-border text-muted-contrast",
        )}
      >
        {passed ? <CheckCircle2 size={9} /> : <ClipboardCheck size={9} />}
      </span>
      <span className="truncate">{label}</span>
    </button>
  );
}

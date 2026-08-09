"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, ArrowRight } from "lucide-react";
import {
  usePublishedCourse,
  useStudentModule,
  useStudentLesson,
  useCompleteLesson,
} from "@/hooks/queries/courses";
import { Button, PageLoader } from "@/components/ui";
import { QuizSection } from "../../../../../components/QuizSection";
import { useAttemptGuard } from "../../../../../components/AttemptGuard";
import { nextAfterLesson } from "../../../../../lib/lesson-navigation";

// The lesson quiz has its own page on purpose. When it was rendered under the
// lesson content, the student could scroll back up and read the answer while
// the quiz was open, and none of the anti-cheat listeners in QuizSection fire
// on a scroll.
export default function LessonQuizPage() {
  const { slug, moduleId, lessonId } = useParams<{
    slug: string;
    moduleId: string;
    lessonId: string;
  }>();
  const router = useRouter();
  const { guardedNavigate } = useAttemptGuard();

  const {
    data: lesson,
    isLoading,
    isError,
  } = useStudentLesson(slug, moduleId, lessonId);
  const { data: mod } = useStudentModule(slug, moduleId);
  const { data: course } = usePublishedCourse(slug);
  const { mutate: completeLesson, isPending: completing } = useCompleteLesson(
    slug,
    moduleId,
  );

  const lessonHref = `/learn/courses/${slug}/modules/${moduleId}/lessons/${lessonId}`;

  // Nothing to take, or the lesson is not reachable yet (the API refuses a
  // lesson whose earlier lessons are unfinished): send the student to the
  // lesson, which redirects onward if it is locked too.
  useEffect(() => {
    if (isLoading) return;
    if (isError || (lesson && !lesson.quiz)) router.replace(lessonHref);
  }, [isLoading, isError, lesson, lessonHref, router]);

  if (isLoading || !mod || !course) return <PageLoader type="content" />;
  if (!lesson?.quiz) return null;

  const lessons = mod.lessons;
  const lessonIndex = lessons.findIndex((l) => l.id === lessonId);
  const isLastLesson = lessonIndex === lessons.length - 1;
  const isCompleted = lessons[lessonIndex]?.isCompleted ?? false;
  const quizPassed = lesson.lastAttempt?.status === "pass";

  // Records progress only. Never navigates — the student stays on the results
  // view until they choose to move on.
  function handleQuizPassed() {
    if (isCompleted) return;
    completeLesson(lessonId);
  }

  function goNext() {
    router.push(nextAfterLesson({ slug, course: course!, mod: mod!, lessonId }));
  }

  // The lesson holds the answers, so this is exactly the trip the guard exists
  // to ask about.
  function goBackToLesson() {
    guardedNavigate(() => router.push(lessonHref));
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-32 lg:pb-10">
      {/* Badge */}
      <div className="flex items-center gap-2 mb-6">
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary-soft text-primary font-body text-xs font-semibold">
          Lesson {lessonIndex + 1} Quiz
        </span>
      </div>

      {/* Quiz card */}
      <div className="bg-surface-card rounded-2xl border border-border shadow-sm p-6 sm:p-8">
        <QuizSection
          quiz={lesson.quiz}
          quizType="lesson"
          onPassed={handleQuizPassed}
          onContinue={goNext}
          continueBusy={completing}
          continueLabel={isLastLesson ? "Continue" : "Next lesson"}
        />
      </div>

      {/* Desktop nav */}
      <div className="hidden lg:flex flex-row items-center justify-between gap-3 mt-8 pt-6 border-t border-border">
        <Button
          variant="secondary"
          size="md"
          onClick={goBackToLesson}
          className="flex items-center gap-2"
        >
          <ChevronLeft size={16} /> Back to lesson
        </Button>

        {/* A second way to move on. Progress is already recorded by onPassed,
            so this only navigates — but it stays disabled until that request
            lands, or the student can reach a still-locked page. */}
        {quizPassed && (
          <Button
            size="md"
            onClick={goNext}
            loading={completing}
            disabled={completing}
            className="flex items-center gap-2"
          >
            {isLastLesson ? "Continue" : "Next lesson"} <ArrowRight size={16} />
          </Button>
        )}
      </div>

      {/* Mobile sticky nav */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-surface-shell border-t border-border shadow-[0_-4px_16px_rgba(15,15,15,0.08)] dark:shadow-[0_-4px_16px_rgba(0,0,0,0.36)] px-4 py-3 flex items-center justify-between gap-3">
        <Button
          variant="secondary"
          size="md"
          onClick={goBackToLesson}
          className="px-3"
        >
          <ChevronLeft size={16} />
        </Button>
        <p className="font-body text-xs text-muted-contrast truncate flex-1 text-center">
          {lesson.title} — Quiz
        </p>
        {quizPassed && (
          <Button
            size="md"
            onClick={goNext}
            loading={completing}
            disabled={completing}
            className="px-3"
          >
            <ArrowRight size={16} />
          </Button>
        )}
      </div>
    </div>
  );
}

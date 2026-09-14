"use client";

import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Trophy, Award } from "lucide-react";
import {
  usePublishedCourse,
  useStudentModule,
  useCompleteModule,
} from "@/hooks/queries/courses";
import { useProfile } from "@/hooks/queries/auth";
import { Button, PageLoader } from "@/components/ui";
import { QuizSection } from "../../../components/QuizSection";
import { useAttemptGuard } from "../../../components/AttemptGuard";
import Link from "next/link";

export default function ModuleQuizPage() {
  const { slug, moduleId } = useParams<{ slug: string; moduleId: string }>();
  const router = useRouter();
  const { guardedNavigate } = useAttemptGuard();
  const { data: mod, isLoading } = useStudentModule(slug, moduleId);
  const { data: course } = usePublishedCourse(slug);
  const { data: profile } = useProfile();
  const { mutate: completeModule, isPending: completing } =
    useCompleteModule(slug);

  if (isLoading || !course) return <PageLoader type="content" />;
  if (!mod?.quiz) {
    router.replace(`/learn/courses/${slug}/modules/${moduleId}`);
    return null;
  }

  const modules = course.modules;
  const courseModule = modules.find((m) => m.id === moduleId);
  const moduleIndex = modules.findIndex((m) => m.id === moduleId);
  const isLast = moduleIndex === modules.length - 1;
  const quizPassed = mod.lastAttempt?.status === "pass";
  const isCoursePassed = course.enrollment_status === "PASSED";
  const certHref = `/certificates/${profile?.id}/${course.slug}`;

  // Records progress only. Never navigates.
  function handleQuizPassed() {
    if (courseModule?.isCompleted) return;
    completeModule(moduleId);
  }

  function goNext() {
    if (!isLast) {
      router.push(
        `/learn/courses/${slug}/modules/${modules[moduleIndex + 1].id}`,
      );
      return;
    }
    if (course!.quiz) {
      router.push(`/learn/courses/${slug}/quiz`);
      return;
    }
    router.push(certHref);
  }

  // "Back" means the lesson the student was reading before the quiz, which is
  // the last one. Going to the module URL would not work: that page redirects
  // to the first *incomplete* lesson, and every lesson is complete by the time
  // the module quiz is reachable, so it would land on lesson 1.
  function goBackToContent() {
    const lastLesson = mod!.lessons[mod!.lessons.length - 1];
    // Guarded: this is the trip back to the material the quiz is about.
    guardedNavigate(() =>
      router.push(
        lastLesson
          ? `/learn/courses/${slug}/modules/${moduleId}/lessons/${lastLesson.id}`
          : `/learn/courses/${slug}/modules/${moduleId}`,
      ),
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-32 lg:pb-10">
      {/* Badge */}
      <div className="flex items-center gap-2 mb-6">
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary-soft text-primary font-body text-xs font-semibold">
          Module {moduleIndex + 1} Quiz
        </span>
      </div>

      {/* Quiz card */}
      <div className="bg-surface-card rounded-2xl border border-border shadow-sm p-6 sm:p-8">
        <QuizSection
          quiz={mod.quiz}
          quizType="module"
          onPassed={handleQuizPassed}
          onContinue={goNext}
          continueBusy={completing}
          continueLabel={
            !isLast
              ? "Next module"
              : course.quiz
                ? "Final quiz"
                : "Finish course"
          }
        />
      </div>

      {/* Desktop nav */}
      <div className="hidden lg:flex flex-row items-center justify-between gap-3 mt-8 pt-6 border-t border-border">
        <Button
          variant="secondary"
          size="md"
          onClick={goBackToContent}
          className="flex items-center gap-2"
        >
          <ChevronLeft size={16} /> Back to content
        </Button>

        {/* A second way to move on. Progress is already being recorded by
            onPassed, so these only navigate — but stay disabled until that
            request lands, or the student can reach a still-locked page. */}
        {quizPassed &&
          (isLast ? (
            course.quiz ? (
              <Button
                size="md"
                onClick={goNext}
                loading={completing}
                disabled={completing}
                className="flex items-center gap-2"
              >
                Final Quiz <Trophy size={15} />
              </Button>
            ) : isCoursePassed ? (
              <Button
                size="md"
                asChild
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 border-0"
              >
                <Link href={certHref} target="_blank" rel="noopener noreferrer">
                  Certificate <Award size={16} />
                </Link>
              </Button>
            ) : (
              <Button
                size="md"
                onClick={goNext}
                loading={completing}
                disabled={completing}
                className="flex items-center gap-2"
              >
                Complete course <Trophy size={16} />
              </Button>
            )
          ) : (
            <Button
              size="md"
              onClick={goNext}
              loading={completing}
              disabled={completing}
              className="flex items-center gap-2"
            >
              Next module <Trophy size={15} />
            </Button>
          ))}
      </div>

      {/* Mobile sticky nav */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-surface-shell border-t border-border shadow-[0_-4px_16px_rgba(15,15,15,0.08)] dark:shadow-[0_-4px_16px_rgba(0,0,0,0.36)] px-4 py-3 flex items-center justify-between gap-3">
        <Button
          variant="secondary"
          size="md"
          onClick={goBackToContent}
          className="px-3"
        >
          <ChevronLeft size={16} />
        </Button>
        <p className="font-body text-xs text-muted-contrast truncate flex-1 text-center">
          {mod.title} — Quiz
        </p>
        {quizPassed && (
          <Button
            size="md"
            onClick={goNext}
            loading={completing}
            disabled={completing}
            className="px-3"
          >
            <Trophy size={16} />
          </Button>
        )}
      </div>
    </div>
  );
}

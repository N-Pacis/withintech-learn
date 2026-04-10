"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight, ChevronLeft, CheckCircle2 } from "lucide-react";
import {
  usePublishedCourse,
  useStudentModule,
  useStudentLesson,
  useCompleteLesson,
  type StudentBlock,
} from "@/hooks/queries/courses";
import { Button, PageLoader } from "@/components/ui";
import { CodeEditor, type CodeLanguage } from "@/components/ui/CodeEditor";
import { TiptapViewer } from "@/components/ui/TiptapEditor";
import { QuizSection } from "../../../../components/QuizSection";

function TextBlock({ block }: { block: StudentBlock }) {
  return <TiptapViewer content={block.content ?? ""} />;
}

function ImageBlock({ block }: { block: StudentBlock }) {
  if (!block.url) return null;
  return (
    <figure className="flex flex-col gap-2">
      <div
        className="relative w-full rounded-xl overflow-hidden bg-[#F3F4F6]"
        style={{ aspectRatio: "16/9" }}
      >
        <Image
          src={block.url}
          alt={block.caption ?? ""}
          fill
          className="object-cover"
          unoptimized
        />
      </div>
      {block.caption && (
        <figcaption className="font-body text-xs text-[#9CA3AF] text-center">
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
}

function CodeBlock({ block }: { block: StudentBlock }) {
  return (
    <CodeEditor
      value={block.content ?? ""}
      language={(block.language ?? "javascript") as CodeLanguage}
      onValueChange={() => {}}
      onLanguageChange={() => {}}
      readOnly
    />
  );
}

function BlockRenderer({ block }: { block: StudentBlock }) {
  if (block.type === "text") return <TextBlock block={block} />;
  if (block.type === "image") return <ImageBlock block={block} />;
  return <CodeBlock block={block} />;
}

export default function LessonPage() {
  const { slug, moduleId, lessonId } = useParams<{
    slug: string;
    moduleId: string;
    lessonId: string;
  }>();
  const router = useRouter();
  const { data: lesson, isLoading } = useStudentLesson(
    slug,
    moduleId,
    lessonId,
  );
  const { data: mod } = useStudentModule(slug, moduleId);
  const { data: course } = usePublishedCourse(slug);
  const { mutate: completeLesson, isPending: completing } = useCompleteLesson(
    slug,
    moduleId,
  );

  const lessons = mod?.lessons ?? [];
  const modules = course?.modules ?? [];
  const lessonIndex = lessons.findIndex((l) => l.id === lessonId);
  const currentLesson = lessons[lessonIndex];
  const isLastLesson = lessonIndex === lessons.length - 1;
  const isCompleted = currentLesson?.isCompleted ?? false;

  const moduleIndex = modules.findIndex((m) => m.id === moduleId);
  const isLastModule = moduleIndex === modules.length - 1;

  // Redirect if lesson is locked
  useEffect(() => {
    if (mod && currentLesson?.isLocked) {
      router.replace(`/learn/courses/${slug}/modules/${moduleId}`);
    }
  }, [mod, currentLesson, slug, moduleId, router]);

  if (isLoading || !mod || !course) return <PageLoader type="content" />;
  if (!lesson) return null;

  const hasQuiz = !!lesson.quiz;
  const quizPassed = lesson.lastAttempt?.status === "pass";
  const needsQuiz = hasQuiz && !quizPassed;

  function handleQuizPass() {
    // After passing the lesson quiz, complete the lesson
    completeLesson(lessonId, {
      onSuccess: () => {
        if (isLastLesson) {
          // Go to module quiz or next module
          if (mod!.quiz) {
            router.push(`/learn/courses/${slug}/modules/${moduleId}/quiz`);
          } else if (!isLastModule) {
            router.push(
              `/learn/courses/${slug}/modules/${modules[moduleIndex + 1].id}`,
            );
          } else if (course!.quiz) {
            router.push(`/learn/courses/${slug}/quiz`);
          } else {
            router.push(`/learn/courses/${slug}`);
          }
        } else {
          // Go to next lesson
          const nextLesson = lessons[lessonIndex + 1];
          router.push(
            `/learn/courses/${slug}/modules/${moduleId}/lessons/${nextLesson.id}`,
          );
        }
      },
    });
  }

  function handleCompleteWithoutQuiz() {
    completeLesson(lessonId, {
      onSuccess: () => {
        if (isLastLesson) {
          if (mod!.quiz) {
            router.push(`/learn/courses/${slug}/modules/${moduleId}/quiz`);
          } else if (!isLastModule) {
            router.push(
              `/learn/courses/${slug}/modules/${modules[moduleIndex + 1].id}`,
            );
          } else if (course!.quiz) {
            router.push(`/learn/courses/${slug}/quiz`);
          } else {
            router.push(`/learn/courses/${slug}`);
          }
        } else {
          const nextLesson = lessons[lessonIndex + 1];
          router.push(
            `/learn/courses/${slug}/modules/${moduleId}/lessons/${nextLesson.id}`,
          );
        }
      },
    });
  }

  function handlePrev() {
    if (lessonIndex === 0) return;
    const prevLesson = lessons[lessonIndex - 1];
    router.push(
      `/learn/courses/${slug}/modules/${moduleId}/lessons/${prevLesson.id}`,
    );
  }

  function handleNext() {
    if (isLastLesson) return;
    const nextLesson = lessons[lessonIndex + 1];
    router.push(
      `/learn/courses/${slug}/modules/${moduleId}/lessons/${nextLesson.id}`,
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-32 lg:pb-10">
      {/* Breadcrumb badge */}
      <div className="flex items-center justify-between mb-6">
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#F3E8FF] text-[#3D006B] font-body text-xs font-semibold">
          Lesson {lessonIndex + 1} of {lessons.length}
        </span>
        {isCompleted && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 font-body text-xs font-medium border border-green-200">
            <CheckCircle2 size={11} /> Completed
          </span>
        )}
      </div>

      {/* Content card */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6 sm:p-8">
        <h2 className="font-heading font-black text-2xl text-[#0F0F0F] mb-6">
          {lesson.title}
        </h2>
        <div className="flex flex-col gap-6">
          {lesson.blocks.map((block) => (
            <BlockRenderer key={block.id} block={block} />
          ))}
        </div>

        {/* Lesson quiz inline */}
        {hasQuiz && (
          <div className="mt-8 pt-6 border-t border-[#E5E7EB]">
            <QuizSection
              slug={slug}
              moduleId={moduleId}
              quiz={lesson.quiz}
              lastAttempt={lesson.lastAttempt}
              onPass={handleQuizPass}
            />
          </div>
        )}

        {/* Complete button when no quiz or quiz already passed */}
        {!needsQuiz && !isCompleted && (
          <div className="mt-8 pt-6 border-t border-[#E5E7EB]">
            <Button
              size="md"
              onClick={handleCompleteWithoutQuiz}
              disabled={completing}
              loading={completing}
              className="flex items-center gap-2"
            >
              {isLastLesson ? "Complete & continue" : "Next lesson"}{" "}
              <ArrowRight size={16} />
            </Button>
          </div>
        )}
      </div>

      {/* Desktop nav */}
      <div className="hidden lg:flex flex-row items-center justify-between gap-3 mt-8 pt-6 border-t border-[#E5E7EB]">
        <Button
          variant="secondary"
          size="md"
          onClick={handlePrev}
          disabled={lessonIndex === 0}
          className="flex items-center gap-2"
        >
          <ChevronLeft size={16} /> Previous
        </Button>

        {isCompleted && !isLastLesson ? (
          <Button
            size="md"
            onClick={handleNext}
            className="flex items-center gap-2"
          >
            Next lesson <ArrowRight size={16} />
          </Button>
        ) : isCompleted && isLastLesson ? (
          <Button
            size="md"
            onClick={() => {
              if (mod.quiz) {
                router.push(`/learn/courses/${slug}/modules/${moduleId}/quiz`);
              } else if (!isLastModule) {
                router.push(
                  `/learn/courses/${slug}/modules/${modules[moduleIndex + 1].id}`,
                );
              } else {
                router.push(`/learn/courses/${slug}`);
              }
            }}
            className="flex items-center gap-2"
          >
            Continue <ArrowRight size={16} />
          </Button>
        ) : null}
      </div>

      {/* Mobile sticky nav */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-[#E5E7EB] shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-4 py-3 flex items-center justify-between gap-3">
        <Button
          variant="secondary"
          size="md"
          onClick={handlePrev}
          disabled={lessonIndex === 0}
          className="px-3"
        >
          <ChevronLeft size={16} />
        </Button>
        <p className="font-body text-xs text-[#9CA3AF] truncate flex-1 text-center">
          {lesson.title}
        </p>
        {isCompleted && !isLastLesson ? (
          <Button size="md" onClick={handleNext} className="px-3">
            <ArrowRight size={16} />
          </Button>
        ) : isCompleted && isLastLesson ? (
          <Button
            size="md"
            onClick={() => {
              if (mod.quiz) {
                router.push(`/learn/courses/${slug}/modules/${moduleId}/quiz`);
              } else if (!isLastModule) {
                router.push(
                  `/learn/courses/${slug}/modules/${modules[moduleIndex + 1].id}`,
                );
              } else {
                router.push(`/learn/courses/${slug}`);
              }
            }}
            className="px-3"
          >
            <ArrowRight size={16} />
          </Button>
        ) : null}
      </div>
    </div>
  );
}

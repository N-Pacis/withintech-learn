"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowRight,
  ChevronLeft,
  Trophy,
  Award,
  CheckCircle2,
} from "lucide-react";
import {
  usePublishedCourse,
  useStudentModule,
  useCompleteModule,
  type StudentBlock,
} from "@/hooks/queries/courses";
import { useProfile } from "@/hooks/queries/auth";
import { Button, PageLoader } from "@/components/ui";
import { CodeEditor, type CodeLanguage } from "@/components/ui/CodeEditor";
import { TiptapViewer } from "@/components/ui/TiptapEditor";
import Link from "next/link";

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

export default function ModulePage() {
  const { slug, moduleId } = useParams<{ slug: string; moduleId: string }>();
  const router = useRouter();
  const { data: mod, isLoading } = useStudentModule(slug, moduleId);
  const { data: course } = usePublishedCourse(slug);
  const { data: profile } = useProfile();
  const { mutate: completeModule, isPending: completing } =
    useCompleteModule(slug);

  const modules = course?.modules ?? [];
  const courseModule = modules.find((m) => m.id === moduleId);

  // Redirect away if module is locked
  useEffect(() => {
    if (course && courseModule?.isLocked) {
      router.replace(`/learn/courses/${slug}`);
    }
  }, [course, courseModule, slug, router]);

  // Redirect to first incomplete lesson if module uses lessons
  useEffect(() => {
    if (mod && mod.lessons && mod.lessons.length > 0) {
      const firstIncomplete = mod.lessons.find((l) => !l.isCompleted);
      const target = firstIncomplete ?? mod.lessons[0];
      router.replace(
        `/learn/courses/${slug}/modules/${moduleId}/lessons/${target.id}`,
      );
    }
  }, [mod, slug, moduleId, router]);

  if (isLoading || !course) return <PageLoader type="content" />;
  if (!mod) return null;

  const moduleIndex = modules.findIndex((m) => m.id === moduleId);
  const isLast = moduleIndex === modules.length - 1;
  const isCompleted = courseModule?.isCompleted ?? false;
  const hasQuiz = !!mod.quiz;
  const quizPassed = mod.lastAttempt?.status === "pass";
  const needsQuiz = hasQuiz && !quizPassed;

  const isCoursePassed = course.enrollment_status === "PASSED";
  const certHref = `/certificates/${profile?.id}/${course.slug}`;

  function handleComplete() {
    completeModule(moduleId, {
      onSuccess: () => {
        if (isLast && course!.quiz) {
          router.push(`/learn/courses/${slug}/quiz`);
        } else if (isLast) {
          router.push(certHref);
        } else {
          const nextModule = modules[moduleIndex + 1];
          router.push(`/learn/courses/${slug}/modules/${nextModule.id}`);
        }
      },
    });
  }

  function handlePrev() {
    if (moduleIndex === 0) return;
    const prevModule = modules[moduleIndex - 1];
    router.push(`/learn/courses/${slug}/modules/${prevModule.id}`);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-32 lg:pb-10">
      {/* Breadcrumb badge */}
      <div className="flex items-center justify-between mb-6">
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#F3E8FF] dark:bg-[#2d1a4a] text-[#3D006B] dark:text-[#C084FC] font-body text-xs font-semibold">
          Module {moduleIndex + 1} of {modules.length}
        </span>
        {isCompleted && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 font-body text-xs font-medium border border-green-200">
            <CheckCircle2 size={11} /> Completed
          </span>
        )}
      </div>

      {/* Content card */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-[#E5E7EB] dark:border-[#2d2d2d] shadow-sm p-6 sm:p-8">
        <h2 className="font-heading font-black text-2xl text-[#0F0F0F] dark:text-[#F9FAFB] mb-6">
          {mod.title}
        </h2>
        <div className="flex flex-col gap-6">
          {mod.blocks.map((block) => (
            <BlockRenderer key={block.id} block={block} />
          ))}
        </div>

        {/* Take Quiz prompt at end of content */}
        {needsQuiz && (
          <div className="mt-8 pt-6 border-t border-[#E5E7EB] dark:border-[#2d2d2d] flex flex-col gap-3">
            <p className="font-body text-sm text-[#6B7280] dark:text-[#9CA3AF]">
              You&apos;ve reached the end of this module. Take the quiz to
              continue.
            </p>
            <Button
              size="md"
              onClick={() =>
                router.push(`/learn/courses/${slug}/modules/${moduleId}/quiz`)
              }
              className="flex items-center gap-2 self-start"
            >
              Take Quiz <ArrowRight size={15} />
            </Button>
          </div>
        )}
      </div>

      {/* Desktop nav */}
      <div className="hidden lg:flex flex-row items-center justify-between gap-3 mt-8 pt-6 border-t border-[#E5E7EB] dark:border-[#2d2d2d]">
        <Button
          variant="secondary"
          size="md"
          onClick={handlePrev}
          disabled={moduleIndex === 0}
          className="flex items-center gap-2"
        >
          <ChevronLeft size={16} /> Previous
        </Button>

        {needsQuiz ? (
          <Button
            size="md"
            onClick={() =>
              router.push(`/learn/courses/${slug}/modules/${moduleId}/quiz`)
            }
            className="flex items-center gap-2"
          >
            Take Quiz <ArrowRight size={16} />
          </Button>
        ) : isCompleted ? (
          isLast ? (
            course.quiz ? (
              <Button
                size="md"
                onClick={() => router.push(`/learn/courses/${slug}/quiz`)}
                className="flex items-center gap-2"
              >
                Final Quiz <ArrowRight size={16} />
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
                onClick={handleComplete}
                loading={completing}
                className="flex items-center gap-2"
              >
                Complete course <Trophy size={16} />
              </Button>
            )
          ) : (
            <Button
              size="md"
              onClick={() =>
                router.push(
                  `/learn/courses/${slug}/modules/${modules[moduleIndex + 1].id}`,
                )
              }
              className="flex items-center gap-2"
            >
              Next module <ArrowRight size={16} />
            </Button>
          )
        ) : (
          <Button
            size="md"
            onClick={handleComplete}
            disabled={completing}
            loading={completing}
            className="flex items-center gap-2"
          >
            {isLast && !course.quiz ? "Complete course" : "Complete & continue"}{" "}
            <ArrowRight size={16} />
          </Button>
        )}
      </div>

      {/* Mobile sticky nav */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white dark:bg-[#111111] border-t border-[#E5E7EB] dark:border-[#2d2d2d] shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-4 py-3 flex items-center justify-between gap-3">
        <Button
          variant="secondary"
          size="md"
          onClick={handlePrev}
          disabled={moduleIndex === 0}
          className="px-3"
        >
          <ChevronLeft size={16} />
        </Button>
        <p className="font-body text-xs text-[#9CA3AF] dark:text-[#6B7280] truncate flex-1 text-center">
          {mod.title}
        </p>
        {needsQuiz ? (
          <Button
            size="md"
            onClick={() =>
              router.push(`/learn/courses/${slug}/modules/${moduleId}/quiz`)
            }
            className="px-3"
          >
            <ArrowRight size={16} />
          </Button>
        ) : isCompleted ? (
          isLast && course.quiz ? (
            <Button
              size="md"
              onClick={() => router.push(`/learn/courses/${slug}/quiz`)}
              className="px-3"
            >
              <ArrowRight size={16} />
            </Button>
          ) : isLast && isCoursePassed ? (
            <Button
              size="md"
              asChild
              className="px-3 bg-green-600 hover:bg-green-700 border-0"
            >
              <Link href={certHref} target="_blank">
                <Award size={16} />
              </Link>
            </Button>
          ) : (
            <Button
              size="md"
              onClick={
                isLast
                  ? handleComplete
                  : () =>
                      router.push(
                        `/learn/courses/${slug}/modules/${modules[moduleIndex + 1].id}`,
                      )
              }
              loading={completing}
              className="px-3"
            >
              {isLast ? <Trophy size={16} /> : <ArrowRight size={16} />}
            </Button>
          )
        ) : (
          <Button
            size="md"
            onClick={handleComplete}
            disabled={completing}
            loading={completing}
            className="px-3"
          >
            <ArrowRight size={16} />
          </Button>
        )}
      </div>
    </div>
  );
}

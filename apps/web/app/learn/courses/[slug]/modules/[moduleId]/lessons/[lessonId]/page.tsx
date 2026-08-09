"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight, ChevronLeft, CheckCircle2, ClipboardCheck } from "lucide-react";
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
import {
  nextAfterLesson,
  lessonQuizHref,
} from "../../../../lib/lesson-navigation";
import CodePlayground from "@/components/playground/CodePlayground";
import { CodeBlockPreviewButton } from "@/components/CodeBlockPreviewButton";

function TextBlock({ block }: { block: StudentBlock }) {
  return <TiptapViewer content={block.content ?? ""} />;
}

function ImageBlock({ block }: { block: StudentBlock }) {
  if (!block.url) return null;
  return (
    <figure className="flex flex-col gap-2">
      <div
        className="relative w-full rounded-xl overflow-hidden bg-surface-muted"
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
        <figcaption className="font-body text-xs text-muted-contrast text-center">
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
}

interface CodeBlockProps {
  block: StudentBlock;
  linkedBlocks?: StudentBlock[];
}

function CodeBlock({ block, linkedBlocks = [] }: CodeBlockProps) {
  const isPreviewable = ["html", "css", "javascript"].includes(
    block.language || "",
  );

  return (
    <div className="my-4 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="bg-gray-800 dark:bg-gray-900 text-white text-xs px-3 py-1.5 font-mono">
        {block.language?.toUpperCase() || "CODE"}
      </div>
      <div className="p-0">
        <CodeEditor
          value={block.content ?? ""}
          language={(block.language ?? "javascript") as CodeLanguage}
          onValueChange={() => {}}
          onLanguageChange={() => {}}
          readOnly
        />
      </div>
      {isPreviewable && (
        <div className="bg-gray-50 dark:bg-gray-800 px-3 py-2 border-t border-gray-200 dark:border-gray-700">
          <CodeBlockPreviewButton
            blockId={block.id}
            language={block.language || "html"}
            content={block.content || ""}
            linkedBlocks={linkedBlocks
              .filter((b) => b.id !== block.id)
              .map((b) => ({
                language: b.language || "",
                content: b.content || "",
                blockId: b.id,
              }))}
          />
        </div>
      )}
    </div>
  );
}

// Helper function to group code blocks by linkedGroupId
function groupCodeBlocks(blocks: StudentBlock[]): Map<string, StudentBlock[]> {
  const groups = new Map<string, StudentBlock[]>();
  let currentTempGroup: StudentBlock[] = [];
  let tempGroupId = 0;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    if (block.type !== "code") {
      // Non-code block breaks the group
      if (currentTempGroup.length > 0) {
        const groupId = `temp-${tempGroupId++}`;
        groups.set(groupId, [...currentTempGroup]);
        currentTempGroup = [];
      }
      continue;
    }

    if (block.linkedGroupId) {
      // Explicitly linked group
      if (!groups.has(block.linkedGroupId)) {
        groups.set(block.linkedGroupId, []);
      }
      groups.get(block.linkedGroupId)!.push(block);
    } else {
      // Auto-group consecutive code blocks
      currentTempGroup.push(block);
    }
  }

  // Handle last temp group
  if (currentTempGroup.length > 0) {
    const groupId = `temp-${tempGroupId++}`;
    groups.set(groupId, [...currentTempGroup]);
  }

  return groups;
}

function BlockRenderer({
  block,
  allBlocks,
}: {
  block: StudentBlock;
  allBlocks: StudentBlock[];
}) {
  if (block.type === "text") return <TextBlock block={block} />;
  if (block.type === "image") return <ImageBlock block={block} />;
  if (block.type === "playground") {
    return (
      <CodePlayground
        initialHTML={block.playgroundData?.html}
        initialCSS={block.playgroundData?.css}
        initialJS={block.playgroundData?.js}
      />
    );
  }
  if (block.type === "code") {
    // Find the group this block belongs to
    const codeGroups = groupCodeBlocks(allBlocks);
    const group =
      Array.from(codeGroups.values()).find((g) =>
        g.some((b) => b.id === block.id),
      ) || [];

    return (
      <CodeBlock
        block={block}
        linkedBlocks={group.filter((b) => b.id !== block.id)}
      />
    );
  }
  return null;
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
  const lessonIndex = lessons.findIndex((l) => l.id === lessonId);
  const currentLesson = lessons[lessonIndex];
  const isLastLesson = lessonIndex === lessons.length - 1;
  const isCompleted = currentLesson?.isCompleted ?? false;

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
  const quizHref = lessonQuizHref(slug, moduleId, lessonId);

  function goNext() {
    router.push(nextAfterLesson({ slug, course: course!, mod: mod!, lessonId }));
  }

  // No quiz on this lesson: the button click is the explicit intent, so
  // completing and navigating together is correct here.
  function handleCompleteWithoutQuiz() {
    completeLesson(lessonId, { onSuccess: goNext });
  }

  // Passing the quiz and recording the completion are two requests. If the
  // second one never landed, the lesson is passed but not complete, and the
  // next lesson is still locked. Record it before moving on.
  function handleContinueAfterQuiz() {
    if (isCompleted) {
      goNext();
      return;
    }
    completeLesson(lessonId, { onSuccess: goNext });
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
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary-soft text-primary font-body text-xs font-semibold">
          Lesson {lessonIndex + 1} of {lessons.length}
        </span>
        {isCompleted && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 dark:bg-green-600 dark:text-white font-body text-xs font-medium border border-green-200 dark:border-green-600">
            <CheckCircle2 size={11} /> Completed
          </span>
        )}
      </div>

      {/* Content card */}
      <div className="bg-surface-card rounded-2xl border border-border shadow-sm p-6 sm:p-8">
        <h2 className="font-heading font-black text-2xl text-foreground mb-6">
          {lesson.title}
        </h2>
        <div className="flex flex-col gap-6">
          {lesson.blocks.map((block) => (
            <BlockRenderer
              key={block.id}
              block={block}
              allBlocks={lesson.blocks}
            />
          ))}
        </div>

        {/* The quiz lives on its own page. Sending the student there is the
            only thing this page does about it. */}
        {hasQuiz ? (
          <div className="mt-8 pt-6 border-t border-border flex flex-wrap items-center gap-3">
            <Button
              size="md"
              variant={quizPassed ? "secondary" : "primary"}
              onClick={() => router.push(quizHref)}
              className="flex items-center gap-2"
            >
              {quizPassed ? "Review quiz" : "Take quiz"}{" "}
              <ClipboardCheck size={16} />
            </Button>
            {quizPassed && (
              <Button
                size="md"
                onClick={handleContinueAfterQuiz}
                loading={completing}
                disabled={completing}
                className="flex items-center gap-2"
              >
                {isLastLesson ? "Continue" : "Next lesson"}{" "}
                <ArrowRight size={16} />
              </Button>
            )}
          </div>
        ) : (
          !isCompleted && (
            <div className="mt-8 pt-6 border-t border-border">
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
          )
        )}
      </div>

      {/* Desktop nav */}
      <div className="hidden lg:flex flex-row items-center justify-between gap-3 mt-8 pt-6 border-t border-border">
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
          <Button size="md" onClick={goNext} className="flex items-center gap-2">
            Continue <ArrowRight size={16} />
          </Button>
        ) : null}
      </div>

      {/* Mobile sticky nav */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-surface-shell border-t border-border shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-4 py-3 flex items-center justify-between gap-3">
        <Button
          variant="secondary"
          size="md"
          onClick={handlePrev}
          disabled={lessonIndex === 0}
          className="px-3"
        >
          <ChevronLeft size={16} />
        </Button>
        <p className="font-body text-xs text-muted-contrast truncate flex-1 text-center">
          {lesson.title}
        </p>
        {isCompleted && !isLastLesson ? (
          <Button size="md" onClick={handleNext} className="px-3">
            <ArrowRight size={16} />
          </Button>
        ) : isCompleted && isLastLesson ? (
          <Button size="md" onClick={goNext} className="px-3">
            <ArrowRight size={16} />
          </Button>
        ) : null}
      </div>
    </div>
  );
}

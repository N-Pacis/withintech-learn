'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  usePublishedCourse,
  useStudentModule,
  useCompleteModule,
  type StudentBlock,
  type StudentModuleDetail,
} from '@/hooks/queries/courses';
import { Button, PageLoader } from '@/components/ui';
import { Stepper, type StepperStep } from '@/components/ui/Stepper';
import { CodeEditor, type CodeLanguage } from '@/components/ui/CodeEditor';
import { QuizSection } from './components/QuizSection';

// ─── Block renderers ───────────────────────────────────────────────────────────

function TextBlock({ block }: { block: StudentBlock }) {
  return (
    <p className="font-body text-[#374151] text-base leading-relaxed whitespace-pre-wrap">
      {block.content}
    </p>
  );
}

function ImageBlock({ block }: { block: StudentBlock }) {
  if (!block.url) return null;
  return (
    <figure className="flex flex-col gap-2">
      <div className="relative w-full rounded-xl overflow-hidden bg-[#F3F4F6]" style={{ aspectRatio: '16/9' }}>
        <Image src={block.url} alt={block.caption ?? ''} fill className="object-cover" unoptimized />
      </div>
      {block.caption && (
        <figcaption className="font-body text-xs text-[#9CA3AF] text-center">{block.caption}</figcaption>
      )}
    </figure>
  );
}

function CodeBlock({ block }: { block: StudentBlock }) {
  return (
    <CodeEditor
      value={block.content ?? ''}
      language={(block.language ?? 'javascript') as CodeLanguage}
      onValueChange={() => {}}
      onLanguageChange={() => {}}
      readOnly
    />
  );
}

function BlockRenderer({ block }: { block: StudentBlock }) {
  if (block.type === 'text') return <TextBlock block={block} />;
  if (block.type === 'image') return <ImageBlock block={block} />;
  return <CodeBlock block={block} />;
}

// ─── Module content ───────────────────────────────────────────────────────────

function ModuleContent({
  slug,
  moduleId,
  onCanCompleteChange,
}: {
  slug: string;
  moduleId: string;
  onCanCompleteChange: (v: boolean) => void;
}) {
  const { data: mod, isLoading } = useStudentModule(slug, moduleId);

  // Derive passability from server data; reset to false while data is loading
  useEffect(() => {
    if (!mod) {
      onCanCompleteChange(false);
      return;
    }
    onCanCompleteChange(!mod.quiz || mod.lastAttempt?.status === 'pass');
  }, [mod, onCanCompleteChange]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 rounded-full border-2 border-[#3D006B] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!mod) return null;

  return (
    <ModuleView slug={slug} moduleId={moduleId} mod={mod} onPass={() => onCanCompleteChange(true)} />
  );
}

function ModuleView({ slug, moduleId, mod, onPass }: { slug: string; moduleId: string; mod: StudentModuleDetail; onPass: () => void }) {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-heading font-black text-2xl text-[#0F0F0F]">{mod.title}</h2>
      <div className="flex flex-col gap-6">
        {mod.blocks.map((block) => (
          <BlockRenderer key={block.id} block={block} />
        ))}
      </div>
      {mod.quiz && (
        <QuizSection slug={slug} moduleId={moduleId} quiz={mod.quiz} lastAttempt={mod.lastAttempt} onPass={onPass} />
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CoursePage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: course, isLoading, isError } = usePublishedCourse(slug);
  const { mutate: completeModuleMutation, isPending: completing } = useCompleteModule(slug);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [canComplete, setCanComplete] = useState(false);

  // Initialize completedIds + reset index when course loads/changes
  useEffect(() => {
    if (!course) return;
    setCompletedIds(new Set(course.modules.filter((m) => m.isCompleted).map((m) => m.id)));
    const firstIncomplete = course.modules.findIndex((m) => !m.isCompleted);
    setCurrentIndex(firstIncomplete === -1 ? course.modules.length - 1 : firstIncomplete);
  }, [course?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCanCompleteChange = useCallback((v: boolean) => setCanComplete(v), []);

  if (isLoading) return <PageLoader type="content" />;

  if (isError || !course) {
    return (
      <div className="px-6 py-10 max-w-3xl mx-auto">
        <p className="font-body text-sm text-red-500">Failed to load course.</p>
      </div>
    );
  }

  const modules = course.modules;
  const currentModule = modules[currentIndex];

  if (!currentModule) return null;

  const steps: StepperStep[] = modules.map((m) => ({
    id: m.id,
    label: m.title,
    isCompleted: completedIds.has(m.id),
  }));

  function handleNext() {
    if (!currentModule) return;
    completeModuleMutation(currentModule.id, {
      onSuccess: () => {
        setCompletedIds((prev) => new Set([...prev, currentModule.id]));
        if (currentIndex < modules.length - 1) setCurrentIndex(currentIndex + 1);
      },
    });
  }

  function handlePrev() {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  }

  function handleStepClick(index: number) {
    setCurrentIndex(index);
  }

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === modules.length - 1;
  const isCurrentCompleted = completedIds.has(currentModule.id);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">

      {/* Top bar */}
      <div className="bg-white border-b border-[#E5E7EB] px-6 py-4 flex items-center gap-4">
        <Link
          href="/learn"
          className="inline-flex items-center gap-1.5 font-body text-sm text-[#6B7280] hover:text-[#3D006B] transition-colors shrink-0"
        >
          <ArrowLeft size={15} />
          All courses
        </Link>
        <h1 className="font-heading font-bold text-base text-[#0F0F0F] truncate">{course.title}</h1>
      </div>

      {/* Module roadmap */}
      <div className="bg-white border-b border-[#E5E7EB] px-6 py-6">
        <div className="max-w-4xl mx-auto overflow-x-auto">
          <div className="min-w-max">
            <Stepper
              steps={steps}
              currentStep={currentIndex}
              onStepClick={handleStepClick}
            />
          </div>
        </div>
      </div>

      {/* Module content */}
      <div className="max-w-3xl mx-auto px-6 py-10">

        <p className="font-body text-xs text-[#9CA3AF] uppercase tracking-widest mb-6">
          Module {currentIndex + 1} of {modules.length}
        </p>

        <ModuleContent
          key={currentModule.id}
          slug={slug}
          moduleId={currentModule.id}
          onCanCompleteChange={handleCanCompleteChange}
        />

        {/* Navigation */}
        <div className="flex items-center justify-between mt-12 pt-8 border-t border-[#E5E7EB]">
          <Button
            variant="secondary"
            size="md"
            onClick={handlePrev}
            disabled={isFirst}
            className="flex items-center gap-2"
          >
            <ChevronLeft size={16} /> Previous
          </Button>

          {isLast ? (
            isCurrentCompleted ? (
              <Button variant="secondary" size="md" asChild>
                <Link href="/learn">Back to courses</Link>
              </Button>
            ) : (
              <Button
                size="md"
                onClick={handleNext}
                disabled={!canComplete || completing}
                loading={completing}
                className="flex items-center gap-2"
              >
                Complete module <ArrowRight size={16} />
              </Button>
            )
          ) : (
            <Button
              size="md"
              onClick={handleNext}
              disabled={!canComplete || completing}
              loading={completing}
              className="flex items-center gap-2"
            >
              {isCurrentCompleted ? 'Next module' : 'Complete & continue'} <ArrowRight size={16} />
            </Button>
          )}
        </div>

      </div>
    </div>
  );
}

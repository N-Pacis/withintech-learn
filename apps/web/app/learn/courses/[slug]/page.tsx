'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, ChevronLeft, Trophy, Award, CheckCircle2 } from 'lucide-react';
import {
  usePublishedCourse,
  useStudentModule,
  useCompleteModule,
  type StudentBlock,
  type StudentModuleDetail,
  type StudentModuleQuiz,
  type QuizAttemptSummary,
} from '@/hooks/queries/courses';
import { useProfile } from '@/hooks/queries/auth';
import { Button, PageLoader } from '@/components/ui';
import { CodeEditor, type CodeLanguage } from '@/components/ui/CodeEditor';
import { TiptapViewer } from '@/components/ui/TiptapEditor';
import { QuizSection } from './components/QuizSection';
import { cn } from '@/lib/utils';

// ─── Block renderers ───────────────────────────────────────────────────────────

function TextBlock({ block }: { block: StudentBlock }) {
  return <TiptapViewer content={block.content ?? ''} />;
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

  return <ModuleView slug={slug} moduleId={moduleId} mod={mod} onPass={() => onCanCompleteChange(true)} />;
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

// ─── Course quiz step ─────────────────────────────────────────────────────────

function CourseQuizStep({
  slug,
  quiz,
  lastAttempt,
  onPass,
}: {
  slug: string;
  quiz: StudentModuleQuiz;
  lastAttempt: QuizAttemptSummary | null;
  onPass: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-[#F3E8FF] border border-[#E9D5FF]">
        <div className="w-9 h-9 rounded-full bg-[#3D006B] flex items-center justify-center shrink-0">
          <Trophy size={16} className="text-white" />
        </div>
        <div>
          <p className="font-heading font-bold text-sm text-[#0F0F0F]">Final Course Quiz</p>
          <p className="font-body text-xs text-[#6B7280] mt-0.5">Pass to complete the course. Answers are not revealed.</p>
        </div>
      </div>
      <QuizSection
        slug={slug}
        moduleId="course-quiz"
        quiz={quiz}
        lastAttempt={lastAttempt}
        onPass={onPass}
      />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CoursePage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: course, isLoading, isError } = usePublishedCourse(slug);
  const { data: profile } = useProfile();
  const { mutate: completeModuleMutation, isPending: completing } = useCompleteModule(slug);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [courseQuizPassed, setCourseQuizPassed] = useState(false);
  const [localCoursePassed, setLocalCoursePassed] = useState(false);
  const [canComplete, setCanComplete] = useState(false);
  const [readProgress, setReadProgress] = useState(0);

  const [prevCourseId, setPrevCourseId] = useState<string | undefined>(course?.id);
  if (course && course.id !== prevCourseId) {
    setCourseQuizPassed(course.lastCourseQuizAttempt?.status === 'pass');
    const firstIncomplete = course.modules.findIndex((m) => !m.isCompleted);
    const allDone = firstIncomplete === -1;
    if (allDone && course.quiz) {
      setCurrentIndex(course.modules.length);
    } else if (allDone) {
      setCurrentIndex(course.modules.length - 1);
    } else {
      setCurrentIndex(firstIncomplete);
    }
    setPrevCourseId(course.id);
  }

  // Scroll to top on module change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setReadProgress(0);
  }, [currentIndex]);

  // Reading progress bar
  useEffect(() => {
    const onScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setReadProgress(docHeight > 0 ? Math.min(100, (window.scrollY / docHeight) * 100) : 100);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [currentIndex]);

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
  const quizStepIndex = modules.length;
  const isOnQuizStep = !!course.quiz && currentIndex === quizStepIndex;
  const currentModule = !isOnQuizStep ? modules[currentIndex] : null;

  if (!isOnQuizStep && !currentModule) return null;

  function handleStepClick(index: number) {
    const isQuiz = index === quizStepIndex;
    if (isQuiz && !allModulesDone) return;
    if (!isQuiz && modules[index]?.isLocked) return;
    setCurrentIndex(index);
  }

  function handleNext() {
    if (!currentModule) return;
    const goToQuizStep = isLast && !!course!.quiz;
    const goToCert = isLast && !course!.quiz;
    completeModuleMutation(currentModule.id, {
      onSuccess: () => {
        if (goToQuizStep) {
          setCurrentIndex(quizStepIndex);
        } else if (goToCert) {
          // Backend auto-completes the course — just navigate to certificate
          setLocalCoursePassed(true);
          window.open(`/certificates/${profile!.id}/${course!.slug}`, '_blank');
        } else {
          setCurrentIndex(currentIndex + 1);
        }
      },
    });
  }

  function handlePrev() {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  }

  function handleCompleteCourse() {
    setLocalCoursePassed(true);
    window.open(`/certificates/${profile!.id}/${course!.slug}`, '_blank');
  }

  const isFirst = currentIndex === 0;
  const isLast = !isOnQuizStep && currentIndex === modules.length - 1;
  const isCurrentCompleted = currentModule?.isCompleted ?? false;
  const isCoursePassed = course.enrollment_status === 'PASSED' || localCoursePassed;
  const certHref = `/certificates/${profile?.id}/${course.slug}`;

  const allModulesDone = modules.every((m) => m.isCompleted);

  const totalSteps = modules.length + (course.quiz ? 1 : 0);
  const completedCount = modules.filter((m) => m.isCompleted).length + (courseQuizPassed ? 1 : 0);
  const overallProgress = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  return (
    <div className="min-h-screen bg-dots">

      {/* Reading progress bar — fixed just below the sticky navbar */}
      <div
        className="fixed top-16 left-0 h-0.5 bg-[#3D006B] z-40 transition-all duration-200 ease-out"
        style={{ width: `${readProgress}%` }}
      />

      <div className="lg:flex">

        {/* ── Desktop sidebar ──────────────────────────────────────────────── */}
        <aside className="hidden lg:flex flex-col w-64 xl:w-72 bg-white border-r border-[#E5E7EB] sticky top-16 h-[calc(100vh-4rem)] shrink-0">

          {/* Course header in sidebar */}
          <div className="px-4 pt-5 pb-4 border-b border-[#E5E7EB]">
            <Link
              href="/learn"
              className="inline-flex items-center gap-1.5 font-body text-xs text-[#9CA3AF] hover:text-[#3D006B] transition-colors mb-3"
            >
              <ArrowLeft size={13} /> All courses
            </Link>
            <h2 className="font-heading font-bold text-sm text-[#0F0F0F] leading-snug line-clamp-2">
              {course.title}
            </h2>
            {/* Overall progress */}
            <div className="flex items-center gap-2 mt-3">
              <div className="flex-1 h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#3D006B] rounded-full transition-all duration-500"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              <span className="font-body text-xs text-[#9CA3AF] shrink-0">{overallProgress}%</span>
            </div>
          </div>

          {/* Module list */}
          <nav className="flex-1 overflow-y-auto py-2">
            {modules.map((m, i) => {
              const isActive = !isOnQuizStep && currentIndex === i;
              const isDone = m.isCompleted;
              const locked = m.isLocked;
              return (
                <button
                  key={m.id}
                  onClick={() => handleStepClick(i)}
                  disabled={locked}
                  className={cn(
                    'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors',
                    locked
                      ? 'opacity-40 cursor-not-allowed'
                      : isActive
                      ? 'bg-[#F3E8FF]'
                      : 'hover:bg-[#FAFAFA]',
                  )}
                >
                  <span className={cn(
                    'w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold transition-colors',
                    isDone
                      ? 'bg-green-100 text-green-700'
                      : isActive
                      ? 'bg-[#3D006B] text-white'
                      : 'bg-[#E5E7EB] text-[#9CA3AF]',
                  )}>
                    {isDone ? <CheckCircle2 size={11} /> : i + 1}
                  </span>
                  <span className={cn(
                    'font-body text-sm leading-snug',
                    isActive ? 'font-semibold text-[#3D006B]' : isDone ? 'text-[#374151]' : 'text-[#6B7280]',
                  )}>
                    {m.title}
                  </span>
                </button>
              );
            })}

            {course.quiz && (
              <button
                onClick={() => handleStepClick(quizStepIndex)}
                disabled={!allModulesDone}
                className={cn(
                  'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors',
                  !allModulesDone
                    ? 'opacity-40 cursor-not-allowed'
                    : isOnQuizStep
                    ? 'bg-[#F3E8FF]'
                    : 'hover:bg-[#FAFAFA]',
                )}
              >
                <span className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors',
                  courseQuizPassed
                    ? 'bg-green-100 text-green-700'
                    : isOnQuizStep
                    ? 'bg-[#3D006B] text-white'
                    : 'bg-[#E5E7EB] text-[#9CA3AF]',
                )}>
                  {courseQuizPassed ? <CheckCircle2 size={11} /> : <Trophy size={10} />}
                </span>
                <span className={cn(
                  'font-body text-sm leading-snug',
                  isOnQuizStep ? 'font-semibold text-[#3D006B]' : 'text-[#6B7280]',
                )}>
                  Final Quiz
                </span>
              </button>
            )}
          </nav>
        </aside>

        {/* ── Main content area ─────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">

          {/* Mobile top bar */}
          <div className="lg:hidden bg-white border-b border-[#E5E7EB] px-4 py-3 flex items-center gap-2">
            <Link
              href="/learn"
              className="inline-flex items-center gap-1.5 font-body text-sm text-[#6B7280] hover:text-[#3D006B] transition-colors shrink-0"
            >
              <ArrowLeft size={15} />
            </Link>
            <span className="text-[#D1D5DB] select-none">/</span>
            <h1 className="font-heading font-bold text-sm text-[#0F0F0F] truncate min-w-0">{course.title}</h1>
          </div>

          {/* Mobile progress bar */}
          <div className="lg:hidden bg-[#FAFAFA] border-b border-[#E5E7EB] px-4 py-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-body text-xs font-semibold text-[#0F0F0F]">
                {isOnQuizStep ? 'Final Quiz' : `Module ${currentIndex + 1} of ${modules.length}`}
              </span>
              <span className="font-body text-xs text-[#9CA3AF]">
                {completedCount}/{totalSteps} done
              </span>
            </div>
            <div className="h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#3D006B] rounded-full transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <p className="font-body text-xs text-[#6B7280] truncate">
              {isOnQuizStep ? 'Final Quiz' : currentModule?.title}
            </p>
          </div>

          {/* Page content */}
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-32 lg:pb-10">

            {isOnQuizStep ? (
              <>
                <div className="flex items-center gap-2 mb-6">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3E8FF] text-[#3D006B] font-body text-xs font-semibold">
                    <Trophy size={11} /> Final Quiz
                  </span>
                </div>
                <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6 sm:p-8">
                  <CourseQuizStep
                    slug={slug}
                    quiz={course.quiz!}
                    lastAttempt={course.lastCourseQuizAttempt}
                    onPass={() => { setCourseQuizPassed(true); setLocalCoursePassed(true); }}
                  />
                </div>
                {/* Desktop nav */}
                <div className="hidden lg:flex flex-row items-center justify-between gap-3 mt-8 pt-6 border-t border-[#E5E7EB]">
                  <NavPrev onClick={handlePrev} />
                  <NavQuizRight
                    isCoursePassed={isCoursePassed}
                    courseQuizPassed={courseQuizPassed}
                    certHref={certHref}
                    onComplete={handleCompleteCourse}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#F3E8FF] text-[#3D006B] font-body text-xs font-semibold">
                    Module {currentIndex + 1} of {modules.length}
                  </span>
                  {isCurrentCompleted && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 font-body text-xs font-medium border border-green-200">
                      <CheckCircle2 size={11} />
                      Completed
                    </span>
                  )}
                </div>

                <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6 sm:p-8">
                  <ModuleContent
                    key={currentModule!.id}
                    slug={slug}
                    moduleId={currentModule!.id}
                    onCanCompleteChange={handleCanCompleteChange}
                  />
                </div>

                {/* Desktop nav */}
                <div className="hidden lg:flex flex-row items-center justify-between gap-3 mt-8 pt-6 border-t border-[#E5E7EB]">
                  <NavPrev onClick={handlePrev} disabled={isFirst} />
                  <NavModuleRight
                    isLast={isLast}
                    isCurrentCompleted={isCurrentCompleted}
                    isCoursePassed={isCoursePassed}
                    hasQuiz={!!course.quiz}
                    certHref={certHref}
                    canComplete={canComplete}
                    completing={completing}
                    onNext={handleNext}
                    onGoToQuiz={() => setCurrentIndex(quizStepIndex)}
                    onCompleteCourse={handleCompleteCourse}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile sticky bottom nav ──────────────────────────────────────────── */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-[#E5E7EB] shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-4 py-3 flex items-center justify-between gap-3">
        <NavPrev onClick={handlePrev} disabled={isFirst} compact />
        <div className="flex-1 text-center">
          <p className="font-body text-xs text-[#9CA3AF] truncate">
            {isOnQuizStep ? 'Final Quiz' : currentModule?.title}
          </p>
        </div>
        {isOnQuizStep ? (
          <NavQuizRight
            isCoursePassed={isCoursePassed}
            courseQuizPassed={courseQuizPassed}
            certHref={certHref}
            onComplete={handleCompleteCourse}
            compact
          />
        ) : (
          <NavModuleRight
            isLast={isLast}
            isCurrentCompleted={isCurrentCompleted}
            isCoursePassed={isCoursePassed}
            hasQuiz={!!course.quiz}
            certHref={certHref}
            canComplete={canComplete}
            completing={completing}
            onNext={handleNext}
            onGoToQuiz={() => setCurrentIndex(quizStepIndex)}
            onCompleteCourse={handleCompleteCourse}
            compact
          />
        )}
      </div>
    </div>
  );
}

// ─── Nav button helpers ───────────────────────────────────────────────────────

function NavPrev({ onClick, disabled, compact }: { onClick: () => void; disabled?: boolean; compact?: boolean }) {
  return (
    <Button
      variant="secondary"
      size="md"
      onClick={onClick}
      disabled={disabled}
      className={cn('flex items-center gap-2', compact && 'px-3')}
    >
      <ChevronLeft size={16} />
      {!compact && 'Previous'}
    </Button>
  );
}

function NavModuleRight({
  isLast, isCurrentCompleted, isCoursePassed, hasQuiz, certHref,
  canComplete, completing,
  onNext, onGoToQuiz, onCompleteCourse, compact,
}: {
  isLast: boolean;
  isCurrentCompleted: boolean;
  isCoursePassed: boolean;
  hasQuiz: boolean;
  certHref: string;
  canComplete: boolean;
  completing: boolean;
  onNext: () => void;
  onGoToQuiz: () => void;
  onCompleteCourse: () => void;
  compact?: boolean;
}) {
  if (isLast) {
    if (isCurrentCompleted) {
      if (hasQuiz) {
        return (
          <Button size="md" onClick={onGoToQuiz} className={cn('flex items-center gap-2', compact && 'px-3')}>
            {!compact && 'Final quiz'} <ArrowRight size={16} />
          </Button>
        );
      }
      if (isCoursePassed) {
        return (
          <Button size="md" asChild className={cn('flex items-center gap-2 bg-green-600 hover:bg-green-700 border-0', compact && 'px-3')}>
            <Link href={certHref} target="_blank" rel="noopener noreferrer">
              {!compact && 'Certificate'} <Award size={16} />
            </Link>
          </Button>
        );
      }
      return (
        <Button
          size="md"
          onClick={onCompleteCourse}
          className={cn('flex items-center gap-2', compact && 'px-3')}
        >
          {!compact && 'Complete course'} <Trophy size={16} />
        </Button>
      );
    }
    return (
      <Button
        size="md"
        onClick={onNext}
        disabled={!canComplete || completing}
        loading={completing}
        className={cn('flex items-center gap-2', compact && 'px-3')}
      >
        {!compact && (hasQuiz ? 'Complete module' : 'Complete course')} <Trophy size={16} />
      </Button>
    );
  }

  return (
    <Button
      size="md"
      onClick={onNext}
      disabled={!canComplete || completing}
      loading={completing}
      className={cn('flex items-center gap-2', compact && 'px-3')}
    >
      {!compact && (isCurrentCompleted ? 'Next module' : 'Complete & continue')} <ArrowRight size={16} />
    </Button>
  );
}

function NavQuizRight({
  isCoursePassed, courseQuizPassed, certHref, onComplete, compact,
}: {
  isCoursePassed: boolean;
  courseQuizPassed: boolean;
  certHref: string;
  onComplete: () => void;
  compact?: boolean;
}) {
  if (isCoursePassed || courseQuizPassed) {
    return (
      <Button size="md" asChild className={cn('flex items-center gap-2 bg-green-600 hover:bg-green-700 border-0', compact && 'px-3')}>
        <Link href={certHref} target="_blank" rel="noopener noreferrer">
          {!compact && 'Certificate'} <Award size={16} />
        </Link>
      </Button>
    );
  }
  return (
    <Button
      size="md"
      onClick={onComplete}
      disabled={!courseQuizPassed}
      className={cn('flex items-center gap-2', compact && 'px-3')}
    >
      {!compact && 'Complete course'} <Trophy size={16} />
    </Button>
  );
}

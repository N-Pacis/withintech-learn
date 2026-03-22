'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, ChevronLeft, Trophy, Award } from 'lucide-react';
import {
  usePublishedCourse,
  useStudentModule,
  useCompleteModule,
  useCompleteCourse,
  type StudentBlock,
  type StudentModuleDetail,
  type StudentModuleQuiz,
  type QuizAttemptSummary,
} from '@/hooks/queries/courses';
import { useProfile } from '@/hooks/queries/auth';
import { Button, PageLoader } from '@/components/ui';
import { Stepper, type StepperStep } from '@/components/ui/Stepper';
import { CodeEditor, type CodeLanguage } from '@/components/ui/CodeEditor';
import { TiptapViewer } from '@/components/ui/TiptapEditor';
import { QuizSection } from './components/QuizSection';

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
      {/* Reuse QuizSection — backend already strips isCorrect for course quizzes */}
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
  const { mutate: completeCourse, isPending: completingCourse } = useCompleteCourse(slug);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [canComplete, setCanComplete] = useState(false);
  const [courseQuizPassed, setCourseQuizPassed] = useState(false);

  const [prevCourseId, setPrevCourseId] = useState<string | undefined>(course?.id);
  if (course && course.id !== prevCourseId) {
    const ids = new Set(course.modules.filter((m) => m.isCompleted).map((m) => m.id));
    setCompletedIds(ids);
    setCourseQuizPassed(course.lastCourseQuizAttempt?.status === 'pass');

    const allDone = course.modules.every((m) => m.isCompleted);
    const firstIncomplete = course.modules.findIndex((m) => !m.isCompleted);

    if (allDone && course.quiz) {
      setCurrentIndex(course.modules.length); // quiz step
    } else if (firstIncomplete === -1) {
      setCurrentIndex(course.modules.length - 1);
    } else {
      setCurrentIndex(firstIncomplete);
    }
    setPrevCourseId(course.id);
  }

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
  const quizStepIndex = modules.length; // only valid when course.quiz exists
  const isOnQuizStep = !!course.quiz && currentIndex === quizStepIndex;
  const currentModule = !isOnQuizStep ? modules[currentIndex] : null;

  if (!isOnQuizStep && !currentModule) return null;

  // Build stepper steps
  const steps: StepperStep[] = [
    ...modules.map((m) => ({
      id: m.id,
      label: m.title,
      isCompleted: completedIds.has(m.id),
    })),
    ...(course.quiz
      ? [{
          id: 'course-quiz',
          label: 'Final Quiz',
          type: 'quiz' as const,
          isCompleted: courseQuizPassed,
        }]
      : []),
  ];

  function handleStepClick(index: number) {
    setCurrentIndex(index);
  }

  function handleNext() {
    if (!currentModule) return;
    const goToQuizStep = isLast && !!course!.quiz;
    const goToCert = isLast && !course!.quiz;
    completeModuleMutation(currentModule.id, {
      onSuccess: () => {
        setCompletedIds((prev) => new Set([...prev, currentModule.id]));
        if (goToQuizStep) {
          setCurrentIndex(quizStepIndex);
        } else if (goToCert) {
          completeCourse(undefined, {
            onSuccess: () => {
              window.open(`/certificates/${profile!.id}/${course!.slug}`, '_blank');
            },
          });
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
    completeCourse(undefined, {
      onSuccess: () => {
        window.open(`/certificates/${profile!.id}/${course!.slug}`, '_blank');
      },
    });
  }

  const isFirst = currentIndex === 0;
  const isLast = !isOnQuizStep && currentIndex === modules.length - 1;
  const isCurrentCompleted = currentModule ? completedIds.has(currentModule.id) : false;
  const isCoursePassed = course.enrollment_status === 'PASSED';
  const certHref = `/certificates/${profile?.id}/${course.slug}`;

  return (
    <div className="min-h-screen bg-dots">

      {/* Top bar */}
      <div className="bg-white border-b border-[#E5E7EB] px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3">
        <Link
          href="/learn"
          className="inline-flex items-center gap-1.5 font-body text-sm text-[#6B7280] hover:text-[#3D006B] transition-colors shrink-0"
        >
          <ArrowLeft size={15} />
          <span className="hidden sm:inline">All courses</span>
        </Link>
        <span className="text-[#D1D5DB] hidden sm:inline select-none">/</span>
        <h1 className="font-heading font-bold text-sm sm:text-base text-[#0F0F0F] truncate">{course.title}</h1>
      </div>

      {/* Module roadmap */}
      <div className="bg-[#FAFAFA] border-b border-[#E5E7EB] px-4 sm:px-6 py-5">
        <div className="max-w-4xl mx-auto overflow-x-auto scrollbar-none">
          <div className="min-w-max">
            <Stepper steps={steps} currentStep={currentIndex} onStepClick={handleStepClick} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

        {isOnQuizStep ? (
          // ── Course quiz step ──
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
                onPass={() => setCourseQuizPassed(true)}
              />
            </div>
            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 mt-8 pt-6 border-t border-[#E5E7EB]">
              <Button variant="secondary" size="md" onClick={handlePrev} className="flex items-center justify-center gap-2">
                <ChevronLeft size={16} /> Previous
              </Button>
              {!isCoursePassed ? (
                <Button size="md" asChild className="flex items-center gap-2 bg-green-600 hover:bg-green-700 border-0">
                  <Link href={certHref} target="_blank" rel="noopener noreferrer">Go to Certificate <Award size={16} /></Link>
                </Button>
              ) : (
                <Button
                  size="md"
                  onClick={handleCompleteCourse}
                  disabled={!courseQuizPassed || completingCourse}
                  loading={completingCourse}
                  className="flex items-center gap-2"
                >
                  Complete course <Trophy size={16} />
                </Button>
              )}
            </div>
          </>
        ) : (
          // ── Module step ──
          <>
            <div className="flex items-center justify-between mb-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#F3E8FF] text-[#3D006B] font-body text-xs font-semibold">
                Module {currentIndex + 1} of {modules.length}
              </span>
              {isCurrentCompleted && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 font-body text-xs font-medium border border-green-200">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
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

            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 mt-8 pt-6 border-t border-[#E5E7EB]">
              <Button
                variant="secondary"
                size="md"
                onClick={handlePrev}
                disabled={isFirst}
                className="flex items-center justify-center gap-2"
              >
                <ChevronLeft size={16} /> Previous
              </Button>

              {/* Right-side button logic */}
              {isLast ? (
                isCurrentCompleted ? (
                  course.quiz ? (
                    // Last module done, course has quiz → go to quiz step
                    <Button size="md" onClick={() => setCurrentIndex(quizStepIndex)} className="flex items-center gap-2">
                      Final quiz <ArrowRight size={16} />
                    </Button>
                  ) : isCoursePassed ? (
                    // No quiz, already passed → go to certificate
                    <Button size="md" asChild className="flex items-center gap-2 bg-green-600 hover:bg-green-700 border-0">
                      <Link href={certHref} target="_blank" rel="noopener noreferrer">Go to Certificate <Award size={16} /></Link>
                    </Button>
                  ) : (
                    // Last module done, no quiz → complete course
                    <Button
                      size="md"
                      onClick={handleCompleteCourse}
                      disabled={completingCourse}
                      loading={completingCourse}
                      className="flex items-center gap-2"
                    >
                      Complete course <Trophy size={16} />
                    </Button>
                  )
                ) : (
                  // Last module not yet done — complete module (+ course if no quiz)
                  <Button
                    size="md"
                    onClick={handleNext}
                    disabled={!canComplete || completing || completingCourse}
                    loading={completing || completingCourse}
                    className="flex items-center gap-2"
                  >
                    {course!.quiz ? 'Complete module' : 'Complete course'} <Trophy size={16} />
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
          </>
        )}
      </div>
    </div>
  );
}

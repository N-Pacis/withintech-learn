'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useModules, useAddModule } from '@/hooks/queries/modules';
import { Stepper, Button, FormField, Input, Card, CardBody, CardFooter, PageLoader } from '@/components/ui';
import { ModuleBlocksEditor } from '@/components/admin/ModuleBlocksEditor';
import { QuizBuilder } from '@/components/admin/QuizBuilder';

const STEPS = [
  { id: 'info', label: 'Module Info' },
  { id: 'blocks', label: 'Content Blocks' },
  { id: 'quiz', label: 'Quiz' },
];

type StepIndex = 0 | 1 | 2;

// ─── Step 1: Module Information ───────────────────────────────────────────────

function StepInfo({
  courseId,
  onNext,
}: {
  courseId: string;
  onNext: (moduleId: string) => void;
}) {
  const { data: modules, isLoading: modulesLoading } = useModules(courseId);
  const { mutateAsync: addModule, isPending } = useAddModule(courseId);

  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!modulesLoading) titleRef.current?.focus();
  }, [modulesLoading]);

  const nextOrder = (modules?.length ?? 0) + 1;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!title.trim()) {
      setError('Title is required.');
      titleRef.current?.focus();
      return;
    }
    try {
      const mod = await addModule({ title: title.trim(), orderIndex: nextOrder });
      onNext(mod.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create module.');
    }
  }

  if (modulesLoading) return <PageLoader type="list" count={2} />;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Card shadow="sm">
        <CardBody className="flex flex-col gap-5">
          <FormField
            label="Module Title"
            htmlFor="module-title"
            required
            hint="Give this module a clear, descriptive name."
          >
            <Input
              id="module-title"
              ref={titleRef}
              placeholder="e.g. Introduction to the Internet"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setError(''); }}
              maxLength={120}
            />
          </FormField>

          {/* Position indicator */}
          <div className="flex items-center gap-3 px-4 py-3 bg-[#F3E8FF]/50 rounded-lg border border-[#E5E7EB]">
            <div className="w-7 h-7 rounded-full bg-[#3D006B] flex items-center justify-center shrink-0">
              <span className="font-heading font-bold text-xs text-white">{nextOrder}</span>
            </div>
            <p className="font-body text-sm text-[#6B7280]">
              This will be{' '}
              <span className="text-[#0F0F0F] font-medium">module {nextOrder}</span>
              {modules && modules.length > 0
                ? `, after "${modules[modules.length - 1].title}"`
                : ' — the first module in this course'}
              .
            </p>
          </div>

          {error && (
            <p className="font-body text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-lg">
              {error}
            </p>
          )}
        </CardBody>
        <CardFooter className="flex items-center justify-end">
          <Button type="submit" size="md" loading={isPending} disabled={!title.trim()}>
            Next — Add Content
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
            </svg>
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

// ─── Step 2: Content Blocks ───────────────────────────────────────────────────

function StepBlocks({
  moduleId,
  onBack,
  onNext,
}: {
  moduleId: string;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Card shadow="sm">
        <CardBody>
          <ModuleBlocksEditor moduleId={moduleId} />
        </CardBody>
        <CardFooter className="flex items-center justify-between">
          <Button variant="ghost" size="md" onClick={onBack}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
            </svg>
            Back
          </Button>
          <Button size="md" onClick={onNext}>
            Next — Quiz
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
            </svg>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// ─── Step 3: Quiz ─────────────────────────────────────────────────────────────

function StepQuiz({
  moduleId,
  onBack,
  onFinish,
}: {
  moduleId: string;
  onBack: () => void;
  onFinish: () => void;
}) {
  const [addingQuiz, setAddingQuiz] = useState(false);

  return (
    <div className="flex flex-col gap-4">

      {!addingQuiz ? (
        <div className="flex flex-col items-center text-center py-14 border-2 border-dashed border-[#E5E7EB] rounded-xl">
          <div className="w-14 h-14 rounded-full bg-[#F3E8FF] flex items-center justify-center mb-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3D006B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <h3 className="font-heading font-bold text-base text-[#0F0F0F] mb-1">
            Would you like to add a quiz?
          </h3>
          <p className="font-body text-sm text-[#6B7280] max-w-xs mb-6">
            Quizzes let you assess student understanding. You can always add or edit one later from the module page.
          </p>
          <div className="flex items-center gap-3">
            <Button size="md" onClick={() => setAddingQuiz(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add a Quiz
            </Button>
            <Button variant="ghost" size="md" onClick={onFinish}>
              Skip for now
            </Button>
          </div>
        </div>
      ) : (
        <QuizBuilder moduleId={moduleId} />
      )}

      <div className="flex items-center justify-between pt-2">
        <Button variant="ghost" size="md" onClick={onBack}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
          </svg>
          Back
        </Button>
        <Button size="md" onClick={onFinish}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Save & Finish
        </Button>
      </div>

    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const STEP_DESCRIPTIONS: Record<StepIndex, { title: string; subtitle: string }> = {
  0: {
    title: 'Module Information',
    subtitle: 'Give your module a title and set its position in the course.',
  },
  1: {
    title: 'Content Blocks',
    subtitle: 'Add text, images, and code blocks that make up this module.',
  },
  2: {
    title: 'Quiz',
    subtitle: 'Optionally add a quiz to assess student understanding.',
  },
};

export default function NewModulePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();

  const [step, setStep] = useState<StepIndex>(0);
  const [moduleId, setModuleId] = useState<string | null>(null);

  const { title, subtitle } = STEP_DESCRIPTIONS[step];

  function handleInfoNext(id: string) {
    setModuleId(id);
    setStep(1);
  }

  function handleBlocksBack() {
    setStep(0);
  }

  function handleBlocksNext() {
    setStep(2);
  }

  function handleQuizBack() {
    setStep(1);
  }

  function handleFinish() {
    router.push(`/admin/courses/${courseId}`);
  }

  return (
    <div className="p-8 lg:p-12 max-w-2xl">

      {/* Stepper */}
      <div className="mb-10">
        <Stepper steps={STEPS} currentStep={step} />
      </div>

      {/* Step header */}
      <div className="mb-6">
        <h1 className="font-heading font-black text-2xl text-[#0F0F0F]">{title}</h1>
        <p className="font-body text-sm text-[#6B7280] mt-1">{subtitle}</p>
      </div>

      {/* Step content */}
      {step === 0 && (
        <StepInfo courseId={courseId} onNext={handleInfoNext} />
      )}
      {step === 1 && moduleId && (
        <StepBlocks moduleId={moduleId} onBack={handleBlocksBack} onNext={handleBlocksNext} />
      )}
      {step === 2 && moduleId && (
        <StepQuiz moduleId={moduleId} onBack={handleQuizBack} onFinish={handleFinish} />
      )}

    </div>
  );
}

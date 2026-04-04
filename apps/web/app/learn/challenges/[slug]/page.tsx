'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, History, CheckCircle2, Send } from 'lucide-react';
import {
  useStudentChallenge,
  useSubmitChallenge,
  type ChallengeLanguage,
  type SubmissionResult,
  type StarterCode,
} from '@/hooks/queries/challenges';
import { Button } from '@/components/ui';
import { ChallengeEditor } from '@/components/ui/ChallengeEditor';
import { ProblemPanel } from './components/ProblemPanel';
import { SubmissionResults } from './components/SubmissionResults';
import { SubmissionHistory } from './components/SubmissionHistory';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { CHALLENGE_LANGUAGES, normalizeVisibleChallengeCode } from '@/lib/challenges';

// ─── Types ────────────────────────────────────────────────────────────────────

type RightTab = 'results' | 'history';

// ─── Workspace skeleton ───────────────────────────────────────────────────────

function WorkspaceSkeleton() {
  return (
    <div className="flex h-[calc(100vh-64px)] animate-pulse">
      {/* Problem panel skeleton */}
      <div className="w-[42%] border-r border-[#E5E7EB] p-5 flex flex-col gap-4 bg-white">
        <div className="flex items-center gap-3">
          <div className="h-6 flex-1 bg-[#E5E7EB] rounded-md" />
          <div className="h-5 w-16 bg-[#E5E7EB] rounded-full" />
        </div>
        <div className="flex flex-col gap-2">
          {[100, 80, 90, 60, 70, 85, 50].map((w, i) => (
            <div key={i} className="h-3.5 bg-[#E5E7EB] rounded" style={{ width: `${w}%` }} />
          ))}
        </div>
        <div className="h-32 bg-[#E5E7EB] rounded-lg mt-2" />
      </div>
      {/* Editor skeleton */}
      <div className="flex-1 flex flex-col">
        <div className="h-10 bg-[#2d2d2d] border-b border-[#3a3a3a]" />
        <div className="flex-1 bg-[#1e1e1e]" />
      </div>
    </div>
  );
}

// ─── Accepted banner ──────────────────────────────────────────────────────────

function AcceptedBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border-b border-green-200 animate-in slide-in-from-top duration-300">
      <CheckCircle2 size={18} className="text-green-600 shrink-0" />
      <span className="font-body text-sm font-medium text-green-800 flex-1">
        All test cases passed — challenge completed!
      </span>
      <button
        onClick={onDismiss}
        className="font-body text-xs text-green-600 hover:text-green-800 transition-colors"
      >
        Dismiss
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ChallengePage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: challenge, isLoading } = useStudentChallenge(slug);
  const submitMutation = useSubmitChallenge(slug);

  // Per-language code — persists across language switches
  const [codeByLang, setCodeByLang] = useState<Record<ChallengeLanguage, string>>({
    python: '', java: '', javascript: '', c: '', cpp: '', go: '',
  });
  const [language, setLanguage]       = useState<ChallengeLanguage>('python');
  const [rightTab, setRightTab]       = useState<RightTab>('results');
  const [lastResult, setLastResult]   = useState<SubmissionResult | null>(null);
  const [showBanner, setShowBanner]   = useState(false);
  const initialized                   = useRef(false);

  // Seed starter code from challenge once it loads — only once
  useEffect(() => {
    if (!challenge || initialized.current) return;
    initialized.current = true;
    const starter = challenge.starterCode as StarterCode;
    setCodeByLang({
      python: normalizeVisibleChallengeCode('python', starter.python),
      java: normalizeVisibleChallengeCode('java', starter.java),
      javascript: normalizeVisibleChallengeCode('javascript', starter.javascript),
      c: normalizeVisibleChallengeCode('c', starter.c),
      cpp: normalizeVisibleChallengeCode('cpp', starter.cpp),
      go: normalizeVisibleChallengeCode('go', starter.go),
    });
  }, [challenge]);

  const handleCodeChange = useCallback((v: string) => {
    setCodeByLang(prev => ({ ...prev, [language]: v }));
  }, [language]);

  const handleSubmit = useCallback(async () => {
    const code = codeByLang[language];
    if (!code.trim()) {
      toast.error('Write some code before submitting.');
      return;
    }

    const toastId = toast.loading('Running your code against test cases…');
    try {
      const res = await submitMutation.mutateAsync({ language, code });
      toast.dismiss(toastId);

      if (!res.data) {
        toast.error(res.message ?? 'Submission failed. Try again.');
        return;
      }

      setLastResult(res.data);
      setRightTab('results');

      if (res.data.status === 'accepted') {
        setShowBanner(true);
        toast.success(`Accepted — ${res.data.testsPassed}/${res.data.totalTests} tests passed`, {
          duration: 5000,
        });
      } else if (res.data.status === 'compile_error') {
        toast.error('Compile error — check your code.', { duration: 4000 });
      } else if (res.data.status === 'time_limit_exceeded') {
        toast.error('Time limit exceeded — optimize your solution.', { duration: 4000 });
      } else {
        toast.error(`${res.data.testsPassed}/${res.data.totalTests} tests passed.`, { duration: 4000 });
      }
    } catch {
      toast.dismiss(toastId);
      toast.error('Something went wrong. Please try again.');
    }
  }, [codeByLang, language, submitMutation]);

  // Keyboard shortcut: Cmd/Ctrl+Enter to submit
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!submitMutation.isPending) handleSubmit();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [handleSubmit, submitMutation.isPending]);

  if (isLoading) return <WorkspaceSkeleton />;

  if (!challenge) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="font-body text-sm text-[#6B7280]">Challenge not found.</p>
        <Link href="/learn/challenges">
          <Button variant="secondary" size="sm">Back to Challenges</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Accepted banner */}
      {showBanner && challenge.completed && (
        <AcceptedBanner onDismiss={() => setShowBanner(false)} />
      )}

      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-[#E5E7EB] bg-white shrink-0">
        <Link
          href="/learn/challenges"
          className="text-[#9CA3AF] hover:text-[#3D006B] transition-colors shrink-0"
          title="Back to challenges"
        >
          <ArrowLeft size={18} />
        </Link>

        <span className="font-heading font-semibold text-sm text-[#0F0F0F] flex-1 truncate">
          {challenge.title}
        </span>

        {challenge.completed && (
          <span className="hidden sm:flex items-center gap-1 font-body text-xs text-green-600 bg-green-50 px-2.5 py-1 rounded-full shrink-0">
            <CheckCircle2 size={12} />
            Solved
          </span>
        )}

        <Button
          variant="primary"
          size="sm"
          loading={submitMutation.isPending}
          onClick={handleSubmit}
          title="Submit (⌘ Enter)"
          className="shrink-0"
        >
          <Send size={13} className="mr-1" />
          Submit
        </Button>
      </div>

      {/* Main split */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* ── Left: Problem ───────────────────────────────────────────────── */}
        <div className="w-[42%] min-w-[280px] border-r border-[#E5E7EB] flex flex-col overflow-hidden bg-white">
          <div className="flex-1 overflow-y-auto">
            <ProblemPanel
              title={challenge.title}
              description={challenge.description}
              difficulty={challenge.difficulty}
              visibleTestCases={challenge.visibleTestCases}
            />
          </div>
        </div>

        {/* ── Right: Editor + Results ─────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">

          {/* Language selector bar */}
          <div className="flex items-center gap-1 px-3 py-2 bg-[#1e1e1e] border-b border-[#3a3a3a] shrink-0 overflow-x-auto">
            {CHALLENGE_LANGUAGES.map(l => (
              <button
                key={l.value}
                onClick={() => setLanguage(l.value)}
                className={cn(
                  'px-3 py-1 rounded font-mono text-xs font-medium whitespace-nowrap transition-colors',
                  language === l.value
                    ? 'bg-[#3D006B] text-white'
                    : 'text-[#9CA3AF] hover:text-white hover:bg-[#3a3a3a]',
                )}
              >
                {l.label}
              </button>
            ))}
            <div className="ml-auto pl-2 shrink-0">
              <span className="font-mono text-[10px] text-[#555] select-none hidden sm:block">
                ⌘↵ Submit
              </span>
            </div>
          </div>

          {/* Editor */}
          <div className="flex-1 overflow-hidden min-h-0">
            <ChallengeEditor
              value={codeByLang[language]}
              language={language}
              onValueChange={handleCodeChange}
            />
          </div>

          {/* Results / History drawer */}
          <div className="shrink-0 border-t border-[#E5E7EB] bg-white flex flex-col" style={{ maxHeight: '45%' }}>
            {/* Tabs */}
            <div className="flex items-center border-b border-[#E5E7EB] px-1 shrink-0">
              {([
                { id: 'results' as RightTab, label: 'Results' },
                { id: 'history' as RightTab, label: 'Submissions', icon: <History size={11} /> },
              ]).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setRightTab(tab.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-4 py-2.5 font-body text-xs font-medium transition-colors',
                    rightTab === tab.id
                      ? 'text-[#3D006B] border-b-2 border-[#3D006B]'
                      : 'text-[#6B7280] hover:text-[#3D006B]',
                  )}
                >
                  {tab.icon}
                  {tab.label}
                  {tab.id === 'results' && lastResult && (
                    <span className={cn(
                      'ml-1 w-1.5 h-1.5 rounded-full shrink-0',
                      lastResult.status === 'accepted' ? 'bg-green-500' : 'bg-red-400',
                    )} />
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="overflow-y-auto flex-1 min-h-0">
              {rightTab === 'results' ? (
                lastResult ? (
                  <SubmissionResults result={lastResult} />
                ) : (
                  <EmptyResultsState challenge={challenge} />
                )
              ) : (
                <SubmissionHistory slug={slug} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Empty results state ──────────────────────────────────────────────────────

function EmptyResultsState({ challenge }: { challenge: { visibleTestCases: { id: string; input: string; expectedOutput: string }[] } }) {
  return (
    <div className="p-5">
      <p className="font-body text-xs text-[#9CA3AF] mb-3">
        Write your solution and press <kbd className="font-mono bg-[#F3F4F6] border border-[#E5E7EB] rounded px-1 py-0.5 text-[10px]">⌘ Enter</kbd> or click <strong>Submit</strong> to run against all test cases.
      </p>
      {challenge.visibleTestCases.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="font-body text-xs font-medium text-[#6B7280] uppercase tracking-wider">Example test cases</p>
          {challenge.visibleTestCases.map((tc, i) => (
            <div key={tc.id} className="border border-[#E5E7EB] rounded-lg overflow-hidden text-xs font-mono">
              <div className="px-3 py-1.5 bg-[#F9FAFB] border-b border-[#E5E7EB] font-body text-[11px] text-[#9CA3AF]">
                Example {i + 1}
              </div>
              <div className="p-3 grid gap-2 bg-white">
                {tc.input !== '' && (
                  <div>
                    <div className="font-body text-[11px] text-[#9CA3AF] mb-0.5">Input</div>
                    <pre className="bg-[#F3F4F6] rounded px-2 py-1 whitespace-pre-wrap break-all">{tc.input}</pre>
                  </div>
                )}
                <div>
                  <div className="font-body text-[11px] text-[#9CA3AF] mb-0.5">Expected</div>
                  <pre className="bg-[#F3F4F6] rounded px-2 py-1 whitespace-pre-wrap break-all">{tc.expectedOutput}</pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

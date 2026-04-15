"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, History, Lock, Send } from "lucide-react";
import { useProfile } from "@/hooks/queries/auth";
import {
  usePublicChallenge,
  useStudentChallenge,
  useSubmitChallenge,
  type ChallengeLanguage,
  type FunctionParam,
  type PublicChallenge,
  type StudentChallenge,
  type SubmissionResult,
  type StarterCode,
} from "@/hooks/queries/challenges";
import { Badge, Button, WarningToast } from "@/components/ui";
import { ChallengeEditor } from "@/components/ui/ChallengeEditor";
import { ProblemPanel } from "@/app/learn/challenges/[slug]/components/ProblemPanel";
import { SubmissionResults } from "@/app/learn/challenges/[slug]/components/SubmissionResults";
import { SubmissionHistory } from "@/app/learn/challenges/[slug]/components/SubmissionHistory";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CHALLENGE_LANGUAGES, normalizeVisibleChallengeCode } from "@/lib/challenges";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ChallengeWorkspaceProps {
  slug: string;
  /** Where the back arrow navigates to (e.g. /challenges or /learn/challenges) */
  backHref: string;
  /** True when rendered inside the learn layout (which has a 64px top header) */
  isInsideLayout?: boolean;
}

// ─── Difficulty map ───────────────────────────────────────────────────────────

const DIFFICULTY_BADGE = {
  easy:   { variant: "success"  as const, label: "Easy"   },
  medium: { variant: "warning"  as const, label: "Medium" },
  hard:   { variant: "danger"   as const, label: "Hard"   },
};

type RightTab = "results" | "history";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function WorkspaceSkeleton({ isInsideLayout }: { isInsideLayout?: boolean }) {
  const h = isInsideLayout ? "h-[calc(100vh-64px)]" : "h-[100dvh]";
  return (
    <div className={cn("flex animate-pulse flex-col", h)}>
      <div className="h-[52px] bg-white dark:bg-[#1a1a1a] border-b border-[#E5E7EB] dark:border-[#2d2d2d] shrink-0" />
      <div className="hidden md:flex flex-1 overflow-hidden">
        <div className="w-[42%] border-r border-[#E5E7EB] dark:border-[#2d2d2d] p-5 flex flex-col gap-4 bg-white dark:bg-[#1a1a1a]">
          <div className="h-6 w-2/3 bg-[#E5E7EB] dark:bg-[#252525] rounded-md" />
          {[100, 80, 90, 60, 70, 85].map((w, i) => (
            <div key={i} className="h-3.5 bg-[#E5E7EB] dark:bg-[#252525] rounded" style={{ width: `${w}%` }} />
          ))}
          <div className="h-28 bg-[#E5E7EB] dark:bg-[#252525] rounded-lg mt-2" />
        </div>
        <div className="flex-1 flex flex-col">
          <div className="h-10 bg-[#2d2d2d] border-b border-[#3a3a3a]" />
          <div className="flex-1 bg-[#1e1e1e]" />
        </div>
      </div>
      <div className="md:hidden flex-1 p-5 flex flex-col gap-4 bg-white dark:bg-[#1a1a1a]">
        <div className="h-6 w-2/3 bg-[#E5E7EB] dark:bg-[#252525] rounded-md" />
        {[100, 80, 90, 60, 70].map((w, i) => (
          <div key={i} className="h-3.5 bg-[#E5E7EB] dark:bg-[#252525] rounded" style={{ width: `${w}%` }} />
        ))}
        <div className="mt-auto h-11 bg-[#E5E7EB] dark:bg-[#252525] rounded-lg" />
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

// ─── Input display (pretty-print structured test case input) ──────────────────

function InputDisplay({ input, params }: { input: string; params: FunctionParam[] | null }) {
  if (!params || params.length === 0) {
    return input ? (
      <pre className="bg-[#F3F4F6] dark:bg-[#252525] dark:text-[#D1D5DB] rounded px-2 py-1 whitespace-pre-wrap break-all text-xs font-mono">
        {input}
      </pre>
    ) : null;
  }
  let values: unknown[];
  try {
    values = JSON.parse(input) as unknown[];
  } catch {
    return (
      <pre className="bg-[#F3F4F6] dark:bg-[#252525] dark:text-[#D1D5DB] rounded px-2 py-1 whitespace-pre-wrap break-all text-xs font-mono">
        {input}
      </pre>
    );
  }
  return (
    <div className="flex flex-col gap-1">
      {params.map((p, i) => (
        <div key={p.name} className="flex items-start gap-1.5 text-xs font-mono">
          <span className="text-[#9CA3AF] shrink-0">{p.name} =</span>
          <pre className="bg-[#F3F4F6] dark:bg-[#252525] dark:text-[#D1D5DB] rounded px-1.5 py-0.5 whitespace-pre-wrap break-all flex-1">
            {Array.isArray(values[i]) ? JSON.stringify(values[i]) : String(values[i] ?? "")}
          </pre>
        </div>
      ))}
    </div>
  );
}

// ─── Empty results state ──────────────────────────────────────────────────────

function EmptyResultsState({
  challenge,
}: {
  challenge: {
    visibleTestCases: { id: string; input: string; expectedOutput: string }[];
    functionParams: FunctionParam[] | null;
  };
}) {
  return (
    <div className="p-5">
      <p className="font-body text-xs text-[#9CA3AF] mb-3">
        Write your solution and press{" "}
        <kbd className="font-mono bg-[#F3F4F6] dark:bg-[#252525] border border-[#E5E7EB] dark:border-[#2d2d2d] rounded px-1 py-0.5 text-[10px]">
          ⌘ Enter
        </kbd>{" "}
        or click <strong>Submit</strong> to run against all test cases.
      </p>
      {challenge.visibleTestCases.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="font-body text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider">
            Example test cases
          </p>
          {challenge.visibleTestCases.map((tc, i) => (
            <div
              key={tc.id}
              className="border border-[#E5E7EB] dark:border-[#2d2d2d] rounded-lg overflow-hidden text-xs font-mono"
            >
              <div className="px-3 py-1.5 bg-[#F9FAFB] dark:bg-[#141414] border-b border-[#E5E7EB] dark:border-[#2d2d2d] font-body text-[11px] text-[#9CA3AF] dark:text-[#6B7280]">
                Example {i + 1}
              </div>
              <div className="p-3 grid gap-2 bg-white dark:bg-[#1a1a1a]">
                {tc.input !== "" && (
                  <div>
                    <div className="font-body text-[11px] text-[#9CA3AF] mb-1">Input</div>
                    <InputDisplay input={tc.input} params={challenge.functionParams} />
                  </div>
                )}
                <div>
                  <div className="font-body text-[11px] text-[#9CA3AF] mb-0.5">Expected</div>
                  <pre className="bg-[#F3F4F6] rounded px-2 py-1 whitespace-pre-wrap break-all">
                    {tc.expectedOutput}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Locked workspace (unauthenticated) ──────────────────────────────────────

function LockedWorkspace({
  slug,
  challenge,
  backHref,
  isInsideLayout,
}: {
  slug: string;
  challenge: PublicChallenge | StudentChallenge;
  backHref: string;
  isInsideLayout?: boolean;
}) {
  const badge = DIFFICULTY_BADGE[challenge.difficulty];
  const signInHref = `/sign-in?next=/challenges/${slug}`;
  const h = isInsideLayout ? "h-[calc(100vh-64px)]" : "h-[100dvh]";
  const previewCode = useMemo(
    () => normalizeVisibleChallengeCode("python", (challenge.starterCode as StarterCode).python),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [(challenge.starterCode as StarterCode).python],
  );

  return (
    <div className={cn("flex flex-col", h)}>
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E5E7EB] dark:border-[#2d2d2d] bg-white dark:bg-[#1a1a1a] shrink-0">
        <Link
          href={backHref}
          className="text-[#9CA3AF] hover:text-[#3D006B] dark:hover:text-[#C084FC] transition-colors shrink-0"
          title="Back to challenges"
        >
          <ArrowLeft size={18} />
        </Link>
        <span className="font-heading font-semibold text-sm text-[#0F0F0F] dark:text-[#F9FAFB] flex-1 truncate">
          {challenge.title}
        </span>
        <Badge variant={badge.variant} size="sm" className="shrink-0 hidden sm:inline-flex">
          {badge.label}
        </Badge>
        <Button asChild variant="primary" size="sm" className="shrink-0 hidden md:inline-flex">
          <Link href={signInHref}>
            <Lock size={13} className="mr-1" />
            Sign in to solve
          </Link>
        </Button>
      </div>

      {/* Desktop: split layout */}
      <div className="hidden md:flex flex-1 overflow-hidden min-h-0">
        <div className="flex flex-col w-[42%] min-w-[300px] border-r border-[#E5E7EB] dark:border-[#2d2d2d] bg-white dark:bg-[#1a1a1a] overflow-y-auto">
          <ProblemPanel
            title={challenge.title}
            description={challenge.description}
            difficulty={challenge.difficulty}
            visibleTestCases={challenge.visibleTestCases}
            functionParams={challenge.functionParams}
          />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden min-w-0 relative">
          <div className="flex items-center gap-1 px-3 py-2 bg-[#1e1e1e] border-b border-[#3a3a3a] shrink-0 overflow-x-auto">
            {CHALLENGE_LANGUAGES.map((l) => (
              <span
                key={l.value}
                className={cn(
                  "px-3 py-1 rounded font-mono text-xs font-medium whitespace-nowrap",
                  l.value === "python" ? "bg-[#3D006B] text-white" : "text-[#9CA3AF]",
                )}
              >
                {l.label}
              </span>
            ))}
          </div>
          <div className="flex-1 overflow-hidden min-h-0 pointer-events-none select-none">
            <ChallengeEditor
              value={previewCode}
              language={"python" as ChallengeLanguage}
              onValueChange={() => {}}
              readOnly
            />
          </div>
          {/* Lock overlay */}
          <div className="absolute inset-0 top-[40px] flex flex-col items-center justify-center bg-[#1e1e1e]/80 backdrop-blur-[2px] z-10 px-6">
            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl border border-[#E5E7EB] dark:border-[#2d2d2d] px-8 py-8 flex flex-col items-center gap-4 max-w-xs w-full text-center">
              <div className="w-12 h-12 rounded-xl bg-[#F3E8FF] dark:bg-[#2d1a4a] flex items-center justify-center">
                <Lock size={22} className="text-[#3D006B] dark:text-[#C084FC]" />
              </div>
              <div>
                <p className="font-heading font-bold text-base text-[#0F0F0F] dark:text-[#F9FAFB] mb-1">
                  Sign in to start coding
                </p>
                <p className="font-body text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                  Create a free account to submit solutions and track your progress.
                </p>
              </div>
              <Button asChild variant="primary" fullWidth>
                <Link href={signInHref}>Sign In / Sign Up</Link>
              </Button>
              <Link
                href={backHref}
                className="font-body text-xs text-[#9CA3AF] hover:text-[#3D006B] transition-colors"
              >
                ← Back to all challenges
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: problem + sticky CTA */}
      <div className="md:hidden flex flex-col flex-1 overflow-hidden min-h-0 bg-white dark:bg-[#1a1a1a]">
        <div className="flex-1 overflow-y-auto">
          <ProblemPanel
            title={challenge.title}
            description={challenge.description}
            difficulty={challenge.difficulty}
            visibleTestCases={challenge.visibleTestCases}
            functionParams={challenge.functionParams}
          />
        </div>
        <div className="shrink-0 border-t border-[#E5E7EB] dark:border-[#2d2d2d] bg-white dark:bg-[#1a1a1a] px-4 py-4 flex flex-col gap-2">
          <Button asChild variant="primary" fullWidth>
            <Link href={signInHref}>
              <Lock size={14} />
              Sign In to Start Coding
            </Link>
          </Button>
          <Button asChild variant="secondary" size="sm" fullWidth>
            <Link href="/sign-up">Create Free Account</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Authed workspace (full interactive) ─────────────────────────────────────

function AuthedWorkspace({
  slug,
  challenge,
  backHref,
  isInsideLayout,
}: {
  slug: string;
  challenge: StudentChallenge;
  backHref: string;
  isInsideLayout?: boolean;
}) {
  const submitMutation = useSubmitChallenge(slug);
  const h = isInsideLayout ? "h-[calc(100vh-64px)]" : "h-[100dvh]";

  const starterCodeByLang = useMemo<Record<ChallengeLanguage, string>>(() => {
    const starter = challenge.starterCode as StarterCode;
    return {
      python:     normalizeVisibleChallengeCode("python",     starter.python),
      java:       normalizeVisibleChallengeCode("java",       starter.java),
      javascript: normalizeVisibleChallengeCode("javascript", starter.javascript),
      c:          normalizeVisibleChallengeCode("c",          starter.c),
      cpp:        normalizeVisibleChallengeCode("cpp",        starter.cpp),
      go:         normalizeVisibleChallengeCode("go",         starter.go),
    };
  }, [challenge.starterCode]);

  const [codeByLang, setCodeByLang] = useState<Record<ChallengeLanguage, string>>(starterCodeByLang);
  const [seededId, setSeededId]     = useState<string | null>(null);
  const [language, setLanguage]     = useState<ChallengeLanguage>("python");
  const [rightTab, setRightTab]     = useState<RightTab>("results");
  const [lastResult, setLastResult] = useState<SubmissionResult | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [warningCount, setWarningCount]   = useState(0);
  const [warningVisible, setWarningVisible] = useState(false);
  const [mobilePanel, setMobilePanel]     = useState<"problem" | "code">("problem");

  // Seed starter code once per challenge
  if (challenge && seededId !== challenge.id) {
    setSeededId(challenge.id);
    setCodeByLang(starterCodeByLang);
  }

  const handleCodeChange = useCallback(
    (v: string) => setCodeByLang((prev) => ({ ...prev, [language]: v })),
    [language],
  );

  const handleSubmit = useCallback(async () => {
    const code = codeByLang[language];
    if (!code.trim()) {
      toast.error("Write some code before submitting.");
      return;
    }
    const toastId = toast.loading("Running your code against test cases…");
    try {
      const res = await submitMutation.mutateAsync({ language, code });
      toast.dismiss(toastId);
      if (!res.data) {
        toast.error(res.message ?? "Submission failed. Try again.");
        return;
      }
      setLastResult(res.data);
      setRightTab("results");
      if (res.data.status === "accepted") {
        setShowBanner(true);
        toast.success(`Accepted — ${res.data.testsPassed}/${res.data.totalTests} tests passed`, { duration: 5000 });
      } else if (res.data.status === "compile_error") {
        toast.error("Compile error — check your code.", { duration: 4000 });
      } else if (res.data.status === "time_limit_exceeded") {
        toast.error("Time limit exceeded — optimize your solution.", { duration: 4000 });
      } else {
        toast.error(`${res.data.testsPassed}/${res.data.totalTests} tests passed.`, { duration: 4000 });
      }
    } catch {
      toast.dismiss(toastId);
      toast.error("Something went wrong. Please try again.");
    }
  }, [codeByLang, language, submitMutation]);

  // Focus/visibility warning detection
  useEffect(() => {
    const markWarning = () => { setWarningCount((n) => n + 1); setWarningVisible(true); };
    const handleVisibility = () => { if (document.visibilityState === "hidden") markWarning(); };
    const handleBlur = () => { if (document.visibilityState === "visible") markWarning(); };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("pagehide", markWarning);
    window.addEventListener("blur", handleBlur);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pagehide", markWarning);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  // ⌘ Enter shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (!submitMutation.isPending) handleSubmit();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [handleSubmit, submitMutation.isPending]);

  return (
    <div className={cn("flex flex-col", h)}>
      {showBanner && challenge.completed && (
        <AcceptedBanner onDismiss={() => setShowBanner(false)} />
      )}

      <WarningToast
        visible={warningVisible}
        count={warningCount}
        onClose={() => setWarningVisible(false)}
      />

      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-[#E5E7EB] dark:border-[#2d2d2d] bg-white dark:bg-[#1a1a1a] shrink-0">
        <Link
          href={backHref}
          className="text-[#9CA3AF] hover:text-[#3D006B] dark:hover:text-[#C084FC] transition-colors shrink-0"
          title="Back to challenges"
        >
          <ArrowLeft size={18} />
        </Link>
        <span className="font-heading font-semibold text-sm text-[#0F0F0F] dark:text-[#F9FAFB] flex-1 truncate">
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

      {/* Mobile panel toggle */}
      <div className="md:hidden flex shrink-0 border-b border-[#E5E7EB] dark:border-[#2d2d2d] bg-white dark:bg-[#1a1a1a]">
        {(["problem", "code"] as const).map((panel) => (
          <button
            key={panel}
            onClick={() => setMobilePanel(panel)}
            className={cn(
              "flex-1 py-2.5 font-body text-sm font-medium capitalize transition-colors",
              mobilePanel === panel
                ? "text-[#3D006B] border-b-2 border-[#3D006B]"
                : "text-[#6B7280]",
            )}
          >
            {panel === "problem" ? "Problem" : "Code"}
          </button>
        ))}
      </div>

      {/* Main split */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left: Problem */}
        <div
          className={cn(
            "flex flex-col overflow-hidden bg-white dark:bg-[#1a1a1a] border-r border-[#E5E7EB] dark:border-[#2d2d2d]",
            "md:flex md:w-[42%] md:min-w-70",
            mobilePanel === "problem" ? "flex flex-1" : "hidden",
          )}
        >
          <div className="flex-1 overflow-y-auto">
            <ProblemPanel
              title={challenge.title}
              description={challenge.description}
              difficulty={challenge.difficulty}
              visibleTestCases={challenge.visibleTestCases}
              functionParams={challenge.functionParams}
            />
          </div>
        </div>

        {/* Right: Editor + Results */}
        <div
          className={cn(
            "flex flex-col overflow-hidden min-w-0",
            "md:flex md:flex-1",
            mobilePanel === "code" ? "flex flex-1" : "hidden",
          )}
        >
          {/* Language selector */}
          <div className="flex items-center gap-1 px-3 py-2 bg-[#1e1e1e] border-b border-[#3a3a3a] shrink-0 overflow-x-auto">
            {CHALLENGE_LANGUAGES.map((l) => (
              <button
                key={l.value}
                onClick={() => setLanguage(l.value)}
                className={cn(
                  "px-3 py-1 rounded font-mono text-xs font-medium whitespace-nowrap transition-colors",
                  language === l.value
                    ? "bg-[#3D006B] text-white"
                    : "text-[#9CA3AF] hover:text-white hover:bg-[#3a3a3a]",
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
          <div
            className="shrink-0 border-t border-[#E5E7EB] dark:border-[#2d2d2d] bg-white dark:bg-[#1a1a1a] flex flex-col"
            style={{ maxHeight: "45%" }}
          >
            <div className="flex items-center border-b border-[#E5E7EB] dark:border-[#2d2d2d] px-1 shrink-0">
              {[
                { id: "results" as RightTab, label: "Results" },
                { id: "history" as RightTab, label: "Submissions", icon: <History size={11} /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setRightTab(tab.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2.5 font-body text-xs font-medium transition-colors",
                    rightTab === tab.id
                      ? "text-[#3D006B] border-b-2 border-[#3D006B]"
                      : "text-[#6B7280] hover:text-[#3D006B]",
                  )}
                >
                  {tab.icon}
                  {tab.label}
                  {tab.id === "results" && lastResult && (
                    <span
                      className={cn(
                        "ml-1 w-1.5 h-1.5 rounded-full shrink-0",
                        lastResult.status === "accepted" ? "bg-green-500" : "bg-red-400",
                      )}
                    />
                  )}
                </button>
              ))}
            </div>
            <div className="overflow-y-auto flex-1 min-h-0">
              {rightTab === "results" ? (
                lastResult ? (
                  <SubmissionResults result={lastResult} />
                ) : (
                  <EmptyResultsState
                    challenge={{
                      visibleTestCases: challenge.visibleTestCases,
                      functionParams: challenge.functionParams ?? null,
                    }}
                  />
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

// ─── Main export ──────────────────────────────────────────────────────────────

export function ChallengeWorkspace({ slug, backHref, isInsideLayout }: ChallengeWorkspaceProps) {
  const { data: user } = useProfile();
  const isAuthed = !!user;

  // Fetch only the relevant resource based on auth state
  const { data: publicChallenge, isLoading: publicLoading } = usePublicChallenge(slug, { enabled: !isAuthed });
  const { data: studentChallenge, isLoading: studentLoading } = useStudentChallenge(slug, { enabled: isAuthed });

  const isLoading = isAuthed ? studentLoading : publicLoading;
  const challenge = isAuthed ? studentChallenge : publicChallenge;

  if (isLoading) return <WorkspaceSkeleton isInsideLayout={isInsideLayout} />;

  if (!challenge) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-6">
        <p className="font-body text-sm text-[#6B7280]">Challenge not found.</p>
        <Button asChild variant="secondary" size="sm">
          <Link href={backHref}>Back to Challenges</Link>
        </Button>
      </div>
    );
  }

  if (!isAuthed) {
    return (
      <LockedWorkspace
        slug={slug}
        challenge={challenge}
        backHref={backHref}
        isInsideLayout={isInsideLayout}
      />
    );
  }

  return (
    <AuthedWorkspace
      slug={slug}
      challenge={studentChallenge!}
      backHref={backHref}
      isInsideLayout={isInsideLayout}
    />
  );
}

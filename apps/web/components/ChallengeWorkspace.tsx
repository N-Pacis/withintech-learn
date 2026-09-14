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
import {
  CHALLENGE_LANGUAGES,
  normalizeVisibleChallengeCode,
} from "@/lib/challenges";

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
  easy: { variant: "success" as const, label: "Easy" },
  medium: { variant: "warning" as const, label: "Medium" },
  hard: { variant: "danger" as const, label: "Hard" },
};

type RightTab = "results" | "history";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function WorkspaceSkeleton({ isInsideLayout }: { isInsideLayout?: boolean }) {
  const h = isInsideLayout ? "h-[calc(100vh-64px)]" : "h-[100dvh]";
  return (
    <div className={cn("flex animate-pulse flex-col", h)}>
      <div className="h-[52px] bg-surface-card border-b border-border shrink-0" />
      <div className="hidden md:flex flex-1 overflow-hidden">
        <div className="w-[42%] border-r border-border p-5 flex flex-col gap-4 bg-surface-card">
          <div className="h-6 w-2/3 bg-fill-muted rounded-md" />
          {[100, 80, 90, 60, 70, 85].map((w, i) => (
            <div
              key={i}
              className="h-3.5 bg-fill-muted rounded"
              style={{ width: `${w}%` }}
            />
          ))}
          <div className="h-28 bg-fill-muted rounded-lg mt-2" />
        </div>
        <div className="flex-1 flex flex-col">
          <div className="h-10 bg-editor-panel border-b border-editor-border" />
          <div className="flex-1 bg-editor" />
        </div>
      </div>
      <div className="md:hidden flex-1 p-5 flex flex-col gap-4 bg-surface-card">
        <div className="h-6 w-2/3 bg-fill-muted rounded-md" />
        {[100, 80, 90, 60, 70].map((w, i) => (
          <div
            key={i}
            className="h-3.5 bg-fill-muted rounded"
            style={{ width: `${w}%` }}
          />
        ))}
        <div className="mt-auto h-11 bg-fill-muted rounded-lg" />
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

function InputDisplay({
  input,
  params,
}: {
  input: string;
  params: FunctionParam[] | null;
}) {
  if (!params || params.length === 0) {
    return input ? (
      <pre className="bg-surface-muted text-foreground-soft rounded px-2 py-1 whitespace-pre-wrap break-all text-xs font-mono">
        {input}
      </pre>
    ) : null;
  }
  let values: unknown[];
  try {
    values = JSON.parse(input) as unknown[];
  } catch {
    return (
      <pre className="bg-surface-muted text-foreground-soft rounded px-2 py-1 whitespace-pre-wrap break-all text-xs font-mono">
        {input}
      </pre>
    );
  }
  return (
    <div className="flex flex-col gap-1">
      {params.map((p, i) => (
        <div
          key={p.name}
          className="flex items-start gap-1.5 text-xs font-mono"
        >
          <span className="text-muted-contrast shrink-0">{p.name} =</span>
          <pre className="bg-surface-muted text-foreground-soft rounded px-1.5 py-0.5 whitespace-pre-wrap break-all flex-1">
            {Array.isArray(values[i])
              ? JSON.stringify(values[i])
              : String(values[i] ?? "")}
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
      <p className="font-body text-xs text-muted-contrast mb-3">
        Write your solution and press{" "}
        <kbd className="font-mono bg-surface-muted border border-border rounded px-1 py-0.5 text-[10px]">
          ⌘ Enter
        </kbd>{" "}
        or click <strong>Submit</strong> to run against all test cases.
      </p>
      {challenge.visibleTestCases.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="font-body text-xs font-medium text-muted uppercase tracking-wider">
            Example test cases
          </p>
          {challenge.visibleTestCases.map((tc, i) => (
            <div
              key={tc.id}
              className="border border-border rounded-lg overflow-hidden text-xs font-mono"
            >
              <div className="px-3 py-1.5 bg-surface-panel border-b border-border font-body text-[11px] text-muted-contrast">
                Example {i + 1}
              </div>
              <div className="p-3 grid gap-2 bg-surface-card">
                {tc.input !== "" && (
                  <div>
                    <div className="font-body text-[11px] text-muted-contrast mb-1">
                      Input
                    </div>
                    <InputDisplay
                      input={tc.input}
                      params={challenge.functionParams}
                    />
                  </div>
                )}
                <div>
                  <div className="font-body text-[11px] text-muted-contrast mb-0.5">
                    Expected
                  </div>
                  <pre className="bg-surface-muted rounded px-2 py-1 whitespace-pre-wrap break-all">
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
  challenge,
  backHref,
  isInsideLayout,
}: {
  challenge: PublicChallenge | StudentChallenge;
  backHref: string;
  isInsideLayout?: boolean;
}) {
  const badge = DIFFICULTY_BADGE[challenge.difficulty];
  const h = isInsideLayout ? "h-[calc(100vh-64px)]" : "h-[100dvh]";
  const previewCode = useMemo(
    () =>
      normalizeVisibleChallengeCode(
        "python",
        (challenge.starterCode as StarterCode).python,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [(challenge.starterCode as StarterCode).python],
  );

  return (
    <div className={cn("flex flex-col", h)}>
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-surface-card shrink-0">
        <Link
          href={backHref}
          className="text-muted-contrast hover:text-primary transition-colors shrink-0"
          title="Back to challenges"
        >
          <ArrowLeft size={18} />
        </Link>
        <span className="font-heading font-semibold text-sm text-foreground flex-1 truncate">
          {challenge.title}
        </span>
        <Badge
          variant={badge.variant}
          size="sm"
          className="shrink-0 hidden sm:inline-flex"
        >
          {badge.label}
        </Badge>
      </div>

      {/* Desktop: split layout */}
      <div className="hidden md:flex flex-1 overflow-hidden min-h-0">
        <div className="flex flex-col w-[42%] min-w-[300px] border-r border-border bg-surface-card overflow-y-auto">
          <ProblemPanel
            title={challenge.title}
            description={challenge.description}
            difficulty={challenge.difficulty}
            visibleTestCases={challenge.visibleTestCases}
            functionParams={challenge.functionParams}
          />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden min-w-0 relative">
          <div className="flex items-center gap-1 px-3 py-2 bg-editor border-b border-editor-border shrink-0 overflow-x-auto">
            {CHALLENGE_LANGUAGES.map((l) => (
              <span
                key={l.value}
                className={cn(
                  "px-3 py-1 rounded font-mono text-xs font-medium whitespace-nowrap",
                  l.value === "python"
                    ? "bg-primary text-white"
                    : "text-muted-contrast",
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
          <div className="absolute inset-0 top-[40px] flex flex-col items-center justify-center bg-editor/80 backdrop-blur-[2px] z-10 px-6">
            <div className="bg-surface-card rounded-2xl shadow-2xl border border-border px-8 py-8 flex flex-col items-center gap-4 max-w-xs w-full text-center">
              <div className="w-12 h-12 rounded-xl bg-primary-soft flex items-center justify-center">
                <Lock size={22} className="text-primary" />
              </div>
              <div>
                <p className="font-heading font-bold text-base text-foreground mb-1">
                  Coding unavailable
                </p>
                <p className="font-body text-sm text-muted">
                  Submitting solutions and tracking progress is currently
                  unavailable. Check back soon.
                </p>
              </div>
              <Link
                href={backHref}
                className="font-body text-xs text-muted-contrast hover:text-primary transition-colors"
              >
                ← Back to all challenges
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: problem + sticky CTA */}
      <div className="md:hidden flex flex-col flex-1 overflow-hidden min-h-0 bg-surface-card">
        <div className="flex-1 overflow-y-auto">
          <ProblemPanel
            title={challenge.title}
            description={challenge.description}
            difficulty={challenge.difficulty}
            visibleTestCases={challenge.visibleTestCases}
            functionParams={challenge.functionParams}
          />
        </div>
        <div className="shrink-0 border-t border-border bg-surface-card px-4 py-4">
          <p className="font-body text-xs text-muted-contrast text-center">
            Coding is currently unavailable. Check back soon.
          </p>
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
      python: normalizeVisibleChallengeCode("python", starter.python),
      java: normalizeVisibleChallengeCode("java", starter.java),
      javascript: normalizeVisibleChallengeCode(
        "javascript",
        starter.javascript,
      ),
      c: normalizeVisibleChallengeCode("c", starter.c),
      cpp: normalizeVisibleChallengeCode("cpp", starter.cpp),
      go: normalizeVisibleChallengeCode("go", starter.go),
    };
  }, [challenge.starterCode]);

  const [codeByLang, setCodeByLang] =
    useState<Record<ChallengeLanguage, string>>(starterCodeByLang);
  const [seededId, setSeededId] = useState<string | null>(null);
  const [language, setLanguage] = useState<ChallengeLanguage>("python");
  const [rightTab, setRightTab] = useState<RightTab>("results");
  const [lastResult, setLastResult] = useState<SubmissionResult | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const [warningVisible, setWarningVisible] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<"problem" | "code">("problem");

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
        toast.success(
          `Accepted — ${res.data.testsPassed}/${res.data.totalTests} tests passed`,
          { duration: 5000 },
        );
      } else if (res.data.status === "compile_error") {
        toast.error("Compile error — check your code.", { duration: 4000 });
      } else if (res.data.status === "time_limit_exceeded") {
        toast.error("Time limit exceeded — optimize your solution.", {
          duration: 4000,
        });
      } else {
        toast.error(
          `${res.data.testsPassed}/${res.data.totalTests} tests passed.`,
          { duration: 4000 },
        );
      }
    } catch {
      toast.dismiss(toastId);
      toast.error("Something went wrong. Please try again.");
    }
  }, [codeByLang, language, submitMutation]);

  // Focus/visibility warning detection
  useEffect(() => {
    const markWarning = () => {
      setWarningCount((n) => n + 1);
      setWarningVisible(true);
    };
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") markWarning();
    };
    const handleBlur = () => {
      if (document.visibilityState === "visible") markWarning();
    };
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
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-surface-card shrink-0">
        <Link
          href={backHref}
          className="text-muted-contrast hover:text-primary transition-colors shrink-0"
          title="Back to challenges"
        >
          <ArrowLeft size={18} />
        </Link>
        <span className="font-heading font-semibold text-sm text-foreground flex-1 truncate">
          {challenge.title}
        </span>
        {challenge.completed && (
          <span className="hidden sm:flex items-center gap-1 font-body text-xs text-green-600 dark:text-white bg-green-50 dark:bg-green-600 px-2.5 py-1 rounded-full shrink-0">
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
      <div className="md:hidden flex shrink-0 border-b border-border bg-surface-card">
        {(["problem", "code"] as const).map((panel) => (
          <button
            key={panel}
            onClick={() => setMobilePanel(panel)}
            className={cn(
              "flex-1 py-2.5 font-body text-sm font-medium capitalize transition-colors",
              mobilePanel === panel
                ? "text-primary border-b-2 border-primary"
                : "text-muted",
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
            "flex flex-col overflow-hidden bg-surface-card border-r border-border",
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
          <div className="flex items-center gap-1 px-3 py-2 bg-editor border-b border-editor-border shrink-0 overflow-x-auto">
            {CHALLENGE_LANGUAGES.map((l) => (
              <button
                key={l.value}
                onClick={() => setLanguage(l.value)}
                className={cn(
                  "px-3 py-1 rounded font-mono text-xs font-medium whitespace-nowrap transition-colors",
                  language === l.value
                    ? "bg-primary text-white"
                    : "text-muted-contrast hover:text-white hover:bg-editor-border",
                )}
              >
                {l.label}
              </button>
            ))}
            <div className="ml-auto pl-2 shrink-0">
              <span className="font-mono text-[10px] text-editor-subtle select-none hidden sm:block">
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
            className="shrink-0 border-t border-border bg-surface-card flex flex-col"
            style={{ maxHeight: "45%" }}
          >
            <div className="flex items-center border-b border-border px-1 shrink-0">
              {[
                { id: "results" as RightTab, label: "Results" },
                {
                  id: "history" as RightTab,
                  label: "Submissions",
                  icon: <History size={11} />,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setRightTab(tab.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2.5 font-body text-xs font-medium transition-colors",
                    rightTab === tab.id
                      ? "text-primary border-b-2 border-primary"
                      : "text-muted hover:text-primary",
                  )}
                >
                  {tab.icon}
                  {tab.label}
                  {tab.id === "results" && lastResult && (
                    <span
                      className={cn(
                        "ml-1 w-1.5 h-1.5 rounded-full shrink-0",
                        lastResult.status === "accepted"
                          ? "bg-green-500"
                          : "bg-red-400",
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

export function ChallengeWorkspace({
  slug,
  backHref,
  isInsideLayout,
}: ChallengeWorkspaceProps) {
  const { data: user } = useProfile();
  const isAuthed = !!user;

  // Fetch only the relevant resource based on auth state
  const { data: publicChallenge, isLoading: publicLoading } =
    usePublicChallenge(slug, { enabled: !isAuthed });
  const { data: studentChallenge, isLoading: studentLoading } =
    useStudentChallenge(slug, { enabled: isAuthed });

  const isLoading = isAuthed ? studentLoading : publicLoading;
  const challenge = isAuthed ? studentChallenge : publicChallenge;

  if (isLoading) return <WorkspaceSkeleton isInsideLayout={isInsideLayout} />;

  if (!challenge) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-6">
        <p className="font-body text-sm text-muted">Challenge not found.</p>
        <Button asChild variant="secondary" size="sm">
          <Link href={backHref}>Back to Challenges</Link>
        </Button>
      </div>
    );
  }

  if (!isAuthed) {
    return (
      <LockedWorkspace
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

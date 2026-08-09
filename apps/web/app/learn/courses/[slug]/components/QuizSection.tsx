"use client";

import { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  XCircle,
  CheckCircle,
  RotateCcw,
  Trophy,
  Medal,
  Sparkles,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { GridLoader } from "react-spinners";
import { cn } from "@/lib/utils";
import { Button, WarningToast } from "@/components/ui";
import Link from "next/link";
import {
  useSubmitQuiz,
  useQuizAttemptState,
  type StudentModuleQuiz,
  type QuizAttemptResult,
  type MarkedQuestion,
} from "@/hooks/queries/courses";

type QuizType = "lesson" | "module" | "course";

/** "3 hours 12 minutes" / "12 minutes" / "less than a minute" */
function formatWait(iso: string) {
  const minutes = Math.ceil((new Date(iso).getTime() - Date.now()) / 60000);
  if (minutes <= 0) return "less than a minute";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"}`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  const h = `${hours} hour${hours === 1 ? "" : "s"}`;
  return rest === 0 ? h : `${h} ${rest} minute${rest === 1 ? "" : "s"}`;
}

interface QuizSectionProps {
  quiz: StudentModuleQuiz;
  quizType: QuizType;
  /**
   * Fires when the quiz is in a passed state: right after a fresh pass, and
   * once on load if the server says an earlier attempt passed. Record progress
   * here. DO NOT navigate — that is what onContinue is for.
   */
  onPassed?: (result: QuizAttemptResult | null) => void;
  /** Fires when the student clicks Continue. Navigate here. */
  onContinue?: () => void;
  continueLabel?: string;
  /** Disables Continue while the parent is still saving progress. */
  continueBusy?: boolean;
  payForCertHref?: string;
}

export function QuizSection({
  quiz,
  quizType,
  onPassed,
  onContinue,
  continueLabel = "Continue",
  continueBusy = false,
  payForCertHref,
}: QuizSectionProps) {
  const { data: state, isLoading } = useQuizAttemptState(quiz.id);
  const { mutate: submit, isPending, error } = useSubmitQuiz();

  const [taking, setTaking] = useState(false);
  const [answers, setAnswers] = useState<Record<string, Set<string>>>({});
  const [justGraded, setJustGraded] = useState<QuizAttemptResult | null>(null);
  const [warningCount, setWarningCount] = useState(0);
  const [warningVisible, setWarningVisible] = useState(false);

  const isCourseQuiz = quizType === "course";
  const quizActive = taking && !isPending;

  // ── Anti-cheat listeners ──
  useEffect(() => {
    if (!quizActive) return;

    const markWarning = () => {
      setWarningCount((n) => n + 1);
      setWarningVisible(true);
    };

    // 1. Tab switch / app switch (Page Visibility API — universal modern browser support)
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") markWarning();
    };
    // Supplement: pagehide catches iOS Safari edge cases on app-switch / Home button
    const handlePageHide = () => markWarning();
    // 2. Window focus loss while still visible (split-screen, other monitor)
    const handleBlur = () => {
      if (document.visibilityState === "visible") markWarning();
    };
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.key.toLowerCase() === "u") ||
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "i")
      )
        e.preventDefault();
    };
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [quizActive]);

  // ── Reconcile progress on load ──
  // If the student passed in an earlier session but the parent never managed to
  // record it (closed the tab before the request finished), tell the parent
  // once. The parent guards with its own isCompleted check. This never
  // navigates.
  const reconciled = useRef(false);
  useEffect(() => {
    if (reconciled.current) return;
    if (state?.passed) {
      reconciled.current = true;
      onPassed?.(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.passed]);

  function toggleOption(questionId: string, optionId: string) {
    setAnswers((prev) => {
      const current = new Set(prev[questionId] ?? []);
      if (current.has(optionId)) current.delete(optionId);
      else current.add(optionId);
      return { ...prev, [questionId]: current };
    });
  }

  const allAnswered = quiz.questions.every(
    (q) => (answers[q.id]?.size ?? 0) > 0,
  );

  function handleSubmit() {
    const payload = quiz.questions.map((q) => ({
      questionId: q.id,
      chosenOptionIds: [...(answers[q.id] ?? [])],
    }));
    submit(
      { quizId: quiz.id, answers: payload },
      {
        onSuccess: (data) => {
          setJustGraded(data);
          setTaking(false);
          if (data.attempt.status === "pass") onPassed?.(data);
        },
      },
    );
  }

  function handleStart() {
    setJustGraded(null);
    setAnswers({});
    setWarningCount(0);
    setWarningVisible(false);
    setTaking(true);
  }

  const shownResult = justGraded ?? state?.lastResult ?? null;
  const passed = state?.passed ?? false;
  const canAttempt = state?.canAttempt ?? false;

  // Cooling down: attempts are used up for now, but they come back on their
  // own. This is a wait, never a dead end.
  const coolingDown =
    !!state && !state.passed && !state.canAttempt && !!state.retryAvailableAt;
  const waitMessage = state?.retryAvailableAt
    ? `You have used your ${state.maxAttempts} attempts for now. You can try again in ${formatWait(state.retryAvailableAt)}.`
    : "";

  // Attempts made before answers were stored have a score but nothing to
  // replay. Show the score on its own rather than dropping back to the lobby,
  // which would look like the student had never sat the quiz.
  const scoreOnly =
    !shownResult && state?.lastAttempt ? state.lastAttempt : null;

  // "You cannot attempt" has two very different reasons. Never tell a student
  // who passed that they ran out of attempts.
  const lockedReason = passed
    ? "You have already passed this quiz. It is kept here for review."
    : waitMessage;

  const quizLabel =
    quizType === "course"
      ? "Final Course Quiz"
      : quizType === "lesson"
        ? "Lesson Quiz"
        : "Module Quiz";

  // Shared by the full review and the score-only view. Nothing here navigates
  // on its own — Continue is always a deliberate click.
  const actions = (
    <div className="mt-8 flex flex-wrap items-center gap-3">
      {canAttempt && (
        <Button
          variant="secondary"
          size="md"
          onClick={handleStart}
          className="flex items-center gap-2"
        >
          <RotateCcw size={15} /> Retake quiz
          {state ? ` (${state.attemptsLeft} left)` : ""}
        </Button>
      )}

      {coolingDown && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl font-body text-sm bg-surface-panel text-muted border border-border">
          <Clock size={15} className="shrink-0" />
          {waitMessage}
        </div>
      )}

      {passed && payForCertHref && (
        <Button size="md" variant="primary" asChild>
          <Link href={payForCertHref} className="flex items-center gap-2">
            Pay for Certificate <ArrowRight size={14} />
          </Link>
        </Button>
      )}

      {passed && onContinue && (
        <Button
          size="md"
          onClick={onContinue}
          loading={continueBusy}
          disabled={continueBusy}
          className="flex items-center gap-2"
        >
          {continueLabel} <ArrowRight size={16} />
        </Button>
      )}
    </div>
  );

  return (
    <>
      <WarningToast
        visible={warningVisible}
        count={warningCount}
        onClose={() => setWarningVisible(false)}
      />

      <div className="mt-10 pt-8 border-t border-border">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
          <div>
            <p className="font-body text-xs text-muted-contrast uppercase tracking-widest mb-1.5">
              {quizLabel}
            </p>
            <h3 className="font-heading font-bold text-xl text-foreground">
              {quiz.title}
            </h3>
            <p className="font-body text-sm text-muted mt-1">
              Pass score: {quiz.passingScore}% &middot; {quiz.questions.length}{" "}
              question{quiz.questions.length !== 1 ? "s" : ""}
              {/* Lifetime count. The limit is per window, so a running total
                  out of maxAttempts would be misleading here. */}
              {state && state.attemptsTotal > 0
                ? ` · Attempt ${state.attemptsTotal}`
                : ""}
            </p>
          </div>
          {passed && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-900 shrink-0">
              <Medal size={13} />
              <span className="font-body text-xs font-semibold">Passed</span>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="h-32 rounded-xl bg-surface-panel animate-pulse" />
        ) : taking && !isPending ? (
          /* ── Quiz form ── */
          <>
            <div
              className="flex flex-col gap-8"
              onCopy={(e) => e.preventDefault()}
            >
              {quiz.questions.map((q, i) => (
                <div key={q.id} className="flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary text-white font-body text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="font-body text-sm font-medium text-foreground pt-0.5 select-none">
                      {q.text}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 pl-9">
                    {q.options.map((opt) => {
                      const chosen = answers[q.id]?.has(opt.id) ?? false;
                      return (
                        <label
                          key={opt.id}
                          className={cn(
                            "flex items-start gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all",
                            chosen
                              ? "border-primary bg-primary-soft shadow-sm"
                              : "border-border hover:border-primary-tint hover:bg-surface-subtle",
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={chosen}
                            onChange={() => toggleOption(q.id, opt.id)}
                            className="accent-primary mt-0.5 shrink-0"
                          />
                          <span className="font-body text-sm text-foreground-soft flex-1 min-w-0 wrap-break-word select-none">
                            {opt.text}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <p className="font-body text-sm text-red-500 mt-4">
                {(error as Error).message}
              </p>
            )}

            <div className="mt-8 flex items-center gap-3">
              <Button size="md" onClick={handleSubmit} disabled={!allAnswered}>
                Submit quiz
              </Button>
              <Button
                size="md"
                variant="secondary"
                onClick={() => setTaking(false)}
              >
                Cancel
              </Button>
            </div>
          </>
        ) : isPending ? (
          /* ── Grading ── */
          <div className="flex flex-col items-center justify-center py-16 gap-6">
            <div className="w-24 h-24 rounded-2xl bg-primary-soft flex items-center justify-center ring-6 ring-primary/10 dark:ring-primary/20">
              <GridLoader color="var(--primary)" size={10} margin={3} />
            </div>
            <div className="flex flex-col items-center gap-1">
              <p className="font-heading font-bold text-base text-foreground">
                Grading your answers
              </p>
              <p className="font-body text-sm text-muted">
                The system is processing your results…
              </p>
            </div>
          </div>
        ) : shownResult ? (
          /* ── Results / review ── */
          <>
            <div
              className={cn(
                "flex items-center gap-2 px-4 py-3 rounded-xl mb-6 font-body text-sm font-medium",
                shownResult.attempt.status === "pass"
                  ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300"
                  : "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-300",
              )}
            >
              {shownResult.attempt.status === "pass" ? (
                <CheckCircle size={16} />
              ) : (
                <XCircle size={16} />
              )}
              <span className="flex-1">
                You scored <strong>{shownResult.attempt.score}%</strong>
                &nbsp;
                {shownResult.attempt.status === "pass"
                  ? "Passed. Review your answers below, then continue when you are ready."
                  : "Not a pass. Review your answers below."}
              </span>
            </div>

            {passed && !justGraded && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-6 font-body text-sm bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300">
                <Sparkles size={16} />
                This is your passed attempt. It is kept for review.
              </div>
            )}

            {state?.contentChanged && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-6 font-body text-sm bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
                <AlertTriangle size={16} />
                This quiz was edited after your attempt. Your score is the one
                you earned, but the questions below may have changed.
              </div>
            )}

            <div className="flex flex-col gap-8">
              {shownResult.questions.map((q, i) => (
                <MarkedQuestionRow
                  key={q.questionId}
                  question={q}
                  index={i}
                  isCourseQuiz={isCourseQuiz}
                />
              ))}
            </div>

            {actions}
          </>
        ) : scoreOnly ? (
          /* ── Score only: an attempt from before answers were stored ── */
          <>
            <div
              className={cn(
                "flex items-center gap-2 px-4 py-3 rounded-xl mb-6 font-body text-sm font-medium",
                scoreOnly.status === "pass"
                  ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300"
                  : "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-300",
              )}
            >
              {scoreOnly.status === "pass" ? (
                <CheckCircle size={16} />
              ) : (
                <XCircle size={16} />
              )}
              <span className="flex-1">
                You scored <strong>{scoreOnly.score}%</strong>
                &nbsp;
                {scoreOnly.status === "pass" ? "Passed." : "Not a pass."}
              </span>
            </div>

            <div className="flex items-center gap-2 px-4 py-3 rounded-xl font-body text-sm bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
              <AlertTriangle size={16} />
              This attempt was taken before we started saving answers, so the
              per-question breakdown is not available for it.
            </div>

            {actions}
          </>
        ) : (
          /* ── Lobby ── */
          <div className="flex flex-col gap-5">
            <div className="rounded-xl border border-border bg-surface-panel divide-y divide-border">
              <div className="flex items-center justify-between px-5 py-4">
                <span className="font-body text-sm text-muted">Questions</span>
                <span className="font-body text-sm font-semibold text-foreground">
                  {quiz.questions.length}
                </span>
              </div>
              <div className="flex items-center justify-between px-5 py-4">
                <span className="font-body text-sm text-muted">
                  Passing score
                </span>
                <span className="font-body text-sm font-semibold text-foreground">
                  {quiz.passingScore}%
                </span>
              </div>
              <div className="flex items-center justify-between px-5 py-4">
                <span className="font-body text-sm text-muted">Attempts</span>
                <span className="font-body text-sm font-semibold text-foreground text-right">
                  {state
                    ? `${state.attemptsLeft} of ${state.maxAttempts} left`
                    : "—"}
                  {state && (
                    <span className="block font-normal text-xs text-muted-contrast mt-0.5">
                      resets every {state.windowHours} hours
                    </span>
                  )}
                </span>
              </div>
              {isCourseQuiz && (
                <div className="flex items-center justify-between px-5 py-4">
                  <span className="font-body text-sm text-muted">
                    Answers revealed
                  </span>
                  <span className="font-body text-sm font-semibold text-foreground">
                    Only for chosen options
                  </span>
                </div>
              )}
            </div>

            {canAttempt ? (
              <Button
                size="md"
                onClick={handleStart}
                className="flex items-center gap-2 self-start"
              >
                Start Quiz <Trophy size={15} />
              </Button>
            ) : (
              <p className="font-body text-sm text-muted">{lockedReason}</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function MarkedQuestionRow({
  question,
  index,
  isCourseQuiz,
}: {
  question: MarkedQuestion;
  index: number;
  isCourseQuiz: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "w-6 h-6 rounded-full font-body text-xs font-bold flex items-center justify-center shrink-0 mt-0.5",
            question.isCorrect
              ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-300"
              : "bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-300",
          )}
        >
          {index + 1}
        </span>
        <p className="font-body text-sm font-medium text-foreground min-w-0 pt-0.5">
          {question.text}
        </p>
      </div>
      <div className="flex flex-col gap-2 pl-9">
        {question.options.map((opt) => {
          // Course quiz: hide correct answer on failed questions
          if (isCourseQuiz) {
            return (
              <div
                key={opt.id}
                className={cn(
                  "flex items-start gap-3 px-4 py-3 rounded-xl border text-sm font-body",
                  question.isCorrect && opt.wasChosen
                    ? "border-green-500 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950/30 dark:text-green-200"
                    : !question.isCorrect && opt.wasChosen
                      ? "border-red-400 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200"
                      : "border-border text-muted",
                )}
              >
                <span className="flex-1 min-w-0 wrap-break-word">
                  {opt.text}
                </span>
                {question.isCorrect && opt.wasChosen && (
                  <CheckCircle
                    size={14}
                    className="text-green-600 dark:text-green-300 shrink-0 mt-0.5"
                  />
                )}
                {!question.isCorrect && opt.wasChosen && (
                  <XCircle
                    size={14}
                    className="text-red-500 dark:text-red-300 shrink-0 mt-0.5"
                  />
                )}
              </div>
            );
          }

          // Module quiz: full feedback — green (correct+chosen), blue dotted (correct+unchosen), red (wrong+chosen)
          const autoAwarded = question.isCorrect && !opt.isCorrect;
          return (
            <div
              key={opt.id}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-body",
                opt.wasChosen &&
                  (opt.isCorrect || autoAwarded) &&
                  "border-green-500 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950/30 dark:text-green-200",
                opt.isCorrect &&
                  !opt.wasChosen &&
                  !autoAwarded &&
                  "border-dashed border-blue-400 bg-blue-50/40 text-blue-700 dark:border-blue-900 dark:bg-blue-950/25 dark:text-blue-200",
                !opt.isCorrect &&
                  opt.wasChosen &&
                  !question.isCorrect &&
                  "border-red-400 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200",
                !opt.wasChosen &&
                  (!opt.isCorrect || autoAwarded) &&
                  "border-border text-muted",
              )}
            >
              <span className="flex-1 min-w-0 wrap-break-word">{opt.text}</span>
              {opt.wasChosen && (opt.isCorrect || autoAwarded) && (
                <CheckCircle
                  size={14}
                  className="text-green-600 dark:text-green-300 shrink-0 mt-0.5"
                />
              )}
              {!opt.isCorrect && opt.wasChosen && !question.isCorrect && (
                <XCircle
                  size={14}
                  className="text-red-500 dark:text-red-300 shrink-0 mt-0.5"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

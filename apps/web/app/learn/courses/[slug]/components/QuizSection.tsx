"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, RotateCcw, Trophy } from "lucide-react";
import { GridLoader } from "react-spinners";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Button, WarningToast } from "@/components/ui";
import {
  useSubmitQuiz,
  type StudentModuleQuiz,
  type QuizAttemptSummary,
  type QuizAttemptResult,
  type MarkedQuestion,
} from "@/hooks/queries/courses";

interface QuizSectionProps {
  slug: string;
  moduleId: string;
  quiz: StudentModuleQuiz;
  lastAttempt: QuizAttemptSummary | null;
  onPass: () => void;
  quizType?: 'module' | 'lesson' | 'course';
}

export function QuizSection({
  slug,
  moduleId,
  quiz,
  lastAttempt: initialLastAttempt,
  onPass,
  quizType,
}: QuizSectionProps) {
  const queryClient = useQueryClient();
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, Set<string>>>({});
  const [result, setResult] = useState<QuizAttemptResult | null>(null);
  const [lastAttempt, setLastAttempt] = useState(initialLastAttempt);
  const [warningCount, setWarningCount] = useState(0);
  const [warningVisible, setWarningVisible] = useState(false);
  const { mutate: submit, isPending, error } = useSubmitQuiz();

  const quizActive = started && !result && !isPending;

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

    // 2. Window blur — catches alt-tab to another app and address-bar focus
    //    Only fires when the tab itself is still visible (visibilitychange handles hidden tabs)
    const handleBlur = () => {
      if (document.visibilityState === "visible") markWarning();
    };

    // 3. beforeunload — native browser "Leave page?" dialog on close/navigate away
    //    e.preventDefault() works in Chrome 119+; e.returnValue = '' is required for Firefox and Safari
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    // 4. Keyboard shortcuts that open devtools or view source
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.key.toLowerCase() === "u") ||
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "i")
      )
        e.preventDefault();
    };

    // 5. Right-click context menu
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

  // Notify parent if already passed on mount
  useEffect(() => {
    if (lastAttempt?.status === "pass") onPass();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleOption(questionId: string, optionId: string) {
    setAnswers((prev) => {
      const current = new Set(prev[questionId] ?? []);
      if (current.has(optionId)) current.delete(optionId);
      else current.add(optionId);
      return { ...prev, [questionId]: new Set(current) };
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
          setResult(data);
          const summary: QuizAttemptSummary = {
            id: data.attempt.id,
            score: data.attempt.score,
            status: data.attempt.status,
            createdAt: data.attempt.createdAt,
          };
          setLastAttempt(summary);
          // Invalidate so revisiting this module shows fresh lastAttempt
          queryClient.invalidateQueries({
            queryKey: ["student", "module", slug, moduleId],
          });
          if (data.attempt.status === "pass") onPass();
        },
      },
    );
  }

  function handleRetry() {
    setResult(null);
    setAnswers({});
    setWarningCount(0);
    setWarningVisible(false);
    setStarted(true);
  }

  const alreadyPassed = lastAttempt?.status === "pass" && !result;
  const isCourseQuiz = quizType === 'course' || moduleId === "course-quiz";
  const quizLabel = isCourseQuiz ? "Final Course Quiz" : quizType === 'lesson' ? "Lesson Quiz" : "Module Quiz";

  return (
    <>
    <WarningToast
      visible={warningVisible}
      count={warningCount}
      onClose={() => setWarningVisible(false)}
    />

    <div className="mt-10 pt-8 border-t border-[#E5E7EB]">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <p className="font-body text-xs text-[#9CA3AF] uppercase tracking-widest mb-1.5">
            {quizLabel}
          </p>
          <h3 className="font-heading font-bold text-xl text-[#0F0F0F]">
            {quiz.title}
          </h3>
          <p className="font-body text-sm text-[#6B7280] mt-1">
            Pass score: {quiz.passingScore}% &middot; {quiz.questions.length}{" "}
            question{quiz.questions.length !== 1 ? "s" : ""}
          </p>
        </div>
        {alreadyPassed && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-200 shrink-0">
            <Trophy size={13} />
            <span className="font-body text-xs font-semibold">Passed</span>
          </div>
        )}
      </div>

      {/* ── Already passed (locked) ── */}
      {alreadyPassed ? (
        <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-green-50 border border-green-200">
          <CheckCircle size={20} className="text-green-600 shrink-0" />
          <div>
            <p className="font-body text-sm font-medium text-green-800">
              You passed this quiz with a score of {lastAttempt!.score}%
            </p>
            <p className="font-body text-xs text-green-600 mt-0.5">
              You can continue to the next module.
            </p>
          </div>
        </div>
      ) : !started && !result ? (
        /* ── Lobby / gate screen ── */
        <div className="flex flex-col gap-5">
          {lastAttempt && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl font-body text-sm bg-red-50 text-red-600">
              <XCircle size={16} />
              Last attempt: <strong>{lastAttempt.score}%</strong> (Failed)
            </div>
          )}
          <div className="rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] divide-y divide-[#E5E7EB]">
            <div className="flex items-center justify-between px-5 py-4">
              <span className="font-body text-sm text-[#6B7280]">
                Questions
              </span>
              <span className="font-body text-sm font-semibold text-[#0F0F0F]">
                {quiz.questions.length}
              </span>
            </div>
            <div className="flex items-center justify-between px-5 py-4">
              <span className="font-body text-sm text-[#6B7280]">
                Passing score
              </span>
              <span className="font-body text-sm font-semibold text-[#0F0F0F]">
                {quiz.passingScore}%
              </span>
            </div>
            {isCourseQuiz && (
              <div className="flex items-center justify-between px-5 py-4">
                <span className="font-body text-sm text-[#6B7280]">
                  Answers revealed
                </span>
                <span className="font-body text-sm font-semibold text-[#0F0F0F]">
                  Only for chosen options
                </span>
              </div>
            )}
          </div>
          <Button
            size="md"
            onClick={() => setStarted(true)}
            className="flex items-center gap-2 self-start"
          >
            Start Quiz <Trophy size={15} />
          </Button>
        </div>
      ) : isPending ? (
        /* ── Processing state ── */
        <div className="flex flex-col items-center justify-center py-16 gap-6">
          <div className="w-24 h-24 rounded-2xl bg-[#F3E8FF] flex items-center justify-center shadow-[0_0_0_6px_rgba(61,0,107,0.07)]">
            <GridLoader color="#3D006B" size={10} margin={3} />
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="font-heading font-bold text-base text-[#0F0F0F]">
              Grading your answers
            </p>
            <p className="font-body text-sm text-[#6B7280]">
              The system is processing your results…
            </p>
          </div>
        </div>
      ) : result ? (
        /* ── Results view ── */
        <>
          <div
            className={cn(
              "flex items-center gap-2 px-4 py-3 rounded-xl mb-6 font-body text-sm font-medium",
              result.attempt.status === "pass"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-600",
            )}
          >
            {result.attempt.status === "pass" ? (
              <CheckCircle size={16} />
            ) : (
              <XCircle size={16} />
            )}
            You scored <strong>{result.attempt.score}%</strong>
            &nbsp;
            {result.attempt.status === "pass"
              ? "Passed! You can continue."
              : "Failed. Review and try again."}
          </div>

          <div className="flex flex-col gap-8">
            {result.questions.map((q, i) => (
              <MarkedQuestionRow
                key={q.questionId}
                question={q}
                index={i}
                isCourseQuiz={moduleId === "course-quiz"}
              />
            ))}
          </div>

          {result.attempt.status === "fail" && (
            <div className="mt-8">
              <Button
                variant="secondary"
                size="md"
                onClick={handleRetry}
                className="flex items-center gap-2"
              >
                <RotateCcw size={15} /> Try again
              </Button>
            </div>
          )}
        </>
      ) : (
        /* ── Quiz form ── */
        <>
          {/* Previous failed attempt banner */}
          {lastAttempt && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-6 font-body text-sm bg-red-50 text-red-600">
              <XCircle size={16} />
              Last attempt: <strong>{lastAttempt.score}%</strong> (Failed)
            </div>
          )}

          <div
            className="flex flex-col gap-8"
            onCopy={(e) => e.preventDefault()}
          >
            {quiz.questions.map((q, i) => (
              <div key={q.id} className="flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#3D006B] text-white font-body text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="font-body text-sm font-medium text-[#0F0F0F] pt-0.5 select-none">
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
                            ? "border-[#3D006B] bg-[#F3E8FF] shadow-sm"
                            : "border-[#E5E7EB] hover:border-[#C4B5FD] hover:bg-[#FAFAFA]",
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={chosen}
                          onChange={() => toggleOption(q.id, opt.id)}
                          className="accent-[#3D006B] mt-0.5 shrink-0"
                        />
                        <span className="font-body text-sm text-[#374151] flex-1 min-w-0 wrap-break-word select-none">
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

          <div className="mt-8">
            <Button size="md" onClick={handleSubmit} disabled={!allAnswered}>
              Submit quiz
            </Button>
          </div>
        </>
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
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-600",
          )}
        >
          {index + 1}
        </span>
        <p className="font-body text-sm font-medium text-[#0F0F0F] min-w-0 pt-0.5">
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
                    ? "border-green-500 bg-green-50 text-green-800"
                    : !question.isCorrect && opt.wasChosen
                      ? "border-red-400 bg-red-50 text-red-700"
                      : "border-[#E5E7EB] text-[#6B7280]",
                )}
              >
                <span className="flex-1 min-w-0 wrap-break-word">{opt.text}</span>
                {question.isCorrect && opt.wasChosen && (
                  <CheckCircle
                    size={14}
                    className="text-green-600 shrink-0 mt-0.5"
                  />
                )}
                {!question.isCorrect && opt.wasChosen && (
                  <XCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
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
                  "border-green-500 bg-green-50 text-green-800",
                opt.isCorrect &&
                  !opt.wasChosen &&
                  !autoAwarded &&
                  "border-dashed border-blue-400 bg-blue-50/40 text-blue-700",
                !opt.isCorrect &&
                  opt.wasChosen &&
                  !question.isCorrect &&
                  "border-red-400 bg-red-50 text-red-700",
                !opt.wasChosen &&
                  (!opt.isCorrect || autoAwarded) &&
                  "border-[#E5E7EB] text-[#6B7280]",
              )}
            >
              <span className="flex-1 min-w-0 wrap-break-word">{opt.text}</span>
              {opt.wasChosen && (opt.isCorrect || autoAwarded) && (
                <CheckCircle
                  size={14}
                  className="text-green-600 shrink-0 mt-0.5"
                />
              )}
              {!opt.isCorrect && opt.wasChosen && !question.isCorrect && (
                <XCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

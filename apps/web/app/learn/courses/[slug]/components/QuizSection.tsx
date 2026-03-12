'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, RotateCcw, Trophy } from 'lucide-react';
import { GridLoader } from 'react-spinners';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import {
  useSubmitQuiz,
  type StudentModuleQuiz,
  type QuizAttemptSummary,
  type QuizAttemptResult,
  type MarkedQuestion,
} from '@/hooks/queries/courses';

interface QuizSectionProps {
  slug: string;
  moduleId: string;
  quiz: StudentModuleQuiz;
  lastAttempt: QuizAttemptSummary | null;
  onPass: () => void;
}

export function QuizSection({ slug, moduleId, quiz, lastAttempt: initialLastAttempt, onPass }: QuizSectionProps) {
  const queryClient = useQueryClient();
  const [answers, setAnswers] = useState<Record<string, Set<string>>>({});
  const [result, setResult] = useState<QuizAttemptResult | null>(null);
  const [lastAttempt, setLastAttempt] = useState(initialLastAttempt);
  const { mutate: submit, isPending, error } = useSubmitQuiz();

  // Notify parent if already passed on mount
  useEffect(() => {
    if (lastAttempt?.status === 'pass') onPass();
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

  const allAnswered = quiz.questions.every((q) => (answers[q.id]?.size ?? 0) > 0);

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
          queryClient.invalidateQueries({ queryKey: ['student', 'module', slug, moduleId] });
          if (data.attempt.status === 'pass') onPass();
        },
      },
    );
  }

  function handleRetry() {
    setResult(null);
    setAnswers({});
  }

  const alreadyPassed = lastAttempt?.status === 'pass' && !result;

  return (
    <div className="mt-12 pt-10 border-t-2 border-[#E5E7EB]">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="font-body text-xs text-[#9CA3AF] uppercase tracking-widest mb-1">Module Quiz</p>
          <h3 className="font-heading font-bold text-xl text-[#0F0F0F]">{quiz.title}</h3>
          <p className="font-body text-sm text-[#6B7280] mt-1">
            Pass score: {quiz.passingScore}% — {quiz.questions.length} question{quiz.questions.length !== 1 ? 's' : ''}
          </p>
        </div>
        {alreadyPassed && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 text-green-700 shrink-0">
            <Trophy size={14} />
            <span className="font-body text-xs font-medium">Passed</span>
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
      ) : isPending ? (
        /* ── Processing state ── */
        <div className="flex flex-col items-center justify-center py-16 gap-6">
          <div className="w-24 h-24 rounded-2xl bg-[#F3E8FF] flex items-center justify-center shadow-[0_0_0_6px_rgba(61,0,107,0.07)]">
            <GridLoader color="#3D006B" size={10} margin={3} />
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="font-heading font-bold text-base text-[#0F0F0F]">Grading your answers</p>
            <p className="font-body text-sm text-[#6B7280]">The system is processing your results…</p>
          </div>
        </div>
      ) : result ? (
        /* ── Results view ── */
        <>
          <div
            className={cn(
              'flex items-center gap-2 px-4 py-3 rounded-xl mb-6 font-body text-sm font-medium',
              result.attempt.status === 'pass' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600',
            )}
          >
            {result.attempt.status === 'pass' ? <CheckCircle size={16} /> : <XCircle size={16} />}
            You scored <strong>{result.attempt.score}%</strong>
            &nbsp;—&nbsp;
            {result.attempt.status === 'pass' ? 'Passed! You can continue.' : 'Failed. Review and try again.'}
          </div>

          <div className="flex flex-col gap-8">
            {result.questions.map((q, i) => (
              <MarkedQuestionRow key={q.questionId} question={q} index={i} />
            ))}
          </div>

          {result.attempt.status === 'fail' && (
            <div className="mt-8">
              <Button variant="secondary" size="md" onClick={handleRetry} className="flex items-center gap-2">
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
              Last attempt: <strong>{lastAttempt.score}%</strong> — Failed
            </div>
          )}

          <div className="flex flex-col gap-8">
            {quiz.questions.map((q, i) => (
              <div key={q.id} className="flex flex-col gap-3">
                <p className="font-body text-sm font-medium text-[#0F0F0F]">
                  {i + 1}. {q.text}
                </p>
                <div className="flex flex-col gap-2">
                  {q.options.map((opt) => {
                    const chosen = answers[q.id]?.has(opt.id) ?? false;
                    return (
                      <label
                        key={opt.id}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors',
                          chosen ? 'border-[#3D006B] bg-[#F3E8FF]' : 'border-[#E5E7EB] hover:border-[#D1D5DB]',
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={chosen}
                          onChange={() => toggleOption(q.id, opt.id)}
                          className="accent-[#3D006B]"
                        />
                        <span className="font-body text-sm text-[#374151]">{opt.text}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {error && (
            <p className="font-body text-sm text-red-500 mt-4">{(error as Error).message}</p>
          )}

          <div className="mt-8">
            <Button size="md" onClick={handleSubmit} disabled={!allAnswered}>
              Submit quiz
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function MarkedQuestionRow({ question, index }: { question: MarkedQuestion; index: number }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        {question.isCorrect
          ? <CheckCircle size={16} className="text-green-600 shrink-0" />
          : <XCircle size={16} className="text-red-500 shrink-0" />}
        <p className="font-body text-sm font-medium text-[#0F0F0F]">
          {index + 1}. {question.text}
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {question.options.map((opt) => (
          <div
            key={opt.id}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-body',
              opt.isCorrect && opt.wasChosen && 'border-green-500 bg-green-50 text-green-800',
              opt.isCorrect && !opt.wasChosen && 'border-green-400 bg-green-50/60 text-green-700',
              !opt.isCorrect && opt.wasChosen && 'border-red-400 bg-red-50 text-red-700',
              !opt.isCorrect && !opt.wasChosen && 'border-[#E5E7EB] text-[#6B7280]',
            )}
          >
            <span className="flex-1">{opt.text}</span>
            {opt.isCorrect && <CheckCircle size={14} className="text-green-600 shrink-0" />}
            {!opt.isCorrect && opt.wasChosen && <XCircle size={14} className="text-red-500 shrink-0" />}
          </div>
        ))}
      </div>
    </div>
  );
}

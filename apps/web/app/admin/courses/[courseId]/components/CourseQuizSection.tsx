'use client';

import { useState } from 'react';
import { Button, PageLoader } from '@/components/ui';
import { QuizBuilder } from '@/components/admin/QuizBuilder';
import { useCourseQuiz } from '@/hooks/queries/quizzes';

export function CourseQuizSection({ courseId, isDraft }: { courseId: string; isDraft: boolean }) {
  const { data: quiz, isLoading } = useCourseQuiz(courseId);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(false);

  return (
    <div className="mt-10">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-[#E5E7EB] dark:bg-[#2d2d2d]" />
        <span className="font-body text-xs text-[#9CA3AF] dark:text-[#6B7280] uppercase tracking-wide shrink-0">Course Quiz</span>
        <div className="flex-1 h-px bg-[#E5E7EB] dark:bg-[#2d2d2d]" />
      </div>

      {!isDraft ? (
        /* ── Locked state: show quiz read-only or "no quiz" ── */
        isLoading ? (
          <PageLoader type="list" count={2} />
        ) : (
          <QuizBuilder courseId={courseId} readOnly />
        )

      ) : isLoading ? (
        <PageLoader type="list" count={2} />

      ) : quiz && !editing ? (
        /* ── Summary card (default after quiz exists) ── */
        <div
          onClick={() => setEditing(true)}
          className="group flex items-center gap-4 px-5 py-4 bg-white dark:bg-[#1a1a1a] border border-[#E5E7EB] dark:border-[#2d2d2d] rounded-xl cursor-pointer hover:border-[#3D006B]/30 hover:shadow-[0_2px_12px_rgba(61,0,107,0.08)] transition-all duration-200"
        >
          <div className="w-9 h-9 rounded-full bg-[#F3E8FF] flex items-center justify-center shrink-0 group-hover:bg-[#3D006B] transition-colors duration-200">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3D006B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-white transition-colors duration-200">
              <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-heading font-semibold text-sm text-[#0F0F0F] dark:text-[#F9FAFB] truncate">{quiz.title}</p>
            <p className="font-body text-xs text-[#9CA3AF] dark:text-[#6B7280] mt-0.5">
              {quiz.questions.length} question{quiz.questions.length !== 1 ? 's' : ''} · {quiz.passingScore}% to pass · {quiz.maxAttempts} attempt{quiz.maxAttempts !== 1 ? 's' : ''}
            </p>
          </div>
          <svg className="text-[#D1D5DB] group-hover:text-[#3D006B] transition-colors duration-200 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>

      ) : quiz && editing ? (
        /* ── Edit existing quiz ── */
        <div className="flex flex-col gap-4">
          <QuizBuilder courseId={courseId} />
          <div className="flex justify-end pt-2 border-t border-[#E5E7EB] dark:border-[#2d2d2d]">
            <Button size="md" disabled={quiz.questions.length === 0} onClick={() => setEditing(false)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Save & Finish
            </Button>
          </div>
        </div>

      ) : adding ? (
        /* ── Create new quiz ── */
        <div className="flex flex-col gap-4">
          <QuizBuilder courseId={courseId} />
          <div className="flex justify-end pt-2 border-t border-[#E5E7EB] dark:border-[#2d2d2d]">
            <Button size="md" disabled={!quiz || quiz.questions.length === 0} onClick={() => setAdding(false)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Save & Finish
            </Button>
          </div>
        </div>

      ) : (
        /* ── Prompt (no quiz yet) ── */
        <div className="flex flex-col items-center text-center py-10 border-2 border-dashed border-[#E5E7EB] dark:border-[#2d2d2d] rounded-xl">
          <div className="w-12 h-12 rounded-full bg-[#F3E8FF] dark:bg-[#2d1a4a] flex items-center justify-center mb-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3D006B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <h3 className="font-heading font-bold text-sm text-[#0F0F0F] dark:text-[#F9FAFB] mb-1">Add a course-level quiz?</h3>
          <p className="font-body text-xs text-[#9CA3AF] dark:text-[#6B7280] max-w-xs mb-5">
            Test overall understanding across all modules. Students take this after completing the course.
          </p>
          <Button size="sm" onClick={() => setAdding(true)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Course Quiz
          </Button>
        </div>
      )}
    </div>
  );
}

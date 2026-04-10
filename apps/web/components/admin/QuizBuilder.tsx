"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import {
  useLessonQuiz,
  useModuleQuiz,
  useCourseQuiz,
  useCreateLessonQuiz,
  useCreateModuleQuiz,
  useCreateCourseQuiz,
  useUpdateQuiz,
  useDeleteQuiz,
  useAddQuestion,
  useUpdateQuestion,
  useDeleteQuestion,
  useAddOption,
  useUpdateOption,
  useDeleteOption,
  quizKeys,
  type Quiz,
  type Question,
  type QuestionOption,
} from "@/hooks/queries/quizzes";
import { Button, Input, PageLoader } from "@/components/ui";
import { SaveWarning } from "@/components/SaveWarning";
import { cn } from "@/lib/utils";

// ─── Correct checkbox ─────────────────────────────────────────────────────────

function CorrectCheckbox({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      title={checked ? "Mark as incorrect" : "Mark as correct"}
      className={cn(
        "w-4.5 h-4.5 rounded flex items-center justify-center border-2 shrink-0 transition-all duration-150",
        checked
          ? "bg-[#3D006B] border-[#3D006B]"
          : "bg-white border-[#D1D5DB] hover:border-[#3D006B]/60",
        disabled && "opacity-50 cursor-not-allowed",
      )}
    >
      {checked && (
        <svg
          width="9"
          height="9"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </button>
  );
}

// ─── Option row ───────────────────────────────────────────────────────────────

function OptionRow({
  option,
  cacheKey,
  readOnly,
}: {
  option: QuestionOption;
  cacheKey: readonly unknown[];
  readOnly?: boolean;
}) {
  const [text, setText] = useState(option.text);
  const [prevPropText, setPrevPropText] = useState(option.text);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { mutate: updateOption, isPending } = useUpdateOption(cacheKey);
  const { mutate: deleteOption, isPending: deleting } =
    useDeleteOption(cacheKey);

  if (option.text !== prevPropText) {
    setText(option.text);
    setPrevPropText(option.text);
  }

  function handleBlur() {
    if (readOnly) return;
    const trimmed = text.trim();
    if (!trimmed) {
      setText(option.text);
      return;
    }
    if (trimmed !== option.text) updateOption({ id: option.id, text: trimmed });
  }

  return (
    <div className="group flex items-start gap-3 px-4 py-2.5 rounded-lg hover:bg-[#FAFAFA] transition-colors">
      <CorrectCheckbox
        checked={option.isCorrect}
        onChange={(val) => updateOption({ id: option.id, isCorrect: val })}
        disabled={isPending || readOnly}
      />

      <textarea
        value={text}
        onChange={(e) => {
          if (readOnly) return;
          setText(e.target.value);
          e.target.style.height = "auto";
          e.target.style.height = e.target.scrollHeight + "px";
        }}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            e.currentTarget.blur();
          }
        }}
        disabled={isPending || readOnly}
        placeholder="Option text"
        rows={1}
        className="flex-1 font-body text-sm text-[#0F0F0F] bg-transparent border-b border-transparent focus:border-[#3D006B]/40 focus:outline-none placeholder:text-[#9CA3AF] transition-colors py-0.5 min-w-0 resize-none overflow-hidden leading-relaxed disabled:cursor-default"
      />

      {!readOnly &&
        !isPending &&
        (confirmDelete ? (
          <div
            className="flex items-center gap-1.5 shrink-0"
            onMouseLeave={() => setConfirmDelete(false)}
          >
            <button
              onClick={() => deleteOption(option.id)}
              disabled={deleting}
              className="font-body text-xs text-red-500 hover:text-red-600 px-1.5 py-0.5 rounded hover:bg-red-50 transition-colors"
            >
              {deleting ? "Deleting…" : "Delete"}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="font-body text-xs text-[#9CA3AF] hover:text-[#6B7280]"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-[#9CA3AF] hover:text-red-500 hover:bg-red-50 shrink-0"
            title="Delete option"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        ))}
    </div>
  );
}

// ─── Add option row ───────────────────────────────────────────────────────────

function AddOptionRow({
  questionId,
  nextOrderIndex,
  cacheKey,
  onDone,
}: {
  questionId: string;
  nextOrderIndex: number;
  cacheKey: readonly unknown[];
  onDone: () => void;
}) {
  const [text, setText] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const { mutateAsync: addOption, isPending } = useAddOption(cacheKey);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSave() {
    const trimmed = text.trim();
    if (!trimmed) {
      onDone();
      return;
    }
    setShowHint(false);
    await addOption({
      questionId,
      text: trimmed,
      isCorrect,
      orderIndex: nextOrderIndex,
    });
    setText("");
    setIsCorrect(false);
    inputRef.current?.focus();
  }

  async function handleSaveAndClose() {
    const trimmed = text.trim();
    if (!trimmed) {
      onDone();
      return;
    }
    setShowHint(false);
    await addOption({
      questionId,
      text: trimmed,
      isCorrect,
      orderIndex: nextOrderIndex,
    });
    onDone();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") handleSaveAndClose();
  }

  return (
    <div className="flex flex-col gap-2">
      {showHint && (
        <SaveWarning
          message={
            <>
              Press <span className="font-medium">Enter</span> or click{" "}
              <span className="font-medium">Add</span> to save.
            </>
          }
        />
      )}
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB]">
        <CorrectCheckbox
          checked={isCorrect}
          onChange={setIsCorrect}
          disabled={isPending}
        />
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setShowHint(true)}
          onKeyDown={handleKeyDown}
          placeholder="New option…"
          disabled={isPending}
          className="flex-1 font-body text-sm text-[#0F0F0F] bg-transparent border-b border-[#3D006B]/40 focus:outline-none placeholder:text-[#9CA3AF] py-0.5 min-w-0"
        />
        <button
          onClick={handleSave}
          disabled={isPending || !text.trim()}
          className="font-body text-xs font-medium text-[#3D006B] hover:text-[#5a0099] disabled:opacity-40 disabled:cursor-not-allowed shrink-0 transition-colors"
        >
          {isPending ? "Adding…" : "Add"}
        </button>
        <button
          onClick={handleSaveAndClose}
          disabled={isPending}
          className="font-body text-xs text-[#9CA3AF] hover:text-[#6B7280] disabled:opacity-40 shrink-0 transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
}

// ─── Question card ────────────────────────────────────────────────────────────

function QuestionCard({
  question,
  cacheKey,
  number,
  autoFocus,
  readOnly,
}: {
  question: Question;
  cacheKey: readonly unknown[];
  number: number;
  autoFocus?: boolean;
  readOnly?: boolean;
}) {
  const [text, setText] = useState(question.text);
  const [prevPropText, setPrevPropText] = useState(question.text);
  const [addingOption, setAddingOption] = useState(autoFocus);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { mutate: updateQuestion, isPending: saving } =
    useUpdateQuestion(cacheKey);
  const { mutate: deleteQuestion, isPending: deleting } =
    useDeleteQuestion(cacheKey);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (question.text !== prevPropText) {
    setText(question.text);
    setPrevPropText(question.text);
  }

  useEffect(() => {
    if (autoFocus) {
      textareaRef.current?.focus();
      textareaRef.current?.select();
    }
  }, [autoFocus]);

  function handleTextBlur() {
    if (readOnly) return;
    const trimmed = text.trim();
    if (!trimmed) {
      setText(question.text);
      return;
    }
    if (trimmed !== question.text)
      updateQuestion({ id: question.id, text: trimmed });
  }

  const sortedOptions = [...question.options].sort(
    (a, b) => a.orderIndex - b.orderIndex,
  );
  const correctCount = sortedOptions.filter((o) => o.isCorrect).length;

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden hover:shadow-sm transition-shadow">
      {/* Question header */}
      <div className="flex items-start gap-3 px-5 pt-5 pb-4 border-b border-[#F3F4F6]">
        <div className="w-6 h-6 rounded-full bg-[#F3E8FF] flex items-center justify-center shrink-0 mt-0.5">
          <span className="font-heading font-bold text-xs text-[#3D006B]">
            {number}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleTextBlur}
            rows={2}
            disabled={readOnly}
            placeholder="Enter your question…"
            className="w-full font-body text-sm text-[#0F0F0F] bg-transparent resize-none leading-relaxed border-b border-[#E5E7EB] focus:border-[#3D006B]/50 focus:outline-none placeholder:text-[#9CA3AF] transition-colors disabled:cursor-default"
          />
          {saving && (
            <p className="font-body text-xs text-[#9CA3AF] mt-1">Saving…</p>
          )}
        </div>

        {/* Delete question */}
        {!readOnly &&
          (confirmDelete ? (
            <div
              className="flex items-center gap-2 shrink-0"
              onMouseLeave={() => setConfirmDelete(false)}
            >
              <button
                onClick={() => deleteQuestion(question.id)}
                disabled={deleting}
                className="font-body text-xs text-red-500 hover:text-red-600 transition-colors"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="font-body text-xs text-[#9CA3AF]"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
              title="Delete question"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4h6v2" />
              </svg>
            </button>
          ))}
      </div>

      {/* Options area */}
      <div className="px-2 py-3">
        <div className="flex items-center gap-2 px-3 mb-2">
          <p className="font-body text-xs text-[#9CA3AF]">
            Multiple choice: check all correct answers
          </p>
          {sortedOptions.length > 0 && (
            <span
              className={cn(
                "font-body text-xs px-1.5 py-0.5 rounded-full shrink-0",
                correctCount === 0
                  ? "text-amber-600 bg-amber-50"
                  : "text-[#3D006B] bg-[#F3E8FF]",
              )}
            >
              {correctCount} correct
            </span>
          )}
        </div>

        {sortedOptions.map((option) => (
          <OptionRow
            key={option.id}
            option={option}
            cacheKey={cacheKey}
            readOnly={readOnly}
          />
        ))}

        {!readOnly && addingOption && (
          <div className="mt-1">
            <AddOptionRow
              questionId={question.id}
              nextOrderIndex={sortedOptions.length + 1}
              cacheKey={cacheKey}
              onDone={() => setAddingOption(false)}
            />
          </div>
        )}

        {!readOnly && !addingOption && (
          <button
            onClick={() => setAddingOption(true)}
            className="flex items-center gap-2 px-4 py-2 mt-1 font-body text-sm text-[#6B7280] hover:text-[#3D006B] transition-colors rounded-lg hover:bg-[#F3E8FF]/50 w-full text-left"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add option
          </button>
        )}
      </div>

      {/* Validation hints — only in edit mode */}
      {!readOnly && sortedOptions.length === 0 && (
        <div className="px-5 pb-4">
          <p className="font-body text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg">
            Add at least two options to this question.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Quiz settings card ───────────────────────────────────────────────────────

function QuizSettings({
  quiz,
  cacheKey,
  readOnly,
}: {
  quiz: Quiz;
  cacheKey: readonly unknown[];
  readOnly?: boolean;
}) {
  const [title, setTitle] = useState(quiz.title);
  const [passingScore, setPassingScore] = useState(String(quiz.passingScore));
  const [maxAttempts, setMaxAttempts] = useState(String(quiz.maxAttempts));
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  const { mutateAsync: updateQuiz, isPending } = useUpdateQuiz(cacheKey);

  const [prevQuizId, setPrevQuizId] = useState(quiz.id);
  if (quiz.id !== prevQuizId) {
    setPrevQuizId(quiz.id);
    setTitle(quiz.title);
    setPassingScore(String(quiz.passingScore));
    setMaxAttempts(String(quiz.maxAttempts));
    setDirty(false);
  }

  function mark(field: "title" | "ps" | "ma", value: string) {
    if (readOnly) return;
    if (field === "title") setTitle(value);
    if (field === "ps") setPassingScore(value);
    if (field === "ma") setMaxAttempts(value);
    setDirty(true);
    setError("");
  }

  async function handleSave() {
    const ps = parseInt(passingScore, 10);
    const ma = parseInt(maxAttempts, 10);
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (isNaN(ps) || ps < 0 || ps > 100) {
      setError("Passing score must be 0–100.");
      return;
    }
    if (isNaN(ma) || ma < 1) {
      setError("Max attempts must be at least 1.");
      return;
    }
    try {
      await updateQuiz({
        id: quiz.id,
        title: title.trim(),
        passingScore: ps,
        maxAttempts: ma,
      });
      setDirty(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    }
  }

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-heading font-bold text-sm text-[#0F0F0F]">
          Quiz Settings
        </h3>
        {dirty && !readOnly && (
          <Button size="sm" loading={isPending} onClick={handleSave}>
            Save settings
          </Button>
        )}
        {readOnly && (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg">
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#D97706"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span className="font-body text-xs text-amber-700">Locked</span>
          </span>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <label className="font-body text-xs font-medium text-[#374151] block mb-1.5">
            Quiz Title {!readOnly && <span className="text-red-400">*</span>}
          </label>
          <Input
            value={title}
            onChange={(e) => mark("title", e.target.value)}
            placeholder="e.g. Module 1 Assessment"
            maxLength={120}
            disabled={readOnly}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-body text-xs font-medium text-[#374151] block mb-1.5">
              Passing Score (%)
            </label>
            <div className="relative">
              <Input
                type="number"
                min={0}
                max={100}
                value={passingScore}
                onChange={(e) => mark("ps", e.target.value)}
                className="pr-8"
                disabled={readOnly}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 font-body text-sm text-[#9CA3AF] pointer-events-none">
                %
              </span>
            </div>
            <p className="font-body text-xs text-[#9CA3AF] mt-1">
              Minimum to pass
            </p>
          </div>

          <div>
            <label className="font-body text-xs font-medium text-[#374151] block mb-1.5">
              Max Attempts
            </label>
            <Input
              type="number"
              min={1}
              value={maxAttempts}
              onChange={(e) => mark("ma", e.target.value)}
              disabled={readOnly}
            />
            <p className="font-body text-xs text-[#9CA3AF] mt-1">
              Student retry limit
            </p>
          </div>
        </div>

        {error && (
          <p className="font-body text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Create quiz panel ────────────────────────────────────────────────────────

function CreateQuizPanel({
  onCreate,
}: {
  onCreate: (data: {
    title: string;
    passingScore: number;
    maxAttempts: number;
  }) => Promise<unknown>;
}) {
  const [title, setTitle] = useState("");
  const [passingScore, setPassingScore] = useState("70");
  const [maxAttempts, setMaxAttempts] = useState("3");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleCreate() {
    const ps = parseInt(passingScore, 10);
    const ma = parseInt(maxAttempts, 10);
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (isNaN(ps) || ps < 0 || ps > 100) {
      setError("Passing score must be 0–100.");
      return;
    }
    if (isNaN(ma) || ma < 1) {
      setError("Max attempts must be at least 1.");
      return;
    }
    setIsPending(true);
    try {
      await onCreate({
        title: title.trim(),
        passingScore: ps,
        maxAttempts: ma,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create quiz.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex flex-col items-center py-12 border-2 border-dashed border-[#E5E7EB] rounded-xl">
      <div className="w-14 h-14 rounded-full bg-[#F3E8FF] flex items-center justify-center mb-4">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#3D006B"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>

      <h3 className="font-heading font-bold text-base text-[#0F0F0F] mb-1">
        No quiz yet
      </h3>
      <p className="font-body text-sm text-[#6B7280] mb-6 max-w-xs text-center">
        Add a quiz to assess student understanding.
      </p>

      <div className="w-full max-w-sm flex flex-col gap-4 px-6">
        <div>
          <label className="font-body text-xs font-medium text-[#374151] block mb-1.5">
            Quiz Title <span className="text-red-400">*</span>
          </label>
          <Input
            placeholder="e.g. Module 1 Assessment"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setError("");
            }}
            maxLength={120}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="font-body text-xs font-medium text-[#374151] block mb-1.5">
              Passing Score
            </label>
            <div className="relative">
              <Input
                type="number"
                min={0}
                max={100}
                value={passingScore}
                onChange={(e) => {
                  setPassingScore(e.target.value);
                  setError("");
                }}
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 font-body text-sm text-[#9CA3AF] pointer-events-none">
                %
              </span>
            </div>
          </div>
          <div>
            <label className="font-body text-xs font-medium text-[#374151] block mb-1.5">
              Max Attempts
            </label>
            <Input
              type="number"
              min={1}
              value={maxAttempts}
              onChange={(e) => {
                setMaxAttempts(e.target.value);
                setError("");
              }}
            />
          </div>
        </div>

        {error && (
          <p className="font-body text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        <Button
          size="md"
          loading={isPending}
          disabled={!title.trim()}
          onClick={handleCreate}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Create Quiz
        </Button>
      </div>
    </div>
  );
}

// ─── Quiz editor ──────────────────────────────────────────────────────────────

function QuizEditor({
  quiz,
  cacheKey,
  readOnly,
}: {
  quiz: Quiz;
  cacheKey: readonly unknown[];
  readOnly?: boolean;
}) {
  const [confirmDeleteQuiz, setConfirmDeleteQuiz] = useState(false);
  const [newQuestionId, setNewQuestionId] = useState<string | null>(null);
  const { mutateAsync: addQuestion, isPending: addingQuestion } =
    useAddQuestion(cacheKey);
  const { mutate: deleteQuiz, isPending: deletingQuiz } =
    useDeleteQuiz(cacheKey);

  const sortedQuestions = [...quiz.questions].sort(
    (a, b) => a.orderIndex - b.orderIndex,
  );

  async function handleAddQuestion() {
    const q = await addQuestion({
      quizId: quiz.id,
      text: "New question",
      orderIndex: sortedQuestions.length + 1,
    });
    setNewQuestionId(q.id);
  }

  return (
    <div className="flex flex-col gap-5">
      <QuizSettings quiz={quiz} cacheKey={cacheKey} readOnly={readOnly} />

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-[#E5E7EB]" />
        <span className="font-body text-xs text-[#9CA3AF] shrink-0 uppercase tracking-wide">
          Questions ({sortedQuestions.length})
        </span>
        <div className="flex-1 h-px bg-[#E5E7EB]" />
      </div>

      {sortedQuestions.length === 0 && (
        <div className="flex flex-col items-center py-10 border-2 border-dashed border-[#E5E7EB] rounded-xl text-center">
          <div className="w-10 h-10 rounded-full bg-[#F3E8FF] flex items-center justify-center mb-3">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#3D006B"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
          <p className="font-body text-sm text-[#6B7280] mb-1">
            No questions yet
          </p>
          {!readOnly && (
            <p className="font-body text-xs text-[#9CA3AF]">
              Click &#34;Add Question&#34; to get started.
            </p>
          )}
        </div>
      )}

      {sortedQuestions.map((q, i) => {
        const hasNoCorrect =
          q.options.length > 0 &&
          q.options.filter((o) => o.isCorrect).length === 0;
        return (
          <div key={q.id} className="flex flex-col gap-2">
            <QuestionCard
              question={q}
              cacheKey={cacheKey}
              number={i + 1}
              autoFocus={q.id === newQuestionId}
              readOnly={readOnly}
            />
            {hasNoCorrect && !readOnly && (
              <div className="px-2">
                <p className="font-body text-xs font-medium text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg flex items-center gap-2">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  At least one correct option required for this question.
                </p>
              </div>
            )}
          </div>
        );
      })}

      {!readOnly && (
        <Button
          variant="secondary"
          size="md"
          loading={addingQuestion}
          onClick={handleAddQuestion}
          className="w-full"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Question
        </Button>
      )}

      {!readOnly && (
        <div className="border-t border-[#E5E7EB] pt-4">
          {confirmDeleteQuiz ? (
            <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-lg">
              <p className="font-body text-sm text-red-700 flex-1">
                Delete this quiz and all its questions?
              </p>
              <Button
                variant="danger"
                size="sm"
                loading={deletingQuiz}
                onClick={() => deleteQuiz(quiz.id)}
              >
                Delete Quiz
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmDeleteQuiz(false)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDeleteQuiz(true)}
              className="font-body text-xs text-[#9CA3AF] hover:text-red-500 transition-colors flex items-center gap-1.5"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4h6v2" />
              </svg>
              Delete quiz
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── QuizBuilder ──────────────────────────────────────────────────────────────

export type QuizBuilderProps =
  | { lessonId: string; moduleId?: never; courseId?: never; readOnly?: boolean }
  | { moduleId: string; lessonId?: never; courseId?: never; readOnly?: boolean }
  | {
      courseId: string;
      lessonId?: never;
      moduleId?: never;
      readOnly?: boolean;
    };

function ModuleQuizBuilder({
  moduleId,
  readOnly,
}: {
  moduleId: string;
  readOnly?: boolean;
}) {
  const cacheKey = quizKeys.forModule(moduleId);
  const { data: quiz, isLoading, isError } = useModuleQuiz(moduleId);
  const { mutateAsync: createQuiz } = useCreateModuleQuiz(moduleId);

  if (isLoading) return <PageLoader type="list" count={2} />;
  if (isError) {
    return (
      <p className="font-body text-sm text-red-500 bg-red-50 px-4 py-3 rounded-lg">
        Failed to load quiz. Please refresh.
      </p>
    );
  }
  if (!quiz) {
    if (readOnly) {
      return (
        <div className="flex flex-col items-center text-center py-10 border-2 border-dashed border-[#E5E7EB] rounded-xl">
          <p className="font-body text-sm text-[#9CA3AF]">
            No quiz was added to this module.
          </p>
        </div>
      );
    }
    return <CreateQuizPanel onCreate={createQuiz} />;
  }
  return <QuizEditor quiz={quiz} cacheKey={cacheKey} readOnly={readOnly} />;
}

function CourseQuizBuilder({
  courseId,
  readOnly,
}: {
  courseId: string;
  readOnly?: boolean;
}) {
  const cacheKey = quizKeys.forCourse(courseId);
  const { data: quiz, isLoading, isError } = useCourseQuiz(courseId);
  const { mutateAsync: createQuiz } = useCreateCourseQuiz(courseId);

  if (isLoading) return <PageLoader type="list" count={2} />;
  if (isError) {
    return (
      <p className="font-body text-sm text-red-500 bg-red-50 px-4 py-3 rounded-lg">
        Failed to load quiz. Please refresh.
      </p>
    );
  }
  if (!quiz) {
    if (readOnly) {
      return (
        <div className="flex flex-col items-center text-center py-10 border-2 border-dashed border-[#E5E7EB] rounded-xl">
          <p className="font-body text-sm text-[#9CA3AF]">
            No quiz was added to this course.
          </p>
        </div>
      );
    }
    return <CreateQuizPanel onCreate={createQuiz} />;
  }
  return <QuizEditor quiz={quiz} cacheKey={cacheKey} readOnly={readOnly} />;
}

function LessonQuizBuilder({
  lessonId,
  readOnly,
}: {
  lessonId: string;
  readOnly?: boolean;
}) {
  const cacheKey = quizKeys.forLesson(lessonId);
  const { data: quiz, isLoading, isError } = useLessonQuiz(lessonId);
  const { mutateAsync: createQuiz } = useCreateLessonQuiz(lessonId);

  if (isLoading) return <PageLoader type="list" count={2} />;
  if (isError) {
    return (
      <p className="font-body text-sm text-red-500 bg-red-50 px-4 py-3 rounded-lg">
        Failed to load quiz. Please refresh.
      </p>
    );
  }
  if (!quiz) {
    if (readOnly) {
      return (
        <div className="flex flex-col items-center text-center py-10 border-2 border-dashed border-[#E5E7EB] rounded-xl">
          <p className="font-body text-sm text-[#9CA3AF]">
            No quiz was added to this lesson.
          </p>
        </div>
      );
    }
    return <CreateQuizPanel onCreate={createQuiz} />;
  }
  return <QuizEditor quiz={quiz} cacheKey={cacheKey} readOnly={readOnly} />;
}

export function QuizBuilder(props: QuizBuilderProps) {
  if ("lessonId" in props && props.lessonId)
    return (
      <LessonQuizBuilder lessonId={props.lessonId} readOnly={props.readOnly} />
    );
  if ("moduleId" in props && props.moduleId)
    return (
      <ModuleQuizBuilder moduleId={props.moduleId} readOnly={props.readOnly} />
    );
  if ("courseId" in props && props.courseId)
    return (
      <CourseQuizBuilder courseId={props.courseId} readOnly={props.readOnly} />
    );
  return null;
}

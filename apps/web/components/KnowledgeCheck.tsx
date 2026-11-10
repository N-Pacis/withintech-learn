"use client";

import { useState, type KeyboardEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Info,
  Lightbulb,
  RotateCcw,
  X,
} from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { CheckQuestion } from "@/lib/knowledge-check";

const LETTERS = "ABCDEF";

type Picks = (number | null)[];

function Dots({
  questions,
  picks,
  current,
  onSelect,
}: {
  questions: CheckQuestion[];
  picks: Picks;
  current: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {questions.map((q, i) => {
        const pick = picks[i];
        const state =
          pick === null ? "open" : pick === q.answer ? "right" : "wrong";
        return (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(i)}
            aria-label={`Question ${i + 1}${state === "open" ? "" : state === "right" ? ", correct" : ", incorrect"}`}
            aria-current={i === current ? "step" : undefined}
            className={cn(
              "h-2 rounded-full transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
              i === current ? "w-6" : "w-2",
              i === current
                ? "bg-primary dark:bg-primary-tint"
                : state === "right"
                  ? "bg-success"
                  : state === "wrong"
                    ? "bg-danger"
                    : "bg-border-strong",
            )}
          />
        );
      })}
    </div>
  );
}

function Option({
  label,
  text,
  state,
  onPick,
}: {
  label: string;
  text: string;
  state: "open" | "right" | "wrong" | "dim";
  onPick: () => void;
}) {
  const locked = state !== "open";
  return (
    <button
      type="button"
      onClick={onPick}
      aria-disabled={locked}
      className={cn(
        "flex w-full min-h-11 items-center gap-3 rounded-lg border px-3 py-2 text-left font-body text-sm transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        state === "open" &&
          "cursor-pointer border-border-strong bg-surface-card text-foreground hover:border-primary-tint hover:bg-primary-soft-alt",
        state === "right" && "border-success bg-success-soft text-success-dark",
        state === "wrong" && "border-danger bg-danger-soft text-danger-dark",
        state === "dim" && "border-border bg-surface-card text-muted",
      )}
    >
      <span
        className={cn(
          "flex size-6 flex-none items-center justify-center rounded-md border text-xs font-semibold",
          state === "open" && "border-border-strong text-muted-contrast",
          state === "dim" && "border-border text-muted",
          state === "right" && "border-transparent bg-success text-white dark:text-surface",
          state === "wrong" && "border-transparent bg-danger text-white dark:text-surface",
        )}
      >
        {label}
      </span>
      <span className="flex-1">{text}</span>
      {state === "right" && <Check size={18} aria-hidden="true" />}
      {state === "wrong" && <X size={18} aria-hidden="true" />}
    </button>
  );
}

function QuestionSlide({
  question,
  index,
  total,
  pick,
  onPick,
}: {
  question: CheckQuestion;
  index: number;
  total: number;
  pick: number | null;
  onPick: (option: number) => void;
}) {
  const answered = pick !== null;
  const correct = pick === question.answer;
  return (
    <div className="kc-slide-in flex flex-col gap-2">
      <p className="font-body text-xs text-muted-contrast">
        Question {index + 1} of {total}
      </p>
      <p className="mb-2 font-body text-base font-semibold leading-snug text-foreground">
        {question.q}
      </p>
      {question.options.map((text, i) => {
        const state = !answered
          ? "open"
          : i === question.answer
            ? "right"
            : i === pick
              ? "wrong"
              : "dim";
        return (
          <Option
            key={i}
            label={LETTERS[i]}
            text={text}
            state={state}
            onPick={() => !answered && onPick(i)}
          />
        );
      })}
      <div role="status" aria-live="polite">
        {answered && (
          <div className="mt-2 flex gap-2.5 rounded-lg bg-surface-muted px-3 py-2.5 font-body text-sm leading-relaxed text-foreground-soft">
            {correct ? (
              <CheckCircle2 size={18} className="mt-0.5 flex-none text-success" aria-hidden="true" />
            ) : (
              <Info size={18} className="mt-0.5 flex-none text-danger" aria-hidden="true" />
            )}
            <span>
              <strong className="font-semibold text-foreground">
                {correct ? "Correct." : "Not quite."}
              </strong>{" "}
              {question.why}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function SummarySlide({ correct, total }: { correct: number; total: number }) {
  const perfect = correct === total;
  return (
    <div className="kc-slide-in flex flex-col gap-1">
      <p className="font-body text-xs text-muted-contrast">Done</p>
      <p className="font-heading text-4xl font-bold text-foreground">
        {correct} / {total}
      </p>
      <p className="font-body text-sm text-muted-contrast">
        {perfect
          ? "All correct. You're ready for the module quiz."
          : "Tap a dot to review the ones you missed."}
      </p>
    </div>
  );
}

export default function KnowledgeCheck({ questions }: { questions: CheckQuestion[] }) {
  const total = questions.length;
  const [picks, setPicks] = useState<Picks>(() => questions.map(() => null));
  const [current, setCurrent] = useState(0);

  const onSummary = current === total;
  const answeredCurrent = !onSummary && picks[current] !== null;
  const correct = picks.filter((p, i) => p === questions[i].answer).length;

  const go = (i: number) => setCurrent(Math.max(0, Math.min(total, i)));
  const pick = (option: number) =>
    setPicks((prev) => prev.map((p, i) => (i === current ? option : p)));
  const reset = () => {
    setPicks(questions.map(() => null));
    setCurrent(0);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "ArrowLeft" && current > 0) go(current - 1);
    if (e.key === "ArrowRight" && (onSummary ? false : answeredCurrent)) go(current + 1);
  };

  return (
    <section
      aria-label="Knowledge check"
      onKeyDown={onKeyDown}
      className="rounded-xl border border-border bg-surface-card p-5 shadow-sm"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-heading text-base font-bold text-foreground">
          <Lightbulb size={18} className="text-primary dark:text-primary-tint" aria-hidden="true" />
          Check yourself
        </h3>
        <Dots questions={questions} picks={picks} current={current} onSelect={go} />
      </div>

      <div className="mt-5 min-h-72">
        {onSummary ? (
          <SummarySlide key="summary" correct={correct} total={total} />
        ) : (
          <QuestionSlide
            key={current}
            question={questions[current]}
            index={current}
            total={total}
            pick={picks[current]}
            onPick={pick}
          />
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => go(current - 1)}
          className={cn(current === 0 && "invisible")}
        >
          <ArrowLeft size={14} aria-hidden="true" /> Back
        </Button>
        {onSummary ? (
          <Button variant="secondary" size="sm" onClick={reset}>
            <RotateCcw size={14} aria-hidden="true" /> Try again
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={() => go(current + 1)}
            className={cn(!answeredCurrent && "invisible")}
          >
            {current === total - 1 ? "See score" : "Next"}
            <ArrowRight size={14} aria-hidden="true" />
          </Button>
        )}
      </div>
    </section>
  );
}

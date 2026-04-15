"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Circle, Code2, Trophy, Zap } from "lucide-react";
import {
  useStudentChallenges,
  type Difficulty,
  type ChallengeSort,
  type StudentChallengeListItem,
} from "@/hooks/queries/challenges";
import { Badge, FilterPills, SortDropdown, Pagination } from "@/components/ui";
import {
  DIFFICULTY_CONFIG,
  DIFFICULTY_FILTER_OPTIONS,
  CHALLENGE_SORT_OPTIONS,
} from "@/lib/challenges";
import { cn } from "@/lib/utils";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ChallengeListSkeleton() {
  return (
    <div className="bg-surface-card rounded-xl border border-border overflow-hidden">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-5 py-4 border-b border-border-subtle last:border-0 animate-pulse"
        >
          <div className="w-5 h-5 rounded-full bg-fill-muted shrink-0" />
          <div
            className="flex-1 h-4 bg-fill-muted rounded-md"
            style={{ width: `${50 + (i % 3) * 15}%` }}
          />
          <div className="w-14 h-5 bg-fill-muted rounded-full shrink-0" />
        </div>
      ))}
    </div>
  );
}

// ─── Stats bar ────────────────────────────────────────────────────────────────

function StatsBar({
  challenges,
  total,
}: {
  challenges: StudentChallengeListItem[];
  total: number;
}) {
  const completed = challenges.filter((c) => c.completed).length;
  const easy = challenges.filter((c) => c.difficulty === "easy").length;
  const medium = challenges.filter((c) => c.difficulty === "medium").length;
  const hard = challenges.filter((c) => c.difficulty === "hard").length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      <div className="bg-surface-card rounded-xl border border-border px-4 py-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary-soft flex items-center justify-center shrink-0">
          <Trophy size={16} className="text-primary" />
        </div>
        <div>
          <div className="font-heading font-bold text-lg text-foreground leading-none">
            {completed}
            <span className="font-body font-normal text-xs text-muted-contrast ml-1">
              / {total}
            </span>
          </div>
          <div className="font-body text-xs text-muted">Solved</div>
        </div>
      </div>
      <div className="bg-surface-card rounded-xl border border-border px-4 py-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-green-50 dark:bg-green-950/30 flex items-center justify-center shrink-0">
          <Zap size={16} className="text-green-600" />
        </div>
        <div>
          <div className="font-heading font-bold text-lg text-foreground leading-none">
            {pct}
            <span className="font-body font-normal text-xs text-muted-contrast">
              %
            </span>
          </div>
          <div className="font-body text-xs text-muted">Completion</div>
        </div>
      </div>
      <div className="bg-surface-card rounded-xl border border-border px-4 py-3">
        {(["easy", "medium", "hard"] as Difficulty[]).map((d, i) => {
          const cfg = DIFFICULTY_CONFIG[d];
          const count = d === "easy" ? easy : d === "medium" ? medium : hard;
          return (
            <div
              key={d}
              className={cn("flex items-center gap-1.5", i < 2 && "mb-1.5")}
            >
              <span className={cn("w-2 h-2 rounded-full shrink-0", cfg.dot)} />
              <span className="font-body text-xs text-muted">{cfg.label}</span>
              <span className="font-heading font-bold text-sm text-foreground ml-auto">
                {count}
              </span>
            </div>
          );
        })}
      </div>
      <div className="bg-surface-card rounded-xl border border-border px-4 py-3 flex flex-col justify-center gap-1.5">
        <div className="flex justify-between font-body text-xs text-muted">
          <span>Progress</span>
          <span>{pct}%</span>
        </div>
        <div className="h-2 bg-surface-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Challenge row ────────────────────────────────────────────────────────────

function ChallengeRow({ challenge }: { challenge: StudentChallengeListItem }) {
  const cfg = DIFFICULTY_CONFIG[challenge.difficulty];
  return (
    <Link
      href={`/learn/challenges/${challenge.slug}`}
      prefetch={false}
      className="group flex items-center gap-4 px-5 py-4 border-b border-border-subtle last:border-0 hover:bg-primary-soft-alt hover:bg-primary-soft/30 transition-colors"
    >
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-sm text-primary-tint font-semibold w-8 text-right shrink-0">
          {challenge.number}.
        </span>
        {challenge.completed ? (
          <CheckCircle2 size={18} className="text-green-500 shrink-0" />
        ) : (
          <Circle
            size={18}
            className="text-border-strong group-hover:text-primary-tint shrink-0 transition-colors"
          />
        )}
      </div>
      <span
        className={cn(
          "flex-1 font-body text-sm font-medium truncate transition-colors",
          challenge.completed
            ? "text-muted line-through decoration-[#D1D5DB]"
            : "text-foreground group-hover:text-primary",
        )}
      >
        {challenge.title}
      </span>
      <Badge variant={cfg.variant} size="sm" className="shrink-0">
        {cfg.label}
      </Badge>
    </Link>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="bg-surface-card rounded-xl border border-border py-20 flex flex-col items-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-primary-soft flex items-center justify-center">
        <Code2 size={28} className="text-primary" />
      </div>
      <div className="text-center">
        <p className="font-heading font-bold text-base text-foreground">
          {filtered ? "No challenges match" : "No challenges yet"}
        </p>
        <p className="font-body text-sm text-muted mt-1">
          {filtered
            ? "Try a different filter."
            : "Check back soon — challenges are coming!"}
        </p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ChallengesPage() {
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const [sort, setSort] = useState<ChallengeSort>("number_asc");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useStudentChallenges({
    page,
    limit: 20,
    difficulty: difficulty === "all" ? undefined : difficulty,
    sort,
  });

  const totalPages = data ? Math.ceil(data.total / 20) : 1;

  function resetAndSet<T>(setter: (v: T) => void, value: T) {
    setter(value);
    setPage(1);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="mb-6">
        <h1 className="font-heading font-black text-3xl text-foreground">
          Challenges
        </h1>
        <p className="font-body text-sm text-muted mt-1">
          Solve problems in Python, Java, JavaScript, C, C++, or Go.
        </p>
      </div>

      {!isLoading && data && (
        <StatsBar challenges={data.challenges} total={data.total} />
      )}

      {/* Filters + Sort */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        <FilterPills
          options={DIFFICULTY_FILTER_OPTIONS}
          value={difficulty}
          onChange={(v) => resetAndSet(setDifficulty, v)}
        />
        <div className="sm:ml-auto">
          <SortDropdown
            options={CHALLENGE_SORT_OPTIONS}
            value={sort}
            onChange={(v) => resetAndSet(setSort, v)}
          />
        </div>
      </div>

      {isLoading ? (
        <ChallengeListSkeleton />
      ) : !data || data.challenges.length === 0 ? (
        <EmptyState filtered={difficulty !== "all" || sort !== "number_asc"} />
      ) : (
        <>
          <div className="bg-surface-card rounded-xl border border-border overflow-hidden">
            {data.challenges.map((c) => (
              <ChallengeRow key={c.id} challenge={c} />
            ))}
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}

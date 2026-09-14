"use client";

import Link from "next/link";
import { useState } from "react";
import Navbar from "@/components/landing/Navbar";
import {
  usePublicChallenges,
  useStudentChallenges,
  type PublicChallengeListItem,
  type StudentChallengeListItem,
  type Difficulty,
  type ChallengeSort,
} from "@/hooks/queries/challenges";
import { useProfile } from "@/hooks/queries/auth";
import {
  Badge,
  Logo,
  Pagination,
  FilterPills,
  SortDropdown,
} from "@/components/ui";
import {
  DIFFICULTY_CONFIG,
  DIFFICULTY_FILTER_OPTIONS,
  CHALLENGE_SORT_OPTIONS,
} from "@/lib/challenges";
import { cn } from "@/lib/utils";
import { ArrowRight, CheckCircle2, Code2, Lock } from "lucide-react";

// ─── Skeletons ────────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="bg-surface-card rounded-2xl border border-border p-6 animate-pulse flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="h-3 w-6 bg-fill-muted rounded" />
        <div className="h-5 w-14 bg-fill-muted rounded-full" />
      </div>
      <div className="h-5 w-3/4 bg-fill-muted rounded-md" />
      <div className="flex flex-col gap-1.5">
        <div className="h-3 bg-fill-muted rounded w-full" />
        <div className="h-3 bg-fill-muted rounded w-5/6" />
        <div className="h-3 bg-fill-muted rounded w-4/6" />
      </div>
      <div className="mt-auto pt-3 border-t border-border-subtle flex items-center justify-between">
        <div className="h-3 w-16 bg-fill-muted rounded" />
        <div className="h-3 w-20 bg-fill-muted rounded" />
      </div>
    </div>
  );
}

// ─── Challenge cards ──────────────────────────────────────────────────────────

function PublicChallengeCard({
  challenge,
}: {
  challenge: PublicChallengeListItem;
}) {
  const cfg = DIFFICULTY_CONFIG[challenge.difficulty];
  return (
    <Link
      href={`/challenges/${challenge.slug}`}
      className="group bg-surface-card rounded-2xl border border-border p-6 flex flex-col gap-4 hover:border-primary/40 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center justify-end">
        <Badge variant={cfg.variant} size="sm">
          {cfg.label}
        </Badge>
      </div>
      <h3 className="font-heading font-bold text-base text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
        <span className="text-primary-tint font-medium text-sm">
          {challenge.number}.
        </span>{" "}
        {challenge.title}
      </h3>
      <p className="font-body text-sm text-muted leading-relaxed line-clamp-3 flex-1">
        {challenge.descriptionExcerpt}
      </p>
      <div className="flex items-center justify-end pt-2 border-t border-border-subtle mt-auto">
        <span className="flex items-center gap-1 font-body text-xs font-medium text-primary group-hover:gap-2 transition-all">
          Solve <ArrowRight size={12} />
        </span>
      </div>
    </Link>
  );
}

function StudentChallengeCard({
  challenge,
}: {
  challenge: StudentChallengeListItem;
}) {
  const cfg = DIFFICULTY_CONFIG[challenge.difficulty];
  return (
    <Link
      href={`/learn/challenges/${challenge.slug}`}
      className="group bg-surface-card rounded-2xl border border-border p-6 flex flex-col gap-4 hover:border-primary/40 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center justify-end">
        <Badge variant={cfg.variant} size="sm">
          {cfg.label}
        </Badge>
      </div>
      <h3
        className={cn(
          "font-heading font-bold text-base leading-snug transition-colors line-clamp-2",
          challenge.completed
            ? "text-muted"
            : "text-foreground group-hover:text-primary",
        )}
      >
        <span className="text-primary-tint font-medium text-sm">
          {challenge.number}.
        </span>{" "}
        {challenge.title}
      </h3>
      <div className="flex-1" />
      <div className="flex items-center justify-between pt-2 border-t border-border-subtle mt-auto">
        {challenge.completed ? (
          <span className="flex items-center gap-1 font-body text-xs text-green-600 dark:text-white bg-green-50 dark:bg-green-600 px-2.5 py-1 rounded-full">
            <CheckCircle2 size={12} /> Solved
          </span>
        ) : (
          <span />
        )}
        <span className="flex items-center gap-1 font-body text-xs font-medium text-primary group-hover:gap-2 transition-all">
          {challenge.completed ? "Revisit" : "Solve"} <ArrowRight size={12} />
        </span>
      </div>
    </Link>
  );
}

// ─── Ghost card (blurred) ─────────────────────────────────────────────────────

const DIFFICULTY_GRADIENT: Record<Difficulty, [string, string]> = {
  easy: ["#059669", "#34D399"],
  medium: ["#B45309", "#FCD34D"],
  hard: ["#B91C1C", "#F87171"],
};

function GhostCard({ difficulty }: { difficulty: Difficulty }) {
  const [from, to] = DIFFICULTY_GRADIENT[difficulty];
  return (
    <div className="bg-surface-card rounded-2xl border border-border overflow-hidden flex flex-col select-none pointer-events-none">
      <div
        className="h-32 shrink-0 flex flex-col justify-end px-5 py-4 opacity-75"
        style={{
          background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
        }}
      >
        <div className="h-2.5 w-24 bg-surface-inverse/30 rounded mb-2" />
        <div className="h-2.5 w-16 bg-surface-inverse/20 rounded" />
      </div>
      <div className="p-5 flex flex-col gap-3">
        <div className="h-4 bg-surface-muted rounded-md w-3/4" />
        <div className="flex flex-col gap-1.5 flex-1">
          <div className="h-3 bg-surface-muted rounded w-full" />
          <div className="h-3 bg-surface-muted rounded w-5/6" />
        </div>
        <div className="pt-2 border-t border-border-subtle flex items-center justify-end mt-auto">
          <div className="h-3 w-14 bg-surface-muted rounded" />
        </div>
      </div>
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-surface-shell border-t border-border py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Logo className="h-12" linked />
        <p
          className="font-body text-xs text-muted-contrast"
          suppressHydrationWarning
        >
          © {new Date().getFullYear()} WithinTech Rwanda
        </p>
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="font-body text-xs text-muted hover:text-primary transition-colors"
          >
            Home
          </Link>
          <Link
            href="/courses"
            className="font-body text-xs text-muted hover:text-primary transition-colors"
          >
            Courses
          </Link>
        </div>
      </div>
    </footer>
  );
}

// ─── Ghost difficulties for blur gate ────────────────────────────────────────
const GHOST_DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard", "easy"];

// ─── Public (unauthenticated) list ────────────────────────────────────────────

function PublicList() {
  const { data: challenges, isLoading } = usePublicChallenges();

  const counts = challenges
    ? {
        easy: challenges.filter((c) => c.difficulty === "easy").length,
        medium: challenges.filter((c) => c.difficulty === "medium").length,
        hard: challenges.filter((c) => c.difficulty === "hard").length,
      }
    : { easy: 0, medium: 0, hard: 0 };

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Navbar />

      {/* Hero */}
      <section className="bg-surface-shell border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-14 lg:py-20">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div>
              <p className="font-heading text-xs tracking-widest uppercase text-primary font-bold mb-3">
                Challenges
              </p>
              <h1 className="font-heading font-black text-4xl lg:text-5xl text-foreground tracking-tight leading-tight mb-4">
                Sharpen your
                <br />
                coding skills.
              </h1>
              <p className="font-body text-base text-muted max-w-md leading-relaxed">
                Solve real programming problems in Python, Java, JavaScript, C,
                C++, or Go. Sign in to submit solutions and track your progress.
              </p>
            </div>

            {!isLoading && challenges && challenges.length > 0 && (
              <div className="flex items-center gap-3 shrink-0">
                {(["easy", "medium", "hard"] as Difficulty[]).map((d) => {
                  const cfg = DIFFICULTY_CONFIG[d];
                  return (
                    <div
                      key={d}
                      className="bg-surface-card border border-border rounded-xl px-4 py-3 flex flex-col items-center gap-1 min-w-[64px]"
                    >
                      <span className={cn("w-2 h-2 rounded-full", cfg.dot)} />
                      <span className="font-heading font-bold text-lg text-foreground leading-none">
                        {counts[d]}
                      </span>
                      <span className="font-body text-[11px] text-muted-contrast capitalize">
                        {cfg.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Cards + blur gate */}
      <section className="flex-1 max-w-7xl mx-auto w-full px-6 lg:px-12 py-10 lg:py-14">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : !challenges || challenges.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20">
            <div className="w-14 h-14 rounded-2xl bg-primary-soft flex items-center justify-center">
              <Code2 size={28} className="text-primary" />
            </div>
            <p className="font-heading font-bold text-base text-foreground">
              No challenges yet
            </p>
            <p className="font-body text-sm text-muted">
              Check back soon — challenges are coming!
            </p>
          </div>
        ) : (
          <>
            <p className="font-body text-sm text-muted-contrast mb-6">
              Showing {challenges.length} of many challenges.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {challenges.map((c) => (
                <PublicChallengeCard key={c.id} challenge={c} />
              ))}
            </div>

            {/* Blur gate */}
            <div className="relative mt-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 blur-sm pointer-events-none select-none">
                {GHOST_DIFFICULTIES.map((d, i) => (
                  <div
                    key={i}
                    className={cn(
                      i < 2 ? "" : "hidden",
                      i === 2 ? "sm:block" : "",
                      i === 3 ? "lg:block" : "",
                    )}
                  >
                    <GhostCard difficulty={d} />
                  </div>
                ))}
              </div>

              <div className="absolute inset-x-0 -top-24 bottom-0 bg-gradient-to-b from-transparent via-[#FAFAFA]/80 to-[#FAFAFA] dark:via-[#141414]/80 dark:to-[#141414]" />
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 gap-4">
                <div className="bg-surface-card border border-border rounded-2xl shadow-lg px-5 sm:px-8 py-6 flex flex-col items-center gap-3 text-center max-w-sm mx-4 w-full">
                  <div className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center">
                    <Lock size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-heading font-bold text-base text-foreground">
                      More challenges coming soon
                    </p>
                    <p className="font-body text-sm text-muted mt-0.5">
                      Submitting solutions and tracking progress are
                      currently unavailable. Check back soon.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </section>

      <Footer />
    </div>
  );
}

// ─── Authenticated list ───────────────────────────────────────────────────────

function AuthedList() {
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
    <div className="min-h-screen flex flex-col bg-surface">
      <Navbar />

      {/* Hero */}
      <section className="bg-surface-shell border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-14 lg:py-20">
          <p className="font-heading text-xs tracking-widest uppercase text-primary font-bold mb-3">
            Challenges
          </p>
          <h1 className="font-heading font-black text-4xl lg:text-5xl text-foreground tracking-tight leading-tight mb-4">
            Sharpen your
            <br />
            coding skills.
          </h1>
          <p className="font-body text-base text-muted max-w-md leading-relaxed">
            Solve real programming problems in Python, Java, JavaScript, C, C++,
            or Go.
          </p>
        </div>
      </section>

      {/* Cards */}
      <section className="flex-1 max-w-7xl mx-auto w-full px-6 lg:px-12 py-10 lg:py-14">
        {/* Filters + Sort */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : !data || data.challenges.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20">
            <div className="w-14 h-14 rounded-2xl bg-primary-soft flex items-center justify-center">
              <Code2 size={28} className="text-primary" />
            </div>
            <p className="font-heading font-bold text-base text-foreground">
              No challenges match
            </p>
            <p className="font-body text-sm text-muted">
              Try a different filter.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {data.challenges.map((c) => (
                <StudentChallengeCard key={c.id} challenge={c} />
              ))}
            </div>
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </section>

      <Footer />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PublicChallengesPage() {
  const { data: user } = useProfile();
  return user ? <AuthedList /> : <PublicList />;
}

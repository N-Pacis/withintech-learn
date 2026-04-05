'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CheckCircle2, Circle, Code2, Trophy, Zap } from 'lucide-react';
import { useStudentChallenges, type Difficulty, type StudentChallengeListItem } from '@/hooks/queries/challenges';
import { Badge } from '@/components/ui';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

const DIFFICULTY_BADGE: Record<Difficulty, { variant: 'success' | 'warning' | 'danger'; label: string; color: string }> = {
  easy:   { variant: 'success', label: 'Easy',   color: 'text-green-600'  },
  medium: { variant: 'warning', label: 'Medium', color: 'text-amber-600'  },
  hard:   { variant: 'danger',  label: 'Hard',   color: 'text-red-600'    },
};

const DIFFICULTY_FILTERS: { value: Difficulty | 'all'; label: string }[] = [
  { value: 'all',    label: 'All'    },
  { value: 'easy',   label: 'Easy'   },
  { value: 'medium', label: 'Medium' },
  { value: 'hard',   label: 'Hard'   },
];

// ─── Skeleton loader ──────────────────────────────────────────────────────────

function ChallengeListSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-5 py-4 border-b border-[#F3F4F6] last:border-0 animate-pulse"
        >
          <div className="w-5 h-5 rounded-full bg-[#E5E7EB] shrink-0" />
          <div className="flex-1 h-4 bg-[#E5E7EB] rounded-md" style={{ width: `${50 + (i % 3) * 15}%` }} />
          <div className="w-14 h-5 bg-[#E5E7EB] rounded-full shrink-0" />
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
  const completed = challenges.filter(c => c.completed).length;
  const easy      = challenges.filter(c => c.difficulty === 'easy').length;
  const medium    = challenges.filter(c => c.difficulty === 'medium').length;
  const hard      = challenges.filter(c => c.difficulty === 'hard').length;
  const pct       = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      <div className="bg-white rounded-xl border border-[#E5E7EB] px-4 py-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#F3E8FF] flex items-center justify-center shrink-0">
          <Trophy size={16} className="text-[#3D006B]" />
        </div>
        <div>
          <div className="font-heading font-bold text-lg text-[#0F0F0F] leading-none">{completed}<span className="font-body font-normal text-xs text-[#9CA3AF] ml-1">/ {total}</span></div>
          <div className="font-body text-xs text-[#6B7280]">Solved</div>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-[#E5E7EB] px-4 py-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
          <Zap size={16} className="text-green-600" />
        </div>
        <div>
          <div className="font-heading font-bold text-lg text-[#0F0F0F] leading-none">{pct}<span className="font-body font-normal text-xs text-[#9CA3AF]">%</span></div>
          <div className="font-body text-xs text-[#6B7280]">Completion</div>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-[#E5E7EB] px-4 py-3">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
          <span className="font-body text-xs text-[#6B7280]">Easy</span>
          <span className="font-heading font-bold text-sm text-[#0F0F0F] ml-auto">{easy}</span>
        </div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
          <span className="font-body text-xs text-[#6B7280]">Medium</span>
          <span className="font-heading font-bold text-sm text-[#0F0F0F] ml-auto">{medium}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
          <span className="font-body text-xs text-[#6B7280]">Hard</span>
          <span className="font-heading font-bold text-sm text-[#0F0F0F] ml-auto">{hard}</span>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-[#E5E7EB] px-4 py-3 flex flex-col justify-center gap-1.5">
        <div className="flex justify-between font-body text-xs text-[#6B7280]">
          <span>Progress</span><span>{pct}%</span>
        </div>
        <div className="h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#3D006B] rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Challenge row ────────────────────────────────────────────────────────────

function ChallengeRow({ challenge, index }: { challenge: StudentChallengeListItem; index: number }) {
  const badge = DIFFICULTY_BADGE[challenge.difficulty];

  return (
    <Link
      href={`/learn/challenges/${challenge.slug}`}
      className={cn(
        'group flex items-center gap-4 px-5 py-4 border-b border-[#F3F4F6] last:border-0',
        'hover:bg-[#F9F5FF] transition-colors',
      )}
    >
      {/* Row index + completion */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="font-mono text-xs text-[#D1D5DB] w-5 text-right hidden sm:block">{index + 1}</span>
        {challenge.completed
          ? <CheckCircle2 size={18} className="text-green-500 shrink-0" />
          : <Circle size={18} className="text-[#D1D5DB] group-hover:text-[#C4B5FD] shrink-0 transition-colors" />}
      </div>

      {/* Title */}
      <span className={cn(
        'flex-1 font-body text-sm font-medium truncate transition-colors',
        challenge.completed ? 'text-[#6B7280] line-through decoration-[#D1D5DB]' : 'text-[#0F0F0F] group-hover:text-[#3D006B]',
      )}>
        {challenge.title}
      </span>

      {/* Difficulty */}
      <Badge variant={badge.variant} size="sm" className="shrink-0">{badge.label}</Badge>

    </Link>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] py-20 flex flex-col items-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-[#F3E8FF] flex items-center justify-center">
        <Code2 size={28} className="text-[#3D006B]" />
      </div>
      <div className="text-center">
        <p className="font-heading font-bold text-base text-[#0F0F0F]">
          {filtered ? 'No challenges match' : 'No challenges yet'}
        </p>
        <p className="font-body text-sm text-[#6B7280] mt-1">
          {filtered ? 'Try a different difficulty filter.' : 'Check back soon — challenges are coming!'}
        </p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ChallengesPage() {
  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>('all');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useStudentChallenges({
    page,
    limit: 20,
    difficulty: difficulty === 'all' ? undefined : difficulty,
  });

  const totalPages = data ? Math.ceil(data.total / 20) : 1;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading font-black text-3xl text-[#0F0F0F]">Challenges</h1>
        <p className="font-body text-sm text-[#6B7280] mt-1">
          Solve problems in Python, Java, JavaScript, C, C++, or Go.
        </p>
      </div>

      {/* Stats */}
      {!isLoading && data && (
        <StatsBar challenges={data.challenges} total={data.total} />
      )}

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4">
        {DIFFICULTY_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => { setDifficulty(f.value); setPage(1); }}
            className={cn(
              'font-body text-sm px-4 py-1.5 rounded-full border transition-all',
              difficulty === f.value
                ? 'bg-[#3D006B] text-white border-[#3D006B]'
                : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#3D006B]/40 hover:text-[#3D006B]',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <ChallengeListSkeleton />
      ) : !data || data.challenges.length === 0 ? (
        <EmptyState filtered={difficulty !== 'all'} />
      ) : (
        <>
          <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
            {data.challenges.map((c, i) => (
              <ChallengeRow key={c.id} challenge={c} index={(page - 1) * 20 + i} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-6">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 rounded-lg font-body text-sm bg-white border border-[#E5E7EB] text-[#6B7280] disabled:opacity-40 hover:border-[#3D006B]/40 hover:text-[#3D006B] transition-colors"
              >
                Previous
              </button>
              <span className="font-body text-sm text-[#6B7280]">
                {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 rounded-lg font-body text-sm bg-white border border-[#E5E7EB] text-[#6B7280] disabled:opacity-40 hover:border-[#3D006B]/40 hover:text-[#3D006B] transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

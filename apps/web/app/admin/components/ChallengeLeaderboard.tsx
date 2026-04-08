'use client';

import { Trophy, Medal, Award } from 'lucide-react';
import { DayRangePicker } from '@/components/ui';
import type { ChallengeLeaderboardEntry } from '@/hooks/queries/analytics';

// ─── Medal icons ──────────────────────────────────────────────────────────────

const RANK_ICON = [
  <Trophy key={0} size={16} className="text-[#CA8A04]" />,   // gold
  <Medal  key={1} size={16} className="text-[#6B7280]" />,   // silver
  <Award  key={2} size={16} className="text-[#B45309]" />,   // bronze
];

const RANK_BG = [
  'bg-[#FEF9C3] border-[#FCD34D]',  // gold
  'bg-[#F3F4F6] border-[#D1D5DB]',  // silver
  'bg-[#FEF3E2] border-[#FDBA74]',  // bronze
];

// ─── Pass-rate badge ──────────────────────────────────────────────────────────

function PassBadge({ rate }: { rate: number }) {
  const colour =
    rate >= 75 ? 'bg-green-100 text-green-700' :
    rate >= 40 ? 'bg-yellow-100 text-yellow-700' :
                 'bg-red-100 text-red-600';
  return (
    <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${colour}`}>
      {rate}% pass
    </span>
  );
}

// ─── Initials avatar ──────────────────────────────────────────────────────────

function Avatar({ firstName, lastName, rank }: { firstName: string; lastName: string; rank: number }) {
  const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();
  const bg = rank === 0 ? 'bg-[#3D006B]' : rank === 1 ? 'bg-[#6B21A8]' : 'bg-[#9333EA]';
  return (
    <div className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center shrink-0`}>
      <span className="font-heading font-bold text-sm text-white">{initials}</span>
    </div>
  );
}

// ─── Row ──────────────────────────────────────────────────────────────────────

function LeaderboardRow({ entry, rank }: { entry: ChallengeLeaderboardEntry; rank: number }) {
  const isTop3 = rank < 3;

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${isTop3 ? RANK_BG[rank] : 'bg-[#F9FAFB] border-transparent'}`}>
      {/* Rank */}
      <div className="w-7 flex items-center justify-center shrink-0">
        {isTop3
          ? RANK_ICON[rank]
          : <span className="font-heading font-bold text-sm text-[#9CA3AF]">#{rank + 1}</span>
        }
      </div>

      {/* Avatar */}
      <Avatar firstName={entry.firstName} lastName={entry.lastName} rank={rank} />

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className="font-heading font-bold text-sm text-[#0F0F0F] truncate">
          {entry.firstName} {entry.lastName}
        </p>
        <PassBadge rate={entry.avgPassRate} />
      </div>

      {/* Problems solved */}
      <div className="shrink-0 text-right">
        <p className="font-heading font-black text-xl text-[#3D006B] leading-none">{entry.problemsSolved}</p>
        <p className="font-body text-[10px] text-[#9CA3AF] mt-0.5">solved</p>
      </div>
    </div>
  );
}

// ─── Empty ────────────────────────────────────────────────────────────────────

function Empty() {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-2">
      <p className="font-body text-sm text-[#9CA3AF]">No challenge completions this week.</p>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-[60px] rounded-xl bg-[#F3F4F6] animate-pulse" />
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  entries:   ChallengeLeaderboardEntry[] | undefined;
  isLoading: boolean;
  from:      string;
  to:        string;
  onChange:  (from: string, to: string) => void;
}

export function ChallengeLeaderboard({ entries, isLoading, from, to, onChange }: Props) {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] px-6 py-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="font-heading font-bold text-sm text-[#0F0F0F]">Challenge Leaderboard</p>
          <p className="font-body text-xs text-[#9CA3AF] mt-0.5">Top 5 solvers — ranked by unique challenges completed</p>
        </div>
        <div className="shrink-0">
          <DayRangePicker from={from} to={to} onChange={onChange} />
        </div>
      </div>

      {/* Body */}
      {isLoading ? (
        <Skeleton />
      ) : !entries || entries.length === 0 ? (
        <Empty />
      ) : (
        <div className="flex flex-col gap-2">
          {entries.map((entry, i) => (
            <LeaderboardRow key={entry.userId} entry={entry} rank={i} />
          ))}
        </div>
      )}
    </div>
  );
}

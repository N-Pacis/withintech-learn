'use client';

import { DayRangePicker } from '@/components/ui';
import type { ChallengeLeaderboardEntry } from '@/hooks/queries/analytics';

function Skeleton() {
  return (
    <div className="flex flex-col gap-2 animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#F9FAFB]">
          <div className="w-4 h-4 bg-[#E5E7EB] rounded" />
          <div className="w-8 h-8 bg-[#E5E7EB] rounded-full" />
          <div className="h-4 bg-[#E5E7EB] rounded flex-1" />
          <div className="w-6 h-4 bg-[#E5E7EB] rounded" />
        </div>
      ))}
    </div>
  );
}

function Empty() {
  return (
    <div className="flex items-center justify-center py-10">
      <p className="font-body text-sm text-[#9CA3AF]">No challenge completions in this period.</p>
    </div>
  );
}

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
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="font-heading font-bold text-sm text-[#0F0F0F]">Challenge Leaderboard</p>
          <p className="font-body text-xs text-[#9CA3AF] mt-0.5">Top solvers — distinct challenges passed in period</p>
        </div>
        <DayRangePicker from={from} to={to} onChange={onChange} />
      </div>

      {isLoading ? (
        <Skeleton />
      ) : !entries || entries.length === 0 ? (
        <Empty />
      ) : (
        <div className="flex flex-col gap-1.5">
          {entries.map((entry, i) => {
            const initials = `${entry.firstName[0] ?? ''}${entry.lastName[0] ?? ''}`.toUpperCase();
            return (
              <div key={entry.userId} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#F9FAFB]">
                <span className="font-body text-sm text-[#9CA3AF] w-4 shrink-0">{i + 1}</span>
                <div className="w-8 h-8 rounded-full bg-[#F3E8FF] flex items-center justify-center shrink-0">
                  <span className="font-heading font-bold text-xs text-[#3D006B]">{initials}</span>
                </div>
                <span className="font-body text-sm text-[#0F0F0F] font-medium flex-1 truncate">
                  {entry.firstName} {entry.lastName}
                </span>
                <span className="font-heading font-bold text-sm text-[#3D006B] shrink-0">
                  {entry.problemsSolved}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

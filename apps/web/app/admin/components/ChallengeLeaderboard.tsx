'use client';

import { DayRangePicker } from '@/components/ui';
import type { ChallengeLeaderboardEntry } from '@/hooks/queries/analytics';

function Skeleton() {
  return (
    <div className="flex flex-col gap-2 animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#F9FAFB] dark:bg-[#252525]">
          <div className="w-4 h-4 bg-[#E5E7EB] dark:bg-[#333] rounded" />
          <div className="w-8 h-8 bg-[#E5E7EB] dark:bg-[#333] rounded-full" />
          <div className="h-4 bg-[#E5E7EB] dark:bg-[#333] rounded flex-1" />
          <div className="w-6 h-4 bg-[#E5E7EB] dark:bg-[#333] rounded" />
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
    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-[#E5E7EB] dark:border-[#2d2d2d] px-6 py-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="font-heading font-bold text-sm text-[#0F0F0F] dark:text-[#F9FAFB]">Challenge Leaderboard</p>
          <p className="font-body text-xs text-[#9CA3AF] dark:text-[#6B7280] mt-0.5">Top solvers — distinct challenges passed in period</p>
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
              <div key={entry.userId} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#F9FAFB] dark:bg-[#252525]">
                <span className="font-body text-sm text-[#9CA3AF] dark:text-[#6B7280] w-4 shrink-0">{i + 1}</span>
                <div className="w-8 h-8 rounded-full bg-[#F3E8FF] dark:bg-[#2d1a4a] flex items-center justify-center shrink-0">
                  <span className="font-heading font-bold text-xs text-[#3D006B] dark:text-[#C084FC]">{initials}</span>
                </div>
                <span className="font-body text-sm text-[#0F0F0F] dark:text-[#F9FAFB] font-medium flex-1 truncate">
                  {entry.firstName} {entry.lastName}
                </span>
                <span className="font-heading font-bold text-sm text-[#3D006B] dark:text-[#C084FC] shrink-0">
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

'use client';

import { Trophy, Medal, Award } from 'lucide-react';
import { Card, CardHeader, CardBody, Badge, DayRangePicker } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { ChallengeLeaderboardEntry } from '@/hooks/queries/analytics';

// ─── Rank config ──────────────────────────────────────────────────────────────

const RANK = [
  { icon: Trophy, iconClass: 'text-[#CA8A04]', rowClass: 'bg-[#FEFCE8]' },
  { icon: Medal,  iconClass: 'text-[#9CA3AF]', rowClass: 'bg-[#F9FAFB]' },
  { icon: Award,  iconClass: 'text-[#B45309]', rowClass: 'bg-[#FFFBEB]' },
];

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ firstName, lastName, rank }: { firstName: string; lastName: string; rank: number }) {
  const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();
  const bg = rank === 0 ? 'bg-[#3D006B]' : rank === 1 ? 'bg-[#6B21A8]' : rank === 2 ? 'bg-[#9333EA]' : 'bg-[#E9D5FF]';
  const text = rank >= 3 ? 'text-[#6B21A8]' : 'text-white';
  return (
    <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0', bg)}>
      <span className={cn('font-heading font-bold text-xs', text)}>{initials}</span>
    </div>
  );
}

// ─── Row ──────────────────────────────────────────────────────────────────────

function LeaderboardRow({ entry, rank }: { entry: ChallengeLeaderboardEntry; rank: number }) {
  const config = RANK[rank];

  return (
    <div className={cn(
      'flex items-center gap-3 px-4 py-3 rounded-lg',
      config ? config.rowClass : 'bg-[#F9FAFB]',
    )}>
      {/* Rank indicator */}
      <div className="w-6 flex items-center justify-center shrink-0">
        {config
          ? <config.icon size={15} className={config.iconClass} />
          : <span className="font-body text-xs text-[#9CA3AF]">{rank + 1}</span>
        }
      </div>

      <Avatar firstName={entry.firstName} lastName={entry.lastName} rank={rank} />

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className="font-heading font-semibold text-sm text-[#0F0F0F] truncate">
          {entry.firstName} {entry.lastName}
        </p>
      </div>

      {/* Problems solved */}
      <Badge variant="purple" size="md">
        {entry.problemsSolved} solved
      </Badge>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-[52px] rounded-lg bg-[#F3F4F6] animate-pulse" />
      ))}
    </div>
  );
}

// ─── Empty ────────────────────────────────────────────────────────────────────

function Empty() {
  return (
    <div className="flex items-center justify-center py-10">
      <p className="font-body text-sm text-[#9CA3AF]">No challenge completions in this period.</p>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

interface Props {
  entries:   ChallengeLeaderboardEntry[] | undefined;
  isLoading: boolean;
  from:      string;
  to:        string;
  onChange:  (from: string, to: string) => void;
}

export function ChallengeLeaderboard({ entries, isLoading, from, to, onChange }: Props) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-heading font-bold text-sm text-[#0F0F0F]">Challenge Leaderboard</p>
            <p className="font-body text-xs text-[#9CA3AF] mt-0.5">Top solvers by unique challenges completed in period</p>
          </div>
          <DayRangePicker from={from} to={to} onChange={onChange} />
        </div>
      </CardHeader>
      <CardBody>
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
      </CardBody>
    </Card>
  );
}

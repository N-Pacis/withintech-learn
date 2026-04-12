'use client';

import Link from 'next/link';
import { ArrowRight, Code2, ChevronRight } from 'lucide-react';
import { usePublicChallenges, type PublicChallengeListItem, type Difficulty } from '@/hooks/queries/challenges';
import { Badge, Button } from '@/components/ui';
import { cn } from '@/lib/utils';

// ─── Difficulty config ────────────────────────────────────────────────────────

const DIFF: Record<Difficulty, {
  variant: 'success' | 'warning' | 'danger';
  label: string;
  accent: string;
}> = {
  easy:   { variant: 'success', label: 'Easy',   accent: 'border-l-green-400'  },
  medium: { variant: 'warning', label: 'Medium', accent: 'border-l-amber-400'  },
  hard:   { variant: 'danger',  label: 'Hard',   accent: 'border-l-red-400'    },
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] border-l-4 border-l-[#E5E7EB] p-5 animate-pulse flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="h-3 w-5 bg-[#E5E7EB] rounded" />
        <div className="h-5 w-14 bg-[#E5E7EB] rounded-full" />
      </div>
      <div className="h-5 w-3/4 bg-[#E5E7EB] rounded-md" />
      <div className="flex flex-col gap-1.5">
        <div className="h-3 bg-[#E5E7EB] rounded w-full" />
        <div className="h-3 bg-[#E5E7EB] rounded w-4/5" />
      </div>
    </div>
  );
}

// ─── Challenge card ───────────────────────────────────────────────────────────

function ChallengeCard({ challenge }: { challenge: PublicChallengeListItem }) {
  const cfg = DIFF[challenge.difficulty];
  return (
    <Link
      href={`/challenges/${challenge.slug}`}
      className={cn(
        'group bg-white rounded-2xl border border-[#E5E7EB] border-l-4 p-5 flex flex-col gap-3',
        'hover:shadow-md transition-all duration-200',
        cfg.accent,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-[#D1D5DB]">#{challenge.number}</span>
        <Badge variant={cfg.variant} size="sm">{cfg.label}</Badge>
      </div>
      <h3 className="font-heading font-bold text-sm text-[#0F0F0F] leading-snug group-hover:text-[#3D006B] transition-colors line-clamp-2">
        {challenge.title}
      </h3>
      <p className="font-body text-xs text-[#6B7280] leading-relaxed line-clamp-2 flex-1">
        {challenge.descriptionExcerpt}
      </p>
      <div className="flex items-center justify-between pt-1">
        <span className="font-body text-[11px] text-[#9CA3AF]">
          {challenge.testCount} test{challenge.testCount !== 1 ? 's' : ''}
        </span>
        <span className="flex items-center gap-0.5 font-body text-[11px] font-medium text-[#3D006B] group-hover:gap-1.5 transition-all">
          Solve <ChevronRight size={11} />
        </span>
      </div>
    </Link>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

export default function ChallengesSection() {
  const { data: challenges, isLoading } = usePublicChallenges();

  if (!isLoading && (!challenges || challenges.length === 0)) return null;

  const displayed = challenges?.slice(0, 3) ?? [];

  return (
    <section id="challenges" className="bg-[#FAFAFA] border-y border-[#E5E7EB] py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="font-heading text-xs tracking-widest uppercase text-[#3D006B] font-bold mb-3">
              Challenges
            </p>
            <h2 className="font-heading font-black text-3xl lg:text-4xl text-[#0F0F0F] tracking-tight">
              Test your skills.
            </h2>
            <p className="font-body text-base text-[#6B7280] mt-3 max-w-md">
              Real programming problems. Multiple languages. Track your progress over time.
            </p>
          </div>
          <Link
            href="/challenges"
            className="hidden md:inline-flex items-center gap-1.5 font-body text-sm font-medium text-[#3D006B] hover:gap-3 transition-all"
          >
            View all challenges <ArrowRight size={14} />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayed.map(c => <ChallengeCard key={c.id} challenge={c} />)}
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Button asChild variant="primary">
            <Link href="/sign-in">
              <Code2 size={15} />
              Start solving
            </Link>
          </Button>
          <Link
            href="/challenges"
            className="inline-flex items-center gap-1.5 font-body text-sm text-[#6B7280] hover:text-[#3D006B] transition-colors"
          >
            View all challenges <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </section>
  );
}

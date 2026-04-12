'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';
import { usePublicChallenge, type FunctionParam, type StarterCode, type ChallengeLanguage } from '@/hooks/queries/challenges';
import { Badge, Button } from '@/components/ui';
import { ProblemPanel } from '@/app/learn/challenges/[slug]/components/ProblemPanel';
import { ChallengeEditor } from '@/components/ui/ChallengeEditor';
import { cn } from '@/lib/utils';
import { CHALLENGE_LANGUAGES, normalizeVisibleChallengeCode } from '@/lib/challenges';

// ─── Difficulty badge map ─────────────────────────────────────────────────────

const DIFFICULTY_BADGE = {
  easy:   { variant: 'success'  as const, label: 'Easy'   },
  medium: { variant: 'warning'  as const, label: 'Medium' },
  hard:   { variant: 'danger'   as const, label: 'Hard'   },
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function WorkspaceSkeleton() {
  return (
    <div className="flex h-[100dvh] animate-pulse flex-col">
      <div className="h-[52px] bg-white border-b border-[#E5E7EB] shrink-0" />
      {/* Desktop skeleton */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        <div className="w-[42%] border-r border-[#E5E7EB] p-5 flex flex-col gap-4 bg-white">
          <div className="h-6 w-2/3 bg-[#E5E7EB] rounded-md" />
          {[100, 80, 90, 60, 70, 85].map((w, i) => (
            <div key={i} className="h-3.5 bg-[#E5E7EB] rounded" style={{ width: `${w}%` }} />
          ))}
          <div className="h-28 bg-[#E5E7EB] rounded-lg mt-2" />
        </div>
        <div className="flex-1 flex flex-col">
          <div className="h-10 bg-[#2d2d2d] border-b border-[#3a3a3a]" />
          <div className="flex-1 bg-[#1e1e1e]" />
        </div>
      </div>
      {/* Mobile skeleton */}
      <div className="md:hidden flex-1 p-5 flex flex-col gap-4 bg-white">
        <div className="h-6 w-2/3 bg-[#E5E7EB] rounded-md" />
        {[100, 80, 90, 60, 70].map((w, i) => (
          <div key={i} className="h-3.5 bg-[#E5E7EB] rounded" style={{ width: `${w}%` }} />
        ))}
        <div className="h-32 bg-[#E5E7EB] rounded-lg mt-2" />
        <div className="mt-auto h-11 bg-[#E5E7EB] rounded-lg" />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PublicChallengePage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: challenge, isLoading } = usePublicChallenge(slug);

  // Pick Python starter code for display (read-only preview, desktop only)
  const previewCode = useMemo(() => {
    if (!challenge) return '';
    const starter = challenge.starterCode as StarterCode;
    return normalizeVisibleChallengeCode('python', starter.python);
  }, [challenge]);

  const signInHref = `/sign-in?next=/challenges/${slug}`;

  if (isLoading) return <WorkspaceSkeleton />;

  if (!challenge) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-6">
        <p className="font-body text-sm text-[#6B7280]">Challenge not found.</p>
        <Button asChild variant="secondary" size="sm">
          <Link href="/challenges">Back to Challenges</Link>
        </Button>
      </div>
    );
  }

  const badge = DIFFICULTY_BADGE[challenge.difficulty];

  return (
    // h-[100dvh] on desktop (accounts for mobile browser chrome); mobile scrolls naturally
    <div className="flex flex-col h-[100dvh]">

      {/* ── Top bar ───────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E5E7EB] bg-white shrink-0">
        <Link
          href="/challenges"
          className="text-[#9CA3AF] hover:text-[#3D006B] transition-colors shrink-0"
          title="Back to challenges"
        >
          <ArrowLeft size={18} />
        </Link>

        <span className="font-heading font-semibold text-sm text-[#0F0F0F] flex-1 truncate">
          {challenge.title}
        </span>

        <Badge variant={badge.variant} size="sm" className="shrink-0 hidden sm:inline-flex">
          {badge.label}
        </Badge>

        {/* Desktop CTA */}
        <Button asChild variant="primary" size="sm" className="shrink-0 hidden md:inline-flex">
          <Link href={signInHref}>
            <Lock size={13} className="mr-1" />
            Sign in to solve
          </Link>
        </Button>
      </div>

      {/* ── Desktop: split layout ─────────────────────────────────────────── */}
      <div className="hidden md:flex flex-1 overflow-hidden min-h-0">

        {/* Left: Problem panel */}
        <div className="flex flex-col w-[42%] min-w-[300px] border-r border-[#E5E7EB] bg-white overflow-y-auto">
          <ProblemPanel
            title={challenge.title}
            description={challenge.description}
            difficulty={challenge.difficulty}
            visibleTestCases={challenge.visibleTestCases}
            functionParams={challenge.functionParams}
          />
        </div>

        {/* Right: locked editor */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0 relative">
          {/* Language selector bar (cosmetic) */}
          <div className="flex items-center gap-1 px-3 py-2 bg-[#1e1e1e] border-b border-[#3a3a3a] shrink-0 overflow-x-auto">
            {CHALLENGE_LANGUAGES.map((l) => (
              <span
                key={l.value}
                className={cn(
                  'px-3 py-1 rounded font-mono text-xs font-medium whitespace-nowrap',
                  l.value === 'python' ? 'bg-[#3D006B] text-white' : 'text-[#9CA3AF]',
                )}
              >
                {l.label}
              </span>
            ))}
          </div>

          {/* Read-only editor preview */}
          <div className="flex-1 overflow-hidden min-h-0 pointer-events-none select-none">
            <ChallengeEditor
              value={previewCode}
              language={'python' as ChallengeLanguage}
              onValueChange={() => {}}
              readOnly
            />
          </div>

          {/* Lock overlay */}
          <div className="absolute inset-0 top-[40px] flex flex-col items-center justify-center bg-[#1e1e1e]/80 backdrop-blur-[2px] z-10 px-6">
            <div className="bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] px-8 py-8 flex flex-col items-center gap-4 max-w-xs w-full text-center">
              <div className="w-12 h-12 rounded-xl bg-[#F3E8FF] flex items-center justify-center">
                <Lock size={22} className="text-[#3D006B]" />
              </div>
              <div>
                <p className="font-heading font-bold text-base text-[#0F0F0F] mb-1">
                  Sign in to start coding
                </p>
                <p className="font-body text-sm text-[#6B7280]">
                  Create a free account to submit solutions and track your progress.
                </p>
              </div>
              <Button asChild variant="primary" fullWidth>
                <Link href={signInHref}>Sign In / Sign Up</Link>
              </Button>
              <Link
                href="/challenges"
                className="font-body text-xs text-[#9CA3AF] hover:text-[#3D006B] transition-colors"
              >
                ← Back to all challenges
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile: full problem view + sticky CTA ────────────────────────── */}
      <div className="md:hidden flex flex-col flex-1 overflow-hidden min-h-0 bg-white">
        {/* Scrollable problem content */}
        <div className="flex-1 overflow-y-auto">
          <ProblemPanel
            title={challenge.title}
            description={challenge.description}
            difficulty={challenge.difficulty}
            visibleTestCases={challenge.visibleTestCases}
            functionParams={challenge.functionParams}
          />
        </div>

        {/* Sticky sign-in CTA */}
        <div className="shrink-0 border-t border-[#E5E7EB] bg-white px-4 py-4 flex flex-col gap-2">
          <Button asChild variant="primary" fullWidth>
            <Link href={signInHref}>
              <Lock size={14} />
              Sign In to Start Coding
            </Link>
          </Button>
          <Button asChild variant="secondary" size="sm" fullWidth>
            <Link href="/sign-up">Create Free Account</Link>
          </Button>
        </div>
      </div>

    </div>
  );
}

'use client';

import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import { usePublicChallenges, type PublicChallengeListItem, type Difficulty } from '@/hooks/queries/challenges';
import { Badge, Button, Logo } from '@/components/ui';
import { cn } from '@/lib/utils';
import { ArrowRight, Code2, Lock, Zap } from 'lucide-react';

// ─── Difficulty config ────────────────────────────────────────────────────────

const DIFF: Record<Difficulty, { variant: 'success' | 'warning' | 'danger'; label: string; dot: string }> = {
  easy:   { variant: 'success', label: 'Easy',   dot: 'bg-green-400'  },
  medium: { variant: 'warning', label: 'Medium', dot: 'bg-amber-400'  },
  hard:   { variant: 'danger',  label: 'Hard',   dot: 'bg-red-400'    },
};

// ─── Skeletons ────────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 animate-pulse flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="h-3 w-6 bg-[#E5E7EB] rounded" />
        <div className="h-5 w-14 bg-[#E5E7EB] rounded-full" />
      </div>
      <div className="h-5 w-3/4 bg-[#E5E7EB] rounded-md" />
      <div className="flex flex-col gap-1.5">
        <div className="h-3 bg-[#E5E7EB] rounded w-full" />
        <div className="h-3 bg-[#E5E7EB] rounded w-5/6" />
        <div className="h-3 bg-[#E5E7EB] rounded w-4/6" />
      </div>
      <div className="mt-auto pt-3 border-t border-[#F3F4F6] flex items-center justify-between">
        <div className="h-3 w-16 bg-[#E5E7EB] rounded" />
        <div className="h-3 w-20 bg-[#E5E7EB] rounded" />
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
      className="group bg-white rounded-2xl border border-[#E5E7EB] p-6 flex flex-col gap-4 hover:border-[#3D006B]/40 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-[#D1D5DB] font-medium">#{challenge.number}</span>
        <Badge variant={cfg.variant} size="sm">{cfg.label}</Badge>
      </div>
      <h3 className="font-heading font-bold text-base text-[#0F0F0F] leading-snug group-hover:text-[#3D006B] transition-colors line-clamp-2">
        {challenge.title}
      </h3>
      <p className="font-body text-sm text-[#6B7280] leading-relaxed line-clamp-3 flex-1">
        {challenge.descriptionExcerpt}
      </p>
      <div className="flex items-center justify-between pt-2 border-t border-[#F3F4F6] mt-auto">
        <span className="font-body text-xs text-[#9CA3AF]">
          {challenge.testCount} test{challenge.testCount !== 1 ? 's' : ''}
        </span>
        <span className="flex items-center gap-1 font-body text-xs font-medium text-[#3D006B] group-hover:gap-2 transition-all">
          Solve <ArrowRight size={12} />
        </span>
      </div>
    </Link>
  );
}

// ─── Ghost card (blurred) ─────────────────────────────────────────────────────

function GhostCard({ difficulty }: { difficulty: Difficulty }) {
  const cfg = DIFF[difficulty];
  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 flex flex-col gap-4 select-none pointer-events-none">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-[#D1D5DB]">#??</span>
        <Badge variant={cfg.variant} size="sm">{cfg.label}</Badge>
      </div>
      <div className="h-5 bg-[#F3F4F6] rounded-md w-3/4" />
      <div className="flex flex-col gap-1.5 flex-1">
        <div className="h-3 bg-[#F3F4F6] rounded w-full" />
        <div className="h-3 bg-[#F3F4F6] rounded w-5/6" />
        <div className="h-3 bg-[#F3F4F6] rounded w-4/6" />
      </div>
      <div className="pt-2 border-t border-[#F3F4F6] flex items-center justify-between mt-auto">
        <div className="h-3 w-16 bg-[#F3F4F6] rounded" />
        <div className="h-3 w-20 bg-[#F3F4F6] rounded" />
      </div>
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-white border-t border-[#E5E7EB] py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Logo className="h-12" linked />
        <p className="font-body text-xs text-[#9CA3AF]" suppressHydrationWarning>
          © {new Date().getFullYear()} WithinTech Rwanda
        </p>
        <div className="flex items-center gap-4">
          <Link href="/" className="font-body text-xs text-[#6B7280] hover:text-[#3D006B] transition-colors">Home</Link>
          <Link href="/courses" className="font-body text-xs text-[#6B7280] hover:text-[#3D006B] transition-colors">Courses</Link>
          <Link href="/sign-in" className="font-body text-xs text-[#6B7280] hover:text-[#3D006B] transition-colors">Sign In</Link>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

// Show fewer ghost cards on mobile so the blur-gate CTA stays in view without heavy scrolling.
// 2 on mobile (1 col = 2 rows), 3 on sm (2 col), 4 on lg+ (3–4 col).
const GHOST_DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'easy'];

export default function PublicChallengesPage() {
  const { data: challenges, isLoading } = usePublicChallenges();

  const counts = challenges
    ? {
        easy:   challenges.filter(c => c.difficulty === 'easy').length,
        medium: challenges.filter(c => c.difficulty === 'medium').length,
        hard:   challenges.filter(c => c.difficulty === 'hard').length,
      }
    : { easy: 0, medium: 0, hard: 0 };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <Navbar />

      {/* Hero */}
      <section className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-14 lg:py-20">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div>
              <p className="font-heading text-xs tracking-widest uppercase text-[#3D006B] font-bold mb-3">
                Challenges
              </p>
              <h1 className="font-heading font-black text-4xl lg:text-5xl text-[#0F0F0F] tracking-tight leading-tight mb-4">
                Sharpen your<br />coding skills.
              </h1>
              <p className="font-body text-base text-[#6B7280] max-w-md leading-relaxed">
                Solve real programming problems in Python, Java, JavaScript, C, C++, or Go.
                Sign in to submit solutions and track your progress.
              </p>
            </div>

            {!isLoading && challenges && challenges.length > 0 && (
              <div className="flex items-center gap-3 shrink-0">
                {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => {
                  const cfg = DIFF[d];
                  return (
                    <div key={d} className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 flex flex-col items-center gap-1 min-w-[64px]">
                      <span className={cn('w-2 h-2 rounded-full', cfg.dot)} />
                      <span className="font-heading font-bold text-lg text-[#0F0F0F] leading-none">{counts[d]}</span>
                      <span className="font-body text-[11px] text-[#9CA3AF] capitalize">{cfg.label}</span>
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
            {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : !challenges || challenges.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20">
            <div className="w-14 h-14 rounded-2xl bg-[#F3E8FF] flex items-center justify-center">
              <Code2 size={28} className="text-[#3D006B]" />
            </div>
            <p className="font-heading font-bold text-base text-[#0F0F0F]">No challenges yet</p>
            <p className="font-body text-sm text-[#6B7280]">Check back soon — challenges are coming!</p>
          </div>
        ) : (
          <>
            <p className="font-body text-sm text-[#9CA3AF] mb-6">
              Showing {challenges.length} of many challenges — <Link href="/sign-in" className="text-[#3D006B] hover:underline font-medium">sign in</Link> to see and solve all of them.
            </p>

            {/* Visible cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {challenges.map(c => <ChallengeCard key={c.id} challenge={c} />)}
            </div>

            {/* Blur gate */}
            <div className="relative mt-5">
              {/* Ghost cards — 2 on mobile, 3 on sm, 4 on lg+ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 blur-sm pointer-events-none select-none">
                {GHOST_DIFFICULTIES.map((d, i) => (
                  <div
                    key={i}
                    className={cn(
                      i < 2 ? '' : 'hidden',
                      i === 2 ? 'sm:block' : '',
                      i === 3 ? 'lg:block' : '',
                    )}
                  >
                    <GhostCard difficulty={d} />
                  </div>
                ))}
              </div>

              {/* Gradient + CTA overlay */}
              <div className="absolute inset-x-0 -top-20 bottom-0 bg-gradient-to-b from-transparent via-[#FAFAFA]/80 to-[#FAFAFA]" />
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 gap-4">
                <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-lg px-5 sm:px-8 py-6 flex flex-col items-center gap-3 text-center max-w-sm mx-4 w-full">
                  <div className="w-10 h-10 rounded-xl bg-[#F3E8FF] flex items-center justify-center">
                    <Lock size={18} className="text-[#3D006B]" />
                  </div>
                  <div>
                    <p className="font-heading font-bold text-base text-[#0F0F0F]">
                      More challenges await
                    </p>
                    <p className="font-body text-sm text-[#6B7280] mt-0.5">
                      Sign in to unlock all challenges and submit your solutions.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full">
                    <Button asChild variant="primary" size="sm" fullWidth>
                      <Link href="/sign-in">
                        <Zap size={14} /> Sign In
                      </Link>
                    </Button>
                    <Button asChild variant="secondary" size="sm" fullWidth>
                      <Link href="/sign-up">Sign Up Free</Link>
                    </Button>
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

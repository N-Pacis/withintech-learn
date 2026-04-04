'use client';

import { Badge } from '@/components/ui';
import type { Difficulty, VisibleTestCase } from '@/hooks/queries/challenges';

const DIFFICULTY_BADGE: Record<Difficulty, { variant: 'success' | 'warning' | 'danger'; label: string }> = {
  easy:   { variant: 'success', label: 'Easy'   },
  medium: { variant: 'warning', label: 'Medium' },
  hard:   { variant: 'danger',  label: 'Hard'   },
};

interface ProblemPanelProps {
  title:            string;
  description:      string;
  difficulty:       Difficulty;
  visibleTestCases: VisibleTestCase[];
}

export function ProblemPanel({ title, description, difficulty, visibleTestCases }: ProblemPanelProps) {
  const badge = DIFFICULTY_BADGE[difficulty];

  return (
    <div className="flex flex-col h-full">
      {/* Sticky title + badge */}
      <div className="sticky top-0 bg-white border-b border-[#F3F4F6] px-5 py-4 z-10">
        <div className="flex items-start gap-3">
          <h1 className="font-heading font-bold text-[15px] text-[#0F0F0F] flex-1 leading-snug">{title}</h1>
          <Badge variant={badge.variant} size="md" className="shrink-0 mt-0.5">{badge.label}</Badge>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-6">
        {/* Description */}
        <div className="font-body text-sm text-[#374151] leading-[1.75] whitespace-pre-wrap">
          {description}
        </div>

        {/* Examples */}
        {visibleTestCases.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="font-heading font-semibold text-xs text-[#9CA3AF] uppercase tracking-[0.08em]">
              Examples
            </h2>
            {visibleTestCases.map((tc, i) => (
              <div key={tc.id} className="rounded-xl border border-[#E5E7EB] overflow-hidden">
                <div className="px-3 py-2 bg-[#F9FAFB] border-b border-[#E5E7EB]">
                  <span className="font-body text-xs font-medium text-[#6B7280]">Example {i + 1}</span>
                </div>
                <div className="p-3 grid gap-2.5 bg-white">
                  {tc.input !== '' && (
                    <div>
                      <span className="font-body text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wider block mb-1">Input</span>
                      <pre className="font-mono text-xs text-[#0F0F0F] bg-[#F3F4F6] rounded-lg px-3 py-2 whitespace-pre-wrap break-all leading-relaxed">{tc.input}</pre>
                    </div>
                  )}
                  <div>
                    <span className="font-body text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wider block mb-1">Output</span>
                    <pre className="font-mono text-xs text-[#0F0F0F] bg-[#F3F4F6] rounded-lg px-3 py-2 whitespace-pre-wrap break-all leading-relaxed">{tc.expectedOutput}</pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer note */}
        <p className="font-body text-[11px] text-[#C4B5FD] pb-2">
          Your solution is tested against hidden test cases in addition to the examples above.
        </p>
      </div>
    </div>
  );
}

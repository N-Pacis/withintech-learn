'use client';

import { Badge, TiptapViewer } from '@/components/ui';
import type { Difficulty, FunctionParam, VisibleTestCase } from '@/hooks/queries/challenges';

const DIFFICULTY_BADGE: Record<Difficulty, { variant: 'success' | 'warning' | 'danger'; label: string }> = {
  easy:   { variant: 'success', label: 'Easy'   },
  medium: { variant: 'warning', label: 'Medium' },
  hard:   { variant: 'danger',  label: 'Hard'   },
};

function InputBlock({ input, params }: { input: string; params: FunctionParam[] | null | undefined }) {
  if (!params || params.length === 0) {
    return (
      <pre className="font-mono text-xs text-[#0F0F0F] dark:text-[#D1D5DB] bg-[#F3F4F6] dark:bg-[#252525] rounded-lg px-3 py-2 whitespace-pre-wrap break-all leading-relaxed">
        {input}
      </pre>
    );
  }
  try {
    const values = JSON.parse(input) as unknown[];
    return (
      <div className="flex flex-col gap-1">
        {params.map((p, i) => (
          <div key={p.name} className="flex items-start gap-2 font-mono text-xs">
            <span className="text-[#9CA3AF] shrink-0 pt-0.5">{p.name} =</span>
            <pre className="bg-[#F3F4F6] dark:bg-[#252525] rounded px-2 py-0.5 whitespace-pre-wrap break-all flex-1 text-[#0F0F0F] dark:text-[#D1D5DB]">
              {Array.isArray(values[i]) ? JSON.stringify(values[i]) : String(values[i] ?? '')}
            </pre>
          </div>
        ))}
      </div>
    );
  } catch {
    return (
      <pre className="font-mono text-xs text-[#0F0F0F] dark:text-[#D1D5DB] bg-[#F3F4F6] dark:bg-[#252525] rounded-lg px-3 py-2 whitespace-pre-wrap break-all leading-relaxed">
        {input}
      </pre>
    );
  }
}

interface ProblemPanelProps {
  title:            string;
  description:      string;
  difficulty:       Difficulty;
  visibleTestCases: VisibleTestCase[];
  functionParams?:  FunctionParam[] | null;
}

export function ProblemPanel({ title, description, difficulty, visibleTestCases, functionParams }: ProblemPanelProps) {
  const badge = DIFFICULTY_BADGE[difficulty];

  return (
    <div className="flex flex-col h-full">
      {/* Sticky title + badge */}
      <div className="sticky top-0 bg-white dark:bg-[#1a1a1a] border-b border-[#F3F4F6] dark:border-[#2d2d2d] px-5 py-4 z-10">
        <div className="flex items-start gap-3">
          <h1 className="font-heading font-bold text-[15px] text-[#0F0F0F] dark:text-[#F9FAFB] flex-1 leading-snug">{title}</h1>
          <Badge variant={badge.variant} size="md" className="shrink-0 mt-0.5">{badge.label}</Badge>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-6">
        {/* Description */}
        <TiptapViewer content={description} className="tiptap-viewer text-[#0F0F0F]" />

        {/* Examples */}
        {visibleTestCases.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="font-heading font-semibold text-xs text-[#9CA3AF] uppercase tracking-[0.08em]">
              Examples
            </h2>
            {visibleTestCases.map((tc, i) => (
              <div key={tc.id} className="rounded-xl border border-[#E5E7EB] dark:border-[#2d2d2d] overflow-hidden">
                <div className="px-3 py-2 bg-[#F9FAFB] dark:bg-[#141414] border-b border-[#E5E7EB] dark:border-[#2d2d2d]">
                  <span className="font-body text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF]">Example {i + 1}</span>
                </div>
                <div className="p-3 grid gap-2.5 bg-white dark:bg-[#1a1a1a]">
                  {tc.input !== '' && (
                    <div>
                      <span className="font-body text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wider block mb-1.5">Input</span>
                      <InputBlock input={tc.input} params={functionParams} />
                    </div>
                  )}
                  <div>
                    <span className="font-body text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wider block mb-1">Output</span>
                    <pre className="font-mono text-xs text-[#0F0F0F] dark:text-[#D1D5DB] bg-[#F3F4F6] dark:bg-[#252525] rounded-lg px-3 py-2 whitespace-pre-wrap break-all leading-relaxed">{tc.expectedOutput}</pre>
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

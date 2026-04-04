'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui';
import type { SubmissionResult, SubmissionStatus } from '@/hooks/queries/challenges';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<SubmissionStatus, {
  label:      string;
  variant:    'success' | 'danger' | 'warning';
  icon:       React.ReactNode;
  bg:         string;
  border:     string;
  textColor:  string;
}> = {
  accepted:            { label: 'Accepted',            variant: 'success', icon: <CheckCircle2 size={18} />, bg: 'bg-green-50',  border: 'border-green-200', textColor: 'text-green-700' },
  wrong_answer:        { label: 'Wrong Answer',        variant: 'danger',  icon: <XCircle size={18} />,     bg: 'bg-red-50',    border: 'border-red-200',   textColor: 'text-red-700'   },
  time_limit_exceeded: { label: 'Time Limit Exceeded', variant: 'warning', icon: <AlertCircle size={18} />, bg: 'bg-amber-50',  border: 'border-amber-200', textColor: 'text-amber-700' },
  runtime_error:       { label: 'Runtime Error',       variant: 'danger',  icon: <XCircle size={18} />,     bg: 'bg-red-50',    border: 'border-red-200',   textColor: 'text-red-700'   },
  compile_error:       { label: 'Compile Error',       variant: 'danger',  icon: <XCircle size={18} />,     bg: 'bg-red-50',    border: 'border-red-200',   textColor: 'text-red-700'   },
};

// ─── Single test case row ─────────────────────────────────────────────────────

function TestCaseRow({
  result,
  index,
}: {
  result: SubmissionResult['results'][number];
  index:  number;
}) {
  const [open, setOpen] = useState(!result.passed);
  const hidden = result.input === null;

  return (
    <div className={cn(
      'rounded-xl border overflow-hidden transition-all',
      result.passed ? 'border-green-200' : 'border-red-200',
    )}>
      {/* Header row */}
      <button
        className={cn(
          'w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors',
          result.passed
            ? 'bg-green-50 hover:bg-green-100/60'
            : 'bg-red-50 hover:bg-red-100/60',
        )}
        onClick={() => !hidden && setOpen(v => !v)}
        disabled={hidden}
      >
        {result.passed
          ? <CheckCircle2 size={14} className="text-green-600 shrink-0" />
          : <XCircle size={14} className="text-red-500 shrink-0" />}
        <span className={cn('font-body text-xs font-medium flex-1', result.passed ? 'text-green-800' : 'text-red-800')}>
          Test Case {index + 1}
          {hidden && <span className="ml-2 font-normal text-[#9CA3AF]">(hidden)</span>}
        </span>
        {!hidden && (
          <ChevronDown
            size={13}
            className={cn(
              'transition-transform duration-200 shrink-0',
              result.passed ? 'text-green-500' : 'text-red-400',
              open ? 'rotate-180' : '',
            )}
          />
        )}
      </button>

      {/* Details */}
      {!hidden && open && (
        <div className="p-3 grid gap-2.5 bg-white font-mono text-xs">
          {result.input !== '' && (
            <div>
              <span className="font-body text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wider block mb-1">Input</span>
              <pre className="bg-[#F3F4F6] rounded-lg px-3 py-2 whitespace-pre-wrap break-all leading-relaxed">{result.input}</pre>
            </div>
          )}
          <div>
            <span className="font-body text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wider block mb-1">Expected</span>
            <pre className="bg-[#F3F4F6] rounded-lg px-3 py-2 whitespace-pre-wrap break-all leading-relaxed">{result.expectedOutput}</pre>
          </div>
          {!result.passed && result.actualOutput !== null && result.actualOutput !== 'Time Limit Exceeded' && result.actualOutput !== 'Runtime Error' && (
            <div>
              <span className="font-body text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wider block mb-1">Got</span>
              <pre className="bg-red-50 text-red-700 rounded-lg px-3 py-2 whitespace-pre-wrap break-all leading-relaxed">{result.actualOutput || '(empty output)'}</pre>
            </div>
          )}
          {result.actualOutput === 'Time Limit Exceeded' && (
            <div className="flex items-center gap-2 text-amber-600 font-body text-xs bg-amber-50 rounded-lg px-3 py-2">
              <AlertCircle size={12} /> Time limit exceeded for this test case
            </div>
          )}
          {result.actualOutput === 'Runtime Error' && (
            <div className="flex items-center gap-2 text-red-600 font-body text-xs bg-red-50 rounded-lg px-3 py-2">
              <XCircle size={12} /> Runtime error
            </div>
          )}
          {result.stderr && (
            <div>
              <span className="font-body text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wider block mb-1">Stderr</span>
              <pre className="bg-amber-50 text-amber-700 rounded-lg px-3 py-2 whitespace-pre-wrap break-all leading-relaxed">{result.stderr}</pre>
            </div>
          )}
        </div>
      )}

      {/* Hidden-but-failed */}
      {hidden && !result.passed && (
        <div className="px-4 py-2.5 bg-white font-body text-xs text-[#9CA3AF]">
          This test failed. Details are hidden.
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SubmissionResults({ result }: { result: SubmissionResult }) {
  const config = STATUS_CONFIG[result.status];
  const pct    = result.totalTests > 0 ? (result.testsPassed / result.totalTests) * 100 : 0;

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Verdict card */}
      <div className={cn('rounded-xl border p-4', config.bg, config.border)}>
        <div className="flex items-center gap-3 mb-3">
          <span className={config.textColor}>{config.icon}</span>
          <div className="flex-1">
            <div className={cn('font-heading font-bold text-sm', config.textColor)}>{config.label}</div>
            <div className="font-body text-xs text-[#6B7280] mt-0.5">
              {result.testsPassed} of {result.totalTests} test cases passed
            </div>
          </div>
          <Badge variant={config.variant} size="md">
            {result.testsPassed}/{result.totalTests}
          </Badge>
        </div>

        {/* Mini progress bar */}
        <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-700',
              result.status === 'accepted' ? 'bg-green-500' : 'bg-red-400',
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Compile error */}
      {result.compileError && (
        <div className="rounded-xl border border-red-200 overflow-hidden">
          <div className="px-4 py-2 bg-red-50 border-b border-red-200 font-body text-xs font-medium text-red-600 uppercase tracking-wider">
            Compile Error
          </div>
          <pre className="p-4 font-mono text-xs text-red-700 whitespace-pre-wrap break-all bg-white leading-relaxed overflow-x-auto">
            {result.compileError}
          </pre>
        </div>
      )}

      {/* Per-test results */}
      {!result.compileError && (
        <div className="flex flex-col gap-2">
          {result.results.map((r, i) => (
            <TestCaseRow key={i} result={r} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { CheckCircle2, XCircle, Clock, AlertCircle, FileCode2 } from 'lucide-react';
import { Badge } from '@/components/ui';
import { useMySubmissions, type SubmissionStatus } from '@/hooks/queries/challenges';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<SubmissionStatus, {
  label:   string;
  variant: 'success' | 'danger' | 'warning' | 'gray';
  icon:    React.ReactNode;
  color:   string;
}> = {
  accepted:            { label: 'Accepted',      variant: 'success', icon: <CheckCircle2 size={14} />, color: 'text-green-600' },
  wrong_answer:        { label: 'Wrong Answer',  variant: 'danger',  icon: <XCircle size={14} />,     color: 'text-red-500'   },
  time_limit_exceeded: { label: 'TLE',           variant: 'warning', icon: <Clock size={14} />,       color: 'text-amber-500' },
  runtime_error:       { label: 'Runtime Error', variant: 'danger',  icon: <XCircle size={14} />,     color: 'text-red-500'   },
  compile_error:       { label: 'Compile Error', variant: 'danger',  icon: <AlertCircle size={14} />, color: 'text-red-500'   },
};

const LANG_LABEL: Record<string, string> = {
  python:     'Python 3',
  java:       'Java',
  javascript: 'JavaScript',
  c:          'C',
  cpp:        'C++',
  go:         'Go',
};

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60_000)   return 'Just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function SubmissionHistory({ slug }: { slug: string }) {
  const { data: submissions, isLoading } = useMySubmissions(slug);

  if (isLoading) {
    return (
      <div className="p-4 flex flex-col gap-2 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
            <div className="w-4 h-4 rounded-full bg-[#E5E7EB] dark:bg-[#252525] shrink-0" />
            <div className="flex-1 h-3 bg-[#E5E7EB] dark:bg-[#252525] rounded" />
            <div className="w-20 h-3 bg-[#E5E7EB] dark:bg-[#252525] rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#F3F4F6] dark:bg-[#252525] flex items-center justify-center">
          <FileCode2 size={18} className="text-[#9CA3AF]" />
        </div>
        <div className="text-center">
          <p className="font-body text-xs font-medium text-[#6B7280]">No submissions yet</p>
          <p className="font-body text-[11px] text-[#9CA3AF] mt-0.5">Submit your solution to see it here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 flex flex-col gap-1.5">
      {submissions.map(s => {
        const config = STATUS_CONFIG[s.status];
        const pct = s.totalTests > 0 ? Math.round((s.testsPassed / s.totalTests) * 100) : 0;
        return (
          <div
            key={s.id}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F9FAFB] dark:hover:bg-[#252525] transition-colors border border-transparent hover:border-[#F3F4F6] dark:hover:border-[#2d2d2d]"
          >
            <span className={cn('shrink-0', config.color)}>{config.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={config.variant} size="sm">{config.label}</Badge>
                <span className="font-mono text-[11px] text-[#9CA3AF]">
                  {LANG_LABEL[s.language] ?? s.language}
                </span>
              </div>
              <div className="font-body text-[11px] text-[#9CA3AF] mt-0.5 flex items-center gap-1.5">
                <span>{s.testsPassed}/{s.totalTests} tests</span>
                {pct > 0 && pct < 100 && (
                  <>
                    <span>·</span>
                    <span>{pct}%</span>
                  </>
                )}
              </div>
            </div>
            <span className="font-body text-[11px] text-[#9CA3AF] shrink-0">
              {formatDate(s.submittedAt)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

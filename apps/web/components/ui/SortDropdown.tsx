'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronsUpDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SortOption<T extends string> {
  value: T;
  label: string;
}

interface SortDropdownProps<T extends string> {
  options: SortOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function SortDropdown<T extends string>({
  options,
  value,
  onChange,
  className,
}: SortDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border font-body text-sm transition-all duration-150 select-none whitespace-nowrap',
          open
            ? 'border-[#3D006B] text-[#3D006B] bg-[#F9F5FF] shadow-sm dark:border-[#7C3AED] dark:text-[#C084FC] dark:bg-[#2d1a4a]'
            : 'border-[#E5E7EB] text-[#6B7280] bg-white hover:border-[#3D006B]/50 hover:text-[#3D006B] hover:bg-[#F9F5FF] dark:border-[#2d2d2d] dark:text-[#9CA3AF] dark:bg-transparent dark:hover:border-[#7C3AED]/50 dark:hover:text-[#C084FC] dark:hover:bg-[#2d1a4a]',
        )}
      >
        <span>{selected?.label ?? 'Sort'}</span>
        <ChevronsUpDown size={13} className="shrink-0 opacity-60" />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-50 min-w-[168px] bg-white dark:bg-[#1a1a1a] border border-[#E5E7EB] dark:border-[#2d2d2d] rounded-xl shadow-lg py-1 animate-in fade-in-0 zoom-in-95 duration-100">
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={cn(
                  'w-full flex items-center justify-between gap-3 px-4 py-2 font-body text-sm transition-colors text-left',
                  active
                    ? 'text-[#3D006B] bg-[#F9F5FF] dark:text-[#C084FC] dark:bg-[#2d1a4a]'
                    : 'text-[#374151] hover:bg-[#F9FAFB] dark:text-[#D1D5DB] dark:hover:bg-[#252525]',
                )}
              >
                {opt.label}
                {active && <Check size={13} className="shrink-0 text-[#3D006B] dark:text-[#C084FC]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

'use client';

import { cn } from '@/lib/utils';

export interface FilterOption<T extends string> {
  value: T;
  label: string;
}

interface FilterPillsProps<T extends string> {
  options: FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function FilterPills<T extends string>({
  options,
  value,
  onChange,
  className,
}: FilterPillsProps<T>) {
  return (
    <div className={cn('flex items-center gap-1.5 flex-wrap', className)}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'font-body text-sm px-3.5 py-1.5 rounded-full border transition-all duration-150 select-none',
              active
                ? 'bg-[#3D006B] text-white border-[#3D006B] shadow-sm'
                : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#3D006B]/50 hover:text-[#3D006B] hover:bg-[#F9F5FF] dark:bg-transparent dark:text-[#9CA3AF] dark:border-[#2d2d2d] dark:hover:border-[#7C3AED]/50 dark:hover:text-[#C084FC] dark:hover:bg-[#2d1a4a]',
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

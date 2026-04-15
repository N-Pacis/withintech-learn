"use client";

import { cn } from "@/lib/utils";

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
    <div className={cn("flex items-center gap-1.5 flex-wrap", className)}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "font-body text-sm px-3.5 py-1.5 rounded-full border transition-all duration-150 select-none",
              active
                ? "bg-primary text-white border-primary shadow-sm"
                : "bg-white text-muted border-border hover:border-primary/50 hover:text-primary hover:bg-primary-soft-alt dark:bg-transparent text-muted border-border hover:border-primary/50 hover:text-primary hover:bg-primary-soft",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

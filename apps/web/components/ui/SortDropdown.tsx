"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

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
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border font-body text-sm transition-all duration-150 select-none whitespace-nowrap",
          open
            ? "border-primary text-primary bg-primary-soft-alt shadow-sm"
            : "border-border text-muted bg-surface-card hover:border-primary/50 hover:text-primary hover:bg-primary-soft-alt",
        )}
      >
        <span>{selected?.label ?? "Sort"}</span>
        <ChevronsUpDown size={13} className="shrink-0 opacity-60" />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-50 min-w-[168px] bg-surface-card border border-border rounded-xl shadow-lg py-1 animate-in fade-in-0 zoom-in-95 duration-100">
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between gap-3 px-4 py-2 font-body text-sm transition-colors text-left",
                  active
                    ? "text-primary bg-primary-soft-alt"
                    : "text-foreground-soft hover:bg-surface-subtle",
                )}
              >
                {opt.label}
                {active && (
                  <Check size={13} className="shrink-0 text-primary" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

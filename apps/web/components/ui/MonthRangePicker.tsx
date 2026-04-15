"use client";

import React, { forwardRef } from "react";
import DatePickerLib from "react-datepicker";
import type { DatePickerProps } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./MonthRangePicker.css";

// v9 default export loses its props type in some TS configs — cast it back.
const DatePicker = DatePickerLib as unknown as React.FC<DatePickerProps>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ymToDate(ym: string): Date {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1);
}

function dateToYm(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatLabel(ym: string): string {
  return ymToDate(ym).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

// ─── Trigger button ───────────────────────────────────────────────────────────

const Trigger = forwardRef<
  HTMLButtonElement,
  { value?: string; onClick?: () => void }
>(({ value, onClick }, ref) => (
  <button
    ref={ref}
    type="button"
    onClick={onClick}
    className={[
      "flex items-center gap-2 font-body text-sm text-foreground-soft",
      "bg-surface-card border border-border rounded-lg px-3 py-1.5",
      "hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/10",
      "outline-none transition-colors cursor-pointer whitespace-nowrap",
    ].join(" ")}
  >
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-muted-contrast"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
    {value}
  </button>
));
Trigger.displayName = "Trigger";

// ─── Component ────────────────────────────────────────────────────────────────

interface MonthRangePickerProps {
  from: string; // 'YYYY-MM'
  to: string; // 'YYYY-MM'
  min?: string; // 'YYYY-MM'
  max?: string; // 'YYYY-MM'
  onChange: (from: string, to: string) => void;
}

export function MonthRangePicker({
  from,
  to,
  min,
  max,
  onChange,
}: MonthRangePickerProps) {
  const fromDate = ymToDate(from);
  const toDate = ymToDate(to);
  const minDate = min ? ymToDate(min) : undefined;
  const maxDate = max ? ymToDate(max) : new Date();

  return (
    <div className="mrp-wrap flex items-center gap-2">
      <DatePicker
        selected={fromDate}
        onChange={(d: Date | null) => d && onChange(dateToYm(d), to)}
        showMonthYearPicker
        dateFormat="MMM yyyy"
        minDate={minDate}
        maxDate={toDate}
        popperClassName="mrp-popper"
        customInput={<Trigger value={formatLabel(from)} />}
      />
      <span className="font-body text-xs text-muted-contrast">→</span>
      <DatePicker
        selected={toDate}
        onChange={(d: Date | null) => d && onChange(from, dateToYm(d))}
        showMonthYearPicker
        dateFormat="MMM yyyy"
        minDate={fromDate}
        maxDate={maxDate}
        popperClassName="mrp-popper"
        customInput={<Trigger value={formatLabel(to)} />}
      />
    </div>
  );
}

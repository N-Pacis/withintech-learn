'use client';

import React from 'react';

interface DayRangePickerProps {
  from: string; // YYYY-MM-DD
  to: string;   // YYYY-MM-DD
  onChange: (from: string, to: string) => void;
  maxDays?: number;
}

const inputClass = [
  'font-body text-sm text-[#374151] bg-white',
  'border border-[#E5E7EB] rounded-lg px-3 py-1.5',
  'hover:border-[#3D006B]/40 focus:border-[#3D006B] focus:ring-2 focus:ring-[#3D006B]/10',
  'outline-none transition-colors cursor-pointer',
].join(' ');

export function DayRangePicker({ from, to, onChange, maxDays = 30 }: DayRangePickerProps) {
  function handleFrom(value: string) {
    if (!value) return;
    // clamp `to` so it stays within maxDays of the new `from`
    const f = new Date(value);
    const t = new Date(to);
    const limit = new Date(f);
    limit.setDate(limit.getDate() + maxDays);
    const clampedTo = t < f ? value : t > limit ? toIso(limit) : to;
    onChange(value, clampedTo);
  }

  function handleTo(value: string) {
    if (!value) return;
    // clamp `from` so it stays within maxDays of the new `to`
    const t = new Date(value);
    const f = new Date(from);
    const limit = new Date(t);
    limit.setDate(limit.getDate() - maxDays);
    const clampedFrom = f > t ? value : f < limit ? toIso(limit) : from;
    onChange(clampedFrom, value);
  }

  const maxTo = (() => {
    const d = new Date(from);
    d.setDate(d.getDate() + maxDays);
    return toIso(d);
  })();

  const minFrom = (() => {
    const d = new Date(to);
    d.setDate(d.getDate() - maxDays);
    return toIso(d);
  })();

  return (
    <div className="flex items-center gap-2">
      <input
        type="date"
        value={from}
        min={minFrom}
        max={to}
        onChange={(e) => handleFrom(e.target.value)}
        className={inputClass}
      />
      <span className="font-body text-xs text-[#9CA3AF]">→</span>
      <input
        type="date"
        value={to}
        min={from}
        max={maxTo}
        onChange={(e) => handleTo(e.target.value)}
        className={inputClass}
      />
    </div>
  );
}

function toIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

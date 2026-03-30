'use client';

import { useState, KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  className?: string;
  disabled?: boolean;
}

export function TagInput({ value, onChange, placeholder, suggestions = [], className, disabled }: TagInputProps) {
  const [input, setInput] = useState('');

  const add = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed || value.includes(trimmed) || value.length >= 20) return;
    onChange([...value, trimmed]);
    setInput('');
  };

  const remove = (tag: string) => onChange(value.filter((t) => t !== tag));

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      add(input);
    }
    if (e.key === 'Backspace' && !input && value.length > 0) {
      remove(value[value.length - 1]);
    }
  };

  const filteredSuggestions = suggestions.filter(
    (s) => !value.includes(s) && s.toLowerCase().includes(input.toLowerCase()),
  );

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div
        className={cn(
          'flex flex-wrap gap-1.5 min-h-[42px] w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2',
          'focus-within:ring-2 focus-within:ring-[#3D006B]/20 focus-within:border-[#3D006B]',
          disabled && 'opacity-50 pointer-events-none',
        )}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 bg-[#F3E8FF] text-[#3D006B] text-xs font-medium font-body px-2 py-0.5 rounded"
          >
            {tag}
            <button
              type="button"
              onClick={() => remove(tag)}
              className="hover:text-[#2A004A] leading-none"
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => { if (input.trim()) add(input); }}
          placeholder={value.length === 0 ? (placeholder ?? 'Type and press Enter…') : ''}
          className="flex-1 min-w-[120px] text-sm font-body outline-none bg-transparent text-[#0F0F0F] placeholder:text-[#9CA3AF]"
          disabled={disabled}
        />
      </div>

      {/* Suggestion chips */}
      {input && filteredSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {filteredSuggestions.slice(0, 8).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="text-xs font-body text-[#6B7280] border border-[#E5E7EB] rounded px-2 py-0.5 hover:border-[#3D006B] hover:text-[#3D006B] transition-colors"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

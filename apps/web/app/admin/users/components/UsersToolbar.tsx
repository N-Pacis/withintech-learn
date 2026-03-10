'use client';

import { UsersParams } from '@/hooks/queries/users';
import { cn } from '@/lib/utils';

interface UsersToolbarProps {
  params: UsersParams;
  onChange: (next: Partial<UsersParams>) => void;
}

const roleOptions = [
  { value: '', label: 'All Roles' },
  { value: 'student', label: 'Student' },
  { value: 'admin', label: 'Admin' },
];

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const selectClass = cn(
  'font-body text-sm text-[#374151] bg-white border border-[#E5E7EB] rounded-lg',
  'px-3 py-2 outline-none cursor-pointer transition-colors',
  'hover:border-[#3D006B]/40 focus:border-[#3D006B] focus:ring-2 focus:ring-[#3D006B]/10',
  'appearance-none pr-8',
);

export default function UsersToolbar({ params, onChange }: UsersToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-0">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          type="text"
          placeholder="Search by name or email…"
          value={params.search ?? ''}
          onChange={(e) => onChange({ search: e.target.value })}
          className={cn(
            'font-body text-sm w-full pl-9 pr-4 py-2 rounded-lg border border-[#E5E7EB] bg-white text-[#0F0F0F]',
            'placeholder-[#9CA3AF] outline-none transition-all',
            'focus:border-[#3D006B] focus:ring-2 focus:ring-[#3D006B]/10',
          )}
        />
      </div>

      {/* Role filter */}
      <div className="relative">
        <select
          value={params.role ?? ''}
          onChange={(e) => onChange({ role: e.target.value as UsersParams['role'] })}
          className={selectClass}
        >
          {roleOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </div>

      {/* Status filter */}
      <div className="relative">
        <select
          value={params.status ?? ''}
          onChange={(e) => onChange({ status: e.target.value as UsersParams['status'] })}
          className={selectClass}
        >
          {statusOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </div>
    </div>
  );
}

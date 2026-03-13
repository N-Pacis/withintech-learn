'use client';

import { useState, useEffect } from 'react';
import { Badge, PageLoader, Table } from '@/components/ui';
import type { Column } from '@/components/ui';
import { useStudents, useSetUserActive, AdminUser, UsersParams } from '@/hooks/queries/users';
import { cn } from '@/lib/utils';

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

function formatDate(date: string | null) {
  if (!date) return <span className="text-[#D1D5DB]">—</span>;
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function StudentsPage() {
  const [rawSearch, setRawSearch] = useState('');
  const [status, setStatus] = useState<UsersParams['status']>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const debouncedSearch = useDebounce(rawSearch.trim(), 350);

  const params: UsersParams = {
    search: debouncedSearch || undefined,
    status: status || undefined,
    sortOrder,
  };

  const { data: students, isLoading, error } = useStudents(params);
  const { mutate: setActive } = useSetUserActive();

  const columns: Column<AdminUser>[] = [
    {
      key: 'user',
      header: 'Student',
      cell: (u) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#3D006B]/10 flex items-center justify-center shrink-0">
            <span className="font-heading font-bold text-xs text-[#3D006B]">
              {u.firstName[0]?.toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-body text-sm font-medium text-[#0F0F0F]">{u.firstName} {u.lastName}</p>
            <p className="font-body text-xs text-[#9CA3AF]">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (u) => (
        <Badge variant={u.isActive ? 'success' : 'warning'}>
          {u.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'lastLoggedIn',
      header: 'Last login',
      cell: (u) => (
        <span className="font-body text-sm text-[#6B7280]">{formatDate(u.lastLoggedIn)}</span>
      ),
    },
    {
      key: 'createdAt',
      header: (
        <button
          onClick={() => setSortOrder((s) => (s === 'desc' ? 'asc' : 'desc'))}
          className="flex items-center gap-1.5 font-body text-xs font-semibold uppercase tracking-wider text-[#6B7280] hover:text-[#3D006B] transition-colors"
        >
          Joined
          <span className="flex flex-col gap-px">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor" className={sortOrder === 'asc' ? 'text-[#3D006B]' : 'text-[#D1D5DB]'}>
              <path d="M4 0L8 8H0L4 0Z" />
            </svg>
            <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor" className={sortOrder === 'desc' ? 'text-[#3D006B]' : 'text-[#D1D5DB]'}>
              <path d="M4 8L0 0H8L4 8Z" />
            </svg>
          </span>
        </button>
      ),
      cell: (u) => (
        <span className="font-body text-sm text-[#6B7280]">{formatDate(u.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      className: 'text-right',
      cell: (u) => (
        <button
          onClick={() => setActive({ userId: u.id, isActive: !u.isActive })}
          className={cn(
            'font-body text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors',
            u.isActive
              ? 'text-red-600 border-red-200 hover:bg-red-50'
              : 'text-[#3D006B] border-[#3D006B]/20 hover:bg-[#3D006B]/5',
          )}
        >
          {u.isActive ? 'Deactivate' : 'Activate'}
        </button>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading font-black text-2xl text-[#0F0F0F]">Students</h1>
        <p className="font-body text-sm text-[#6B7280] mt-1">Manage student accounts.</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 min-w-0">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search by name or email…"
            value={rawSearch}
            onChange={(e) => setRawSearch(e.target.value)}
            className={cn(
              'font-body text-sm w-full pl-9 pr-4 py-2 rounded-lg border border-[#E5E7EB] bg-white text-[#0F0F0F]',
              'placeholder-[#9CA3AF] outline-none transition-all',
              'focus:border-[#3D006B] focus:ring-2 focus:ring-[#3D006B]/10',
            )}
          />
        </div>
        <div className="relative">
          <select
            value={status ?? ''}
            onChange={(e) => setStatus(e.target.value as UsersParams['status'])}
            className={cn(
              'font-body text-sm text-[#374151] bg-white border border-[#E5E7EB] rounded-lg',
              'px-3 py-2 outline-none cursor-pointer transition-colors',
              'hover:border-[#3D006B]/40 focus:border-[#3D006B] focus:ring-2 focus:ring-[#3D006B]/10',
              'appearance-none pr-8',
            )}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </div>
      </div>

      {isLoading && <PageLoader type="list" />}

      {error && (
        <p className="font-body text-sm text-red-500 bg-red-50 px-4 py-3 rounded-lg">
          Failed to load students. Please try again.
        </p>
      )}

      {!isLoading && !error && students?.length === 0 && (
        <div className="text-center py-16">
          <p className="font-body text-[#6B7280]">No students found.</p>
        </div>
      )}

      {students && students.length > 0 && (
        <Table columns={columns} rows={students} rowKey={(u) => u.id} />
      )}
    </div>
  );
}

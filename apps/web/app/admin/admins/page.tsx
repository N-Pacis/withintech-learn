'use client';

import { useState, useEffect } from 'react';
import { Button, Badge, PageLoader, Table } from '@/components/ui';
import type { Column } from '@/components/ui';
import { useAdmins, useSetUserActive, AdminUser, UsersParams } from '@/hooks/queries/users';
import AddAdminModal from './components/AddAdminModal';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

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

export default function AdminsPage() {
  const [showModal, setShowModal] = useState(false);
  const [rawSearch, setRawSearch] = useState('');
  const [status, setStatus] = useState<UsersParams['status']>('');
  const debouncedSearch = useDebounce(rawSearch.trim(), 350);

  const params: UsersParams = {
    search: debouncedSearch || undefined,
    status: status || undefined,
  };

  const { user: currentUser } = useAuth();
  const { data: admins, isLoading, error } = useAdmins(params);
  const { mutate: setActive } = useSetUserActive();

  const columns: Column<AdminUser>[] = [
    {
      key: 'user',
      header: 'Admin',
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
      header: 'Joined',
      cell: (u) => (
        <span className="font-body text-sm text-[#6B7280]">{formatDate(u.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      className: 'text-right',
      cell: (u) => {
        const isSelf = u.id === currentUser?.id;
        return (
          <Button
            variant={u.isActive ? 'danger' : 'secondary'}
            onClick={() => setActive({ userId: u.id, isActive: !u.isActive })}
            className="text-xs py-1.5 px-3"
            disabled={isSelf && u.isActive}
            title={isSelf && u.isActive ? 'You cannot deactivate your own account' : undefined}
          >
            {u.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        );
      },
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-heading font-black text-2xl text-[#0F0F0F]">Admins</h1>
          <p className="font-body text-sm text-[#6B7280] mt-1">Manage admin accounts.</p>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          Add Admin
        </Button>
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
          Failed to load admins. Please try again.
        </p>
      )}

      {!isLoading && !error && admins?.length === 0 && (
        <div className="text-center py-16">
          <p className="font-body text-[#6B7280]">No admins found.</p>
        </div>
      )}

      {admins && admins.length > 0 && (
        <Table columns={columns} rows={admins} rowKey={(u) => u.id} />
      )}

      {showModal && <AddAdminModal onClose={() => setShowModal(false)} />}
    </div>
  );
}

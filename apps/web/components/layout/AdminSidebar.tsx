'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const navItems = [
  {
    label: 'Dashboard',
    href: '/admin',
    exact: true,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: 'Courses',
    href: '/admin/courses',
    exact: false,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    label: 'Admins',
    href: '/admin/admins',
    exact: false,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    label: 'Students',
    href: '/admin/students',
    exact: false,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const initials = [user?.firstName?.[0], user?.lastName?.[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-40 w-64 h-screen bg-white flex flex-col',
          'border-r border-[#F0F0F0] shadow-[1px_0_0_0_#F0F0F0]',
          'transition-transform duration-300 ease-in-out',
          'lg:translate-x-0 lg:sticky lg:top-0',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        {/* Logo */}
        <div className="px-5 py-5 flex items-center justify-between">
          <Logo className="h-12" linked={false} variant="default" />
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#374151] hover:bg-[#F3F4F6] transition-colors"
            aria-label="Close menu"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 flex flex-col gap-0.5 overflow-y-auto">
          <p className="font-body text-[10px] font-semibold text-[#9CA3AF] tracking-widest uppercase px-3 mb-2">
            Menu
          </p>
          {navItems.map(({ label, href, exact, icon }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm font-medium transition-all',
                  active
                    ? 'bg-[#3D006B] text-white shadow-sm'
                    : 'text-[#6B7280] hover:text-[#374151] hover:bg-[#F3F4F6]',
                )}
              >
                <span className={cn('shrink-0', active ? 'text-white' : 'text-[#9CA3AF]')}>
                  {icon}
                </span>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User + sign out */}
        <div className="px-3 py-4 border-t border-[#F0F0F0]">
          <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
            <div className="w-8 h-8 rounded-full bg-[#3D006B] flex items-center justify-center shrink-0">
              <span className="font-heading font-bold text-xs text-white">{initials || '?'}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-body text-sm font-medium text-[#0F0F0F] truncate leading-tight">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="font-body text-xs text-[#9CA3AF] truncate">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={() => { onClose(); logout(); }}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-[#6B7280] hover:text-red-600 hover:bg-red-50 transition-colors font-body text-sm"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}

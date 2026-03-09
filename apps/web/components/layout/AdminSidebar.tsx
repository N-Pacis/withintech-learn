'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const navItems = [
  {
    label: 'Dashboard',
    href: '/admin',
    exact: true,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
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

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 z-40 w-64 h-screen bg-[#3D006B] flex flex-col',
        'transition-transform duration-300 ease-in-out',
        // On desktop always visible; on mobile slide in/out
        'lg:translate-x-0 lg:sticky',
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      )}
    >
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-baseline gap-0">
          <span className="font-heading font-bold text-base text-white">WithinTech</span>
          <span className="font-heading font-bold text-base text-[#F97316]">Learn</span>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={onClose}
          className="lg:hidden p-1 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close menu"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* User info */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="w-9 h-9 rounded-full bg-[#F97316]/20 flex items-center justify-center mb-3">
          <span className="font-heading font-bold text-sm text-[#F97316]">
            {user?.firstName?.[0]?.toUpperCase() ?? '?'}
          </span>
        </div>
        <p className="font-heading font-bold text-sm text-white leading-tight">
          {user?.firstName} {user?.lastName}
        </p>
        <p className="font-body text-xs text-white/50 mt-0.5 truncate">{user?.email}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map(({ label, href, exact, icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm font-medium transition-colors',
              isActive(href, exact)
                ? 'bg-white/15 text-white'
                : 'text-white/60 hover:text-white hover:bg-white/10',
            )}
          >
            {icon}
            {label}
          </Link>
        ))}
      </nav>

      {/* Sign out */}
      <div className="px-3 pb-5 border-t border-white/10 pt-4">
        <button
          onClick={() => { onClose(); logout(); }}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors font-body text-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign Out
        </button>
      </div>
    </aside>
  );
}

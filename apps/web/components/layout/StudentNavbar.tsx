'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'My Courses', href: '/learn' },
  { label: 'Certificates', href: '/learn/certificates' },
];

export default function StudentNavbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#E5E7EB] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Logo className="h-24" linked={false} />
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'font-body text-sm font-medium px-3 py-2 rounded-lg transition-colors',
                pathname === href || (href !== '/learn' && pathname.startsWith(href))
                  ? 'text-[#3D006B] bg-[#3D006B]/5'
                  : 'text-[#6B7280] hover:text-[#3D006B] hover:bg-[#3D006B]/5',
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right: user + logout */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#3D006B]/10 flex items-center justify-center">
              <span className="font-heading font-bold text-xs text-[#3D006B]">
                {user?.firstName?.[0]?.toUpperCase() ?? '?'}
              </span>
            </div>
            <span className="font-body text-sm text-[#374151]">
              {user?.firstName} {user?.lastName}
            </span>
          </div>
          <button
            onClick={logout}
            className="font-body text-sm text-[#6B7280] hover:text-[#3D006B] transition-colors flex items-center gap-1.5"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </button>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-1.5 rounded-md text-[#6B7280] hover:text-[#3D006B] hover:bg-[#3D006B]/5 transition-colors"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile nav dropdown */}
      {menuOpen && (
        <nav className="md:hidden border-t border-[#E5E7EB] bg-white px-4 py-3 flex flex-col gap-1">
          {navItems.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={cn(
                'font-body text-sm font-medium px-3 py-2.5 rounded-lg transition-colors',
                pathname === href || (href !== '/learn' && pathname.startsWith(href))
                  ? 'text-[#3D006B] bg-[#3D006B]/5'
                  : 'text-[#6B7280] hover:text-[#3D006B] hover:bg-[#3D006B]/5',
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

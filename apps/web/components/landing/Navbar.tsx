'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Logo } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useProfile } from '@/hooks/queries/auth';

const links = [
  { label: 'Courses',      href: '#courses'      },
  { label: 'How It Works', href: '#how-it-works' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { data: profile } = useProfile();

  const ctaHref  = profile ? (profile.role === 'admin' ? '/admin' : '/learn') : '/sign-in';
  const ctaLabel = profile ? 'Continue' : 'Start Learning';

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-24 flex items-center justify-between">

        {/* Logo */}
        <Logo className="h-28" />

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {links.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="font-heading text-sm font-semibold text-[#0F0F0F] hover:text-[#3D006B] transition-colors"
            >
              {label}
            </Link>
          ))}
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-2 font-body text-sm font-medium bg-[#3D006B] text-white px-5 py-2 rounded-md hover:bg-[#2A004A] transition-colors"
          >
            {ctaLabel} <ArrowRight size={14} />
          </Link>
        </div>

        {/* Mobile: hamburger */}
        <button
          onClick={() => setOpen(v => !v)}
          className="md:hidden p-2 rounded-md text-[#0F0F0F] hover:bg-[#F3F4F6] transition-colors"
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      <div className={cn(
        'md:hidden overflow-hidden transition-all duration-200 ease-in-out border-t border-[#E5E7EB]',
        open ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0',
      )}>
        <div className="px-6 py-4 flex flex-col gap-1 bg-white">
          {links.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="font-heading text-sm font-semibold text-[#0F0F0F] hover:text-[#3D006B] transition-colors py-2.5 border-b border-[#F3F4F6] last:border-0"
            >
              {label}
            </Link>
          ))}
          <Link
            href={ctaHref}
            onClick={() => setOpen(false)}
            className="mt-3 inline-flex items-center justify-center gap-2 font-body text-sm font-medium bg-[#3D006B] text-white px-5 py-3 rounded-md hover:bg-[#2A004A] transition-colors"
          >
            {ctaLabel} <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </nav>
  );
}

'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0f0f0f] flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center mb-6">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h1 className="font-heading font-black text-2xl text-[#0F0F0F] dark:text-[#F9FAFB] mb-2">Something went wrong</h1>
      <p className="font-body text-sm text-[#6B7280] dark:text-[#9CA3AF] max-w-sm mb-8">
        An unexpected error occurred. Try again or go back to the homepage.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 font-body text-sm font-medium bg-[#3D006B] text-white px-5 py-2.5 rounded-lg hover:bg-[#2A004A] transition-colors"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-body text-sm font-medium bg-white dark:bg-[#1a1a1a] text-[#374151] dark:text-[#D1D5DB] border border-[#E5E7EB] dark:border-[#2d2d2d] px-5 py-2.5 rounded-lg hover:bg-[#F9FAFB] dark:hover:bg-[#252525] transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}

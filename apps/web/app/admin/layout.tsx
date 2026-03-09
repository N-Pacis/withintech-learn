'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import AdminSidebar from '@/components/layout/AdminSidebar';

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/sign-in');
    } else if (user.role !== 'admin') {
      router.replace('/learn');
    }
  }, [user, isLoading, router]);

  // Close sidebar on route changes (resize from mobile to desktop is fine too)
  useEffect(() => {
    setSidebarOpen(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-[#3D006B] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">

      {/* ── Mobile top bar ────────────────────────────────────────────────── */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-30 h-14 bg-[#3D006B] flex items-center gap-3 px-4 shadow-sm">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-1.5 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Open menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="flex items-baseline gap-0">
          <span className="font-heading font-bold text-base text-white">WithinTech</span>
          <span className="font-heading font-bold text-base text-[#F97316]">Learn</span>
        </div>
      </header>

      {/* ── Backdrop overlay (mobile) ─────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Layout body ───────────────────────────────────────────────────── */}
      <div className="flex">
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main — add top padding on mobile to clear the fixed header */}
        <main className="flex-1 min-w-0 pt-14 lg:pt-0 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminGuard>{children}</AdminGuard>
    </AuthProvider>
  );
}

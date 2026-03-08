'use client';

import { useAuth } from '@/hooks/useAuth';

export default function AdminSidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 shrink-0 bg-[#3D006B] flex flex-col h-screen sticky top-0">

      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-baseline gap-0">
          <span className="font-heading font-bold text-base text-white">WithinTech</span>
          <span className="font-heading font-bold text-base text-[#F97316]">Learn</span>
        </div>
        <p className="font-body text-xs text-white/40 mt-0.5">Admin Panel</p>
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

      {/* Nav space (expandable later) */}
      <nav className="flex-1 px-3 py-4">
        <a
          href="/admin"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/10 text-white font-body text-sm font-medium"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
          </svg>
          Dashboard
        </a>
      </nav>

      {/* Sign out */}
      <div className="px-3 pb-5 border-t border-white/10 pt-4">
        <button
          onClick={logout}
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

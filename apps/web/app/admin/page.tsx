'use client';

import { useAuth } from '@/hooks/useAuth';

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="p-8 lg:p-12">

      {/* Header */}
      <div className="mb-10">
        <p className="font-body text-sm text-[#6B7280] mb-1">Admin Dashboard</p>
        <h1 className="font-heading font-black text-3xl text-[#0F0F0F]">
          Welcome back, {user?.firstName}.
        </h1>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {[
          { label: 'Total Students', value: '—' },
          { label: 'Active Courses', value: '—' },
          { label: 'Certificates Issued', value: '—' },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-white rounded-xl border border-[#E5E7EB] px-6 py-5"
          >
            <p className="font-body text-xs text-[#6B7280] uppercase tracking-widest mb-2">
              {label}
            </p>
            <p className="font-heading font-bold text-3xl text-[#0F0F0F]">{value}</p>
          </div>
        ))}
      </div>

      {/* Placeholder content */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] px-6 py-8 flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-[#F3E8FF] flex items-center justify-center mb-4">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3D006B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
          </svg>
        </div>
        <h2 className="font-heading font-bold text-lg text-[#0F0F0F] mb-2">
          Your workspace is ready
        </h2>
        <p className="font-body text-sm text-[#6B7280]">
          Use the sidebar to manage courses, students, and enrollments.
        </p>
      </div>

    </div>
  );
}

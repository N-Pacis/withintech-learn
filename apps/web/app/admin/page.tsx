'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useAdminStats } from '@/hooks/queries/users';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data: stats } = useAdminStats();

  const statCards = [
    { label: 'Total Students',      value: stats?.totalStudents      ?? '—', href: '/admin/students' },
    { label: 'Active Courses',       value: stats?.activeCourses       ?? '—', href: '/admin/courses'  },
    { label: 'Certificates Issued',  value: stats?.certificatesIssued  ?? '—', href: null               },
  ];

  return (
    <div className="p-4 sm:p-8 lg:p-12">

      <div className="mb-10">
        <p className="font-body text-sm text-[#6B7280] mb-1">Admin Dashboard</p>
        <h1 className="font-heading font-black text-3xl text-[#0F0F0F]">
          Welcome back, {user?.firstName}.
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {statCards.map(({ label, value, href }) => {
          const card = (
            <div className={`bg-white rounded-xl border border-[#E5E7EB] px-6 py-5${href ? ' hover:border-[#3D006B]/30 transition-colors cursor-pointer' : ''}`}>
              <p className="font-body text-xs text-[#6B7280] uppercase tracking-widest mb-2">{label}</p>
              <p className="font-heading font-bold text-3xl text-[#0F0F0F]">{value}</p>
            </div>
          );
          return href
            ? <Link key={label} href={href}>{card}</Link>
            : <div key={label}>{card}</div>;
        })}
      </div>

    </div>
  );
}

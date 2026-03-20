'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useAdminStats } from '@/hooks/queries/users';
import { useEnrollmentTrend, useTopCourses, useRetention } from '@/hooks/queries/analytics';
import { EnrollmentTrendChart } from './components/EnrollmentTrendChart';
import { TopCoursesChart } from './components/TopCoursesChart';
import type { RetentionStats } from '@/hooks/queries/analytics';

// ─── Chart card ───────────────────────────────────────────────────────────────

function ChartCard({ title, subtitle, children }: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] px-6 py-5">
      <div className="mb-4">
        <p className="font-heading font-bold text-sm text-[#0F0F0F]">{title}</p>
        {subtitle && <p className="font-body text-xs text-[#9CA3AF] mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ChartSkeleton({ height = 260 }: { height?: number }) {
  return (
    <div className="rounded-lg bg-[#F9FAFB] animate-pulse" style={{ height }} />
  );
}

// ─── Empty ────────────────────────────────────────────────────────────────────

function ChartEmpty({ height = 260, message }: { height?: number; message: string }) {
  return (
    <div className="flex items-center justify-center" style={{ height }}>
      <p className="font-body text-sm text-[#9CA3AF]">{message}</p>
    </div>
  );
}

// ─── Retention ring ───────────────────────────────────────────────────────────

function RetentionCard({ totalStudents, returningStudents, retentionRate }: RetentionStats) {
  const radius = 54;
  const circ = 2 * Math.PI * radius;
  const dash = (retentionRate / 100) * circ;

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 py-4">
      <div className="relative">
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={radius} fill="none" stroke="#F3F4F6" strokeWidth="12" />
          <circle
            cx="70" cy="70" r={radius}
            fill="none"
            stroke="#3D006B"
            strokeWidth="12"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            transform="rotate(-90 70 70)"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-heading font-black text-2xl text-[#0F0F0F]">{retentionRate}%</span>
          <span className="font-body text-xs text-[#9CA3AF]">retention</span>
        </div>
      </div>

      <div className="w-full flex flex-col gap-2">
        <div className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-[#F9FAFB]">
          <span className="font-body text-xs text-[#6B7280]">Total students</span>
          <span className="font-heading font-bold text-sm text-[#0F0F0F]">{totalStudents}</span>
        </div>
        <div className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-[#F3E8FF]">
          <span className="font-body text-xs text-[#3D006B]">Returned for 2nd course</span>
          <span className="font-heading font-bold text-sm text-[#3D006B]">{returningStudents}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data: stats } = useAdminStats();

  // Each chart fetches independently — they render as they resolve.
  const { data: trend,     isLoading: trendLoading     } = useEnrollmentTrend();
  const { data: courses,   isLoading: coursesLoading   } = useTopCourses();
  const { data: retention, isLoading: retentionLoading } = useRetention();

  const statCards = [
    { label: 'Total Students',      value: stats?.totalStudents      ?? '—', href: '/admin/students' },
    { label: 'Active Courses',      value: stats?.activeCourses      ?? '—', href: '/admin/courses'  },
    { label: 'Certificates Issued', value: stats?.certificatesIssued ?? '—', href: null              },
  ];

  return (
    <div className="p-4 sm:p-8 lg:p-12 max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-10">
        <p className="font-body text-sm text-[#6B7280] mb-1">Admin Dashboard</p>
        <h1 className="font-heading font-black text-3xl text-[#0F0F0F]">
          Welcome back, {user?.firstName}.
        </h1>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {statCards.map(({ label, value, href }) => {
          const card = (
            <div className={`bg-white rounded-xl border border-[#E5E7EB] px-6 py-5 ${href ? 'hover:border-[#3D006B]/30 transition-colors cursor-pointer' : ''}`}>
              <p className="font-body text-xs text-[#6B7280] uppercase tracking-widest mb-2">{label}</p>
              <p className="font-heading font-bold text-3xl text-[#0F0F0F]">{value}</p>
            </div>
          );
          return href
            ? <Link key={label} href={href}>{card}</Link>
            : <div key={label}>{card}</div>;
        })}
      </div>

      {/* Analytics */}
      <div className="mb-6">
        <h2 className="font-heading font-bold text-lg text-[#0F0F0F]">Learning Analytics</h2>
        <p className="font-body text-sm text-[#9CA3AF] mt-0.5">Last 12 months</p>
      </div>

      <div className="flex flex-col gap-4">

        {/* Enrollment trend */}
        <ChartCard title="Enrollments Over Time" subtitle="New enrollments vs completions per month">
          {trendLoading
            ? <ChartSkeleton />
            : !trend || trend.length === 0
              ? <ChartEmpty message="No enrollment data yet." />
              : <EnrollmentTrendChart data={trend} />
          }
        </ChartCard>

        {/* Top courses + retention */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          <div className="lg:col-span-2">
            <ChartCard title="Most Popular Courses" subtitle="Published courses ranked by enrollment">
              {coursesLoading
                ? <ChartSkeleton />
                : !courses || courses.length === 0
                  ? <ChartEmpty message="No published courses yet." />
                  : <TopCoursesChart data={courses} />
              }
            </ChartCard>
          </div>

          <ChartCard title="Student Retention" subtitle="Students who enrolled in 2+ courses">
            {retentionLoading
              ? <ChartSkeleton />
              : !retention
                ? <ChartEmpty message="No data yet." />
                : <RetentionCard {...retention} />
            }
          </ChartCard>

        </div>
      </div>

    </div>
  );
}

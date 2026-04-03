'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useAdminStats } from '@/hooks/queries/users';
import { useEnrollmentTrend, useTopCourses, useRetention, useDailyActiveLearners, useUsersOverTime, useCourseCompletionDuration } from '@/hooks/queries/analytics';
import { EnrollmentTrendChart } from './components/EnrollmentTrendChart';
import { TopCoursesChart } from './components/TopCoursesChart';
import { DailyActiveLearnersChart } from './components/DailyActiveLearnersChart';
import { UsersOverTimeChart } from './components/UsersOverTimeChart';
import { CourseCompletionChart } from './components/CourseCompletionChart';
import { MonthRangePicker, DayRangePicker } from '@/components/ui';
import type { RetentionStats } from '@/hooks/queries/analytics';

// ─── Chart card ───────────────────────────────────────────────────────────────

function ChartCard({ title, subtitle, action, children }: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] px-6 py-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="font-heading font-bold text-sm text-[#0F0F0F]">{title}</p>
          {subtitle && <p className="font-body text-xs text-[#9CA3AF] mt-0.5">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </div>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MIN_MONTH = '2026-03';

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function toIso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function todayIso() { return toIso(new Date()); }
function daysAgoIso(n: number) { const d = new Date(); d.setDate(d.getDate() - n); return toIso(d); }

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

function Ring({ rate, label }: { rate: number; label: string }) {
  const radius = 40;
  const circ = 2 * Math.PI * radius;
  const dash = (rate / 100) * circ;
  return (
    <div className="relative w-[100px] h-[100px] shrink-0">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#F3F4F6" strokeWidth="10" />
        <circle
          cx="50" cy="50" r={radius}
          fill="none" stroke="#3D006B" strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-heading font-black text-lg text-[#0F0F0F]">{rate}%</span>
        <span className="font-body text-[10px] text-[#9CA3AF] leading-tight text-center">{label}</span>
      </div>
    </div>
  );
}

function StatRow({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`flex items-center justify-between px-4 py-2.5 rounded-lg ${highlight ? 'bg-[#F3E8FF]' : 'bg-[#F9FAFB]'}`}>
      <span className={`font-body text-xs ${highlight ? 'text-[#3D006B]' : 'text-[#6B7280]'}`}>{label}</span>
      <span className={`font-heading font-bold text-sm ${highlight ? 'text-[#3D006B]' : 'text-[#0F0F0F]'}`}>{value}</span>
    </div>
  );
}

function RetentionCard({ registeredStudents, enrolledStudents, enrollmentRate, returningStudents, retentionRate }: RetentionStats) {
  return (
    <div className="flex flex-col gap-5 py-2">

      {/* Users → Enrollments */}
      <div>
        <p className="font-body text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">Users to Enrollments</p>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Ring rate={enrollmentRate} label="enrolled" />
          <div className="flex flex-col gap-2 w-full min-w-0">
            <StatRow label="Registered students" value={registeredStudents} />
            <StatRow label="Enrolled in at least 1 course" value={enrolledStudents} highlight />
          </div>
        </div>
      </div>

      <div className="border-t border-[#F3F4F6]" />

      {/* Retention */}
      <div>
        <p className="font-body text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">Retention</p>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Ring rate={retentionRate} label="retained" />
          <div className="flex flex-col gap-2 w-full min-w-0">
            <StatRow label="Enrolled in at least 1 course" value={enrolledStudents} />
            <StatRow label="Returned for 2nd course" value={returningStudents} highlight />
          </div>
        </div>
      </div>

    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data: stats } = useAdminStats();

  const [trendFrom, setTrendFrom] = useState(MIN_MONTH);
  const [trendTo,   setTrendTo  ] = useState(currentMonth);
  const [dalFrom,   setDalFrom  ] = useState(() => daysAgoIso(29));
  const [dalTo,     setDalTo    ] = useState(() => todayIso());
  const [uotFrom,   setUotFrom  ] = useState(() => daysAgoIso(29));
  const [uotTo,     setUotTo    ] = useState(() => todayIso());

  // Each chart fetches independently — they render as they resolve.
  const { data: trend,      isLoading: trendLoading      } = useEnrollmentTrend(trendFrom, trendTo);
  const { data: courses,    isLoading: coursesLoading    } = useTopCourses();
  const { data: retention,  isLoading: retentionLoading  } = useRetention();
  const { data: dal,        isLoading: dalLoading        } = useDailyActiveLearners(dalFrom, dalTo);
  const { data: uot,        isLoading: uotLoading        } = useUsersOverTime(uotFrom, uotTo);
  const { data: completion, isLoading: completionLoading } = useCourseCompletionDuration();

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
      </div>

      <div className="flex flex-col gap-4">

        {/* Users over time — primary full-width chart */}
        <ChartCard
          title="Users Over Time"
          subtitle="New student registrations per day"
          action={
            <DayRangePicker
              from={uotFrom}
              to={uotTo}
              onChange={(f, t) => { setUotFrom(f); setUotTo(t); }}
            />
          }
        >
          {uotLoading
            ? <ChartSkeleton />
            : !uot || uot.length === 0
              ? <ChartEmpty message="No registrations in this period." />
              : <UsersOverTimeChart data={uot} />
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

        {/* DAL + Enrollments over time */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          <ChartCard
            title="Daily Active Learners"
            subtitle="Distinct students who completed a module each day"
            action={
              <DayRangePicker
                from={dalFrom}
                to={dalTo}
                onChange={(f, t) => { setDalFrom(f); setDalTo(t); }}
              />
            }
          >
            {dalLoading
              ? <ChartSkeleton height={220} />
              : !dal || dal.length === 0
                ? <ChartEmpty height={220} message="No module activity in this period." />
                : <DailyActiveLearnersChart data={dal} />
            }
          </ChartCard>

          <ChartCard
            title="Enrollments Over Time"
            subtitle="New enrollments vs completions per month"
            action={
              <MonthRangePicker
                from={trendFrom}
                to={trendTo}
                onChange={(f, t) => { setTrendFrom(f); setTrendTo(t); }}
              />
            }
          >
            {trendLoading
              ? <ChartSkeleton height={220} />
              : !trend || trend.length === 0
                ? <ChartEmpty height={220} message="No enrollment data for this period." />
                : <EnrollmentTrendChart data={trend} />
            }
          </ChartCard>

        </div>

        {/* Course completion duration */}
        <ChartCard
          title="Courses by Avg Completion Time"
          subtitle="Published courses ranked fastest to slowest — days from enrollment to passing"
        >
          {completionLoading
            ? <ChartSkeleton />
            : !completion || completion.length === 0
              ? <ChartEmpty message="No courses with passing students yet." />
              : <CourseCompletionChart data={completion} />
          }
        </ChartCard>

      </div>

    </div>
  );
}

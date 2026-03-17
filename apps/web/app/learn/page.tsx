'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { ArrowRight } from 'lucide-react';
import { usePublishedCourses, useEnrollInCourse, useStudentStats, type CourseFilter, type PublishedCourse } from '@/hooks/queries/courses';
import { useProfile } from '@/hooks/queries/auth';
import { Button, PageLoader, Pagination, Input } from '@/components/ui';
import { CourseCard } from '@/components/CourseCard';
import { cn } from '@/lib/utils';

const LIMIT = 20;

const FILTERS: { label: string; value: CourseFilter }[] = [
  { label: 'All courses',   value: 'all'          },
  { label: 'Enrolled',      value: 'enrolled'      },
  { label: 'Not enrolled',  value: 'not_enrolled'  },
  { label: 'Completed',     value: 'passed'        },
];

function FilterPills({
  value,
  onChange,
}: {
  value: CourseFilter;
  onChange: (v: CourseFilter) => void;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {FILTERS.map((f) => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={cn(
            'font-body text-sm px-4 py-1.5 rounded-full border transition-all',
            value === f.value
              ? 'bg-[#3D006B] text-white border-[#3D006B]'
              : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#3D006B]/40 hover:text-[#3D006B]',
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}

function EnrollButton({ course }: { course: PublishedCourse }) {
  const { mutate: enroll, isPending } = useEnrollInCourse();
  return (
    <Button size="sm" variant="primary" loading={isPending} onClick={() => enroll(course.id)} className="w-full justify-between">
      Enroll Now <ArrowRight size={14} />
    </Button>
  );
}

function CourseFooter({ course, userId }: { course: PublishedCourse; userId?: string }) {
  if (course.enrollment_status === 'PASSED') {
    return (
      <Button size="sm" asChild className="w-full justify-between bg-green-600 hover:bg-green-700 text-white border-0">
        <Link href={`/certificates/${userId}/${course.slug}`} target="_blank" rel="noopener noreferrer">Go to Certificate <ArrowRight size={14} /></Link>
      </Button>
    );
  }
  if (course.enrollment_status === 'ENROLLED' || course.enrollment_status === 'PENDING') {
    return (
      <Button size="sm" variant="secondary" asChild className="w-full justify-between">
        <Link href={`/learn/courses/${course.slug}`}>Go to course <ArrowRight size={14} /></Link>
      </Button>
    );
  }
  return <EnrollButton course={course} />;
}

function EmptyState({ filter, search }: { filter: CourseFilter; search: string }) {
  if (search) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="w-16 h-16 rounded-full bg-[#F3F4F6] flex items-center justify-center mb-5">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <h3 className="font-heading font-bold text-lg text-[#0F0F0F] mb-2">No results for &ldquo;{search}&rdquo;</h3>
        <p className="font-body text-sm text-[#6B7280] max-w-xs">Try different keywords or clear your search.</p>
      </div>
    );
  }
  if (filter === 'enrolled') {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="w-16 h-16 rounded-full bg-[#F3E8FF] flex items-center justify-center mb-5">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3D006B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
        </div>
        <h3 className="font-heading font-bold text-lg text-[#0F0F0F] mb-2">Not enrolled yet</h3>
        <p className="font-body text-sm text-[#6B7280] max-w-xs">Browse all courses and enroll to start learning.</p>
      </div>
    );
  }
  if (filter === 'passed') {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="w-16 h-16 rounded-full bg-[#F3E8FF] flex items-center justify-center mb-5">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3D006B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
          </svg>
        </div>
        <h3 className="font-heading font-bold text-lg text-[#0F0F0F] mb-2">No completed courses yet</h3>
        <p className="font-body text-sm text-[#6B7280] max-w-xs">Complete all modules and pass the final quiz to finish a course.</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div className="w-16 h-16 rounded-full bg-[#F3E8FF] flex items-center justify-center mb-5">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3D006B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      </div>
      <h3 className="font-heading font-bold text-lg text-[#0F0F0F] mb-2">No courses yet</h3>
      <p className="font-body text-sm text-[#6B7280] max-w-xs">New courses will appear here once they&apos;re published.</p>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent?: string;
}

function StatCard({ label, value, icon, accent = '#3D006B' }: StatCardProps) {
  return (
    <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-[#E5E7EB]">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: `${accent}14` }}
      >
        <span style={{ color: accent }}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="font-heading font-black text-xl text-[#0F0F0F] leading-none">{value}</p>
        <p className="font-body text-xs text-[#9CA3AF] mt-0.5 leading-snug">{label}</p>
      </div>
    </div>
  );
}

function StudentSidebar() {
  const { data: stats } = useStudentStats();

  const completionRate = stats?.completionRate ?? 0;

  return (
    <aside className="w-full lg:w-64 xl:w-72 shrink-0 flex flex-col gap-3">

      <p className="font-heading font-bold text-xs tracking-widest uppercase text-[#9CA3AF]">My Progress</p>

      <StatCard
        label="Courses enrolled"
        value={stats?.enrolled ?? '—'}
        accent="#3D006B"
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
        }
      />

      <StatCard
        label="Courses completed"
        value={stats?.completed ?? '—'}
        accent="#059669"
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        }
      />

      <StatCard
        label="Modules finished"
        value={stats?.modulesFinished ?? '—'}
        accent="#3D006B"
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        }
      />

      <StatCard
        label="Certificates earned"
        value={stats?.completed ?? '—'}
        accent="#059669"
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="6" />
            <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
          </svg>
        }
      />

      {/* Completion rate */}
      <div className="p-4 bg-white rounded-xl border border-[#E5E7EB] mt-1">
        <div className="flex items-center justify-between mb-2">
          <p className="font-body text-xs text-[#6B7280]">Completion rate</p>
          <p className="font-heading font-black text-sm text-[#3D006B]">{completionRate}%</p>
        </div>
        <div className="h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
          <div className="h-full bg-[#3D006B] rounded-full transition-all duration-500" style={{ width: `${completionRate}%` }} />
        </div>
        <p className="font-body text-xs text-[#9CA3AF] mt-2">
          {stats ? `${stats.completed} of ${stats.total} courses completed` : '—'}
        </p>
      </div>

    </aside>
  );
}

export default function LearnPage() {
  const [page, setPage]     = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<CourseFilter>('all');
  const [, startTransition] = useTransition();

  const { data, isLoading, isError } = usePublishedCourses({ page, limit: LIMIT, search, filter });
  const { data: profile } = useProfile();
  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1;

  function handleSearch(value: string) {
    setSearch(value);
    startTransition(() => setPage(1));
  }

  function handleFilter(value: CourseFilter) {
    setFilter(value);
    startTransition(() => setPage(1));
  }

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-10 max-w-7xl mx-auto w-full">

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading font-black text-3xl text-[#0F0F0F]">All Courses</h1>
        <p className="font-body text-sm text-[#6B7280] mt-1">Browse and start learning at your own pace.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">

        {/* Main content */}
        <div className="flex-1 min-w-0">

          {/* Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
            <div className="relative sm:w-72">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <Input
                placeholder="Search courses..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <FilterPills value={filter} onChange={handleFilter} />
          </div>

          {/* Course grid */}
          {isLoading ? (
            <PageLoader type="cards" count={LIMIT} />
          ) : isError ? (
            <p className="font-body text-sm text-red-500 bg-red-50 px-4 py-3 rounded-lg">
              Failed to load courses. Please refresh.
            </p>
          ) : !data || data.courses.length === 0 ? (
            <EmptyState filter={filter} search={search} />
          ) : (
            <>
              <p className="font-body text-sm text-[#9CA3AF] mb-5">
                {data.total} course{data.total !== 1 ? 's' : ''}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {data.courses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    href={`/learn/courses/${course.slug}`}
                    footer={<CourseFooter course={course} userId={profile?.id} />}
                    locked={!course.enrollment_status}
                  />
                ))}
              </div>

              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}
        </div>

        {/* Stats sidebar */}
        <StudentSidebar />

      </div>
    </div>
  );
}

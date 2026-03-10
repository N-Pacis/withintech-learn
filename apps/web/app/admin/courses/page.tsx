'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import {
  useCourses,
  useDeleteCourse,
  usePublishCourse,
  useArchiveCourse,
  type Course,
  type CourseStatus,
} from '@/hooks/queries/courses';
import { Button, Badge, Tabs, PageLoader, type Tab } from '@/components/ui';

const LIMIT = 20;

type TabValue = 'draft' | 'published' | 'archived';

const TABS: Tab<TabValue>[] = [
  { label: 'Draft',     value: 'draft'     },
  { label: 'Published', value: 'published' },
  { label: 'Archived',  value: 'archived'  },
];

const STATUS_BADGE: Record<CourseStatus, { variant: 'gray' | 'success' | 'warning'; label: string }> = {
  draft:     { variant: 'gray',    label: 'Draft'     },
  published: { variant: 'success', label: 'Published' },
  archived:  { variant: 'warning', label: 'Archived'  },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function EmptyState({ tab }: { tab: TabValue }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-14 h-14 rounded-full bg-[#F3E8FF] flex items-center justify-center mb-5">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3D006B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      </div>
      {tab === 'draft' ? (
        <>
          <h3 className="font-heading font-bold text-lg text-[#0F0F0F] mb-2">No draft courses</h3>
          <p className="font-body text-sm text-[#6B7280] mb-6 max-w-xs">Create a course to get started.</p>
          <Button asChild size="md">
            <Link href="/admin/courses/new">Create your first course</Link>
          </Button>
        </>
      ) : tab === 'published' ? (
        <>
          <h3 className="font-heading font-bold text-lg text-[#0F0F0F] mb-2">No published courses</h3>
          <p className="font-body text-sm text-[#6B7280] max-w-xs">Publish a draft course to make it visible to students.</p>
        </>
      ) : (
        <>
          <h3 className="font-heading font-bold text-lg text-[#0F0F0F] mb-2">No archived courses</h3>
          <p className="font-body text-sm text-[#6B7280] max-w-xs">Archived courses are retired and no longer accessible to students.</p>
        </>
      )}
    </div>
  );
}

function CourseCard({ course, onDelete }: { course: Course; onDelete: (id: string) => void }) {
  const [confirming, setConfirming] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const { mutate: publish, isPending: publishing } = usePublishCourse();
  const { mutate: archive, isPending: archiving } = useArchiveCourse();

  const badge = STATUS_BADGE[course.status];

  return (
    <div className="group flex flex-col bg-white rounded-xl border border-[#E5E7EB] overflow-hidden hover:shadow-md hover:border-[#3D006B]/20 transition-all">

      {/* Thumbnail */}
      <Link href={`/admin/courses/${course.id}`} className="relative h-40 bg-[#F3F4F6] shrink-0 block">
        {course.thumbnailUrl ? (
          <Image src={course.thumbnailUrl} alt={course.title} fill className="object-cover" unoptimized />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <Badge variant={badge.variant}>{badge.label}</Badge>
        </div>
      </Link>

      {/* Body */}
      <Link href={`/admin/courses/${course.id}`} className="flex flex-col gap-1 p-4 flex-1">
        <p className="font-heading font-bold text-sm text-[#0F0F0F] line-clamp-2 leading-snug group-hover:text-[#3D006B] transition-colors">
          {course.title}
        </p>
        {course.description && (
          <p className="font-body text-xs text-[#6B7280] line-clamp-2 mt-0.5">{course.description}</p>
        )}
        <p className="font-body text-xs text-[#9CA3AF] mt-auto pt-3">Created {formatDate(course.createdAt)}</p>
      </Link>

      {/* Footer */}
      <div className="flex items-center gap-2 px-4 pb-4 flex-wrap">
        {course.status === 'draft' && (
          <>
            <Button variant="secondary" size="sm" asChild>
              <Link href={`/admin/courses/${course.id}/edit`}>Edit</Link>
            </Button>
            <Button variant="primary" size="sm" loading={publishing} onClick={() => publish(course.id)}>
              Publish
            </Button>
            <div className="ml-auto">
              {confirming ? (
                <div className="flex items-center gap-1.5">
                  <Button variant="danger" size="sm" onClick={() => onDelete(course.id)}>Confirm</Button>
                  <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>Cancel</Button>
                </div>
              ) : (
                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => setConfirming(true)}>
                  Delete
                </Button>
              )}
            </div>
          </>
        )}

        {course.status === 'published' && (
          <>
            <Button variant="secondary" size="sm" asChild>
              <Link href={`/admin/courses/${course.id}`}>View</Link>
            </Button>
            {confirmArchive ? (
              <div className="flex items-center gap-1.5">
                <Button variant="danger" size="sm" loading={archiving} onClick={() => { archive(course.id); setConfirmArchive(false); }}>
                  Archive
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirmArchive(false)}>Cancel</Button>
              </div>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setConfirmArchive(true)}>
                Archive
              </Button>
            )}
          </>
        )}

        {course.status === 'archived' && (
          <Button variant="secondary" size="sm" asChild>
            <Link href={`/admin/courses/${course.id}`}>View</Link>
          </Button>
        )}
      </div>
    </div>
  );
}

function CourseGrid({ tab }: { tab: TabValue }) {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useCourses({ page, limit: LIMIT, status: tab });
  const { mutate: deleteCourse } = useDeleteCourse();

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1;

  if (isLoading) return <PageLoader type="cards" count={LIMIT} />;
  if (isError) {
    return (
      <p className="font-body text-sm text-red-500 bg-red-50 px-4 py-3 rounded-lg">
        Failed to load courses. Please refresh.
      </p>
    );
  }
  if (!data || data.courses.length === 0) return <EmptyState tab={tab} />;

  return (
    <>
      <p className="font-body text-sm text-[#9CA3AF] mb-5">
        {data.total} course{data.total !== 1 ? 's' : ''}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {data.courses.map((course) => (
          <CourseCard key={course.id} course={course} onDelete={(id) => deleteCourse(id)} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8">
          <p className="font-body text-sm text-[#6B7280]">{data.total} total</p>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <span className="font-body text-sm text-[#6B7280] px-2">{page} / {totalPages}</span>
            <Button variant="secondary" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      )}
    </>
  );
}

export default function CoursesPage() {
  const [activeTab, setActiveTab] = useState<TabValue>('draft');

  return (
    <div className="p-8 lg:p-12 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-body text-sm text-[#6B7280] mb-1">Admin</p>
          <h1 className="font-heading font-black text-3xl text-[#0F0F0F]">Courses</h1>
        </div>
        <Button asChild size="md">
          <Link href="/admin/courses/new">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Course
          </Link>
        </Button>
      </div>

      <Tabs tabs={TABS} value={activeTab} onChange={(v) => setActiveTab(v)} className="mb-6" />

      <CourseGrid key={activeTab} tab={activeTab} />
    </div>
  );
}

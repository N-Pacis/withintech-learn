'use client';

import { useState, useEffect, useRef } from 'react';
import { useEnrollments, useEnrollmentProgress, type Enrollment } from '@/hooks/queries/enrollments';
import { PageLoader } from '@/components/ui';

// ─── Progress popup ───────────────────────────────────────────────────────────

function ProgressPopup({
  enrollmentId,
  onClose,
}: {
  enrollmentId: string;
  onClose: () => void;
}) {
  const { data, isLoading } = useEnrollmentProgress(enrollmentId);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={ref}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <div>
            {data ? (
              <>
                <p className="font-heading font-bold text-base text-[#0F0F0F]">{data.studentName}</p>
                <p className="font-body text-xs text-[#9CA3AF] mt-0.5">{data.courseTitle}</p>
              </>
            ) : (
              <p className="font-heading font-bold text-base text-[#0F0F0F]">Module Progress</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#374151] hover:bg-[#F3F4F6] transition-colors"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-5 h-5 rounded-full border-2 border-[#3D006B] border-t-transparent animate-spin" />
            </div>
          ) : !data ? (
            <p className="font-body text-sm text-[#9CA3AF] text-center py-10">Failed to load progress.</p>
          ) : (
            <>
              {/* Summary */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#F3E8FF] border border-[#E9D5FF] mb-4">
                <div className="text-center">
                  <p className="font-heading font-black text-2xl text-[#3D006B]">{data.completedModules}</p>
                  <p className="font-body text-xs text-[#6B7280]">of {data.totalModules}</p>
                </div>
                <div className="flex-1 h-2 rounded-full bg-[#E9D5FF] overflow-hidden">
                  <div
                    className="h-full bg-[#3D006B] rounded-full transition-all"
                    style={{ width: data.totalModules > 0 ? `${(data.completedModules / data.totalModules) * 100}%` : '0%' }}
                  />
                </div>
                <p className="font-body text-sm font-semibold text-[#3D006B]">
                  {data.totalModules > 0 ? Math.round((data.completedModules / data.totalModules) * 100) : 0}%
                </p>
              </div>

              {/* Module list */}
              <div className="flex flex-col gap-1">
                {data.modules.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#F9FAFB]">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${m.completed ? 'bg-[#3D006B]' : 'border-2 border-[#D1D5DB]'}`}>
                      {m.completed && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <span className={`font-body text-sm flex-1 ${m.completed ? 'text-[#374151]' : 'text-[#9CA3AF]'}`}>
                      {m.orderIndex}. {m.title}
                    </span>
                    {m.completed && (
                      <span className="font-body text-xs text-[#3D006B] font-medium">Done</span>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── 3-dot menu ───────────────────────────────────────────────────────────────

function ThreeDotsButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#374151] hover:bg-[#F3F4F6] transition-colors"
      aria-label="View progress"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
      </svg>
    </button>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Enrollment['status'] }) {
  return status === 'completed' ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
      Completed
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F3E8FF] text-[#3D006B] border border-[#E9D5FF]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#3D006B]" />
      In Progress
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EnrollmentsPage() {
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [debouncedCourse, setDebouncedCourse] = useState('');
  const [activeEnrollmentId, setActiveEnrollmentId] = useState<string | null>(null);

  // Debounce filters
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedCourse(courseFilter), 300);
    return () => clearTimeout(t);
  }, [courseFilter]);

  const { data: enrollments, isLoading } = useEnrollments({
    search: debouncedSearch || undefined,
    course: debouncedCourse || undefined,
  });

  return (
    <div className="p-4 sm:p-8 lg:p-12">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="font-heading font-black text-2xl sm:text-3xl text-[#0F0F0F]">Enrollments</h1>
        <p className="font-body text-sm text-[#6B7280] mt-1">Track student progress across all courses.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by student name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-[#E5E7EB] rounded-lg font-body text-sm text-[#374151] placeholder-[#9CA3AF] focus:outline-none focus:border-[#3D006B] focus:ring-2 focus:ring-[#3D006B]/10 transition-all"
          />
        </div>
        <div className="relative sm:w-64">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          <input
            type="text"
            placeholder="Filter by course…"
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-[#E5E7EB] rounded-lg font-body text-sm text-[#374151] placeholder-[#9CA3AF] focus:outline-none focus:border-[#3D006B] focus:ring-2 focus:ring-[#3D006B]/10 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <PageLoader type="content" />
      ) : (
        <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px]">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                  <th className="px-5 py-3 text-left font-body text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Student</th>
                  <th className="px-5 py-3 text-left font-body text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Course</th>
                  <th className="px-5 py-3 text-left font-body text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Enrolled</th>
                  <th className="px-5 py-3 text-left font-body text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {!enrollments || enrollments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center font-body text-sm text-[#9CA3AF]">
                      No enrollments found.
                    </td>
                  </tr>
                ) : (
                  enrollments.map((e) => (
                    <tr key={e.id} className="hover:bg-[#FAFAFA] transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-body text-sm font-medium text-[#0F0F0F]">{e.studentName}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-body text-sm text-[#374151]">{e.courseTitle}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-body text-sm text-[#6B7280]">
                          {new Date(e.enrolledAt).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'short', day: 'numeric',
                          })}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={e.status} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <ThreeDotsButton onClick={() => setActiveEnrollmentId(e.id)} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {enrollments && enrollments.length > 0 && (
            <div className="px-5 py-3 border-t border-[#F3F4F6] bg-[#F9FAFB]">
              <p className="font-body text-xs text-[#9CA3AF]">{enrollments.length} enrollment{enrollments.length !== 1 ? 's' : ''}</p>
            </div>
          )}
        </div>
      )}

      {/* Progress popup */}
      {activeEnrollmentId && (
        <ProgressPopup
          enrollmentId={activeEnrollmentId}
          onClose={() => setActiveEnrollmentId(null)}
        />
      )}
    </div>
  );
}

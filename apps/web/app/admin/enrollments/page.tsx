"use client";

import { useState, useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";
import {
  useEnrollments,
  useEnrollmentProgress,
  type Enrollment,
} from "@/hooks/queries/enrollments";
import { useCourses } from "@/hooks/queries/courses";
import { PageLoader, Table, Select } from "@/components/ui";
import type { Column, CellValue } from "@/components/ui";
import { useDebounce } from "@/hooks/useDebounce";

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
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        className="bg-surface-card rounded-2xl border border-border shadow-xl w-full max-w-md max-h-[80vh] flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            {data ? (
              <>
                <p className="font-heading font-bold text-base text-foreground">
                  {data.studentName}
                </p>
                <p className="font-body text-xs text-muted-contrast mt-0.5">
                  {data.courseTitle}
                </p>
              </>
            ) : (
              <p className="font-heading font-bold text-base text-foreground">
                Module Progress
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-contrast hover:text-foreground-soft hover:bg-surface-muted transition-colors"
            aria-label="Close"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : !data ? (
            <p className="font-body text-sm text-muted-contrast text-center py-10">
              Failed to load progress.
            </p>
          ) : (
            <>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary-soft border border-primary-pale mb-4">
                <div className="text-center">
                  <p className="font-heading font-black text-2xl text-primary">
                    {data.completedModules}
                  </p>
                  <p className="font-body text-xs text-muted">
                    of {data.totalModules}
                  </p>
                </div>
                <div className="flex-1 h-2 rounded-full bg-primary-pale overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{
                      width:
                        data.totalModules > 0
                          ? `${(data.completedModules / data.totalModules) * 100}%`
                          : "0%",
                    }}
                  />
                </div>
                <p className="font-body text-sm font-semibold text-primary">
                  {data.totalModules > 0
                    ? Math.round(
                        (data.completedModules / data.totalModules) * 100,
                      )
                    : 0}
                  %
                </p>
              </div>

              <div className="flex flex-col gap-1">
                {data.modules.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-panel"
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${m.completed ? "bg-primary" : "border-2 border-border-strong"}`}
                    >
                      {m.completed && (
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <span
                      className={`font-body text-sm flex-1 ${m.completed ? "text-foreground-soft" : "text-muted-contrast"}`}
                    >
                      {m.orderIndex}. {m.title}
                    </span>
                    {m.completed && (
                      <span className="font-body text-xs text-muted-contrast">
                        {m.completedAt
                          ? new Date(m.completedAt).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Done"}
                      </span>
                    )}
                  </div>
                ))}

                {data.finalQuiz && (
                  <>
                    <div className="my-2 border-t border-dashed border-border" />
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-panel">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${data.finalQuiz.passed ? "bg-primary" : "border-2 border-border-strong"}`}
                      >
                        {data.finalQuiz.passed && (
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                      <span
                        className={`font-body text-sm flex-1 ${data.finalQuiz.passed ? "text-foreground-soft" : "text-muted-contrast"}`}
                      >
                        {data.finalQuiz.title}
                      </span>
                      {data.finalQuiz.passed && data.finalQuiz.passedAt ? (
                        <span className="font-body text-xs text-muted-contrast">
                          {new Date(data.finalQuiz.passedAt).toLocaleString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                      ) : (
                        <span
                          className={`font-body text-xs font-medium px-2 py-0.5 rounded-full ${data.finalQuiz.passed ? "bg-green-50 text-green-700 dark:bg-green-600 dark:text-white" : "bg-surface-muted text-muted-contrast"}`}
                        >
                          {data.finalQuiz.passed ? "Passed" : "Not passed"}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* ── Attempts worth a second look ──
                  The counts come from the student's browser, so they are a
                  reason to look, never proof. Shown only when there is
                  something to show. */}
              {data.flaggedAttempts.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle
                      size={14}
                      className="text-amber-600 dark:text-amber-400 shrink-0"
                    />
                    <h3 className="font-heading font-bold text-sm text-foreground">
                      Attempts worth a second look
                    </h3>
                  </div>
                  <p className="font-body text-xs text-muted-contrast mb-3">
                    Reported by the student&apos;s browser. Treat it as a reason
                    to check, not as proof.
                  </p>
                  <div className="flex flex-col gap-1">
                    {data.flaggedAttempts.map((a) => (
                      <div
                        key={a.id}
                        className="flex flex-wrap items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-surface-panel"
                      >
                        <span className="font-body text-sm text-foreground-soft flex-1 min-w-0 truncate">
                          {a.quizTitle}
                        </span>
                        <span className="font-body text-xs text-muted-contrast">
                          {new Date(a.createdAt).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className="font-body text-xs font-medium px-2 py-0.5 rounded-full bg-surface-muted text-muted-contrast">
                          {a.score}%
                        </span>
                        {a.timedOut && (
                          <span className="font-body text-xs font-medium px-2 py-0.5 rounded-full bg-surface-muted text-muted-contrast">
                            Ran out of time
                          </span>
                        )}
                        {a.warningCount > 0 && (
                          <span className="font-body text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                            {a.warningCount} warning
                            {a.warningCount === 1 ? "" : "s"}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Enrollment["status"] }) {
  return status === "completed" ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 dark:bg-green-600 dark:text-white border border-green-200 dark:border-green-600">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-white/90" />
      Completed
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary-soft text-primary border border-primary-pale">
      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
      In Progress
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const columns: Column[] = [
  { key: "student", header: "Student" },
  { key: "course", header: "Course" },
  { key: "enrolled", header: "Enrolled" },
  { key: "status", header: "Status" },
  { key: "actions", header: "" },
];

const PAGE_SIZE = 20;

export default function EnrollmentsPage() {
  const [search, setSearch] = useState("");
  const [courseId, setCourseId] = useState("");
  const [page, setPage] = useState(1);
  const [activeEnrollmentId, setActiveEnrollmentId] = useState<string | null>(
    null,
  );

  const debouncedSearch = useDebounce(search.trim(), 350);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, courseId]);

  const { data: coursesPage, isLoading: coursesLoading } = useCourses({
    page: 1,
    limit: 100,
  });
  const { data: enrollmentsPage, isLoading } = useEnrollments({
    search: debouncedSearch || undefined,
    courseId: courseId || undefined,
    page,
    limit: PAGE_SIZE,
  });
  const enrollments = enrollmentsPage?.enrollments;
  const totalPages = enrollmentsPage
    ? Math.ceil(enrollmentsPage.total / PAGE_SIZE)
    : 1;

  function buildRow(e: Enrollment): Record<string, CellValue> {
    return {
      id: e.id,
      student: (
        <p className="font-body text-sm font-medium text-foreground">
          {e.studentName}
        </p>
      ),
      course: (
        <p className="font-body text-sm text-foreground-soft">
          {e.courseTitle}
        </p>
      ),
      enrolled: (
        <span className="font-body text-sm text-muted">
          {new Date(e.enrolledAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      ),
      status: <StatusBadge status={e.status} />,
      actions: (
        <button
          onClick={() => setActiveEnrollmentId(e.id)}
          className="p-1.5 rounded-lg text-muted-contrast hover:text-foreground-soft hover:bg-surface-muted transition-colors"
          aria-label="View progress"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="19" r="1.5" />
          </svg>
        </button>
      ),
    };
  }

  return (
    <div className="p-4 sm:p-8 lg:p-12">
      <div className="mb-6 sm:mb-8">
        <h1 className="font-heading font-black text-2xl sm:text-3xl text-foreground">
          Enrollments
        </h1>
        <p className="font-body text-sm text-muted mt-1">
          Track student progress across all courses.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-contrast"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by student name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-border rounded-lg font-body text-sm text-foreground-soft placeholder:text-muted-contrast focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
          />
        </div>
        <Select
          isClearable
          placeholder="All courses"
          options={
            coursesPage?.courses.map((c) => ({
              value: c.id,
              label: c.title,
            })) ?? []
          }
          value={courseId}
          onChange={setCourseId}
          isLoading={coursesLoading}
          className="sm:w-64"
        />
      </div>

      {isLoading && <PageLoader type="content" />}

      {!isLoading && enrollments?.length === 0 && (
        <div className="text-center py-16">
          <p className="font-body text-muted">No enrollments found.</p>
        </div>
      )}

      {enrollments && enrollments.length > 0 && (
        <Table
          columns={columns}
          rows={enrollments.map(buildRow)}
          rowKey={(row) => row.id as string}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}

      {activeEnrollmentId && (
        <ProgressPopup
          enrollmentId={activeEnrollmentId}
          onClose={() => setActiveEnrollmentId(null)}
        />
      )}
    </div>
  );
}

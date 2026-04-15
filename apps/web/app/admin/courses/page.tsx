"use client";

import Link from "next/link";
import { useState } from "react";
import {
  useCourses,
  useDeleteCourse,
  usePublishCourse,
  useArchiveCourse,
  useUnarchiveCourse,
  type Course,
  type CourseStatus,
} from "@/hooks/queries/courses";
import {
  Button,
  Tabs,
  PageLoader,
  Pagination,
  type Tab,
} from "@/components/ui";
import { CourseCard } from "@/components/CourseCard";

function PublishConfirmModal({
  onConfirm,
  onCancel,
  loading,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-surface-card rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center shrink-0">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-amber-600 dark:text-amber-300"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div>
            <h2 className="font-heading font-bold text-lg text-foreground mb-1">
              Publish this course?
            </h2>
            <p className="font-body text-sm text-muted leading-relaxed">
              Once published, this course will be visible to students and{" "}
              <span className="font-semibold text-foreground">
                cannot be edited
              </span>
              . Quizzes, modules, and content will be locked. You can archive it
              later, but not unpublish.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3">
          <Button
            variant="secondary"
            size="md"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            loading={loading}
            onClick={onConfirm}
          >
            Publish
          </Button>
        </div>
      </div>
    </div>
  );
}

const LIMIT = 20;

type TabValue = "draft" | "published" | "archived";

const STATUS_BADGE: Record<
  CourseStatus,
  { variant: "gray" | "success" | "warning"; label: string }
> = {
  draft: { variant: "gray", label: "Draft" },
  published: { variant: "success", label: "Published" },
  archived: { variant: "warning", label: "Archived" },
};

function EmptyState({ tab }: { tab: TabValue }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-14 h-14 rounded-full bg-primary-soft flex items-center justify-center mb-5">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#3D006B"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      </div>
      {tab === "draft" ? (
        <>
          <h3 className="font-heading font-bold text-lg text-foreground mb-2">
            No draft courses
          </h3>
          <p className="font-body text-sm text-muted mb-6 max-w-xs">
            Create a course to get started.
          </p>
          <Button asChild size="md">
            <Link href="/admin/courses/new">Create your first course</Link>
          </Button>
        </>
      ) : tab === "published" ? (
        <>
          <h3 className="font-heading font-bold text-lg text-foreground mb-2">
            No published courses
          </h3>
          <p className="font-body text-sm text-muted max-w-xs">
            Publish a draft course to make it visible to students.
          </p>
        </>
      ) : (
        <>
          <h3 className="font-heading font-bold text-lg text-foreground mb-2">
            No archived courses
          </h3>
          <p className="font-body text-sm text-muted max-w-xs">
            Archived courses are retired and no longer accessible to students.
          </p>
        </>
      )}
    </div>
  );
}

function CourseActions({
  course,
  onDelete,
}: {
  course: Course;
  onDelete: (id: string) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [confirmPublish, setConfirmPublish] = useState(false);
  const { mutate: publish, isPending: publishing } = usePublishCourse();
  const { mutate: archive, isPending: archiving } = useArchiveCourse();
  const { mutate: unarchive, isPending: unarchiving } = useUnarchiveCourse();

  if (course.status === "draft")
    return (
      <>
        {confirmPublish && (
          <PublishConfirmModal
            loading={publishing}
            onConfirm={() =>
              publish(course.id, { onSettled: () => setConfirmPublish(false) })
            }
            onCancel={() => setConfirmPublish(false)}
          />
        )}
        <Button variant="secondary" size="sm" asChild>
          <Link href={`/admin/courses/${course.id}/edit`}>Edit</Link>
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setConfirmPublish(true)}
        >
          Publish
        </Button>
        <div className="ml-auto">
          {confirming ? (
            <div className="flex items-center gap-1.5">
              <Button
                variant="danger"
                size="sm"
                onClick={() => onDelete(course.id)}
              >
                Confirm
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirming(false)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => setConfirming(true)}
            >
              Delete
            </Button>
          )}
        </div>
      </>
    );

  if (course.status === "published")
    return (
      <>
        <Button variant="secondary" size="sm" asChild>
          <Link href={`/admin/courses/${course.id}`}>View</Link>
        </Button>
        {confirmArchive ? (
          <div className="flex items-center gap-1.5">
            <Button
              variant="danger"
              size="sm"
              loading={archiving}
              onClick={() => {
                archive(course.id);
                setConfirmArchive(false);
              }}
            >
              Archive
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmArchive(false)}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirmArchive(true)}
          >
            Archive
          </Button>
        )}
      </>
    );

  return (
    <>
      <Button variant="secondary" size="sm" asChild>
        <Link href={`/admin/courses/${course.id}`}>View</Link>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        loading={unarchiving}
        onClick={() => unarchive(course.id)}
      >
        Unarchive
      </Button>
    </>
  );
}

function CourseGrid({ tab }: { tab: TabValue }) {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useCourses({
    page,
    limit: LIMIT,
    status: tab,
  });
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

  const badge = STATUS_BADGE[tab];

  return (
    <>
      <p className="font-body text-sm text-muted-contrast mb-5">
        {data.total} course{data.total !== 1 ? "s" : ""}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {data.courses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            href={`/admin/courses/${course.id}`}
            badge={badge}
            footer={
              <CourseActions
                course={course}
                onDelete={(id) => deleteCourse(id)}
              />
            }
          />
        ))}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </>
  );
}

function useTabCounts() {
  const draft = useCourses({ page: 1, limit: 1, status: "draft" });
  const published = useCourses({ page: 1, limit: 1, status: "published" });
  const archived = useCourses({ page: 1, limit: 1, status: "archived" });
  return {
    draft: draft.data?.total,
    published: published.data?.total,
    archived: archived.data?.total,
  };
}

export default function CoursesPage() {
  const [activeTab, setActiveTab] = useState<TabValue>("draft");
  const counts = useTabCounts();

  const tabs: Tab<TabValue>[] = [
    { label: "Draft", value: "draft", count: counts.draft },
    { label: "Published", value: "published", count: counts.published },
    { label: "Archived", value: "archived", count: counts.archived },
  ];

  return (
    <div className="p-4 sm:p-8 lg:p-12 max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <p className="font-body text-sm text-muted mb-1">Admin</p>
          <h1 className="font-heading font-black text-3xl text-foreground">
            Courses
          </h1>
        </div>
        <Button asChild size="md">
          <Link href="/admin/courses/new">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Course
          </Link>
        </Button>
      </div>

      <Tabs
        tabs={tabs}
        value={activeTab}
        onChange={(v) => setActiveTab(v)}
        className="mb-6"
      />

      <CourseGrid key={activeTab} tab={activeTab} />
    </div>
  );
}

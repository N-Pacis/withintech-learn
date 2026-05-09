"use client";

import Link from "next/link";
import { useState, useTransition, type ReactNode } from "react";
import {
  ArrowRight,
  Award,
  BookOpen,
  Check,
  LayoutGrid,
  Search,
  Trophy,
} from "lucide-react";
import {
  usePublishedCourses,
  useEnrollInCourse,
  useStudentStats,
  type CourseFilter,
  type PublishedCourse,
} from "@/hooks/queries/courses";
import { useProfile } from "@/hooks/queries/auth";
import { Button, PageLoader, Pagination, Input } from "@/components/ui";
import { CourseCard } from "@/components/CourseCard";
import { cn } from "@/lib/utils";

const LIMIT = 20;

const FILTERS: { label: string; value: CourseFilter }[] = [
  { label: "All courses", value: "all" },
  { label: "Enrolled", value: "enrolled" },
  { label: "Not enrolled", value: "not_enrolled" },
  { label: "Completed", value: "passed" },
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
            "font-body text-sm px-4 py-1.5 rounded-full border transition-all",
            value === f.value
              ? "bg-primary text-white border-primary"
              : "bg-surface-card text-muted border-border hover:border-primary/40 hover:text-primary",
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}

function FreeEnrollButton({ course }: { course: PublishedCourse }) {
  const { mutate: enroll, isPending } = useEnrollInCourse();
  return (
    <Button
      size="sm"
      variant="primary"
      loading={isPending}
      onClick={() => enroll(course.id)}
      className="w-full justify-between"
    >
      Enroll Now <ArrowRight size={14} />
    </Button>
  );
}

function CourseFooter({
  course,
  userId,
}: {
  course: PublishedCourse;
  userId?: string;
}) {
  if (course.enrollment_status === "PASSED") {
    // PAID_CERTIFICATE course completed but certificate not yet paid for
    if (course.accessType === "PAID_CERTIFICATE" && !course.has_certificate) {
      return (
        <Button
          size="sm"
          variant="primary"
          asChild
          className="w-full justify-between"
        >
          <Link href={`/learn/courses/${course.slug}/checkout?type=certificate`}>
            Pay RWF {course.certificatePrice?.toLocaleString()} for Certificate <ArrowRight size={14} />
          </Link>
        </Button>
      );
    }

    return (
      <Button
        size="sm"
        asChild
        className="w-full justify-between bg-green-600 hover:bg-green-700 text-white border-0"
      >
        <Link
          href={`/certificates/${userId}/${course.slug}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Go to Certificate <ArrowRight size={14} />
        </Link>
      </Button>
    );
  }
  if (
    course.enrollment_status === "ENROLLED" ||
    course.enrollment_status === "PENDING"
  ) {
    return (
      <Button
        size="sm"
        variant="secondary"
        asChild
        className="w-full justify-between"
      >
        <Link href={`/learn/courses/${course.slug}`}>
          Go to course <ArrowRight size={14} />
        </Link>
      </Button>
    );
  }

  if (course.accessType === "PAID_COURSE") {
    return (
      <Button
        size="sm"
        variant="primary"
        asChild
        className="w-full justify-between"
      >
        <Link href={`/learn/courses/${course.slug}/checkout?type=course`}>
          Buy Access · RWF {course.price?.toLocaleString()} <ArrowRight size={14} />
        </Link>
      </Button>
    );
  }

  if (course.accessType === "PAID_CERTIFICATE") {
    return (
      <div className="flex flex-col gap-2">
        <FreeEnrollButton course={course} />
        <p className="font-body text-xs text-muted text-center">
          Certificate: RWF {course.certificatePrice?.toLocaleString()}
        </p>
      </div>
    );
  }

  return <FreeEnrollButton course={course} />;
}

function EmptyState({
  filter,
  search,
}: {
  filter: CourseFilter;
  search: string;
}) {
  if (search) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="w-16 h-16 rounded-full bg-surface-muted flex items-center justify-center mb-5">
          <Search size={24} className="text-muted-contrast" />
        </div>
        <h3 className="font-heading font-bold text-lg text-foreground mb-2">
          No results for &ldquo;{search}&rdquo;
        </h3>
        <p className="font-body text-sm text-muted max-w-xs">
          Try different keywords or clear your search.
        </p>
      </div>
    );
  }
  if (filter === "enrolled") {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="w-16 h-16 rounded-full bg-primary-soft flex items-center justify-center mb-5">
          <BookOpen size={28} className="text-primary" />
        </div>
        <h3 className="font-heading font-bold text-lg text-foreground mb-2">
          Not enrolled yet
        </h3>
        <p className="font-body text-sm text-muted max-w-xs">
          Browse all courses and enroll to start learning.
        </p>
      </div>
    );
  }
  if (filter === "passed") {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="w-16 h-16 rounded-full bg-primary-soft flex items-center justify-center mb-5">
          <Trophy size={28} className="text-primary" />
        </div>
        <h3 className="font-heading font-bold text-lg text-foreground mb-2">
          No completed courses yet
        </h3>
        <p className="font-body text-sm text-muted max-w-xs">
          Complete all modules and pass the final quiz to finish a course.
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div className="w-16 h-16 rounded-full bg-primary-soft flex items-center justify-center mb-5">
        <BookOpen size={28} className="text-primary" />
      </div>
      <h3 className="font-heading font-bold text-lg text-foreground mb-2">
        No courses yet
      </h3>
      <p className="font-body text-sm text-muted max-w-xs">
        New courses will appear here once they&apos;re published.
      </p>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  iconClassName?: string;
  iconBgClassName?: string;
}

function StatCard({
  label,
  value,
  icon,
  iconClassName = "text-primary",
  iconBgClassName = "bg-primary-soft",
}: StatCardProps) {
  return (
    <div className="flex items-center gap-3 p-4 bg-surface-card rounded-xl border border-border">
      <div
        className={cn(
          "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
          iconBgClassName,
        )}
      >
        <span className={iconClassName}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="font-heading font-black text-xl text-foreground leading-none">
          {value}
        </p>
        <p className="font-body text-xs text-muted-contrast mt-0.5 leading-snug">
          {label}
        </p>
      </div>
    </div>
  );
}

function StudentSidebar() {
  const { data: stats } = useStudentStats();

  const completionRate = stats?.completionRate ?? 0;

  return (
    <aside className="w-full lg:w-64 xl:w-72 shrink-0 flex flex-col gap-3 lg:sticky lg:top-6 lg:self-start">
      <p className="font-heading font-bold text-xs tracking-widest uppercase text-muted-contrast">
        My Progress
      </p>

      <StatCard
        label="Courses enrolled"
        value={stats?.enrolled ?? "—"}
        icon={<BookOpen size={16} />}
      />

      <StatCard
        label="Courses completed"
        value={stats?.completed ?? "—"}
        icon={<Check size={16} />}
        iconClassName="text-success-dark"
        iconBgClassName="bg-success-soft"
      />

      <StatCard
        label="Modules finished"
        value={stats?.modulesFinished ?? "—"}
        icon={<LayoutGrid size={16} />}
      />

      <StatCard
        label="Certificates earned"
        value={stats?.completed ?? "—"}
        icon={<Award size={16} />}
        iconClassName="text-success-dark"
        iconBgClassName="bg-success-soft"
      />

      {/* Completion rate */}
      <div className="p-4 bg-surface-card rounded-xl border border-border mt-1">
        <div className="flex items-center justify-between mb-2">
          <p className="font-body text-xs text-muted">Completion rate</p>
          <p className="font-heading font-black text-sm text-primary">
            {completionRate}%
          </p>
        </div>
        <div className="h-1.5 bg-surface-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
        <p className="font-body text-xs text-muted-contrast mt-2">
          {stats
            ? `${stats.completed} of ${stats.total} courses completed`
            : "—"}
        </p>
      </div>
    </aside>
  );
}

export default function LearnPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<CourseFilter>("all");
  const [, startTransition] = useTransition();

  const { data, isLoading, isError } = usePublishedCourses({
    page,
    limit: LIMIT,
    search,
    filter,
  });
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
        <h1 className="font-heading font-black text-3xl text-foreground">
          All Courses
        </h1>
        <p className="font-body text-sm text-muted mt-1">
          Browse and start learning at your own pace.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
            <div className="relative sm:w-72">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-contrast"
              />
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
              <p className="font-body text-sm text-muted-contrast mb-5">
                {data.total} course{data.total !== 1 ? "s" : ""}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {data.courses.map((course) => {
                  const enrolled = !!course.enrollment_status;
                  const isPaidCourse = course.accessType === "PAID_COURSE";
                  const isPaidCert = course.accessType === "PAID_CERTIFICATE";

                  const href = enrolled
                    ? `/learn/courses/${course.slug}`
                    : isPaidCourse
                      ? `/learn/courses/${course.slug}/checkout?type=course`
                      : `/learn/courses/${course.slug}`;

                  const locked = !enrolled && !isPaidCourse;

                  const badge = enrolled
                    ? undefined
                    : isPaidCourse
                      ? { variant: "orange" as const, label: `RWF ${course.price?.toLocaleString()}` }
                      : isPaidCert
                        ? { variant: "purple" as const, label: `Cert · RWF ${course.certificatePrice?.toLocaleString()}` }
                        : { variant: "success" as const, label: "Free" };

                  return (
                    <CourseCard
                      key={course.id}
                      course={course}
                      href={href}
                      badge={badge}
                      footer={
                        <CourseFooter course={course} userId={profile?.id} />
                      }
                      locked={locked}
                    />
                  );
                })}
              </div>

              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </>
          )}
        </div>

        {/* Stats sidebar */}
        <StudentSidebar />
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { Button, Badge } from "@/components/ui";
import { type Course, type CourseStatus } from "@/hooks/queries/courses";

const STATUS_BADGE: Record<
  CourseStatus,
  { variant: "gray" | "success" | "warning"; label: string }
> = {
  draft: { variant: "gray", label: "Draft" },
  published: { variant: "success", label: "Published" },
  archived: { variant: "warning", label: "Archived" },
};

export function CourseHeader({
  course,
  courseId,
}: {
  course: Course;
  courseId: string;
}) {
  const badge = STATUS_BADGE[course.status];
  const isDraft = course.status === "draft";
  const isArchived = course.status === "archived";

  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2">
          <Badge variant={badge.variant} size="sm">
            {badge.label}
          </Badge>
        </div>
        <h1 className="font-heading font-black text-3xl text-foreground leading-tight">
          {course.title}
        </h1>
        {course.description && (
          <p className="font-body text-sm text-muted mt-3 leading-relaxed">
            {course.description}
          </p>
        )}
      </div>

      {isDraft && (
        <Button variant="secondary" size="sm" asChild className="shrink-0 mt-1">
          <Link href={`/admin/courses/${courseId}/edit`}>
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit Course
          </Link>
        </Button>
      )}

      {isArchived && (
        <div className="shrink-0 mt-1 px-3 py-1.5 bg-warning-soft border border-warning/20 rounded-lg">
          <p className="font-body text-xs text-warning-dark">
            This course is archived
          </p>
        </div>
      )}
    </div>
  );
}

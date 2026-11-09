"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useTopCourses, type TopCourse } from "@/hooks/queries/courses";
import { Badge, Button } from "@/components/ui";

// ─── Gradient covers ──────────────────────────────────────────────────────────

const GRADIENTS = [
  ["#3D006B", "#7C3AED"],
  ["#0F172A", "#1E40AF"],
  ["#064E3B", "#059669"],
];

function titleHash(title: string) {
  let h = 0;
  for (let i = 0; i < title.length; i++)
    h = (h * 31 + title.charCodeAt(i)) >>> 0;
  return h % GRADIENTS.length;
}

function tagBadge(tag: TopCourse["tag"]) {
  if (tag === "popular")
    return { variant: "orange" as const, label: "Popular" };
  if (tag === "new") return { variant: "success" as const, label: "New" };
  return undefined;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="bg-surface-card rounded-2xl border border-border overflow-hidden animate-pulse">
      <div className="h-44 bg-surface-muted" />
      <div className="p-5 flex flex-col gap-3">
        <div className="h-5 w-3/4 bg-border rounded-md" />
        <div className="h-3 bg-border rounded w-full" />
        <div className="h-3 bg-border rounded w-5/6" />
      </div>
    </div>
  );
}

// ─── Course card ──────────────────────────────────────────────────────────────

function CourseCard({ course }: { course: TopCourse }) {
  const badge = tagBadge(course.tag);
  const [from, to] = GRADIENTS[titleHash(course.title)];

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group bg-surface-card rounded-2xl border border-border overflow-hidden hover:border-primary/40 hover:shadow-md transition-all duration-200 flex flex-col"
    >
      <div className="relative h-44 bg-surface-muted shrink-0">
        {course.thumbnailUrl ? (
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center px-5"
            style={{
              background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
            }}
          >
            <p className="font-heading font-black text-white text-center leading-tight text-sm line-clamp-3">
              {course.title}
            </p>
          </div>
        )}
        {badge && (
          <div className="absolute top-3 left-3">
            <Badge variant={badge.variant}>{badge.label}</Badge>
          </div>
        )}
      </div>
      <div className="flex flex-col flex-1 p-5 gap-2">
        <p className="font-heading font-bold text-sm text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
          {course.title}
        </p>
        {course.description && (
          <p className="font-body text-xs text-muted line-clamp-2 flex-1">
            {course.description}
          </p>
        )}
        <span className="flex items-center gap-1 font-body text-xs font-medium text-primary mt-auto pt-1 group-hover:gap-2 transition-all">
          View course <ArrowRight size={11} />
        </span>
      </div>
    </Link>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

export default function CoursesSection() {
  const { data: courses, isLoading } = useTopCourses();

  if (!isLoading && (!courses || courses.length === 0)) return null;

  const displayed = courses?.slice(0, 3) ?? [];

  return (
    <section id="courses" className="bg-surface-shell py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="font-heading text-xs tracking-widest uppercase text-primary dark:text-white font-bold mb-3">
              Courses
            </p>
            <h2 className="font-heading font-black text-3xl lg:text-4xl text-foreground tracking-tight">
              Start with what matters.
            </h2>
          </div>
          <Link
            href="/courses"
            className="hidden md:inline-flex font-body text-sm font-medium text-primary dark:text-white items-center gap-1.5 hover:gap-3 transition-all"
          >
            View all courses <ArrowRight size={14} />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayed.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <Link
            href="/courses"
            className="font-body text-sm font-medium text-primary dark:text-white inline-flex items-center gap-1.5 md:hidden"
          >
            View all courses <ArrowRight size={14} />
          </Link>
          <Button
            asChild
            variant="primary"
            className="hidden md:inline-flex ml-auto"
          >
            <Link href="/sign-in">Start Learning</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

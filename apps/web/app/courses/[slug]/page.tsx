"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MoveRight } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import { usePublicCourseDetail } from "@/hooks/queries/courses";

// ─── Gradient cover (matches CourseCard) ──────────────────────────────────────

const GRADIENTS = [
  ["#3D006B", "#7C3AED"],
  ["#0F172A", "#1E40AF"],
  ["#064E3B", "#059669"],
  ["#78350F", "#D97706"],
  ["#4C0519", "#BE185D"],
  ["#1E3A5F", "#0EA5E9"],
  ["#312E81", "#6D28D9"],
  ["#134E4A", "#0D9488"],
];

function titleHash(title: string) {
  let h = 0;
  for (let i = 0; i < title.length; i++)
    h = (h * 31 + title.charCodeAt(i)) >>> 0;
  return h % GRADIENTS.length;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-72 lg:h-96 bg-surface-muted rounded-2xl mb-10" />
      <div className="h-8 bg-surface-muted rounded-lg w-3/4 mb-4" />
      <div className="h-4 bg-surface-muted rounded w-full mb-2" />
      <div className="h-4 bg-surface-muted rounded w-2/3 mb-10" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-14 bg-surface-muted rounded-xl mb-3" />
      ))}
    </div>
  );
}

// ─── Content ──────────────────────────────────────────────────────────────────

function CourseDetailContent() {
  const { slug } = useParams<{ slug: string }>();
  const { data: course, isLoading, error } = usePublicCourseDetail(slug);

  return (
    <div className="min-h-screen bg-surface-shell">
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 lg:px-8 pt-12 pb-24">
        {isLoading && <Skeleton />}

        {error && (
          <div className="text-center py-24">
            <p className="font-body text-muted">Course not found.</p>
            <Link
              href="/"
              className="font-body text-sm text-primary hover:underline mt-4 inline-block"
            >
              ← Back to home
            </Link>
          </div>
        )}

        {course && (
          <>
            {/* Thumbnail / cover */}
            <div className="relative w-full h-64 lg:h-80 rounded-2xl overflow-hidden mb-10 shadow-sm ring-1 ring-border">
              {course.thumbnailUrl ? (
                <Image
                  src={course.thumbnailUrl}
                  alt={course.title}
                  fill
                  className="object-cover"
                  unoptimized
                  priority
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center px-8"
                  style={{
                    background: `linear-gradient(135deg, ${GRADIENTS[titleHash(course.title)][0]} 0%, ${GRADIENTS[titleHash(course.title)][1]} 100%)`,
                  }}
                >
                  <p className="font-heading font-black text-white text-3xl lg:text-4xl text-center leading-tight">
                    {course.title}
                  </p>
                </div>
              )}
            </div>

            {/* Title + description */}
            <h1 className="font-heading font-black text-3xl lg:text-4xl text-foreground tracking-tight leading-tight mb-4">
              {course.title}
            </h1>

            {course.description && (
              <p className="font-body text-base text-muted leading-relaxed mb-10">
                {course.description}
              </p>
            )}

            {/* Modules */}
            {course.modules.length > 0 && (
              <div className="mb-12">
                <p className="font-heading text-xs tracking-widest uppercase text-primary font-bold mb-5">
                  What you&apos;ll learn
                </p>
                <ol className="flex flex-col gap-3">
                  {course.modules.map((title, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-4 bg-surface border border-border rounded-xl px-5 py-4"
                    >
                      <span className="shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center font-heading font-bold text-xs text-primary">
                        {i + 1}
                      </span>
                      <span className="font-body text-sm font-medium text-foreground-soft">
                        {title}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* CTA */}
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-3 bg-primary text-white font-body font-medium text-base px-8 py-4 rounded-xl hover:bg-primary-dark transition-colors shadow-sm"
            >
              Start Learning Now
              <MoveRight size={20} />
            </Link>
          </>
        )}
      </main>
    </div>
  );
}

// ─── Page export ──────────────────────────────────────────────────────────────

export default function CourseDetailPage() {
  return (
    <Suspense>
      <CourseDetailContent />
    </Suspense>
  );
}

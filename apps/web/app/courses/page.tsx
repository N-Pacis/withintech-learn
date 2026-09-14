"use client";

import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/landing/Navbar";
import {
  usePublicAllCourses,
  type PublicCourse,
} from "@/hooks/queries/courses";
import { Logo } from "@/components/ui";
import { ArrowRight, BookOpen, Lock } from "lucide-react";

import {
  COURSE_GRADIENTS,
  titleGradient,
  titleToGradientIndex,
} from "@/lib/courses";

// ─── Skeletons ────────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="bg-surface-card rounded-2xl border border-border overflow-hidden animate-pulse">
      <div className="h-44 bg-surface-muted" />
      <div className="p-5 flex flex-col gap-3">
        <div className="h-5 w-3/4 bg-border rounded-md" />
        <div className="h-3 bg-border rounded w-full" />
        <div className="h-3 bg-border rounded w-5/6" />
        <div className="pt-2 border-t border-border-subtle flex items-center justify-between mt-1">
          <div className="h-3 w-16 bg-border rounded" />
          <div className="h-3 w-20 bg-border rounded" />
        </div>
      </div>
    </div>
  );
}

// ─── Course card ──────────────────────────────────────────────────────────────

function CourseCard({ course }: { course: PublicCourse }) {
  const [from, to] = titleGradient(course.title);

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group bg-surface-card rounded-2xl border border-border overflow-hidden hover:border-primary/40 hover:shadow-md transition-all duration-200 flex flex-col"
    >
      {/* Thumbnail */}
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
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <h3 className="font-heading font-bold text-base text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
          {course.title}
        </h3>
        {course.description && (
          <p className="font-body text-sm text-muted leading-relaxed line-clamp-2 flex-1">
            {course.description}
          </p>
        )}
        <div className="flex items-center justify-between pt-2 border-t border-border-subtle mt-auto">
          <span className="font-body text-xs text-muted-contrast">
            {course.moduleCount} module{course.moduleCount !== 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1 font-body text-xs font-medium text-primary group-hover:gap-2 transition-all">
            View course <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Ghost card (blurred) ─────────────────────────────────────────────────────

function GhostCourseCard({ index }: { index: number }) {
  const [from, to] = COURSE_GRADIENTS[index % COURSE_GRADIENTS.length];
  return (
    <div className="bg-surface-card rounded-2xl border border-border overflow-hidden flex flex-col select-none pointer-events-none">
      <div
        className="h-44 shrink-0 opacity-60"
        style={{
          background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
        }}
      />
      <div className="p-5 flex flex-col gap-3">
        <div className="h-5 w-3/4 bg-surface-muted rounded-md" />
        <div className="h-3 bg-surface-muted rounded w-full" />
        <div className="h-3 bg-surface-muted rounded w-5/6" />
        <div className="pt-2 border-t border-border-subtle flex items-center justify-between mt-1">
          <div className="h-3 w-16 bg-surface-muted rounded" />
          <div className="h-3 w-20 bg-surface-muted rounded" />
        </div>
      </div>
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-surface-shell border-t border-border py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Logo className="h-12" linked />
        <p
          className="font-body text-xs text-muted-contrast"
          suppressHydrationWarning
        >
          © {new Date().getFullYear()} WithinTech Rwanda
        </p>
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="font-body text-xs text-muted hover:text-primary transition-colors"
          >
            Home
          </Link>
          <Link
            href="/challenges"
            className="font-body text-xs text-muted hover:text-primary transition-colors"
          >
            Challenges
          </Link>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PublicCoursesPage() {
  const { data: courses, isLoading } = usePublicAllCourses();

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Navbar />

      {/* Hero */}
      <section className="bg-surface-shell border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-14 lg:py-20">
          <p className="font-heading text-xs tracking-widest uppercase text-primary font-bold mb-3">
            Courses
          </p>
          <h1 className="font-heading font-black text-4xl lg:text-5xl text-foreground tracking-tight leading-tight mb-4">
            Learn at your
            <br />
            own pace.
          </h1>
          <p className="font-body text-base text-muted max-w-md leading-relaxed">
            Structured courses built by WithinTech Rwanda to help you thrive in
            an AI-driven world. Sign in to enroll, track progress, and earn
            certificates.
          </p>
        </div>
      </section>

      {/* Cards + blur gate */}
      <section className="flex-1 max-w-7xl mx-auto w-full px-6 lg:px-12 py-10 lg:py-14">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : !courses || courses.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20">
            <div className="w-14 h-14 rounded-2xl bg-primary-soft flex items-center justify-center">
              <BookOpen size={28} className="text-primary" />
            </div>
            <p className="font-heading font-bold text-base text-foreground">
              No courses yet
            </p>
            <p className="font-body text-sm text-muted">Check back soon!</p>
          </div>
        ) : (
          <>
            <p className="font-body text-sm text-muted-contrast mb-6">
              {courses.length} course{courses.length !== 1 ? "s" : ""} available.
            </p>

            {/* Real cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>

            {/* Blur gate */}
            <div className="relative mt-6">
              {/* Ghost cards — 1 on mobile, 2 on sm, 3 on lg */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 blur-sm pointer-events-none select-none">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={
                      i === 0
                        ? ""
                        : i === 1
                          ? "hidden sm:block"
                          : "hidden lg:block"
                    }
                  >
                    <GhostCourseCard index={courses.length + i} />
                  </div>
                ))}
              </div>

              {/* Gradient + CTA overlay */}
              <div className="absolute inset-x-0 -top-24 bottom-0 bg-gradient-to-b from-transparent via-[#FAFAFA]/80 to-[#FAFAFA] dark:via-[#0a0a0a]/80 dark:to-[#0a0a0a]" />
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 gap-4">
                <div className="bg-surface-card border border-border rounded-2xl shadow-lg px-5 sm:px-8 py-6 flex flex-col items-center gap-3 text-center max-w-sm mx-4 w-full">
                  <div className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center">
                    <Lock size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-heading font-bold text-base text-foreground">
                      More courses coming soon
                    </p>
                    <p className="font-body text-sm text-muted mt-0.5">
                      Enrollment, progress tracking, and certificates are
                      currently unavailable. Check back soon.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </section>

      <Footer />
    </div>
  );
}

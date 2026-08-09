"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { ArrowLeft, Menu, X } from "lucide-react";
import { usePublishedCourse, useStudentModule } from "@/hooks/queries/courses";
import { PageLoader } from "@/components/ui";
import { CourseNav } from "./components/CourseNav";
import { AttemptGuardProvider } from "./components/AttemptGuard";

export default function CourseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { slug, moduleId, lessonId } = useParams<{
    slug: string;
    moduleId?: string;
    lessonId?: string;
  }>();
  const pathname = usePathname();
  const isCheckout = pathname.endsWith("/checkout");
  const { data: course, isLoading, isError } = usePublishedCourse(isCheckout ? "" : slug);

  const [readProgress, setReadProgress] = useState(0);
  const [navOpen, setNavOpen] = useState(false);

  // Reset read progress and scroll on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const t = setTimeout(() => setReadProgress(0), 0);
    return () => clearTimeout(t);
  }, [pathname]);

  // The drawer closes itself: CourseNav calls onNavigate after every push, and
  // the "All courses" link closes it on click. Doing it in an effect on
  // pathname instead would be a setState during render of the new route.

  // Stop the page behind the drawer from scrolling
  useEffect(() => {
    if (!navOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [navOpen]);

  // Reading progress bar
  useEffect(() => {
    const onScroll = () => {
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      setReadProgress(
        docHeight > 0 ? Math.min(100, (window.scrollY / docHeight) * 100) : 100,
      );
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  // Derive active module id and lesson id from pathname
  const activeModuleId = moduleId ?? pathname.match(/modules\/([^/]+)/)?.[1];
  const activeLessonId = lessonId ?? pathname.match(/lessons\/([^/]+)/)?.[1];

  // Fetch lesson data for the active module (must be called before any early return)
  const activeModule = course?.modules.find((m) => m.id === activeModuleId);
  const { data: activeModuleDetail } = useStudentModule(
    slug,
    activeModuleId && activeModule && !activeModule.isLocked
      ? activeModuleId
      : "",
  );

  if (isCheckout) return <>{children}</>;

  if (isLoading) return <PageLoader type="content" />;
  if (isError || !course) {
    return (
      <div className="px-6 py-10 max-w-3xl mx-auto">
        <p className="font-body text-sm text-red-500">Failed to load course.</p>
      </div>
    );
  }

  // Progress counts modules and the final quiz only. A lesson quiz is the gate
  // on its lesson, not a step of its own — counting it here would move every
  // existing student's percentage.
  const modules = course.modules;
  const courseQuizPassed = course.lastCourseQuizAttempt?.status === "pass";
  const totalSteps = modules.length + (course.quiz ? 1 : 0);
  const completedCount =
    modules.filter((m) => m.isCompleted).length + (courseQuizPassed ? 1 : 0);
  const overallProgress =
    totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  const navProps = {
    slug,
    course,
    pathname,
    activeModuleId,
    activeLessonId,
    activeModuleDetail,
  };

  return (
    <AttemptGuardProvider>
    <div className="min-h-screen bg-dots">
      {/* Reading progress bar */}
      <div
        className="fixed top-16 left-0 h-0.5 bg-primary z-40 transition-all duration-200 ease-out"
        style={{ width: `${readProgress}%` }}
      />

      <div className="lg:flex">
        {/* ── Desktop sidebar ── */}
        <aside className="hidden lg:flex flex-col w-64 xl:w-72 bg-surface-shell border-r border-border sticky top-16 h-[calc(100vh-4rem)] shrink-0">
          <CourseNav {...navProps} />
        </aside>

        {/* ── Mobile drawer ── */}
        {navOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setNavOpen(false)}
              aria-hidden
            />
            <aside className="relative flex flex-col w-72 max-w-[85vw] h-full bg-surface-shell border-r border-border shadow-xl">
              <button
                onClick={() => setNavOpen(false)}
                aria-label="Close course contents"
                className="absolute top-3 right-3 z-10 p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-subtle transition-colors"
              >
                <X size={16} />
              </button>
              <CourseNav {...navProps} onNavigate={() => setNavOpen(false)} />
            </aside>
          </div>
        )}

        {/* ── Main content ── */}
        <div className="flex-1 min-w-0">
          {/* Mobile top bar */}
          <div className="lg:hidden bg-surface-shell border-b border-border px-4 py-3 flex items-center gap-2">
            <Link
              href="/learn"
              className="inline-flex items-center gap-1.5 font-body text-sm text-muted hover:text-primary transition-colors shrink-0"
            >
              <ArrowLeft size={15} />
            </Link>
            <span className="text-border-strong select-none">/</span>
            <h1 className="font-heading font-bold text-sm text-foreground truncate min-w-0">
              {course.title}
            </h1>
            <button
              onClick={() => setNavOpen(true)}
              aria-label="Open course contents"
              className="ml-auto shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border font-body text-xs text-muted hover:text-primary hover:border-primary-tint transition-colors"
            >
              <Menu size={14} /> Contents
            </button>
          </div>

          {/* Mobile progress bar */}
          <div className="lg:hidden bg-surface-panel border-b border-border px-4 py-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-body text-xs font-semibold text-foreground">
                {completedCount}/{totalSteps} done
              </span>
            </div>
            <div className="h-1.5 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>

          {children}
        </div>
      </div>
    </div>
    </AttemptGuardProvider>
  );
}

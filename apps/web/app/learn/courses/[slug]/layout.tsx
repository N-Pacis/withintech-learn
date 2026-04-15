"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { ArrowLeft, Trophy, CheckCircle2, ChevronDown } from "lucide-react";
import { usePublishedCourse, useStudentModule } from "@/hooks/queries/courses";
import { PageLoader } from "@/components/ui";
import { cn } from "@/lib/utils";

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
  const router = useRouter();
  const { data: course, isLoading, isError } = usePublishedCourse(slug);

  const [readProgress, setReadProgress] = useState(0);

  // Reset read progress and scroll on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const t = setTimeout(() => setReadProgress(0), 0);
    return () => clearTimeout(t);
  }, [pathname]);

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
  const activeLessons = activeModuleDetail?.lessons ?? [];

  if (isLoading) return <PageLoader type="content" />;
  if (isError || !course) {
    return (
      <div className="px-6 py-10 max-w-3xl mx-auto">
        <p className="font-body text-sm text-red-500">Failed to load course.</p>
      </div>
    );
  }

  const modules = course.modules;
  const allModulesDone = modules.every((m) => m.isCompleted);
  const courseQuizPassed = course.lastCourseQuizAttempt?.status === "pass";
  const isOnCourseQuiz = pathname === `/learn/courses/${slug}/quiz`;

  const totalSteps = modules.length + (course.quiz ? 1 : 0);
  const completedCount =
    modules.filter((m) => m.isCompleted).length + (courseQuizPassed ? 1 : 0);
  const overallProgress =
    totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  function handleModuleClick(m: (typeof modules)[0]) {
    if (m.isLocked) return;
    router.push(`/learn/courses/${slug}/modules/${m.id}`);
  }

  function handleCourseQuizClick() {
    if (!allModulesDone) return;
    router.push(`/learn/courses/${slug}/quiz`);
  }

  const isOnModuleQuiz = pathname.includes("/quiz") && !isOnCourseQuiz;

  return (
    <div className="min-h-screen bg-dots">
      {/* Reading progress bar */}
      <div
        className="fixed top-16 left-0 h-0.5 bg-[#3D006B] z-40 transition-all duration-200 ease-out"
        style={{ width: `${readProgress}%` }}
      />

      <div className="lg:flex">
        {/* ── Desktop sidebar ── */}
        <aside className="hidden lg:flex flex-col w-64 xl:w-72 bg-white dark:bg-[#111111] border-r border-[#E5E7EB] dark:border-[#2d2d2d] sticky top-16 h-[calc(100vh-4rem)] shrink-0">
          <div className="px-4 pt-5 pb-4 border-b border-[#E5E7EB] dark:border-[#2d2d2d]">
            <Link
              href="/learn"
              className="inline-flex items-center gap-1.5 font-body text-xs text-[#9CA3AF] dark:text-[#6B7280] hover:text-[#3D006B] dark:hover:text-[#C084FC] transition-colors mb-3"
            >
              <ArrowLeft size={13} /> All courses
            </Link>
            <h2 className="font-heading font-bold text-sm text-[#0F0F0F] dark:text-[#F9FAFB] leading-snug line-clamp-2">
              {course.title}
            </h2>
            <div className="flex items-center gap-2 mt-3">
              <div className="flex-1 h-1.5 bg-[#E5E7EB] dark:bg-[#2d2d2d] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#3D006B] rounded-full transition-all duration-500"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              <span className="font-body text-xs text-[#9CA3AF] dark:text-[#6B7280] shrink-0">
                {overallProgress}%
              </span>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto py-2">
            {modules.map((m, i) => {
              const isActive = activeModuleId === m.id && !isOnModuleQuiz;
              const isQuizActive = activeModuleId === m.id && isOnModuleQuiz;
              const isDone = m.isCompleted;
              const locked = m.isLocked;
              return (
                <div key={m.id}>
                  <button
                    onClick={() => handleModuleClick(m)}
                    disabled={locked}
                    className={cn(
                      "w-full flex items-start gap-3 px-4 py-3 text-left transition-colors",
                      locked
                        ? "opacity-40 cursor-not-allowed"
                        : isActive
                          ? "bg-[#F3E8FF] dark:bg-[#2d1a4a]"
                          : "hover:bg-[#FAFAFA] dark:hover:bg-[#1e1e1e]",
                    )}
                  >
                    <span
                      className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold transition-colors",
                        isDone
                          ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                          : isActive
                            ? "bg-[#3D006B] text-white"
                            : "bg-[#E5E7EB] dark:bg-[#2d2d2d] text-[#9CA3AF] dark:text-[#6B7280]",
                      )}
                    >
                      {isDone ? <CheckCircle2 size={11} /> : i + 1}
                    </span>
                    <span
                      className={cn(
                        "font-body text-sm leading-snug",
                        isActive
                          ? "font-semibold text-[#3D006B] dark:text-[#C084FC]"
                          : isDone
                            ? "text-[#374151] dark:text-[#D1D5DB]"
                            : "text-[#6B7280] dark:text-[#9CA3AF]",
                      )}
                    >
                      {m.title}
                    </span>
                    {m.hasLessons && activeModuleId === m.id && (
                      <ChevronDown
                        size={12}
                        className={cn(
                          "ml-auto shrink-0 text-[#9CA3AF] transition-transform",
                          activeModuleId === m.id && "rotate-180",
                        )}
                      />
                    )}
                  </button>
                  {/* Lesson sub-items */}
                  {activeModuleId === m.id && activeLessons.length > 0 && (
                    <div className="pl-8 pr-2 pb-1">
                      {activeLessons.map((l, li) => {
                        const isLessonActive = activeLessonId === l.id;
                        const lessonDone = l.isCompleted;
                        const lessonLocked = l.isLocked;
                        return (
                          <button
                            key={l.id}
                            onClick={() => {
                              if (!lessonLocked) {
                                router.push(
                                  `/learn/courses/${slug}/modules/${m.id}/lessons/${l.id}`,
                                );
                              }
                            }}
                            disabled={lessonLocked}
                            className={cn(
                              "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors text-xs",
                              lessonLocked
                                ? "opacity-40 cursor-not-allowed"
                                : isLessonActive
                                  ? "bg-[#EDE5F7] dark:bg-[#2d1a4a] text-[#3D006B] dark:text-[#C084FC] font-semibold"
                                  : "hover:bg-[#F3F4F6] dark:hover:bg-[#252525] text-[#6B7280] dark:text-[#9CA3AF]",
                            )}
                          >
                            <span
                              className={cn(
                                "w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold",
                                lessonDone
                                  ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                                  : isLessonActive
                                    ? "bg-[#3D006B] text-white"
                                    : "bg-[#E5E7EB] dark:bg-[#2d2d2d] text-[#9CA3AF] dark:text-[#6B7280]",
                              )}
                            >
                              {lessonDone ? <CheckCircle2 size={9} /> : li + 1}
                            </span>
                            <span className="truncate">{l.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {/* Module quiz sub-item — only show if module has quiz */}
                  {isQuizActive && (
                    <div className="pl-11 pr-4 py-2 bg-[#F3E8FF] dark:bg-[#2d1a4a]">
                      <span className="font-body text-xs font-semibold text-[#3D006B] dark:text-[#C084FC]">
                        Quiz
                      </span>
                    </div>
                  )}
                </div>
              );
            })}

            {course.quiz && (
              <button
                onClick={handleCourseQuizClick}
                disabled={!allModulesDone}
                className={cn(
                  "w-full flex items-start gap-3 px-4 py-3 text-left transition-colors",
                  !allModulesDone
                    ? "opacity-40 cursor-not-allowed"
                    : isOnCourseQuiz
                      ? "bg-[#F3E8FF] dark:bg-[#2d1a4a]"
                      : "hover:bg-[#FAFAFA] dark:hover:bg-[#1e1e1e]",
                )}
              >
                <span
                  className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                    courseQuizPassed
                      ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                      : isOnCourseQuiz
                        ? "bg-[#3D006B] text-white"
                        : "bg-[#E5E7EB] dark:bg-[#2d2d2d] text-[#9CA3AF] dark:text-[#6B7280]",
                  )}
                >
                  {courseQuizPassed ? (
                    <CheckCircle2 size={11} />
                  ) : (
                    <Trophy size={10} />
                  )}
                </span>
                <span
                  className={cn(
                    "font-body text-sm leading-snug",
                    isOnCourseQuiz
                      ? "font-semibold text-[#3D006B] dark:text-[#C084FC]"
                      : "text-[#6B7280] dark:text-[#9CA3AF]",
                  )}
                >
                  Final Quiz
                </span>
              </button>
            )}
          </nav>
        </aside>

        {/* ── Main content ── */}
        <div className="flex-1 min-w-0">
          {/* Mobile top bar */}
          <div className="lg:hidden bg-white dark:bg-[#111111] border-b border-[#E5E7EB] dark:border-[#2d2d2d] px-4 py-3 flex items-center gap-2">
            <Link
              href="/learn"
              className="inline-flex items-center gap-1.5 font-body text-sm text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#3D006B] dark:hover:text-[#C084FC] transition-colors shrink-0"
            >
              <ArrowLeft size={15} />
            </Link>
            <span className="text-[#D1D5DB] select-none">/</span>
            <h1 className="font-heading font-bold text-sm text-[#0F0F0F] dark:text-[#F9FAFB] truncate min-w-0">
              {course.title}
            </h1>
          </div>

          {/* Mobile progress bar */}
          <div className="lg:hidden bg-[#FAFAFA] dark:bg-[#141414] border-b border-[#E5E7EB] dark:border-[#2d2d2d] px-4 py-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-body text-xs font-semibold text-[#0F0F0F] dark:text-[#F9FAFB]">
                {completedCount}/{totalSteps} done
              </span>
            </div>
            <div className="h-1.5 bg-[#E5E7EB] dark:bg-[#2d2d2d] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#3D006B] rounded-full transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}

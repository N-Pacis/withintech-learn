"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePublishedCourse, useStudentModule } from "@/hooks/queries/courses";
import { PageLoader } from "@/components/ui";

// Every module has at least one lesson (enforced at publish time), so this
// page only exists to route into the right lesson — all content rendering,
// quiz prompts, and completion live on the lesson page (and, when a module
// has its own quiz, on the module quiz page after the last lesson).
export default function ModulePage() {
  const { slug, moduleId } = useParams<{ slug: string; moduleId: string }>();
  const router = useRouter();
  const { data: mod } = useStudentModule(slug, moduleId);
  const { data: course } = usePublishedCourse(slug);

  const modules = course?.modules ?? [];
  const courseModule = modules.find((m) => m.id === moduleId);

  // Redirect away if module is locked
  useEffect(() => {
    if (course && courseModule?.isLocked) {
      router.replace(`/learn/courses/${slug}`);
    }
  }, [course, courseModule, slug, router]);

  // Redirect to the first incomplete (or first) lesson
  useEffect(() => {
    if (mod && mod.lessons.length > 0) {
      const firstIncomplete = mod.lessons.find((l) => !l.isCompleted);
      const target = firstIncomplete ?? mod.lessons[0];
      router.replace(
        `/learn/courses/${slug}/modules/${moduleId}/lessons/${target.id}`,
      );
    }
  }, [mod, slug, moduleId, router]);

  return <PageLoader type="content" />;
}

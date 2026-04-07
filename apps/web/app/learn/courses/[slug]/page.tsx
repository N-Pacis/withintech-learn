"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePublishedCourse } from "@/hooks/queries/courses";
import { PageLoader } from "@/components/ui";

export default function CourseIndexPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: course } = usePublishedCourse(slug);

  useEffect(() => {
    if (!course) return;
    const firstIncomplete = course.modules.find((m) => !m.isCompleted);
    const allDone = course.modules.every((m) => m.isCompleted);

    if (
      allDone &&
      course.quiz &&
      course.lastCourseQuizAttempt?.status !== "pass"
    ) {
      router.replace(`/learn/courses/${slug}/quiz`);
    } else {
      const target =
        firstIncomplete ?? course.modules[course.modules.length - 1];
      if (target) router.replace(`/learn/courses/${slug}/modules/${target.id}`);
    }
  }, [course, slug, router]);

  return <PageLoader type="content" />;
}

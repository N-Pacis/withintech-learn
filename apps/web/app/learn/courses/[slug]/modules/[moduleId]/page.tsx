"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  usePublishedCourse,
  useStudentModule,
  useCompleteModule,
} from "@/hooks/queries/courses";
import { useProfile } from "@/hooks/queries/auth";
import { Button, Card, CardBody, PageLoader } from "@/components/ui";

// This page only routes: content, quiz prompts and completion live on the
// lesson and quiz pages. A module with lessons goes to its first incomplete
// lesson. A module without lessons (content not written yet) goes straight to
// its quiz; with no quiz either, the student gets a short note and a way to
// move on so they are never stuck behind an empty module.
export default function ModulePage() {
  const { slug, moduleId } = useParams<{ slug: string; moduleId: string }>();
  const router = useRouter();
  const { data: mod, isError } = useStudentModule(slug, moduleId);
  const { data: course } = usePublishedCourse(slug);
  const { data: profile } = useProfile();
  const { mutate: completeModule, isPending: completing } =
    useCompleteModule(slug);

  const modules = course?.modules ?? [];
  const moduleIndex = modules.findIndex((m) => m.id === moduleId);
  const courseModule = moduleIndex >= 0 ? modules[moduleIndex] : undefined;
  const hasLessons = (mod?.lessons.length ?? 0) > 0;

  // Redirect away if module is locked
  useEffect(() => {
    if (course && courseModule?.isLocked) {
      router.replace(`/learn/courses/${slug}`);
    }
  }, [course, courseModule, slug, router]);

  // Route into the first incomplete lesson, or the quiz when there are none.
  useEffect(() => {
    if (!mod) return;
    if (mod.lessons.length > 0) {
      const firstIncomplete = mod.lessons.find((l) => !l.isCompleted);
      const target = firstIncomplete ?? mod.lessons[0];
      router.replace(
        `/learn/courses/${slug}/modules/${moduleId}/lessons/${target.id}`,
      );
    } else if (mod.quiz) {
      router.replace(`/learn/courses/${slug}/modules/${moduleId}/quiz`);
    }
  }, [mod, slug, moduleId, router]);

  if (isError) {
    return (
      <EmptyModuleNote
        title="We couldn't load this module"
        message="Please refresh the page or try again in a moment."
      />
    );
  }

  if (!mod || !course || hasLessons || mod.quiz) {
    return <PageLoader type="content" />;
  }

  // No lessons and no quiz: let the student continue.
  const isLast = moduleIndex === modules.length - 1;

  function goNext() {
    if (!isLast) {
      router.push(
        `/learn/courses/${slug}/modules/${modules[moduleIndex + 1].id}`,
      );
    } else if (course!.quiz) {
      router.push(`/learn/courses/${slug}/quiz`);
    } else if (profile) {
      router.push(`/certificates/${profile.id}/${course!.slug}`);
    } else {
      router.push(`/learn/courses/${slug}`);
    }
  }

  function handleContinue() {
    if (courseModule?.isCompleted) {
      goNext();
      return;
    }
    completeModule(moduleId, { onSuccess: goNext });
  }

  return (
    <EmptyModuleNote
      title={mod.title}
      message="Content for this module is being updated. You can continue to the next part of the course."
      action={
        <Button onClick={handleContinue} loading={completing}>
          Continue
        </Button>
      }
    />
  );
}

function EmptyModuleNote({
  title,
  message,
  action,
}: {
  title: string;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <Card>
        <CardBody className="flex flex-col gap-4">
          <h1 className="font-heading font-bold text-xl text-foreground">
            {title}
          </h1>
          <p className="font-body text-sm text-muted-contrast">{message}</p>
          {action && <div>{action}</div>}
        </CardBody>
      </Card>
    </div>
  );
}

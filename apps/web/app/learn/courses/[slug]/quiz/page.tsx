"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, ChevronLeft, Trophy, Award } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { usePublishedCourse, courseKeys } from "@/hooks/queries/courses";
import { useProfile } from "@/hooks/queries/auth";
import { Button, PageLoader } from "@/components/ui";
import { QuizSection } from "../components/QuizSection";
import Link from "next/link";

export default function CourseQuizPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: course, isLoading } = usePublishedCourse(slug);
  const { data: profile } = useProfile();
  // Every hook must run before the early returns below, or React breaks when
  // the course finishes loading and the hook order changes.
  const [quizJustPassed, setQuizJustPassed] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!course) return;
    const allDone = course.modules.every((m) => m.isCompleted);
    if (!allDone) router.replace(`/learn/courses/${slug}`);
  }, [course, slug, router]);

  if (isLoading || !course) return <PageLoader type="content" />;
  if (!course.quiz) {
    router.replace(`/learn/courses/${slug}`);
    return null;
  }

  const quizPassed =
    course.lastCourseQuizAttempt?.status === "pass" || quizJustPassed;
  const hasCertificate = course.has_certificate;
  const isPaidCert = course.accessType === "PAID_CERTIFICATE";

  // After quiz pass on a paid-cert course: only show pay button until they've paid
  const needsCertPayment = isPaidCert && quizPassed && !hasCertificate;
  // Show cert link only when they actually have the certificate
  const showCertLink = hasCertificate && quizPassed;

  const certHref = `/certificates/${profile?.id}/${course.slug}`;
  const checkoutHref = `/learn/courses/${slug}/checkout?type=certificate`;
  const lastModuleId = course.modules[course.modules.length - 1]?.id;

  // Records progress only. The student stays on the results view; the
  // certificate opens from the Continue button, never on its own — a popup
  // opened without a click is usually blocked by the browser.
  function handleQuizPassed() {
    setQuizJustPassed(true);
    // Passing the course quiz flips the enrollment status and may create a
    // certificate, so refresh the course detail and the course list.
    queryClient.invalidateQueries({
      queryKey: [...courseKeys.student.lists(), slug],
    });
    queryClient.invalidateQueries({ queryKey: courseKeys.student.lists() });
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-32 lg:pb-10">
      {/* Badge */}
      <div className="flex items-center gap-2 mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-soft text-foreground font-body text-xs font-semibold">
          <Trophy size={11} /> Final Quiz
        </span>
      </div>

      {/* Pay-for-certificate callout */}
      {needsCertPayment && (
        <div className="flex items-start gap-3 px-5 py-4 rounded-xl bg-primary-soft border border-primary-pale mb-5">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
            <Award size={16} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-heading font-bold text-sm text-foreground">
              You passed! Get your certificate
            </p>
            <p className="font-body text-xs text-muted mt-0.5">
              Pay RWF {course.certificatePrice?.toLocaleString()} to receive your official certificate for this course.
            </p>
            <Link
              href={checkoutHref}
              className="inline-flex items-center gap-1.5 mt-2 font-body text-xs font-semibold text-primary hover:underline"
            >
              Pay for Certificate <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      )}

      {/* Quiz card */}
      <div className="bg-surface-card rounded-2xl border border-border shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-primary-soft border border-primary-pale mb-6">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0">
            <Trophy size={16} className="text-white" />
          </div>
          <div>
            <p className="font-heading font-bold text-sm text-foreground">
              Final Course Quiz
            </p>
            <p className="font-body text-xs text-muted mt-0.5">
              Pass to complete the course. Answers are not revealed.
            </p>
          </div>
        </div>
        <QuizSection
          quiz={course.quiz}
          quizType="course"
          onPassed={handleQuizPassed}
          payForCertHref={needsCertPayment ? checkoutHref : undefined}
          onContinue={
            showCertLink ? () => window.open(certHref, "_blank") : undefined
          }
          continueLabel="View certificate"
        />
      </div>

      {/* Desktop nav */}
      <div className="hidden lg:flex flex-row items-center justify-between gap-3 mt-8 pt-6 border-t border-border">
        <Button
          variant="secondary"
          size="md"
          onClick={() =>
            lastModuleId &&
            router.push(`/learn/courses/${slug}/modules/${lastModuleId}`)
          }
          className="flex items-center gap-2"
        >
          <ChevronLeft size={16} /> Previous
        </Button>

        {needsCertPayment && (
          <Button size="md" asChild className="flex items-center gap-2" variant="primary">
            <Link href={checkoutHref}>
              Pay for Certificate <Award size={16} />
            </Link>
          </Button>
        )}
        {showCertLink && (
          <Button size="md" variant="secondary" asChild className="flex items-center gap-2">
            <Link href={certHref} target="_blank" rel="noopener noreferrer">
              View Certificate <Award size={16} />
            </Link>
          </Button>
        )}
      </div>

      {/* Mobile sticky nav */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-surface-shell border-t border-border shadow-[0_-4px_16px_rgba(15,15,15,0.08)] dark:shadow-[0_-4px_16px_rgba(0,0,0,0.36)] px-4 py-3 flex items-center justify-between gap-3">
        <Button
          variant="secondary"
          size="md"
          onClick={() =>
            lastModuleId &&
            router.push(`/learn/courses/${slug}/modules/${lastModuleId}`)
          }
          className="px-3"
        >
          <ChevronLeft size={16} />
        </Button>
        <p className="font-body text-xs text-muted-contrast truncate flex-1 text-center">
          Final Quiz
        </p>
        {needsCertPayment && (
          <Button size="md" asChild variant="primary" className="px-3">
            <Link href={checkoutHref}>
              <Award size={16} />
            </Link>
          </Button>
        )}
        {showCertLink && (
          <Button size="md" variant="secondary" asChild className="px-3">
            <Link href={certHref} target="_blank">
              <Award size={16} />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

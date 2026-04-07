'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Trophy, Award } from 'lucide-react';
import { usePublishedCourse } from '@/hooks/queries/courses';
import { useProfile } from '@/hooks/queries/auth';
import { Button, PageLoader } from '@/components/ui';
import { QuizSection } from '../components/QuizSection';
import Link from 'next/link';

export default function CourseQuizPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: course, isLoading } = usePublishedCourse(slug);
  const { data: profile } = useProfile();

  // Guard: redirect away if not all modules complete
  useEffect(() => {
    if (!course) return;
    const allDone = course.modules.every((m) => m.isCompleted);
    if (!allDone) {
      router.replace(`/learn/courses/${slug}`);
    }
  }, [course, slug, router]);

  if (isLoading || !course) return <PageLoader type="content" />;
  if (!course.quiz) {
    router.replace(`/learn/courses/${slug}`);
    return null;
  }

  const isCoursePassed = course.enrollment_status === 'PASSED';
  const certHref = `/certificates/${profile?.id}/${course.slug}`;
  const lastModuleId = course.modules[course.modules.length - 1]?.id;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-32 lg:pb-10">
      {/* Badge */}
      <div className="flex items-center gap-2 mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3E8FF] text-[#3D006B] font-body text-xs font-semibold">
          <Trophy size={11} /> Final Quiz
        </span>
      </div>

      {/* Quiz card */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-[#F3E8FF] border border-[#E9D5FF] mb-6">
          <div className="w-9 h-9 rounded-full bg-[#3D006B] flex items-center justify-center shrink-0">
            <Trophy size={16} className="text-white" />
          </div>
          <div>
            <p className="font-heading font-bold text-sm text-[#0F0F0F]">Final Course Quiz</p>
            <p className="font-body text-xs text-[#6B7280] mt-0.5">
              Pass to complete the course. Answers are not revealed.
            </p>
          </div>
        </div>
        <QuizSection
          slug={slug}
          moduleId="course-quiz"
          quiz={course.quiz}
          lastAttempt={course.lastCourseQuizAttempt}
          onPass={() => {
            if (isCoursePassed) {
              window.open(certHref, '_blank');
            }
          }}
        />
      </div>

      {/* Desktop nav */}
      <div className="hidden lg:flex flex-row items-center justify-between gap-3 mt-8 pt-6 border-t border-[#E5E7EB]">
        <Button
          variant="secondary"
          size="md"
          onClick={() => lastModuleId && router.push(`/learn/courses/${slug}/modules/${lastModuleId}`)}
          className="flex items-center gap-2"
        >
          <ChevronLeft size={16} /> Previous
        </Button>

        {isCoursePassed && (
          <Button size="md" asChild className="flex items-center gap-2 bg-green-600 hover:bg-green-700 border-0">
            <Link href={certHref} target="_blank" rel="noopener noreferrer">
              Certificate <Award size={16} />
            </Link>
          </Button>
        )}
      </div>

      {/* Mobile sticky nav */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-[#E5E7EB] shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-4 py-3 flex items-center justify-between gap-3">
        <Button
          variant="secondary"
          size="md"
          onClick={() => lastModuleId && router.push(`/learn/courses/${slug}/modules/${lastModuleId}`)}
          className="px-3"
        >
          <ChevronLeft size={16} />
        </Button>
        <p className="font-body text-xs text-[#9CA3AF] truncate flex-1 text-center">Final Quiz</p>
        {isCoursePassed && (
          <Button size="md" asChild className="px-3 bg-green-600 hover:bg-green-700 border-0">
            <Link href={certHref} target="_blank"><Award size={16} /></Link>
          </Button>
        )}
      </div>
    </div>
  );
}

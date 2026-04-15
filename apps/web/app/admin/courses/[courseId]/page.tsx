'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCourse } from '@/hooks/queries/courses';
import { PageLoader } from '@/components/ui';
import { CourseHeader } from './components/CourseHeader';
import { ModuleCards } from './components/ModuleCards';
import { CourseQuizSection } from './components/CourseQuizSection';

export default function CourseOverviewPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { data: course, isLoading } = useCourse(courseId);

  if (isLoading) return <PageLoader type="detail" className="p-8 lg:p-12" />;
  if (!course) {
    return <div className="p-8"><p className="font-body text-sm text-red-500">Course not found.</p></div>;
  }

  return (
    <div className="p-4 sm:p-8 lg:p-12 max-w-3xl">

      <Link
        href="/admin/courses"
        className="inline-flex items-center gap-2 font-body text-sm text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#3D006B] dark:hover:text-[#C084FC] transition-colors mb-8"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
        </svg>
        Back to courses
      </Link>

      <CourseHeader course={course} courseId={courseId} />

      {course.thumbnailUrl && (
        <div className="relative h-52 rounded-xl overflow-hidden bg-[#F3F4F6] dark:bg-[#252525] mb-8">
          <Image src={course.thumbnailUrl} alt={course.title} fill className="object-cover" unoptimized />
        </div>
      )}

      <ModuleCards courseId={courseId} isDraft={course.status === 'draft'} />

      <CourseQuizSection courseId={courseId} isDraft={course.status === 'draft'} />

    </div>
  );
}

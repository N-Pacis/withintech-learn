'use client';

import Link from 'next/link';
import { MoveRight } from 'lucide-react';
import { useTopCourses, type TopCourse } from '@/hooks/queries/courses';
import { CourseCard } from '@/components/CourseCard';

const EnrollButton = (
  <Link
    href="/sign-in"
    className="w-full inline-flex items-center justify-center gap-2 font-body font-medium text-sm bg-[#3D006B] text-white px-4 py-2 rounded-md hover:bg-[#2A004A] transition-colors"
  >
    Enroll Now <MoveRight size={18} />
  </Link>
);

function tagBadge(tag: TopCourse['tag']) {
  if (tag === 'popular') return { variant: 'orange' as const, label: 'Popular' };
  if (tag === 'new') return { variant: 'success' as const, label: 'New' };
  return undefined;
}

export default function CoursesSection() {
  const { data: courses, isLoading } = useTopCourses();

  if (isLoading || !courses || courses.length === 0) return null;

  const [featured, ...rest] = courses;

  return (
    <section id="courses" className="bg-white py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="font-heading text-xs tracking-widest uppercase text-[#3D006B] font-bold mb-3">
              Courses
            </p>
            <h2 className="font-heading font-black text-3xl lg:text-4xl text-[#0F0F0F] tracking-tight">
              Start with what matters.
            </h2>
          </div>
          <Link
            href="/sign-in"
            className="hidden md:inline-flex font-body text-sm font-medium text-[#3D006B] items-center gap-1.5 hover:gap-3 transition-all"
          >
            View more →
          </Link>
        </div>

        {/* Cards — stretch when there are enough to fill the row, fixed otherwise */}
        <div className="flex flex-col lg:flex-row gap-4 lg:items-start">
          {/* Featured card */}
          <div className={`w-full shrink-0 ${rest.length > 0 ? 'lg:flex-1' : 'lg:max-w-130'}`}>
            <CourseCard
              course={featured}
              href={`/courses/${featured.slug}`}
              badge={tagBadge(featured.tag)}
              featured
              footer={EnrollButton}
            />
          </div>

          {/* Remaining cards — stacked */}
          {rest.length > 0 && (
            <div className={`flex flex-col gap-4 w-full shrink-0 ${rest.length >= 2 ? 'lg:w-[42%]' : 'lg:max-w-85'}`}>
              {rest.map((course) => (
                <CourseCard key={course.id} course={course} href={`/courses/${course.slug}`} badge={tagBadge(course.tag)} footer={EnrollButton} />
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 md:hidden">
          <Link
            href="/sign-in"
            className="font-body text-sm font-medium text-[#3D006B] inline-flex items-center gap-1.5"
          >
            View more →
          </Link>
        </div>

      </div>
    </section>
  );
}

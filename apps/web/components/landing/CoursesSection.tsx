'use client';

import Link from 'next/link';
import { useTopCourses } from '@/hooks/queries/courses';
import { CourseCard } from '@/components/CourseCard';

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

        <div className="flex flex-col lg:flex-row gap-4 items-stretch">
          {/* Featured card — wider */}
          <div className="lg:w-[58%]">
            <CourseCard
              course={featured}
              href="/sign-in"
              badge={{ variant: 'orange', label: 'Most Popular' }}
              featured
            />
          </div>

          {/* Remaining cards — stacked */}
          {rest.length > 0 && (
            <div className="lg:w-[42%] flex flex-col gap-4">
              {rest.map((course) => (
                <CourseCard key={course.id} course={course} href="/sign-in" />
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

import Link from 'next/link';
import Image from 'next/image';
import type { ReactNode } from 'react';
import { Info } from 'lucide-react';
import { Badge } from '@/components/ui';

interface CourseCardCourse {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  createdAt?: string;
  module_count?: number;
  enrolled_at?: string | null;
  enrollment_status?: string | null;
}

interface CourseCardProps {
  course: CourseCardCourse;
  href: string;
  badge?: { variant: 'default' | 'purple' | 'orange' | 'gray' | 'success' | 'danger' | 'warning'; label: string };
  footer?: ReactNode;
  featured?: boolean;
  locked?: boolean;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

import { titleGradient } from '@/lib/courses';

function CourseCover({ title, featured }: { title: string; featured?: boolean }) {
  const [from, to] = titleGradient(title);
  const lines = title.length > 40 ? 3 : 2;
  return (
    <div
      className={`w-full h-full flex items-center justify-center px-5 ${featured ? 'py-8' : 'py-4'}`}
      style={{ background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)` }}
    >
      <p
        className={`font-heading font-black text-white text-center leading-tight ${featured ? 'text-2xl' : 'text-sm'}`}
        style={{ display: '-webkit-box', WebkitLineClamp: lines, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
      >
        {title}
      </p>
    </div>
  );
}

export function CourseCard({ course, href, badge, footer, featured, locked }: CourseCardProps) {
  const thumbnailHeight = featured ? 'h-64' : 'h-40';
  const titleSize = featured ? 'text-base' : 'text-sm';

  const thumbnail = (
    <div className={`relative ${thumbnailHeight} bg-[#F3F4F6] shrink-0 block`}>
      {course.thumbnailUrl ? (
        <Image src={course.thumbnailUrl} alt={course.title} fill className="object-cover" unoptimized />
      ) : (
        <CourseCover title={course.title} featured={featured} />
      )}
      {badge && (
        <div className="absolute top-3 left-3">
          <Badge variant={badge.variant}>{badge.label}</Badge>
        </div>
      )}
      {course.enrollment_status === 'PASSED' && (
        <div className="absolute top-3 right-3">
          <Badge variant="success">Completed</Badge>
        </div>
      )}
    </div>
  );

  const body = (
    <div className="flex flex-col gap-1 p-4 flex-1">
      <p className={`font-heading font-bold ${titleSize} text-[#0F0F0F] line-clamp-2 leading-snug ${!locked ? 'group-hover:text-[#3D006B]' : ''} transition-colors`}>
        {course.title}
      </p>
      {course.description && (
        <p className={`font-body text-xs text-[#6B7280] mt-0.5 ${featured ? 'line-clamp-3' : 'line-clamp-2'}`}>{course.description}</p>
      )}
      <div className="flex items-center gap-3 mt-auto pt-3 flex-wrap">
        {course.module_count !== undefined && (
          <span className="font-body text-xs text-[#9CA3AF]">
            {course.module_count} module{course.module_count !== 1 ? 's' : ''}
          </span>
        )}
        {course.enrolled_at && (
          <span className="font-body text-xs text-[#9CA3AF]">
            Started {formatDate(course.enrolled_at)}
          </span>
        )}
        {!course.enrolled_at && course.module_count === undefined && course.createdAt && (
          <span className="font-body text-xs text-[#9CA3AF]">
            Created {formatDate(course.createdAt)}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className={`group flex flex-col bg-white rounded-xl border border-[#E5E7EB] overflow-hidden transition-all h-full ${locked ? 'cursor-default' : 'hover:shadow-md hover:border-[#3D006B]/20'}`}>

      {/* Thumbnail */}
      {locked ? thumbnail : <Link href={href} className="block">{thumbnail}</Link>}

      {/* Body */}
      {locked ? body : <Link href={href} className="flex flex-col flex-1">{body}</Link>}

      {/* Footer */}
      {footer && (
        <div className="px-4 pb-4 flex flex-col gap-2">
          {footer}
          {locked && (
            <p className="font-body text-xs text-[#9CA3AF] flex items-center gap-1.5">
              <Info size={12} className="shrink-0" />
              Enroll to access the course modules
            </p>
          )}
        </div>
      )}
    </div>
  );
}

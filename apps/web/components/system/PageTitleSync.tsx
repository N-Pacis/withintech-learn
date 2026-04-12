'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const APP_NAME = 'WithinTech Learn';

const STATIC_TITLES: Record<string, string> = {
  '/': APP_NAME,
  '/sign-in': `Sign In | ${APP_NAME}`,
  '/sign-up': `Sign Up | ${APP_NAME}`,
  '/login': `Login | ${APP_NAME}`,
  '/forgot-password': `Forgot Password | ${APP_NAME}`,
  '/verify-email': `Verify Email | ${APP_NAME}`,
  '/accept-invitation': `Accept Invitation | ${APP_NAME}`,
  '/courses': `Courses | ${APP_NAME}`,
  '/challenges': `Challenges | ${APP_NAME}`,
  '/legal': `Legal | ${APP_NAME}`,
  '/learn': `My Learning | ${APP_NAME}`,
  '/learn/challenges': `Challenges | Learn | ${APP_NAME}`,
  '/learn/certificates': `Certificates | Learn | ${APP_NAME}`,
  '/admin': `Admin Dashboard | ${APP_NAME}`,
  '/admin/users': `Users | Admin | ${APP_NAME}`,
  '/admin/users/invite': `Invite Users | Admin | ${APP_NAME}`,
  '/admin/admins': `Admins | Admin | ${APP_NAME}`,
  '/admin/students': `Students | Admin | ${APP_NAME}`,
  '/admin/enrollments': `Enrollments | Admin | ${APP_NAME}`,
  '/admin/courses': `Courses | Admin | ${APP_NAME}`,
  '/admin/courses/new': `New Course | Admin | ${APP_NAME}`,
  '/admin/challenges': `Challenges | Admin | ${APP_NAME}`,
  '/admin/challenges/new': `New Challenge | Admin | ${APP_NAME}`,
};

function titleize(segment: string) {
  return segment
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function resolveTitle(pathname: string) {
  if (STATIC_TITLES[pathname]) return STATIC_TITLES[pathname];

  if (pathname.startsWith('/courses/')) {
    const slug = pathname.split('/')[2];
    return `${titleize(slug)} | Courses | ${APP_NAME}`;
  }

  if (pathname.startsWith('/challenges/')) {
    const slug = pathname.split('/')[2];
    return `${titleize(slug)} | Challenges | ${APP_NAME}`;
  }

  if (pathname.startsWith('/learn/courses/')) {
    const parts = pathname.split('/').filter(Boolean);
    const slug = parts[2];

    if (parts.length === 3) {
      return `${titleize(slug)} | Learn | ${APP_NAME}`;
    }

    if (parts.includes('lessons')) {
      return `Lesson | ${titleize(slug)} | Learn | ${APP_NAME}`;
    }

    if (parts.at(-1) === 'quiz') {
      return `Quiz | ${titleize(slug)} | Learn | ${APP_NAME}`;
    }

    return `Module | ${titleize(slug)} | Learn | ${APP_NAME}`;
  }

  if (pathname.startsWith('/learn/challenges/')) {
    const slug = pathname.split('/')[3];
    return `${titleize(slug)} | Learn | ${APP_NAME}`;
  }

  if (pathname.startsWith('/admin/courses/')) {
    const parts = pathname.split('/').filter(Boolean);

    if (parts.at(-1) === 'edit') return `Edit Course | Admin | ${APP_NAME}`;
    if (parts.at(-1) === 'modules') return `Modules | Admin | ${APP_NAME}`;
    if (parts.includes('lessons')) return `Lesson Editor | Admin | ${APP_NAME}`;
    if (parts.at(-1) === 'new') return `New Module | Admin | ${APP_NAME}`;
    if (parts.includes('modules')) return `Module Editor | Admin | ${APP_NAME}`;

    return `Course Details | Admin | ${APP_NAME}`;
  }

  if (pathname.startsWith('/admin/challenges/')) {
    return `Challenge Editor | Admin | ${APP_NAME}`;
  }

  if (pathname.startsWith('/certificates/')) {
    return `Certificate | ${APP_NAME}`;
  }

  const lastSegment = pathname.split('/').filter(Boolean).at(-1);
  return lastSegment ? `${titleize(lastSegment)} | ${APP_NAME}` : APP_NAME;
}

export function PageTitleSync() {
  const pathname = usePathname();

  useEffect(() => {
    document.title = resolveTitle(pathname);
  }, [pathname]);

  return null;
}

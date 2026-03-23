'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import StudentNavbar from '@/components/layout/StudentNavbar';
import { AuthLoader } from '@/components/ui';

function StudentGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/sign-in');
    } else if (user.role === 'admin') {
      router.replace('/admin');
    }
  }, [user, isLoading, router]);

  if (isLoading) return <AuthLoader />;

  if (!user || user.role === 'admin') return null;

  return (
    <div className="min-h-screen bg-dots flex flex-col">
      <StudentNavbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <StudentGuard>{children}</StudentGuard>
    </AuthProvider>
  );
}

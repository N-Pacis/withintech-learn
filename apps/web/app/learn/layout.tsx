'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import StudentNavbar from '@/components/layout/StudentNavbar';

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-[#3D006B] border-t-transparent animate-spin" />
      </div>
    );
  }

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

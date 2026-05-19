"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import StudentNavbar from "@/components/layout/StudentNavbar";
import { AuthLoader } from "@/components/ui";

function StudentGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isFetching } = useAuth();
  const router = useRouter();
  const isCheckingAuth = isLoading || isFetching;

  useEffect(() => {
    if (isCheckingAuth) return;
    if (!user) {
      router.replace("/sign-in");
    } else if (user.role === "admin") {
      router.replace("/admin");
    }
  }, [user, isCheckingAuth, router]);

  if (isCheckingAuth) return <AuthLoader />;

  if (!user || user.role === "admin") return null;

  return (
    <div className="min-h-screen bg-dots flex flex-col">
      <StudentNavbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <StudentGuard>{children}</StudentGuard>
    </AuthProvider>
  );
}

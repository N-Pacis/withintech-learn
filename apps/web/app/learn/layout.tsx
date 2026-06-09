"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import StudentNavbar from "@/components/layout/StudentNavbar";
import { AuthLoader } from "@/components/ui";
import { useSyncPendingPayments, pendingPaymentKey } from "@/hooks/queries/payments";
import { courseKeys } from "@/hooks/queries/courses";

function StudentGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isFetching } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const isCheckingAuth = !user && (isLoading || isFetching);

  const { data: syncedPayments } = useSyncPendingPayments(user?.id);

  // Handle any payments that resolved while the user was away
  useEffect(() => {
    if (!syncedPayments || syncedPayments.length === 0) return;

    let anyPaid = false;

    for (const payment of syncedPayments) {
      // Clear localStorage for any payment that is no longer pending
      if (payment.status !== "PENDING") {
        localStorage.removeItem(pendingPaymentKey(payment.courseSlug, payment.type));
      }

      if (payment.status === "PAID") {
        anyPaid = true;
        toast.success(
          payment.type === "COURSE_ACCESS"
            ? `Your payment for "${payment.courseTitle}" was confirmed — you're now enrolled!`
            : `Your certificate payment for "${payment.courseTitle}" was confirmed.`,
        );
      }
    }

    if (anyPaid) {
      queryClient.invalidateQueries({ queryKey: courseKeys.student.lists() });
      queryClient.invalidateQueries({ queryKey: courseKeys.public.top });
    }
  }, [syncedPayments, queryClient]);

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

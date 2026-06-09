import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PaymentType = "COURSE_ACCESS" | "CERTIFICATE";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "EXPIRED";
export type PaymentProvider = "MTN" | "AIRTEL";

export interface PaymentStatusResult {
  status: PaymentStatus;
  amount: number;
  type: PaymentType;
  course: { slug: string; title: string };
}

export interface AdminPayment {
  id: string;
  type: PaymentType;
  status: PaymentStatus;
  amount: number;
  currency: string;
  phoneNumber: string | null;
  paymentProvider: string | null;
  paymentMethod: string | null;
  paidAt: string | null;
  createdAt: string;
  user: { id: string; firstName: string; lastName: string; email: string };
  course: { id: string; title: string; slug: string };
}

export interface AdminPaymentsPage {
  total: number;
  page: number;
  limit: number;
  payments: AdminPayment[];
}

export interface SyncedPayment {
  transactionId: string;
  status: "PAID" | "FAILED" | "PENDING";
  type: PaymentType;
  courseSlug: string;
  courseTitle: string;
}

// Stable localStorage key for persisting a checkout session across tab closes
export const pendingPaymentKey = (slug: string, type: PaymentType) =>
  `wt_pending_${slug}_${type}`;

// ─── Query keys ───────────────────────────────────────────────────────────────

export const paymentKeys = {
  status: (txId: string) => ["payment", "status", txId] as const,
  syncPending: (userId: string) => ["payment", "sync-pending", userId] as const,
  adminList: (p: object) => ["admin", "payments", p] as const,
};

// ─── Student hooks ────────────────────────────────────────────────────────────

export function useInitiatePayment() {
  return useMutation({
    mutationFn: async (data: {
      courseId: string;
      type: PaymentType;
      phone: string;
      provider: PaymentProvider;
    }): Promise<{ transactionId: string }> => {
      const res = await apiFetch<{ transactionId: string }>(
        "/payments/initiate",
        { method: "POST", body: JSON.stringify(data) },
      );
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
  });
}

export function usePaymentStatus(transactionId: string | null, enabled = true) {
  return useQuery({
    queryKey: paymentKeys.status(transactionId ?? ""),
    queryFn: async (): Promise<PaymentStatusResult> => {
      const res = await apiFetch<PaymentStatusResult>(`/payments/status/${transactionId}`);
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    enabled: !!transactionId && enabled,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "PENDING") return 3000;
      return false;
    },
    refetchIntervalInBackground: false,
  });
}

export function useSyncPendingPayments(userId: string | undefined) {
  return useQuery({
    queryKey: paymentKeys.syncPending(userId ?? ""),
    queryFn: async (): Promise<SyncedPayment[]> => {
      const res = await apiFetch<SyncedPayment[]>("/payments/sync-pending");
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    enabled: !!userId,
    // Re-sync at most once every 10 minutes per session; always runs on first mount
    staleTime: 10 * 60 * 1000,
    gcTime: 0,
  });
}

// ─── Admin hooks ──────────────────────────────────────────────────────────────

export function useAdminPayments(params: {
  page: number;
  limit: number;
  status?: PaymentStatus;
  type?: PaymentType;
  courseId?: string;
  userId?: string;
}) {
  return useQuery({
    queryKey: paymentKeys.adminList(params),
    queryFn: async (): Promise<AdminPaymentsPage> => {
      const qs = new URLSearchParams({
        page: String(params.page),
        limit: String(params.limit),
      });
      if (params.status) qs.set("status", params.status);
      if (params.type) qs.set("type", params.type);
      if (params.courseId) qs.set("courseId", params.courseId);
      if (params.userId) qs.set("userId", params.userId);
      const res = await apiFetch<AdminPaymentsPage>(`/admin/payments?${qs}`);
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
  });
}

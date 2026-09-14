import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Enrollment {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  enrolledAt: string;
  status: "in_progress" | "completed";
}

export interface EnrollmentProgressModule {
  id: string;
  title: string;
  orderIndex: number;
  completed: boolean;
  completedAt: string | null;
}

/**
 * An attempt worth a second look. `warningCount` is what the browser reported —
 * tab switches, lost focus, or leaving the quiz page mid-attempt. It is a
 * reason to look at a student, never proof on its own.
 */
export interface FlaggedQuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  score: number;
  status: "pass" | "fail";
  warningCount: number;
  timedOut: boolean;
  createdAt: string;
}

export interface EnrollmentProgress {
  enrollmentId: string;
  studentName: string;
  courseTitle: string;
  totalModules: number;
  completedModules: number;
  modules: EnrollmentProgressModule[];
  finalQuiz: {
    id: string;
    title: string;
    passed: boolean;
    passedAt: string | null;
  } | null;
  flaggedAttempts: FlaggedQuizAttempt[];
}

// ─── Keys ────────────────────────────────────────────────────────────────────

export interface EnrollmentsPage {
  total: number;
  page: number;
  limit: number;
  enrollments: Enrollment[];
}

export const enrollmentKeys = {
  all: ["enrollments"] as const,
  list: (params: {
    search?: string;
    courseId?: string;
    page?: number;
    limit?: number;
  }) => [...enrollmentKeys.all, "list", params] as const,
  progress: (enrollmentId: string) =>
    [...enrollmentKeys.all, "progress", enrollmentId] as const,
};

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useEnrollments(params: {
  search?: string;
  courseId?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: enrollmentKeys.list(params),
    queryFn: async (): Promise<EnrollmentsPage> => {
      const qs = new URLSearchParams();
      if (params.search) qs.set("search", params.search);
      if (params.courseId) qs.set("courseId", params.courseId);
      if (params.page) qs.set("page", String(params.page));
      if (params.limit) qs.set("limit", String(params.limit));
      const res = await apiFetch<EnrollmentsPage>(
        `/admin/enrollments?${qs.toString()}`,
      );
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
  });
}

export function useEnrollmentProgress(enrollmentId: string | null) {
  return useQuery({
    queryKey: enrollmentKeys.progress(enrollmentId ?? ""),
    queryFn: async () => {
      const res = await apiFetch<EnrollmentProgress>(
        `/admin/enrollments/${enrollmentId}/progress`,
      );
      return res.data as EnrollmentProgress;
    },
    enabled: !!enrollmentId,
  });
}

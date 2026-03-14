import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Enrollment {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  enrolledAt: string;
  status: 'in_progress' | 'completed';
}

export interface EnrollmentProgressModule {
  id: string;
  title: string;
  orderIndex: number;
  completed: boolean;
}

export interface EnrollmentProgress {
  enrollmentId: string;
  studentName: string;
  courseTitle: string;
  totalModules: number;
  completedModules: number;
  modules: EnrollmentProgressModule[];
}

// ─── Keys ────────────────────────────────────────────────────────────────────

export const enrollmentKeys = {
  all: ['enrollments'] as const,
  list: (params: { search?: string; course?: string }) =>
    [...enrollmentKeys.all, 'list', params] as const,
  progress: (enrollmentId: string) =>
    [...enrollmentKeys.all, 'progress', enrollmentId] as const,
};

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useEnrollments(params: { search?: string; course?: string }) {
  return useQuery({
    queryKey: enrollmentKeys.list(params),
    queryFn: async () => {
      const qs = new URLSearchParams();
      if (params.search) qs.set('search', params.search);
      if (params.course) qs.set('course', params.course);
      const res = await apiFetch<Enrollment[]>(`/admin/enrollments?${qs.toString()}`);
      return res.data as Enrollment[];
    },
  });
}

export function useEnrollmentProgress(enrollmentId: string | null) {
  return useQuery({
    queryKey: enrollmentKeys.progress(enrollmentId ?? ''),
    queryFn: async () => {
      const res = await apiFetch<EnrollmentProgress>(`/admin/enrollments/${enrollmentId}/progress`);
      return res.data as EnrollmentProgress;
    },
    enabled: !!enrollmentId,
  });
}

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export interface TrendPoint {
  month: string;
  enrolled: number;
  completed: number;
}

export interface TopCourse {
  id: string;
  title: string;
  enrolled: number;
  completed: number;
  completionRate: number;
}

export interface RetentionStats {
  registeredStudents: number;
  enrolledStudents: number;
  enrollmentRate: number;
  returningStudents: number;
  retentionRate: number;
}

export const analyticsKeys = {
  all: ['analytics'] as const,
  enrollmentTrend: (from: string, to: string) => [...analyticsKeys.all, 'enrollment-trend', from, to] as const,
  topCourses:      () => [...analyticsKeys.all, 'top-courses'] as const,
  retention:       () => [...analyticsKeys.all, 'retention'] as const,
};

const STALE = 5 * 60 * 1000; // 5 min

export function useEnrollmentTrend(from: string, to: string) {
  return useQuery({
    queryKey: analyticsKeys.enrollmentTrend(from, to),
    queryFn: async (): Promise<TrendPoint[]> => {
      const qs = new URLSearchParams({ from, to });
      const res = await apiFetch<TrendPoint[]>(`/admin/analytics/enrollment-trend?${qs}`);
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    staleTime: STALE,
    enabled: !!from && !!to,
  });
}

export function useTopCourses() {
  return useQuery({
    queryKey: analyticsKeys.topCourses(),
    queryFn: async (): Promise<TopCourse[]> => {
      const res = await apiFetch<TopCourse[]>('/admin/analytics/top-courses');
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    staleTime: STALE,
  });
}

export function useRetention() {
  return useQuery({
    queryKey: analyticsKeys.retention(),
    queryFn: async (): Promise<RetentionStats> => {
      const res = await apiFetch<RetentionStats>('/admin/analytics/retention');
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    staleTime: STALE,
  });
}

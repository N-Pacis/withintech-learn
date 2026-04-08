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

export interface DailyActivePoint {
  date: string;
  active: number;
}

export interface UsersOverTimePoint {
  date: string;
  users: number;
}

export interface ChallengeLeaderboardEntry {
  userId:         string;
  firstName:      string;
  lastName:       string;
  problemsSolved: number;
  avgPassRate:    number;
}

export interface ChallengeAnalytics {
  totalPublished:    number;
  totalDraft:        number;
  totalSubmissions:  number;
  overallPassRate:   number;
  totalSolvers:      number;
  topChallenges:     { id: string; title: string; difficulty: string; submissions: number; passRate: number }[];
  hardestChallenges: { id: string; title: string; difficulty: string; submissions: number; passRate: number }[];
}

export const analyticsKeys = {
  all: ['analytics'] as const,
  enrollmentTrend:          (from: string, to: string) => [...analyticsKeys.all, 'enrollment-trend', from, to] as const,
  topCourses:               () => [...analyticsKeys.all, 'top-courses'] as const,
  retention:                () => [...analyticsKeys.all, 'retention'] as const,
  dailyActiveLearners:      (from: string, to: string) => [...analyticsKeys.all, 'daily-active-learners', from, to] as const,
  usersOverTime:            (from: string, to: string) => [...analyticsKeys.all, 'users-over-time', from, to] as const,
  challengeAnalytics:       () => [...analyticsKeys.all, 'challenges'] as const,
  challengeLeaderboard:     (from: string, to: string) => [...analyticsKeys.all, 'challenge-leaderboard', from, to] as const,
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

export function useDailyActiveLearners(from: string, to: string) {
  return useQuery({
    queryKey: analyticsKeys.dailyActiveLearners(from, to),
    queryFn: async (): Promise<DailyActivePoint[]> => {
      const qs = new URLSearchParams({ from, to });
      const res = await apiFetch<DailyActivePoint[]>(`/admin/analytics/daily-active-learners?${qs}`);
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    staleTime: STALE,
    enabled: !!from && !!to,
  });
}

export function useUsersOverTime(from: string, to: string) {
  return useQuery({
    queryKey: analyticsKeys.usersOverTime(from, to),
    queryFn: async (): Promise<UsersOverTimePoint[]> => {
      const qs = new URLSearchParams({ from, to });
      const res = await apiFetch<UsersOverTimePoint[]>(`/admin/analytics/users-over-time?${qs}`);
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    staleTime: STALE,
    enabled: !!from && !!to,
  });
}

export function useChallengeAnalytics() {
  return useQuery({
    queryKey: analyticsKeys.challengeAnalytics(),
    queryFn: async (): Promise<ChallengeAnalytics> => {
      const res = await apiFetch<ChallengeAnalytics>('/admin/analytics/challenges');
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    staleTime: STALE,
  });
}

export function useChallengeLeaderboard(from: string, to: string) {
  return useQuery({
    queryKey: analyticsKeys.challengeLeaderboard(from, to),
    queryFn: async (): Promise<ChallengeLeaderboardEntry[]> => {
      const qs = new URLSearchParams({ from, to });
      const res = await apiFetch<ChallengeLeaderboardEntry[]>(`/admin/analytics/challenge-leaderboard?${qs}`);
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    staleTime: STALE,
    enabled: !!from && !!to,
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export type Difficulty = 'easy' | 'medium' | 'hard';
export type ChallengeStatus = 'draft' | 'published';
export type SubmissionStatus =
  | 'accepted'
  | 'wrong_answer'
  | 'time_limit_exceeded'
  | 'runtime_error'
  | 'compile_error';

export type ChallengeLanguage = 'python' | 'java' | 'javascript' | 'c' | 'cpp' | 'go';

export type ParamType =
  | 'int' | 'float' | 'double' | 'char' | 'string' | 'boolean'
  | 'int[]' | 'float[]' | 'double[]' | 'char[]' | 'string[]' | 'boolean[]'
  | 'int[][]' | 'float[][]' | 'double[][]' | 'char[][]' | 'string[][]' | 'boolean[][]';

export interface FunctionParam {
  name: string;
  type: ParamType;
}

export interface StarterCode {
  python:     string;
  java:       string;
  javascript: string;
  c:          string;
  cpp:        string;
  go:         string;
}

// Admin
export interface AdminChallenge {
  id:             string;
  title:          string;
  slug:           string;
  description:    string;
  difficulty:     Difficulty;
  status:         ChallengeStatus;
  starterCode:    StarterCode;
  functionParams: FunctionParam[] | null;
  returnType:     string | null;
  timeLimit:      number;
  orderIndex:     number;
  createdAt:      string;
  updatedAt:      string;
  createdBy:      { id: string; firstName: string; lastName: string };
  _count:         { testCases: number; submissions: number };
}

export interface ChallengeTestCase {
  id:             string;
  challengeId:    string;
  input:          string;
  expectedOutput: string;
  isHidden:       boolean;
  orderIndex:     number;
}

export interface AdminChallengeDetail extends AdminChallenge {
  testCases: ChallengeTestCase[];
}

export interface AdminChallengesPage {
  total:      number;
  page:       number;
  limit:      number;
  challenges: AdminChallenge[];
}

// Student
export interface StudentChallengeListItem {
  id:          string;
  title:       string;
  slug:        string;
  difficulty:  Difficulty;
  testCount:   number;
  completed:   boolean;
  completedAt: string | null;
}

export interface StudentChallengesPage {
  total:      number;
  page:       number;
  limit:      number;
  challenges: StudentChallengeListItem[];
}

export interface VisibleTestCase {
  id:             string;
  input:          string;
  expectedOutput: string;
  orderIndex:     number;
}

export interface StudentChallenge {
  id:               string;
  title:            string;
  slug:             string;
  description:      string;
  difficulty:       Difficulty;
  starterCode:      StarterCode;
  functionParams:   FunctionParam[] | null;
  returnType:       string | null;
  timeLimit:        number;
  visibleTestCases: VisibleTestCase[];
  completed:        boolean;
  completedAt:      string | null;
}

export interface TestCaseResult {
  passed:         boolean;
  input:          string | null;
  actualOutput:   string | null;
  expectedOutput: string | null;
  stderr:         string;
}

export interface SubmissionResult {
  submissionId: string | null;
  status:       SubmissionStatus;
  testsPassed:  number;
  totalTests:   number;
  compileError: string | null;
  results:      TestCaseResult[];
}

export interface SubmissionHistoryItem {
  id:          string;
  language:    string;
  status:      SubmissionStatus;
  testsPassed: number;
  totalTests:  number;
  submittedAt: string;
}

// ─── Query Keys ───────────────────────────────────────────────────────────────

export interface ChallengeStats {
  totalSubmissions: number;
  uniqueAttempts:   number;
  uniqueSolvers:    number;
  acceptedCount:    number;
  passRate:         number;
  statusBreakdown:  Record<string, number>;
  languageBreakdown: Record<string, number>;
  submissionTrend:  { date: string; total: number; accepted: number }[];
}

export const challengeKeys = {
  all:             ['challenges'] as const,
  adminList:       (params?: object) => ['challenges', 'admin', 'list', params] as const,
  adminOne:        (id: string)     => ['challenges', 'admin', id] as const,
  adminStats:      (id: string)     => ['challenges', 'admin', id, 'stats'] as const,
  studentList:     (params?: object) => ['challenges', 'student', 'list', params] as const,
  studentOne:      (slug: string)   => ['challenges', 'student', slug] as const,
  submissions:     (slug: string)   => ['challenges', 'submissions', slug] as const,
};

// ─── Admin Queries ────────────────────────────────────────────────────────────

export function useAdminChallenges(params?: {
  page?: number;
  limit?: number;
  difficulty?: Difficulty;
  status?: ChallengeStatus;
}) {
  return useQuery({
    queryKey: challengeKeys.adminList(params),
    queryFn:  () =>
      apiFetch<AdminChallengesPage>(`/admin/challenges?${new URLSearchParams(
        Object.fromEntries(Object.entries(params ?? {}).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]))
      )}`),
    select: res => res.data,
  });
}

export function useAdminChallenge(id: string) {
  return useQuery({
    queryKey: challengeKeys.adminOne(id),
    queryFn:  () => apiFetch<AdminChallengeDetail>(`/admin/challenges/${id}`),
    select:   res => res.data,
    enabled:  !!id,
  });
}

export function useAdminChallengeStats(id: string, enabled = true) {
  return useQuery({
    queryKey: challengeKeys.adminStats(id),
    queryFn:  () => apiFetch<ChallengeStats>(`/admin/challenges/${id}/stats`),
    select:   res => res.data,
    enabled:  !!id && enabled,
    staleTime: 2 * 60 * 1000,
  });
}

// ─── Admin Mutations ──────────────────────────────────────────────────────────

export function useCreateChallenge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      title:           string;
      description:     string;
      difficulty:      Difficulty;
      starterCode?:    Partial<StarterCode>;
      functionParams?: FunctionParam[];
      returnType?:     string;
      timeLimit?:      number;
      orderIndex?:     number;
    }) =>
      apiFetch('/admin/challenges', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: challengeKeys.all }),
  });
}

export function useUpdateChallenge(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<{
      title:          string;
      description:    string;
      difficulty:     Difficulty;
      starterCode:    Partial<StarterCode>;
      functionParams: FunctionParam[];
      returnType:     string;
      timeLimit:      number;
      orderIndex:     number;
    }>) =>
      apiFetch(`/admin/challenges/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: challengeKeys.adminOne(id) });
      qc.invalidateQueries({ queryKey: challengeKeys.all });
    },
  });
}

export function useDeleteChallenge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/admin/challenges/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: challengeKeys.all }),
  });
}

export function usePublishChallenge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/admin/challenges/${id}/publish`, { method: 'PATCH' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: challengeKeys.all }),
  });
}

export function useUnpublishChallenge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/admin/challenges/${id}/unpublish`, { method: 'PATCH' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: challengeKeys.all }),
  });
}

export function useAddTestCase(challengeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      input:          string;
      expectedOutput: string;
      isHidden:       boolean;
      orderIndex:     number;
    }) =>
      apiFetch(`/admin/challenges/${challengeId}/test-cases`, {
        method: 'POST',
        body:   JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: challengeKeys.adminOne(challengeId) }),
  });
}

export function useUpdateTestCase(challengeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ testCaseId, ...body }: {
      testCaseId:     string;
      input?:         string;
      expectedOutput?: string;
      isHidden?:       boolean;
      orderIndex?:     number;
    }) =>
      apiFetch(`/admin/test-cases/${testCaseId}`, { method: 'PATCH', body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: challengeKeys.adminOne(challengeId) }),
  });
}

export function useDeleteTestCase(challengeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (testCaseId: string) =>
      apiFetch(`/admin/test-cases/${testCaseId}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: challengeKeys.adminOne(challengeId) }),
  });
}

export function useRunAdminChallenge(id: string) {
  return useMutation({
    mutationFn: (body: { language: ChallengeLanguage; code: string }) =>
      apiFetch<SubmissionResult>(`/admin/challenges/${id}/run`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  });
}

// ─── Student Queries ──────────────────────────────────────────────────────────

export function useStudentChallenges(params?: {
  page?:       number;
  limit?:      number;
  difficulty?: Difficulty;
}) {
  return useQuery({
    queryKey: challengeKeys.studentList(params),
    queryFn:  () =>
      apiFetch<StudentChallengesPage>(`/student/challenges?${new URLSearchParams(
        Object.fromEntries(Object.entries(params ?? {}).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]))
      )}`),
    select: res => res.data,
  });
}

export function useStudentChallenge(slug: string) {
  return useQuery({
    queryKey: challengeKeys.studentOne(slug),
    queryFn:  () => apiFetch<StudentChallenge>(`/student/challenges/${slug}`),
    select:   res => res.data,
    enabled:  !!slug,
  });
}

export function useMySubmissions(slug: string) {
  return useQuery({
    queryKey: challengeKeys.submissions(slug),
    queryFn:  () =>
      apiFetch<SubmissionHistoryItem[]>(`/student/challenges/${slug}/submissions`),
    select:  res => res.data,
    enabled: !!slug,
  });
}

// ─── Student Mutations ────────────────────────────────────────────────────────

export function useSubmitChallenge(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { language: ChallengeLanguage; code: string }) =>
      apiFetch<SubmissionResult>(`/student/challenges/${slug}/submit`, {
        method: 'POST',
        body:   JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: challengeKeys.studentOne(slug) });
      qc.invalidateQueries({ queryKey: challengeKeys.submissions(slug) });
      qc.invalidateQueries({ queryKey: challengeKeys.studentList() });
    },
  });
}

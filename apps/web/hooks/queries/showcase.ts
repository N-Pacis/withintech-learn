import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ShowcaseStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ARCHIVED';

export type ChallengeCategory =
  | 'Agriculture'
  | 'Healthcare'
  | 'Education'
  | 'Water'
  | 'Energy'
  | 'Finance'
  | 'Transport'
  | 'Environment'
  | 'Employment'
  | 'Digital';

export const CHALLENGE_CATEGORIES: ChallengeCategory[] = [
  'Agriculture',
  'Healthcare',
  'Education',
  'Water',
  'Energy',
  'Finance',
  'Transport',
  'Environment',
  'Employment',
  'Digital',
];


export interface ShowcaseImage {
  id: string;
  projectId: string;
  storageKey: string;
  imageUrl: string;
  orderIndex: number;
}

export interface ShowcaseTechTag {
  projectId: string;
  name: string;
}

export interface ShowcaseAITool {
  projectId: string;
  name: string;
}

export interface ShowcaseCategoryTag {
  projectId: string;
  category: ChallengeCategory;
}

export interface ShowcaseProject {
  id: string;
  authorId: string;
  author: { firstName: string; lastName: string; email?: string };
  title: string;
  description: string | null;
  problemStatement: string;
  categories: ShowcaseCategoryTag[];
  githubUrl: string | null;
  demoUrl: string | null;
  thumbnailKey: string | null;
  thumbnailUrl: string | null;
  aiUsageDescription: string | null;
  status: ShowcaseStatus;
  rejectionReason: string | null;
  featuredAt: string | null;
  hasLiked?: boolean;
  images: ShowcaseImage[];
  techTags: ShowcaseTechTag[];
  aiTools: ShowcaseAITool[];
  _count?: { likes: number };
  createdAt: string;
  updatedAt: string;
}

export interface ShowcasePage {
  total: number;
  page: number;
  limit: number;
  projects: ShowcaseProject[];
}

export interface CreateShowcaseInput {
  title: string;
  description?: string;
  problemStatement: string;
  categories?: ChallengeCategory[];
  githubUrl?: string;
  demoUrl?: string;
  aiUsageDescription?: string;
  techTags?: string[];
  aiTools?: string[];
}

const toQS = (params: object) =>
  new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => [k, String(v)])),
  ).toString();

// ─── Query keys ───────────────────────────────────────────────────────────────

export const showcaseKeys = {
  all:           ['showcase'] as const,
  studentLists:  () => ['showcase', 'student', 'list'] as const,
  studentList:   (p: object) => [...showcaseKeys.studentLists(), p] as const,
  studentDetail: (id: string) => ['showcase', 'student', id] as const,
  adminLists:    () => ['showcase', 'admin', 'list'] as const,
  adminList:     (p: object) => [...showcaseKeys.adminLists(), p] as const,
  adminDetail:   (id: string) => ['showcase', 'admin', id] as const,
  publicLists:   () => ['showcase', 'public', 'list'] as const,
  publicList:    (p: object) => [...showcaseKeys.publicLists(), p] as const,
  publicDetail:  (id: string) => ['showcase', 'public', id] as const,
};

// ─── Student hooks ────────────────────────────────────────────────────────────

export function useStudentShowcaseProjects(params: { page?: number; limit?: number; status?: ShowcaseStatus } = {}) {
  return useQuery({
    queryKey: showcaseKeys.studentList(params),
    queryFn: async () => {
      const qs = toQS(params);
      const res = await apiFetch<ShowcasePage>(`/student/showcase${qs ? `?${qs}` : ''}`);
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
  });
}

export function useStudentShowcaseProject(id: string) {
  return useQuery({
    queryKey: showcaseKeys.studentDetail(id),
    queryFn: async () => {
      const res = await apiFetch<ShowcaseProject>(`/student/showcase/${id}`);
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateShowcaseProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateShowcaseInput) => {
      const res = await apiFetch<ShowcaseProject>('/student/showcase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: showcaseKeys.studentLists() }),
  });
}

export function useArchiveShowcaseProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/student/showcase/${id}/archive`, { method: 'PATCH' });
      if (!res.success) throw new Error(res.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: showcaseKeys.studentLists() }),
  });
}

export function useDeleteShowcaseProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/student/showcase/${id}`, { method: 'DELETE' });
      if (!res.success) throw new Error(res.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: showcaseKeys.studentLists() }),
  });
}

export function useUploadShowcaseThumbnail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      const fd = new FormData();
      fd.append('image', file);
      const res = await apiFetch<{ thumbnailUrl: string }>(`/student/showcase/${id}/upload-thumbnail`, {
        method: 'POST',
        body: fd,
      });
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    onSuccess: (_data, { id }) => qc.invalidateQueries({ queryKey: showcaseKeys.studentDetail(id) }),
  });
}

export function useAddShowcaseImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      const fd = new FormData();
      fd.append('image', file);
      const res = await apiFetch<ShowcaseImage>(`/student/showcase/${id}/upload-image`, {
        method: 'POST',
        body: fd,
      });
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    onSuccess: (_data, { id }) => qc.invalidateQueries({ queryKey: showcaseKeys.studentDetail(id) }),
  });
}

export function useDeleteShowcaseImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, imageId }: { projectId: string; imageId: string }) => {
      const res = await apiFetch(`/student/showcase/${projectId}/images/${imageId}`, { method: 'DELETE' });
      if (!res.success) throw new Error(res.message);
    },
    onSuccess: (_data, { projectId }) =>
      qc.invalidateQueries({ queryKey: showcaseKeys.studentDetail(projectId) }),
  });
}

// ─── Admin hooks ──────────────────────────────────────────────────────────────

export function useAdminShowcaseProjects(params: {
  page?: number;
  limit?: number;
  status?: ShowcaseStatus;
  category?: ChallengeCategory;
  search?: string;
} = {}) {
  return useQuery({
    queryKey: showcaseKeys.adminList(params),
    queryFn: async () => {
      const qs = toQS(params);
      const res = await apiFetch<ShowcasePage>(`/admin/showcase${qs ? `?${qs}` : ''}`);
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
  });
}

export function useAdminShowcaseProject(id: string) {
  return useQuery({
    queryKey: showcaseKeys.adminDetail(id),
    queryFn: async () => {
      const res = await apiFetch<ShowcaseProject>(`/admin/showcase/${id}`);
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useApproveShowcaseProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/admin/showcase/${id}/approve`, { method: 'PATCH' });
      if (!res.success) throw new Error(res.message);
    },
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: showcaseKeys.adminDetail(id) });
      qc.invalidateQueries({ queryKey: showcaseKeys.adminLists() });
    },
  });
}

export function useRejectShowcaseProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await apiFetch(`/admin/showcase/${id}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (!res.success) throw new Error(res.message);
    },
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: showcaseKeys.adminDetail(id) });
      qc.invalidateQueries({ queryKey: showcaseKeys.adminLists() });
    },
  });
}

export function useToggleFeatured() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/admin/showcase/${id}/feature`, { method: 'PATCH' });
      if (!res.success) throw new Error(res.message);
    },
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: showcaseKeys.adminDetail(id) });
      qc.invalidateQueries({ queryKey: showcaseKeys.adminLists() });
    },
  });
}

export function useAdminDeleteShowcaseProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/admin/showcase/${id}`, { method: 'DELETE' });
      if (!res.success) throw new Error(res.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: showcaseKeys.adminLists() }),
  });
}

export function useAdminArchiveShowcaseProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/admin/showcase/${id}/archive`, { method: 'PATCH' });
      if (!res.success) throw new Error(res.message);
    },
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: showcaseKeys.adminDetail(id) });
      qc.invalidateQueries({ queryKey: showcaseKeys.adminLists() });
    },
  });
}

// ─── Public hooks ─────────────────────────────────────────────────────────────

export function usePublicShowcaseProjects(params: {
  page?: number;
  limit?: number;
  category?: ChallengeCategory;
  search?: string;
  sort?: 'newest' | 'oldest' | 'mostLiked';
} = {}) {
  return useQuery({
    queryKey: showcaseKeys.publicList(params),
    queryFn: async () => {
      const qs = toQS(params);
      const res = await apiFetch<ShowcasePage>(`/public/showcase${qs ? `?${qs}` : ''}`);
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
  });
}

export function usePublicShowcaseProject(id: string) {
  return useQuery({
    queryKey: showcaseKeys.publicDetail(id),
    queryFn: async () => {
      const res = await apiFetch<ShowcaseProject>(`/public/showcase/${id}`);
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useToggleLike() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch<{ liked: boolean; likeCount: number }>(`/showcase/${id}/like`, {
        method: 'POST',
      });
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: showcaseKeys.publicDetail(id) });
      const prev = qc.getQueryData<ShowcaseProject>(showcaseKeys.publicDetail(id));
      if (prev) {
        qc.setQueryData(showcaseKeys.publicDetail(id), {
          ...prev,
          hasLiked: !prev.hasLiked,
          _count: { likes: (prev._count?.likes ?? 0) + (prev.hasLiked ? -1 : 1) },
        });
      }
      return { prev };
    },
    onError: (_err, id, ctx) => {
      if (ctx?.prev) qc.setQueryData(showcaseKeys.publicDetail(id), ctx.prev);
    },
    onSettled: (_data, _err, id) => {
      qc.invalidateQueries({ queryKey: showcaseKeys.publicDetail(id) });
    },
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export type CourseStatus = 'draft' | 'published' | 'archived';

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnailKey: string | null;
  thumbnailUrl: string | null;
  status: CourseStatus;
  createdById: string;
  createdBy: { id: string; firstName: string; lastName: string };
  createdAt: string;
  updatedAt: string;
}

export interface CoursesPage {
  total: number;
  page: number;
  limit: number;
  courses: Course[];
}

// Courses returned to students/public — no createdBy, status always published
export type EnrollmentStatus = 'PENDING' | 'ENROLLED';
export type CourseFilter = 'all' | 'enrolled' | 'not_enrolled';

export interface PublishedCourse {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnailKey: string | null;
  thumbnailUrl: string | null;
  status: 'published';
  module_count: number;
  enrollment_status: EnrollmentStatus | null;
  enrolled_at: string | null;
}

export interface PublishedCoursesPage {
  total: number;
  page: number;
  limit: number;
  courses: PublishedCourse[];
}

// ─── Query keys ───────────────────────────────────────────────────────────────

export const courseKeys = {
  // Admin
  all:    ['courses'] as const,
  lists:  () => [...courseKeys.all, 'list'] as const,
  list:   (p: { page: number; limit: number; status?: CourseStatus }) => [...courseKeys.lists(), p] as const,
  detail: (id: string) => [...courseKeys.all, id] as const,
  // Student
  student: {
    lists: () => ['courses', 'student', 'list'] as const,
    list:  (p: { page: number; limit: number; search?: string; filter?: CourseFilter }) => [...courseKeys.student.lists(), p] as const,
  },
  // Public
  public: {
    top: ['courses', 'public', 'top'] as const,
  },
};

// ─── Admin queries ────────────────────────────────────────────────────────────

export function useCourses(params: { page: number; limit: number; status?: CourseStatus } = { page: 1, limit: 20 }) {
  return useQuery({
    queryKey: courseKeys.list(params),
    queryFn: async (): Promise<CoursesPage> => {
      const qs = new URLSearchParams({ page: String(params.page), limit: String(params.limit) });
      if (params.status) qs.set('status', params.status);
      const res = await apiFetch<CoursesPage>(`/admin/courses?${qs}`);
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
  });
}

export function useCourse(id: string) {
  return useQuery({
    queryKey: courseKeys.detail(id),
    queryFn: async (): Promise<Course> => {
      const res = await apiFetch<Course>(`/admin/courses/${id}`);
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    enabled: !!id,
  });
}

// ─── Student queries ──────────────────────────────────────────────────────────

export function usePublishedCourse(slug: string) {
  return useQuery({
    queryKey: [...courseKeys.student.lists(), slug] as const,
    queryFn: async () => {
      const res = await apiFetch<PublishedCourse & { modules: unknown[]; quiz: unknown | null }>(`/student/courses/${slug}`);
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    enabled: !!slug,
  });
}

export function usePublishedCourses(
  params: { page: number; limit: number; search?: string; filter?: CourseFilter } = { page: 1, limit: 20 },
) {
  return useQuery({
    queryKey: courseKeys.student.list(params),
    queryFn: async (): Promise<PublishedCoursesPage> => {
      const qs = new URLSearchParams({ page: String(params.page), limit: String(params.limit) });
      if (params.search) qs.set('search', params.search);
      if (params.filter) qs.set('filter', params.filter);
      const res = await apiFetch<PublishedCoursesPage>(`/student/courses?${qs}`);
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
  });
}

export function useEnrollInCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (courseId: string) => {
      const res = await apiFetch(`/student/courses/${courseId}/enroll`, { method: 'POST' });
      if (!res.success) throw new Error(res.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.student.lists() });
    },
  });
}

// ─── Public queries ───────────────────────────────────────────────────────────

export function useTopCourses() {
  return useQuery({
    queryKey: courseKeys.public.top,
    queryFn: async (): Promise<PublishedCourse[]> => {
      const res = await apiFetch<PublishedCourse[]>('/public/courses');
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
  });
}

// ─── Admin mutations ──────────────────────────────────────────────────────────

export function useCreateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; description?: string }): Promise<Course> => {
      const res = await apiFetch<Course>('/admin/courses', { method: 'POST', body: JSON.stringify(data) });
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
    },
  });
}

export function useUpdateCourse(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title?: string; description?: string }): Promise<Course> => {
      const res = await apiFetch<Course>(`/admin/courses/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(courseKeys.detail(id), updated);
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/admin/courses/${id}`, { method: 'DELETE' });
      if (!res.success) throw new Error(res.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
    },
  });
}

export function useUploadThumbnail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }): Promise<{ storageKey: string; url: string }> => {
      const formData = new FormData();
      formData.append('image', file);
      const res = await apiFetch<{ storageKey: string; url: string }>(
        `/admin/courses/${id}/upload-thumbnail`,
        { method: 'POST', body: formData },
      );
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
    },
  });
}

export function usePublishCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<Course> => {
      const res = await apiFetch<Course>(`/admin/courses/${id}/publish`, { method: 'PATCH' });
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(courseKeys.detail(updated.id), updated);
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
    },
  });
}

export function useArchiveCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<Course> => {
      const res = await apiFetch<Course>(`/admin/courses/${id}/archive`, { method: 'PATCH' });
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(courseKeys.detail(updated.id), updated);
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
    },
  });
}

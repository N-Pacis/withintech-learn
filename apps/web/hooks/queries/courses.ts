import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CourseStatus = "draft" | "published" | "archived";

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
export type EnrollmentStatus = "PENDING" | "ENROLLED" | "PASSED";
export type CourseFilter = "all" | "enrolled" | "not_enrolled" | "passed";

export interface PublishedCourse {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnailKey: string | null;
  thumbnailUrl: string | null;
  status: "published";
  module_count: number;
  enrollment_status: EnrollmentStatus | null;
  enrolled_at: string | null;
}

export interface StudentCourseModule {
  id: string;
  title: string;
  orderIndex: number;
  isCompleted: boolean;
  isLocked: boolean;
  lessonCount: number;
  hasLessons: boolean;
}

export interface StudentCourse {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnailUrl: string | null;
  status: "published";
  modules: StudentCourseModule[];
  enrollment_status: EnrollmentStatus;
  enrolled_at: string;
  quiz: StudentModuleQuiz | null;
  lastCourseQuizAttempt: QuizAttemptSummary | null;
}

export interface CertificateData {
  id: string;
  completedAt: string;
  recipientName: string;
  courseTitle: string;
  courseSlug: string;
  modules: string[];
}

export interface StudentBlock {
  id: string;
  type: "text" | "image" | "code";
  content: string | null;
  url: string | null;
  caption: string | null;
  language: string | null;
  orderIndex: number;
}

export interface QuizOption {
  id: string;
  text: string;
  orderIndex: number;
}

export interface QuizQuestion {
  id: string;
  text: string;
  orderIndex: number;
  options: QuizOption[];
}

export interface StudentModuleQuiz {
  id: string;
  title: string;
  passingScore: number;
  questions: QuizQuestion[];
}

export interface QuizAttemptSummary {
  id: string;
  score: number;
  status: "pass" | "fail";
  createdAt: string;
}

export interface MarkedOption {
  id: string;
  text: string;
  isCorrect?: boolean; // omitted for course-level quizzes
  wasChosen: boolean;
}

export interface MarkedQuestion {
  questionId: string;
  text: string;
  isCorrect: boolean;
  options: MarkedOption[];
}

export interface QuizAttemptResult {
  attempt: QuizAttemptSummary & {
    quizId: string;
    lessonId: string | null;
    moduleId: string | null;
    courseId: string | null;
  };
  questions: MarkedQuestion[];
}

export interface StudentLesson {
  id: string;
  title: string;
  orderIndex: number;
  isCompleted: boolean;
  isLocked: boolean;
}

export interface StudentLessonDetail {
  id: string;
  title: string;
  orderIndex: number;
  blocks: StudentBlock[];
  quiz: StudentModuleQuiz;
  lastAttempt: QuizAttemptSummary | null;
}

export interface StudentModuleDetail {
  id: string;
  title: string;
  orderIndex: number;
  blocks: StudentBlock[];
  lessons: StudentLesson[];
  quiz: StudentModuleQuiz | null;
  lastAttempt: QuizAttemptSummary | null;
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
  all: ["courses"] as const,
  lists: () => [...courseKeys.all, "list"] as const,
  list: (p: { page: number; limit: number; status?: CourseStatus }) =>
    [...courseKeys.lists(), p] as const,
  detail: (id: string) => [...courseKeys.all, id] as const,
  // Student
  student: {
    lists: () => ["courses", "student", "list"] as const,
    list: (p: {
      page: number;
      limit: number;
      search?: string;
      filter?: CourseFilter;
    }) => [...courseKeys.student.lists(), p] as const,
  },
  // Public
  public: {
    top: ["courses", "public", "top"] as const,
  },
};

// ─── Admin queries ────────────────────────────────────────────────────────────

export function useCourses(
  params: { page: number; limit: number; status?: CourseStatus } = {
    page: 1,
    limit: 20,
  },
) {
  return useQuery({
    queryKey: courseKeys.list(params),
    queryFn: async (): Promise<CoursesPage> => {
      const qs = new URLSearchParams({
        page: String(params.page),
        limit: String(params.limit),
      });
      if (params.status) qs.set("status", params.status);
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
      const res = await apiFetch<StudentCourse>(`/student/courses/${slug}`);
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    enabled: !!slug,
  });
}

export function useStudentModule(slug: string, moduleId: string) {
  return useQuery({
    queryKey: ["student", "module", slug, moduleId] as const,
    queryFn: async () => {
      const res = await apiFetch<StudentModuleDetail>(
        `/student/courses/${slug}/modules/${moduleId}`,
      );
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    enabled: !!slug && !!moduleId,
  });
}

export function useStudentLesson(
  slug: string,
  moduleId: string,
  lessonId: string,
) {
  return useQuery({
    queryKey: ["student", "lesson", slug, moduleId, lessonId] as const,
    queryFn: async () => {
      const res = await apiFetch<StudentLessonDetail>(
        `/student/courses/${slug}/modules/${moduleId}/lessons/${lessonId}`,
      );
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    enabled: !!slug && !!moduleId && !!lessonId,
  });
}

export function usePublishedCourses(
  params: {
    page: number;
    limit: number;
    search?: string;
    filter?: CourseFilter;
  } = { page: 1, limit: 20 },
) {
  return useQuery({
    queryKey: courseKeys.student.list(params),
    queryFn: async (): Promise<PublishedCoursesPage> => {
      const qs = new URLSearchParams({
        page: String(params.page),
        limit: String(params.limit),
      });
      if (params.search) qs.set("search", params.search);
      if (params.filter) qs.set("filter", params.filter);
      const res = await apiFetch<PublishedCoursesPage>(
        `/student/courses?${qs}`,
      );
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
  });
}

export function useCompleteModule(slug: string) {
  const queryClient = useQueryClient();
  const courseKey = [...courseKeys.student.lists(), slug] as const;
  return useMutation({
    mutationFn: async (moduleId: string) => {
      const res = await apiFetch(
        `/student/courses/${slug}/modules/${moduleId}/progress`,
        { method: "POST" },
      );
      if (!res.success) throw new Error(res.message);
    },
    onSuccess: (_, moduleId) => {
      // Optimistically update isCompleted + recompute isLocked for all modules
      queryClient.setQueryData(courseKey, (old: StudentCourse | undefined) => {
        if (!old) return old;
        const updated = old.modules.map((m) =>
          m.id === moduleId ? { ...m, isCompleted: true } : m,
        );
        const firstIncomplete = updated.findIndex((m) => !m.isCompleted);
        const reachableUpTo =
          firstIncomplete === -1 ? updated.length : firstIncomplete;
        return {
          ...old,
          modules: updated.map((m, i) => ({
            ...m,
            isLocked: i > reachableUpTo,
          })),
        };
      });
      queryClient.invalidateQueries({ queryKey: courseKey });
    },
  });
}

export function useCompleteLesson(slug: string, moduleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (lessonId: string) => {
      const res = await apiFetch(
        `/student/courses/${slug}/modules/${moduleId}/lessons/${lessonId}/progress`,
        { method: "POST" },
      );
      if (!res.success) throw new Error(res.message);
    },
    onSuccess: () => {
      // Invalidate the module query to refresh lesson completion/lock states
      queryClient.invalidateQueries({
        queryKey: ["student", "module", slug, moduleId],
      });
      // Invalidate the course query in case module auto-completed
      queryClient.invalidateQueries({
        queryKey: [...courseKeys.student.lists(), slug],
      });
    },
  });
}

export function useCompleteCourse(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await apiFetch(`/student/courses/${slug}/complete`, {
        method: "POST",
      });
      if (!res.success) throw new Error(res.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.student.lists() });
      queryClient.invalidateQueries({
        queryKey: [...courseKeys.student.lists(), slug],
      });
    },
  });
}

export function useSubmitQuiz() {
  return useMutation({
    mutationFn: async ({
      quizId,
      answers,
    }: {
      quizId: string;
      answers: { questionId: string; chosenOptionIds: string[] }[];
    }): Promise<QuizAttemptResult> => {
      const res = await apiFetch<QuizAttemptResult>(
        `/student/quizzes/${quizId}/attempt`,
        {
          method: "POST",
          body: JSON.stringify({ answers }),
        },
      );
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
  });
}

export function useEnrollInCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (courseId: string) => {
      const res = await apiFetch(`/student/courses/${courseId}/enroll`, {
        method: "POST",
      });
      if (!res.success) throw new Error(res.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.student.lists() });
    },
  });
}

// ─── Public queries ───────────────────────────────────────────────────────────

export interface PublicCourseDetail {
  title: string;
  slug: string;
  description: string | null;
  thumbnailUrl: string | null;
  modules: string[];
}

export function usePublicCourseDetail(slug: string) {
  return useQuery({
    queryKey: ["courses", "public", "detail", slug] as const,
    queryFn: async (): Promise<PublicCourseDetail> => {
      const res = await apiFetch<PublicCourseDetail>(`/public/courses/${slug}`);
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    enabled: !!slug,
  });
}

export interface TopCourse {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnailKey: string | null;
  thumbnailUrl: string | null;
  status: "published";
  createdAt: string;
  tag: "popular" | "new" | null;
}

export function useTopCourses() {
  return useQuery({
    queryKey: courseKeys.public.top,
    queryFn: async (): Promise<TopCourse[]> => {
      const res = await apiFetch<TopCourse[]>("/public/courses");
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
  });
}

export interface StudentStats {
  enrolled: number;
  completed: number;
  modulesFinished: number;
  completionRate: number;
  total: number;
}

export interface StudentCertificateSummary {
  id: string;
  completedAt: string;
  recipientName: string;
  courseTitle: string;
  courseSlug: string;
}

export function useStudentStats() {
  return useQuery({
    queryKey: ["student", "stats"] as const,
    queryFn: async (): Promise<StudentStats> => {
      const res = await apiFetch<StudentStats>("/student/stats");
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
  });
}

export function useStudentCertificates() {
  return useQuery({
    queryKey: ["student", "certificates"] as const,
    queryFn: async (): Promise<StudentCertificateSummary[]> => {
      const res = await apiFetch<StudentCertificateSummary[]>(
        "/student/certificates",
      );
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
  });
}

export function useCertificate(userId: string, courseSlug: string) {
  return useQuery({
    queryKey: ["certificate", userId, courseSlug] as const,
    queryFn: async (): Promise<CertificateData> => {
      const res = await apiFetch<CertificateData>(
        `/certificates/${userId}/${courseSlug}`,
      );
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    enabled: !!userId && !!courseSlug,
  });
}

// ─── Admin mutations ──────────────────────────────────────────────────────────

export function useCreateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
    }): Promise<Course> => {
      const res = await apiFetch<Course>("/admin/courses", {
        method: "POST",
        body: JSON.stringify(data),
      });
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
    mutationFn: async (data: {
      title?: string;
      description?: string;
    }): Promise<Course> => {
      const res = await apiFetch<Course>(`/admin/courses/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
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
      const res = await apiFetch(`/admin/courses/${id}`, { method: "DELETE" });
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
    mutationFn: async ({
      id,
      file,
    }: {
      id: string;
      file: File;
    }): Promise<{ storageKey: string; url: string }> => {
      const formData = new FormData();
      formData.append("image", file);
      const res = await apiFetch<{ storageKey: string; url: string }>(
        `/admin/courses/${id}/upload-thumbnail`,
        { method: "POST", body: formData },
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
      const res = await apiFetch<Course>(`/admin/courses/${id}/publish`, {
        method: "PATCH",
      });
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
      const res = await apiFetch<Course>(`/admin/courses/${id}/archive`, {
        method: "PATCH",
      });
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(courseKeys.detail(updated.id), updated);
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
    },
  });
}

export function useUnarchiveCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<Course> => {
      const res = await apiFetch<Course>(`/admin/courses/${id}/unarchive`, {
        method: "PATCH",
      });
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(courseKeys.detail(updated.id), updated);
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
    },
  });
}

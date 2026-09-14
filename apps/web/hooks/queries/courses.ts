import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CourseStatus = "draft" | "published" | "archived";
export type CourseAccessType = "FREE" | "PAID_COURSE" | "PAID_CERTIFICATE";

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnailKey: string | null;
  thumbnailUrl: string | null;
  status: CourseStatus;
  accessType: CourseAccessType;
  price: number | null;
  certificatePrice: number | null;
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
  accessType: CourseAccessType;
  price: number | null;
  certificatePrice: number | null;
  module_count: number;
  enrollment_status: EnrollmentStatus | null;
  enrolled_at: string | null;
  has_certificate: boolean;
}

export interface StudentCourseModule {
  id: string;
  title: string;
  orderIndex: number;
  isCompleted: boolean;
  isLocked: boolean;
  lessonCount: number;
  hasLessons: boolean;
  hasQuiz: boolean;
}

export interface StudentCourse {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnailUrl: string | null;
  status: "published";
  accessType: CourseAccessType;
  price: number | null;
  certificatePrice: number | null;
  modules: StudentCourseModule[];
  enrollment_status: EnrollmentStatus;
  enrolled_at: string;
  has_certificate: boolean;
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
  type: "text" | "image" | "code" | "playground";
  content: string | null;
  url: string | null;
  caption: string | null;
  language: string | null;
  linkedGroupId: string | null; // NEW
  playgroundData: { html?: string; css?: string; js?: string } | null;
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
  /** the clock ran out; the student never submitted this one */
  timedOut?: boolean;
}

/** One sitting of a quiz. The deadline is the server's, not the browser's. */
export interface QuizSession {
  sessionId: string;
  startedAt: string;
  expiresAt: string;
  timeLimitSeconds: number;
  secondsRemaining: number;
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
  maxAttempts: number;
  windowHours: number;
  attemptsUsed: number;
  attemptsLeft: number;
  /** ISO date when the next attempt unlocks; null when one is free now */
  retryAvailableAt: string | null;
}

/**
 * maxAttempts is a rolling limit: the student gets `maxAttempts` attempts per
 * `windowHours`, and slots come back on their own. A student is never blocked
 * permanently, so nobody has to reset anything for them.
 */
export interface QuizAttemptState {
  quizId: string;
  maxAttempts: number;
  windowHours: number;
  /** attempts inside the current window — this is what the limit counts */
  attemptsUsed: number;
  attemptsLeft: number;
  /** every attempt ever, for display only */
  attemptsTotal: number;
  /** true when the student may start another attempt right now */
  canAttempt: boolean;
  /** ISO date when the next attempt unlocks; null when one is free or passed */
  retryAvailableAt: string | null;
  passed: boolean;
  /** true when the quiz was edited after the stored attempt */
  contentChanged: boolean;
  /** how long one sitting lasts: two minutes per question */
  timeLimitSeconds: number;
  /** a sitting already in progress — resume it on its own clock, never a fresh one */
  activeSession: QuizSession | null;
  lastAttempt: QuizAttemptSummary | null;
  /** null for attempts made before answers were stored */
  lastResult: Pick<QuizAttemptResult, "attempt" | "questions"> | null;
}

export interface StudentLesson {
  id: string;
  title: string;
  orderIndex: number;
  isCompleted: boolean;
  isLocked: boolean;
  hasQuiz: boolean;
  quizId: string | null;
  /** A pass is recorded before the lesson is marked complete, so this is not
   *  the same thing as isCompleted. */
  quizPassed: boolean;
}

export interface StudentLessonDetail {
  id: string;
  title: string;
  orderIndex: number;
  blocks: StudentBlock[];
  quiz: StudentModuleQuiz | null;
  lastAttempt: QuizAttemptSummary | null;
}

export interface StudentModuleDetail {
  id: string;
  title: string;
  orderIndex: number;
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
    all: ["courses", "public", "all"] as const,
  },
};

// Per-user attempt state. Kept apart from courseKeys on purpose: the course
// payload is shared and content-shaped, this is personal and changes on submit.
export const quizAttemptKeys = {
  state: (quizId: string) => ["student", "quiz", quizId, "state"] as const,
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

export interface CoursePreview {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  accessType: CourseAccessType;
  price: number | null;
  certificatePrice: number | null;
  thumbnailUrl: string | null;
}

export function useCoursePreview(slug: string) {
  return useQuery({
    queryKey: ["course-preview", slug] as const,
    queryFn: async () => {
      const res = await apiFetch<CoursePreview>(
        `/public/courses/${slug}/preview`,
      );
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

export function useQuizAttemptState(quizId: string | undefined) {
  return useQuery({
    queryKey: quizAttemptKeys.state(quizId ?? ""),
    queryFn: async (): Promise<QuizAttemptState> => {
      const res = await apiFetch<QuizAttemptState>(
        `/student/quizzes/${quizId}/state`,
      );
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    enabled: !!quizId,
    // Attempt state is personal and changes on submit — never serve it stale.
    staleTime: 0,
    // While the student is waiting out a cooldown, poll slowly so the Retake
    // button comes back on its own instead of needing a refresh.
    refetchInterval: (query) => {
      const d = query.state.data;
      if (!d || d.passed || d.canAttempt || !d.retryAvailableAt) return false;
      return 60_000;
    },
  });
}

/**
 * Opens a sitting and starts the server's clock. Calling it again while a
 * sitting is open returns that same sitting, so a refresh never buys more time
 * and never costs another attempt.
 */
export function useStartQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (quizId: string): Promise<QuizSession> => {
      const res = await apiFetch<QuizSession>(
        `/student/quizzes/${quizId}/start`,
        { method: "POST" },
      );
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    onSuccess: (_data, quizId) => {
      queryClient.invalidateQueries({
        queryKey: quizAttemptKeys.state(quizId),
      });
    },
  });
}

export function useSubmitQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      quizId,
      answers,
      warningCount,
    }: {
      quizId: string;
      answers: { questionId: string; chosenOptionIds: string[] }[];
      warningCount: number;
    }): Promise<QuizAttemptResult> => {
      const res = await apiFetch<QuizAttemptResult>(
        `/student/quizzes/${quizId}/attempt`,
        {
          method: "POST",
          body: JSON.stringify({ answers, warningCount }),
        },
      );
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: quizAttemptKeys.state(variables.quizId),
      });
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

export interface PublicCourse {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnailUrl: string | null;
  createdAt: string;
  moduleCount: number;
}

export function usePublicAllCourses() {
  return useQuery({
    queryKey: courseKeys.public.all,
    queryFn: async (): Promise<PublicCourse[]> => {
      const res = await apiFetch<PublicCourse[]>("/public/courses/all");
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    staleTime: 10 * 60 * 1000,
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
      accessType?: CourseAccessType;
      price?: number;
      certificatePrice?: number;
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
      accessType?: CourseAccessType;
      price?: number;
      certificatePrice?: number;
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
      queryClient.invalidateQueries({ queryKey: courseKeys.student.lists() });
      queryClient.invalidateQueries({ queryKey: courseKeys.public.top });
      queryClient.invalidateQueries({ queryKey: courseKeys.public.all });
      queryClient.invalidateQueries({
        queryKey: ["courses", "public", "detail", updated.slug],
      });
      queryClient.invalidateQueries({
        queryKey: ["course-preview", updated.slug],
      });
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

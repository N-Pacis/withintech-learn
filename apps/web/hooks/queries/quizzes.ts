import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface QuestionOption {
  id: string;
  questionId: string;
  text: string;
  isCorrect: boolean;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  quizId: string;
  text: string;
  orderIndex: number;
  options: QuestionOption[];
  createdAt: string;
  updatedAt: string;
}

export interface Quiz {
  id: string;
  lessonId: string | null;
  moduleId: string | null;
  courseId: string | null;
  title: string;
  passingScore: number;
  maxAttempts: number;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}

// ─── Query keys ───────────────────────────────────────────────────────────────

export const quizKeys = {
  all: ["quizzes"] as const,
  forLesson: (lessonId: string) => ["quizzes", "lesson", lessonId] as const,
  forModule: (moduleId: string) => ["quizzes", "module", moduleId] as const,
  forCourse: (courseId: string) => ["quizzes", "course", courseId] as const,
  detail: (id: string) => ["quizzes", id] as const,
};

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useLessonQuiz(lessonId: string) {
  return useQuery({
    queryKey: quizKeys.forLesson(lessonId),
    queryFn: async (): Promise<Quiz | null> => {
      const res = await apiFetch<Quiz | null>(
        `/admin/lessons/${lessonId}/quiz`,
      );
      if (!res.success) throw new Error(res.message);
      return res.data ?? null;
    },
    enabled: !!lessonId,
  });
}

export function useModuleQuiz(moduleId: string) {
  return useQuery({
    queryKey: quizKeys.forModule(moduleId),
    queryFn: async (): Promise<Quiz | null> => {
      const res = await apiFetch<Quiz | null>(
        `/admin/modules/${moduleId}/quiz`,
      );
      if (!res.success) throw new Error(res.message);
      return res.data ?? null;
    },
    enabled: !!moduleId,
  });
}

export function useCourseQuiz(courseId: string) {
  return useQuery({
    queryKey: quizKeys.forCourse(courseId),
    queryFn: async (): Promise<Quiz | null> => {
      const res = await apiFetch<Quiz | null>(
        `/admin/courses/${courseId}/quiz`,
      );
      if (!res.success) throw new Error(res.message);
      return res.data ?? null;
    },
    enabled: !!courseId,
  });
}

export function useQuiz(id: string) {
  return useQuery({
    queryKey: quizKeys.detail(id),
    queryFn: async (): Promise<Quiz> => {
      const res = await apiFetch<Quiz>(`/admin/quizzes/${id}`);
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    enabled: !!id,
  });
}

// ─── Quiz mutations ───────────────────────────────────────────────────────────

export function useCreateLessonQuiz(lessonId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      passingScore: number;
      maxAttempts: number;
    }): Promise<Quiz> => {
      const res = await apiFetch<Quiz>(`/admin/lessons/${lessonId}/quiz`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quizKeys.forLesson(lessonId) });
    },
  });
}

export function useCreateModuleQuiz(moduleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      passingScore: number;
      maxAttempts: number;
    }): Promise<Quiz> => {
      const res = await apiFetch<Quiz>(`/admin/modules/${moduleId}/quiz`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quizKeys.forModule(moduleId) });
    },
  });
}

export function useCreateCourseQuiz(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      passingScore: number;
      maxAttempts: number;
    }): Promise<Quiz> => {
      const res = await apiFetch<Quiz>(`/admin/courses/${courseId}/quiz`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quizKeys.forCourse(courseId) });
    },
  });
}

// Shared quiz mutations — take a cacheKey to invalidate after success

export function useUpdateQuiz(cacheKey: readonly unknown[]) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      title?: string;
      passingScore?: number;
      maxAttempts?: number;
    }): Promise<Quiz> => {
      const res = await apiFetch<Quiz>(`/admin/quizzes/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(cacheKey, (old: Quiz | null | undefined) =>
        old ? { ...old, ...updated } : old,
      );
    },
  });
}

export function useDeleteQuiz(cacheKey: readonly unknown[]) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/admin/quizzes/${id}`, { method: "DELETE" });
      if (!res.success) throw new Error(res.message);
    },
    onSuccess: () => {
      queryClient.setQueryData(cacheKey, null);
    },
  });
}

// ─── Question mutations ───────────────────────────────────────────────────────

export function useAddQuestion(cacheKey: readonly unknown[]) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      quizId,
      text,
      orderIndex,
    }: {
      quizId: string;
      text: string;
      orderIndex: number;
    }): Promise<Question> => {
      const res = await apiFetch<Question>(
        `/admin/quizzes/${quizId}/questions`,
        {
          method: "POST",
          body: JSON.stringify({ text, orderIndex }),
        },
      );
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cacheKey });
    },
  });
}

export function useUpdateQuestion(cacheKey: readonly unknown[]) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      text,
    }: {
      id: string;
      text: string;
    }): Promise<Question> => {
      const res = await apiFetch<Question>(`/admin/questions/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ text }),
      });
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cacheKey });
    },
  });
}

export function useDeleteQuestion(cacheKey: readonly unknown[]) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/admin/questions/${id}`, {
        method: "DELETE",
      });
      if (!res.success) throw new Error(res.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cacheKey });
    },
  });
}

// ─── Option mutations ─────────────────────────────────────────────────────────

export function useAddOption(cacheKey: readonly unknown[]) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      questionId,
      text,
      isCorrect,
      orderIndex,
    }: {
      questionId: string;
      text: string;
      isCorrect: boolean;
      orderIndex: number;
    }): Promise<QuestionOption> => {
      const res = await apiFetch<QuestionOption>(
        `/admin/questions/${questionId}/options`,
        {
          method: "POST",
          body: JSON.stringify({ text, isCorrect, orderIndex }),
        },
      );
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cacheKey });
    },
  });
}

export function useUpdateOption(cacheKey: readonly unknown[]) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      text,
      isCorrect,
    }: {
      id: string;
      text?: string;
      isCorrect?: boolean;
    }): Promise<QuestionOption> => {
      const res = await apiFetch<QuestionOption>(`/admin/options/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ text, isCorrect }),
      });
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cacheKey });
    },
  });
}

export function useDeleteOption(cacheKey: readonly unknown[]) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/admin/options/${id}`, { method: "DELETE" });
      if (!res.success) throw new Error(res.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cacheKey });
    },
  });
}

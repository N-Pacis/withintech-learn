import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { courseKeys } from "./courses";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Module {
  id: string;
  courseId: string;
  title: string;
  orderIndex: number;
  hasQuiz: boolean;
  lessonCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminLesson {
  id: string;
  moduleId: string;
  title: string;
  orderIndex: number;
  hasQuiz: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LessonBlock {
  id: string;
  lessonId: string;
  type: "text" | "image" | "code";
  content: string | null;
  storageKey: string | null;
  url: string | null;
  caption: string | null;
  language: string | null;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminLessonWithBlocks extends AdminLesson {
  blocks: LessonBlock[];
}

export interface Block {
  id: string;
  moduleId: string;
  type: "text" | "image" | "code";
  content: string | null;
  storageKey: string | null;
  url: string | null;
  caption: string | null;
  language: string | null;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface ModuleWithBlocks extends Module {
  blocks: Block[];
  lessons: AdminLesson[];
}

// ─── Query keys ───────────────────────────────────────────────────────────────

export const moduleKeys = {
  all: ["modules"] as const,
  list: (courseId: string) => ["modules", "list", courseId] as const,
  detail: (id: string) => ["modules", id] as const,
};

export const blockKeys = {
  list: (moduleId: string) => ["blocks", "list", moduleId] as const,
  detail: (id: string) => ["blocks", id] as const,
};

export const lessonKeys = {
  all: ["lessons"] as const,
  list: (moduleId: string) => ["lessons", "list", moduleId] as const,
  detail: (id: string) => ["lessons", id] as const,
};

export const lessonBlockKeys = {
  list: (lessonId: string) => ["lessonBlocks", "list", lessonId] as const,
};

// ─── Module Queries ────────────────────────────────────────────────────────────

export function useModules(courseId: string) {
  return useQuery({
    queryKey: moduleKeys.list(courseId),
    queryFn: async (): Promise<Module[]> => {
      const res = await apiFetch<Module[]>(
        `/admin/courses/${courseId}/modules`,
      );
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    enabled: !!courseId,
  });
}

export function useModule(id: string) {
  return useQuery({
    queryKey: moduleKeys.detail(id),
    queryFn: async (): Promise<ModuleWithBlocks> => {
      const res = await apiFetch<ModuleWithBlocks>(`/admin/modules/${id}`);
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    enabled: !!id,
  });
}

// ─── Block Queries ─────────────────────────────────────────────────────────────

export function useBlocks(moduleId: string) {
  return useQuery({
    queryKey: blockKeys.list(moduleId),
    queryFn: async (): Promise<Block[]> => {
      const res = await apiFetch<Block[]>(`/admin/modules/${moduleId}/blocks`);
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    enabled: !!moduleId,
  });
}

// ─── Module Mutations ──────────────────────────────────────────────────────────

export function useAddModule(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      orderIndex: number;
    }): Promise<Module> => {
      const res = await apiFetch<Module>(`/admin/courses/${courseId}/modules`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moduleKeys.list(courseId) });
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) });
    },
  });
}

export function useUpdateModule(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      title,
    }: {
      id: string;
      title: string;
    }): Promise<Module> => {
      const res = await apiFetch<Module>(`/admin/modules/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ title }),
      });
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(
        moduleKeys.detail(updated.id),
        (old: ModuleWithBlocks | undefined) =>
          old ? { ...old, title: updated.title } : old,
      );
      queryClient.invalidateQueries({ queryKey: moduleKeys.list(courseId) });
    },
  });
}

export function useDeleteModule(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/admin/modules/${id}`, { method: "DELETE" });
      if (!res.success) throw new Error(res.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moduleKeys.list(courseId) });
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) });
    },
  });
}

export function useReorderModules(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (items: { id: string; orderIndex: number }[]) => {
      const res = await apiFetch(`/admin/courses/${courseId}/modules/reorder`, {
        method: "POST",
        body: JSON.stringify({ items }),
      });
      if (!res.success) throw new Error(res.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moduleKeys.list(courseId) });
    },
  });
}

// ─── Block Mutations ───────────────────────────────────────────────────────────

export function useAddBlock(moduleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      data:
        | { type: "text"; content: string; orderIndex: number }
        | { type: "image"; caption?: string; orderIndex: number }
        | {
            type: "code";
            content: string;
            language: string;
            orderIndex: number;
          },
    ): Promise<Block> => {
      const res = await apiFetch<Block>(`/admin/modules/${moduleId}/blocks`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      return Promise.all([
        queryClient.invalidateQueries({
          queryKey: moduleKeys.detail(moduleId),
        }),
        queryClient.invalidateQueries({ queryKey: blockKeys.list(moduleId) }),
      ]);
    },
  });
}

export function useUpdateBlock(moduleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      content,
      caption,
      language,
    }: {
      id: string;
      content?: string;
      caption?: string;
      language?: string;
    }): Promise<Block> => {
      const res = await apiFetch<Block>(
        `/admin/modules/${moduleId}/blocks/${id}`,
        {
          method: "PATCH",
          body: JSON.stringify({ content, caption, language }),
        },
      );
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      return Promise.all([
        queryClient.invalidateQueries({
          queryKey: moduleKeys.detail(moduleId),
        }),
        queryClient.invalidateQueries({ queryKey: blockKeys.list(moduleId) }),
      ]);
    },
  });
}

export function useDeleteBlock(moduleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (blockId: string) => {
      const res = await apiFetch(
        `/admin/modules/${moduleId}/blocks/${blockId}`,
        {
          method: "DELETE",
        },
      );
      if (!res.success) throw new Error(res.message);
    },
    onSuccess: () => {
      return Promise.all([
        queryClient.invalidateQueries({
          queryKey: moduleKeys.detail(moduleId),
        }),
        queryClient.invalidateQueries({ queryKey: blockKeys.list(moduleId) }),
      ]);
    },
  });
}

export function useReorderBlocks(moduleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (items: { id: string; orderIndex: number }[]) => {
      const res = await apiFetch(`/admin/modules/${moduleId}/blocks/reorder`, {
        method: "POST",
        body: JSON.stringify({ items }),
      });
      if (!res.success) throw new Error(res.message);
    },
    onSuccess: () => {
      return Promise.all([
        queryClient.invalidateQueries({
          queryKey: moduleKeys.detail(moduleId),
        }),
        queryClient.invalidateQueries({ queryKey: blockKeys.list(moduleId) }),
      ]);
    },
  });
}

// ─── Lesson Queries ──────────────────────────────────────────────────────────

export function useLessons(moduleId: string) {
  return useQuery({
    queryKey: lessonKeys.list(moduleId),
    queryFn: async (): Promise<AdminLesson[]> => {
      const res = await apiFetch<AdminLesson[]>(
        `/admin/modules/${moduleId}/lessons`,
      );
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    enabled: !!moduleId,
  });
}

export function useLesson(id: string) {
  return useQuery({
    queryKey: lessonKeys.detail(id),
    queryFn: async (): Promise<AdminLessonWithBlocks> => {
      const res = await apiFetch<AdminLessonWithBlocks>(`/admin/lessons/${id}`);
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useLessonBlocks(lessonId: string) {
  return useQuery({
    queryKey: lessonBlockKeys.list(lessonId),
    queryFn: async (): Promise<LessonBlock[]> => {
      const res = await apiFetch<LessonBlock[]>(
        `/admin/lessons/${lessonId}/blocks`,
      );
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    enabled: !!lessonId,
  });
}

// ─── Lesson Mutations ─────────────────────────────────────────────────────────

export function useAddLesson(moduleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      orderIndex: number;
    }): Promise<AdminLesson> => {
      const res = await apiFetch<AdminLesson>(
        `/admin/modules/${moduleId}/lessons`,
        {
          method: "POST",
          body: JSON.stringify(data),
        },
      );
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.list(moduleId) });
      queryClient.invalidateQueries({ queryKey: moduleKeys.detail(moduleId) });
    },
  });
}

export function useUpdateLesson(moduleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      title,
    }: {
      id: string;
      title: string;
    }): Promise<AdminLesson> => {
      const res = await apiFetch<AdminLesson>(`/admin/lessons/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ title }),
      });
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(
        lessonKeys.detail(updated.id),
        (old: AdminLessonWithBlocks | undefined) =>
          old ? { ...old, title: updated.title } : old,
      );
      queryClient.invalidateQueries({ queryKey: lessonKeys.list(moduleId) });
    },
  });
}

export function useDeleteLesson(moduleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/admin/lessons/${id}`, { method: "DELETE" });
      if (!res.success) throw new Error(res.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.list(moduleId) });
      queryClient.invalidateQueries({ queryKey: moduleKeys.detail(moduleId) });
    },
  });
}

export function useReorderLessons(moduleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (items: { id: string; orderIndex: number }[]) => {
      const res = await apiFetch(`/admin/modules/${moduleId}/lessons/reorder`, {
        method: "POST",
        body: JSON.stringify({ items }),
      });
      if (!res.success) throw new Error(res.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.list(moduleId) });
    },
  });
}

// ─── Lesson Block Mutations ───────────────────────────────────────────────────

export function useAddLessonBlock(lessonId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      data:
        | { type: "text"; content: string; orderIndex: number }
        | { type: "image"; caption?: string; orderIndex: number }
        | {
            type: "code";
            content: string;
            language: string;
            orderIndex: number;
          },
    ): Promise<LessonBlock> => {
      const res = await apiFetch<LessonBlock>(
        `/admin/lessons/${lessonId}/blocks`,
        {
          method: "POST",
          body: JSON.stringify(data),
        },
      );
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      return Promise.all([
        queryClient.invalidateQueries({
          queryKey: lessonKeys.detail(lessonId),
        }),
        queryClient.invalidateQueries({
          queryKey: lessonBlockKeys.list(lessonId),
        }),
      ]);
    },
  });
}

export function useUpdateLessonBlock(lessonId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      content,
      caption,
      language,
    }: {
      id: string;
      content?: string;
      caption?: string;
      language?: string;
    }): Promise<LessonBlock> => {
      const res = await apiFetch<LessonBlock>(
        `/admin/lessons/${lessonId}/blocks/${id}`,
        {
          method: "PATCH",
          body: JSON.stringify({ content, caption, language }),
        },
      );
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      return Promise.all([
        queryClient.invalidateQueries({
          queryKey: lessonKeys.detail(lessonId),
        }),
        queryClient.invalidateQueries({
          queryKey: lessonBlockKeys.list(lessonId),
        }),
      ]);
    },
  });
}

export function useDeleteLessonBlock(lessonId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (blockId: string) => {
      const res = await apiFetch(
        `/admin/lessons/${lessonId}/blocks/${blockId}`,
        {
          method: "DELETE",
        },
      );
      if (!res.success) throw new Error(res.message);
    },
    onSuccess: () => {
      return Promise.all([
        queryClient.invalidateQueries({
          queryKey: lessonKeys.detail(lessonId),
        }),
        queryClient.invalidateQueries({
          queryKey: lessonBlockKeys.list(lessonId),
        }),
      ]);
    },
  });
}

export function useReorderLessonBlocks(lessonId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (items: { id: string; orderIndex: number }[]) => {
      const res = await apiFetch(`/admin/lessons/${lessonId}/blocks/reorder`, {
        method: "POST",
        body: JSON.stringify({ items }),
      });
      if (!res.success) throw new Error(res.message);
    },
    onSuccess: () => {
      return Promise.all([
        queryClient.invalidateQueries({
          queryKey: lessonKeys.detail(lessonId),
        }),
        queryClient.invalidateQueries({
          queryKey: lessonBlockKeys.list(lessonId),
        }),
      ]);
    },
  });
}

export function useUploadLessonBlockImage(lessonId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      blockId,
      file,
    }: {
      blockId: string;
      file: File;
    }): Promise<{ storageKey: string; url: string }> => {
      const formData = new FormData();
      formData.append("image", file);
      const res = await apiFetch<{ storageKey: string; url: string }>(
        `/admin/lessons/${lessonId}/blocks/${blockId}/upload-image`,
        { method: "POST", body: formData },
      );
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      return Promise.all([
        queryClient.invalidateQueries({
          queryKey: lessonKeys.detail(lessonId),
        }),
        queryClient.invalidateQueries({
          queryKey: lessonBlockKeys.list(lessonId),
        }),
      ]);
    },
  });
}

export function useUploadBlockImage(moduleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      blockId,
      file,
    }: {
      blockId: string;
      file: File;
    }): Promise<{ storageKey: string; url: string }> => {
      const formData = new FormData();
      formData.append("image", file);
      const res = await apiFetch<{ storageKey: string; url: string }>(
        `/admin/modules/${moduleId}/blocks/${blockId}/upload-image`,
        { method: "POST", body: formData },
      );
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      return Promise.all([
        queryClient.invalidateQueries({
          queryKey: moduleKeys.detail(moduleId),
        }),
        queryClient.invalidateQueries({ queryKey: blockKeys.list(moduleId) }),
      ]);
    },
  });
}

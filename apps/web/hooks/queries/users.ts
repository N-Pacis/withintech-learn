import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  lastLoggedIn: string | null;
  createdById: string | null;
}

export interface UsersParams {
  search?: string;
  role?: "admin" | "student" | "";
  status?: "active" | "inactive" | "";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface UsersPage {
  total: number;
  page: number;
  limit: number;
  users: AdminUser[];
}

export const usersKeys = {
  list: (params: UsersParams) => ["admin", "users", params] as const,
};

export function useUsers(params: UsersParams = {}) {
  return useQuery({
    queryKey: usersKeys.list(params),
    queryFn: async (): Promise<UsersPage> => {
      const qs = new URLSearchParams();
      if (params.search) qs.set("search", params.search);
      if (params.role) qs.set("role", params.role);
      if (params.status) qs.set("status", params.status);
      if (params.sortOrder) qs.set("sortOrder", params.sortOrder);
      if (params.page) qs.set("page", String(params.page));
      if (params.limit) qs.set("limit", String(params.limit));

      const query = qs.toString() ? `?${qs.toString()}` : "";
      const res = await apiFetch<UsersPage>(`/admin/users${query}`);
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
  });
}

export function useAdmins(params: Omit<UsersParams, "role"> = {}) {
  return useUsers({ ...params, role: "admin" });
}

export function useStudents(params: Omit<UsersParams, "role"> = {}) {
  return useUsers({ ...params, role: "student" });
}

export async function fetchStudentsExport(
  params: Pick<UsersParams, "search" | "status" | "sortOrder">,
): Promise<AdminUser[]> {
  const qs = new URLSearchParams({ role: "student" });
  if (params.search) qs.set("search", params.search);
  if (params.status) qs.set("status", params.status);
  if (params.sortOrder) qs.set("sortOrder", params.sortOrder);
  const res = await apiFetch<AdminUser[]>(`/admin/users/export?${qs}`);
  if (!res.success || !res.data) throw new Error(res.message);
  return res.data;
}

export function useSetUserActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      isActive,
    }: {
      userId: string;
      isActive: boolean;
    }) => {
      const endpoint = isActive
        ? `/admin/users/${userId}/activate`
        : `/admin/users/${userId}/deactivate`;
      const res = await apiFetch<AdminUser>(endpoint, { method: "PATCH" });
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export interface AdminStats {
  totalStudents: number;
  activeCourses: number;
  certificatesIssued: number;
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"] as const,
    queryFn: async (): Promise<AdminStats> => {
      const res = await apiFetch<AdminStats>("/admin/stats");
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
  });
}

export function useVerifyUserEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string): Promise<AdminUser> => {
      const res = await apiFetch<AdminUser>(
        `/admin/users/${userId}/verify-email`,
        { method: "PATCH" },
      );
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useCreateAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      firstName: string;
      lastName: string;
      email: string;
    }): Promise<AdminUser> => {
      const res = await apiFetch<AdminUser>("/admin/admins", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export interface ImportStudentRow {
  rowIndex: number;
  firstName: string;
  lastName: string;
  email: string;
  status: "created" | "skipped" | "failed";
  reason?: string;
}

export interface ImportStudentsResult {
  created: number;
  skipped: number;
  failed: number;
  rows: ImportStudentRow[];
}

export function useImportStudents() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File): Promise<ImportStudentsResult> => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await apiFetch<ImportStudentsResult>(
        "/admin/students/import",
        {
          method: "POST",
          body: formData,
        },
      );
      if (!res.success || !res.data)
        throw new Error(res.message ?? "Import failed");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

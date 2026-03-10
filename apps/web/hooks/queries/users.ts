import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface UsersParams {
  search?: string;
  role?: 'admin' | 'student' | '';
  status?: 'active' | 'inactive' | '';
  sortOrder?: 'asc' | 'desc';
}

export const usersKeys = {
  list: (params: UsersParams) => ['admin', 'users', params] as const,
};

export function useUsers(params: UsersParams = {}) {
  return useQuery({
    queryKey: usersKeys.list(params),
    queryFn: async (): Promise<AdminUser[]> => {
      const qs = new URLSearchParams();
      if (params.search)    qs.set('search', params.search);
      if (params.role)      qs.set('role', params.role);
      if (params.status)    qs.set('status', params.status);
      if (params.sortOrder) qs.set('sortOrder', params.sortOrder);

      const query = qs.toString() ? `?${qs.toString()}` : '';
      const res = await apiFetch<AdminUser[]>(`/admin/users${query}`);
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
  });
}

export function useSetUserActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const endpoint = isActive ? `/admin/users/${userId}/activate` : `/admin/users/${userId}/deactivate`;
      const res = await apiFetch<AdminUser>(endpoint, { method: 'PATCH' });
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      // Invalidate all user list variants
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

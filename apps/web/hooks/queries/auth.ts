import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { User } from '@/lib/auth';

// ─── Query keys ──────────────────────────────────────────────────────────────

export const authKeys = {
  profile: ['auth', 'profile'] as const,
};

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useProfile() {
  return useQuery({
    queryKey: authKeys.profile,
    queryFn: async (): Promise<User> => {
      const res = await apiFetch<User>('/auth/profile', {}, { redirectOn401: false });
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    retry: false,
    refetchOnWindowFocus: false,
  });
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const res = await apiFetch<{ user: User }>(
        '/auth/login',
        { method: 'POST', body: JSON.stringify(credentials) },
        { redirectOn401: false },
      );
      if (!res.success || !res.data) throw new Error(res.message ?? 'Login failed');
      return res.data;
    },
    onSuccess: (data) => {
      // Cookies are set by the server — just seed the profile cache
      queryClient.setQueryData(authKeys.profile, data.user);
    },
  });
}

export function useSignUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { firstName: string; lastName: string; email: string; password: string }) => {
      const res = await apiFetch<{ user: User }>(
        '/auth/signup',
        { method: 'POST', body: JSON.stringify(data) },
      );
      if (!res.success || !res.data) throw new Error(res.message ?? 'Sign up failed');
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.profile, data.user);
    },
  });
}

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: async (email: string) => {
      const res = await apiFetch('/auth/password-reset/request', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      if (!res.success) throw new Error(res.message ?? 'Failed to send OTP');
    },
  });
}

export function useVerifyResetOtp() {
  return useMutation({
    mutationFn: async ({ email, otp }: { email: string; otp: string }): Promise<{ resetToken: string }> => {
      const res = await apiFetch<{ resetToken: string }>('/auth/password-reset/verify', {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
      });
      if (!res.success || !res.data) throw new Error(res.message ?? 'Invalid OTP');
      return res.data;
    },
  });
}

export function useResetPassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ resetToken, newPassword }: { resetToken: string; newPassword: string }) => {
      const res = await apiFetch<{ user: User }>(
        '/auth/password-reset/confirm',
        { method: 'POST', body: JSON.stringify({ resetToken, newPassword }) },
      );
      if (!res.success || !res.data) throw new Error(res.message ?? 'Failed to reset password');
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.profile, data.user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return () => {
    apiFetch('/auth/logout', { method: 'POST' }).finally(() => {
      queryClient.clear();
      window.location.href = '/sign-in';
    });
  };
}

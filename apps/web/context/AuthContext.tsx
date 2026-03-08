'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import { clearTokens, setTokens } from '@/lib/auth';
import type { User } from '@/lib/auth';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Always load profile from the server — never from stored user data.
  // This means a tampered token in localStorage will be rejected by the API,
  // and the user will be treated as unauthenticated.
  const loadProfile = useCallback(async () => {
    try {
      const res = await apiFetch<User>('/auth/profile');
      setUser(res.success && res.data ? res.data : null);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      const res = await apiFetch<{ accessToken: string; refreshToken: string; user: User }>(
        '/auth/login',
        { method: 'POST', body: JSON.stringify({ email, password }) },
      );

      if (!res.success || !res.data) {
        return { error: res.message ?? 'Login failed' };
      }

      setTokens(res.data.accessToken, res.data.refreshToken);
      setUser(res.data.user);
      return {};
    } catch {
      return { error: 'Something went wrong. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } finally {
      clearTokens();
      setUser(null);
      window.location.href = '/sign-in';
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

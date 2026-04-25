"use client";

import { createContext, useContext } from "react";
import { useProfile, useLogin, useLogout } from "@/hooks/queries/auth";
import type { User } from "@/lib/auth";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isFetching: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: user = null, isLoading, isFetching } = useProfile();
  const loginMutation = useLogin();
  const logout = useLogout();

  const login = async (
    email: string,
    password: string,
  ): Promise<{ error?: string }> => {
    try {
      await loginMutation.mutateAsync({ email, password });
      return {};
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Login failed" };
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isFetching, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

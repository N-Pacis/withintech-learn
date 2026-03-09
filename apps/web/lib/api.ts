import { getAccessToken, getRefreshToken, setTokens, clearTokens } from './auth';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

// Deduplicate concurrent refresh calls
let refreshPromise: Promise<string | null> | null = null;

async function doRefresh(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      clearTokens();
      return null;
    }

    const json = await res.json();
    const newAccess: string = json.data.accessToken;
    setTokens(newAccess, refreshToken);
    return newAccess;
  } catch {
    clearTokens();
    return null;
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<{ success: boolean; message: string; data?: T }> {
  const request = async (token: string | null) => {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };
    // Let the browser set Content-Type automatically for FormData (includes boundary)
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return fetch(`${BASE}${path}`, { ...options, headers });
  };

  let token = getAccessToken();
  let res = await request(token);

  if (res.status === 401) {
    if (!refreshPromise) {
      refreshPromise = doRefresh().finally(() => {
        refreshPromise = null;
      });
    }

    token = await refreshPromise;

    if (!token) {
      if (typeof window !== 'undefined') window.location.href = '/sign-in';
      return { success: false, message: 'Session expired' };
    }

    res = await request(token);
  }

  return res.json();
}

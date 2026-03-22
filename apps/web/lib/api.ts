const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

// Deduplicate concurrent refresh calls
let refreshPromise: Promise<boolean> | null = null;

async function doRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<{ success: boolean; message: string; data?: T }> {
  const request = async () => {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };
    // Let the browser set Content-Type automatically for FormData (includes boundary)
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    return fetch(`${BASE}${path}`, { ...options, headers, credentials: 'include' });
  };

  let res = await request();

  if (res.status === 401) {
    if (!refreshPromise) {
      refreshPromise = doRefresh().finally(() => {
        refreshPromise = null;
      });
    }

    const refreshed = await refreshPromise;

    if (!refreshed) {
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/sign-in')) {
        window.location.href = '/sign-in';
      }
      return { success: false, message: 'Session expired' };
    }

    res = await request();
  }

  if (res.status === 403) {
    if (typeof window !== 'undefined') window.history.back();
    return { success: false, message: 'You do not have permission to access this.' };
  }

  return res.json();
}

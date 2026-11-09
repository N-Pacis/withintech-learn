const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

// Deduplicate concurrent refresh calls
let refreshPromise: Promise<boolean> | null = null;

async function doRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
  {
    skipRefresh = false,
    redirectOn401 = true,
  }: { skipRefresh?: boolean; redirectOn401?: boolean } = {},
): Promise<{ success: boolean; message: string; data?: T }> {
  const request = async () => {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };
    // Let the browser set Content-Type automatically for FormData (includes boundary)
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }
    return fetch(`${BASE}${path}`, {
      ...options,
      headers,
      credentials: "include",
    });
  };

  let res = await request();

  if (res.status === 401) {
    // skipRefresh: the 401 carries the real error (e.g. "Invalid email or password") — return it as-is.
    if (skipRefresh) {
      return res.json();
    }

    if (!refreshPromise) {
      refreshPromise = doRefresh().finally(() => {
        refreshPromise = null;
      });
    }

    const refreshed = await refreshPromise;

    if (!refreshed) {
      // redirectOn401: only hard-redirect from protected pages, not public ones.
      if (
        redirectOn401 &&
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/sign-in")
      ) {
        window.location.replace("/sign-in");
      }
      return { success: false, message: "Session expired" };
    }

    res = await request();
  }

  if (res.status === 403) {
    if (typeof window !== "undefined") window.history.back();
    return {
      success: false,
      message: "You do not have permission to access this.",
    };
  }

  return res.json();
}

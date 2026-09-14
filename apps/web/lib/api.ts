// ─── Backend disconnected ──────────────────────────────────────────────────
// No requests leave the browser. Public GET endpoints resolve to static mock
// data so the marketing pages still render something realistic; everything
// else (auth, admin, learn, payments, ...) fails as if the API were down.

import { MOCK_ROUTES } from "./mock-data";

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  config?: { skipRefresh?: boolean; redirectOn401?: boolean },
): Promise<{ success: boolean; message: string; data?: T }> {
  const method = (options.method ?? "GET").toUpperCase();

  if (method === "GET") {
    const [route, mock] = MOCK_ROUTES.find(([route]) => route.test(path)) ?? [];
    if (route && mock) {
      const match = path.match(route)!;
      return { success: true, message: "OK", data: mock(match) as T };
    }
  }

  return { success: false, message: "Service unavailable" };
}

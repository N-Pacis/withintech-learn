import type { User } from "./auth";

const KEY = "wt_profile";

let loggingOut = false;

export function beginLogout(): void {
  loggingOut = true;
}

export function getCachedProfile(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function setCachedProfile(user: User): void {
  if (loggingOut || typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(user));
  } catch {}
}

export function clearCachedProfile(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KEY);
  } catch {}
}

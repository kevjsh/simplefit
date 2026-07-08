/**
 * Persists which dashboard panel (admin or customer) the user was last using,
 * so we can return them to it on subsequent visits to the site root.
 *
 * Rules the rest of the app expects:
 *   · Users without any active role are always sent to /dashboard/customer,
 *     regardless of what this preference contains.
 *   · Users with at least one active role are sent to whatever they last
 *     opened, defaulting to "admin" when nothing has been stored yet.
 */

export type Panel = "admin" | "customer";

const STORAGE_KEY = "sf_last_panel";

export function readPanelPreference(): Panel | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "admin" || value === "customer" ? value : null;
  } catch {
    return null;
  }
}

export function writePanelPreference(panel: Panel): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, panel);
  } catch {
    /* localStorage disabled / quota exceeded — silently ignore */
  }
}

export function clearPanelPreference(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* silently ignore */
  }
}

/**
 * Resolves the target dashboard path for an authenticated user.
 *
 * @param hasActiveRole  Whether the user has any UserRole with Status='ACTIVE'.
 * @returns The absolute pathname the user should be routed to.
 */
export function resolveDashboardPath(hasActiveRole: boolean): string {
  if (!hasActiveRole) return "/dashboard/customer";
  const pref = readPanelPreference() ?? "admin";
  return pref === "admin" ? "/dashboard/admin" : "/dashboard/customer";
}

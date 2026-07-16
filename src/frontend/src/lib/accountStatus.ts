export const ACCOUNT_INACTIVE_PATH = "/inactive";
export const ACCOUNT_INACTIVE_SESSION_KEY = "sf_account_inactive";

export function setAccountInactiveLock(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(ACCOUNT_INACTIVE_SESSION_KEY, "1");
}

export function clearAccountInactiveLock(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(ACCOUNT_INACTIVE_SESSION_KEY);
}

export function hasAccountInactiveLock(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(ACCOUNT_INACTIVE_SESSION_KEY) === "1";
}

export function isAccountActive(status: string | null | undefined): boolean {
  return String(status ?? "").toUpperCase() === "ACTIVE";
}

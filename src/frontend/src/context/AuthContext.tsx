"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { tokenStore } from "../lib/tokenStore";
import { clearPanelPreference } from "../lib/panelPreference";
import { clearAccountInactiveLock, isAccountActive } from "../lib/accountStatus";
import { getCustomerProfile, UserRole } from "../services/customer.service";

export interface AuthUser {
  NID: string;
  Name: string;
  Email: string;
}

interface AuthContextType {
  authLoading: boolean;
  isLoggedIn: boolean;
  isInactive: boolean;
  user: AuthUser | null;
  profilePicture: string | null;
  userRoles: UserRole[];
  hasActiveRole: boolean;
  isAdmin: boolean;
  updateProfilePicture: (url: string | null) => void;
  login: (token: string, user: AuthUser, userRoles?: UserRole[], accountStatus?: string | null) => void;
  logout: () => Promise<void>;
}

const PICTURE_KEY = "sf_profile_pic";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authLoading, setAuthLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInactive, setIsInactive] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);

  /* Restore persisted picture immediately (sync, client-only) */
  useEffect(() => {
    const stored = localStorage.getItem(PICTURE_KEY);
    if (stored) setProfilePicture(stored);
  }, []);

  /* Verify session on every mount — get display data from the API, not the token */
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.authenticated && data.token) {
          tokenStore.set(data.token);
          setIsLoggedIn(true);
          /* Email in the JWT payload is always ASCII — safe to use directly */
          return getCustomerProfile(data.payload.Email).then((profile) => {
            setUser({ NID: profile.NID, Name: profile.Name, Email: profile.Email });
            updateProfilePicture(profile.ProfilePicture ?? null);
            const inactive = !isAccountActive(profile.Status);
            setIsInactive(inactive);
            setUserRoles(inactive ? [] : (profile.UserRoles ?? []));
          });
        } else {
          localStorage.removeItem(PICTURE_KEY);
          setProfilePicture(null);
          setUserRoles([]);
          setIsInactive(false);
        }
      })
      .catch(() => {})
      .finally(() => setAuthLoading(false));
  }, []);

  function login(
    token: string,
    nextUser: AuthUser,
    roles?: UserRole[],
    accountStatus?: string | null
  ) {
    tokenStore.set(token);
    setIsLoggedIn(true);
    setUser(nextUser);
    const inactive = accountStatus !== undefined && accountStatus !== null
      ? !isAccountActive(accountStatus)
      : false;
    setIsInactive(inactive);
    setUserRoles(inactive ? [] : (roles ?? []));
    if (!inactive) clearAccountInactiveLock();
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    tokenStore.clear();
    localStorage.removeItem(PICTURE_KEY);
    clearPanelPreference();
    clearAccountInactiveLock();
    setIsLoggedIn(false);
    setIsInactive(false);
    setUser(null);
    setProfilePicture(null);
    setUserRoles([]);
    window.location.replace("/");
  }

  function updateProfilePicture(url: string | null) {
    setProfilePicture(url);
    if (url) {
      localStorage.setItem(PICTURE_KEY, url);
    } else {
      localStorage.removeItem(PICTURE_KEY);
    }
  }

  /* The backend already filters UserRoles by Status='ACTIVE', so any entry
     here is an active assignment. isAdmin looks at RoleType case-insensitively. */
  const hasActiveRole = userRoles.length > 0;
  const isAdmin = useMemo(
    () =>
      userRoles.some(
        (ur) => (ur.Role?.RoleType ?? "").toLowerCase() === "admin"
      ),
    [userRoles]
  );

  return (
    <AuthContext.Provider
      value={{
        authLoading,
        isLoggedIn,
        isInactive,
        user,
        profilePicture,
        userRoles,
        hasActiveRole,
        isAdmin,
        updateProfilePicture,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

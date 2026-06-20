"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { tokenStore } from "../lib/tokenStore";

export interface AuthUser {
  NID: string;
  Name: string;
  Email: string;
}

interface AuthContextType {
  authLoading: boolean;
  isLoggedIn: boolean;
  user: AuthUser | null;
  profilePicture: string | null;
  updateProfilePicture: (url: string | null) => void;
  login: (token: string) => void;
  logout: () => Promise<void>;
}

const PICTURE_KEY = "sf_profile_pic";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function decodeUser(token: string): AuthUser | null {
  try {
    return JSON.parse(atob(token.split(".")[1])) as AuthUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authLoading, setAuthLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  /* Restore persisted picture immediately (sync, client-only) */
  useEffect(() => {
    const stored = localStorage.getItem(PICTURE_KEY);
    if (stored) setProfilePicture(stored);
  }, []);

  /* Verify session on every mount */
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.authenticated && data.token) {
          tokenStore.set(data.token);
          setIsLoggedIn(true);
          setUser(data.payload as AuthUser);
        } else {
          /* Not authenticated — clear any stale picture */
          localStorage.removeItem(PICTURE_KEY);
          setProfilePicture(null);
        }
      })
      .catch(() => {})
      .finally(() => setAuthLoading(false));
  }, []);

  function login(token: string) {
    tokenStore.set(token);
    setIsLoggedIn(true);
    setUser(decodeUser(token));
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    tokenStore.clear();
    localStorage.removeItem(PICTURE_KEY);
    setIsLoggedIn(false);
    setUser(null);
    setProfilePicture(null);
    /* Hard navigation — always works regardless of router state */
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

  return (
    <AuthContext.Provider
      value={{ authLoading, isLoggedIn, user, profilePicture, updateProfilePicture, login, logout }}
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

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { tokenStore } from "../lib/tokenStore";

export interface AuthUser {
  NID: string;
  Name: string;
  Email: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: AuthUser | null;
  login: (token: string) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function decodeUser(token: string): AuthUser | null {
  try {
    return JSON.parse(atob(token.split(".")[1])) as AuthUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.authenticated && data.token) {
          tokenStore.set(data.token);
          setIsLoggedIn(true);
          setUser(data.payload as AuthUser);
        }
      })
      .catch(() => {});
  }, []);

  function login(token: string) {
    tokenStore.set(token);
    const decoded = decodeUser(token);
    setIsLoggedIn(true);
    setUser(decoded);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    tokenStore.clear();
    setIsLoggedIn(false);
    setUser(null);
    router.push("/");
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

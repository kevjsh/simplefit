"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import {
  ACCOUNT_INACTIVE_PATH,
  hasAccountInactiveLock,
} from "../../../lib/accountStatus";

/**
 * Keeps inactive accounts on /inactive and blocks every other route.
 * Also covers the post-login lock stored in sessionStorage when the backend
 * rejects the session without issuing a token.
 */
export default function AccountStatusGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const { authLoading, isInactive } = useAuth();

  useEffect(() => {
    if (authLoading) return;

    const locked = isInactive || hasAccountInactiveLock();
    const onInactivePage = pathname === ACCOUNT_INACTIVE_PATH;

    if (locked && !onInactivePage) {
      router.replace(ACCOUNT_INACTIVE_PATH);
      return;
    }

    if (!locked && onInactivePage) {
      router.replace("/");
    }
  }, [authLoading, isInactive, pathname, router]);

  if (authLoading) {
    return <>{children}</>;
  }

  const locked = isInactive || hasAccountInactiveLock();
  const onInactivePage = pathname === ACCOUNT_INACTIVE_PATH;

  /* Avoid flashing protected content while redirecting an inactive session */
  if (locked && !onInactivePage) {
    return <div className="h-screen bg-[#0f1519]" />;
  }

  if (!locked && onInactivePage) {
    return <div className="h-screen bg-[#0f1519]" />;
  }

  return <>{children}</>;
}

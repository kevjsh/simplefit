"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import { writePanelPreference } from "../../../../lib/panelPreference";
import Navbar from "../../navbar/Navbar";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { authLoading, isLoggedIn, hasActiveRole, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  /* Access gate applied to every admin route through the layout:
     · No session       → home
     · No active role   → back to personal panel */
  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn) {
      router.replace("/");
      return;
    }
    if (!hasActiveRole) {
      router.replace("/dashboard/customer");
    }
  }, [authLoading, isLoggedIn, hasActiveRole, router]);

  /* Lock body scroll while the mobile drawer is open */
  useEffect(() => {
    if (mobileOpen) {
      const previous = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = previous; };
    }
  }, [mobileOpen]);

  /* Remember this panel so the site root sends the user here next time.
     Only persisted after the guard confirms the user actually belongs here. */
  useEffect(() => {
    if (!authLoading && isLoggedIn && hasActiveRole) {
      writePanelPreference("admin");
    }
  }, [authLoading, isLoggedIn, hasActiveRole]);

  /* Keep the dark background visible during auth resolution or a pending redirect */
  if (authLoading || !user || !hasActiveRole) {
    return <div className="h-screen bg-[#0f1519]" />;
  }

  return (
    <div className="h-screen flex flex-col bg-[#0f1519] overflow-hidden">
      <Navbar />

      <div className="flex-1 flex pt-[var(--spacing-nav-h)] overflow-hidden">
        {/* Desktop sidebar — always visible from lg+.
            Wrapper is lg:flex so the <aside> stretches to full height
            regardless of its own height property. */}
        <div className="hidden lg:flex">
          <AdminSidebar />
        </div>

        {/* Mobile drawer overlay + panel — always mounted for smooth transitions */}
        <div
          aria-hidden={!mobileOpen}
          onClick={() => setMobileOpen(false)}
          className={`lg:hidden fixed inset-x-0 top-[var(--spacing-nav-h)] bottom-0 z-[300] bg-black/60 backdrop-blur-[2px] transition-opacity duration-200 ${
            mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        />
        <div
          className={`lg:hidden fixed top-[var(--spacing-nav-h)] bottom-0 left-0 z-[400] transition-transform duration-200 ease-out ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <AdminSidebar onNavigate={() => setMobileOpen(false)} className="h-full" />
        </div>

        {/* Main content */}
        <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
          {/* Mobile header with hamburger + section label */}
          <div className="lg:hidden shrink-0 flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] bg-[#0f1519]">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menú de administración"
              className="flex items-center justify-center w-9 h-9 rounded-md text-white/60 hover:text-white hover:bg-white/[0.05] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <span className="text-[0.85rem] font-semibold text-white/70">Administración</span>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin-dark">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

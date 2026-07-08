"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import LoginModal from "./components/auth/login/LoginModal";
import { useAuth } from "../context/AuthContext";
import { resolveDashboardPath } from "../lib/panelPreference";

export default function Home() {
  const [loginOpen, setLoginOpen] = useState(false);
  const router = useRouter();
  const { authLoading, isLoggedIn, hasActiveRole } = useAuth();

  /* Authenticated users don't belong on the marketing landing:
     · No active role      → always /dashboard/customer
     · Active role present → last selected panel (default "admin") */
  useEffect(() => {
    if (authLoading || !isLoggedIn) return;
    router.replace(resolveDashboardPath(hasActiveRole));
  }, [authLoading, isLoggedIn, hasActiveRole, router]);

  /* Hide the marketing content while auth is loading or while a redirect
     is imminent — prevents a flash of the landing for logged-in users. */
  if (authLoading || isLoggedIn) {
    return <div className="h-screen bg-[#0f1519]" />;
  }

  return (
    <>
      <Navbar />

      <main className="flex flex-col items-center pt-(--spacing-nav-h) md:flex-1 md:min-h-0">
        {/* ── Hero ── */}
        <section className="flex flex-col items-center justify-center text-center px-[1.25rem] pt-[2.5rem] pb-[1.5rem] gap-[1.1rem] md:flex-1 md:min-h-0 md:px-6 md:pt-6 md:pb-4 md:gap-[0.9rem]">
          <h1 className="text-[clamp(1.75rem,5vw,2.75rem)] font-extrabold text-white tracking-[-0.02em] leading-[1.15] [text-shadow:0_2px_12px_rgba(0,0,0,0.25)]">
            Bienvenido a Simplefit
          </h1>
          <p className="max-w-[500px] text-base text-white/78 leading-[1.65] md:text-[clamp(0.95rem,2vw,1.1rem)]">
            SimpleFit es una plataforma de gestión para gimnasios. Centraliza todo en un solo lugar.
          </p>
          <div className="flex flex-col items-stretch w-full max-w-[320px] gap-[0.85rem] justify-center mt-2 md:flex-row md:flex-wrap md:w-auto md:max-w-none">
            <button
              className="inline-flex items-center justify-center py-3 px-6 rounded-[5px] bg-white text-gradient-start text-[0.95rem] font-semibold shadow-[0_2px_10px_rgba(0,0,0,0.2)] border-0 cursor-pointer [transition:background_0.15s,color_0.15s,transform_0.12s] hover:bg-[#f0f0f0] hover:-translate-y-px md:py-[0.65rem] md:px-[1.75rem] md:text-[0.92rem]"
              onClick={() => setLoginOpen(true)}
            >
              Iniciar sesión
            </button>
            <button
              className="inline-flex items-center justify-center py-3 px-6 rounded-[5px] bg-transparent text-white text-[0.95rem] font-semibold border-2 border-white/55 cursor-pointer [transition:border-color_0.15s,background_0.15s,transform_0.12s] hover:border-white hover:bg-white/[0.08] hover:-translate-y-px md:py-[0.65rem] md:px-[1.75rem] md:text-[0.92rem]"
              onClick={() => router.push("/signup")}
            >
              Regístrese
            </button>
          </div>
        </section>
      </main>

      <Footer />

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}

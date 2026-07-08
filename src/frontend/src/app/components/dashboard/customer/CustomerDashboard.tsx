"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import Navbar from "../../navbar/Navbar";
import Footer from "../../footer/Footer";
import ChangePasswordModal from "../../auth/security/ChangePasswordModal";

export default function CustomerDashboard() {
  const router = useRouter();
  const { authLoading, isLoggedIn, user } = useAuth();
  const [isTempPassword, setIsTempPassword] = useState(false);
  const [changePassOpen, setChangePassOpen] = useState(false);

  useEffect(() => {
    const tempPass = sessionStorage.getItem("isTempPassword") === "true";
    setIsTempPassword(tempPass);
    if (tempPass) setChangePassOpen(true);
  }, []);

  /* Redirect to home once we know the user is not authenticated */
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push("/");
    }
  }, [authLoading, isLoggedIn, router]);

  /* While auth resolves (or during logout transition) keep the dark bg visible */
  if (authLoading || !user) {
    return <div className="h-screen bg-[#0f1519]" />;
  }

  return (
    <div className="h-screen flex flex-col bg-[#0f1519] overflow-y-auto scrollbar-thin-dark">
      <Navbar />

      <main className="flex-1 flex items-center justify-center pt-[calc(var(--spacing-nav-h)+1.75rem)] px-4 pb-10 sm:pt-24 sm:px-5 sm:pb-16">
        <div className="w-full max-w-[500px] flex flex-col items-center gap-8 text-center">

          {/* Icon */}
          <div className="w-[72px] h-[72px] rounded-full bg-white/[0.05] border border-white/[0.09] flex items-center justify-center shrink-0">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
          </div>

          {/* Greeting */}
          <div className="flex flex-col gap-2">
            <h1 className="text-[1.85rem] font-extrabold text-white tracking-[-0.03em] leading-[1.15]">
              ¡Bienvenido, {user.Name}!
            </h1>
            <p className="text-[0.95rem] text-white/45 leading-[1.6]">
              Nos alegra estés aquí.
            </p>
          </div>

          {/* Under construction card */}
          <div className="w-full bg-[#1a2228] border border-white/[0.07] rounded-[14px] p-6 sm:p-8 flex flex-col gap-4">
            <div className="flex items-center justify-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-400/80 animate-pulse" />
              <span className="text-[0.72rem] font-bold tracking-[0.12em] uppercase text-amber-400/70">
                En construcción
              </span>
            </div>
            <p className="text-[0.95rem] text-white/60 leading-[1.7]">
              El portal está siendo desarrollado.
              Muy pronto podrás gestionar todo desde aquí.
            </p>
            <p className="text-[0.82rem] text-white/30">
              Gracias por tu paciencia.
            </p>
          </div>

          {/* Profile shortcut */}
          <div className="w-full flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/profile")}
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[10px] bg-white text-[#0f1519] text-[0.9rem] font-semibold tracking-[-0.005em] hover:bg-white/90 active:scale-[0.99] transition-all shadow-[0_1px_2px_rgba(0,0,0,0.25)]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Actualizar mis datos de perfil
            </button>
            <p className="text-[0.78rem] text-white/35 leading-[1.5]">
              Cambia tu foto e información personal.
            </p>
          </div>

        </div>
      </main>

      <Footer />

      <ChangePasswordModal
        open={changePassOpen}
        onClose={() => {
          setChangePassOpen(false);
          sessionStorage.removeItem("isTempPassword");
          setIsTempPassword(false);
        }}
        email={user.Email}
        isTempPassword={isTempPassword}
      />
    </div>
  );
}

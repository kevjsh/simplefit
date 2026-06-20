"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { loginCustomer } from "../../../../services/auth.service";
import { getCustomerProfile } from "../../../../services/customer.service";
import { useNotifications } from "../../utils/NotificationSystem";
import { useAuth } from "../../../../context/AuthContext";
import RecoveryPasswordModal from "../security/RecoveryPasswordModal";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

export default function LoginModal({ open, onClose }: LoginModalProps) {
  const router = useRouter();
  const notify = useNotifications();
  const { login, updateProfilePicture } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(() => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("sf_remembered_email");
  });
  const [email, setEmail] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("sf_remembered_email") ?? "";
  });
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await loginCustomer({ email, password });
      if (remember) {
        localStorage.setItem("sf_remembered_email", email);
      } else {
        localStorage.removeItem("sf_remembered_email");
      }
      login(data.token);

      /* Fetch profile immediately to populate the picture in the navbar */
      getCustomerProfile(email)
        .then((profile) => updateProfilePicture(profile.ProfilePicture))
        .catch(() => {});

      sessionStorage.setItem("isTempPassword", data.isTempPassword ? "true" : "false");
      onClose();
      router.push("/dashboard/customer");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? "Correo electrónico o contraseña incorrectos.";
      notify.error(message);
    } finally {
      setLoading(false);
    }
  }

  /* Close on Escape */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  /* Lock body scroll while open */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
    {open && <div
      ref={overlayRef}
      className="fixed inset-0 z-[500] bg-black/70 backdrop-blur-[4px] flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div
        className="relative w-full max-w-[420px] bg-[#1a2228] border border-white/8 rounded-[14px] p-[2.25rem_2rem_1.75rem] flex flex-col gap-5 animate-slide-up shadow-[0_24px_64px_rgba(0,0,0,0.55)] max-[480px]:p-[2rem_1.4rem_1.5rem] max-[480px]:rounded-xl"
        role="dialog" aria-modal="true" aria-label="Iniciar sesión"
      >

        {/* Close */}
        <button
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-transparent border-none rounded-md text-white/40 cursor-pointer transition-[background,color] duration-150 hover:bg-white/[0.07] hover:text-white/85"
          onClick={onClose} aria-label="Cerrar"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src="https://firebasestorage.googleapis.com/v0/b/simplefit-6c181.firebasestorage.app/o/logos%2Fsimplefit.png?alt=media&token=64cccbb6-387b-4399-94d3-77b6c960ad34"
            alt="SimpleFit"
            width={130}
            height={52}
            className="object-contain brightness-0 invert"
            priority
          />
        </div>

        {/* Header */}
        <div className="text-center flex flex-col gap-[0.3rem] -mt-1">
          <h2 className="text-[1.55rem] font-extrabold text-white tracking-[-0.02em] leading-[1.15]">Iniciar sesión</h2>
          <p className="text-[0.88rem] text-white/45">Accede a tu cuenta</p>
        </div>

        {/* Form */}
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>

          {/* Email */}
          <div className="flex flex-col gap-[0.4rem]">
            <label className="text-[0.78rem] font-semibold text-white/60 tracking-[0.03em]" htmlFor="lm-email">
              Correo electrónico <span className="text-white/35 ml-0.5">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-[0.85rem] text-white/30 flex pointer-events-none">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </span>
              <input
                id="lm-email"
                type="email"
                className="w-full h-[46px] bg-[#111820] border border-white/9 rounded-[7px] text-white text-[0.92rem] pl-[2.6rem] pr-[2.75rem] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-white/20 focus:border-white/[0.28] focus:shadow-[0_0_0_3px_rgba(255,255,255,0.05)]"
                placeholder="correo@ejemplo.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-[0.4rem]">
            <label className="text-[0.78rem] font-semibold text-white/60 tracking-[0.03em]" htmlFor="lm-password">
              Contraseña <span className="text-white/35 ml-0.5">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-[0.85rem] text-white/30 flex pointer-events-none">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input
                id="lm-password"
                type={showPassword ? "text" : "password"}
                className="w-full h-[46px] bg-[#111820] border border-white/9 rounded-[7px] text-white text-[0.92rem] pl-[2.6rem] pr-[2.75rem] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-white/20 focus:border-white/[0.28] focus:shadow-[0_0_0_3px_rgba(255,255,255,0.05)]"
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 bg-transparent border-none text-white/30 cursor-pointer flex items-center p-1 rounded-sm transition-colors duration-150 hover:text-white/70"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="flex items-center justify-between gap-2 flex-wrap max-[480px]:flex-col max-[480px]:items-start">
            <label className="flex items-center gap-2 cursor-pointer text-[0.84rem] text-white/55 select-none">
              <span
                className={`w-[18px] h-[18px] border-[1.5px] border-white/[0.22] rounded-[4px] bg-[#111820] flex items-center justify-center shrink-0 transition-[border-color,background] duration-150 cursor-pointer ${remember ? "!bg-white/90 !border-white/90 text-[#1a2228]" : ""}`}
                onClick={() => setRemember((v) => !v)}
              >
                {remember && (
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1.5 6 4.5 9 10.5 3"/>
                  </svg>
                )}
              </span>
              <span onClick={() => setRemember((v) => !v)}>Recordarme</span>
            </label>
            <button
              type="button"
              className="bg-transparent border-none p-0 text-[0.82rem] font-[inherit] text-white/40 italic transition-colors duration-150 whitespace-nowrap cursor-pointer hover:text-white/75"
              onClick={() => setRecoveryOpen(true)}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full h-12 bg-white/[0.92] text-[#1a2228] text-[0.95rem] font-bold border-none rounded-[7px] cursor-pointer tracking-[0.02em] transition-[background,transform] duration-150 mt-1 hover:bg-white hover:-translate-y-px active:translate-y-0 disabled:opacity-55 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Accediendo..." : "Acceder"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-[0.8rem] text-white/30">
          ¿No tienes cuenta?{" "}
          <Link href="/signup" className="text-white/55 transition-colors duration-150 hover:text-white/85" onClick={onClose}>
            Regístrate aquí
          </Link>
        </p>

      </div>
    </div>}

    <RecoveryPasswordModal
      open={recoveryOpen}
      onClose={() => setRecoveryOpen(false)}
      onBackToLogin={() => setRecoveryOpen(false)}
    />
  </>
  );
}

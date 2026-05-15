"use client";

import { useEffect, useRef, useState } from "react";
import { recoveryPassword } from "../../../../services/auth.service";
import { useNotifications } from "../../utils/NotificationSystem";

interface RecoveryPasswordModalProps {
  open: boolean;
  onClose: () => void;
  onBackToLogin: () => void;
}

export default function RecoveryPasswordModal({ open, onClose, onBackToLogin }: RecoveryPasswordModalProps) {
  const notify = useNotifications();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await recoveryPassword({ email });
      notify.success("Revisa tu correo, te enviamos las instrucciones.");
      setEmail("");
      onClose();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? "No encontramos una cuenta con ese correo.";
      notify.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[600] bg-black/75 backdrop-blur-[4px] flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div
        className="relative w-full max-w-[400px] bg-[#1a2228] border border-white/8 rounded-[14px] p-[2.25rem_2rem_1.75rem] flex flex-col gap-[1.1rem] animate-slide-up shadow-[0_24px_64px_rgba(0,0,0,0.55)] max-[480px]:p-[2rem_1.4rem_1.5rem] max-[480px]:rounded-xl"
        role="dialog" aria-modal="true" aria-label="Recuperar contraseña"
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

        {/* Icon */}
        <div className="flex justify-center text-white/85 mt-2">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
          </svg>
        </div>

        {/* Header */}
        <div className="text-center flex flex-col gap-[0.3rem]">
          <h2 className="text-[1.5rem] font-extrabold text-white tracking-[-0.02em] leading-[1.15] m-0">Recuperar cuenta</h2>
          <p className="text-[0.86rem] text-white/45 m-0">Ingresa tu correo para recibir las instrucciones</p>
        </div>

        {/* Form */}
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-[0.4rem]">
            <label className="text-[0.78rem] font-semibold text-white/60 tracking-[0.03em]" htmlFor="rp-email">
              Correo electrónico <span className="text-white/35 ml-0.5">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-[0.85rem] text-white/30 flex pointer-events-none">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </span>
              <input
                id="rp-email"
                type="email"
                className="w-full h-[46px] bg-[#111820] border border-white/9 rounded-[7px] text-white text-[0.92rem] pl-[2.6rem] pr-4 outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-white/20 focus:border-white/[0.28] focus:shadow-[0_0_0_3px_rgba(255,255,255,0.05)]"
                placeholder="correo@ejemplo.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-12 bg-white/12 text-white/90 text-[0.95rem] font-bold border border-white/15 rounded-[7px] cursor-pointer tracking-[0.02em] transition-[background,transform] duration-150 mt-1 hover:not-disabled:bg-white/[0.18] hover:not-disabled:-translate-y-px active:not-disabled:translate-y-0 disabled:opacity-55 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Enviando..." : "Enviar instrucciones"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-[0.8rem] text-white/30 m-0">
          ¿Recordaste tu contraseña?{" "}
          <button
            type="button"
            className="bg-none border-none text-white/55 cursor-pointer text-[inherit] font-[inherit] transition-colors duration-150 p-0 hover:text-white/85"
            onClick={onBackToLogin}
          >
            Iniciar sesión
          </button>
        </p>

      </div>
    </div>
  );
}

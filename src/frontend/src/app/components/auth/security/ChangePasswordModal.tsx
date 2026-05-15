"use client";

import { useEffect, useRef, useState } from "react";
import { changePassword } from "../../../../services/auth.service";
import { useNotifications } from "../../utils/NotificationSystem";

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
  email: string;
  isTempPassword?: boolean;
}

export default function ChangePasswordModal({ open, onClose, email, isTempPassword = false }: ChangePasswordModalProps) {
  const notify = useNotifications();
  const [current, setCurrent]         = useState("");
  const [newPass, setNewPass]         = useState("");
  const [confirm, setConfirm]         = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]         = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape" && !isTempPassword) onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose, isTempPassword]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  function reset() {
    setCurrent(""); setNewPass(""); setConfirm("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPass !== confirm) {
      notify.error("Las contraseñas nuevas no coinciden.");
      return;
    }
    setLoading(true);
    try {
      await changePassword({ email, password: current, newPassword: newPass, confirmation: confirm });
      notify.success("¡Contraseña actualizada exitosamente!");
      reset();
      onClose();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? "No se pudo cambiar la contraseña. Verifica tus datos.";
      notify.error(message);
    } finally {
      setLoading(false);
    }
  }

  const EyeIcon = ({ visible }: { visible: boolean }) =>
    visible ? (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </svg>
    ) : (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
      </svg>
    );

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[600] bg-black/75 backdrop-blur-[4px] flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => { if (e.target === overlayRef.current && !isTempPassword) onClose(); }}
    >
      <div
        className="relative w-full max-w-[400px] bg-[#1a2228] border border-white/8 rounded-[14px] p-[2.25rem_2rem_1.75rem] flex flex-col gap-[1.1rem] animate-slide-up shadow-[0_24px_64px_rgba(0,0,0,0.55)] max-[480px]:p-[2rem_1.4rem_1.5rem] max-[480px]:rounded-xl"
        role="dialog" aria-modal="true" aria-label="Cambio de contraseña"
      >

        {/* Close — hidden if isTempPassword (forced flow) */}
        {!isTempPassword && (
          <button
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-transparent border-none rounded-md text-white/40 cursor-pointer transition-[background,color] duration-150 hover:bg-white/[0.07] hover:text-white/85"
            onClick={onClose} aria-label="Cerrar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}

        {/* Icon */}
        <div className="flex justify-center text-white/85 mt-2">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>

        {/* Header */}
        <div className="text-center flex flex-col gap-[0.4rem]">
          <h2 className="text-[1.5rem] font-extrabold text-white tracking-[-0.02em] leading-[1.15] m-0">Cambio de contraseña</h2>
          {isTempPassword && (
            <p className="text-[0.82rem] text-[#fb8c00] bg-[rgba(251,140,0,0.1)] border border-[rgba(251,140,0,0.2)] rounded-md px-3 py-2 m-0 leading-[1.4]">
              Estás usando una contraseña temporal. Debes establecer una nueva para continuar.
            </p>
          )}
        </div>

        {/* Form */}
        <form className="flex flex-col gap-[0.9rem]" onSubmit={handleSubmit}>

          {/* Contraseña actual */}
          <div className="flex flex-col gap-[0.4rem]">
            <label className="text-[0.78rem] font-semibold text-white/60 tracking-[0.03em]" htmlFor="cp-current">
              {isTempPassword ? "Contraseña temporal" : "Contraseña actual"} <span className="text-white/35 ml-0.5">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-[0.85rem] text-white/30 flex pointer-events-none">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input
                id="cp-current"
                type={showCurrent ? "text" : "password"}
                className="w-full h-[46px] bg-[#111820] border border-white/9 rounded-[7px] text-white text-[0.92rem] pl-[2.6rem] pr-[2.75rem] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-white/20 focus:border-white/[0.28] focus:shadow-[0_0_0_3px_rgba(255,255,255,0.05)]"
                placeholder="••••••••"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                required
              />
              <button type="button" className="absolute right-3 bg-transparent border-none text-white/30 cursor-pointer flex items-center p-1 rounded-sm transition-colors duration-150 hover:text-white/70" onClick={() => setShowCurrent(v => !v)} aria-label="Mostrar/ocultar">
                <EyeIcon visible={showCurrent} />
              </button>
            </div>
          </div>

          {/* Nueva contraseña */}
          <div className="flex flex-col gap-[0.4rem]">
            <label className="text-[0.78rem] font-semibold text-white/60 tracking-[0.03em]" htmlFor="cp-new">
              Nueva contraseña <span className="text-white/35 ml-0.5">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-[0.85rem] text-white/30 flex pointer-events-none">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input
                id="cp-new"
                type={showNew ? "text" : "password"}
                className="w-full h-[46px] bg-[#111820] border border-white/9 rounded-[7px] text-white text-[0.92rem] pl-[2.6rem] pr-[2.75rem] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-white/20 focus:border-white/[0.28] focus:shadow-[0_0_0_3px_rgba(255,255,255,0.05)]"
                placeholder="••••••••"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                required
              />
              <button type="button" className="absolute right-3 bg-transparent border-none text-white/30 cursor-pointer flex items-center p-1 rounded-sm transition-colors duration-150 hover:text-white/70" onClick={() => setShowNew(v => !v)} aria-label="Mostrar/ocultar">
                <EyeIcon visible={showNew} />
              </button>
            </div>
          </div>

          {/* Confirmar */}
          <div className="flex flex-col gap-[0.4rem]">
            <label className="text-[0.78rem] font-semibold text-white/60 tracking-[0.03em]" htmlFor="cp-confirm">
              Confirmar nueva contraseña <span className="text-white/35 ml-0.5">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-[0.85rem] text-white/30 flex pointer-events-none">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input
                id="cp-confirm"
                type={showConfirm ? "text" : "password"}
                className="w-full h-[46px] bg-[#111820] border border-white/9 rounded-[7px] text-white text-[0.92rem] pl-[2.6rem] pr-[2.75rem] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-white/20 focus:border-white/[0.28] focus:shadow-[0_0_0_3px_rgba(255,255,255,0.05)]"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
              <button type="button" className="absolute right-3 bg-transparent border-none text-white/30 cursor-pointer flex items-center p-1 rounded-sm transition-colors duration-150 hover:text-white/70" onClick={() => setShowConfirm(v => !v)} aria-label="Mostrar/ocultar">
                <EyeIcon visible={showConfirm} />
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-12 bg-[#e53935] text-white text-[0.95rem] font-bold border-none rounded-[7px] cursor-pointer tracking-[0.02em] transition-[background,transform] duration-150 mt-1 hover:not-disabled:bg-[#ef5350] hover:not-disabled:-translate-y-px active:not-disabled:translate-y-0 disabled:opacity-55 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Cambiando..." : "Cambiar contraseña"}
          </button>
        </form>

      </div>
    </div>
  );
}

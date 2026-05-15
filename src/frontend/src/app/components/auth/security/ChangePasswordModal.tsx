"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./ChangePasswordModal.module.css";
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
      className={styles.overlay}
      onClick={(e) => { if (e.target === overlayRef.current && !isTempPassword) onClose(); }}
    >
      <div className={styles.panel} role="dialog" aria-modal="true" aria-label="Cambio de contraseña">

        {/* Close — hidden if isTempPassword (forced flow) */}
        {!isTempPassword && (
          <button className={styles.close} onClick={onClose} aria-label="Cerrar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}

        {/* Icon */}
        <div className={styles.iconWrap}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>

        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Cambio de contraseña</h2>
          {isTempPassword && (
            <p className={styles.tempWarning}>
              Estás usando una contraseña temporal. Debes establecer una nueva para continuar.
            </p>
          )}
        </div>

        {/* Form */}
        <form className={styles.form} onSubmit={handleSubmit}>

          {/* Contraseña actual */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="cp-current">
              {isTempPassword ? "Contraseña temporal" : "Contraseña actual"} <span className={styles.required}>*</span>
            </label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input
                id="cp-current"
                type={showCurrent ? "text" : "password"}
                className={styles.input}
                placeholder="••••••••"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                required
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowCurrent(v => !v)} aria-label="Mostrar/ocultar">
                <EyeIcon visible={showCurrent} />
              </button>
            </div>
          </div>

          {/* Nueva contraseña */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="cp-new">
              Nueva contraseña <span className={styles.required}>*</span>
            </label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input
                id="cp-new"
                type={showNew ? "text" : "password"}
                className={styles.input}
                placeholder="••••••••"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                required
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowNew(v => !v)} aria-label="Mostrar/ocultar">
                <EyeIcon visible={showNew} />
              </button>
            </div>
          </div>

          {/* Confirmar */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="cp-confirm">
              Confirmar nueva contraseña <span className={styles.required}>*</span>
            </label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input
                id="cp-confirm"
                type={showConfirm ? "text" : "password"}
                className={styles.input}
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowConfirm(v => !v)} aria-label="Mostrar/ocultar">
                <EyeIcon visible={showConfirm} />
              </button>
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Cambiando..." : "Cambiar contraseña"}
          </button>
        </form>

      </div>
    </div>
  );
}

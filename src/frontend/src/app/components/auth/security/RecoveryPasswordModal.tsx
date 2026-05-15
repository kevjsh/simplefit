"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./RecoveryPasswordModal.module.css";
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
      className={styles.overlay}
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div className={styles.panel} role="dialog" aria-modal="true" aria-label="Recuperar contraseña">

        {/* Close */}
        <button className={styles.close} onClick={onClose} aria-label="Cerrar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {/* Icon */}
        <div className={styles.iconWrap}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
          </svg>
        </div>

        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Recuperar cuenta</h2>
          <p className={styles.subtitle}>Ingresa tu correo para recibir las instrucciones</p>
        </div>

        {/* Form */}
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="rp-email">
              Correo electrónico <span className={styles.required}>*</span>
            </label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </span>
              <input
                id="rp-email"
                type="email"
                className={styles.input}
                placeholder="correo@ejemplo.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Enviando..." : "Enviar instrucciones"}
          </button>
        </form>

        {/* Footer */}
        <p className={styles.footerText}>
          ¿Recordaste tu contraseña?{" "}
          <button type="button" className={styles.footerLink} onClick={onBackToLogin}>
            Iniciar sesión
          </button>
        </p>

      </div>
    </div>
  );
}

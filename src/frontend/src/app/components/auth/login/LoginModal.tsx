"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import styles from "./LoginModal.module.css";
import { loginCustomer } from "../../../../services/auth.service";
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
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await loginCustomer({ email, password });
      login(data.token);
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
      className={styles.overlay}
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div className={styles.panel} role="dialog" aria-modal="true" aria-label="Iniciar sesión">

        {/* Close */}
        <button className={styles.close} onClick={onClose} aria-label="Cerrar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {/* Logo */}
        <div className={styles.logoWrap}>
          <Image
            src="https://firebasestorage.googleapis.com/v0/b/simplefit-6c181.firebasestorage.app/o/logos%2Fsimplefit.png?alt=media&token=64cccbb6-387b-4399-94d3-77b6c960ad34"
            alt="SimpleFit"
            width={150}
            height={60}
            className={styles.logo}
            priority
          />
        </div>

        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Iniciar sesión</h2>
          <p className={styles.subtitle}>Accede a tu cuenta</p>
        </div>

        {/* Form */}
        <form className={styles.form} onSubmit={handleSubmit}>

          {/* Email */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="lm-email">
              Correo electrónico <span className={styles.required}>*</span>
            </label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </span>
              <input
                id="lm-email"
                type="email"
                className={styles.input}
                placeholder="correo@ejemplo.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="lm-password">
              Contraseña <span className={styles.required}>*</span>
            </label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input
                id="lm-password"
                type={showPassword ? "text" : "password"}
                className={styles.input}
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className={styles.eyeBtn}
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
          <div className={styles.options}>
            <label className={styles.checkLabel}>
              <span className={`${styles.checkbox} ${remember ? styles.checked : ""}`} onClick={() => setRemember((v) => !v)}>
                {remember && (
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1.5 6 4.5 9 10.5 3"/>
                  </svg>
                )}
              </span>
              <span onClick={() => setRemember((v) => !v)}>Recordarme</span>
            </label>
            <button type="button" className={styles.forgot} onClick={() => setRecoveryOpen(true)}>
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          {/* Submit */}
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Accediendo..." : "Acceder"}
          </button>
        </form>

        {/* Footer */}
        <p className={styles.footerText}>
          ¿No tienes cuenta?{" "}
          <Link href="/signup" className={styles.footerLink} onClick={onClose}>
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

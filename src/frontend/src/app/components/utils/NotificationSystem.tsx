"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import styles from "./NotificationSystem.module.css";

/* ── Types ─────────────────────────────────────────────── */
export type NotificationType = "success" | "error" | "warning" | "info";

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  duration: number;
}

interface NotificationContextType {
  showNotification: (message: string, type: NotificationType, duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError:   (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo:    (message: string, duration?: number) => void;
}

/* ── Context ────────────────────────────────────────────── */
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

/* ── Icons ──────────────────────────────────────────────── */
const ICONS: Record<NotificationType, React.ReactNode> = {
  success: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  error: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  warning: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  info: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
};

/* ── Provider ───────────────────────────────────────────── */
export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = (message: string, type: NotificationType, duration = 5000) => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, { id, message, type, duration }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, duration);
  };

  const showSuccess = (message: string, duration?: number) => showNotification(message, "success", duration);
  const showError   = (message: string, duration?: number) => showNotification(message, "error",   duration);
  const showWarning = (message: string, duration?: number) => showNotification(message, "warning", duration);
  const showInfo    = (message: string, duration?: number) => showNotification(message, "info",    duration);

  const dismiss = (id: string) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));

  return (
    <NotificationContext.Provider value={{ showNotification, showSuccess, showError, showWarning, showInfo }}>
      {children}

      <div className={styles.stack}>
        {notifications.map((n, index) => (
          <div
            key={n.id}
            className={`${styles.toast} ${styles[n.type]}`}
            style={{ top: `${16 + index * 72}px` }}
            role="alert"
          >
            <span className={styles.icon}>{ICONS[n.type]}</span>
            <span className={styles.message}>{n.message}</span>
            <button className={styles.close} onClick={() => dismiss(n.id)} aria-label="Cerrar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

/* ── Hooks ──────────────────────────────────────────────── */
export function useNotification(): NotificationContextType {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotification must be used within a NotificationProvider");
  return ctx;
}

export function useNotifications() {
  const { showSuccess, showError, showWarning, showInfo } = useNotification();
  return { success: showSuccess, error: showError, warning: showWarning, info: showInfo };
}

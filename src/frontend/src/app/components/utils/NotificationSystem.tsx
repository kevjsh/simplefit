"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

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

const TOAST_BG: Record<NotificationType, string> = {
  success: "bg-[linear-gradient(135deg,#2e7d32,#43a047)]",
  error:   "bg-[linear-gradient(135deg,#c62828,#e53935)]",
  warning: "bg-[linear-gradient(135deg,#e65100,#fb8c00)]",
  info:    "bg-[linear-gradient(135deg,#1565c0,#1e88e5)]",
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

      <div className="fixed top-0 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center pointer-events-none">
        {notifications.map((n, index) => (
          <div
            key={n.id}
            className={[
              "fixed left-1/2 -translate-x-1/2 flex items-center gap-[10px] py-3 px-4 rounded-xl",
              "min-w-[300px] max-w-[500px] w-max",
              "shadow-[0_8px_32px_rgba(0,0,0,0.25)] text-white text-[0.9rem] font-medium",
              "pointer-events-auto animate-toast-slide-down transition-[top] duration-300 ease-in-out",
              TOAST_BG[n.type],
            ].join(" ")}
            style={{ top: `${16 + index * 72}px` }}
            role="alert"
          >
            <span className="flex items-center shrink-0 opacity-95">{ICONS[n.type]}</span>
            <span className="flex-1 leading-[1.4]">{n.message}</span>
            <button
              className="flex items-center justify-center bg-transparent border-none text-inherit cursor-pointer opacity-70 p-[2px] rounded shrink-0 transition-opacity duration-150 hover:opacity-100"
              onClick={() => dismiss(n.id)}
              aria-label="Cerrar"
            >
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

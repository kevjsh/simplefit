"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Calendar.module.css";

interface CalendarProps {
  value: string;           // yyyy-mm-dd or ""
  onSelect: (iso: string) => void;
  onClose: () => void;
}

const MONTHS = [
  "enero","febrero","marzo","abril","mayo","junio",
  "julio","agosto","septiembre","octubre","noviembre","diciembre",
];
const DAYS = ["L","M","M","J","V","S","D"];

function daysInMonth(y: number, m: number) {
  return new Date(y, m + 1, 0).getDate();
}

/* Monday-based offset (0=Mon…6=Sun) */
function startOffset(y: number, m: number) {
  return (new Date(y, m, 1).getDay() + 6) % 7;
}

export default function Calendar({ value, onSelect, onClose }: CalendarProps) {
  const today = new Date();
  const initDate = value ? new Date(value + "T00:00:00") : today;

  const [viewYear, setViewYear] = useState(initDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initDate.getMonth());
  const [mode, setMode] = useState<"days" | "months" | "years">("days");
  const ref = useRef<HTMLDivElement>(null);

  /* Close on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const selectDay = (d: number) => {
    const iso = `${viewYear}-${String(viewMonth + 1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    onSelect(iso);
    onClose();
  };

  const isSelected = (d: number) => {
    if (!value) return false;
    return value === `${viewYear}-${String(viewMonth+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  };

  const isToday = (d: number) =>
    today.getFullYear() === viewYear &&
    today.getMonth() === viewMonth &&
    today.getDate() === d;

  const totalDays = daysInMonth(viewYear, viewMonth);
  const offset    = startOffset(viewYear, viewMonth);
  const cells     = offset + totalDays;
  const rows      = Math.ceil(cells / 7);

  /* Year range for year picker */
  const yearStart = Math.floor(viewYear / 12) * 12;
  const years = Array.from({ length: 12 }, (_, i) => yearStart + i);

  return (
    <div ref={ref} className={styles.calendar}>

      {/* ── Header ──────────────────────────────────────── */}
      <div className={styles.header}>
        <button
          type="button"
          className={styles.headerLabel}
          onClick={() => setMode(mode === "days" ? "months" : "days")}
        >
          {MONTHS[viewMonth]} {viewYear}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        <div className={styles.navBtns}>
          {mode === "years" ? (
            <>
              <button type="button" className={styles.navBtn} onClick={() => setViewYear((y) => y - 12)}>‹</button>
              <button type="button" className={styles.navBtn} onClick={() => setViewYear((y) => y + 12)}>›</button>
            </>
          ) : (
            <>
              <button type="button" className={styles.navBtn} onClick={prevMonth}>‹</button>
              <button type="button" className={styles.navBtn} onClick={nextMonth}>›</button>
            </>
          )}
        </div>
      </div>

      {/* ── Day grid ────────────────────────────────────── */}
      {mode === "days" && (
        <>
          <div className={styles.weekRow}>
            {DAYS.map((d, i) => <span key={i} className={styles.weekDay}>{d}</span>)}
          </div>
          <div className={styles.dayGrid}>
            {Array.from({ length: rows * 7 }, (_, i) => {
              const day = i - offset + 1;
              const valid = day >= 1 && day <= totalDays;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={!valid}
                  onClick={() => valid && selectDay(day)}
                  className={`${styles.day} ${!valid ? styles.dayEmpty : ""} ${valid && isToday(day) ? styles.dayToday : ""} ${valid && isSelected(day) ? styles.daySelected : ""}`}
                >
                  {valid ? day : ""}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* ── Month picker ────────────────────────────────── */}
      {mode === "months" && (
        <div className={styles.monthGrid}>
          {MONTHS.map((m, i) => (
            <button
              key={i}
              type="button"
              className={`${styles.monthBtn} ${i === viewMonth ? styles.monthSelected : ""}`}
              onClick={() => { setViewMonth(i); setMode("days"); }}
            >
              {m.slice(0, 3)}
            </button>
          ))}
        </div>
      )}

      {/* ── Year picker ─────────────────────────────────── */}
      {mode === "years" && (
        <div className={styles.yearGrid}>
          {years.map((y) => (
            <button
              key={y}
              type="button"
              className={`${styles.yearBtn} ${y === viewYear ? styles.yearSelected : ""}`}
              onClick={() => { setViewYear(y); setMode("months"); }}
            >
              {y}
            </button>
          ))}
        </div>
      )}

      {/* Footer shortcut */}
      <div className={styles.footer}>
        <button
          type="button"
          className={styles.todayBtn}
          onClick={() => {
            setViewYear(today.getFullYear());
            setViewMonth(today.getMonth());
            setMode("days");
          }}
        >
          Hoy
        </button>
      </div>

    </div>
  );
}

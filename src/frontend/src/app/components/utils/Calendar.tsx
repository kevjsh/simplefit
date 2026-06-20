"use client";

import { useEffect, useRef, useState } from "react";

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

const NAV_BTN =
  "size-[30px] flex items-center justify-center bg-transparent rounded-[5px] text-white/50 text-[1.1rem] cursor-pointer transition-[background,color] duration-[120ms] hover:bg-white/[0.08] hover:text-white";

export default function Calendar({ value, onSelect, onClose }: CalendarProps) {
  const today = new Date();
  const initDate = value ? new Date(value + "T00:00:00") : today;

  const [viewYear, setViewYear] = useState(initDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initDate.getMonth());
  const [mode, setMode] = useState<"days" | "months" | "years">("days");
  const ref = useRef<HTMLDivElement>(null);

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

  const handlePrev = () => {
    if (mode === "years") setViewYear((y) => y - 12);
    else if (mode === "months") setViewYear((y) => y - 1);
    else prevMonth();
  };
  const handleNext = () => {
    if (mode === "years") setViewYear((y) => y + 12);
    else if (mode === "months") setViewYear((y) => y + 1);
    else nextMonth();
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

  const yearStart = Math.floor(viewYear / 12) * 12;
  const years = Array.from({ length: 12 }, (_, i) => yearStart + i);

  const dayClasses = (day: number, valid: boolean) => {
    const sel = valid && isSelected(day);
    const tod = valid && isToday(day);
    return [
      "aspect-square flex items-center justify-center rounded-full text-[0.82rem] font-[inherit]",
      "transition-[background,color] duration-[120ms]",
      !valid && "cursor-default text-transparent",
      valid && !sel && "cursor-pointer text-white/75 hover:bg-white/[0.09] hover:text-white",
      tod && !sel && "text-white font-bold border-[1.5px] border-white/35",
      sel && "cursor-pointer bg-white text-[#1a2228] font-bold",
    ].filter(Boolean).join(" ");
  };

  const pickerBtnClasses = (isActive: boolean) =>
    [
      "py-[0.55rem] px-0 bg-transparent rounded-[6px] text-[0.83rem] font-[inherit]",
      "cursor-pointer transition-[background,color] duration-[120ms]",
      isActive
        ? "bg-white text-[#1a2228] font-bold"
        : "text-white/65 hover:bg-white/[0.08] hover:text-white",
    ].join(" ");

  return (
    <div
      ref={ref}
      className="absolute bottom-[calc(100%+6px)] left-0 z-[300] w-[280px] bg-[#1a2228] border border-white/10 rounded-[10px] shadow-[0_16px_48px_rgba(0,0,0,0.55)] p-3 animate-cal-in"
    >
      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-[0.65rem]">
        <div className="flex items-center gap-0.5">
          {/* Month — click to toggle month picker */}
          <button
            type="button"
            className="bg-transparent font-semibold font-[inherit] cursor-pointer py-[0.3rem] px-2 rounded-[5px] transition-[background,color] duration-[120ms] capitalize text-[0.9rem] hover:bg-white/[0.07] text-white"
            onClick={() => setMode(mode === "months" ? "days" : "months")}
          >
            {MONTHS[viewMonth]}
          </button>
          {/* Year — click to toggle year picker */}
          <button
            type="button"
            className={[
              "bg-transparent font-semibold font-[inherit] cursor-pointer py-[0.3rem] px-2 rounded-[5px] transition-[background,color] duration-[120ms] text-[0.9rem] hover:bg-white/[0.07]",
              mode === "years" ? "text-white bg-white/[0.07]" : "text-white/60 hover:text-white",
            ].join(" ")}
            onClick={() => setMode(mode === "years" ? "days" : "years")}
          >
            {viewYear}
          </button>
        </div>
        <div className="flex gap-0.5">
          <button type="button" className={NAV_BTN} onClick={handlePrev}>‹</button>
          <button type="button" className={NAV_BTN} onClick={handleNext}>›</button>
        </div>
      </div>

      {/* ── Day grid ────────────────────────────────────── */}
      {mode === "days" && (
        <>
          <div className="grid grid-cols-7 mb-[0.3rem]">
            {DAYS.map((d, i) => (
              <span key={i} className="text-center text-[0.72rem] font-semibold text-white/30 py-[0.2rem] uppercase">
                {d}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: rows * 7 }, (_, i) => {
              const day = i - offset + 1;
              const valid = day >= 1 && day <= totalDays;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={!valid}
                  onClick={() => valid && selectDay(day)}
                  className={dayClasses(day, valid)}
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
        <div className="grid grid-cols-3 gap-1 py-1">
          {MONTHS.map((m, i) => (
            <button
              key={i}
              type="button"
              className={`${pickerBtnClasses(i === viewMonth)} capitalize`}
              onClick={() => { setViewMonth(i); setMode("days"); }}
            >
              {m.slice(0, 3)}
            </button>
          ))}
        </div>
      )}

      {/* ── Year picker ─────────────────────────────────── */}
      {mode === "years" && (
        <>
          <div className="text-center text-[0.68rem] font-semibold text-white/25 uppercase tracking-[0.07em] mb-1.5">
            {yearStart} – {yearStart + 11}
          </div>
          <div className="grid grid-cols-3 gap-1 py-1">
            {years.map((y) => (
              <button
                key={y}
                type="button"
                className={pickerBtnClasses(y === viewYear)}
                onClick={() => { setViewYear(y); setMode("months"); }}
              >
                {y}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Footer shortcut */}
      <div className="flex justify-end border-t border-t-white/[0.07] pt-2 mt-2">
        <button
          type="button"
          className="bg-transparent text-[0.78rem] font-[inherit] text-white/45 cursor-pointer py-[0.2rem] px-[0.4rem] rounded transition-[color,background] duration-[120ms] hover:text-white hover:bg-white/[0.06]"
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

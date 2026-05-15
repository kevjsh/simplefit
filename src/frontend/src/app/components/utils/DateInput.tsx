"use client";

import { useState, useEffect } from "react";
import Calendar from "./Calendar";

interface DateInputProps {
  id?: string;
  value: string;           // yyyy-mm-dd
  onChange: (val: string) => void;
  hasError?: boolean;
}

function parseManual(raw: string): string {
  const sep = raw.includes("/") ? "/" : "-";
  const parts = raw.split(sep).map((p) => p.trim());
  if (parts.length !== 3) return "";
  let [d, m, y] = parts.map(Number);
  if (isNaN(d) || isNaN(m) || isNaN(y)) return "";
  if (y < 100) y = y < 40 ? 2000 + y : 1900 + y;
  if (m < 1 || m > 12 || d < 1 || d > 31 || y < 1900 || y > 2100) return "";
  const iso = `${y}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  const dt = new Date(iso + "T00:00:00");
  if (isNaN(dt.getTime())) return "";
  if (dt.getMonth() + 1 !== m || dt.getDate() !== d) return "";
  return iso;
}

function toDisplay(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}-${m}-${y}`;
}

export default function DateInput({ id, value, onChange, hasError }: DateInputProps) {
  const [text, setText] = useState(toDisplay(value));
  const [inlineError, setInlineError] = useState(false);
  const [calOpen, setCalOpen] = useState(false);

  useEffect(() => {
    setText(toDisplay(value));
    setInlineError(false);
  }, [value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    setInlineError(false);
  };

  const handleBlur = () => {
    const raw = text.trim();
    if (!raw) { onChange(""); setInlineError(false); return; }
    const iso = parseManual(raw);
    if (iso) {
      onChange(iso);
      setText(toDisplay(iso));
      setInlineError(false);
    } else {
      onChange("");
      setInlineError(true);
    }
  };

  const handleCalSelect = (iso: string) => {
    onChange(iso);
    setText(toDisplay(iso));
    setInlineError(false);
  };

  const showError = hasError || inlineError;

  return (
    <div className="flex flex-col gap-[0.4rem] relative">
      <div
        className={[
          "relative flex items-center bg-[#111820] border rounded-[7px] transition duration-150",
          showError
            ? "border-[rgba(255,100,100,0.55)] focus-within:shadow-[0_0_0_3px_rgba(255,100,100,0.08)]"
            : "border-white/[0.09] focus-within:border-white/[0.28] focus-within:shadow-[0_0_0_3px_rgba(255,255,255,0.05)]",
        ].join(" ")}
      >
        <input
          id={id}
          type="text"
          className="flex-1 h-[46px] bg-transparent border-none outline-none text-white text-[0.92rem] font-[inherit] pr-2 pl-4 min-w-0 placeholder:text-white/20"
          value={text}
          onChange={handleTextChange}
          onBlur={handleBlur}
          placeholder="dd-mm-yyyy"
          maxLength={10}
          autoComplete="off"
        />
        <button
          type="button"
          className={[
            "shrink-0 w-10 h-10 flex items-center justify-center",
            "border-l border-l-white/[0.07] cursor-pointer rounded-l-none rounded-r-[7px]",
            "transition-[background,color] duration-150",
            "hover:bg-white/[0.05] hover:text-white/80",
            calOpen
              ? "bg-white/[0.08] text-white/90"
              : "text-white/35",
          ].join(" ")}
          aria-label="Abrir calendario"
          onClick={() => setCalOpen((v) => !v)}
          tabIndex={-1}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </button>
      </div>

      {calOpen && (
        <Calendar
          value={value}
          onSelect={handleCalSelect}
          onClose={() => setCalOpen(false)}
        />
      )}

      {inlineError ? (
        <span className="text-[0.76rem] text-[rgba(255,110,110,0.9)]">
          Fecha inválida — usa el formato dd-mm-yyyy
        </span>
      ) : (
        <span className="text-[0.72rem] text-white/30">Formato: dd-mm-yyyy</span>
      )}
    </div>
  );
}

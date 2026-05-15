"use client";

import { useEffect, useRef, useState } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  hasError?: boolean;
}

export default function SelectInput({
  id,
  value,
  onChange,
  options,
  placeholder = "Seleccionar...",
  hasError = false,
}: SelectInputProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value) ?? null;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const toggle = () => setOpen((v) => !v);

  const select = (opt: SelectOption) => {
    onChange(opt.value);
    setOpen(false);
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        id={id}
        type="button"
        className={[
          "w-full h-[46px] flex items-center justify-between gap-2 pr-[0.85rem] pl-4",
          "bg-[#111820] border rounded-[7px] cursor-pointer font-[inherit]",
          "transition duration-150 outline-none",
          hasError
            ? "border-[rgba(255,100,100,0.55)]"
            : open
              ? "border-white/[0.28]"
              : "border-white/[0.09]",
          hasError
            ? "focus-visible:shadow-[0_0_0_3px_rgba(255,100,100,0.08)]"
            : "focus-visible:border-white/[0.28] focus-visible:shadow-[0_0_0_3px_rgba(255,255,255,0.05)]",
          open && (hasError
            ? "shadow-[0_0_0_3px_rgba(255,100,100,0.08)]"
            : "shadow-[0_0_0_3px_rgba(255,255,255,0.05)]"),
        ].filter(Boolean).join(" ")}
        onClick={toggle}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span
          className={
            selected
              ? "text-[0.92rem] text-white text-left whitespace-nowrap overflow-hidden text-ellipsis"
              : "text-[0.92rem] text-white/20 text-left"
          }
        >
          {selected ? selected.label : placeholder}
        </span>
        <svg
          className={[
            "shrink-0 text-white/35 transition-[transform,color] duration-200 ease-in-out",
            open && "rotate-180 text-white/70",
          ].filter(Boolean).join(" ")}
          width="15" height="15" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <ul
          className="absolute bottom-[calc(100%+5px)] left-0 right-0 z-[300] bg-[#1a2228] border border-white/10 rounded-lg shadow-[0_16px_40px_rgba(0,0,0,0.5)] p-[0.3rem] list-none animate-drop-in max-h-[220px] overflow-y-auto [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.12)_transparent]"
          role="listbox"
        >
          {options.map((opt) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              className={[
                "flex items-center justify-between gap-2 py-[0.6rem] px-[0.85rem] rounded-[5px] text-[0.9rem]",
                "cursor-pointer transition-[background,color] duration-[120ms] select-none",
                "hover:bg-white/[0.07] hover:text-white",
                opt.value === value
                  ? "text-white font-semibold [&_svg]:text-white/60 [&_svg]:shrink-0"
                  : "text-white/70",
              ].join(" ")}
              onMouseDown={() => select(opt)}
            >
              {opt.label}
              {opt.value === value && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

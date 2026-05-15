"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./SelectInput.module.css";

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

  /* Close on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* Close on Escape */
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
    <div ref={wrapRef} className={styles.wrap}>
      {/* Trigger */}
      <button
        id={id}
        type="button"
        className={`${styles.trigger} ${hasError ? styles.error : ""} ${open ? styles.triggerOpen : ""}`}
        onClick={toggle}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selected ? styles.triggerValue : styles.triggerPlaceholder}>
          {selected ? selected.label : placeholder}
        </span>
        <svg
          className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
          width="15" height="15" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <ul className={styles.dropdown} role="listbox">
          {options.map((opt) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              className={`${styles.option} ${opt.value === value ? styles.optionSelected : ""}`}
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

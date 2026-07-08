"use client";

import { useMemo } from "react";
import { useAuth } from "../../../../context/AuthContext";

export default function AdminOverview() {
  const { user, userRoles, isAdmin } = useAuth();

  /* Deduplicated role labels for the chip row */
  const roleLabels = useMemo(() => {
    const seen = new Set<string>();
    return userRoles
      .map((ur) => (ur.Role?.RoleType ?? "").trim())
      .filter((label) => {
        if (!label) return false;
        const key = label.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }, [userRoles]);

  return (
    <div className="mx-auto max-w-[880px] px-6 py-8 sm:px-8 sm:py-10 flex flex-col gap-8">

      {/* Page header — top-left aligned, dashboard pattern */}
      <header className="flex flex-col gap-3">
        <p className="text-[0.68rem] font-bold tracking-[0.14em] uppercase text-white/30 flex items-center gap-1.5">
          <span aria-hidden className="w-[5px] h-[5px] rounded-full bg-[#c62828]" />
          Panel · {isAdmin ? "Administración" : "Personal"}
        </p>
        <h1 className="text-[2rem] sm:text-[2.35rem] font-extrabold text-white tracking-[-0.03em] leading-[1.05]">
          Hola{user?.Name ? `, ${user.Name}` : ""}
        </h1>
        <p className="text-[0.95rem] text-white/50 leading-[1.6] max-w-[520px]">
          Este es el centro de gestión de SimpleFit. Desde aquí administrarás la operación diaria del gimnasio.
        </p>

        {/* Active role chips — inline with the header */}
        {roleLabels.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {roleLabels.map((label) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.72rem] font-semibold text-white/75 bg-white/[0.03] border border-white/[0.09]"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                {label}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Content — informational card, no longer the centerpiece */}
      <section className="bg-[#1a2228] border border-white/[0.07] rounded-[14px] p-6 sm:p-8 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-400/80 animate-pulse" />
          <span className="text-[0.68rem] font-bold tracking-[0.14em] uppercase text-amber-400/70">
            En construcción
          </span>
        </div>
        <h2 className="text-[1.05rem] font-bold text-white tracking-[-0.01em]">
          Módulos en camino
        </h2>
        <p className="text-[0.9rem] text-white/55 leading-[1.65] max-w-[560px]">
          Estamos preparando cada módulo administrativo. Los iremos habilitando en el panel lateral izquierdo a medida que estén listos.
        </p>
      </section>

    </div>
  );
}

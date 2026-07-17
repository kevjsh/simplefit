"use client";

import { useState } from "react";
import AdminPermissions from "./AdminPermissions";
import AdminRoles from "./AdminRoles";

type SecurityTab = "roles" | "permissions";

const TABS: { id: SecurityTab; label: string }[] = [
  { id: "roles", label: "Roles" },
  { id: "permissions", label: "Permisos" },
];

export default function AdminSecurity() {
  const [tab, setTab] = useState<SecurityTab>("roles");

  return (
    <div className="w-full px-6 sm:px-8 py-6 sm:py-8 flex flex-col gap-6">
      <nav
        aria-label="Secciones de seguridad"
        className="flex items-center gap-1 border-b border-white/[0.07]"
      >
        {TABS.map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`relative px-4 py-3 text-[0.78rem] font-semibold uppercase tracking-[0.1em] transition-colors ${
                active ? "text-white" : "text-white/40 hover:text-white/70"
              }`}
            >
              {item.label}
              <span
                aria-hidden
                className={`absolute left-4 right-4 bottom-0 h-[2px] rounded-t bg-[#c62828] transition-opacity ${
                  active ? "opacity-100" : "opacity-0"
                }`}
              />
            </button>
          );
        })}
      </nav>

      {tab === "roles" ? <AdminRoles /> : <AdminPermissions />}
    </div>
  );
}

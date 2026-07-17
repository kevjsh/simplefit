"use client";

import { useMemo, useState } from "react";
import {
  Permission,
  Role,
  RolePermission,
} from "../../../../../services/permissions.service";
import ManageRolePermissionsModal from "./ManageRolePermissionsModal";

type Props = {
  roles: Role[];
  rolePermissions: RolePermission[];
  permissions: Permission[];
  refreshing: boolean;
  onRefresh: () => void;
};

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={`text-left px-3 py-3 text-[0.66rem] font-bold tracking-[0.12em] uppercase text-white/30 whitespace-nowrap ${className}`}
    >
      {children}
    </th>
  );
}

function formatPermissions(keys: string[]): string {
  if (keys.length === 0) return "—";
  return keys.map((key) => `"${key}"`).join(", ");
}

export default function RolePermissionsTable({
  roles,
  rolePermissions,
  permissions,
  refreshing,
  onRefresh,
}: Props) {
  const [adminOpen, setAdminOpen] = useState(false);

  const rows = useMemo(() => {
    const map = new Map<string, { role: Role; keys: string[] }>();

    roles.forEach((role) => {
      map.set(role.Id, { role, keys: [] });
    });

    rolePermissions.forEach((rp) => {
      if (!rp.role || !rp.permission) return;
      const existing = map.get(rp.role.Id);
      if (existing) {
        existing.keys.push(rp.permission.PermissionKey);
      } else {
        map.set(rp.role.Id, {
          role: rp.role,
          keys: [rp.permission.PermissionKey],
        });
      }
    });

    map.forEach((entry) => {
      entry.keys.sort((a, b) => a.localeCompare(b));
    });

    return Array.from(map.values());
  }, [roles, rolePermissions]);

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[1rem] font-bold tracking-[-0.01em] text-white">
          Permisos de roles
        </h2>
        <button
          type="button"
          onClick={() => setAdminOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[8px] bg-[#c62828] hover:bg-[#b71c1c] text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-white transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Administrar
        </button>
      </div>

      <div className="bg-[rgba(19,26,32,0.95)] border border-white/[0.065] rounded-xl overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin-dark">
          <table className="w-full border-collapse min-w-[560px]">
            <thead>
              <tr className="border-b border-white/[0.07]">
                <Th className="w-[28%]">Rol</Th>
                <Th>Permisos</Th>
              </tr>
            </thead>
            <tbody>
              {refreshing ? (
                Array.from({ length: Math.max(rows.length, 3) }).map((_, i) => (
                  <tr key={i} className="border-b border-white/[0.045] last:border-0">
                    <td className="px-3 py-3">
                      <div className="h-3 w-24 rounded bg-white/[0.06] animate-pulse" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="h-3 w-[80%] max-w-[320px] rounded bg-white/[0.06] animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-4 py-14 text-center text-[0.9rem] text-white/35">
                    No hay roles registrados todavía.
                  </td>
                </tr>
              ) : (
                rows.map(({ role, keys }) => (
                  <tr
                    key={role.Id}
                    className="group border-b border-white/[0.045] last:border-0 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="relative px-3 py-3.5">
                      <span
                        aria-hidden
                        className="absolute left-0 top-2 bottom-2 w-[2px] rounded-r bg-[#c62828] opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                      <p className="text-[0.85rem] font-semibold text-white">
                        {role.Description || role.RoleType}
                      </p>
                      <p className="mt-0.5 text-[0.72rem] uppercase tracking-[0.08em] text-white/35">
                        {role.RoleType}
                      </p>
                    </td>
                    <td className="px-3 py-3.5 text-[0.82rem] text-white/60 leading-[1.5]">
                      {formatPermissions(keys)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ManageRolePermissionsModal
        open={adminOpen}
        roles={roles}
        permissions={permissions}
        onClose={() => setAdminOpen(false)}
        onChanged={onRefresh}
      />
    </section>
  );
}

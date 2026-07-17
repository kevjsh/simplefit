"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Permission,
  Role,
  RolePermission,
  getAllPermissions,
  getAllRolePermissions,
  getAllRoles,
  getErrorMessage,
} from "../../../../../services/permissions.service";
import { useNotifications } from "../../../utils/NotificationSystem";
import PermissionsTable from "./PermissionsTable";
import RolePermissionsTable from "./RolePermissionsTable";

export default function AdminPermissions() {
  const notify = useNotifications();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const loadData = useCallback(async (isRefresh = false) => {
    const requestId = ++requestIdRef.current;
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const [rolesData, rolePermissionsData, permissionsData] = await Promise.all([
        getAllRoles(),
        getAllRolePermissions(),
        getAllPermissions(),
      ]);

      if (requestId !== requestIdRef.current) return;

      setRoles(rolesData);
      setRolePermissions(rolePermissionsData);
      setPermissions(permissionsData);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      const message = getErrorMessage(err, "No se pudo cargar la información de permisos.");
      setError(message);
      if (isRefresh) notify.error(message);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="flex flex-col gap-8">
        {Array.from({ length: 2 }).map((_, section) => (
          <div key={section} className="flex flex-col gap-3">
            <div className="h-5 w-40 rounded bg-white/[0.06] animate-pulse" />
            <div className="bg-[rgba(19,26,32,0.95)] border border-white/[0.065] rounded-xl overflow-hidden">
              {Array.from({ length: 4 }).map((__, row) => (
                <div
                  key={row}
                  className="flex gap-4 px-4 py-3.5 border-b border-white/[0.045] last:border-0"
                >
                  <div className="h-3 w-28 rounded bg-white/[0.06] animate-pulse" />
                  <div className="h-3 flex-1 max-w-[360px] rounded bg-white/[0.06] animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center bg-[rgba(19,26,32,0.95)] border border-white/[0.065] rounded-xl">
        <p className="text-[0.9rem] text-white/55">{error}</p>
        <button
          type="button"
          onClick={() => loadData()}
          className="px-4 py-2 rounded-[8px] border border-white/[0.10] text-[0.78rem] font-semibold uppercase tracking-[0.06em] text-white/70 hover:text-white hover:border-white/[0.22] transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => loadData(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[8px] border border-white/[0.10] text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-white/60 hover:text-white hover:border-white/[0.22] transition-colors disabled:opacity-35"
          aria-label="Actualizar permisos"
        >
          {refreshing ? (
            <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M21 12a9 9 0 1 1-2.6-6.3" />
              <path d="M21 3v6h-6" />
            </svg>
          )}
          Actualizar
        </button>
      </div>

      <RolePermissionsTable
        roles={roles}
        rolePermissions={rolePermissions}
        permissions={permissions}
        refreshing={refreshing}
        onRefresh={() => loadData(true)}
      />
      <PermissionsTable
        permissions={permissions}
        refreshing={refreshing}
        onRefresh={() => loadData(true)}
      />
    </div>
  );
}

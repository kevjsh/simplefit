"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Permission,
  Role,
  RolePermission,
  createRolePermission,
  deleteRolePermission,
  getAllRolePermissions,
  getErrorMessage,
} from "../../../../../services/permissions.service";
import { useNotifications } from "../../../utils/NotificationSystem";
import SecuritySelect from "./SecuritySelect";

type Props = {
  open: boolean;
  roles: Role[];
  permissions: Permission[];
  onClose: () => void;
  onChanged: () => void;
};

export default function ManageRolePermissionsModal({
  open,
  roles,
  permissions,
  onClose,
  onChanged,
}: Props) {
  const notify = useNotifications();
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [assigned, setAssigned] = useState<RolePermission[]>([]);
  const [selectedPermissionId, setSelectedPermissionId] = useState("");
  const [loading, setLoading] = useState(false);

  const availablePermissions = useMemo(() => {
    const assignedIds = new Set(assigned.map((rp) => rp.permission?.Id).filter(Boolean));
    return permissions.filter((p) => !assignedIds.has(p.Id));
  }, [assigned, permissions]);

  useEffect(() => {
    if (!open) {
      setSelectedRoleId("");
      setAssigned([]);
      setSelectedPermissionId("");
      return;
    }
  }, [open]);

  useEffect(() => {
    if (!open || !selectedRoleId) {
      setAssigned([]);
      setSelectedPermissionId("");
      return;
    }

    let cancelled = false;

    async function loadAssigned() {
      setLoading(true);
      try {
        const all = await getAllRolePermissions();
        if (cancelled) return;
        const roleId = selectedRoleId.trim();
        setAssigned(
          all.filter((rp) => rp.role && String(rp.role.Id).trim() === roleId)
        );
      } catch (error) {
        if (!cancelled) {
          notify.error(getErrorMessage(error, "Error al cargar los permisos del rol."));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAssigned();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, selectedRoleId]);

  if (!open) return null;

  async function refreshAssigned(roleId: string) {
    const all = await getAllRolePermissions();
    const filtered = all.filter(
      (rp) => rp.role && String(rp.role.Id).trim() === roleId
    );
    setAssigned(filtered);
  }

  async function handleAdd() {
    if (!selectedRoleId || !selectedPermissionId) {
      notify.error("Selecciona un rol y un permiso.");
      return;
    }

    const roleId = selectedRoleId.trim();
    const permissionId = Number(selectedPermissionId);
    if (!roleId || Number.isNaN(permissionId)) {
      notify.error("Selección inválida.");
      return;
    }

    setLoading(true);
    try {
      await createRolePermission(roleId, permissionId);
      notify.success("Permiso asignado al rol.");
      setSelectedPermissionId("");
      await refreshAssigned(roleId);
      onChanged();
    } catch (error) {
      notify.error(getErrorMessage(error, "Error al asignar el permiso."));
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(roleId: string, permissionId: number) {
    setLoading(true);
    try {
      await deleteRolePermission(roleId.trim(), permissionId);
      notify.success("Permiso eliminado del rol.");
      await refreshAssigned(roleId.trim());
      onChanged();
    } catch (error) {
      notify.error(getErrorMessage(error, "Error al eliminar el permiso del rol."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/70 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="manage-role-permissions-title"
      onClick={() => {
        if (!loading) onClose();
      }}
    >
      <div
        className="w-full max-w-[560px] max-h-[90vh] overflow-y-auto rounded-[10px] border border-white/[0.10] bg-[#151c22] p-5 sm:p-6 scrollbar-thin-dark"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[0.66rem] font-bold tracking-[0.14em] uppercase text-white/30 flex items-center gap-1.5">
              <span aria-hidden className="w-[5px] h-[5px] rounded-full bg-[#c62828]" />
              Roles
            </p>
            <h2
              id="manage-role-permissions-title"
              className="mt-2 text-[1.2rem] font-extrabold tracking-[-0.02em] text-white"
            >
              Administrar permisos de roles
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Cerrar"
            className="w-8 h-8 flex items-center justify-center rounded-[8px] text-white/40 hover:text-white hover:bg-white/[0.05] transition-colors disabled:opacity-40"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-5">
          <SecuritySelect
            label="Seleccionar rol"
            value={selectedRoleId}
            disabled={loading}
            placeholder="Elige un rol…"
            onChange={setSelectedRoleId}
            options={roles.map((role) => ({
              value: String(role.Id),
              label: role.Description || role.RoleType,
            }))}
          />
        </div>

        {selectedRoleId && (
          <div className="mt-6 flex flex-col gap-5">
            <section>
              <h3 className="text-[0.78rem] font-bold uppercase tracking-[0.1em] text-white/45">
                Permisos asignados ({assigned.length})
              </h3>

              {loading && assigned.length === 0 ? (
                <div className="mt-3 flex flex-col gap-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-14 rounded-[8px] bg-white/[0.04] animate-pulse" />
                  ))}
                </div>
              ) : assigned.length === 0 ? (
                <p className="mt-4 py-8 text-center text-[0.85rem] text-white/35">
                  No hay permisos asignados a este rol.
                </p>
              ) : (
                <ul className="mt-3 max-h-[240px] overflow-y-auto flex flex-col gap-2 scrollbar-thin-dark pr-0.5">
                  {assigned.map((rp) => (
                    <li
                      key={`${rp.RoleId}-${rp.PermissionId}`}
                      className="flex items-center justify-between gap-3 rounded-[8px] border border-white/[0.08] bg-white/[0.02] px-3.5 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[0.85rem] font-semibold text-white">
                          {rp.permission?.PermissionKey ?? "—"}
                        </p>
                        {rp.permission?.Description && (
                          <p className="mt-0.5 truncate text-[0.78rem] text-white/45">
                            {rp.permission.Description}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => handleRemove(rp.RoleId, rp.PermissionId)}
                        aria-label="Eliminar permiso del rol"
                        className="shrink-0 w-8 h-8 flex items-center justify-center rounded-[8px] text-[#ef5350] hover:bg-[#c62828]/15 transition-colors disabled:opacity-40"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h3 className="text-[0.78rem] font-bold uppercase tracking-[0.1em] text-white/45 mb-3">
                Agregar permiso
              </h3>
              <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
                <div className="flex-1">
                  <SecuritySelect
                    label="Seleccionar permiso"
                    value={selectedPermissionId}
                    disabled={loading || availablePermissions.length === 0}
                    placeholder={
                      availablePermissions.length === 0
                        ? "No hay permisos disponibles"
                        : "Elige un permiso…"
                    }
                    onChange={setSelectedPermissionId}
                    options={availablePermissions.map((permission) => ({
                      value: String(permission.Id),
                      label: permission.Description
                        ? `${permission.PermissionKey} — ${permission.Description}`
                        : permission.PermissionKey,
                    }))}
                  />
                </div>
                <button
                  type="button"
                  disabled={loading || !selectedPermissionId || availablePermissions.length === 0}
                  onClick={handleAdd}
                  className="h-10 px-4 rounded-[8px] border border-emerald-400/40 bg-emerald-400/[0.12] text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-emerald-200 hover:bg-emerald-400/[0.2] transition-colors disabled:opacity-35 disabled:cursor-not-allowed"
                >
                  Agregar
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

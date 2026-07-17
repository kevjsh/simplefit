"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Permission,
  deletePermission,
  getErrorMessage,
} from "../../../../../services/permissions.service";
import { useNotifications } from "../../../utils/NotificationSystem";
import AddPermissionModal from "./AddPermissionModal";
import ConfirmActionModal from "./ConfirmActionModal";

const PAGE_SIZE = 5;

type Props = {
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

const IconChevronLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);
const IconChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6 6-6" />
  </svg>
);

export default function PermissionsTable({ permissions, refreshing, onRefresh }: Props) {
  const notify = useNotifications();
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const totalPages = Math.max(1, Math.ceil(permissions.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return permissions.slice(start, start + PAGE_SIZE);
  }, [permissions, page]);

  const rangeStart = permissions.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, permissions.length);

  async function confirmDelete() {
    if (deletingId == null) return;
    setDeleteLoading(true);
    try {
      await deletePermission(deletingId);
      notify.success("Permiso eliminado exitosamente.");
      setDeletingId(null);
      onRefresh();
    } catch (error) {
      notify.error(getErrorMessage(error, "Error al eliminar el permiso."));
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[1rem] font-bold tracking-[-0.01em] text-white">Permisos</h2>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[8px] border border-emerald-400/40 bg-emerald-400/[0.12] text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-emerald-200 hover:bg-emerald-400/[0.2] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
            <path d="M12 5v14M5 12h14" />
          </svg>
          Agregar
        </button>
      </div>

      <div className="bg-[rgba(19,26,32,0.95)] border border-white/[0.065] rounded-xl overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin-dark">
          <table className="w-full border-collapse min-w-[560px]">
            <thead>
              <tr className="border-b border-white/[0.07]">
                <Th className="w-[32%]">Llave</Th>
                <Th>Descripción</Th>
                <Th className="w-[88px] text-center">Acciones</Th>
              </tr>
            </thead>
            <tbody>
              {refreshing ? (
                Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <tr key={i} className="border-b border-white/[0.045] last:border-0">
                    <td className="px-3 py-3">
                      <div className="h-3 w-28 rounded bg-white/[0.06] animate-pulse" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="h-3 w-48 rounded bg-white/[0.06] animate-pulse" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="mx-auto h-8 w-8 rounded bg-white/[0.06] animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-14 text-center text-[0.9rem] text-white/35">
                    No hay permisos disponibles.
                  </td>
                </tr>
              ) : (
                paginated.map((permission) => (
                  <tr
                    key={permission.Id}
                    className="group border-b border-white/[0.045] last:border-0 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="relative px-3 py-3.5">
                      <span
                        aria-hidden
                        className="absolute left-0 top-2 bottom-2 w-[2px] rounded-r bg-[#c62828] opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                      <p className="text-[0.85rem] font-semibold text-white font-mono">
                        {permission.PermissionKey}
                      </p>
                    </td>
                    <td className="px-3 py-3.5 text-[0.82rem] text-white/55">
                      {permission.Description || "—"}
                    </td>
                    <td className="px-3 py-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => setDeletingId(permission.Id)}
                        aria-label={`Eliminar permiso ${permission.PermissionKey}`}
                        className="inline-flex w-8 h-8 items-center justify-center rounded-[8px] text-[#ef5350] hover:bg-[#c62828]/15 transition-colors"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {permissions.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-t border-white/[0.07]">
            <p className="text-[0.78rem] text-white/40">
              {refreshing
                ? "Actualizando permisos…"
                : `Mostrando ${rangeStart}–${rangeEnd} de ${permissions.length} permisos`}
            </p>
            {permissions.length > PAGE_SIZE && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1 || refreshing}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-[8px] border border-white/[0.10] text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-white/60 hover:text-white hover:border-white/[0.22] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <IconChevronLeft />
                  Anterior
                </button>
                <span className="text-[0.75rem] text-white/35 px-1 tabular-nums">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages || refreshing}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-[8px] border border-white/[0.10] text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-white/60 hover:text-white hover:border-white/[0.22] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Siguiente
                  <IconChevronRight />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <AddPermissionModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={onRefresh}
      />

      <ConfirmActionModal
        open={deletingId != null}
        title="Confirmar eliminación"
        description="¿Estás seguro de eliminar este permiso? También se eliminarán todas las asignaciones de este permiso a los roles."
        confirmLabel="Eliminar"
        loading={deleteLoading}
        onClose={() => {
          if (!deleteLoading) setDeletingId(null);
        }}
        onConfirm={confirmDelete}
      />
    </section>
  );
}

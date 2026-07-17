"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getErrorMessage } from "../../../../../services/permissions.service";
import {
  Branch,
  UserRoleAssignment,
  getAllBranches,
  getAllUserRoles,
} from "../../../../../services/user.roles.service";
import { PaginationMeta } from "../../../../../services/customers.service";
import { useNotifications } from "../../../utils/NotificationSystem";
import ManageUserRolesModal from "./ManageUserRolesModal";
import SecuritySelect from "./SecuritySelect";

const PAGE_SIZE = 10;

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={`text-left px-3 py-3 text-[0.66rem] font-bold tracking-[0.12em] uppercase text-white/30 whitespace-nowrap ${className}`}
    >
      {children}
    </th>
  );
}

function StatusBadge({ status }: { status: string | null | undefined }) {
  const active = (status ?? "").toUpperCase() === "ACTIVE";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-[0.2rem] rounded-full text-[0.68rem] font-semibold border ${
        active
          ? "text-emerald-300/90 bg-emerald-400/[0.08] border-emerald-400/25"
          : "text-white/55 bg-white/[0.03] border-white/[0.10]"
      }`}
    >
      <span
        aria-hidden
        className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-400" : "bg-white/35"}`}
      />
      {active ? "Activo" : "Inactivo"}
    </span>
  );
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("es-CR", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function customerName(assignment: UserRoleAssignment) {
  const c = assignment.Customer;
  if (!c) return "—";
  return [c.Name, c.FirstLastName, c.SecondLastName].filter(Boolean).join(" ");
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

export default function AdminRoles() {
  const notify = useNotifications();
  const [assignments, setAssignments] = useState<UserRoleAssignment[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [branchFilter, setBranchFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminOpen, setAdminOpen] = useState(false);
  const requestIdRef = useRef(0);

  const loadData = useCallback(async (targetPage: number, branchId: string, isRefresh = false) => {
    const requestId = ++requestIdRef.current;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [rolesResult, branchesData] = await Promise.all([
        getAllUserRoles(targetPage, PAGE_SIZE, branchId || null),
        getAllBranches(),
      ]);

      if (requestId !== requestIdRef.current) return;

      setAssignments(rolesResult.data);
      setPagination(rolesResult.pagination);
      setPage(rolesResult.pagination.currentPage);
      setBranches(branchesData);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      const message = getErrorMessage(err, "No se pudo cargar los roles de usuarios.");
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
    loadData(1, "");
  }, [loadData]);

  function branchName(branchId: string | number | null | undefined) {
    if (branchId == null || branchId === "") return "—";
    return branches.find((b) => String(b.Id) === String(branchId))?.Name ?? String(branchId);
  }

  const totalItems = pagination?.totalItems ?? 0;
  const totalPages = pagination?.totalPages ?? 1;
  const rangeStart = totalItems === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, totalItems);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-[1rem] font-bold tracking-[-0.01em] text-white">
          Roles de usuarios
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadData(page, branchFilter, true)}
            disabled={loading || refreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[8px] border border-white/[0.10] text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-white/60 hover:text-white hover:border-white/[0.22] transition-colors disabled:opacity-35"
            aria-label="Actualizar roles"
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
      </div>

      <section className="bg-[rgba(19,26,32,0.95)] border border-white/[0.065] rounded-xl overflow-hidden">
        <div className="px-4 sm:px-5 py-4 border-b border-white/[0.07] max-w-[320px]">
          <SecuritySelect
            label="Filtrar por gimnasio"
            value={branchFilter}
            options={[
              { value: "", label: "Todos" },
              ...branches.map((branch) => ({
                value: String(branch.Id),
                label: branch.Name,
              })),
            ]}
            onChange={(next) => {
              setBranchFilter(next);
              loadData(1, next);
            }}
            placeholder="Todos"
          />
        </div>

        {error ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <p className="text-[0.9rem] text-white/55">{error}</p>
            <button
              type="button"
              onClick={() => loadData(page, branchFilter)}
              className="px-4 py-2 rounded-[8px] border border-white/[0.10] text-[0.78rem] font-semibold uppercase tracking-[0.06em] text-white/70 hover:text-white hover:border-white/[0.22] transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin-dark">
            <table className="w-full border-collapse min-w-[720px]">
              <thead>
                <tr className="border-b border-white/[0.07]">
                  <Th className="w-[28%]">Usuario</Th>
                  <Th>Rol</Th>
                  <Th>Gimnasio</Th>
                  <Th>Asignado</Th>
                  <Th>Estado</Th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: PAGE_SIZE }).map((_, i) => (
                    <tr key={i} className="border-b border-white/[0.045] last:border-0">
                      <td className="px-3 py-3"><div className="h-3 w-36 rounded bg-white/[0.06] animate-pulse" /></td>
                      <td className="px-3 py-3"><div className="h-3 w-24 rounded bg-white/[0.06] animate-pulse" /></td>
                      <td className="px-3 py-3"><div className="h-3 w-24 rounded bg-white/[0.06] animate-pulse" /></td>
                      <td className="px-3 py-3"><div className="h-3 w-20 rounded bg-white/[0.06] animate-pulse" /></td>
                      <td className="px-3 py-3"><div className="h-3 w-16 rounded bg-white/[0.06] animate-pulse" /></td>
                    </tr>
                  ))
                ) : assignments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-14 text-center text-[0.9rem] text-white/35">
                      No hay roles asignados todavía.
                    </td>
                  </tr>
                ) : (
                  assignments.map((assignment) => (
                    <tr
                      key={assignment.Id}
                      className="group border-b border-white/[0.045] last:border-0 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="relative px-3 py-3.5">
                        <span
                          aria-hidden
                          className="absolute left-0 top-2 bottom-2 w-[2px] rounded-r bg-[#c62828] opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                        <div className="flex items-center gap-3 min-w-0">
                          {assignment.Customer?.ProfilePicture ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={assignment.Customer.ProfilePicture}
                              alt=""
                              className="w-9 h-9 rounded-full object-cover border border-white/[0.09] shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/[0.09] flex items-center justify-center text-[0.7rem] font-bold text-white/45 shrink-0">
                              {(assignment.Customer?.Name?.[0] ?? "?")}
                              {(assignment.Customer?.FirstLastName?.[0] ?? "")}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate text-[0.85rem] font-semibold text-white">
                              {customerName(assignment)}
                            </p>
                            <p className="truncate text-[0.75rem] text-white/40">
                              {assignment.Customer?.Email || "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-[0.85rem] text-white/75">
                        {assignment.Role?.Description || assignment.Role?.RoleType || "—"}
                      </td>
                      <td className="px-3 py-3.5 text-[0.82rem] text-white/55">
                        {branchName(assignment.BranchId)}
                      </td>
                      <td className="px-3 py-3.5 text-[0.82rem] text-white/45">
                        {formatDate(assignment.AssignedAt)}
                      </td>
                      <td className="px-3 py-3.5">
                        <StatusBadge status={assignment.Status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {!error && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-t border-white/[0.07]">
            <p className="text-[0.78rem] text-white/40">
              {loading
                ? "Cargando roles…"
                : totalItems === 0
                  ? "0 asignaciones"
                  : `Mostrando ${rangeStart}–${rangeEnd} de ${totalItems} asignaciones`}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => loadData(page - 1, branchFilter)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-[8px] border border-white/[0.10] text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-white/60 hover:text-white hover:border-white/[0.22] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <IconChevronLeft />
                Anterior
              </button>
              <span className="text-[0.75rem] text-white/35 px-1 tabular-nums">
                {page} / {Math.max(totalPages, 1)}
              </span>
              <button
                type="button"
                disabled={page >= totalPages || loading}
                onClick={() => loadData(page + 1, branchFilter)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-[8px] border border-white/[0.10] text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-white/60 hover:text-white hover:border-white/[0.22] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Siguiente
                <IconChevronRight />
              </button>
            </div>
          </div>
        )}
      </section>

      <ManageUserRolesModal
        open={adminOpen}
        onClose={() => setAdminOpen(false)}
        onChanged={() => loadData(page, branchFilter, true)}
      />
    </div>
  );
}

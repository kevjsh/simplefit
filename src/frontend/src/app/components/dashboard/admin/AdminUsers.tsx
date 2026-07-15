"use client";

import { useCallback, useEffect, useState } from "react";
import { getCustomers, CustomersSortField, SortOrder, PaginationMeta } from "../../../../services/customers.service";
import { CustomerProfile } from "../../../../services/customer.service";

const PAGE_SIZE = 10;

/* ─── Helpers ───────────────────────────────────────────────── */
function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("es-CR", {
    year: "numeric", month: "short", day: "2-digit", timeZone: "UTC",
  });
}

function formatPhone(phone: string | number | null | undefined) {
  if (!phone) return "—";
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length === 8) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return String(phone);
}

function calculateAge(birthday: string | null | undefined): number | null {
  if (!birthday) return null;
  const birth = new Date(birthday);
  if (isNaN(birth.getTime())) return null;

  const today = new Date();
  let age = today.getUTCFullYear() - birth.getUTCFullYear();
  const monthDiff = today.getUTCMonth() - birth.getUTCMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getUTCDate() < birth.getUTCDate())) {
    age--;
  }
  return age;
}

function getInitials(name: string, lastName: string): string {
  const a = name?.trim()?.[0] ?? "";
  const b = lastName?.trim()?.[0] ?? "";
  return `${a}${b}`.toUpperCase() || "?";
}

const GENDER_LABELS: Record<string, string> = {
  M: "Masculino",
  F: "Femenino",
  MASCULINO: "Masculino",
  FEMENINO: "Femenino",
};

function formatGender(gender: string | null | undefined): string {
  if (!gender) return "—";
  return GENDER_LABELS[gender.toUpperCase()] ?? gender;
}

/* ─── Icons ─────────────────────────────────────────────────── */
const IconChevronLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);
const IconChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6" />
  </svg>
);
const IconUsers = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconSort = ({ order }: { order: SortOrder | null }) => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
    {order === "DESC" ? <path d="M6 9l6 6 6-6" /> : <path d="M6 15l6-6 6 6" />}
  </svg>
);

/* ─── Avatar ────────────────────────────────────────────────── */
function Avatar({ customer }: { customer: CustomerProfile }) {
  if (customer.ProfilePicture) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={customer.ProfilePicture}
        alt={`${customer.Name} ${customer.FirstLastName}`}
        className="w-9 h-9 rounded-full object-cover border border-white/[0.09] shrink-0"
      />
    );
  }
  return (
    <div className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/[0.09] flex items-center justify-center text-white/45 text-[0.72rem] font-bold shrink-0">
      {getInitials(customer.Name, customer.FirstLastName)}
    </div>
  );
}

/* ─── Table header cells ────────────────────────────────────── */
function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`text-left px-3 py-3 text-[0.66rem] font-bold tracking-[0.12em] uppercase text-white/30 whitespace-nowrap ${className}`}>
      {children}
    </th>
  );
}

function SortableTh({
  children,
  active,
  order,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  active: boolean;
  order: SortOrder;
  onClick: () => void;
  className?: string;
}) {
  return (
    <th className={`text-left px-3 py-3 whitespace-nowrap ${className}`}>
      <button
        type="button"
        onClick={onClick}
        className={`flex items-center gap-1 text-[0.66rem] font-bold tracking-[0.12em] uppercase transition-colors ${
          active ? "text-white/70" : "text-white/30 hover:text-white/50"
        }`}
      >
        {children}
        <IconSort order={active ? order : null} />
      </button>
    </th>
  );
}

/* ─── Loading skeleton ──────────────────────────────────────── */
function LoadingRows() {
  return (
    <>
      {Array.from({ length: PAGE_SIZE }).map((_, i) => (
        <tr key={i} className="border-b border-white/[0.045] last:border-0">
          <td className="px-3 py-3"><div className="w-9 h-9 rounded-full bg-white/[0.06] animate-pulse" /></td>
          <td className="px-3 py-3"><div className="h-3 w-16 rounded bg-white/[0.06] animate-pulse" /></td>
          <td className="px-3 py-3"><div className="h-3 w-32 rounded bg-white/[0.06] animate-pulse" /></td>
          <td className="px-3 py-3"><div className="h-3 w-16 rounded bg-white/[0.06] animate-pulse" /></td>
          <td className="px-3 py-3"><div className="h-3 w-8 rounded bg-white/[0.06] animate-pulse" /></td>
          <td className="px-3 py-3"><div className="h-3 w-16 rounded bg-white/[0.06] animate-pulse" /></td>
          <td className="px-3 py-3"><div className="h-3 w-16 rounded bg-white/[0.06] animate-pulse" /></td>
          <td className="px-3 py-3"><div className="h-3 w-28 rounded bg-white/[0.06] animate-pulse" /></td>
          <td className="px-3 py-3"><div className="h-3 w-16 rounded bg-white/[0.06] animate-pulse" /></td>
        </tr>
      ))}
    </>
  );
}

/* ─── Main component ───────────────────────────────────────── */
export default function AdminUsers() {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<CustomersSortField>("Name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("ASC");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = useCallback(
    async (targetPage: number, field: CustomersSortField, order: SortOrder) => {
      setLoading(true);
      setError(null);
      try {
        const result = await getCustomers(targetPage, PAGE_SIZE, field, order);
        setCustomers(result.data);
        setPagination(result.pagination);
        setPage(result.pagination.currentPage);
      } catch {
        setError("No se pudo cargar la lista de usuarios. Intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchPage(1, sortBy, sortOrder);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleSort(field: CustomersSortField) {
    const nextOrder: SortOrder = sortBy === field && sortOrder === "ASC" ? "DESC" : "ASC";
    setSortBy(field);
    setSortOrder(nextOrder);
    fetchPage(1, field, nextOrder);
  }

  const totalItems = pagination?.totalItems ?? 0;
  const totalPages = pagination?.totalPages ?? 1;
  const rangeStart = totalItems === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, totalItems);

  const canGoPrev = page > 1 && !loading;
  const canGoNext = page < totalPages && !loading;

  return (
    <div className="w-full px-6 sm:px-8 py-6 flex flex-col gap-5">

      {/* Roster card */}
      <section className="bg-[rgba(19,26,32,0.95)] border border-white/[0.065] rounded-xl overflow-hidden">

        {error ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <p className="text-[0.9rem] text-white/55">{error}</p>
            <button
              type="button"
              onClick={() => fetchPage(page, sortBy, sortOrder)}
              className="px-4 py-2 rounded-[8px] border border-white/[0.10] text-[0.78rem] font-semibold uppercase tracking-[0.06em] text-white/70 hover:text-white hover:border-white/[0.22] transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : !loading && customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center text-white/35">
            <IconUsers />
            <p className="text-[0.9rem]">No hay usuarios registrados todavía.</p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin-dark">
            <table className="w-full border-collapse table-fixed">
              <colgroup>
                <col className="w-[64px]" />
                <col className="w-[11%]" />
                <col className="w-[20%]" />
                <col className="w-[11%]" />
                <col className="w-[7%]" />
                <col className="w-[10%]" />
                <col className="w-[11%]" />
                <col className="w-[18%]" />
                <col className="w-[10%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-white/[0.07]">
                  <Th>Foto</Th>
                  <Th>Cédula</Th>
                  <SortableTh active={sortBy === "Name"} order={sortOrder} onClick={() => toggleSort("Name")}>
                    Nombre
                  </SortableTh>
                  <Th>Nacimiento</Th>
                  <Th>Edad</Th>
                  <Th>Género</Th>
                  <Th>Teléfono</Th>
                  <Th>Correo</Th>
                  <SortableTh active={sortBy === "RegistrationDate"} order={sortOrder} onClick={() => toggleSort("RegistrationDate")}>
                    Registro
                  </SortableTh>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <LoadingRows />
                ) : (
                  customers.map((customer) => {
                    const age = calculateAge(customer.Birthday);
                    return (
                      <tr
                        key={customer.Id}
                        className="group relative border-b border-white/[0.045] last:border-0 hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="relative px-3 py-3">
                          <span
                            aria-hidden
                            className="absolute left-0 top-2 bottom-2 w-[2px] rounded-r bg-[#c62828] opacity-0 group-hover:opacity-100 transition-opacity"
                          />
                          <Avatar customer={customer} />
                        </td>
                        <td className="px-3 py-3 text-[0.82rem] text-white/70 font-mono tabular-nums truncate">
                          {customer.NID}
                        </td>
                        <td className="px-3 py-3 text-[0.85rem] font-semibold text-white truncate">
                          {customer.Name} {customer.FirstLastName} {customer.SecondLastName}
                        </td>
                        <td className="px-3 py-3 text-[0.82rem] text-white/55 truncate">
                          {formatDate(customer.Birthday)}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          {age !== null ? (
                            <span className="whitespace-nowrap">
                              <span className="text-[0.9rem] font-extrabold text-white tracking-[-0.02em]">{age}</span>
                              <span className="text-[0.66rem] text-white/35 ml-1">años</span>
                            </span>
                          ) : (
                            <span className="text-white/35">—</span>
                          )}
                        </td>
                        <td className="px-3 py-3 truncate">
                          <span className="inline-flex items-center px-2.5 py-[0.2rem] rounded-full text-[0.68rem] font-semibold text-white/70 bg-white/[0.03] border border-white/[0.09]">
                            {formatGender(customer.Gender)}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-[0.82rem] text-white/60 font-mono tabular-nums truncate">
                          {formatPhone(customer.FirstTelephone)}
                        </td>
                        <td className="px-3 py-3 text-[0.82rem] text-white/55 truncate">
                          {customer.Email}
                        </td>
                        <td className="px-3 py-3 text-[0.82rem] text-white/45 truncate">
                          {formatDate(customer.RegistrationDate)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination footer */}
        {!error && (customers.length > 0 || loading) && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-t border-white/[0.07]">
            <p className="text-[0.78rem] text-white/40">
              {loading
                ? "Cargando usuarios…"
                : `Mostrando ${rangeStart}–${rangeEnd} de ${totalItems} usuarios`}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => canGoPrev && fetchPage(page - 1, sortBy, sortOrder)}
                disabled={!canGoPrev}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-[8px] border border-white/[0.10] text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-white/60 hover:text-white hover:border-white/[0.22] transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-white/60 disabled:hover:border-white/[0.10]"
              >
                <IconChevronLeft />
                Anterior
              </button>
              <span className="text-[0.75rem] text-white/35 px-1 tabular-nums">
                {page} / {Math.max(totalPages, 1)}
              </span>
              <button
                type="button"
                onClick={() => canGoNext && fetchPage(page + 1, sortBy, sortOrder)}
                disabled={!canGoNext}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-[8px] border border-white/[0.10] text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-white/60 hover:text-white hover:border-white/[0.22] transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-white/60 disabled:hover:border-white/[0.10]"
              >
                Siguiente
                <IconChevronRight />
              </button>
            </div>
          </div>
        )}
      </section>

    </div>
  );
}

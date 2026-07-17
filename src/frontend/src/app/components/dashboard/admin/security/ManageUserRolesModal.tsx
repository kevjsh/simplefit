"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../../../../context/AuthContext";
import { getCustomerProfile } from "../../../../../services/customer.service";
import { getCustomers } from "../../../../../services/customers.service";
import { getAllRoles, getErrorMessage, Role } from "../../../../../services/permissions.service";
import {
  Branch,
  UserRoleAssignment,
  activateUserRole,
  createUserRole,
  deactivateUserRole,
  deleteUserRole,
  getAllBranches,
  getAllUserRoles,
} from "../../../../../services/user.roles.service";
import { useNotifications } from "../../../utils/NotificationSystem";
import ConfirmActionModal from "./ConfirmActionModal";
import SecuritySelect from "./SecuritySelect";

type CustomerOption = {
  Id: string;
  Name: string;
  FirstLastName: string;
  SecondLastName?: string;
  Email?: string | null;
  ProfilePicture?: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onChanged: () => void;
};

function fullName(c: { Name: string; FirstLastName: string; SecondLastName?: string | null }) {
  return [c.Name, c.FirstLastName, c.SecondLastName].filter(Boolean).join(" ");
}

export default function ManageUserRolesModal({ open, onClose, onChanged }: Props) {
  const notify = useNotifications();
  const { user } = useAuth();

  const [roles, setRoles] = useState<Role[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [assignedById, setAssignedById] = useState<string>("");

  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerOption | null>(null);
  const [customerRoles, setCustomerRoles] = useState<UserRoleAssignment[]>([]);

  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [mutatingId, setMutatingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) {
      setSearch("");
      setCustomers([]);
      setSelectedCustomer(null);
      setCustomerRoles([]);
      setSelectedRoleId("");
      setSelectedBranchId("");
      return;
    }

    let cancelled = false;

    async function bootstrap() {
      try {
        const [rolesData, branchesData] = await Promise.all([getAllRoles(), getAllBranches()]);
        if (cancelled) return;
        setRoles(rolesData);
        setBranches(branchesData);

        if (user?.Email) {
          const profile = await getCustomerProfile(user.Email);
          if (!cancelled) setAssignedById(profile.Id);
        }
      } catch (error) {
        if (!cancelled) {
          notify.error(getErrorMessage(error, "No se pudo preparar el administrador de roles."));
        }
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user?.Email]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const branchOptions = useMemo(
    () => [
      { value: "", label: "Sin gimnasio" },
      ...branches.map((b) => ({ value: String(b.Id), label: b.Name })),
    ],
    [branches]
  );

  const roleOptions = useMemo(
    () =>
      roles.map((role) => ({
        value: String(role.Id),
        label: role.Description || role.RoleType,
      })),
    [roles]
  );

  function handleSearchChange(value: string) {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const q = value.trim();
      if (!q) {
        setCustomers([]);
        return;
      }
      setSearching(true);
      try {
        const result = await getCustomers(1, 8, "Name", "ASC", q);
        setCustomers(
          result.data.map((c) => ({
            Id: c.Id,
            Name: c.Name,
            FirstLastName: c.FirstLastName,
            SecondLastName: c.SecondLastName,
            Email: c.Email,
            ProfilePicture: c.ProfilePicture,
          }))
        );
      } catch (error) {
        notify.error(getErrorMessage(error, "Error buscando usuarios."));
      } finally {
        setSearching(false);
      }
    }, 300);
  }

  async function selectCustomer(customer: CustomerOption) {
    setSelectedCustomer(customer);
    setSearch("");
    setCustomers([]);
    setSelectedRoleId("");
    setSelectedBranchId("");
    try {
      const result = await getAllUserRoles(1, 50, null, customer.Id);
      setCustomerRoles(result.data);
    } catch (error) {
      notify.error(getErrorMessage(error, "No se pudieron cargar los roles del usuario."));
      setCustomerRoles([]);
    }
  }

  async function handleAssign() {
    if (!selectedCustomer || !selectedRoleId || !assignedById) {
      notify.error("Selecciona un usuario y un rol.");
      return;
    }

    const duplicate = customerRoles.some(
      (ur) =>
        ur.RoleId === selectedRoleId &&
        String(ur.BranchId ?? "") === String(selectedBranchId || "")
    );
    if (duplicate) {
      notify.error("El usuario ya tiene este rol en ese gimnasio.");
      return;
    }

    setAssigning(true);
    try {
      const created = await createUserRole({
        CustomerId: selectedCustomer.Id,
        RoleId: selectedRoleId,
        BranchId: selectedBranchId || null,
        AssignedBy: assignedById,
        Status: "ACTIVE",
      });
      setCustomerRoles((prev) => [created, ...prev]);
      setSelectedRoleId("");
      setSelectedBranchId("");
      notify.success("Rol asignado correctamente.");
      onChanged();
    } catch (error) {
      notify.error(getErrorMessage(error, "Error al asignar el rol."));
    } finally {
      setAssigning(false);
    }
  }

  async function toggleStatus(assignment: UserRoleAssignment) {
    const active = (assignment.Status ?? "").toUpperCase() === "ACTIVE";
    setMutatingId(assignment.Id);
    try {
      const updated = active
        ? await deactivateUserRole(assignment.Id)
        : await activateUserRole(assignment.Id);
      setCustomerRoles((prev) =>
        prev.map((ur) => (ur.Id === assignment.Id ? { ...ur, ...updated } : ur))
      );
      notify.success(active ? "Rol desactivado." : "Rol activado.");
      onChanged();
    } catch (error) {
      notify.error(getErrorMessage(error, "No se pudo actualizar el estado del rol."));
    } finally {
      setMutatingId(null);
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await deleteUserRole(deleteId);
      setCustomerRoles((prev) => prev.filter((ur) => ur.Id !== deleteId));
      setDeleteId(null);
      notify.success("Rol eliminado.");
      onChanged();
    } catch (error) {
      notify.error(getErrorMessage(error, "No se pudo eliminar el rol."));
    } finally {
      setDeleteLoading(false);
    }
  }

  function branchLabel(branchId: string | number | null | undefined) {
    if (branchId == null || branchId === "") return "—";
    const found = branches.find((b) => String(b.Id) === String(branchId));
    return found?.Name ?? String(branchId);
  }

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/70 backdrop-blur-[2px]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="manage-user-roles-title"
        onClick={() => {
          if (!assigning && !mutatingId && !deleteLoading) onClose();
        }}
      >
        <div
          className="w-full max-w-[640px] max-h-[90vh] overflow-y-auto rounded-[10px] border border-white/[0.10] bg-[#151c22] p-5 sm:p-6 scrollbar-thin-dark"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[0.66rem] font-bold tracking-[0.14em] uppercase text-white/30 flex items-center gap-1.5">
                <span aria-hidden className="w-[5px] h-[5px] rounded-full bg-[#c62828]" />
                Roles
              </p>
              <h2
                id="manage-user-roles-title"
                className="mt-2 text-[1.2rem] font-extrabold tracking-[-0.02em] text-white"
              >
                Administrar roles de usuarios
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="w-8 h-8 flex items-center justify-center rounded-[8px] text-white/40 hover:text-white hover:bg-white/[0.05] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {!selectedCustomer ? (
            <div className="mt-5">
              <label className="flex flex-col gap-1.5">
                <span className="text-[0.66rem] font-bold uppercase tracking-[0.12em] text-white/30">
                  Buscar usuario
                </span>
                <input
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Cédula, nombre o correo…"
                  autoFocus
                  className="h-10 px-3 rounded-[8px] bg-black/25 border border-white/[0.10] text-[0.875rem] text-white placeholder:text-white/30 outline-none focus:border-white/[0.22] transition-colors"
                />
              </label>

              <div className="mt-3 max-h-64 overflow-y-auto rounded-[8px] border border-white/[0.08] scrollbar-thin-dark">
                {searching ? (
                  <p className="px-3 py-4 text-[0.82rem] text-white/40">Buscando…</p>
                ) : customers.length === 0 ? (
                  <p className="px-3 py-4 text-[0.82rem] text-white/35">
                    {search.trim() ? "Sin resultados." : "Escribe para buscar un usuario."}
                  </p>
                ) : (
                  <ul>
                    {customers.map((customer) => (
                      <li key={customer.Id}>
                        <button
                          type="button"
                          onClick={() => selectCustomer(customer)}
                          className="w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-white/[0.04] transition-colors border-b border-white/[0.045] last:border-0"
                        >
                          {customer.ProfilePicture ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={customer.ProfilePicture}
                              alt=""
                              className="w-9 h-9 rounded-full object-cover border border-white/[0.09]"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/[0.09] flex items-center justify-center text-[0.7rem] font-bold text-white/45">
                              {(customer.Name?.[0] ?? "?")}
                              {(customer.FirstLastName?.[0] ?? "")}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate text-[0.85rem] font-semibold text-white">
                              {fullName(customer)}
                            </p>
                            <p className="truncate text-[0.75rem] text-white/40">
                              {customer.Email || "Sin correo"}
                            </p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-5 flex flex-col gap-5">
              <div className="flex items-center justify-between gap-3 rounded-[8px] border border-white/[0.08] bg-white/[0.02] px-3.5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-[0.9rem] font-semibold text-white">
                    {fullName(selectedCustomer)}
                  </p>
                  <p className="truncate text-[0.75rem] text-white/40">
                    {selectedCustomer.Email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCustomer(null);
                    setCustomerRoles([]);
                  }}
                  className="shrink-0 px-3 py-1.5 rounded-[8px] border border-white/[0.10] text-[0.7rem] font-semibold uppercase tracking-[0.06em] text-white/55 hover:text-white hover:border-white/[0.22] transition-colors"
                >
                  Cambiar
                </button>
              </div>

              <section>
                <h3 className="text-[0.78rem] font-bold uppercase tracking-[0.1em] text-white/45 mb-3">
                  Roles asignados ({customerRoles.length})
                </h3>
                {customerRoles.length === 0 ? (
                  <p className="py-6 text-center text-[0.85rem] text-white/35">
                    Este usuario no tiene roles asignados.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-2 max-h-[220px] overflow-y-auto scrollbar-thin-dark">
                    {customerRoles.map((assignment) => {
                      const active = (assignment.Status ?? "").toUpperCase() === "ACTIVE";
                      const busy = mutatingId === assignment.Id;
                      return (
                        <li
                          key={assignment.Id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-[8px] border border-white/[0.08] bg-white/[0.02] px-3.5 py-3"
                        >
                          <div className="min-w-0">
                            <p className="text-[0.85rem] font-semibold text-white">
                              {assignment.Role?.Description || assignment.Role?.RoleType || "—"}
                            </p>
                            <p className="mt-0.5 text-[0.75rem] text-white/40">
                              {branchLabel(assignment.BranchId)} ·{" "}
                              <span className={active ? "text-emerald-300/90" : "text-white/45"}>
                                {active ? "Activo" : "Inactivo"}
                              </span>
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => toggleStatus(assignment)}
                              className="px-3 py-1.5 rounded-[8px] border border-white/[0.10] text-[0.68rem] font-semibold uppercase tracking-[0.06em] text-white/60 hover:text-white hover:border-white/[0.22] transition-colors disabled:opacity-40"
                            >
                              {busy ? "…" : active ? "Desactivar" : "Activar"}
                            </button>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => setDeleteId(assignment.Id)}
                              aria-label="Eliminar rol"
                              className="w-8 h-8 flex items-center justify-center rounded-[8px] text-[#ef5350] hover:bg-[#c62828]/15 transition-colors disabled:opacity-40"
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                              </svg>
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>

              <section className="flex flex-col gap-3">
                <h3 className="text-[0.78rem] font-bold uppercase tracking-[0.1em] text-white/45">
                  Asignar rol
                </h3>
                <SecuritySelect
                  label="Rol"
                  value={selectedRoleId}
                  options={roleOptions}
                  onChange={setSelectedRoleId}
                  disabled={assigning}
                  placeholder="Seleccionar rol…"
                />
                <SecuritySelect
                  label="Gimnasio"
                  value={selectedBranchId}
                  options={branchOptions}
                  onChange={setSelectedBranchId}
                  disabled={assigning}
                  placeholder="Opcional…"
                />
                <button
                  type="button"
                  disabled={assigning || !selectedRoleId || !assignedById}
                  onClick={handleAssign}
                  className="mt-1 h-10 rounded-[8px] bg-[#c62828] hover:bg-[#b71c1c] text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-white transition-colors disabled:opacity-45"
                >
                  {assigning ? "Asignando…" : "Asignar rol"}
                </button>
              </section>
            </div>
          )}
        </div>
      </div>

      <ConfirmActionModal
        open={deleteId != null}
        title="Eliminar asignación"
        description="¿Seguro que deseas eliminar este rol del usuario? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        loading={deleteLoading}
        onClose={() => {
          if (!deleteLoading) setDeleteId(null);
        }}
        onConfirm={confirmDelete}
      />
    </>
  );
}

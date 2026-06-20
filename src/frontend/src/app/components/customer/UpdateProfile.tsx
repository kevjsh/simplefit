"use client";

import { useState, useEffect } from "react";
import {
  updateCustomerProfile,
  CustomerProfile,
} from "../../../services/customer.service";
import { useNotifications } from "../utils/NotificationSystem";

/* ─── Icons ─────────────────────────────────────────────────── */
const IconEdit = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const IconClose = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconLock = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const IconSpinner = () => (
  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);

/* ─── Helpers ───────────────────────────────────────────────── */
const inputClass =
  "h-9 px-3 rounded-[7px] bg-white/[0.04] border border-white/[0.1] text-[0.85rem] text-white/80 placeholder:text-white/20 outline-none transition-[border-color] duration-150 focus:border-[#c62828]/50";

interface FormState {
  Name: string;
  FirstLastName: string;
  SecondLastName: string;
  FirstTelephone: string;
  SecondTelephone: string;
  Gender: string;
  Address: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  profile: CustomerProfile;
  onUpdated: (updated: CustomerProfile) => void;
}

export default function UpdateProfileModal({ open, onClose, profile, onUpdated }: Props) {
  const notify = useNotifications();
  const [form, setForm] = useState<FormState>(buildForm(profile));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* Sync form when profile changes or modal opens */
  useEffect(() => {
    if (open) {
      setForm(buildForm(profile));
      setError(null);
    }
  }, [open, profile]);

  /* Close on Escape */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && !saving) handleClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, saving]);

  if (!open) return null;

  function buildForm(p: CustomerProfile): FormState {
    return {
      Name: p.Name ?? "",
      FirstLastName: p.FirstLastName ?? "",
      SecondLastName: p.SecondLastName ?? "",
      FirstTelephone: p.FirstTelephone ? String(p.FirstTelephone) : "",
      SecondTelephone: p.SecondTelephone ? String(p.SecondTelephone) : "",
      Gender: p.Gender ?? "",
      Address: p.Address ?? "",
    };
  }

  const set = (field: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleClose = () => {
    if (saving) return;
    onClose();
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      const { customer: updated } = await updateCustomerProfile(profile.Email, {
        Name: form.Name.trim(),
        FirstLastName: form.FirstLastName.trim(),
        SecondLastName: form.SecondLastName.trim(),
        FirstTelephone: form.FirstTelephone,
        SecondTelephone: form.SecondTelephone || null,
        Gender: form.Gender,
        Address: form.Address.trim(),
      });
      onUpdated(updated);
      notify.success("Información actualizada correctamente.");
      onClose();
    } catch {
      setError("No se pudo guardar la información. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px]" onClick={handleClose} />

      {/* Modal card */}
      <div className="relative z-10 w-full max-w-[520px] max-h-[90vh] bg-[#131a20] border border-white/[0.08] rounded-2xl overflow-hidden flex flex-col animate-drop-in">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-[#c62828] opacity-80"><IconEdit /></span>
            <h3 className="text-[0.92rem] font-semibold text-white">Editar información</h3>
          </div>
          <button
            onClick={handleClose}
            disabled={saving}
            className="text-white/35 hover:text-white/70 transition-colors duration-150 disabled:opacity-40"
          >
            <IconClose />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-5 overflow-y-auto">

          {/* Locked: NID */}
          <div className="flex flex-col gap-2">
            <p className="text-[0.67rem] font-semibold text-white/25 uppercase tracking-[0.09em]">Campo bloqueado</p>
            <div className="flex flex-col gap-1 max-w-[180px]">
              <label className="text-[0.68rem] text-white/30 uppercase tracking-[0.07em] font-semibold">Cédula</label>
              <div className="flex items-center gap-2 h-9 px-3 rounded-[7px] bg-white/[0.03] border border-white/[0.05] text-[0.82rem] text-white/30 select-none">
                <span className="text-white/20 shrink-0"><IconLock /></span>
                <span>{profile.NID}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-white/[0.05]" />

          {/* Name fields */}
          <div className="flex flex-col gap-3">
            <p className="text-[0.67rem] font-semibold text-white/25 uppercase tracking-[0.09em]">Nombre</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[0.72rem] text-white/45 font-medium">Nombre</label>
                <input
                  type="text"
                  value={form.Name}
                  onChange={(e) => set("Name", e.target.value)}
                  placeholder="Nombre"
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[0.72rem] text-white/45 font-medium">Primer apellido</label>
                <input
                  type="text"
                  value={form.FirstLastName}
                  onChange={(e) => set("FirstLastName", e.target.value)}
                  placeholder="Apellido 1"
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[0.72rem] text-white/45 font-medium">Segundo apellido</label>
                <input
                  type="text"
                  value={form.SecondLastName}
                  onChange={(e) => set("SecondLastName", e.target.value)}
                  placeholder="Apellido 2"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-white/[0.05]" />

          {/* Contact fields */}
          <div className="flex flex-col gap-3">
            <p className="text-[0.67rem] font-semibold text-white/25 uppercase tracking-[0.09em]">Contacto</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[0.72rem] text-white/45 font-medium">Tel. principal</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={20}
                  value={form.FirstTelephone}
                  onChange={(e) => set("FirstTelephone", e.target.value.replace(/\D/g, ""))}
                  placeholder="Ej. 88001234"
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[0.72rem] text-white/45 font-medium">Tel. secundario</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={20}
                  value={form.SecondTelephone}
                  onChange={(e) => set("SecondTelephone", e.target.value.replace(/\D/g, ""))}
                  placeholder="Opcional"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[0.72rem] text-white/45 font-medium">Género</label>
              <select
                value={form.Gender}
                onChange={(e) => set("Gender", e.target.value)}
                className="h-9 px-3 rounded-[7px] bg-[#131a20] border border-white/[0.1] text-[0.85rem] text-white/80 outline-none transition-[border-color] duration-150 focus:border-[#c62828]/50 cursor-pointer appearance-none"
              >
                <option value="">Seleccionar…</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
                <option value="Prefiero no indicarlo">Prefiero no indicarlo</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[0.72rem] text-white/45 font-medium">Dirección</label>
              <textarea
                value={form.Address}
                onChange={(e) => set("Address", e.target.value)}
                placeholder="Ej. San José, Escazú, 200m norte del parque"
                rows={2}
                className="px-3 py-2 rounded-[7px] bg-white/[0.04] border border-white/[0.1] text-[0.85rem] text-white/80 placeholder:text-white/20 outline-none transition-[border-color] duration-150 focus:border-[#c62828]/50 resize-none"
              />
            </div>
          </div>

          {error && (
            <p className="text-[0.78rem] text-[#ef5350] text-center -mt-1">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-white/[0.06] shrink-0">
          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="flex-1 h-10 rounded-[8px] border border-white/[0.12] text-white/50 text-[0.82rem] font-medium bg-transparent cursor-pointer transition-[border-color,color] duration-150 hover:border-white/25 hover:text-white/75 disabled:opacity-40"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 h-10 rounded-[8px] bg-[#c62828] text-white text-[0.82rem] font-semibold cursor-pointer transition-[background,opacity] duration-150 hover:bg-[#b71c1c] disabled:opacity-35 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
          >
            {saving ? <><IconSpinner /> Guardando...</> : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}

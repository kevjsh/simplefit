"use client";

import { useState } from "react";
import { createPermission, getErrorMessage } from "../../../../../services/permissions.service";
import { useNotifications } from "../../../utils/NotificationSystem";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

export default function AddPermissionModal({ open, onClose, onCreated }: Props) {
  const notify = useNotifications();
  const [permissionKey, setPermissionKey] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  function handleClose() {
    if (saving) return;
    setPermissionKey("");
    setDescription("");
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const key = permissionKey.trim();
    if (!key) {
      notify.error("La llave del permiso es requerida.");
      return;
    }

    setSaving(true);
    try {
      await createPermission(key, description.trim() || undefined);
      notify.success("Permiso creado exitosamente.");
      setPermissionKey("");
      setDescription("");
      onCreated();
      onClose();
    } catch (error) {
      notify.error(getErrorMessage(error, "Error al crear el permiso."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/70 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-permission-title"
      onClick={handleClose}
    >
      <form
        className="w-full max-w-[440px] rounded-[10px] border border-white/[0.10] bg-[#151c22] p-5 sm:p-6"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[0.66rem] font-bold tracking-[0.14em] uppercase text-white/30 flex items-center gap-1.5">
              <span aria-hidden className="w-[5px] h-[5px] rounded-full bg-[#c62828]" />
              Permisos
            </p>
            <h2
              id="add-permission-title"
              className="mt-2 text-[1.2rem] font-extrabold tracking-[-0.02em] text-white"
            >
              Agregar permiso
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            aria-label="Cerrar"
            className="w-8 h-8 flex items-center justify-center rounded-[8px] text-white/40 hover:text-white hover:bg-white/[0.05] transition-colors disabled:opacity-40"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-[0.66rem] font-bold uppercase tracking-[0.12em] text-white/30">
              Llave
            </span>
            <input
              value={permissionKey}
              onChange={(e) => setPermissionKey(e.target.value)}
              disabled={saving}
              placeholder="Ej: permissions.read"
              autoFocus
              className="h-10 px-3 rounded-[8px] bg-black/25 border border-white/[0.10] text-[0.875rem] text-white placeholder:text-white/30 outline-none focus:border-white/[0.22] transition-colors disabled:opacity-50"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[0.66rem] font-bold uppercase tracking-[0.12em] text-white/30">
              Descripción
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={saving}
              rows={4}
              placeholder="Describe el permiso…"
              className="px-3 py-2.5 rounded-[8px] bg-black/25 border border-white/[0.10] text-[0.875rem] text-white placeholder:text-white/30 outline-none focus:border-white/[0.22] transition-colors resize-none disabled:opacity-50"
            />
          </label>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-[8px] bg-[#c62828] hover:bg-[#b71c1c] text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-white transition-colors disabled:opacity-50"
          >
            {saving ? "Agregando…" : "Agregar permiso"}
          </button>
        </div>
      </form>
    </div>
  );
}

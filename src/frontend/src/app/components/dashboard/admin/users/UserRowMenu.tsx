"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { CustomerProfile } from "../../../../../services/customer.service";
import {
  CustomerStatus,
  updateCustomerDetails,
  updateCustomerStatus,
} from "../../../../../services/customers.service";

export interface UserRowMenuAnchor {
  x: number;
  y: number;
}

interface UserRowMenuProps {
  customer: CustomerProfile;
  anchor: UserRowMenuAnchor;
  onClose: () => void;
  onStatusChanged: (customerId: string, status: CustomerStatus) => void;
  onDetailsChanged: (customerId: string, details: string | null) => void;
}

function isActiveStatus(status: string | null | undefined): boolean {
  return (status ?? "").toUpperCase() === "ACTIVE";
}

function getInitials(name: string, lastName: string): string {
  const a = name?.trim()?.[0] ?? "";
  const b = lastName?.trim()?.[0] ?? "";
  return `${a}${b}`.toUpperCase() || "?";
}

function positionMenu(el: HTMLElement, anchor: UserRowMenuAnchor) {
  const rect = el.getBoundingClientRect();
  const pad = 12;
  let left = anchor.x;
  let top = anchor.y;

  if (left + rect.width > window.innerWidth - pad) {
    left = Math.max(pad, window.innerWidth - rect.width - pad);
  }
  if (top + rect.height > window.innerHeight - pad) {
    top = Math.max(pad, window.innerHeight - rect.height - pad);
  }

  el.style.left = `${left}px`;
  el.style.top = `${top}px`;
}

const IconClose = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconZoomIn = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);
const IconZoomOut = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

export default function UserRowMenu({
  customer,
  anchor,
  onClose,
  onStatusChanged,
  onDetailsChanged,
}: UserRowMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [details, setDetails] = useState(customer.Details ?? "");
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingDetails, setSavingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailsSaved, setDetailsSaved] = useState(false);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ mx: 0, my: 0, px: 0, py: 0 });

  const active = isActiveStatus(customer.Status);
  const nextStatus: CustomerStatus = active ? "INACTIVE" : "ACTIVE";
  const originalDetails = customer.Details ?? "";
  const detailsDirty = details.trim() !== originalDetails.trim();
  const hasPhoto = !!customer.ProfilePicture;
  const displayName = `${customer.Name} ${customer.FirstLastName}`.trim();

  useEffect(() => {
    setDetails(customer.Details ?? "");
    setDetailsSaved(false);
    setError(null);
  }, [customer.Id, customer.Details]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (lightboxOpen) return;
      if (!menuRef.current?.contains(event.target as Node)) {
        onClose();
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (lightboxOpen) {
        closeLightbox();
        return;
      }
      onClose();
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose, lightboxOpen]);

  useEffect(() => {
    if (!isPanning) return;
    const onMove = (e: MouseEvent) => {
      setPan({
        x: panStart.current.px + (e.clientX - panStart.current.mx),
        y: panStart.current.py + (e.clientY - panStart.current.my),
      });
    };
    const onUp = () => setIsPanning(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isPanning]);

  useLayoutEffect(() => {
    if (menuRef.current) positionMenu(menuRef.current, anchor);
  }, [anchor, details, detailsSaved, error]);

  function openLightbox() {
    if (!hasPhoto) return;
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setLightboxOpen(true);
  }

  function closeLightbox() {
    setLightboxOpen(false);
    setIsPanning(false);
  }

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault();
    setZoom((z) => Math.min(3, Math.max(0.5, z + (e.deltaY < 0 ? 0.25 : -0.25))));
  }

  function handlePanStart(e: React.MouseEvent) {
    if (zoom <= 1) return;
    e.preventDefault();
    panStart.current = { mx: e.clientX, my: e.clientY, px: pan.x, py: pan.y };
    setIsPanning(true);
  }

  async function handleToggleStatus() {
    if (savingStatus || savingDetails) return;
    setSavingStatus(true);
    setError(null);
    try {
      const result = await updateCustomerStatus(customer.Id, nextStatus);
      onStatusChanged(customer.Id, result.status);
      onClose();
    } catch {
      setError("No se pudo actualizar el estado.");
      setSavingStatus(false);
    }
  }

  async function handleSaveDetails() {
    if (savingDetails || savingStatus || !detailsDirty) return;
    setSavingDetails(true);
    setError(null);
    setDetailsSaved(false);
    try {
      const normalized = details.trim() || null;
      const result = await updateCustomerDetails(customer.Id, normalized);
      onDetailsChanged(customer.Id, result.details);
      setDetails(result.details ?? "");
      setDetailsSaved(true);
    } catch {
      setError("No se pudo actualizar la descripción.");
    } finally {
      setSavingDetails(false);
    }
  }

  return (
    <>
      <div
        ref={menuRef}
        role="menu"
        aria-label={`Acciones para ${customer.Name}`}
        className="fixed z-[500] w-[300px] rounded-[10px] border border-white/[0.10] bg-[#151c22] overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.45)]"
        style={{ left: anchor.x, top: anchor.y }}
      >
        {/* Header with photo */}
        <div className="relative px-4 py-4 border-b border-white/[0.07] flex items-center gap-3 pr-10">
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute top-2.5 right-2.5 w-7 h-7 flex items-center justify-center rounded-md text-white/35 hover:text-white/75 hover:bg-white/[0.06] transition-colors"
          >
            <IconClose />
          </button>
          {hasPhoto ? (
            <button
              type="button"
              onClick={openLightbox}
              aria-label="Ver foto en grande"
              className="shrink-0 rounded-full p-0 border-0 bg-transparent cursor-zoom-in"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={customer.ProfilePicture!}
                alt={displayName}
                className="w-12 h-12 rounded-full object-cover border border-white/[0.10]"
              />
            </button>
          ) : (
            <div className="w-12 h-12 rounded-full bg-white/[0.06] border border-white/[0.10] flex items-center justify-center text-white/45 text-[0.85rem] font-bold shrink-0">
              {getInitials(customer.Name, customer.FirstLastName)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-[0.88rem] font-semibold text-white truncate">
              {customer.Name} {customer.FirstLastName}
            </p>
            <p className="text-[0.72rem] text-white/40 truncate mt-0.5">{customer.Email}</p>
            <p className="text-[0.68rem] text-white/30 font-mono tabular-nums mt-0.5 truncate">
              {customer.NID}
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="px-3.5 pt-3.5 pb-2 flex flex-col gap-2 border-b border-white/[0.07]">
          <label htmlFor="user-row-details" className="text-[0.66rem] font-bold tracking-[0.12em] uppercase text-white/30">
            Descripción
          </label>
          <textarea
            id="user-row-details"
            value={details}
            onChange={(e) => {
              setDetails(e.target.value);
              setDetailsSaved(false);
            }}
            rows={3}
            placeholder="Sin descripción…"
            className="w-full resize-none rounded-[8px] bg-black/25 border border-white/[0.10] px-3 py-2 text-[0.82rem] text-white/85 placeholder:text-white/25 outline-none focus:border-white/[0.22] transition-colors leading-[1.45]"
          />
          <button
            type="button"
            disabled={!detailsDirty || savingDetails || savingStatus}
            onClick={handleSaveDetails}
            className="self-end px-3 py-1.5 rounded-[7px] border border-white/[0.10] text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-white/65 hover:text-white hover:border-white/[0.22] transition-colors disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:text-white/65 disabled:hover:border-white/[0.10]"
          >
            {savingDetails ? "Guardando…" : detailsSaved && !detailsDirty ? "Guardado" : "Guardar"}
          </button>
        </div>

        {/* Status action */}
        <div className="p-1.5">
          <button
            type="button"
            role="menuitem"
            disabled={savingStatus || savingDetails}
            onClick={handleToggleStatus}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[8px] text-left text-[0.82rem] font-medium text-white/75 hover:text-white hover:bg-white/[0.04] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span
              aria-hidden
              className={`w-2 h-2 rounded-full shrink-0 ${
                active ? "bg-amber-400/80" : "bg-emerald-400/80"
              }`}
            />
            {savingStatus
              ? "Actualizando…"
              : active
                ? "Marcar como inactivo"
                : "Marcar como activo"}
          </button>
        </div>

        {error && (
          <p className="px-3.5 pb-3 text-[0.72rem] text-[#ef5350]">{error}</p>
        )}
      </div>

      {lightboxOpen && customer.ProfilePicture && (
        <div
          className="fixed inset-0 z-[600] flex items-center justify-center bg-black/90"
          onClick={closeLightbox}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()} onWheel={handleWheel}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={customer.ProfilePicture}
              alt={displayName}
              draggable={false}
              onMouseDown={handlePanStart}
              style={{
                transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                transition: isPanning ? "none" : "transform 0.15s ease",
                cursor: zoom > 1 ? (isPanning ? "grabbing" : "grab") : "default",
                maxHeight: "85vh",
                maxWidth: "90vw",
                borderRadius: "8px",
                display: "block",
                userSelect: "none",
              }}
            />
            <button
              type="button"
              onClick={closeLightbox}
              aria-label="Cerrar"
              className="absolute -top-10 right-0 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors duration-150"
            >
              <IconClose />
            </button>
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/60 rounded-full px-3 py-1.5">
              <button
                type="button"
                onClick={() => { setZoom((z) => Math.max(0.5, z - 0.25)); setPan({ x: 0, y: 0 }); }}
                className="w-7 h-7 flex items-center justify-center text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors duration-150"
              >
                <IconZoomOut />
              </button>
              <span className="text-[0.72rem] text-white/50 w-10 text-center tabular-nums">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
                className="w-7 h-7 flex items-center justify-center text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors duration-150"
              >
                <IconZoomIn />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

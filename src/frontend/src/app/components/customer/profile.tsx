"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";
import Navbar from "../navbar/Navbar";
import Footer from "../footer/Footer";
import ChangePasswordModal from "../auth/security/ChangePasswordModal";
import UpdateProfileModal from "./UpdateProfile";
import {
  getCustomerProfile,
  uploadProfilePicture,
  CustomerProfile,
} from "../../../services/customer.service";

/* ─── Helpers ───────────────────────────────────────────────── */
function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "No disponible";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("es-ES", {
    year: "numeric", month: "long", day: "numeric", timeZone: "UTC",
  });
}

function formatPhone(phone: string | number | null | undefined) {
  if (!phone) return "No especificado";
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length === 8) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return String(phone);
}

const VALID_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
  SUSPENDED: "Suspendido",
};

/* ─── Field row ─────────────────────────────────────────────── */
function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5 sm:gap-6 py-[0.7rem] border-b border-white/[0.045] last:border-0">
      <span className="text-[0.68rem] font-semibold text-white/30 uppercase tracking-[0.08em] shrink-0">{label}</span>
      <span className="text-[0.875rem] text-white/80 sm:text-right">{value}</span>
    </div>
  );
}

/* ─── Section card ──────────────────────────────────────────── */
function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-[rgba(19,26,32,0.95)] border border-white/[0.065] rounded-xl overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-white/[0.045]">
        <span className="text-[#c62828] opacity-80">{icon}</span>
        <h2 className="text-[0.72rem] font-semibold text-white/45 uppercase tracking-[0.09em]">{title}</h2>
      </div>
      <div className="px-5 py-1">{children}</div>
    </div>
  );
}

/* ─── Loading skeleton ──────────────────────────────────────── */
function LoadingSkeleton() {
  return (
    <>
      <div className="bg-[rgba(19,26,32,0.95)] border border-white/[0.065] rounded-xl p-5 sm:p-7 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-7">
          <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-white/[0.08] animate-pulse shrink-0" />
          <div className="flex-1 flex flex-col gap-2">
            <div className="h-5 w-44 rounded bg-white/10 animate-pulse" />
            <div className="h-3 w-32 rounded bg-white/[0.06] animate-pulse" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-[rgba(19,26,32,0.95)] border border-white/[0.065] rounded-xl overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-white/[0.045]">
              <div className="w-3.5 h-3.5 rounded bg-white/[0.08] animate-pulse" />
              <div className="h-2.5 w-24 rounded bg-white/[0.07] animate-pulse" />
            </div>
            <div className="px-5 py-1">
              {[0, 1, 2].map((j) => (
                <div key={j} className="flex justify-between items-center py-[0.7rem] border-b border-white/[0.045] last:border-0">
                  <div className="h-2 w-14 rounded bg-white/[0.07] animate-pulse" />
                  <div className="h-3 w-28 rounded bg-white/[0.05] animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ─── Icons ─────────────────────────────────────────────────── */
const IconPerson = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const IconPhone = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.35 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6.29 6.29l.99-.99a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
const IconShield = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const IconLock = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const IconArrowLeft = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);
const IconCamera = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);
const IconUpload = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
  </svg>
);
const IconTrash = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
  </svg>
);
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
const IconSpinner = () => (
  <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);
const IconEdit = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

/* ─── Main component ────────────────────────────────────────── */
export default function ProfilePage() {
  const { user, updateProfilePicture } = useAuth();

  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* Modals */
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);

  /* Upload modal state */
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [modalDragging, setModalDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const modalDragCount = useRef(0);
  const modalFileRef = useRef<HTMLInputElement>(null);

  /* Lightbox state */
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ mx: 0, my: 0, px: 0, py: 0 });

  /* ── Load profile ────────────────────────────────────────── */
  useEffect(() => {
    if (!user?.Email) return;
    setLoading(true);
    setError(null);
    getCustomerProfile(user.Email)
      .then((data) => {
        setProfile(data);
        updateProfilePicture(data.ProfilePicture ?? null);
      })
      .catch(() => setError("No se pudieron cargar los datos del perfil."))
      .finally(() => setLoading(false));
  }, [user?.Email]);

  /* ── Lightbox keyboard + pan events ─────────────────────── */
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeLightbox(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen]);

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

  /* ── Derived values ──────────────────────────────────────── */
  const displayName = profile
    ? `${profile.Name} ${profile.FirstLastName} ${profile.SecondLastName}`.trim()
    : (user?.Name ?? "—");
  const displayEmail = profile?.Email ?? user?.Email ?? "—";
  const initial = displayName.charAt(0).toUpperCase();
  const statusLabel = STATUS_LABELS[profile?.Status ?? ""] ?? (profile?.Status ?? "—");
  const isActive = profile?.Status === "ACTIVE";
  const hasPhoto = !!profile?.ProfilePicture;

  /* ── Lightbox handlers ───────────────────────────────────── */
  const openLightbox = () => {
    if (!hasPhoto) return;
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.min(3, Math.max(0.5, z + (e.deltaY < 0 ? 0.25 : -0.25))));
  };

  const handlePanStart = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    e.preventDefault();
    panStart.current = { mx: e.clientX, my: e.clientY, px: pan.x, py: pan.y };
    setIsPanning(true);
  };

  /* ── Upload modal handlers ───────────────────────────────── */
  const openUploadModal = () => {
    setPreviewFile(null);
    setPreviewUrl(null);
    setUploadError(null);
    setUploadModalOpen(true);
  };

  const closeUploadModal = () => {
    if (uploading) return;
    setUploadModalOpen(false);
    setPreviewFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setUploadError(null);
    modalDragCount.current = 0;
    setModalDragging(false);
    if (modalFileRef.current) modalFileRef.current.value = "";
  };

  const selectFile = (file: File) => {
    setUploadError(null);
    if (!VALID_TYPES.includes(file.type)) {
      setUploadError("Formato no válido. Usa JPG, PNG, GIF o WEBP.");
      return;
    }
    if (file.size > MAX_SIZE) {
      setUploadError("La imagen no puede superar 5MB.");
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleModalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) selectFile(file);
    e.target.value = "";
  };

  const handleModalDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    modalDragCount.current++;
    if (modalDragCount.current === 1) setModalDragging(true);
  };
  const handleModalDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    modalDragCount.current--;
    if (modalDragCount.current === 0) setModalDragging(false);
  };
  const handleModalDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleModalDrop = (e: React.DragEvent) => {
    e.preventDefault();
    modalDragCount.current = 0;
    setModalDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) selectFile(file);
  };

  const handleConfirmUpload = async () => {
    if (!previewFile || uploading) return;
    setUploading(true);
    setUploadError(null);
    try {
      const { profilePicture } = await uploadProfilePicture(previewFile);
      setProfile((prev) => prev ? { ...prev, ProfilePicture: profilePicture } : prev);
      updateProfilePicture(profilePicture);
      closeUploadModal();
    } catch {
      setUploadError("No se pudo subir la imagen. Intenta de nuevo.");
    } finally {
      setUploading(false);
    }
  };

  /* ─────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen flex flex-col bg-[#0d1317] overflow-y-auto scrollbar-thin-dark">
      <Navbar />

      <div className="flex-1 pt-[72px] pb-14 px-4 sm:px-6">
        <div className="max-w-[880px] mx-auto mt-7">

          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[0.76rem] text-white/30 hover:text-white/60 transition-colors duration-150 mb-5 tracking-wide"
          >
            <IconArrowLeft />
            Volver al panel
          </Link>

          {loading ? <LoadingSkeleton /> : (
            <>
              {/* ── Profile header ────────────────────────────── */}
              <div className="bg-[rgba(19,26,32,0.95)] border border-white/[0.065] rounded-xl p-5 sm:p-7 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-7">

                  {/* Avatar with camera button */}
                  <div className="shrink-0 relative self-start sm:self-auto group">
                    {/* Attention-grabbing red ring — hints the avatar is interactive */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 rounded-full border-2 border-[#c62828] animate-avatar-ring transition-opacity duration-200 group-hover:opacity-0"
                    />
                    <button
                      type="button"
                      onClick={openLightbox}
                      disabled={!hasPhoto}
                      className={`relative block w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-[#c62828] shadow-[0_6px_22px_rgba(198,40,40,0.28)] transition-[transform,border-color,box-shadow] duration-200 ${
                        hasPhoto
                          ? "hover:border-[#ef5350] hover:scale-[1.04] hover:shadow-[0_8px_28px_rgba(198,40,40,0.42)] cursor-zoom-in"
                          : "cursor-default"
                      }`}
                    >
                      {profile?.ProfilePicture ? (
                        <img src={profile.ProfilePicture} alt={displayName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-[rgba(198,40,40,0.12)] flex items-center justify-center text-[#ef9a9a] font-bold text-[1.55rem] sm:text-[1.75rem] select-none">
                          {initial}
                        </div>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={openUploadModal}
                      title="Cambiar foto de perfil"
                      aria-label="Cambiar foto de perfil"
                      className="absolute -bottom-0.5 -right-0.5 w-[24px] h-[24px] sm:w-[28px] sm:h-[28px] rounded-full bg-[#c62828] border-2 border-[#0d1317] flex items-center justify-center text-white cursor-pointer transition-[background,transform] duration-150 hover:bg-[#b71c1c] hover:scale-110 animate-camera-glow"
                    >
                      <IconCamera />
                    </button>
                  </div>

                  {/* Name + email */}
                  <div className="flex-1 min-w-0">
                    <h1 className="text-[1.25rem] sm:text-[1.5rem] font-extrabold text-white tracking-[-0.02em] leading-[1.15] truncate">
                      {displayName}
                    </h1>
                    <p className="text-[0.8rem] text-white/35 mt-0.5 truncate">{displayEmail}</p>
                  </div>

                  {/* Status + edit */}
                  <div className="shrink-0 flex flex-col items-end gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-[0.3rem] rounded text-[0.7rem] font-semibold border ${
                      isActive
                        ? "bg-[rgba(76,175,80,0.08)] border-[rgba(76,175,80,0.2)] text-[#5aac5e]"
                        : "bg-[rgba(239,83,80,0.07)] border-[rgba(239,83,80,0.2)] text-[#ef5350]"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-[#5aac5e]" : "bg-[#ef5350]"}`} />
                      {statusLabel}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditProfileOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-[0.35rem] rounded-[6px] border border-white/[0.12] text-white/45 text-[0.72rem] font-medium bg-transparent cursor-pointer transition-[border-color,color] duration-150 hover:border-white/25 hover:text-white/70"
                    >
                      <IconEdit />
                      Editar datos
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-4 px-4 py-3 rounded-lg bg-[rgba(239,83,80,0.07)] border border-[rgba(239,83,80,0.2)] text-[#ef5350] text-[0.85rem]">
                  {error}
                </div>
              )}

              {/* ── Data cards ──────────────────────────────── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                <SectionCard title="Información personal" icon={<IconPerson />}>
                  <Field label="Cédula" value={profile?.NID ?? "—"} />
                  <Field label="Nacimiento" value={formatDate(profile?.Birthday)} />
                  <Field label="Género" value={profile?.Gender ?? "—"} />
                  {profile?.Details && <Field label="Notas" value={profile.Details} />}
                  <Field label="Fecha de registro" value={formatDate(profile?.RegistrationDate)} />
                  <Field label="Último acceso" value={formatDate(profile?.LastLogin)} />
                </SectionCard>

                <SectionCard title="Contacto" icon={<IconPhone />}>
                  <Field label="Correo" value={displayEmail} />
                  <Field label="Tel. principal" value={formatPhone(profile?.FirstTelephone)} />
                  <Field label="Tel. secundario" value={formatPhone(profile?.SecondTelephone)} />
                  <Field label="Dirección" value={profile?.Address ?? "—"} />
                </SectionCard>

                <SectionCard title="Seguridad" icon={<IconShield />}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6 py-[0.7rem]">
                    <div className="min-w-0">
                      <p className="text-[0.68rem] font-semibold text-white/30 uppercase tracking-[0.08em]">Contraseña</p>
                      <p className="text-[0.8rem] text-white/50 mt-0.5">Actualiza tu contraseña regularmente</p>
                    </div>
                    <button
                      onClick={() => setChangePasswordOpen(true)}
                      className="shrink-0 self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-[0.45rem] rounded-[6px] border border-[rgba(198,40,40,0.35)] text-[#ef5350] text-[0.75rem] font-semibold bg-transparent cursor-pointer transition-[background,border-color] duration-150 hover:bg-[rgba(198,40,40,0.07)] hover:border-[rgba(198,40,40,0.55)]"
                    >
                      <IconLock />
                      Cambiar
                    </button>
                  </div>
                </SectionCard>

              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Change password modal ────────────────────────────── */}
      <ChangePasswordModal
        open={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
        email={displayEmail}
      />

      {/* ── Edit profile modal ───────────────────────────────── */}
      {profile && (
        <UpdateProfileModal
          open={editProfileOpen}
          onClose={() => setEditProfileOpen(false)}
          profile={profile}
          onUpdated={(updated) => setProfile((prev) => prev ? { ...prev, ...updated } : prev)}
        />
      )}

      {/* ── Upload photo modal ───────────────────────────────── */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px]" onClick={closeUploadModal} />
          <div className="relative z-10 w-full max-w-[440px] bg-[#131a20] border border-white/[0.08] rounded-2xl overflow-hidden animate-drop-in">

            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5 text-white/70">
                <IconCamera />
                <h3 className="text-[0.92rem] font-semibold text-white">Cambiar foto de perfil</h3>
              </div>
              <button onClick={closeUploadModal} disabled={uploading} className="text-white/35 hover:text-white/70 transition-colors duration-150 disabled:opacity-40">
                <IconClose />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              {hasPhoto && !previewFile && (
                <div className="flex items-center gap-4 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <img src={profile!.ProfilePicture!} alt="Foto actual" className="w-12 h-12 rounded-full object-cover border border-white/10 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.72rem] text-white/30 uppercase tracking-[0.07em] font-semibold">Foto actual</p>
                    <p className="text-[0.82rem] text-white/55 mt-0.5">Selecciona una nueva imagen para reemplazarla</p>
                  </div>
                </div>
              )}

              {!previewFile ? (
                <div
                  className={`flex flex-col items-center gap-3 py-9 px-5 border-2 border-dashed rounded-xl cursor-pointer transition-[border-color,background] duration-150 ${
                    modalDragging
                      ? "border-[#c62828]/60 bg-[rgba(198,40,40,0.06)]"
                      : "border-white/[0.12] hover:border-white/25 hover:bg-white/[0.02]"
                  }`}
                  onClick={() => modalFileRef.current?.click()}
                  onDragEnter={handleModalDragEnter}
                  onDragLeave={handleModalDragLeave}
                  onDragOver={handleModalDragOver}
                  onDrop={handleModalDrop}
                >
                  <span className={`transition-colors duration-150 ${modalDragging ? "text-[#c62828]/70" : "text-white/20"}`}>
                    <IconUpload />
                  </span>
                  <div className="text-center">
                    <p className="text-[0.85rem] text-white/50">
                      Arrastra una imagen aquí o{" "}
                      <span className="text-white/75 underline underline-offset-2">selecciona un archivo</span>
                    </p>
                    <p className="text-[0.72rem] text-white/25 mt-1">JPG, PNG, GIF, WEBP · máx. 5MB</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-6 py-4">
                  {hasPhoto && (
                    <div className="flex flex-col items-center gap-1.5">
                      <p className="text-[0.68rem] text-white/30 uppercase tracking-[0.07em] font-semibold">Actual</p>
                      <img src={profile!.ProfilePicture!} alt="Actual" className="w-16 h-16 rounded-full object-cover border border-white/10" />
                    </div>
                  )}
                  <div className="flex flex-col items-center gap-1.5">
                    <p className="text-[0.68rem] text-[#5aac5e] uppercase tracking-[0.07em] font-semibold">Nueva</p>
                    <img src={previewUrl!} alt="Nueva" className="w-16 h-16 rounded-full object-cover border border-[#5aac5e]/40" />
                  </div>
                  <div className="flex flex-col gap-1 text-[0.72rem] text-white/30">
                    <span>{previewFile.name}</span>
                    <span>{(previewFile.size / 1024 / 1024).toFixed(2)} MB</span>
                    <button
                      type="button"
                      onClick={() => { setPreviewFile(null); if (previewUrl) URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }}
                      className="inline-flex items-center gap-1 text-[#ef5350]/70 hover:text-[#ef5350] transition-colors duration-150 mt-1"
                    >
                      <IconTrash /> Quitar
                    </button>
                  </div>
                </div>
              )}

              {uploadError && (
                <p className="text-[0.78rem] text-[#ef5350] text-center">{uploadError}</p>
              )}

              <input
                ref={modalFileRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={handleModalFileChange}
              />
            </div>

            <div className="flex gap-3 px-6 pb-6">
              <button type="button" onClick={closeUploadModal} disabled={uploading} className="flex-1 h-10 rounded-[8px] border border-white/[0.12] text-white/50 text-[0.82rem] font-medium bg-transparent cursor-pointer transition-[border-color,color] duration-150 hover:border-white/25 hover:text-white/75 disabled:opacity-40">
                Cancelar
              </button>
              <button type="button" onClick={handleConfirmUpload} disabled={!previewFile || uploading} className="flex-1 h-10 rounded-[8px] bg-[#c62828] text-white text-[0.82rem] font-semibold cursor-pointer transition-[background,opacity] duration-150 hover:bg-[#b71c1c] disabled:opacity-35 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2">
                {uploading ? <><IconSpinner /> Subiendo...</> : "Guardar foto"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Lightbox ─────────────────────────────────────────── */}
      {lightboxOpen && profile?.ProfilePicture && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/90" onClick={closeLightbox}>
          <div className="relative" onClick={(e) => e.stopPropagation()} onWheel={handleWheel}>
            <img
              src={profile.ProfilePicture}
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
            <button onClick={closeLightbox} className="absolute -top-10 right-0 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors duration-150">
              <IconClose />
            </button>
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/60 rounded-full px-3 py-1.5">
              <button onClick={() => { setZoom((z) => Math.max(0.5, z - 0.25)); setPan({ x: 0, y: 0 }); }} className="w-7 h-7 flex items-center justify-center text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors duration-150">
                <IconZoomOut />
              </button>
              <span className="text-[0.72rem] text-white/50 w-10 text-center tabular-nums">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom((z) => Math.min(3, z + 0.25))} className="w-7 h-7 flex items-center justify-center text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors duration-150">
                <IconZoomIn />
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

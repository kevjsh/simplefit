"use client";

type Props = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function ConfirmActionModal({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  loading = false,
  onClose,
  onConfirm,
}: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/70 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-action-title"
      onClick={() => {
        if (!loading) onClose();
      }}
    >
      <div
        className="w-full max-w-[420px] rounded-[10px] border border-white/[0.10] bg-[#151c22] p-5 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="confirm-action-title"
          className="text-[1.15rem] font-extrabold tracking-[-0.02em] text-white"
        >
          {title}
        </h2>
        <p className="mt-2 text-[0.9rem] leading-[1.55] text-white/55">{description}</p>

        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="px-4 py-2.5 rounded-[8px] border border-white/[0.10] text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-white/60 hover:text-white hover:border-white/[0.22] transition-colors disabled:opacity-40"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="px-4 py-2.5 rounded-[8px] bg-[#c62828] hover:bg-[#b71c1c] text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-white transition-colors disabled:opacity-50"
          >
            {loading ? "Procesando…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0f1519] flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-[440px] flex flex-col items-center gap-8 text-center">
        <div className="w-full bg-[rgba(19,26,32,0.95)] border border-white/[0.065] rounded-xl px-6 py-8 sm:px-8 flex flex-col items-center gap-5">
          <p className="text-[0.68rem] font-bold tracking-[0.14em] uppercase text-white/30 flex items-center justify-center gap-1.5">
            <span aria-hidden className="w-[5px] h-[5px] rounded-full bg-[#c62828]" />
            Error 404
          </p>
          <h1 className="text-[1.65rem] sm:text-[1.85rem] font-extrabold text-white tracking-[-0.03em] leading-[1.15]">
            Página no encontrada
          </h1>
          <p className="text-[0.95rem] text-white/50 leading-[1.65]">
            La página que buscas no existe o fue movida. Revisa la dirección o regresa al inicio.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full h-11 rounded-[8px] bg-[#c62828] text-[0.8rem] font-bold uppercase tracking-[0.08em] text-white hover:bg-[#b71c1c] transition-colors"
          >
            Regresar
          </Link>
        </div>
      </div>
    </div>
  );
}

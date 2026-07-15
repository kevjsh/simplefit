"use client";

export default function AdminSecurity() {
  return (
    <div className="mx-auto max-w-[880px] px-6 py-8 sm:px-8 sm:py-10 flex flex-col gap-8">

      {/* Page header — top-left aligned, dashboard pattern */}
      <header className="flex flex-col gap-3">
        <p className="text-[0.68rem] font-bold tracking-[0.14em] uppercase text-white/30 flex items-center gap-1.5">
          <span aria-hidden className="w-[5px] h-[5px] rounded-full bg-[#c62828]" />
          Panel · Administración
        </p>
        <h1 className="text-[2rem] sm:text-[2.35rem] font-extrabold text-white tracking-[-0.03em] leading-[1.05]">
          Administración seguridad
        </h1>
        <p className="text-[0.95rem] text-white/50 leading-[1.6] max-w-[520px]">
          Desde aquí gestionarás los roles y permisos a nivel global de la aplicación.
        </p>
      </header>

    </div>
  );
}

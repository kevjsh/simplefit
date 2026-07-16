"use client";

import Image from "next/image";
import { useAuth } from "../../../context/AuthContext";
import { clearAccountInactiveLock } from "../../../lib/accountStatus";

const WHATSAPP_URL = "https://api.whatsapp.com/send?phone=50688071270";
const SUPPORT_EMAIL = "info@simplefitcr.com";

export default function AccountInactivePage() {
  const { isLoggedIn, logout } = useAuth();

  async function handleLeave() {
    clearAccountInactiveLock();
    if (isLoggedIn) {
      await logout();
      return;
    }
    window.location.replace("/");
  }

  return (
    <div className="min-h-screen bg-[#0f1519] flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-[440px] flex flex-col items-center gap-8 text-center">
        <Image
          src="https://firebasestorage.googleapis.com/v0/b/simplefit-6c181.firebasestorage.app/o/logos%2Fsimplefit.png?alt=media&token=64cccbb6-387b-4399-94d3-77b6c960ad34"
          alt="SimpleFit"
          width={140}
          height={56}
          className="object-contain brightness-0 invert"
          priority
        />

        <div className="w-full bg-[rgba(19,26,32,0.95)] border border-white/[0.065] rounded-xl px-6 py-8 sm:px-8 flex flex-col items-center gap-5">
          <span
            aria-hidden
            className="w-12 h-12 rounded-full bg-[rgba(198,40,40,0.12)] border border-[rgba(198,40,40,0.28)] flex items-center justify-center text-[#ef5350]"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </span>

          <div className="flex flex-col gap-2">
            <p className="text-[0.68rem] font-bold tracking-[0.14em] uppercase text-white/30 flex items-center justify-center gap-1.5">
              <span aria-hidden className="w-[5px] h-[5px] rounded-full bg-[#c62828]" />
              Acceso restringido
            </p>
            <h1 className="text-[1.65rem] sm:text-[1.85rem] font-extrabold text-white tracking-[-0.03em] leading-[1.15]">
              Cuenta inactivada
            </h1>
            <p className="text-[0.95rem] text-white/50 leading-[1.65]">
              Tu cuenta ha sido inactivada. Para revisar tu caso y recuperar el acceso, contacta al equipo de soporte de SimpleFit.
            </p>
          </div>

          <div className="w-full rounded-[10px] border border-white/[0.07] bg-black/20 px-4 py-3.5 flex flex-col gap-2.5 text-left">
            <p className="text-[0.66rem] font-bold tracking-[0.12em] uppercase text-white/30">Soporte</p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[0.9rem] text-white/75 hover:text-white transition-colors"
            >
              WhatsApp:{" "}
              <span className="text-white font-semibold">+506 8807 1270</span>
            </a>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="text-[0.9rem] text-white/75 hover:text-white transition-colors"
            >
              Correo:{" "}
              <span className="text-white font-semibold">{SUPPORT_EMAIL}</span>
            </a>
          </div>

          <button
            type="button"
            onClick={handleLeave}
            className="w-full h-11 rounded-[8px] border border-white/[0.12] text-[0.8rem] font-bold uppercase tracking-[0.08em] text-white/70 hover:text-white hover:border-white/[0.28] transition-colors"
          >
            Regresar
          </button>
        </div>
      </div>
    </div>
  );
}

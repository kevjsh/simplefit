"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoginResponse } from "../../../../services/auth.service";
import { useAuth } from "../../../../context/AuthContext";
import Navbar from "../../navbar/Navbar";
import Footer from "../../footer/Footer";
import ChangePasswordModal from "../../auth/security/ChangePasswordModal";

interface TokenPayload {
  NID: string;
  Name: string;
  Email: string;
  iat: number;
  exp: number;
}

function decodeToken(token: string): TokenPayload | null {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload)) as TokenPayload;
  } catch {
    return null;
  }
}

export default function CustomerDashboard() {
  const router = useRouter();
  const { logout } = useAuth();
  const [payload, setPayload] = useState<TokenPayload | null>(null);
  const [raw, setRaw] = useState<Omit<LoginResponse, "token"> | null>(null);
  const [changePassOpen, setChangePassOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.replace("/");
      return;
    }

    const decoded = decodeToken(token);
    if (!decoded) {
      router.replace("/");
      return;
    }

    const isTempPassword = sessionStorage.getItem("isTempPassword") === "true";

    setPayload(decoded);
    setRaw({ message: "Login success.", isTempPassword });

    if (isTempPassword) {
      setChangePassOpen(true);
    }
  }, [router]);

  if (!payload) return null;

  return (
    <div className="h-screen flex flex-col bg-[#0f1519] overflow-y-auto scrollbar-thin-dark">
    <Navbar />
    <main className="flex-1 flex items-start justify-center pt-7 px-4 pb-7 sm:pt-24 sm:px-5 sm:pb-12">
      <div className="w-full max-w-[560px] flex flex-col gap-7">

        <div className="flex flex-col gap-[0.3rem]">
          <h1 className="text-[1.75rem] font-extrabold text-white tracking-[-0.03em]">Mi cuenta</h1>
          <p className="text-[0.9rem] text-white/40">Bienvenido a SimpleFit</p>
        </div>

        <div className="bg-[#1a2228] border border-white/[0.07] rounded-[14px] p-5 sm:p-7 flex flex-col gap-5">
          <h2 className="text-base font-bold text-white">Datos de sesión</h2>
          <p className="text-[0.8rem] text-white/35 -mt-3">Información devuelta por el servidor al iniciar sesión</p>

          <div className="flex flex-col rounded-lg overflow-hidden border border-white/[0.06]">
            <div className="flex flex-col items-start gap-[0.2rem] sm:flex-row sm:items-center sm:justify-between sm:gap-4 px-4 py-3 bg-[#111820] border-b border-white/[0.05] last:border-b-0">
              <span className="text-[0.8rem] font-semibold text-white/40 whitespace-nowrap">Nombre</span>
              <span className="text-[0.88rem] text-white/85 text-left sm:text-right break-all">{payload.Name}</span>
            </div>
            <div className="flex flex-col items-start gap-[0.2rem] sm:flex-row sm:items-center sm:justify-between sm:gap-4 px-4 py-3 bg-[#111820] border-b border-white/[0.05] last:border-b-0">
              <span className="text-[0.8rem] font-semibold text-white/40 whitespace-nowrap">Correo</span>
              <span className="text-[0.88rem] text-white/85 text-left sm:text-right break-all">{payload.Email}</span>
            </div>
            <div className="flex flex-col items-start gap-[0.2rem] sm:flex-row sm:items-center sm:justify-between sm:gap-4 px-4 py-3 bg-[#111820] border-b border-white/[0.05] last:border-b-0">
              <span className="text-[0.8rem] font-semibold text-white/40 whitespace-nowrap">Identificación</span>
              <span className="text-[0.88rem] text-white/85 text-left sm:text-right break-all">{payload.NID}</span>
            </div>
            <div className="flex flex-col items-start gap-[0.2rem] sm:flex-row sm:items-center sm:justify-between sm:gap-4 px-4 py-3 bg-[#111820] border-b border-white/[0.05] last:border-b-0">
              <span className="text-[0.8rem] font-semibold text-white/40 whitespace-nowrap">Contraseña temporal</span>
              <span className={`text-left sm:text-right break-all text-[0.78rem] font-bold py-[2px] px-2 rounded-full border ${
                raw?.isTempPassword
                  ? "bg-[rgba(251,140,0,0.15)] text-[#fb8c00] border-[rgba(251,140,0,0.3)]"
                  : "bg-[rgba(67,160,71,0.15)] text-[#66bb6a] border-[rgba(67,160,71,0.25)]"
              }`}>
                {raw?.isTempPassword ? "Sí — debe cambiarla" : "No"}
              </span>
            </div>
            <div className="flex flex-col items-start gap-[0.2rem] sm:flex-row sm:items-center sm:justify-between sm:gap-4 px-4 py-3 bg-[#111820] border-b border-white/[0.05] last:border-b-0">
              <span className="text-[0.8rem] font-semibold text-white/40 whitespace-nowrap">Token expira</span>
              <span className="text-[0.88rem] text-white/85 text-left sm:text-right break-all">
                {new Date(payload.exp * 1000).toLocaleString("es-CR")}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          <button
            className="h-10 px-5 bg-transparent border border-white/15 rounded-lg text-white/55 text-[0.85rem] font-semibold cursor-pointer transition-colors duration-150 hover:border-white/30 hover:text-white/85 hover:bg-white/5"
            onClick={() => setChangePassOpen(true)}
          >
            Cambiar contraseña
          </button>
          <button
            className="self-start h-10 px-5 bg-transparent border border-white/15 rounded-lg text-white/50 text-[0.85rem] font-semibold cursor-pointer transition-colors duration-150 hover:border-[rgba(229,57,53,0.5)] hover:text-[#ef5350] hover:bg-[rgba(229,57,53,0.06)]"
            onClick={logout}
          >
            Cerrar sesión
          </button>
        </div>

      </div>
    </main>
    <Footer />

    <ChangePasswordModal
      open={changePassOpen}
      onClose={() => { setChangePassOpen(false); sessionStorage.removeItem("isTempPassword"); setRaw(prev => prev ? { ...prev, isTempPassword: false } : prev); }}
      email={payload?.Email ?? ""}
      isTempPassword={raw?.isTempPassword ?? false}
    />
    </div>
  );
}

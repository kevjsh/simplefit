"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoginResponse } from "../../../../services/auth.service";
import { useAuth } from "../../../../context/AuthContext";
import Navbar from "../../navbar/Navbar";
import Footer from "../../footer/Footer";
import ChangePasswordModal from "../../auth/security/ChangePasswordModal";
import styles from "./CustomerDashboard.module.css";

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
    <div className={styles.page}>
    <Navbar />
    <main className={styles.main}>
      <div className={styles.container}>

        <div className={styles.header}>
          <h1 className={styles.title}>Mi cuenta</h1>
          <p className={styles.subtitle}>Bienvenido a SimpleFit</p>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Datos de sesión</h2>
          <p className={styles.cardHint}>Información devuelta por el servidor al iniciar sesión</p>

          <div className={styles.table}>
            <div className={styles.row}>
              <span className={styles.key}>Nombre</span>
              <span className={styles.value}>{payload.Name}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.key}>Correo</span>
              <span className={styles.value}>{payload.Email}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.key}>Identificación</span>
              <span className={styles.value}>{payload.NID}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.key}>Contraseña temporal</span>
              <span className={`${styles.value} ${raw?.isTempPassword ? styles.badge : styles.badgeOk}`}>
                {raw?.isTempPassword ? "Sí — debe cambiarla" : "No"}
              </span>
            </div>
            <div className={styles.row}>
              <span className={styles.key}>Token expira</span>
              <span className={styles.value}>
                {new Date(payload.exp * 1000).toLocaleString("es-CR")}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.changePassBtn} onClick={() => setChangePassOpen(true)}>
            Cambiar contraseña
          </button>
          <button className={styles.logoutBtn} onClick={logout}>
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

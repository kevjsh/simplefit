"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./Navbar.module.css";
import LoginModal from "../auth/login/LoginModal";
import { useAuth } from "../../../context/AuthContext";

export default function Navbar() {
  const { isLoggedIn, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  const openLogin = () => {
    setMenuOpen(false);
    setLoginOpen(true);
  };

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
  };

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.inner}>
          {/* Brand */}
          <a href="/" className={styles.brand}>
            <Image
              src="https://firebasestorage.googleapis.com/v0/b/simplefit-6c181.firebasestorage.app/o/logos%2Fsimplefit.png?alt=media&token=64cccbb6-387b-4399-94d3-77b6c960ad34"
              alt="SimpleFit logo"
              width={160}
              height={80}
              className={styles.brandLogo}
            />
          </a>

          {/* Desktop links */}
          <ul className={styles.links}>
            {isLoggedIn ? (
              <li>
                <button className={`${styles.linkBtn} ${styles.logoutBtn}`} onClick={handleLogout}>
                  Cerrar sesión
                </button>
              </li>
            ) : (
              <>
                <li><a href="/">Inicio</a></li>
                <li>
                  <button className={styles.linkBtn} onClick={openLogin}>
                    Iniciar sesión
                  </button>
                </li>
                <li><a href="/signup">Regístrese</a></li>
              </>
            )}
          </ul>

          {/* Hamburger */}
          <button
            className={`${styles.hamburger} ${menuOpen ? styles.active : ""}`}
            aria-label="Abrir menú"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        {/* Mobile menu */}
        <div className={`${styles.mobileMenu} ${menuOpen ? styles.menuOpen : ""}`}>
          <ul>
            {isLoggedIn ? (
              <li>
                <button className={`${styles.mobileLinkBtn} ${styles.mobileLogoutBtn}`} onClick={handleLogout}>
                  Cerrar sesión
                </button>
              </li>
            ) : (
              <>
                <li><a href="/" onClick={() => setMenuOpen(false)}>Inicio</a></li>
                <li>
                  <button className={styles.mobileLinkBtn} onClick={openLogin}>
                    Iniciar sesión
                  </button>
                </li>
                <li><a href="/signup" onClick={() => setMenuOpen(false)}>Regístrese</a></li>
              </>
            )}
          </ul>
        </div>
      </nav>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}

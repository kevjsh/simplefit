"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import LoginModal from "../auth/login/LoginModal";
import { useAuth } from "../../../context/AuthContext";

const navLinkClasses =
  "block py-[0.45rem] px-4 text-[0.88rem] font-normal text-[rgba(255,255,255,0.72)] transition-colors duration-150 rounded bg-transparent border-none cursor-pointer font-[inherit] hover:text-white";

const mobileLinkClasses =
  "block w-full text-left py-[0.7rem] px-6 text-[0.95rem] text-[rgba(255,255,255,0.78)] transition-[background-color,color] duration-150 bg-transparent border-none cursor-pointer font-[inherit] hover:bg-[rgba(255,255,255,0.06)] hover:text-white";

const hamburgerSpanClasses =
  "block w-full h-0.5 bg-[rgba(255,255,255,0.8)] rounded-sm transition-[transform,opacity] duration-[250ms] origin-center";

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
      <nav className="fixed top-0 left-0 right-0 z-[200] bg-[rgba(30,39,46,0.96)] backdrop-blur-[8px] border-b border-[rgba(255,255,255,0.08)]">
        <div className="flex items-center h-[72px] px-6 max-w-[1100px] mx-auto justify-center relative sm:justify-start sm:static">
          <Link href="/" className="flex items-center gap-[0.65rem] sm:mr-auto">
            <Image
              src="https://firebasestorage.googleapis.com/v0/b/simplefit-6c181.firebasestorage.app/o/logos%2Fsimplefit.png?alt=media&token=64cccbb6-387b-4399-94d3-77b6c960ad34"
              alt="SimpleFit logo"
              width={160}
              height={64}
              className="object-contain brightness-0 invert"
            />
          </Link>

          <ul className="hidden sm:flex">
            {isLoggedIn ? (
              <li>
                <button
                  className={`${navLinkClasses} !text-[rgba(255,100,100,0.7)] hover:!text-[#ef5350]`}
                  onClick={handleLogout}
                >
                  Cerrar sesión
                </button>
              </li>
            ) : (
              <>
                <li>
                  <a href="/" className={navLinkClasses}>Inicio</a>
                </li>
                <li>
                  <button className={navLinkClasses} onClick={openLogin}>
                    Iniciar sesión
                  </button>
                </li>
                <li>
                  <a href="/signup" className={navLinkClasses}>Regístrese</a>
                </li>
              </>
            )}
          </ul>

          <button
            className="flex sm:hidden flex-col justify-center gap-[5px] w-[34px] h-[34px] bg-transparent border-none cursor-pointer p-1 rounded absolute right-4"
            aria-label="Abrir menú"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span
              className={hamburgerSpanClasses}
              style={menuOpen ? { transform: "translateY(7px) rotate(45deg)" } : undefined}
            />
            <span
              className={hamburgerSpanClasses}
              style={menuOpen ? { opacity: 0, transform: "scaleX(0)" } : undefined}
            />
            <span
              className={hamburgerSpanClasses}
              style={menuOpen ? { transform: "translateY(-7px) rotate(-45deg)" } : undefined}
            />
          </button>
        </div>

        <div
          className={`overflow-hidden transition-[max-height] duration-300 ease-in-out bg-[rgba(30,39,46,0.98)] ${
            menuOpen ? "max-h-[200px]" : "max-h-0"
          }`}
        >
          <ul className="flex flex-col pt-2 pb-4">
            {isLoggedIn ? (
              <li>
                <button
                  className={`${mobileLinkClasses} !text-[rgba(255,100,100,0.7)] hover:!text-[#ef5350] hover:!bg-[rgba(229,57,53,0.06)]`}
                  onClick={handleLogout}
                >
                  Cerrar sesión
                </button>
              </li>
            ) : (
              <>
                <li>
                  <a href="/" className={mobileLinkClasses} onClick={() => setMenuOpen(false)}>
                    Inicio
                  </a>
                </li>
                <li>
                  <button className={mobileLinkClasses} onClick={openLogin}>
                    Iniciar sesión
                  </button>
                </li>
                <li>
                  <a href="/signup" className={mobileLinkClasses} onClick={() => setMenuOpen(false)}>
                    Regístrese
                  </a>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}

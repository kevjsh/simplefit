"use client";

import { useEffect, useRef, useState } from "react";
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
  const { authLoading, isLoggedIn, user, profilePicture, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);

  const userInitial = user?.Name?.charAt(0)?.toUpperCase() ?? "?";

  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const openLogin = () => {
    setMenuOpen(false);
    setLoginOpen(true);
  };

  const handleLogout = () => {
    setMenuOpen(false);
    setDropdownOpen(false);
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
              style={{ width: "auto", height: "auto", maxWidth: 160, maxHeight: 64 }}
            />
          </Link>

          {/* Desktop nav */}
          <ul className="hidden sm:flex items-center gap-1">
            {authLoading ? (
              /* Placeholder keeps layout stable while auth resolves */
              <li className="w-[72px] h-9" />
            ) : isLoggedIn ? (
              <li ref={dropdownRef} className="relative">
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  aria-label="Menú de usuario"
                  aria-expanded={dropdownOpen}
                  className="flex items-center gap-2 py-1 px-2 rounded-lg bg-transparent border-none cursor-pointer transition-colors duration-150 hover:bg-white/[0.06] group"
                >
                  {profilePicture ? (
                    <img src={profilePicture} alt={user?.Name ?? ""} className="w-9 h-9 rounded-full object-cover border border-white/15" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#e53935] to-[#ef9a9a] flex items-center justify-center text-white font-bold text-[0.95rem] shadow-[0_2px_8px_rgba(229,57,53,0.35)] border border-white/10 select-none">
                      {userInitial}
                    </div>
                  )}
                  <svg
                    width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="rgba(255,255,255,0.55)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-[calc(100%+8px)] w-52 bg-[#1a2228] border border-white/[0.09] rounded-[12px] shadow-[0_12px_40px_rgba(0,0,0,0.5)] overflow-hidden animate-drop-in">
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-white/[0.07]">
                      <p className="text-[0.82rem] font-semibold text-white truncate">{user?.Name ?? "Usuario"}</p>
                      <p className="text-[0.75rem] text-white/45 truncate mt-0.5">{user?.Email ?? ""}</p>
                    </div>

                    <div className="py-1.5">
                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-[0.6rem] text-[0.875rem] text-white/80 transition-[background,color] duration-150 hover:bg-white/[0.05] hover:text-white"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                        </svg>
                        Mi perfil
                      </Link>

                      <div className="mx-3 my-1 border-t border-white/[0.07]" />

                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-[0.6rem] text-[0.875rem] text-[rgba(255,100,100,0.75)] bg-transparent border-none cursor-pointer transition-[background,color] duration-150 hover:bg-[rgba(229,57,53,0.06)] hover:text-[#ef5350] font-[inherit] text-left"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
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
          {/* Mobile hamburger */}
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

        {/* Mobile menu */}
        <div
          className={`overflow-hidden transition-[max-height] duration-300 ease-in-out bg-[rgba(30,39,46,0.98)] ${
            menuOpen ? "max-h-[280px]" : "max-h-0"
          }`}
        >
          <ul className="flex flex-col pt-2 pb-4">
            {authLoading ? null : isLoggedIn ? (
              <>
                {/* User info in mobile menu */}
                <li className="px-6 py-3 flex items-center gap-3 border-b border-white/[0.07] mb-1">
                  {profilePicture ? (
                    <img src={profilePicture} alt={user?.Name ?? ""} className="w-9 h-9 rounded-full object-cover border border-white/15 shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#e53935] to-[#ef9a9a] flex items-center justify-center text-white font-bold text-[0.95rem] shadow-[0_2px_8px_rgba(229,57,53,0.3)] shrink-0">
                      {userInitial}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-[0.88rem] font-semibold text-white truncate">{user?.Name ?? "Usuario"}</p>
                    <p className="text-[0.75rem] text-white/45 truncate">{user?.Email ?? ""}</p>
                  </div>
                </li>
                <li>
                  <Link
                    href="/profile"
                    className={mobileLinkClasses}
                    onClick={() => setMenuOpen(false)}
                  >
                    Mi perfil
                  </Link>
                </li>
                <li>
                  <button
                    className={`${mobileLinkClasses} !text-[rgba(255,100,100,0.7)] hover:!text-[#ef5350] hover:!bg-[rgba(229,57,53,0.06)]`}
                    onClick={handleLogout}
                  >
                    Cerrar sesión
                  </button>
                </li>
              </>
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

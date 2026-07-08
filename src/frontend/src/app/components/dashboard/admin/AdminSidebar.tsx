"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";

interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  /* When true, the item is only marked active on an exact path match.
     Useful for root routes (/dashboard/admin) that would otherwise match
     every nested child. */
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    key: "overview",
    label: "Inicio",
    href: "/dashboard/admin",
    exact: true,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12l9-9 9 9" />
        <path d="M5 10v10h14V10" />
      </svg>
    ),
  },
  /* Future modules go here (clientes, membresías, planes, reportes, ...) */
];

interface AdminSidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export default function AdminSidebar({ className = "", onNavigate }: AdminSidebarProps) {
  const pathname = usePathname() ?? "";
  const { isAdmin } = useAuth();

  const isActive = (item: NavItem) =>
    item.exact
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(item.href + "/");

  return (
    <aside
      className={`w-[240px] h-full shrink-0 flex flex-col bg-[#0f1519] border-r border-white/[0.06] ${className}`}
    >
      {/* Header — 24/24/16 (8-base) */}
      <div className="px-6 pt-6 pb-4 border-b border-white/[0.06]">
        <p className="text-[0.68rem] font-bold tracking-[0.14em] uppercase text-white/30 mb-2 flex items-center gap-1.5">
          <span aria-hidden className="w-[5px] h-[5px] rounded-full bg-[#c62828]" />
          Panel de
        </p>
        <div className="flex items-center gap-2">
          <span className="text-[1rem] font-extrabold text-white tracking-[-0.02em]">
            Administración
          </span>
          {isAdmin && (
            <span className="inline-flex items-center px-2 py-[0.15rem] rounded-full text-[0.58rem] font-bold tracking-[0.09em] uppercase bg-[rgba(198,40,40,0.12)] border border-[rgba(198,40,40,0.28)] text-[#ef5350]">
              Admin
            </span>
          )}
        </div>
      </div>

      {/* Nav — flex-1 fills the sidebar all the way down */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin-dark py-4">
        <ul className="flex flex-col gap-1 px-3">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item);
            return (
              <li key={item.key}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={`relative flex items-center gap-3 pl-4 pr-3 py-2 rounded-[6px] text-[0.86rem] font-medium transition-[background,color] duration-150 ${
                    active
                      ? "text-white bg-white/[0.04]"
                      : "text-white/55 hover:text-white hover:bg-white/[0.025]"
                  }`}
                >
                  {active && (
                    <span
                      aria-hidden
                      className="absolute left-0 top-2 bottom-2 w-[2px] rounded-r bg-[#c62828]"
                    />
                  )}
                  <span className={active ? "text-[#ef5350]" : "text-white/40"}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

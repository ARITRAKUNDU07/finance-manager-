"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  userEmail: string | null | undefined;
  onLogout: () => void;
}

export default function Sidebar({ userEmail, onLogout }: SidebarProps) {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Dashboard", icon: "dashboard", activeOnExact: true },
    { href: "/transactions", label: "Transactions", icon: "receipt_long" },
    { href: "/budgets", label: "Budgets", icon: "payments" },
    { href: "/reports", label: "Reports", icon: "bar_chart" },
  ];

  const isActive = (href: string, activeOnExact?: boolean) => {
    if (activeOnExact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="bg-surface-container h-screen w-64 fixed left-0 top-0 border-r border-outline-variant/30 backdrop-blur-3xl hidden md:flex flex-col py-6 z-50">
      {/* Brand */}
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
          <span className="material-symbols-outlined text-primary font-bold text-xl">
            account_balance
          </span>
        </div>
        <div>
          <h1 className="font-serif text-xl font-bold text-primary tracking-tight leading-none">
            Fortuna
          </h1>
          <p className="font-sans text-xs text-on-surface-variant mt-0.5">
            Premium Wealth
          </p>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 space-y-1">
        {links.map((link) => {
          const active = isActive(link.href, link.activeOnExact);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out active:scale-95 ${
                active
                  ? "text-primary bg-secondary-container/30 border-r-2 border-primary font-medium"
                  : "text-on-surface-variant hover:bg-secondary-container/10 hover:text-primary"
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: `'FILL' ${active ? 1 : 0}` }}
              >
                {link.icon}
              </span>
              <span className="font-sans text-sm">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Section */}
      <div className="px-6 mt-auto">
        <Link href="/transactions/new">
          <button className="w-full bg-[#1E293B] hover:bg-[#334155] border border-[#334155] text-on-surface font-sans text-sm py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 mb-6 cursor-pointer">
            <span className="material-symbols-outlined text-sm">add</span>
            Add Transaction
          </button>
        </Link>
        
        {userEmail && (
          <div className="px-3 py-1 mb-4 text-xs text-on-surface-variant truncate font-sans">
            Logged in as: <br />
            <span className="text-[#e5e2e2] font-semibold">{userEmail}</span>
          </div>
        )}

        <div className="space-y-1">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:text-error transition-colors rounded-lg text-sm text-left cursor-pointer font-sans"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

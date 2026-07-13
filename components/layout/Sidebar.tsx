"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  userEmail: string | null | undefined;
  onLogout: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({
  userEmail,
  onLogout,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
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
    <aside
      className={`bg-surface-container h-screen fixed left-0 top-0 border-r border-outline-variant/30 backdrop-blur-3xl hidden md:flex flex-col py-6 z-50 transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Floating Toggle Button */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3.5 top-6 bg-[#1e293b] border border-[#334155] text-primary hover:text-white rounded-full p-1 shadow-lg hover:bg-[#334155] cursor-pointer transition-colors z-50 flex items-center justify-center"
      >
        <span className="material-symbols-outlined text-[16px] font-bold">
          {isCollapsed ? "chevron_right" : "chevron_left"}
        </span>
      </button>

      {/* Brand */}
      <div className={`px-4 mb-8 flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}>
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
          <span className="material-symbols-outlined text-primary font-bold text-xl">
            account_balance
          </span>
        </div>
        {!isCollapsed && (
          <div className="animate-fade-in-up">
            <h1 className="font-serif text-xl font-bold text-primary tracking-tight leading-none">
              Fortuna
            </h1>
            <p className="font-sans text-xs text-on-surface-variant mt-0.5">
              Premium Wealth
            </p>
          </div>
        )}
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
              } ${isCollapsed ? "justify-center px-0" : ""}`}
              title={isCollapsed ? link.label : ""}
            >
              <span
                className="material-symbols-outlined shrink-0"
                style={{ fontVariationSettings: `'FILL' ${active ? 1 : 0}` }}
              >
                {link.icon}
              </span>
              {!isCollapsed && (
                <span className="font-sans text-sm animate-fade-in-up">{link.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Section */}
      <div className="px-4 mt-auto flex flex-col items-center">
        {isCollapsed ? (
          <Link href="/transactions/new" title="Add Transaction" className="w-10 h-10 mb-6 shrink-0">
            <button className="w-full h-full bg-primary hover:bg-primary/90 text-[#2c303b] rounded-full transition-colors flex items-center justify-center cursor-pointer shadow-[0_0_15px_rgba(195,198,212,0.15)]">
              <span className="material-symbols-outlined text-sm font-bold">add</span>
            </button>
          </Link>
        ) : (
          <Link href="/transactions/new" className="w-full mb-6">
            <button className="w-full bg-[#1E293B] hover:bg-[#334155] border border-[#334155] text-on-surface font-sans text-sm py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer">
              <span className="material-symbols-outlined text-sm">add</span>
              Add Transaction
            </button>
          </Link>
        )}
        
        {/* Bottom user display removed in database-free version */}
      </div>
    </aside>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileNav() {
  const pathname = usePathname();

  const isActive = (href: string, exact = false) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <nav className="md:hidden fixed bottom-0 w-full bg-surface-container/90 backdrop-blur-xl border-t border-outline-variant/30 z-40 flex justify-around items-center h-16 pb-safe">
      <Link
        href="/"
        className={`flex flex-col items-center justify-center w-full h-full ${
          isActive("/", true) ? "text-primary" : "text-on-surface-variant hover:text-primary"
        }`}
      >
        <span className="material-symbols-outlined text-[24px]">dashboard</span>
        <span className="text-[10px] font-medium mt-1 font-sans">Dashboard</span>
      </Link>
      
      <Link
        href="/transactions"
        className={`flex flex-col items-center justify-center w-full h-full ${
          isActive("/transactions") && pathname !== "/transactions/new"
            ? "text-primary"
            : "text-on-surface-variant hover:text-primary"
        }`}
      >
        <span className="material-symbols-outlined text-[24px]">receipt_long</span>
        <span className="text-[10px] font-medium mt-1 font-sans">Activity</span>
      </Link>

      <div className="flex flex-col items-center justify-center w-full h-full relative -top-4">
        <Link href="/transactions/new">
          <button className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg shadow-primary/20 cursor-pointer">
            <span className="material-symbols-outlined text-[24px]">add</span>
          </button>
        </Link>
      </div>

      <Link
        href="/budgets"
        className={`flex flex-col items-center justify-center w-full h-full ${
          isActive("/budgets") ? "text-primary" : "text-on-surface-variant hover:text-primary"
        }`}
      >
        <span className="material-symbols-outlined text-[24px]">payments</span>
        <span className="text-[10px] font-medium mt-1 font-sans">Budgets</span>
      </Link>

      <Link
        href="/reports"
        className={`flex flex-col items-center justify-center w-full h-full ${
          isActive("/reports") ? "text-primary" : "text-on-surface-variant hover:text-primary"
        }`}
      >
        <span className="material-symbols-outlined text-[24px]">bar_chart</span>
        <span className="text-[10px] font-medium mt-1 font-sans">Reports</span>
      </Link>
    </nav>
  );
}

"use client";

import React, { useEffect, useState } from "react";

interface HeaderProps {
  userEmail: string | null | undefined;
  isCollapsed: boolean;
}

export default function Header({ userEmail, isCollapsed }: HeaderProps) {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    // Sync theme on load
    const savedTheme = localStorage.getItem("fortuna_theme") || "light";
    setTheme(savedTheme);
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("fortuna_theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <nav
      className={`bg-surface/40 fixed top-0 right-0 w-full h-16 backdrop-blur-3xl border-b border-outline-variant/30 flex justify-between items-center px-6 z-40 transition-all duration-300 ease-in-out ${
        isCollapsed ? "md:w-[calc(100%-5rem)]" : "md:w-[calc(100%-16rem)]"
      }`}
    >
      <div className="flex items-center">
        {/* Brand for mobile screen */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
            <span className="material-symbols-outlined text-primary font-bold text-lg">
              account_balance
            </span>
          </div>
          <h1 className="font-serif text-lg font-bold text-primary tracking-tight">
            Fortuna
          </h1>
        </div>

        {/* Search for desktop */}
        <div className="relative group hidden lg:block ml-2">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
            search
          </span>
          <input
            className="bg-[#131314]/50 border border-outline-variant/50 rounded-full py-1.5 pl-9 pr-4 text-sm font-sans text-on-surface focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all w-64 placeholder:text-on-surface-variant"
            placeholder="Search..."
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="text-on-surface-variant hover:text-primary transition-colors active:opacity-80 relative cursor-pointer"
          title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
          <span className="material-symbols-outlined">
            {theme === "light" ? "dark_mode" : "light_mode"}
          </span>
        </button>

        {/* Notifications Button */}
        <button className="text-on-surface-variant hover:text-primary transition-colors active:opacity-80 relative cursor-pointer">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full border border-surface"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-surface-container overflow-hidden border border-outline-variant/30">
            <img
              alt="User Avatar"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAuNcNNnPMWJyRnQQ9yEQyIaT9IT8dp6kQ2NgMp870k2gZEZ5rnYdAR5X4rPZ2jdVcfKONuMxeXA9Wrsi5TgjHB7X9czWPodor40GN7BA1kqn_fhJE-CoGLgpOfLNUZLwa7VQOZ1vlBCcIsXjgBmHoiEh394OPb8JA3_z9Fv7aBh-Iba6eVr2AZ-MOyv-LI52FjsADm3yhb8fWXl3bNYrdbYLWfoo1PbAAhDE51--3MnhhdnWFHRcQWWVp4CH_LVlUGJdeXjrug-nc"
            />
          </div>
        </div>
      </div>
    </nav>
  );
}

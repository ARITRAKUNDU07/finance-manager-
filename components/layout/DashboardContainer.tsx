"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import MobileNav from "./MobileNav";

interface DashboardContainerProps {
  userEmail: string | null | undefined;
  onLogout: () => void;
  children: React.ReactNode;
}

export default function DashboardContainer({
  userEmail,
  onLogout,
  children,
}: DashboardContainerProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#e5e2e2] font-sans">
      <Sidebar
        userEmail={userEmail}
        onLogout={onLogout}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />
      <Header userEmail={userEmail} isCollapsed={isCollapsed} />

      <div
        className={`min-h-screen flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? "md:pl-20" : "md:pl-64"
        }`}
      >
        <main className="flex-1 pt-20 pb-20 md:pb-12 px-4 md:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}

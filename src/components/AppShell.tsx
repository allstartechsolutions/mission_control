"use client";

import { useState } from "react";
import { SessionProvider } from "next-auth/react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import type { AppEnvironmentTone } from "@/lib/app-env";

const toneClasses: Record<AppEnvironmentTone, string> = {
  slate: "border-slate-200 bg-slate-900 text-slate-100",
  amber: "border-amber-200 bg-amber-500 text-amber-950",
  red: "border-red-200 bg-red-600 text-red-50",
};

export default function AppShell({
  children,
  environmentLabel,
  environmentTone,
}: {
  children: React.ReactNode;
  environmentLabel?: string;
  environmentTone?: AppEnvironmentTone;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const currentYear = new Date().getFullYear();
  const showEnvironmentBanner = Boolean(environmentLabel);
  const bannerTone = environmentTone ?? "slate";

  return (
    <SessionProvider>
      <div className="min-h-screen bg-gray-50">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="lg:pl-64">
          {showEnvironmentBanner ? (
            <div className={`border-b px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.22em] sm:px-6 ${toneClasses[bannerTone]}`}>
              {environmentLabel} environment, do not treat as live production
            </div>
          ) : null}
          <Header onMenuClick={() => setSidebarOpen(true)} environmentLabel={environmentLabel} environmentTone={bannerTone} />
          <main className="p-4 sm:p-6">{children}</main>
          <footer className="border-t border-gray-200 px-6 py-4 text-center text-sm text-gray-400">
            {currentYear} &copy; AllStar Tech. Powered by Mission Control.
          </footer>
        </div>
      </div>
    </SessionProvider>
  );
}

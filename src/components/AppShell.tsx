"use client";

import { useState } from "react";
import { SessionProvider } from "next-auth/react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const currentYear = new Date().getFullYear();

  return (
    <SessionProvider>
      <div className="min-h-screen bg-gray-50">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="lg:pl-64">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="p-4 sm:p-6">{children}</main>
          <footer className="border-t border-gray-200 px-6 py-4 text-center text-sm text-gray-400">
            {currentYear} &copy; AllStar Tech. Powered by Mission Control.
          </footer>
        </div>
      </div>
    </SessionProvider>
  );
}

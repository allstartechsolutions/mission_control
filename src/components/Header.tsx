"use client";

import { signOut, useSession } from "next-auth/react";
import { Menu, Search, LogOut } from "lucide-react";

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-4 sm:px-6">
      {/* Hamburger */}
      <button
        onClick={onMenuClick}
        className="rounded-md p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
      >
        <Menu size={20} />
      </button>

      {/* Search */}
      <div className="relative hidden sm:block sm:w-72">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search..."
          className="w-full rounded-md border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:border-[#405189] focus:outline-none focus:ring-1 focus:ring-[#405189]"
        />
      </div>

      <div className="flex-1" />

      {/* User */}
      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-gray-700">
            {session?.user?.name || "User"}
          </p>
          <p className="text-xs text-gray-400">
            {(session?.user as { role?: string })?.role || "user"}
          </p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#405189] text-sm font-semibold text-white">
          {(session?.user?.name || "U").charAt(0).toUpperCase()}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          title="Sign out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}

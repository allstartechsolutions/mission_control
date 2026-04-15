"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Settings,
  BarChart3,
  FileText,
  Package,
  X,
  MousePointerClick,
  Building2,
  Lightbulb,
  FolderKanban,
  ListTodo,
} from "lucide-react";

const menuSections = [
  {
    label: "MENU",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Analytics", href: "/analytics", icon: BarChart3 },
      { name: "Inventory", href: "/inventory", icon: Package },
    ],
  },
  {
    label: "MANAGE",
    items: [
      { name: "Clients", href: "/clients", icon: Building2 },
      { name: "Projects", href: "/projects", icon: FolderKanban },
      { name: "Tasks", href: "/tasks", icon: ListTodo },
      { name: "Team", href: "/team", icon: Users },
      { name: "Reports", href: "/reports", icon: FileText },
      { name: "Settings", href: "/settings", icon: Settings },
    ],
  },
  {
    label: "ASSETS",
    items: [
      { name: "Buttons", href: "/assets/buttons", icon: MousePointerClick },
      { name: "Suggestions", href: "/suggestions", icon: Lightbulb },
    ],
  },
];

export default function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 flex h-full w-64 flex-col bg-[#405189] text-white transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-6">
          <Link href="/dashboard" className="text-xl font-bold tracking-wide">
            AllStar Tech
          </Link>
          <button
            onClick={onClose}
            className="rounded p-1 hover:bg-white/10 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-4 py-4">
          {menuSections.map((section) => (
            <div key={section.label} className="mb-6">
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-indigo-200/60">
                {section.label}
              </p>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                          active
                            ? "bg-white/15 text-white"
                            : "text-indigo-100/80 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <item.icon size={18} />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/10 px-6 py-3 text-xs text-indigo-200/50">
          OpenClaw Integrated
        </div>
      </aside>
    </>
  );
}

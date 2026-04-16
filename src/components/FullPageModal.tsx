"use client";

import Link from "next/link";
import { X } from "lucide-react";

export default function FullPageModal({
  title,
  description,
  closeHref,
  children,
}: {
  title: string;
  description?: string;
  closeHref: string;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[70] flex bg-slate-950/55 backdrop-blur-sm">
      <div className="flex min-h-full w-full flex-col overflow-hidden bg-slate-100 shadow-2xl">
        <div className="border-b border-gray-200 bg-white px-4 py-4 sm:px-6">
          <div className="mx-auto flex w-full max-w-6xl items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#405189]">Board overlay</p>
              <h1 className="mt-1 text-2xl font-semibold text-gray-900">{title}</h1>
              {description ? <p className="mt-1 text-sm text-gray-500">{description}</p> : null}
            </div>
            <Link
              href={closeHref}
              scroll={false}
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50"
            >
              <X size={16} /> Close
            </Link>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </div>
      </div>
    </div>
  );
}

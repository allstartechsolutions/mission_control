"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Building2, Eye, Globe, Mail, Pencil, Phone, Plus, Search } from "lucide-react";
import { formatEnumLabel, formatPhoneDisplay } from "@/lib/format";

type ClientRow = {
  id: string;
  companyName: string;
  logoPath: string | null;
  primaryContactName: string | null;
  primaryContactTitle: string | null;
  primaryContactEmail: string | null;
  primaryContactPhone: string | null;
  businessEmail: string | null;
  website: string | null;
  phone: string | null;
  status: string;
  employeeCount: number;
  city: string | null;
  state: string | null;
};

const statusStyles: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  onboarding: "bg-amber-50 text-amber-700 ring-amber-600/20",
  inactive: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

function isImagePath(value: string | null) {
  return !!value && (value.startsWith("/") || value.startsWith("http://") || value.startsWith("https://"));
}

function getInitials(companyName: string) {
  return companyName
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function ClientsTable({ clients }: { clients: ClientRow[] }) {
  const [query, setQuery] = useState("");

  const filteredClients = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return clients;

    return clients.filter((client) =>
      [
        client.companyName,
        client.primaryContactName,
        client.primaryContactEmail,
        client.primaryContactPhone,
        client.businessEmail,
        client.website,
        client.phone,
        client.city,
        client.state,
        client.status,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term))
    );
  }, [clients, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">Client Directory</h2>
          <p className="text-sm text-gray-500">Search, review status, and jump into next actions.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search clients..."
              className="w-full rounded-md border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-700 outline-none ring-0 focus:border-[#405189] focus:bg-white"
            />
          </div>
          <Link
            href="/clients/new"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-[#405189] px-3 py-2 text-sm font-medium text-white hover:bg-[#364474]"
          >
            <Plus size={16} />
            New client
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-4 py-3">Logo</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Primary contact</th>
                <th className="px-4 py-3">Phone / email</th>
                <th className="px-4 py-3">Employees</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50/80">
                  <td className="px-4 py-4">
                    <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-[#405189]/10 text-sm font-semibold text-[#405189]">
                      {isImagePath(client.logoPath) ? (
                        <Image src={client.logoPath!} alt={`${client.companyName} logo`} fill unoptimized className="object-cover" />
                      ) : (
                        getInitials(client.companyName)
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Link href={`/clients/${client.id}`} className="font-semibold text-gray-800 hover:text-[#405189]">
                      {client.companyName}
                    </Link>
                    <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                      <Building2 size={13} />
                      {[client.city, client.state].filter(Boolean).join(", ") || "Location pending"}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-medium text-gray-700">{client.primaryContactName || "No contact assigned"}</div>
                    <div className="mt-1 text-xs text-gray-500">{client.primaryContactTitle || "Title pending"}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Phone size={13} className="text-gray-400" />
                      <span>{formatPhoneDisplay(client.primaryContactPhone || client.phone, "No phone")}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-gray-500">
                      <Mail size={13} className="text-gray-400" />
                      <span>{client.primaryContactEmail || client.businessEmail || "No email"}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-gray-500">
                      <Globe size={13} className="text-gray-400" />
                      <span className="truncate">{client.website || "No website"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-medium text-gray-700">{client.employeeCount}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${statusStyles[client.status] || statusStyles.inactive}`}>
                      {formatEnumLabel(client.status)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-1.5">
                      <Link
                        href={`/clients/${client.id}`}
                        aria-label={`Open ${client.companyName} workspace`}
                        title="Open workspace"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#405189] text-white transition hover:bg-[#364474] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#405189] focus-visible:ring-offset-2"
                      >
                        <Eye size={15} />
                        <span className="sr-only">Open workspace</span>
                      </Link>
                      <Link
                        href={`/clients/${client.id}/edit`}
                        aria-label={`Edit ${client.companyName}`}
                        title="Edit client"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-600 transition hover:border-[#405189] hover:text-[#405189] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#405189] focus-visible:ring-offset-2"
                      >
                        <Pencil size={15} />
                        <span className="sr-only">Edit client</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredClients.length === 0 && (
          <div className="border-t border-gray-100 px-4 py-10 text-center text-sm text-gray-500">
            No clients matched your search.
          </div>
        )}
      </div>
    </div>
  );
}

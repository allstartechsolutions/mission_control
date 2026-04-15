"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { MapPin, Pencil, Phone, Plus, Search } from "lucide-react";
import { formatEnumLabel } from "@/lib/format";

type LocationRow = {
  id: string;
  name: string;
  addressLine1: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  country: string | null;
  phone: string | null;
  status: string;
  _count: { primaryEmployees: number; secondaryEmployees: number };
};

const statusStyles: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  inactive: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

function LocationStatusButton({ clientId, location }: { clientId: string; location: LocationRow }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const nextStatus = location.status === "active" ? "inactive" : "active";

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const formData = new FormData();
          formData.append("name", location.name);
          formData.append("status", nextStatus);
          if (location.addressLine1) formData.append("addressLine1", location.addressLine1);
          if (location.city) formData.append("city", location.city);
          if (location.state) formData.append("state", location.state);
          if (location.zipCode) formData.append("zipCode", location.zipCode);
          if (location.country) formData.append("country", location.country);
          if (location.phone) formData.append("phone", location.phone);

          const response = await fetch(`/api/clients/${clientId}/locations/${location.id}`, {
            method: "PATCH",
            body: formData,
          });

          if (response.ok) {
            router.refresh();
          }
        });
      }}
      className={`inline-flex h-8 items-center justify-center rounded-md px-2.5 text-xs font-medium transition ${
        location.status === "active"
          ? "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
          : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
      } disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {isPending ? "Saving..." : nextStatus === "active" ? "Activate" : "Deactivate"}
    </button>
  );
}

export default function LocationsTable({
  clientId,
  clientName,
  locations,
}: {
  clientId: string;
  clientName: string;
  locations: LocationRow[];
}) {
  const [query, setQuery] = useState("");

  const filteredLocations = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return locations;

    return locations.filter((loc) =>
      [loc.name, loc.addressLine1, loc.city, loc.state, loc.zipCode, loc.country, loc.phone, loc.status]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term)),
    );
  }, [locations, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">Client locations</h2>
          <p className="text-sm text-gray-500">Manage physical sites and addresses for {clientName}.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search locations..."
              className="w-full rounded-md border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-700 outline-none ring-0 focus:border-[#405189] focus:bg-white"
            />
          </div>
          <Link
            href={`/clients/${clientId}/locations/new`}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-[#405189] px-3 py-2 text-sm font-medium text-white hover:bg-[#364474]"
          >
            <Plus size={16} />
            New location
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Employees</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredLocations.map((loc) => {
                const addressParts = [loc.addressLine1, [loc.city, loc.state].filter(Boolean).join(", "), loc.zipCode].filter(Boolean);
                const totalEmployees = loc._count.primaryEmployees + loc._count.secondaryEmployees;

                return (
                  <tr key={loc.id} className="hover:bg-gray-50/80">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#405189]/10 text-[#405189]">
                          <MapPin size={18} />
                        </div>
                        <div className="font-semibold text-gray-800">{loc.name}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-600">{addressParts.join(", ") || "No address"}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone size={13} className="text-gray-400" />
                        <span>{loc.phone || "No phone"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-600">{totalEmployees}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${statusStyles[loc.status] || statusStyles.inactive}`}>
                        {formatEnumLabel(loc.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-1.5">
                        <LocationStatusButton clientId={clientId} location={loc} />
                        <Link
                          href={`/clients/${clientId}/locations/${loc.id}/edit`}
                          aria-label={`Edit ${loc.name}`}
                          title="Edit location"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-600 transition hover:border-[#405189] hover:text-[#405189] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#405189] focus-visible:ring-offset-2"
                        >
                          <Pencil size={15} />
                          <span className="sr-only">Edit location</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredLocations.length === 0 && (
          <div className="border-t border-gray-100 px-4 py-10 text-center text-sm text-gray-500">No locations matched your search.</div>
        )}
      </div>
    </div>
  );
}

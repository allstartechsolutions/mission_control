"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Mail, MapPin, Pencil, Phone, Plus, Search, UserRound } from "lucide-react";
import { formatEnumLabel } from "@/lib/format";

type EmployeeRow = {
  id: string;
  name: string;
  title: string | null;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  whatsapp: string | null;
  status: string;
  profileImagePath: string | null;
  primaryLocation: { id: string; name: string } | null;
};

const statusStyles: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  inactive: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

function isImagePath(value: string | null) {
  return !!value && (value.startsWith("/") || value.startsWith("http://") || value.startsWith("https://"));
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function EmployeeStatusButton({ clientId, employee }: { clientId: string; employee: EmployeeRow }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const nextStatus = employee.status === "active" ? "inactive" : "active";

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const response = await fetch(`/api/clients/${clientId}/employees/${employee.id}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: nextStatus }),
          });

          if (response.ok) {
            router.refresh();
          }
        });
      }}
      className={`inline-flex h-8 items-center justify-center rounded-md px-2.5 text-xs font-medium transition ${
        employee.status === "active"
          ? "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
          : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
      } disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {isPending ? "Saving..." : nextStatus === "active" ? "Activate" : "Deactivate"}
    </button>
  );
}

export default function EmployeesTable({
  clientId,
  clientName,
  employees,
}: {
  clientId: string;
  clientName: string;
  employees: EmployeeRow[];
}) {
  const [query, setQuery] = useState("");

  const filteredEmployees = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return employees;

    return employees.filter((employee) =>
      [employee.name, employee.title, employee.email, employee.phone, employee.mobile, employee.whatsapp, employee.status, employee.primaryLocation?.name]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term)),
    );
  }, [employees, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">Client employees</h2>
          <p className="text-sm text-gray-500">Search, update, and manage who is active inside {clientName}.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search employees..."
              className="w-full rounded-md border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-700 outline-none ring-0 focus:border-[#405189] focus:bg-white"
            />
          </div>
          <Link
            href={`/clients/${clientId}/employees/new`}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-[#405189] px-3 py-2 text-sm font-medium text-white hover:bg-[#364474]"
          >
            <Plus size={16} />
            New employee
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Phone / email</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50/80">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-[#405189]/10 text-sm font-semibold text-[#405189]">
                        {isImagePath(employee.profileImagePath) ? (
                          <Image src={employee.profileImagePath!} alt={employee.name} fill unoptimized className="object-cover" />
                        ) : (
                          getInitials(employee.name)
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{employee.name}</div>
                        <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                          <UserRound size={13} />
                          <span>{employee.whatsapp || employee.mobile || "No mobile contact"}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-600">{employee.title || "Not set"}</td>
                  <td className="px-4 py-4">
                    {employee.primaryLocation ? (
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <MapPin size={13} className="text-gray-400" />
                        <span>{employee.primaryLocation.name}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Phone size={13} className="text-gray-400" />
                      <span>{employee.phone || employee.mobile || "No phone"}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-gray-500">
                      <Mail size={13} className="text-gray-400" />
                      <span>{employee.email || "No email"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${statusStyles[employee.status] || statusStyles.inactive}`}>
                      {formatEnumLabel(employee.status)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-1.5">
                      <EmployeeStatusButton clientId={clientId} employee={employee} />
                      <Link
                        href={`/clients/${clientId}/employees/${employee.id}/edit`}
                        aria-label={`Edit ${employee.name}`}
                        title="Edit employee"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-600 transition hover:border-[#405189] hover:text-[#405189] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#405189] focus-visible:ring-offset-2"
                      >
                        <Pencil size={15} />
                        <span className="sr-only">Edit employee</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEmployees.length === 0 && (
          <div className="border-t border-gray-100 px-4 py-10 text-center text-sm text-gray-500">No employees matched your search.</div>
        )}
      </div>
    </div>
  );
}

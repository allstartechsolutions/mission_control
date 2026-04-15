"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { Mail, Pencil, Phone, Search, ShieldCheck, Trash2, UserPlus, Users } from "lucide-react";

type TeamRow = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  mobile: string | null;
  whatsapp: string | null;
  role: string;
  createdAt: string;
};

export default function TeamTable({ members }: { members: TeamRow[] }) {
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const filteredMembers = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return members;

    return members.filter((member) =>
      [member.name, member.email, member.phone, member.mobile, member.whatsapp, member.role]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term))
    );
  }, [members, query]);

  function handleDelete(member: TeamRow) {
    const confirmed = window.confirm(`Delete ${member.name || member.email} from Team?`);
    if (!confirmed) return;

    setError("");
    setPendingId(member.id);

    startTransition(async () => {
      const response = await fetch(`/api/team/${member.id}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error || "Unable to delete team member.");
        setPendingId(null);
        return;
      }

      window.location.reload();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">Team directory</h2>
          <p className="text-sm text-gray-500">Manage the internal Mission Control users who can sign in and work the system.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search team..."
              className="w-full rounded-md border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-700 outline-none ring-0 focus:border-[#405189] focus:bg-white"
            />
          </div>
          <Link
            href="/team/new"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-[#405189] px-3 py-2 text-sm font-medium text-white hover:bg-[#364474]"
          >
            <UserPlus size={16} />
            New team member
          </Link>
        </div>
      </div>

      {error ? <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50/80">
                  <td className="px-4 py-4">
                    <div className="font-semibold text-gray-800">{member.name || "Unnamed user"}</div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                      <Mail size={13} className="text-gray-400" />
                      <span>{member.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#405189]/10 px-2.5 py-1 text-xs font-semibold capitalize text-[#405189]">
                      <ShieldCheck size={12} />
                      {member.role}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-gray-700">
                    <div className="flex items-center gap-2">
                      <Phone size={13} className="text-gray-400" />
                      <span>{member.phone || member.mobile || member.whatsapp || "No contact saved"}</span>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {[member.mobile ? `Mobile: ${member.mobile}` : null, member.whatsapp ? `WhatsApp: ${member.whatsapp}` : null]
                        .filter(Boolean)
                        .join(" • ") || "Add mobile or WhatsApp details as needed"}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-600">{member.createdAt}</td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-1.5">
                      <Link
                        href={`/team/${member.id}/edit`}
                        aria-label={`Edit ${member.name || member.email}`}
                        title="Edit team member"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-600 transition hover:border-[#405189] hover:text-[#405189]"
                      >
                        <Pencil size={15} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(member)}
                        disabled={pendingId === member.id}
                        aria-label={`Delete ${member.name || member.email}`}
                        title="Delete team member"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-red-200 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredMembers.length === 0 && (
          <div className="border-t border-gray-100 px-4 py-10 text-center text-sm text-gray-500">
            <div className="mb-2 flex justify-center text-gray-300"><Users size={20} /></div>
            No team members matched your search.
          </div>
        )}
      </div>
    </div>
  );
}

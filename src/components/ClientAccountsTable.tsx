"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Eye, EyeOff, KeyRound, LockKeyhole, Pencil, Plus, Search, Shield } from "lucide-react";

type AccountRow = {
  id: string;
  name: string;
  description: string | null;
  username: string;
  password: string;
  updatedAtLabel: string;
};

function maskValue(value: string, visibleTail = 2) {
  if (!value) return "Not set";
  if (value.length <= visibleTail) return "•".repeat(value.length);
  return `${"•".repeat(Math.max(4, value.length - visibleTail))}${value.slice(-visibleTail)}`;
}

function SecretCell({ icon: Icon, label, value, defaultVisible = false }: { icon: typeof KeyRound; label: string; value: string; defaultVisible?: boolean }) {
  const [visible, setVisible] = useState(defaultVisible);

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
          <Icon size={13} />
          <span>{label}</span>
        </div>
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-600 hover:border-[#405189] hover:text-[#405189]"
        >
          {visible ? <EyeOff size={13} /> : <Eye size={13} />}
          {visible ? "Hide" : "Reveal"}
        </button>
      </div>
      <div className="mt-2 break-all font-mono text-sm text-gray-800">{visible ? value : maskValue(value)}</div>
    </div>
  );
}

export default function ClientAccountsTable({
  clientId,
  clientName,
  accounts,
}: {
  clientId: string;
  clientName: string;
  accounts: AccountRow[];
}) {
  const [query, setQuery] = useState("");

  const filteredAccounts = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return accounts;

    return accounts.filter((account) =>
      [account.name, account.description, account.username]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term)),
    );
  }, [accounts, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">Client accounts</h2>
          <p className="text-sm text-gray-500">Store credentials for {clientName} with encryption at rest and cautious reveal controls.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search accounts..."
              className="w-full rounded-md border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-700 outline-none ring-0 focus:border-[#405189] focus:bg-white"
            />
          </div>
          <Link
            href={`/clients/${clientId}/accounts/new`}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-[#405189] px-3 py-2 text-sm font-medium text-white hover:bg-[#364474]"
          >
            <Plus size={16} />
            New account
          </Link>
        </div>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm">
        <div className="flex items-start gap-2">
          <Shield size={16} className="mt-0.5 shrink-0" />
          <p>Usernames and passwords are encrypted before they reach the database. Reveal them only when needed, and avoid screen-sharing this page.</p>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredAccounts.map((account) => (
          <section key={account.id} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#405189]/10 text-[#405189]">
                      <LockKeyhole size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-800">{account.name}</h3>
                      <p className="text-xs text-gray-500">Updated {account.updatedAtLabel}</p>
                    </div>
                  </div>
                </div>
                <p className="max-w-2xl text-sm text-gray-600">{account.description || "No description recorded for this account."}</p>
              </div>

              <Link
                href={`/clients/${clientId}/accounts/${account.id}/edit`}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:border-[#405189] hover:text-[#405189]"
              >
                <Pencil size={15} />
                Edit
              </Link>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              <SecretCell icon={KeyRound} label="Username" value={account.username} />
              <SecretCell icon={LockKeyhole} label="Password" value={account.password} />
            </div>
          </section>
        ))}

        {filteredAccounts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white px-6 py-10 text-center text-sm text-gray-500 shadow-sm">
            No accounts matched your search.
          </div>
        ) : null}
      </div>
    </div>
  );
}

"use client";

import type { FormEvent, InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Eye, EyeOff, ShieldAlert } from "lucide-react";

type ClientAccountFormValues = {
  name: string;
  username: string;
  password: string;
  description: string;
};

const defaultValues: ClientAccountFormValues = {
  name: "",
  username: "",
  password: "",
  description: "",
};

function Field({ label, hint, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <input {...props} className="form-control" />
      {hint ? <span className="block text-xs text-gray-500">{hint}</span> : null}
    </label>
  );
}

function TextareaField({ label, hint, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; hint?: string }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <textarea {...props} className="form-control min-h-28" />
      {hint ? <span className="block text-xs text-gray-500">{hint}</span> : null}
    </label>
  );
}

export default function ClientAccountForm({
  mode,
  clientId,
  accountId,
  clientName,
  initialValues,
}: {
  mode: "create" | "edit";
  clientId: string;
  accountId?: string;
  clientName: string;
  initialValues?: Partial<ClientAccountFormValues>;
}) {
  const router = useRouter();
  const [values, setValues] = useState<ClientAccountFormValues>({ ...defaultValues, ...initialValues });
  const [showUsername, setShowUsername] = useState(mode === "edit");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const endpoint = useMemo(
    () => (mode === "create" ? `/api/clients/${clientId}/accounts` : `/api/clients/${clientId}/accounts/${accountId}`),
    [accountId, clientId, mode],
  );
  const method = mode === "create" ? "POST" : "PATCH";

  function updateValue<K extends keyof ClientAccountFormValues>(key: K, value: ClientAccountFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(data.error || `Unable to ${mode} account.`);
      setSaving(false);
      return;
    }

    router.push(`/clients/${clientId}/accounts`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm">
        <div className="flex items-start gap-2">
          <ShieldAlert size={16} className="mt-0.5 shrink-0" />
          <p>Credentials are encrypted at rest. Only enter values that Mission Control should retain, and keep this page out of screenshots or streams.</p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-800">Account details</h2>
          <p className="mt-1 text-sm text-gray-500">Credential record for the {clientName} workspace.</p>
        </div>
        <div className="grid gap-4 p-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <Field
              label="Account name"
              name="name"
              value={values.name}
              onChange={(event) => updateValue("name", event.target.value)}
              placeholder="Microsoft 365 Admin"
              required
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-gray-700">Username</span>
              <button type="button" onClick={() => setShowUsername((current) => !current)} className="inline-flex items-center gap-1 text-xs font-medium text-[#405189] hover:text-[#364474]">
                {showUsername ? <EyeOff size={14} /> : <Eye size={14} />}
                {showUsername ? "Hide" : "Reveal"}
              </button>
            </div>
            <input
              name="username"
              type={showUsername ? "text" : "password"}
              value={values.username}
              onChange={(event) => updateValue("username", event.target.value)}
              placeholder="admin@client.com"
              autoComplete="off"
              className="form-control"
              required
            />
            <span className="block text-xs text-gray-500">Stored encrypted. Revealed here only for the current editing session.</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-gray-700">Password</span>
              <button type="button" onClick={() => setShowPassword((current) => !current)} className="inline-flex items-center gap-1 text-xs font-medium text-[#405189] hover:text-[#364474]">
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                {showPassword ? "Hide" : "Reveal"}
              </button>
            </div>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={values.password}
              onChange={(event) => updateValue("password", event.target.value)}
              placeholder="Enter password"
              autoComplete="new-password"
              className="form-control"
              required
            />
            <span className="block text-xs text-gray-500">Stored encrypted with an env-managed key. Anyone with app access can reveal it here, so keep access tight.</span>
          </div>

          <div className="md:col-span-2">
            <TextareaField
              label="Description"
              name="description"
              value={values.description}
              onChange={(event) => updateValue("description", event.target.value)}
              placeholder="Global admin for tenant, used for mailbox and license changes."
              hint="Optional context such as when to use it, MFA notes, or owner details."
            />
          </div>
        </div>
      </div>

      {error ? <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link href={`/clients/${clientId}/accounts`} className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50">
          Cancel
        </Link>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center rounded-md bg-[#405189] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#364474] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (mode === "create" ? "Saving account..." : "Saving changes...") : mode === "create" ? "Create account" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

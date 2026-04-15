"use client";

import type { FormEvent, InputHTMLAttributes } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { formatEnumLabel } from "@/lib/format";

type TeamFormValues = {
  name: string;
  email: string;
  phone: string;
  mobile: string;
  whatsapp: string;
  role: string;
  password: string;
  confirmPassword: string;
};

const defaultValues: TeamFormValues = {
  name: "",
  email: "",
  phone: "",
  mobile: "",
  whatsapp: "",
  role: "user",
  password: "",
  confirmPassword: "",
};

const roleOptions = ["admin", "user"];

function Field({ label, hint, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <input
        {...props}
        className="form-control"
      />
      {hint ? <span className="block text-xs text-gray-500">{hint}</span> : null}
    </label>
  );
}

export default function TeamForm({
  mode,
  memberId,
  initialValues,
}: {
  mode: "create" | "edit";
  memberId?: string;
  initialValues?: Partial<TeamFormValues>;
}) {
  const router = useRouter();
  const [values, setValues] = useState<TeamFormValues>({ ...defaultValues, ...initialValues });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const endpoint = useMemo(() => (mode === "create" ? "/api/team" : `/api/team/${memberId}`), [memberId, mode]);
  const method = mode === "create" ? "POST" : "PATCH";

  function updateValue<K extends keyof TeamFormValues>(key: K, value: TeamFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    if (mode === "create" && values.password.length < 8) {
      setError("Password must be at least 8 characters.");
      setSaving(false);
      return;
    }

    if (values.password || values.confirmPassword) {
      if (values.password !== values.confirmPassword) {
        setError("Passwords do not match.");
        setSaving(false);
        return;
      }
      if (values.password.length < 8) {
        setError("Password must be at least 8 characters.");
        setSaving(false);
        return;
      }
    }

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: values.name,
        email: values.email,
        phone: values.phone,
        mobile: values.mobile,
        whatsapp: values.whatsapp,
        role: values.role,
        password: values.password,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(data.error || `Unable to ${mode} team member.`);
      setSaving(false);
      return;
    }

    router.push("/team");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-800">Team member details</h2>
          <p className="mt-1 text-sm text-gray-500">Manage Mission Control system users and their direct contact channels.</p>
        </div>
        <div className="grid gap-4 p-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <Field label="Full name" name="name" value={values.name} onChange={(event) => updateValue("name", event.target.value)} placeholder="Jordan Reyes" required />
          </div>
          <Field label="Email" name="email" type="email" value={values.email} onChange={(event) => updateValue("email", event.target.value)} placeholder="jordan@allstartech.com" required />
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-gray-700">Role</span>
            <select
              name="role"
              value={values.role}
              onChange={(event) => updateValue("role", event.target.value)}
              className="form-select"
            >
              {roleOptions.map((option) => (
                <option key={option} value={option}>
                  {formatEnumLabel(option)}
                </option>
              ))}
            </select>
          </label>
          <div className="hidden md:block" />
          <Field label="Phone" name="phone" value={values.phone} onChange={(event) => updateValue("phone", event.target.value)} placeholder="(214) 555-0143" />
          <Field label="Mobile" name="mobile" value={values.mobile} onChange={(event) => updateValue("mobile", event.target.value)} placeholder="(214) 555-0198" />
          <Field label="WhatsApp" name="whatsapp" value={values.whatsapp} onChange={(event) => updateValue("whatsapp", event.target.value)} placeholder="+1 214 555 0198" />
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-800">Access</h2>
          <p className="mt-1 text-sm text-gray-500">Set or update credentials for this Mission Control user.</p>
        </div>
        <div className="grid gap-4 p-5 md:grid-cols-2">
          <Field
            label={mode === "create" ? "Password" : "New password"}
            name="password"
            type="password"
            value={values.password}
            onChange={(event) => updateValue("password", event.target.value)}
            placeholder={mode === "create" ? "Minimum 8 characters" : "Leave blank to keep current password"}
            required={mode === "create"}
            minLength={mode === "create" ? 8 : undefined}
          />
          <Field
            label={mode === "create" ? "Confirm password" : "Confirm new password"}
            name="confirmPassword"
            type="password"
            value={values.confirmPassword}
            onChange={(event) => updateValue("confirmPassword", event.target.value)}
            placeholder="Re-enter password"
            required={mode === "create"}
            minLength={mode === "create" ? 8 : undefined}
          />
        </div>
      </div>

      {error ? <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/team"
          className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center rounded-md bg-[#405189] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#364474] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (mode === "create" ? "Creating team member..." : "Saving changes...") : mode === "create" ? "Create team member" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

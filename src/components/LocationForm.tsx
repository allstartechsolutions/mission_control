"use client";

import type { FormEvent, InputHTMLAttributes } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { formatEnumLabel } from "@/lib/format";

type LocationFormValues = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  status: string;
};

const defaultValues: LocationFormValues = {
  name: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  zipCode: "",
  country: "",
  phone: "",
  status: "active",
};

const statusOptions = ["active", "inactive"];

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

export default function LocationForm({
  mode,
  clientId,
  locationId,
  clientName,
  initialValues,
}: {
  mode: "create" | "edit";
  clientId: string;
  locationId?: string;
  clientName: string;
  initialValues?: Partial<LocationFormValues>;
}) {
  const router = useRouter();
  const [values, setValues] = useState<LocationFormValues>({ ...defaultValues, ...initialValues });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const endpoint = useMemo(
    () => (mode === "create" ? `/api/clients/${clientId}/locations` : `/api/clients/${clientId}/locations/${locationId}`),
    [clientId, locationId, mode],
  );
  const method = mode === "create" ? "POST" : "PATCH";

  function updateValue<K extends keyof LocationFormValues>(key: K, value: LocationFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => formData.append(key, value));

    const response = await fetch(endpoint, { method, body: formData });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(data.error || `Unable to ${mode} location.`);
      setSaving(false);
      return;
    }

    router.push(`/clients/${clientId}/locations`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-800">Location details</h2>
          <p className="mt-1 text-sm text-gray-500">Site information for the {clientName} workspace.</p>
        </div>
        <div className="grid gap-4 p-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <Field
              label="Location name"
              name="name"
              value={values.name}
              onChange={(event) => updateValue("name", event.target.value)}
              placeholder="Main Office"
              required
            />
          </div>
          <Field
            label="Address line 1"
            name="addressLine1"
            value={values.addressLine1}
            onChange={(event) => updateValue("addressLine1", event.target.value)}
            placeholder="123 Business Ave"
          />
          <Field
            label="Address line 2"
            name="addressLine2"
            value={values.addressLine2}
            onChange={(event) => updateValue("addressLine2", event.target.value)}
            placeholder="Suite 400"
          />
          <Field
            label="City"
            name="city"
            value={values.city}
            onChange={(event) => updateValue("city", event.target.value)}
            placeholder="Dallas"
          />
          <Field
            label="State / Province"
            name="state"
            value={values.state}
            onChange={(event) => updateValue("state", event.target.value)}
            placeholder="TX"
          />
          <Field
            label="ZIP / Postal code"
            name="zipCode"
            value={values.zipCode}
            onChange={(event) => updateValue("zipCode", event.target.value)}
            placeholder="75201"
          />
          <Field
            label="Country"
            name="country"
            value={values.country}
            onChange={(event) => updateValue("country", event.target.value)}
            placeholder="United States"
          />
          <Field
            label="Phone"
            name="phone"
            value={values.phone}
            onChange={(event) => updateValue("phone", event.target.value)}
            placeholder="(214) 555-0100"
          />
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-gray-700">Status</span>
            <select
              name="status"
              value={values.status}
              onChange={(event) => updateValue("status", event.target.value)}
              className="form-select"
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {formatEnumLabel(option)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {error ? <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href={`/clients/${clientId}/locations`}
          className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center rounded-md bg-[#405189] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#364474] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (mode === "create" ? "Adding location..." : "Saving changes...") : mode === "create" ? "Add location" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

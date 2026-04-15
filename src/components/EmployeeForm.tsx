"use client";

import type { ChangeEvent, DragEvent, FormEvent, InputHTMLAttributes } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ImagePlus, Upload } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatEnumLabel } from "@/lib/format";

type LocationOption = {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
};

type EmployeeFormValues = {
  name: string;
  title: string;
  email: string;
  phone: string;
  mobile: string;
  whatsapp: string;
  profileImagePath: string;
  status: string;
  primaryLocationId: string;
  secondaryLocationIds: string[];
};

const defaultValues: EmployeeFormValues = {
  name: "",
  title: "",
  email: "",
  phone: "",
  mobile: "",
  whatsapp: "",
  profileImagePath: "",
  status: "active",
  primaryLocationId: "",
  secondaryLocationIds: [],
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

export default function EmployeeForm({
  mode,
  clientId,
  employeeId,
  clientName,
  initialValues,
  locations = [],
}: {
  mode: "create" | "edit";
  clientId: string;
  employeeId?: string;
  clientName: string;
  initialValues?: Partial<EmployeeFormValues>;
  locations?: LocationOption[];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState<EmployeeFormValues>({ ...defaultValues, ...initialValues });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(initialValues?.profileImagePath ?? "");

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const endpoint = useMemo(
    () => (mode === "create" ? `/api/clients/${clientId}/employees` : `/api/clients/${clientId}/employees/${employeeId}`),
    [clientId, employeeId, mode],
  );
  const method = mode === "create" ? "POST" : "PATCH";

  function updateValue<K extends keyof EmployeeFormValues>(key: K, value: EmployeeFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function applyFile(file: File | null) {
    if (!file) return;
    if (previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(file);
    setSelectedFileName(file.name);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    applyFile(event.target.files?.[0] ?? null);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    applyFile(event.dataTransfer.files?.[0] ?? null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (key === "secondaryLocationIds") return;
      if (typeof value === "string") formData.append(key, value);
    });
    formData.set("existingProfileImagePath", values.profileImagePath);
    formData.set("secondaryLocationIds", JSON.stringify(values.secondaryLocationIds));
    if (selectedFile) {
      formData.set("profileImageFile", selectedFile);
    }

    const response = await fetch(endpoint, { method, body: formData });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(data.error || `Unable to ${mode} employee.`);
      setSaving(false);
      return;
    }

    router.push(`/clients/${clientId}/employees`);
    router.refresh();
  }

  const previewLabel = selectedFileName
    ? `Selected file: ${selectedFileName}`
    : values.profileImagePath
      ? "Current saved photo"
      : "Drag and drop a profile photo";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-800">Employee details</h2>
          <p className="mt-1 text-sm text-gray-500">Core employee information for the {clientName} workspace.</p>
        </div>
        <div className="grid gap-4 p-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <Field
              label="Full name"
              name="name"
              value={values.name}
              onChange={(event) => updateValue("name", event.target.value)}
              placeholder="Jane Rodriguez"
              required
            />
          </div>
          <Field
            label="Job title"
            name="title"
            value={values.title}
            onChange={(event) => updateValue("title", event.target.value)}
            placeholder="Director of Operations"
          />
          <Field
            label="Email"
            name="email"
            type="email"
            value={values.email}
            onChange={(event) => updateValue("email", event.target.value)}
            placeholder="jane.rodriguez@company.com"
          />
          <Field
            label="Phone"
            name="phone"
            value={values.phone}
            onChange={(event) => updateValue("phone", event.target.value)}
            placeholder="(214) 555-0143"
          />
          <Field
            label="Mobile"
            name="mobile"
            value={values.mobile}
            onChange={(event) => updateValue("mobile", event.target.value)}
            placeholder="(214) 555-0198"
          />
          <Field
            label="WhatsApp"
            name="whatsapp"
            value={values.whatsapp}
            onChange={(event) => updateValue("whatsapp", event.target.value)}
            placeholder="+1 214 555 0198"
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

      {locations.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-800">Location assignment</h2>
            <p className="mt-1 text-sm text-gray-500">Assign this employee to a primary site and optional secondary locations.</p>
          </div>
          <div className="grid gap-4 p-5 md:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-gray-700">Primary location</span>
              <select
                name="primaryLocationId"
                value={values.primaryLocationId}
                onChange={(event) => updateValue("primaryLocationId", event.target.value)}
                className="form-select"
              >
                <option value="">None</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}{loc.city || loc.state ? ` — ${[loc.city, loc.state].filter(Boolean).join(", ")}` : ""}
                  </option>
                ))}
              </select>
            </label>
            <div className="space-y-1.5">
              <span className="text-sm font-medium text-gray-700">Secondary locations</span>
              <div className="space-y-2 rounded-md border border-gray-200 bg-gray-50 p-3">
                {locations
                  .filter((loc) => loc.id !== values.primaryLocationId)
                  .map((loc) => (
                    <label key={loc.id} className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={values.secondaryLocationIds.includes(loc.id)}
                        onChange={(event) => {
                          const checked = event.target.checked;
                          setValues((current) => ({
                            ...current,
                            secondaryLocationIds: checked
                              ? [...current.secondaryLocationIds, loc.id]
                              : current.secondaryLocationIds.filter((sid) => sid !== loc.id),
                          }));
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-[#405189] focus:ring-[#405189]"
                      />
                      {loc.name}{loc.city || loc.state ? ` — ${[loc.city, loc.state].filter(Boolean).join(", ")}` : ""}
                    </label>
                  ))}
                {locations.filter((loc) => loc.id !== values.primaryLocationId).length === 0 && (
                  <p className="text-xs text-gray-500">No additional locations available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-800">Profile photo</h2>
          <p className="mt-1 text-sm text-gray-500">Upload a headshot or team photo. Stored under this client&apos;s employee folder.</p>
        </div>
        <div className="p-5">
          <label
            onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
            onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
            onDragLeave={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                setIsDragging(false);
              }
            }}
            onDrop={handleDrop}
            className={`flex cursor-pointer flex-col gap-4 rounded-lg border border-dashed bg-white p-4 transition ${
              isDragging
                ? "border-[#405189] bg-[#405189]/5 ring-2 ring-[#405189]/15"
                : "border-gray-300 hover:border-[#405189]/60 hover:bg-gray-50"
            }`}
          >
            <input ref={fileInputRef} type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-[#405189]/10 p-2 text-[#405189]">
                {selectedFileName || values.profileImagePath ? <ImagePlus className="h-5 w-5" /> : <Upload className="h-5 w-5" />}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-700">{previewLabel}</p>
                <p className="text-xs text-gray-500">PNG, JPG, SVG, or WebP. Click anywhere in this box to choose a file.</p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-[120px_minmax(0,1fr)] md:items-start">
              <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                {previewUrl ? (
                  <div className="relative aspect-square w-full">
                    <Image src={previewUrl} alt="Profile photo preview" fill unoptimized className="object-cover" />
                  </div>
                ) : (
                  <div className="flex aspect-square w-full flex-col items-center justify-center gap-2 p-4 text-center text-xs text-gray-500">
                    <ImagePlus className="h-5 w-5 text-gray-400" />
                    <span>Preview appears here</span>
                  </div>
                )}
              </div>
              {values.profileImagePath ? (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
                  <p>Current saved path: <span className="font-mono">{values.profileImagePath}</span></p>
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center justify-center rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50"
              >
                Browse files
              </button>
              {selectedFileName || previewUrl ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFileName("");
                    setSelectedFile(null);
                    if (previewUrl.startsWith("blob:")) {
                      URL.revokeObjectURL(previewUrl);
                    }
                    setPreviewUrl(values.profileImagePath);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  className="inline-flex items-center justify-center rounded-md border border-transparent px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                >
                  Clear file
                </button>
              ) : null}
            </div>
          </label>
        </div>
      </div>

      {error ? <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href={`/clients/${clientId}/employees`}
          className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center rounded-md bg-[#405189] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#364474] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (mode === "create" ? "Adding employee..." : "Saving changes...") : mode === "create" ? "Add employee" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

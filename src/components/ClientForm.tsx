"use client";

import type { ChangeEvent, DragEvent, FormEvent, InputHTMLAttributes } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ImagePlus, Upload } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import { formatEnumLabel } from "@/lib/format";

type ClientFormValues = {
  companyName: string;
  logoPath: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  mobile: string;
  whatsapp: string;
  primaryContactName: string;
  primaryContactTitle: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  status: string;
};

const defaultValues: ClientFormValues = {
  companyName: "",
  logoPath: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  zipCode: "",
  country: "USA",
  phone: "",
  mobile: "",
  whatsapp: "",
  primaryContactName: "",
  primaryContactTitle: "",
  primaryContactEmail: "",
  primaryContactPhone: "",
  status: "active",
};

const statusOptions = ["active", "onboarding", "inactive"];

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

export default function ClientForm({
  mode,
  clientId,
  initialValues,
}: {
  mode: "create" | "edit";
  clientId?: string;
  initialValues?: Partial<ClientFormValues>;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState<ClientFormValues>({ ...defaultValues, ...initialValues });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const [selectedLogoName, setSelectedLogoName] = useState("");
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState(initialValues?.logoPath ?? "");

  useEffect(() => {
    return () => {
      if (logoPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreviewUrl);
      }
    };
  }, [logoPreviewUrl]);

  const endpoint = useMemo(() => (mode === "create" ? "/api/clients" : `/api/clients/${clientId}`), [clientId, mode]);
  const method = mode === "create" ? "POST" : "PATCH";

  function updateValue<K extends keyof ClientFormValues>(key: K, value: ClientFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function applyLogoFile(file: File | null) {
    if (!file) return;

    if (logoPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(logoPreviewUrl);
    }

    setSelectedLogoFile(file);
    setSelectedLogoName(file.name);
    setLogoPreviewUrl(URL.createObjectURL(file));
  }

  function handleLogoFileChange(event: ChangeEvent<HTMLInputElement>) {
    applyLogoFile(event.target.files?.[0] ?? null);
  }

  function handleLogoDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDraggingLogo(false);
    applyLogoFile(event.dataTransfer.files?.[0] ?? null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => formData.append(key, value));
    formData.set("existingLogoPath", values.logoPath);
    if (selectedLogoFile) {
      formData.set("logoFile", selectedLogoFile);
    }

    const response = await fetch(endpoint, {
      method,
      body: formData,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(data.error || `Unable to ${mode} client.`);
      setSaving(false);
      return;
    }

    router.push("/clients");
    router.refresh();
  }

  const previewLabel = selectedLogoName
    ? `Selected file: ${selectedLogoName}`
    : values.logoPath
      ? "Current saved logo"
      : "Drag and drop a logo image";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-800">Company profile</h2>
          <p className="mt-1 text-sm text-gray-500">Capture the core client record with a real logo upload that saves into the client folder.</p>
        </div>
        <div className="grid gap-4 p-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <Field
              label="Company name"
              name="companyName"
              value={values.companyName}
              onChange={(event) => updateValue("companyName", event.target.value)}
              placeholder="Northstar Logistics Group"
              required
            />
          </div>
          <div className="md:col-span-2 space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-700">Client logo</span>
              <p className="mt-1 text-xs text-gray-500">Drop an image here or browse for a file. The preview updates immediately, and save stores the file on local disk for this client.</p>
            </div>

            <label
              onDragOver={(event) => {
                event.preventDefault();
                setIsDraggingLogo(true);
              }}
              onDragEnter={(event) => {
                event.preventDefault();
                setIsDraggingLogo(true);
              }}
              onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                  setIsDraggingLogo(false);
                }
              }}
              onDrop={handleLogoDrop}
              className={`flex cursor-pointer flex-col gap-4 rounded-lg border border-dashed bg-white p-4 transition ${
                isDraggingLogo
                  ? "border-[#405189] bg-[#405189]/5 ring-2 ring-[#405189]/15"
                  : "border-gray-300 hover:border-[#405189]/60 hover:bg-gray-50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleLogoFileChange}
              />
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-[#405189]/10 p-2 text-[#405189]">
                  {selectedLogoName || values.logoPath ? <ImagePlus className="h-5 w-5" /> : <Upload className="h-5 w-5" />}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-700">{previewLabel}</p>
                  <p className="text-xs text-gray-500">PNG, JPG, SVG, or WebP work well. Click anywhere in this box to choose a file.</p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-[160px_minmax(0,1fr)] md:items-start">
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                  {logoPreviewUrl ? (
                    <div className="relative aspect-square w-full">
                      <Image src={logoPreviewUrl} alt="Selected client logo preview" fill unoptimized className="object-contain" />
                    </div>
                  ) : (
                    <div className="flex aspect-square w-full flex-col items-center justify-center gap-2 p-4 text-center text-xs text-gray-500">
                      <ImagePlus className="h-5 w-5 text-gray-400" />
                      <span>Preview appears here immediately after drop or selection.</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2 rounded-lg border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-900">
                  <p className="font-medium">Real upload flow</p>
                  <p>
                    New selections preview instantly in the browser with an object URL. When you save, the file is uploaded and stored on disk under this client&apos;s own logo folder, then the saved relative path is written to the database.
                  </p>
                  {values.logoPath ? <p>Current saved path: <span className="font-mono">{values.logoPath}</span></p> : null}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center justify-center rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                >
                  Browse files
                </button>
                {selectedLogoName || logoPreviewUrl ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLogoName("");
                      setSelectedLogoFile(null);
                      if (logoPreviewUrl.startsWith("blob:")) {
                        URL.revokeObjectURL(logoPreviewUrl);
                      }
                      setLogoPreviewUrl(values.logoPath);
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
          <Field label="Address line 1" name="addressLine1" value={values.addressLine1} onChange={(event) => updateValue("addressLine1", event.target.value)} placeholder="4850 Industrial Loop" />
          <Field label="Address line 2" name="addressLine2" value={values.addressLine2} onChange={(event) => updateValue("addressLine2", event.target.value)} placeholder="Suite 400" />
          <Field label="City" name="city" value={values.city} onChange={(event) => updateValue("city", event.target.value)} placeholder="Dallas" />
          <Field label="State" name="state" value={values.state} onChange={(event) => updateValue("state", event.target.value)} placeholder="TX" />
          <Field label="ZIP / postal code" name="zipCode" value={values.zipCode} onChange={(event) => updateValue("zipCode", event.target.value)} placeholder="75247" />
          <Field label="Country" name="country" value={values.country} onChange={(event) => updateValue("country", event.target.value)} placeholder="USA" />
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-800">Communication</h2>
          <p className="mt-1 text-sm text-gray-500">Primary business channels for the client account.</p>
        </div>
        <div className="grid gap-4 p-5 md:grid-cols-2">
          <Field label="Main phone" name="phone" value={values.phone} onChange={(event) => updateValue("phone", event.target.value)} placeholder="(214) 555-0143" />
          <Field label="Mobile" name="mobile" value={values.mobile} onChange={(event) => updateValue("mobile", event.target.value)} placeholder="(214) 555-0198" />
          <Field label="WhatsApp" name="whatsapp" value={values.whatsapp} onChange={(event) => updateValue("whatsapp", event.target.value)} placeholder="+1 214 555 0198" />
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

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-800">Primary contact</h2>
          <p className="mt-1 text-sm text-gray-500">Who Mission Control should treat as the lead contact for this account.</p>
        </div>
        <div className="grid gap-4 p-5 md:grid-cols-2">
          <Field label="Contact name" name="primaryContactName" value={values.primaryContactName} onChange={(event) => updateValue("primaryContactName", event.target.value)} placeholder="Melissa Grant" />
          <Field label="Contact title" name="primaryContactTitle" value={values.primaryContactTitle} onChange={(event) => updateValue("primaryContactTitle", event.target.value)} placeholder="Director of Operations" />
          <Field label="Contact email" name="primaryContactEmail" type="email" value={values.primaryContactEmail} onChange={(event) => updateValue("primaryContactEmail", event.target.value)} placeholder="melissa.grant@northstarlg.com" />
          <Field label="Contact phone" name="primaryContactPhone" value={values.primaryContactPhone} onChange={(event) => updateValue("primaryContactPhone", event.target.value)} placeholder="(214) 555-0143" />
        </div>
      </div>

      {error ? <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/clients"
          className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center rounded-md bg-[#405189] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#364474] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (mode === "create" ? "Creating client..." : "Saving changes...") : mode === "create" ? "Create client" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

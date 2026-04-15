"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, InputHTMLAttributes, useEffect, useMemo, useState } from "react";
import DatePicker from "@/components/DatePicker";
import RichTextEditor from "@/components/RichTextEditor";
import SearchableSelect from "@/components/SearchableSelect";
import { formatEnumLabel, projectPriorityOptions, projectStatusOptions } from "@/lib/projects";

type ProjectFormValues = {
  name: string;
  clientId: string;
  requesterId: string;
  status: string;
  priority: string;
  description: string;
  estimatedPrice: string;
  finalPrice: string;
  startDate: string;
  dueDate: string;
};

const defaultValues: ProjectFormValues = {
  name: "",
  clientId: "",
  requesterId: "",
  status: "planned",
  priority: "medium",
  description: "",
  estimatedPrice: "",
  finalPrice: "",
  startDate: "",
  dueDate: "",
};

function Field({ label, hint, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return <label className="block space-y-1.5"><span className="text-sm font-medium text-gray-700">{label}</span><input {...props} className="form-control" />{hint ? <span className="block text-xs text-gray-500">{hint}</span> : null}</label>;
}

export default function ProjectForm({ mode, projectId, initialValues, clients }: { mode: "create" | "edit"; projectId?: string; initialValues?: Partial<ProjectFormValues>; clients: Array<{ id: string; companyName: string; employees: Array<{ id: string; name: string; title: string | null; email: string | null; status: string }> }>; }) {
  const router = useRouter();
  const [values, setValues] = useState<ProjectFormValues>({ ...defaultValues, ...initialValues });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const endpoint = useMemo(() => (mode === "create" ? "/api/projects" : `/api/projects/${projectId}`), [mode, projectId]);
  const method = mode === "create" ? "POST" : "PATCH";

  const clientOptions = clients.map((client) => ({ value: client.id, label: client.companyName, description: `${client.employees.length} employees` }));
  const selectedClient = clients.find((client) => client.id === values.clientId);
  const requesterOptions = (selectedClient?.employees || [])
    .filter((employee) => employee.status === "active")
    .map((employee) => ({ value: employee.id, label: employee.name, description: [employee.title, employee.email].filter(Boolean).join(" • ") || "Active employee" }));

  useEffect(() => {
    if (values.requesterId && !requesterOptions.some((option) => option.value === values.requesterId)) {
      setValues((current) => ({ ...current, requesterId: "" }));
    }
  }, [requesterOptions, values.requesterId]);

  function updateValue<K extends keyof ProjectFormValues>(key: K, value: ProjectFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => formData.set(key, value));

    const response = await fetch(endpoint, { method, body: formData });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(data.error || `Unable to ${mode} project.`);
      setSaving(false);
      return;
    }

    router.push(`/projects/${data.project.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4"><h2 className="text-sm font-semibold text-gray-800">Project details</h2><p className="mt-1 text-sm text-gray-500">Create a usable project record with financials, ownership, and milestone planning.</p></div>
        <div className="grid gap-4 p-5 md:grid-cols-2">
          <div className="md:col-span-2"><Field label="Project name" name="name" value={values.name} onChange={(event) => updateValue("name", event.target.value)} placeholder="Warehouse Mobility Rollout" required /></div>
          <SearchableSelect label="Client" placeholder="Select a client" searchPlaceholder="Search clients..." emptyMessage="No clients matched." value={values.clientId} onChange={(value) => updateValue("clientId", value)} options={clientOptions} hint="Searchable selector for the owning client workspace." />
          <SearchableSelect label="Requester" placeholder={values.clientId ? "Select a requester" : "Choose a client first"} searchPlaceholder="Search requester..." emptyMessage={values.clientId ? "No active employees matched." : "Select a client first."} value={values.requesterId} onChange={(value) => updateValue("requesterId", value)} options={requesterOptions} disabled={!values.clientId} hint="Only active employees for the selected client are shown." />
          <label className="block space-y-1.5"><span className="text-sm font-medium text-gray-700">Status</span><select value={values.status} onChange={(event) => updateValue("status", event.target.value)} className="form-select">{projectStatusOptions.map((option) => <option key={option} value={option}>{formatEnumLabel(option)}</option>)}</select></label>
          <label className="block space-y-1.5"><span className="text-sm font-medium text-gray-700">Priority</span><select value={values.priority} onChange={(event) => updateValue("priority", event.target.value)} className="form-select">{projectPriorityOptions.map((option) => <option key={option} value={option}>{formatEnumLabel(option)}</option>)}</select></label>
          <Field label="Estimated price" name="estimatedPrice" value={values.estimatedPrice} onChange={(event) => updateValue("estimatedPrice", event.target.value)} placeholder="48500.00" />
          <Field label="Final price" name="finalPrice" value={values.finalPrice} onChange={(event) => updateValue("finalPrice", event.target.value)} placeholder="51250.00" />
          <DatePicker label="Start date" value={values.startDate} onChange={(value) => updateValue("startDate", value)} />
          <DatePicker label="Due date" value={values.dueDate} onChange={(value) => updateValue("dueDate", value)} />
          <div className="md:col-span-2 space-y-1.5"><span className="block text-sm font-medium text-gray-700">Description</span><RichTextEditor value={values.description} onChange={(value) => updateValue("description", value)} /><span className="block text-xs text-gray-500">WYSIWYG project scope using a full Quill editor.</span></div>
        </div>
      </div>

      {error ? <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Link href={mode === "create" ? "/projects" : `/projects/${projectId}`} className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50">Cancel</Link><button type="submit" disabled={saving} className="inline-flex items-center justify-center rounded-md bg-[#405189] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#364474] disabled:cursor-not-allowed disabled:opacity-60">{saving ? (mode === "create" ? "Creating project..." : "Saving changes...") : mode === "create" ? "Create project" : "Save changes"}</button></div>
    </form>
  );
}

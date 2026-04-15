"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, InputHTMLAttributes, useState } from "react";
import DatePicker from "@/components/DatePicker";
import { formatEnumLabel, milestoneStatusOptions } from "@/lib/projects";

type MilestoneFormValues = {
  title: string;
  description: string;
  status: string;
  dueDate: string;
  estimatedPrice: string;
  finalPrice: string;
};

const defaultValues: MilestoneFormValues = {
  title: "",
  description: "",
  status: "planned",
  dueDate: "",
  estimatedPrice: "",
  finalPrice: "",
};

const editableStatuses = milestoneStatusOptions.filter((s) => s !== "archived");

function Field({ label, hint, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return <label className="block space-y-1.5"><span className="text-sm font-medium text-gray-700">{label}</span><input {...props} className="form-control" />{hint ? <span className="block text-xs text-gray-500">{hint}</span> : null}</label>;
}

export default function MilestoneForm({ mode, projectId, milestoneId, initialValues }: { mode: "create" | "edit"; projectId: string; milestoneId?: string; initialValues?: Partial<MilestoneFormValues> }) {
  const router = useRouter();
  const [values, setValues] = useState<MilestoneFormValues>({ ...defaultValues, ...initialValues });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const endpoint = mode === "create" ? `/api/projects/${projectId}/milestones` : `/api/projects/${projectId}/milestones/${milestoneId}`;
  const method = mode === "create" ? "POST" : "PATCH";

  function updateValue<K extends keyof MilestoneFormValues>(key: K, value: MilestoneFormValues[K]) {
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
      setError(data.error || `Unable to ${mode} milestone.`);
      setSaving(false);
      return;
    }

    router.push(`/projects/${projectId}/milestones`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4"><h2 className="text-sm font-semibold text-gray-800">Milestone details</h2><p className="mt-1 text-sm text-gray-500">Define what this milestone delivers and when it is due.</p></div>
        <div className="grid gap-4 p-5 md:grid-cols-2">
          <div className="md:col-span-2"><Field label="Title" name="title" value={values.title} onChange={(event) => updateValue("title", event.target.value)} placeholder="Pilot deployment" required /></div>
          <label className="block space-y-1.5"><span className="text-sm font-medium text-gray-700">Status</span><select value={values.status} onChange={(event) => updateValue("status", event.target.value)} className="form-select">{editableStatuses.map((option) => <option key={option} value={option}>{formatEnumLabel(option)}</option>)}</select></label>
          <DatePicker label="Due date" value={values.dueDate} onChange={(value) => updateValue("dueDate", value)} />
          <Field label="Estimated price" name="estimatedPrice" value={values.estimatedPrice} onChange={(event) => updateValue("estimatedPrice", event.target.value)} placeholder="16000.00" />
          <Field label="Final price" name="finalPrice" value={values.finalPrice} onChange={(event) => updateValue("finalPrice", event.target.value)} placeholder="15800.00" />
          <label className="block space-y-1.5 md:col-span-2"><span className="text-sm font-medium text-gray-700">Description</span><textarea value={values.description} onChange={(event) => updateValue("description", event.target.value)} rows={4} placeholder="What does this milestone deliver?" className="form-control" /></label>
        </div>
      </div>

      {error ? <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Link href={`/projects/${projectId}/milestones`} className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50">Cancel</Link><button type="submit" disabled={saving} className="inline-flex items-center justify-center rounded-md bg-[#405189] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#364474] disabled:cursor-not-allowed disabled:opacity-60">{saving ? (mode === "create" ? "Creating..." : "Saving...") : mode === "create" ? "Create milestone" : "Save changes"}</button></div>
    </form>
  );
}

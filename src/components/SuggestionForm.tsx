"use client";

import type { ChangeEvent, DragEvent, FormEvent } from "react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Paperclip, Upload } from "lucide-react";
import { suggestionEffortOptions, suggestionImpactOptions, suggestionStatusOptions } from "@/lib/suggestions";

type ClientOption = { id: string; companyName: string };
type Attachment = { id: string; fileName: string; filePath: string; mimeType: string | null; fileSize: number; createdAt: string };

type Values = {
  title: string;
  body: string;
  status: string;
  category: string;
  area: string;
  impact: string;
  effort: string;
  whyItMatters: string;
  expectedOutcome: string;
  clientId: string;
  linkedProject: string;
  decisionNotes: string;
};

const defaultValues: Values = {
  title: "",
  body: "",
  status: "new",
  category: "",
  area: "",
  impact: "",
  effort: "",
  whyItMatters: "",
  expectedOutcome: "",
  clientId: "",
  linkedProject: "",
  decisionNotes: "",
};

function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="form-control" />
    </label>
  );
}

function Textarea({ label, value, onChange, placeholder, rows = 4 }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; rows?: number }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={rows} className="form-control" />
    </label>
  );
}

export default function SuggestionForm({
  mode,
  suggestionId,
  clients,
  initialValues,
  existingAttachments = [],
}: {
  mode: "create" | "edit";
  suggestionId?: string;
  clients: ClientOption[];
  initialValues?: Partial<Values>;
  existingAttachments?: Attachment[];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState<Values>({ ...defaultValues, ...initialValues });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const endpoint = useMemo(() => (mode === "create" ? "/api/suggestions" : `/api/suggestions/${suggestionId}`), [mode, suggestionId]);
  const method = mode === "create" ? "POST" : "PATCH";

  function updateValue<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function addFiles(files: FileList | File[] | null | undefined) {
    if (!files) return;
    const nextFiles = Array.from(files);
    setSelectedFiles((current) => [...current, ...nextFiles]);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    addFiles(event.dataTransfer.files);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => formData.append(key, value));
    selectedFiles.forEach((file) => formData.append("attachments", file));

    const response = await fetch(endpoint, { method, body: formData });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(data.error || `Unable to ${mode} suggestion.`);
      setSaving(false);
      return;
    }

    const nextId = suggestionId ?? data.suggestion?.id;
    router.push(nextId ? `/suggestions/${nextId}` : "/suggestions");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-800">Suggestion details</h2>
          <p className="mt-1 text-sm text-gray-500">Capture the idea, context, and the decision path in one record.</p>
        </div>
        <div className="grid gap-4 p-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <Input label="Title" value={values.title} onChange={(value) => updateValue("title", value)} placeholder="Standardize a client handoff checklist" />
          </div>
          <div className="md:col-span-2">
            <Textarea label="Suggestion" value={values.body} onChange={(value) => updateValue("body", value)} rows={6} placeholder="Describe the idea, current pain, and what should change." />
          </div>
          <Input label="Category" value={values.category} onChange={(value) => updateValue("category", value)} placeholder="Operations" />
          <Input label="Area / module" value={values.area} onChange={(value) => updateValue("area", value)} placeholder="Client onboarding" />
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-gray-700">Status</span>
            <select value={values.status} onChange={(event) => updateValue("status", event.target.value)} className="form-select">
              {suggestionStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-gray-700">Linked client</span>
            <select value={values.clientId} onChange={(event) => updateValue("clientId", event.target.value)} className="form-select">
              <option value="">No linked client</option>
              {clients.map((client) => <option key={client.id} value={client.id}>{client.companyName}</option>)}
            </select>
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-gray-700">Impact</span>
            <select value={values.impact} onChange={(event) => updateValue("impact", event.target.value)} className="form-select">
              <option value="">Select impact</option>
              {suggestionImpactOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-gray-700">Effort</span>
            <select value={values.effort} onChange={(event) => updateValue("effort", event.target.value)} className="form-select">
              <option value="">Select effort</option>
              {suggestionEffortOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <Input label="Linked project" value={values.linkedProject} onChange={(value) => updateValue("linkedProject", value)} placeholder="Q2 onboarding refresh" />
          <div className="md:col-span-2">
            <Textarea label="Why this matters" value={values.whyItMatters} onChange={(value) => updateValue("whyItMatters", value)} placeholder="Explain the business case or operational pain." />
          </div>
          <div className="md:col-span-2">
            <Textarea label="Expected outcome" value={values.expectedOutcome} onChange={(value) => updateValue("expectedOutcome", value)} placeholder="What should improve if this gets implemented?" />
          </div>
          <div className="md:col-span-2">
            <Textarea label="Decision notes" value={values.decisionNotes} onChange={(value) => updateValue("decisionNotes", value)} placeholder="Capture review notes, decision rationale, or implementation notes." />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-800">Attachments</h2>
          <p className="mt-1 text-sm text-gray-500">Upload screenshots, documents, or reference files with the suggestion.</p>
        </div>
        <div className="space-y-4 p-5">
          <label
            onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
            onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
            onDragLeave={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false);
            }}
            onDrop={handleDrop}
            className={`flex cursor-pointer flex-col gap-4 rounded-lg border border-dashed p-4 transition ${dragging ? "border-[#405189] bg-[#405189]/5 ring-2 ring-[#405189]/15" : "border-gray-300 bg-white hover:border-[#405189]/60 hover:bg-gray-50"}`}
          >
            <input ref={fileInputRef} type="file" multiple className="sr-only" onChange={(event: ChangeEvent<HTMLInputElement>) => addFiles(event.target.files)} />
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-[#405189]/10 p-2 text-[#405189]"><Upload className="h-5 w-5" /></div>
              <div>
                <p className="text-sm font-medium text-gray-700">Drop docs or images here</p>
                <p className="mt-1 text-xs text-gray-500">PDF, DOCX, PNG, JPG, WebP, and similar files can be attached to the record.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex items-center justify-center rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50">Browse files</button>
            </div>
          </label>

          {existingAttachments.length > 0 ? (
            <div>
              <h3 className="mb-2 text-sm font-medium text-gray-700">Existing attachments</h3>
              <div className="space-y-2">
                {existingAttachments.map((attachment) => (
                  <a key={attachment.id} href={attachment.filePath} target="_blank" className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:border-[#405189] hover:text-[#405189]" rel="noreferrer">
                    <span className="inline-flex items-center gap-2"><Paperclip size={14} /> {attachment.fileName}</span>
                    <span className="text-xs text-gray-500">{Math.max(1, Math.round(attachment.fileSize / 1024))} KB</span>
                  </a>
                ))}
              </div>
            </div>
          ) : null}

          {selectedFiles.length > 0 ? (
            <div>
              <h3 className="mb-2 text-sm font-medium text-gray-700">Files to upload</h3>
              <div className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <div key={`${file.name}-${index}`} className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                    <span className="inline-flex items-center gap-2"><FileText size={14} /> {file.name}</span>
                    <button type="button" className="text-xs text-gray-500 hover:text-rose-600" onClick={() => setSelectedFiles((current) => current.filter((_, currentIndex) => currentIndex !== index))}>Remove</button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {error ? <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link href={mode === "create" ? "/suggestions" : `/suggestions/${suggestionId}`} className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50">Cancel</Link>
        <button type="submit" disabled={saving} className="inline-flex items-center justify-center rounded-md bg-[#405189] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#364474] disabled:cursor-not-allowed disabled:opacity-60">{saving ? (mode === "create" ? "Creating suggestion..." : "Saving changes...") : mode === "create" ? "Create suggestion" : "Save changes"}</button>
      </div>
    </form>
  );
}

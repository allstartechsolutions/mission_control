"use client";

import { FormEvent, useMemo, useState } from "react";
import { formatDateTime, formatMinutes } from "@/lib/tasks";

type TimeEntry = {
  id: string;
  startedAt: string | Date;
  endedAt: string | Date;
  minutes: number;
  note: string | null;
  createdAt: string | Date;
  recordedBy?: { name: string | null; email: string } | null;
};

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function getDefaultStartTime() {
  return new Date().toTimeString().slice(0, 5);
}

export default function TaskTimePanel({ taskId, entries, totalMinutes }: { taskId: string; entries: TimeEntry[]; totalMinutes: number }) {
  const [entryDate, setEntryDate] = useState(getToday());
  const [startTime, setStartTime] = useState(getDefaultStartTime());
  const [minutes, setMinutes] = useState("30");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const sortedEntries = useMemo(() => [...entries].sort((a, b) => +new Date(b.startedAt) - +new Date(a.startedAt)), [entries]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const formData = new FormData();
    formData.set("entryDate", entryDate);
    formData.set("startTime", startTime);
    formData.set("minutes", minutes);
    formData.set("note", note);

    const response = await fetch(`/api/tasks/${taskId}/time-entries`, { method: "POST", body: formData });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(data.error || "Unable to save time entry.");
      setSaving(false);
      return;
    }

    window.location.reload();
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
        <div className="font-semibold">Total tracked time</div>
        <div className="mt-1 text-lg">{formatMinutes(totalMinutes)}</div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">Add manual time entry</h3>
          <p className="mt-1 text-xs text-gray-500">This phase records clean manual history only. No live timers yet.</p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <label className="block space-y-1.5"><span className="text-sm font-medium text-gray-700">Date</span><input type="date" value={entryDate} onChange={(event) => setEntryDate(event.target.value)} className="form-control" required /></label>
          <label className="block space-y-1.5"><span className="text-sm font-medium text-gray-700">Start time</span><input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} className="form-control" required /></label>
          <label className="block space-y-1.5"><span className="text-sm font-medium text-gray-700">Minutes</span><input type="number" min="1" step="1" value={minutes} onChange={(event) => setMinutes(event.target.value)} className="form-control" required /></label>
        </div>
        <label className="block space-y-1.5"><span className="text-sm font-medium text-gray-700">Note</span><textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} className="form-control" placeholder="What was done during this block?" /></label>
        {error ? <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
        <div className="flex justify-end"><button type="submit" disabled={saving} className="inline-flex items-center justify-center rounded-md bg-[#405189] px-4 py-2 text-sm font-medium text-white hover:bg-[#364474] disabled:cursor-not-allowed disabled:opacity-60">{saving ? "Saving..." : "Save time entry"}</button></div>
      </form>

      <div className="space-y-3">
        {sortedEntries.length ? sortedEntries.map((entry) => (
          <article key={entry.id} className="rounded-xl border border-gray-200 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-gray-800">{formatMinutes(entry.minutes)}</div>
                <div className="mt-1 text-sm text-gray-600">{formatDateTime(entry.startedAt)} to {formatDateTime(entry.endedAt)}</div>
                <div className="mt-1 text-xs text-gray-400">Logged by {entry.recordedBy?.name || entry.recordedBy?.email || "system"} • Added {formatDateTime(entry.createdAt)}</div>
              </div>
            </div>
            {entry.note ? <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">{entry.note}</div> : null}
          </article>
        )) : <p className="text-sm text-gray-500">No time entries yet.</p>}
      </div>
    </div>
  );
}

"use client";

import { Pencil, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState, useTransition } from "react";
import { formatDateTime, formatDateTimeLocalValue, formatMinutes, formatTimerState, getTimerElapsedMinutes } from "@/lib/tasks";

type TimeEntry = {
  id: string;
  startedAt: string | Date;
  endedAt: string | Date;
  minutes: number;
  note: string | null;
  createdAt: string | Date;
  recordedBy?: { name: string | null; email: string } | null;
};

type EditDraft = {
  startedAt: string;
  endedAt: string;
  minutes: string;
  note: string;
};

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function getDefaultStartTime() {
  return new Date().toTimeString().slice(0, 5);
}

function buildEditDraft(entry: TimeEntry): EditDraft {
  return {
    startedAt: formatDateTimeLocalValue(entry.startedAt),
    endedAt: formatDateTimeLocalValue(entry.endedAt),
    minutes: String(entry.minutes),
    note: entry.note || "",
  };
}

function syncMinutesFromRange(startedAt: string, endedAt: string) {
  const start = new Date(startedAt);
  const end = new Date(endedAt);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end.getTime() <= start.getTime()) return "";
  return String(Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000)));
}

function syncEndFromMinutes(startedAt: string, minutes: string) {
  const start = new Date(startedAt);
  const duration = Number(minutes);
  if (Number.isNaN(start.getTime()) || !Number.isInteger(duration) || duration < 1) return "";
  return formatDateTimeLocalValue(new Date(start.getTime() + (duration * 60 * 1000)));
}

export default function TaskTimePanel({
  taskId,
  entries,
  timerState,
  timerStartedAt,
  timerStartedBy,
}: {
  taskId: string;
  entries: TimeEntry[];
  timerState: "idle" | "running" | "paused";
  timerStartedAt?: string | Date | null;
  timerStartedBy?: { name: string | null; email: string } | null;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [entryDate, setEntryDate] = useState(getToday());
  const [startTime, setStartTime] = useState(getDefaultStartTime());
  const [minutes, setMinutes] = useState("30");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<EditDraft | null>(null);
  const [localEntries, setLocalEntries] = useState(entries);
  const [liveSeconds, setLiveSeconds] = useState(0);

  useEffect(() => {
    setLocalEntries(entries);
  }, [entries]);

  useEffect(() => {
    if (timerState !== "running" || !timerStartedAt) {
      setLiveSeconds(0);
      return;
    }

    const update = () => {
      const started = new Date(timerStartedAt);
      if (Number.isNaN(started.getTime())) {
        setLiveSeconds(0);
        return;
      }
      setLiveSeconds(Math.max(0, Math.floor((Date.now() - started.getTime()) / 1000)));
    };

    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [timerStartedAt, timerState]);

  const sortedEntries = useMemo(() => [...localEntries].sort((a, b) => +new Date(b.startedAt) - +new Date(a.startedAt)), [localEntries]);
  const localTotalMinutes = useMemo(() => localEntries.reduce((sum, entry) => sum + entry.minutes, 0), [localEntries]);
  const liveMinutes = timerState === "running" && timerStartedAt ? getTimerElapsedMinutes(timerStartedAt) : 0;
  const displayedTotalMinutes = localTotalMinutes + liveMinutes;
  const liveTimerLabel = useMemo(() => {
    const hours = Math.floor(liveSeconds / 3600);
    const mins = Math.floor((liveSeconds % 3600) / 60);
    const secs = liveSeconds % 60;
    return [hours, mins, secs].map((value) => String(value).padStart(2, "0")).join(":");
  }, [liveSeconds]);

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

  async function handleTimerAction(action: "start" | "pause" | "resume" | "stop") {
    setSaving(true);
    setError("");

    const response = await fetch(`/api/tasks/${taskId}/timer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(data.error || "Unable to update timer.");
      setSaving(false);
      return;
    }

    window.location.reload();
  }

  async function handleDelete(entryId: string) {
    if (!window.confirm("Delete this time entry? This cannot be undone.")) return;
    setDeletingId(entryId);
    setError("");

    const previousEntries = localEntries;
    setLocalEntries((current) => current.filter((entry) => entry.id !== entryId));

    const response = await fetch(`/api/tasks/${taskId}/time-entries/${entryId}`, { method: "DELETE" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setLocalEntries(previousEntries);
      setError(data.error || "Unable to delete time entry.");
      setDeletingId(null);
      return;
    }

    setDeletingId(null);
    startTransition(() => {
      router.refresh();
    });
  }

  function beginEdit(entry: TimeEntry) {
    setEditingId(entry.id);
    setEditDraft(buildEditDraft(entry));
    setError("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditDraft(null);
  }

  async function handleEditSave(entryId: string) {
    if (!editDraft) return;
    setSaving(true);
    setError("");

    const formData = new FormData();
    formData.set("startedAt", editDraft.startedAt);
    formData.set("endedAt", editDraft.endedAt);
    formData.set("minutes", editDraft.minutes);
    formData.set("note", editDraft.note);

    const response = await fetch(`/api/tasks/${taskId}/time-entries/${entryId}`, { method: "PATCH", body: formData });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(data.error || "Unable to update time entry.");
      setSaving(false);
      return;
    }

    setLocalEntries((current) => current.map((entry) => entry.id === entryId ? data.entry : entry));
    setSaving(false);
    cancelEdit();
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
        <div className="font-semibold">Total tracked time</div>
        <div className="mt-1 text-lg">{formatMinutes(displayedTotalMinutes)}</div>
        <div className="mt-1 text-xs text-emerald-800">Timer: {formatTimerState(timerState)}{timerState === "running" && timerStartedAt ? ` • ${formatMinutes(liveMinutes)} in current session` : ""}</div>
      </div>

      <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Live task timer</h3>
            <p className="mt-1 text-xs text-gray-500">Use start, pause, resume, and stop to capture real work sessions automatically.</p>
            {timerState === "running" && timerStartedAt ? <p className="mt-2 text-xs text-gray-600">Started {formatDateTime(timerStartedAt)} by {timerStartedBy?.name || timerStartedBy?.email || "system"}</p> : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {timerState === "idle" ? <button type="button" onClick={() => handleTimerAction("start")} disabled={saving} className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60">Start timer</button> : null}
            {timerState === "running" ? <>
              <button type="button" onClick={() => handleTimerAction("pause")} disabled={saving} className="inline-flex items-center justify-center rounded-md border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60">Pause</button>
              <button type="button" onClick={() => handleTimerAction("stop")} disabled={saving} className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60">Stop</button>
            </> : null}
            {timerState === "paused" ? <>
              <button type="button" onClick={() => handleTimerAction("resume")} disabled={saving} className="inline-flex items-center justify-center rounded-md bg-[#405189] px-4 py-2 text-sm font-medium text-white hover:bg-[#364474] disabled:cursor-not-allowed disabled:opacity-60">Resume</button>
              <button type="button" onClick={() => handleTimerAction("stop")} disabled={saving} className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60">Stop</button>
            </> : null}
          </div>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 px-4 py-4">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Current session</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 tabular-nums">{timerState === "running" ? liveTimerLabel : "00:00:00"}</div>
          <div className="mt-1 text-xs text-gray-500">Updates live in the browser while the timer is running.</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">Add manual time entry</h3>
          <p className="mt-1 text-xs text-gray-500">Manual entries still work for cleanup, backfill, and non-timer work.</p>
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
        {sortedEntries.length ? sortedEntries.map((entry) => {
          const isEditing = editingId === entry.id && !!editDraft;
          return (
            <article key={entry.id} className="rounded-xl border border-gray-200 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-gray-800">{formatMinutes(entry.minutes)}</div>
                  <div className="mt-1 text-sm text-gray-600">{formatDateTime(entry.startedAt)} to {formatDateTime(entry.endedAt)}</div>
                  <div className="mt-1 text-xs text-gray-400">Logged by {entry.recordedBy?.name || entry.recordedBy?.email || "system"} • Added {formatDateTime(entry.createdAt)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => isEditing ? cancelEdit() : beginEdit(entry)}
                    disabled={saving}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                    title={isEditing ? "Cancel editing" : "Edit time entry"}
                    aria-label={isEditing ? "Cancel editing" : "Edit time entry"}
                  >
                    {isEditing ? <X size={15} /> : <Pencil size={15} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(entry.id)}
                    disabled={deletingId === entry.id || saving}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-rose-200 text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                    title={deletingId === entry.id ? "Deleting time entry" : "Delete time entry"}
                    aria-label={deletingId === entry.id ? "Deleting time entry" : "Delete time entry"}
                  >
                    <Trash2 size={15} className={deletingId === entry.id ? "animate-pulse" : undefined} />
                  </button>
                </div>
              </div>
              {entry.note ? <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">{entry.note}</div> : null}
              {isEditing && editDraft ? (
                <div className="mt-4 rounded-xl border border-[#405189]/15 bg-[#405189]/5 p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold text-gray-800">Edit time entry</div>
                      <p className="mt-1 text-xs text-gray-500">Start, end, and minutes stay in sync so totals remain clean.</p>
                    </div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    <label className="block space-y-1.5 md:col-span-1"><span className="text-sm font-medium text-gray-700">Start</span><input type="datetime-local" value={editDraft.startedAt} onChange={(event) => {
                      const startedAt = event.target.value;
                      setEditDraft((current) => current ? { ...current, startedAt, endedAt: current.minutes ? syncEndFromMinutes(startedAt, current.minutes) || current.endedAt : current.endedAt } : current);
                    }} className="form-control" required /></label>
                    <label className="block space-y-1.5 md:col-span-1"><span className="text-sm font-medium text-gray-700">End</span><input type="datetime-local" value={editDraft.endedAt} onChange={(event) => {
                      const endedAt = event.target.value;
                      setEditDraft((current) => current ? { ...current, endedAt, minutes: syncMinutesFromRange(current.startedAt, endedAt) || current.minutes } : current);
                    }} className="form-control" required /></label>
                    <label className="block space-y-1.5 md:col-span-1"><span className="text-sm font-medium text-gray-700">Minutes</span><input type="number" min="1" step="1" value={editDraft.minutes} onChange={(event) => {
                      const nextMinutes = event.target.value;
                      setEditDraft((current) => current ? { ...current, minutes: nextMinutes, endedAt: syncEndFromMinutes(current.startedAt, nextMinutes) || current.endedAt } : current);
                    }} className="form-control" required /></label>
                  </div>
                  <label className="mt-3 block space-y-1.5"><span className="text-sm font-medium text-gray-700">Note</span><textarea value={editDraft.note} onChange={(event) => setEditDraft((current) => current ? { ...current, note: event.target.value } : current)} rows={3} className="form-control" placeholder="Update what was done during this block." /></label>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs text-gray-500">Saved duration: {editDraft.minutes || "0"} minute{editDraft.minutes === "1" ? "" : "s"}</div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={cancelEdit} disabled={saving} className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60">Cancel</button>
                      <button type="button" onClick={() => handleEditSave(entry.id)} disabled={saving} className="inline-flex items-center justify-center rounded-md bg-[#405189] px-4 py-2 text-sm font-medium text-white hover:bg-[#364474] disabled:cursor-not-allowed disabled:opacity-60">{saving ? "Saving..." : "Save changes"}</button>
                    </div>
                  </div>
                </div>
              ) : null}
            </article>
          );
        }) : <p className="text-sm text-gray-500">No time entries yet.</p>}
      </div>
    </div>
  );
}

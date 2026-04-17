"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Plus } from "lucide-react";
import TaskTagChip from "@/components/TaskTagChip";

type Tag = { id: string; name: string };

export default function InlineTaskTags({ taskId, tags, availableTags }: { taskId: string; tags: Tag[]; availableTags: Tag[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const currentNames = tags.map((tag) => tag.name);

  const suggestions = availableTags
    .map((tag) => tag.name)
    .filter((name) => !currentNames.some((current) => current.toLowerCase() === name.toLowerCase()));

  async function saveTags(names: string[]) {
    setSaving(true);
    const response = await fetch(`/api/tasks/${taskId}/tags`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tagNames: names.join(", ") }),
    });

    setSaving(false);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      window.alert(data.error || "Unable to update tags.");
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  }

  function handleRemove(name: string) {
    const updated = currentNames.filter((n) => n.toLowerCase() !== name.toLowerCase());
    saveTags(updated);
  }

  function handleAdd() {
    const value = inputValue.trim();
    if (!value) return;

    const newNames = value.split(",").map((s) => s.trim()).filter(Boolean);
    const merged = [...currentNames];
    for (const name of newNames) {
      if (!merged.some((n) => n.toLowerCase() === name.toLowerCase())) {
        merged.push(name);
      }
    }

    setInputValue("");
    setEditing(false);
    saveTags(merged);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAdd();
    }
    if (event.key === "Escape") {
      setInputValue("");
      setEditing(false);
    }
  }

  function startEditing() {
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <TaskTagChip key={tag.id} name={tag.name} onRemove={() => handleRemove(tag.name)} />
        ))}
        {!editing ? (
          <button
            type="button"
            onClick={startEditing}
            disabled={saving}
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-500 hover:border-[#405189] hover:text-[#405189] disabled:opacity-60"
          >
            <Plus size={12} />
            {tags.length ? "Add" : "Add tags"}
          </button>
        ) : null}
      </div>
      {editing ? (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => { if (!inputValue.trim()) setEditing(false); }}
              list="inline-tag-suggestions"
              placeholder="Type tag name..."
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-[#405189] focus:ring-2 focus:ring-[#405189]/15"
            />
            <datalist id="inline-tag-suggestions">
              {suggestions.map((name) => <option key={name} value={name} />)}
            </datalist>
          </div>
          <button type="button" onClick={handleAdd} disabled={!inputValue.trim() || saving} className="rounded-md bg-[#405189] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#364474] disabled:opacity-60">
            {saving ? "Saving..." : "Add"}
          </button>
          <button type="button" onClick={() => { setInputValue(""); setEditing(false); }} className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
        </div>
      ) : null}
    </div>
  );
}

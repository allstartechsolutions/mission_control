"use client";

import { useMemo } from "react";
import TaskTagChip from "@/components/TaskTagChip";

type TagOption = { id: string; name: string };

export default function TaskTagsInput({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: TagOption[] }) {
  const suggestions = useMemo(() => Array.from(new Map(options.map((option) => [option.name.toLowerCase(), option.name])).values()), [options]);

  const parsedTags = useMemo(() => value.split(",").map((s) => s.trim()).filter(Boolean), [value]);

  function removeTag(index: number) {
    const updated = parsedTags.filter((_, i) => i !== index);
    onChange(updated.join(", "));
  }

  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-gray-700">Tags</span>
      {parsedTags.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {parsedTags.map((tag, index) => (
            <TaskTagChip key={`${tag}-${index}`} name={tag} onRemove={() => removeTag(index)} />
          ))}
        </div>
      ) : null}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        list="task-tag-suggestions"
        placeholder="network, urgent, onsite"
        className="form-control"
      />
      <datalist id="task-tag-suggestions">
        {suggestions.map((tag) => <option key={tag} value={tag} />)}
      </datalist>
      <span className="block text-xs text-gray-500">Comma-separated. Existing tags autocomplete, and new ones are created safely on save.</span>
    </label>
  );
}

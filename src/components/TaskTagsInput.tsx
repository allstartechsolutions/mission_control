"use client";

import { useMemo } from "react";

type TagOption = { id: string; name: string };

export default function TaskTagsInput({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: TagOption[] }) {
  const suggestions = useMemo(() => Array.from(new Map(options.map((option) => [option.name.toLowerCase(), option.name])).values()), [options]);

  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-gray-700">Tags</span>
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

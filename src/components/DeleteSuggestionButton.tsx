"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

type DeleteSuggestionButtonProps = {
  suggestionId: string;
  suggestionTitle: string;
  variant?: "icon" | "full";
  redirectTo?: string;
  className?: string;
};

export default function DeleteSuggestionButton({
  suggestionId,
  suggestionTitle,
  variant = "icon",
  redirectTo,
  className = "",
}: DeleteSuggestionButtonProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    if (deleting) return;

    const confirmed = window.confirm(`Delete \"${suggestionTitle}\"? This will permanently remove the suggestion and its attachments.`);
    if (!confirmed) return;

    setDeleting(true);
    setError("");

    try {
      const response = await fetch(`/api/suggestions/${suggestionId}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error || "Unable to delete suggestion.");
        setDeleting(false);
        return;
      }

      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.refresh();
      }
      router.refresh();
    } catch {
      setError("Unable to delete suggestion.");
      setDeleting(false);
    }
  }

  if (variant === "full") {
    return (
      <div className="space-y-2">
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className={`inline-flex w-full items-center justify-center gap-2 rounded-md border border-rose-200 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60 ${className}`.trim()}
        >
          <Trash2 size={15} />
          {deleting ? "Deleting..." : "Delete suggestion"}
        </button>
        {error ? <p className="text-xs text-rose-600">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="space-y-1 text-right">
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className={`inline-flex h-8 w-8 items-center justify-center rounded-md border border-rose-200 text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60 ${className}`.trim()}
        title="Delete suggestion"
        aria-label={`Delete ${suggestionTitle}`}
      >
        <Trash2 size={15} />
      </button>
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}

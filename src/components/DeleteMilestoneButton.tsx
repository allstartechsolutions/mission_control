"use client";

import { Archive, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function DeleteMilestoneButton({
  projectId,
  milestoneId,
  milestoneTitle,
  hasLinkedTasks,
  variant = "button",
}: {
  projectId: string;
  milestoneId: string;
  milestoneTitle: string;
  hasLinkedTasks: boolean;
  variant?: "button" | "icon";
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    const message = hasLinkedTasks
      ? `Archive milestone "${milestoneTitle}"? It has linked tasks, so Mission Control will archive it instead of deleting it.`
      : `Delete milestone "${milestoneTitle}"? This cannot be undone.`;
    if (!window.confirm(message)) return;

    setIsDeleting(true);
    const response = await fetch(`/api/projects/${projectId}/milestones/${milestoneId}`, { method: "DELETE" });
    const data = await response.json().catch(() => ({}));
    setIsDeleting(false);

    if (!response.ok) {
      window.alert(data.error || "Unable to remove milestone.");
      return;
    }

    if (data.message) {
      window.alert(data.message);
    }

    startTransition(() => {
      router.push(`/projects/${projectId}/milestones`);
      router.refresh();
    });
  }

  const disabled = isDeleting || isPending;
  const label = hasLinkedTasks ? (disabled ? "Archiving..." : "Archive milestone") : (disabled ? "Deleting..." : "Delete milestone");
  const Icon = hasLinkedTasks ? Archive : Trash2;

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleDelete}
        disabled={disabled}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-red-200 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
        title={label}
        aria-label={label}
      >
        <Icon size={15} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Icon size={15} />
      {label}
    </button>
  );
}

"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function DeleteTaskButton({
  taskId,
  taskTitle,
  variant = "icon",
}: {
  taskId: string;
  taskTitle: string;
  variant?: "icon" | "button";
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(`Delete task "${taskTitle}"? This cannot be undone.`);
    if (!confirmed) return;

    setIsDeleting(true);
    const response = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    setIsDeleting(false);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      window.alert(data.error || "Unable to delete task.");
      return;
    }

    startTransition(() => {
      router.push("/tasks");
      router.refresh();
    });
  }

  const disabled = isDeleting || isPending;

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={handleDelete}
        disabled={disabled}
        className="inline-flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Trash2 size={15} />
        {disabled ? "Deleting..." : "Delete task"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={disabled}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-red-200 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
      title="Delete task"
      aria-label="Delete task"
    >
      <Trash2 size={15} />
    </button>
  );
}

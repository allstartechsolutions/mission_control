"use client";

import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function CompleteTaskButton({
  taskId,
  taskTitle,
  variant = "icon",
  disabled = false,
}: {
  taskId: string;
  taskTitle: string;
  variant?: "icon" | "button";
  disabled?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function handleComplete() {
    const response = await fetch(`/api/tasks/${taskId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed" }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      window.alert(data.error || `Unable to mark \"${taskTitle}\" complete.`);
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  }

  const isDisabled = disabled || isPending;

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={handleComplete}
        disabled={isDisabled}
        className="inline-flex items-center gap-2 rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Check size={15} />
        {isPending ? "Completing..." : "Complete task"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleComplete}
      disabled={isDisabled}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-sm ring-1 ring-inset ring-white/20 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
      title="Complete task"
      aria-label="Complete task"
    >
      <Check size={15} />
    </button>
  );
}

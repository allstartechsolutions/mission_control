"use client";

import { Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function DispatchTaskButton({
  taskId,
  disabled = false,
}: {
  taskId: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [isRunning, setIsRunning] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleDispatch() {
    setIsRunning(true);
    const response = await fetch(`/api/tasks/${taskId}/dispatch`, {
      method: "POST",
    });
    setIsRunning(false);

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      window.alert(data.error || "Unable to dispatch task.");
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  }

  const isDisabled = disabled || isRunning || isPending;

  return (
    <button
      type="button"
      onClick={handleDispatch}
      disabled={isDisabled}
      className="inline-flex items-center gap-2 rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Play size={15} />
      {isRunning || isPending ? "Dispatching..." : "Dispatch task"}
    </button>
  );
}

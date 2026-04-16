"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function BoardLiveRefresh({ projectId }: { projectId: string }) {
  const router = useRouter();
  const refreshTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const source = new EventSource(`/api/tasks/stream?projectId=${encodeURIComponent(projectId)}`);
    const scheduleRefresh = () => {
      if (refreshTimeout.current) return;
      refreshTimeout.current = setTimeout(() => {
        refreshTimeout.current = null;
        router.refresh();
      }, 250);
    };

    source.addEventListener("task-update", scheduleRefresh);
    source.addEventListener("error", scheduleRefresh);

    return () => {
      if (refreshTimeout.current) clearTimeout(refreshTimeout.current);
      source.close();
    };
  }, [projectId, router]);

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
      <span className="h-2 w-2 rounded-full bg-emerald-500" />
      Live board updates on
    </div>
  );
}

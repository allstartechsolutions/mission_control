"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Flag, GripVertical, ListFilter, Milestone, Plus } from "lucide-react";
import TaskStatusBadge from "@/components/TaskStatusBadge";
import { formatTaskLabel } from "@/lib/tasks";

type BoardTask = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  dueLabel: string;
  assignee: string;
  milestoneId: string | null;
  milestoneTitle: string | null;
  columnId: string;
  columnName: string;
};

type BoardColumn = {
  id: string;
  key: string;
  name: string;
  color: string | null;
  taskCount: number;
};

type MilestoneLens = {
  id: string;
  title: string;
  status: string;
  taskCount: number;
};

const columnStyles: Record<string, string> = {
  slate: "border-slate-200 bg-slate-50",
  sky: "border-sky-200 bg-sky-50",
  indigo: "border-indigo-200 bg-indigo-50",
  rose: "border-rose-200 bg-rose-50",
  emerald: "border-emerald-200 bg-emerald-50",
};

export default function ProjectBoard({
  projectId,
  columns,
  tasks,
  milestones,
}: {
  projectId: string;
  columns: BoardColumn[];
  tasks: BoardTask[];
  milestones: MilestoneLens[];
}) {
  const router = useRouter();
  const [selectedMilestone, setSelectedMilestone] = useState<string>("all");
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [droppingColumnId, setDroppingColumnId] = useState<string | null>(null);
  const [moving, setMoving] = useState<string | null>(null);

  const filteredTasks = useMemo(() => {
    if (selectedMilestone === "all") return tasks;
    if (selectedMilestone === "none") return tasks.filter((task) => !task.milestoneId);
    return tasks.filter((task) => task.milestoneId === selectedMilestone);
  }, [selectedMilestone, tasks]);

  const noMilestoneCount = useMemo(() => tasks.filter((task) => !task.milestoneId).length, [tasks]);
  const activeMilestoneLabel = selectedMilestone === "all"
    ? "All tasks"
    : selectedMilestone === "none"
      ? "No milestone only"
      : milestones.find((item) => item.id === selectedMilestone)?.title || "Milestone";

  async function moveTask(taskId: string, columnId: string) {
    setMoving(taskId);
    const targetIndex = filteredTasks.filter((task) => task.columnId === columnId && task.id !== taskId).length;
    const response = await fetch(`/api/projects/${projectId}/board`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, columnId, targetIndex }),
    });
    setMoving(null);
    setDraggingTaskId(null);
    setDroppingColumnId(null);
    if (!response.ok) return;
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-3 py-1.5 ring-1 ring-inset ring-gray-200"><Milestone size={13} /> {activeMilestoneLabel}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-3 py-1.5 ring-1 ring-inset ring-gray-200"><Flag size={13} /> Board column is separate from task status</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Tasks on board</div>
                <div className="mt-1 text-lg font-semibold text-gray-900">{tasks.length}</div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Milestones</div>
                <div className="mt-1 text-lg font-semibold text-gray-900">{milestones.length}</div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">No milestone</div>
                <div className="mt-1 text-lg font-semibold text-gray-900">{noMilestoneCount}</div>
              </div>
            </div>
          </div>
          <Link href={`/tasks/new?projectId=${projectId}${columns[0] ? `&boardColumnId=${columns[0].id}` : ""}`} className="inline-flex items-center justify-center gap-2 rounded-md bg-[#405189] px-3 py-2 text-sm font-medium text-white hover:bg-[#364474]">
            <Plus size={15} /> Add task
          </Link>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
            <ListFilter size={15} className="text-gray-500" />
            Milestone filter
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setSelectedMilestone("all")} className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm ${selectedMilestone === "all" ? "border-[#405189]/25 bg-[#405189]/10 text-[#405189]" : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"}`}>
              <span className="font-medium">All project tasks</span>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-gray-700 ring-1 ring-inset ring-gray-200">{tasks.length}</span>
            </button>
            {milestones.map((milestone) => (
              <button key={milestone.id} onClick={() => setSelectedMilestone(milestone.id)} className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm ${selectedMilestone === milestone.id ? "border-[#405189]/25 bg-[#405189]/10 text-[#405189]" : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"}`}>
                <span className="font-medium">{milestone.title}</span>
                <span className="text-xs text-gray-500">{formatTaskLabel(milestone.status)}</span>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-gray-700 ring-1 ring-inset ring-gray-200">{milestone.taskCount}</span>
              </button>
            ))}
            <button onClick={() => setSelectedMilestone("none")} className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm ${selectedMilestone === "none" ? "border-[#405189]/25 bg-[#405189]/10 text-[#405189]" : "border-dashed border-gray-300 bg-white text-gray-700 hover:border-gray-400"}`}>
              <span className="font-medium">No Milestone</span>
              <span className="text-xs text-gray-500">Loose project tasks</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 ring-1 ring-inset ring-slate-200">{noMilestoneCount}</span>
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-5">
        {columns.map((column) => {
          const columnTasks = filteredTasks.filter((task) => task.columnId === column.id);
          return (
            <div
              key={column.id}
              onDragOver={(event) => {
                event.preventDefault();
                setDroppingColumnId(column.id);
              }}
              onDragLeave={() => setDroppingColumnId((current) => (current === column.id ? null : current))}
              onDrop={(event) => {
                event.preventDefault();
                const taskId = event.dataTransfer.getData("text/taskId");
                if (taskId) void moveTask(taskId, column.id);
              }}
              className={`rounded-xl border p-3 shadow-sm ${columnStyles[column.color || "slate"] || columnStyles.slate} ${droppingColumnId === column.id ? "ring-2 ring-[#405189]/30" : ""}`}
            >
              <div className="mb-3 flex items-center justify-between rounded-lg bg-white px-3 py-2 ring-1 ring-inset ring-gray-200">
                <h3 className="text-sm font-semibold text-gray-800">{column.name}</h3>
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">{columnTasks.length}</span>
              </div>
              <div className="min-h-24 space-y-3">
                {columnTasks.map((task) => (
                  <article
                    key={task.id}
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.setData("text/taskId", task.id);
                      setDraggingTaskId(task.id);
                    }}
                    onDragEnd={() => {
                      setDraggingTaskId(null);
                      setDroppingColumnId(null);
                    }}
                    className={`rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md ${draggingTaskId === task.id || moving === task.id ? "opacity-60" : ""}`}
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2">
                        <GripVertical size={16} className="mt-0.5 text-gray-300" />
                        <div>
                          <Link href={`/tasks/${task.id}`} className="text-sm font-semibold text-gray-900 hover:text-[#405189] hover:underline">{task.title}</Link>
                          <p className="mt-1 text-xs leading-5 text-gray-500">{task.description || "No additional notes yet."}</p>
                        </div>
                      </div>
                      <TaskStatusBadge status={task.status} />
                    </div>
                    <div className="flex flex-wrap gap-2 text-[11px] text-gray-600">
                      <span className="rounded-full bg-slate-100 px-2 py-1 ring-1 ring-inset ring-slate-200">{task.milestoneTitle || "No Milestone"}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-1 ring-1 ring-inset ring-slate-200">{task.assignee}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-1 ring-1 ring-inset ring-slate-200">Due {task.dueLabel}</span>
                    </div>
                  </article>
                ))}
                {columnTasks.length === 0 ? <div className="rounded-xl border border-dashed border-gray-300 bg-white/70 px-4 py-8 text-center text-xs text-gray-500">Drop a card here.</div> : null}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}

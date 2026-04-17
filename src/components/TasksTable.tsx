"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, Circle, Eye, Pencil, Play, Plus, Search } from "lucide-react";
import DeleteTaskButton from "@/components/DeleteTaskButton";
import TaskStatusBadge from "@/components/TaskStatusBadge";
import TaskTagChip from "@/components/TaskTagChip";
import { formatMinutes, formatTaskLabel, getExecutorBehavior } from "@/lib/tasks";

type TaskRow = {
  id: string;
  title: string;
  clientName: string;
  projectName: string;
  assignedToName: string;
  requesterName: string;
  status: string;
  executorType: string;
  dueDate: string;
  dueDateLabel: string;
  amount: string;
  billableLabel: string;
  tagLabel: string;
  tagNames: string[];
  totalTrackedMinutes: number;
  isOverdue: boolean;
  isDueToday: boolean;
  isAssignedToMe: boolean;
  isCreatedByMe: boolean;
  createdAtLabel: string;
  nextStepLabel: string;
  cronEnabled: boolean;
  cronExpression: string | null;
  lastRunStatus: string | null;
  lastRunAt: string | null;
};

type TaskViewKey = "today" | "scheduled" | "waiting" | "failed" | "completed" | "overdue" | "assigned" | "created" | "all";

const viewDefinitions: Array<{ key: TaskViewKey; label: string; description: string }> = [
  { key: "today", label: "Today", description: "Everything due today plus active items already in motion." },
  { key: "scheduled", label: "Scheduled", description: "Planned work that still needs to start." },
  { key: "waiting", label: "Waiting", description: "Blocked items that need a follow-up or response." },
  { key: "failed", label: "Failed", description: "Execution attempts that ended in failure and need review or a rerun." },
  { key: "completed", label: "Completed", description: "Done items for quick review and cleanup." },
  { key: "overdue", label: "Overdue", description: "Past-due tasks that still need attention." },
  { key: "assigned", label: "Assigned to me", description: "Your working queue across statuses." },
  { key: "created", label: "Requested by me", description: "Tasks you created and are tracking." },
  { key: "all", label: "All tasks", description: "Full task list with search and triage controls." },
];

function matchesView(task: TaskRow, view: TaskViewKey) {
  switch (view) {
    case "today":
      return task.isDueToday || (task.status === "in_progress" && !task.isOverdue);
    case "scheduled":
      return task.status === "scheduled";
    case "waiting":
      return task.status === "waiting";
    case "failed":
      return task.status === "failed";
    case "completed":
      return task.status === "completed";
    case "overdue":
      return task.isOverdue;
    case "assigned":
      return task.isAssignedToMe;
    case "created":
      return task.isCreatedByMe;
    case "all":
    default:
      return true;
  }
}

function getQuickActions(task: TaskRow) {
  const behavior = getExecutorBehavior(task.executorType);

  if (task.status === "scheduled") {
    return [{ status: "in_progress", label: behavior.scheduledAction, icon: Play }];
  }

  if (task.status === "in_progress") {
    return [
      { status: "waiting", label: "Waiting", icon: Circle },
      { status: "failed", label: "Mark failed", icon: AlertTriangle },
      { status: "completed", label: behavior.completedAction, icon: Check },
    ];
  }

  if (task.status === "waiting") {
    return [
      { status: "in_progress", label: task.executorType === "human" ? "Resume" : behavior.scheduledAction, icon: Play },
      { status: "failed", label: "Mark failed", icon: AlertTriangle },
      { status: "completed", label: behavior.completedAction, icon: Check },
    ];
  }

  if (task.status === "failed") {
    return [{ status: "in_progress", label: task.executorType === "human" ? "Retry" : behavior.scheduledAction, icon: Play }];
  }

  if (task.status === "completed") {
    return [{ status: "in_progress", label: task.executorType === "human" ? "Reopen" : behavior.scheduledAction, icon: Play }];
  }

  return [];
}

export default function TasksTable({ tasks }: { tasks: TaskRow[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeView, setActiveView] = useState<TaskViewKey>("today");
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const counts = useMemo(() => Object.fromEntries(viewDefinitions.map((view) => [view.key, tasks.filter((task) => matchesView(task, view.key)).length])) as Record<TaskViewKey, number>, [tasks]);

  const filteredTasks = useMemo(() => {
    const term = query.trim().toLowerCase();
    return tasks
      .filter((task) => matchesView(task, activeView))
      .filter((task) => {
        if (!term) return true;
        return [
          task.title,
          task.clientName,
          task.projectName,
          task.assignedToName,
          task.requesterName,
          task.status,
          task.executorType,
          task.billableLabel,
          task.tagLabel,
          task.nextStepLabel,
          task.cronExpression || "",
        ]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(term));
      });
  }, [activeView, query, tasks]);

  const activeDefinition = viewDefinitions.find((view) => view.key === activeView) || viewDefinitions[0];

  async function updateTaskStatus(task: TaskRow, status: string) {
    setPendingTaskId(task.id);
    const response = await fetch(`/api/tasks/${task.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    setPendingTaskId(null);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      window.alert(data.error || "Unable to update task status.");
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">Operational task views</h2>
            <p className="text-sm text-gray-500">Use focused queues to run the day, then search inside the current view.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-80">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${activeDefinition.label.toLowerCase()}...`} className="w-full rounded-md border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-700 outline-none focus:border-[#405189] focus:bg-white" />
            </div>
            <Link href="/tasks/new" className="inline-flex items-center justify-center gap-2 rounded-md bg-[#405189] px-3 py-2 text-sm font-medium text-white hover:bg-[#364474]">
              <Plus size={16} />
              New task
            </Link>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {viewDefinitions.map((view) => {
            const isActive = view.key === activeView;
            return (
              <button
                key={view.key}
                type="button"
                onClick={() => setActiveView(view.key)}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition ${isActive ? "bg-[#405189] text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                <span>{view.label}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs ${isActive ? "bg-white/15 text-white" : "bg-white text-gray-600"}`}>{counts[view.key]}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          <span className="font-medium text-gray-800">{activeDefinition.label}:</span> {activeDefinition.description}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-4 py-3">Task</th>
                <th className="px-4 py-3">Client / project</th>
                <th className="px-4 py-3">Ownership</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Due</th>
                <th className="px-4 py-3">Next move</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredTasks.map((task) => {
                const quickActions = getQuickActions(task);
                return (
                  <tr key={task.id} className={task.isOverdue ? "bg-rose-50/40 hover:bg-rose-50" : "hover:bg-gray-50/80"}>
                    <td className="px-4 py-4 align-top">
                      <div className="flex flex-col gap-1.5">
                        <Link href={`/tasks/${task.id}`} className="font-semibold text-gray-800 hover:text-[#405189]">{task.title}</Link>
                        <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                          <span>{formatTaskLabel(task.executorType)}</span>
                          {task.cronEnabled ? <><span>•</span><span className="font-medium text-emerald-700">Scheduled</span></> : null}
                          <span>•</span>
                          <span>{task.billableLabel === "Yes" ? task.amount : "Internal / non-billable"}</span>
                          <span>•</span>
                          <span>{formatMinutes(task.totalTrackedMinutes)} tracked</span>
                          {task.tagNames.length ? <><span>•</span>{task.tagNames.map((name) => <TaskTagChip key={name} name={name} />)}</> : null}
                          {task.isAssignedToMe ? <><span>•</span><span className="font-medium text-[#405189]">Assigned to me</span></> : null}
                          {task.isCreatedByMe ? <><span>•</span><span>Created by me</span></> : null}
                          {task.lastRunStatus ? <><span>•</span><span className={task.lastRunStatus === "failed" ? "font-medium text-rose-600" : "font-medium text-emerald-700"}>Last run {formatTaskLabel(task.lastRunStatus)}</span></> : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top text-gray-600">
                      <div>{task.clientName}</div>
                      <div className="mt-1 text-xs text-gray-400">{task.projectName}</div>
                    </td>
                    <td className="px-4 py-4 align-top text-gray-600">
                      <div>{task.assignedToName}</div>
                      <div className="mt-1 text-xs text-gray-400">Requester: {task.requesterName}</div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex flex-col gap-2">
                        <TaskStatusBadge status={task.status} />
                        {quickActions.length ? (
                          <div className="flex flex-wrap gap-1.5">
                            {quickActions.map((action) => {
                              const Icon = action.icon;
                              return (
                                <button
                                  key={action.status}
                                  type="button"
                                  disabled={pendingTaskId === task.id}
                                  onClick={() => updateTaskStatus(task, action.status)}
                                  className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:border-[#405189] hover:text-[#405189] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  <Icon size={13} />
                                  {action.label}
                                </button>
                              );
                            })}
                          </div>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top text-gray-600">
                      <div className={task.isOverdue ? "font-semibold text-rose-600" : task.isDueToday ? "font-semibold text-amber-600" : ""}>{task.dueDateLabel}</div>
                      <div className="mt-1 text-xs text-gray-400">Created {task.createdAtLabel}</div>
                    </td>
                    <td className="px-4 py-4 align-top text-gray-600">
                      <div>{task.nextStepLabel}</div>
                      {task.lastRunAt ? <div className="mt-1 text-xs text-gray-400">Latest run update {task.lastRunAt}</div> : null}
                      {task.cronEnabled && task.cronExpression ? <div className="mt-1 text-xs text-emerald-700">{task.cronExpression}</div> : null}
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex justify-end gap-1.5">
                        <Link href={`/tasks/${task.id}`} className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#405189] text-white hover:bg-[#364474]" title="Open task"><Eye size={15} /></Link>
                        <Link href={`/tasks/${task.id}/edit`} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:border-[#405189] hover:text-[#405189]" title="Edit task"><Pencil size={15} /></Link>
                        <DeleteTaskButton taskId={task.id} taskTitle={task.title} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredTasks.length === 0 ? <div className="border-t border-gray-100 px-4 py-10 text-center text-sm text-gray-500">No tasks matched this operational view.</div> : null}
      </div>
    </div>
  );
}

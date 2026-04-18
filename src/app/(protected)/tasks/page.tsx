import { unstable_noStore as noStore } from "next/cache";
import { BriefcaseBusiness, CircleDollarSign, ListChecks, TriangleAlert } from "lucide-react";
import TaskLiveRefresh from "@/components/TaskLiveRefresh";
import TasksTable from "@/components/TasksTable";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildTaskNextStepLabel, describeCronSchedule, formatCurrency, formatDate, formatDateTime, formatTaskLabel } from "@/lib/tasks";

export const dynamic = "force-dynamic";

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function formatRelativeCreatedDate(value: Date) {
  const createdAt = startOfDay(value).getTime();
  const today = startOfDay(new Date()).getTime();
  const diffDays = Math.round((today - createdAt) / 86400000);

  if (diffDays <= 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDate(value);
}

export default async function TasksPage() {
  noStore();
  const session = await auth();
  const currentUserId = session?.user?.id;
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  const tasks = await prisma.task.findMany({
    include: {
      client: { select: { companyName: true } },
      project: { select: { name: true } },
      assignedTo: { select: { id: true, name: true, email: true } },
      requesterEmployee: { select: { name: true } },
      createdBy: { select: { id: true } },
      tagAssignments: { include: { tag: true }, orderBy: { createdAt: "asc" } },
      timeEntries: { select: { minutes: true } },
      taskRuns: {
        select: { status: true, updatedAt: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: [{ dueDate: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }],
  });

  const openTasks = tasks.filter((task) => task.status !== "completed" && task.status !== "canceled").length;
  const failedTasks = tasks.filter((task) => task.status === "failed").length;
  const billableValue = tasks.reduce((sum, task) => sum + Number(task.amount || 0), 0);
  const overdueTasks = tasks.filter((task) => task.status !== "completed" && task.status !== "canceled" && task.dueDate && new Date(task.dueDate) < todayStart).length;
  const dueToday = tasks.filter((task) => task.status !== "completed" && task.status !== "canceled" && task.dueDate && new Date(task.dueDate) >= todayStart && new Date(task.dueDate) <= todayEnd).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div>
            <h1 className="text-lg font-semibold text-gray-800">Tasks</h1>
            <nav className="text-sm text-gray-400"><span className="text-[#405189]">Mission Control</span><span className="mx-2">&rsaquo;</span><span>Tasks</span></nav>
          </div>
          <TaskLiveRefresh />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Open tasks</p><div className="mt-1 flex items-center gap-2 text-gray-800"><ListChecks size={18} className="text-[#405189]" /><p className="text-2xl font-semibold">{openTasks}</p></div></div>
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Due today</p><div className="mt-1 flex items-center gap-2 text-gray-800"><TriangleAlert size={18} className="text-amber-500" /><p className="text-2xl font-semibold">{dueToday}</p></div></div>
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Failed</p><div className="mt-1 flex items-center gap-2 text-gray-800"><BriefcaseBusiness size={18} className="text-rose-500" /><p className="text-2xl font-semibold">{failedTasks}</p></div></div>
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Overdue</p><div className="mt-1 flex items-center gap-2 text-gray-800"><TriangleAlert size={18} className="text-amber-700" /><p className="text-2xl font-semibold">{overdueTasks}</p></div></div>
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Billable tracked</p><div className="mt-1 flex items-center gap-2 text-gray-800"><CircleDollarSign size={18} className="text-emerald-600" /><p className="text-sm font-semibold">{formatCurrency(billableValue)}</p></div></div>
        </div>
      </div>

      <TasksTable tasks={tasks.map((task) => {
        const isClosed = task.status === "completed" || task.status === "canceled";
        const isOverdue = !isClosed && !!task.dueDate && new Date(task.dueDate) < todayStart;
        const isDueToday = !isClosed && !!task.dueDate && new Date(task.dueDate) >= todayStart && new Date(task.dueDate) <= todayEnd;
        return {
          id: task.id,
          title: task.title,
          clientName: task.client?.companyName || "Standalone",
          projectName: task.project?.name || "No linked project",
          assignedToName: task.assignedTo.name || task.assignedTo.email,
          requesterName: task.requesterEmployee?.name || "Optional",
          status: task.status,
          executorType: task.executorType,
          dueDate: formatDate(task.dueDate),
          dueDateLabel: isOverdue ? `${formatDate(task.dueDate)} · overdue` : isDueToday ? `${formatDate(task.dueDate)} · today` : formatDate(task.dueDate),
          amount: task.billable ? `${formatTaskLabel(task.billingType)}${task.amount ? ` • ${formatCurrency(task.amount)}` : ""}` : "Not billable",
          tagLabel: task.tagAssignments.map((assignment) => assignment.tag.name).join(", "),
          tagNames: task.tagAssignments.map((assignment) => assignment.tag.name),
          totalTrackedMinutes: task.timeEntries.reduce((sum, entry) => sum + entry.minutes, 0),
          billableLabel: task.billable ? "Yes" : "No",
          isOverdue,
          isDueToday,
          isAssignedToMe: currentUserId ? task.assignedTo.id === currentUserId : false,
          isCreatedByMe: currentUserId ? task.createdBy.id === currentUserId : false,
          createdAtLabel: formatRelativeCreatedDate(task.createdAt),
          nextStepLabel: buildTaskNextStepLabel(task),
          cronEnabled: task.cronEnabled,
          cronExpression: task.cronExpression ? describeCronSchedule(task.cronExpression, task.cronTimezone) : null,
          lastRunStatus: task.taskRuns[0]?.status || null,
          lastRunAt: task.taskRuns[0] ? formatDateTime(task.taskRuns[0].updatedAt) : null,
        };
      })} />
    </div>
  );
}

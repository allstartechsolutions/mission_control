import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, CalendarDays, CircleDollarSign, FileText, Link2, Workflow } from "lucide-react";
import InlineTaskTags from "@/components/InlineTaskTags";
import TaskLiveRefresh from "@/components/TaskLiveRefresh";
import TaskStatusBadge from "@/components/TaskStatusBadge";
import TaskTimePanel from "@/components/TaskTimePanel";
import TaskWorkspaceShell, { TaskMetaCard, TaskStats } from "@/components/TaskWorkspaceShell";
import { prisma } from "@/lib/prisma";
import { describeCronSchedule, formatCurrency, formatDate, formatDateTime, formatMinutes, formatTaskLabel, getExecutorBehavior, isNonHumanExecutor } from "@/lib/tasks";

export const dynamic = "force-dynamic";

function formatRunStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  noStore();
  const { id } = await params;
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      assignedTo: { select: { name: true, email: true } },
      createdBy: { select: { name: true, email: true } },
      client: { select: { id: true, companyName: true } },
      project: { select: { id: true, name: true } },
      milestone: { select: { id: true, title: true } },
      requesterEmployee: { select: { name: true, title: true, email: true } },
      tagAssignments: { include: { tag: true }, orderBy: { createdAt: "asc" } },
      timeEntries: { orderBy: { startedAt: "desc" }, include: { recordedBy: { select: { name: true, email: true } } } },
      taskRuns: {
        include: {
          initiatedByUser: { select: { name: true, email: true } },
          events: { orderBy: { createdAt: "desc" }, take: 8 },
        },
        orderBy: { createdAt: "desc" },
        take: 8,
      },
      taskEvents: {
        where: { runId: null },
        orderBy: { createdAt: "desc" },
        take: 12,
      },
    },
  });

  if (!task) notFound();

  const availableTags = await prisma.taskTag.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });
  const executorBehavior = getExecutorBehavior(task.executorType);
  const showSchedule = isNonHumanExecutor(task.executorType);
  const latestRun = task.taskRuns[0] || null;
  const totalTrackedMinutes = task.timeEntries.reduce((sum, entry) => sum + entry.minutes, 0);

  return (
    <TaskWorkspaceShell
      activeTab="overview"
      task={{
        id: task.id,
        title: task.title,
        status: task.status,
        executorType: task.executorType,
        assignedToName: task.assignedTo.name || task.assignedTo.email,
        dueDate: formatDate(task.dueDate),
        clientName: task.client?.companyName || "Standalone",
        projectName: task.project?.name || "No linked project",
        canDispatch: task.executorType !== "human" && task.status !== "completed" && task.status !== "canceled",
      }}
      liveBadge={<TaskLiveRefresh taskId={task.id} />}
    >
      <div className="grid gap-6 xl:grid-cols-2">
        <TaskMetaCard title="Task brief" icon={FileText}>
          {task.description ? <p className="whitespace-pre-wrap text-sm text-gray-700">{task.description}</p> : <p className="text-sm text-gray-500">No description yet.</p>}
        </TaskMetaCard>
        <TaskMetaCard title="Task snapshot" icon={CalendarDays}>
          <TaskStats items={[
            { label: "Assigned to", value: task.assignedTo.name || task.assignedTo.email },
            { label: "Created by", value: task.createdBy.name || task.createdBy.email },
            { label: "Status", value: formatTaskLabel(task.status) },
            { label: "Executor type", value: formatTaskLabel(task.executorType) },
            { label: "Start date", value: formatDate(task.startDate) },
            { label: "Due date", value: formatDate(task.dueDate) },
            { label: "Requester", value: task.requesterEmployee?.name || "Not set" },
            { label: "Requester details", value: [task.requesterEmployee?.title, task.requesterEmployee?.email].filter(Boolean).join(" • ") || "Not set" },
          ]} />
        </TaskMetaCard>
        <TaskMetaCard title="Execution behavior" icon={Workflow}>
          <div className="space-y-4">
            <div className="rounded-lg border border-[#405189]/10 bg-[#405189]/5 px-4 py-3 text-sm text-gray-700">
              <div className="font-semibold text-[#405189]">{executorBehavior.label}</div>
              <p className="mt-1">{executorBehavior.summary}</p>
            </div>
            <TaskStats items={[
              { label: "Start action", value: executorBehavior.scheduledAction },
              { label: "Active state", value: executorBehavior.inProgressAction },
              { label: "Waiting state", value: executorBehavior.waitingAction },
              { label: "Failure state", value: executorBehavior.failedAction },
              { label: "Completion state", value: executorBehavior.completedAction },
            ]} />
            {showSchedule ? (
              <TaskStats items={[
                { label: "Schedule linked", value: task.cronEnabled ? "Yes" : "No" },
                { label: "Schedule", value: describeCronSchedule(task.cronExpression, task.cronTimezone) },
                { label: "Timezone", value: task.cronTimezone || "Not configured" },
                { label: "Next scheduled run", value: formatDateTime(task.cronNextRunAt) },
                { label: "Last run", value: formatDateTime(task.cronLastRunAt) },
                { label: "Latest execution", value: latestRun ? `${formatRunStatus(latestRun.status)} • ${formatDateTime(latestRun.updatedAt)}` : "No run history yet" },
              ]} />
            ) : (
              <div className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-500">Human tasks stay manual, so cron linkage is intentionally hidden here.</div>
            )}
          </div>
        </TaskMetaCard>
        <TaskMetaCard title="Billing" icon={CircleDollarSign}>
          <TaskStats items={[
            { label: "Billable", value: task.billable ? "Yes" : "No" },
            { label: "Billing type", value: task.billable ? formatTaskLabel(task.billingType) : "Not billable" },
            { label: "Amount", value: task.billable ? formatCurrency(task.amount) : "Not billable" },
            { label: "Tracked time", value: formatMinutes(totalTrackedMinutes) },
            { label: "Billed status", value: task.billedAt ? `Billed ${formatDate(task.billedAt)}` : "Not billed yet" },
          ]} />
        </TaskMetaCard>
        <TaskMetaCard title="Tags and linked records" icon={Link2}>
          <div className="space-y-4">
            <div className="rounded-lg bg-gray-50 px-4 py-3">
              <div className="mb-2 text-sm font-medium text-gray-700">Tags</div>
              <InlineTaskTags taskId={task.id} tags={task.tagAssignments.map((a) => a.tag)} availableTags={availableTags} />
            </div>
            <TaskStats items={[
              { label: "Client", value: task.client?.companyName || "Standalone" },
              { label: "Project", value: task.project?.name || "Not linked" },
              { label: "Milestone", value: task.milestone?.title || "Not linked" },
              { label: "Created at", value: formatDate(task.createdAt) },
            ]} />
            <div className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-600">
              <div className="mb-2 font-medium text-gray-700">Current status</div>
              <TaskStatusBadge status={task.status} />
            </div>
          </div>
        </TaskMetaCard>
        <TaskMetaCard title="Time tracking" icon={CalendarDays}>
          <TaskTimePanel taskId={task.id} entries={task.timeEntries} totalMinutes={totalTrackedMinutes} />
        </TaskMetaCard>
        <TaskMetaCard title="Execution runs" icon={AlertTriangle}>
          <div className="space-y-4">
            {task.taskRuns.length ? task.taskRuns.map((run) => (
              <article key={run.id} className="rounded-xl border border-gray-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">{formatTaskLabel(run.trigger)}</span>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${run.status === "failed" ? "bg-rose-100 text-rose-700" : run.status === "succeeded" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{formatRunStatus(run.status)}</span>
                    </div>
                    <div className="mt-2 text-sm font-medium text-gray-800">{run.summary || "Execution recorded"}</div>
                    <div className="mt-1 text-xs text-gray-500">Started {formatDateTime(run.startedAt || run.createdAt)} • Finished {formatDateTime(run.finishedAt)} • By {run.initiatedByUser?.name || run.initiatedByUser?.email || "system"}</div>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <div>Exit code: {run.exitCode ?? "—"}</div>
                    {run.logPath ? <div className="mt-1 break-all">Log file: {run.logPath}</div> : null}
                  </div>
                </div>
                {run.errorMessage ? <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{run.errorMessage}</div> : null}
                {run.events.length ? (
                  <div className="mt-3 space-y-2">
                    {run.events.map((event) => (
                      <div key={event.id} className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-medium text-gray-800">{event.message}</span>
                          <span className="text-xs text-gray-400">{formatDateTime(event.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </article>
            )) : <p className="text-sm text-gray-500">No task runs yet.</p>}
          </div>
        </TaskMetaCard>
        <TaskMetaCard title="Task activity" icon={CalendarDays}>
          <div className="space-y-3">
            {task.taskEvents.length ? task.taskEvents.map((event) => (
              <div key={event.id} className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-700">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-gray-800">{event.message}</span>
                  <span className="text-xs text-gray-400">{formatDateTime(event.createdAt)}</span>
                </div>
                <div className="mt-1 text-xs uppercase tracking-wide text-gray-400">{event.eventType}</div>
              </div>
            )) : <p className="text-sm text-gray-500">No standalone task events yet.</p>}
            <Link href="/tasks" className="inline-flex text-sm font-medium text-[#405189] hover:underline">Back to task list</Link>
          </div>
        </TaskMetaCard>
      </div>
    </TaskWorkspaceShell>
  );
}

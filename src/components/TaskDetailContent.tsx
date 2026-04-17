import Link from "next/link";
import { AlertTriangle, CalendarDays, CircleDollarSign, FileText, Link2, Workflow } from "lucide-react";
import InlineTaskTags from "@/components/InlineTaskTags";
import TaskStatusBadge from "@/components/TaskStatusBadge";
import TaskTimePanel from "@/components/TaskTimePanel";
import { TaskMetaCard, TaskStats } from "@/components/TaskWorkspaceShell";
import { describeCronSchedule, formatCurrency, formatDate, formatDateTime, formatMinutes, formatTaskLabel, formatTimerState, getExecutorBehavior, getTimerElapsedMinutes, isNonHumanExecutor } from "@/lib/tasks";

type TaskDetailRecord = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  executorType: string;
  startDate: Date | null;
  dueDate: Date;
  billable: boolean;
  billingType: string;
  amount: any;
  billedAt: Date | null;
  cronEnabled: boolean | null;
  cronExpression: string | null;
  cronTimezone: string | null;
  cronNextRunAt: Date | null;
  cronLastRunAt: Date | null;
  createdAt: Date;
  timerState: "idle" | "running" | "paused";
  timerStartedAt: Date | null;
  assignedTo: { name: string | null; email: string };
  createdBy: { name: string | null; email: string };
  client: { id: string; companyName: string } | null;
  project: { id: string; name: string } | null;
  milestone: { id: string; title: string } | null;
  requesterEmployee: { name: string | null; title: string | null; email: string | null } | null;
  timerStartedBy: { name: string | null; email: string } | null;
  tagAssignments: Array<{ tag: { id: string; name: string } }>;
  timeEntries: Array<{ id: string; createdAt: Date; startedAt: Date; endedAt: Date; minutes: number; note: string | null; recordedBy: { name: string | null; email: string } | null }>;
  taskRuns: Array<{ id: string; trigger: string; status: string; summary: string | null; startedAt: Date | null; createdAt: Date; finishedAt: Date | null; updatedAt: Date; errorMessage: string | null; exitCode: number | null; logPath: string | null; initiatedByUser: { name: string | null; email: string } | null; events: Array<{ id: string; message: string; createdAt: Date }> }>;
  taskEvents: Array<{ id: string; message: string; createdAt: Date; eventType: string }>;
};

function formatRunStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function TaskDetailContent({ task, availableTags, backHref = "/tasks", backLabel = "Back to task list" }: { task: TaskDetailRecord; availableTags: Array<{ id: string; name: string }>; backHref?: string; backLabel?: string }) {
  const executorBehavior = getExecutorBehavior(task.executorType);
  const showSchedule = isNonHumanExecutor(task.executorType);
  const latestRun = task.taskRuns[0] || null;
  const activeTimerMinutes = task.timerState === "running" && task.timerStartedAt ? getTimerElapsedMinutes(task.timerStartedAt) : 0;
  const totalTrackedMinutes = task.timeEntries.reduce((sum, entry) => sum + entry.minutes, 0);

  return (
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
            <div className="mt-3 border-t border-gray-200 pt-3">
              <div className="mb-1 font-medium text-gray-700">Timer state</div>
              <div className="text-sm text-gray-700">{formatTimerState(task.timerState)}</div>
              {task.timerState === "running" && task.timerStartedAt ? <div className="mt-1 text-xs text-gray-500">Running since {formatDateTime(task.timerStartedAt)} by {task.timerStartedBy?.name || task.timerStartedBy?.email || "system"} • {formatMinutes(activeTimerMinutes)} so far</div> : null}
            </div>
          </div>
        </div>
      </TaskMetaCard>
      <TaskMetaCard title="Time tracking" icon={CalendarDays}>
        <TaskTimePanel taskId={task.id} entries={task.timeEntries} timerState={task.timerState} timerStartedAt={task.timerStartedAt} timerStartedBy={task.timerStartedBy} />
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
          <Link href={backHref} scroll={false} className="inline-flex text-sm font-medium text-[#405189] hover:underline">{backLabel}</Link>
        </div>
      </TaskMetaCard>
    </div>
  );
}

import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import { CalendarDays, CircleDollarSign, FileText, Link2, Workflow } from "lucide-react";
import TaskStatusBadge from "@/components/TaskStatusBadge";
import TaskWorkspaceShell, { TaskMetaCard, TaskStats } from "@/components/TaskWorkspaceShell";
import { prisma } from "@/lib/prisma";
import { describeCronSchedule, formatCurrency, formatDate, formatDateTime, formatTaskLabel, getExecutorBehavior, isNonHumanExecutor } from "@/lib/tasks";

export const dynamic = "force-dynamic";

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
    },
  });

  if (!task) notFound();

  const executorBehavior = getExecutorBehavior(task.executorType);
  const showSchedule = isNonHumanExecutor(task.executorType);

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
              { label: "Completion state", value: executorBehavior.completedAction },
            ]} />
            {showSchedule ? (
              <TaskStats items={[
                { label: "Schedule linked", value: task.cronEnabled ? "Yes" : "No" },
                { label: "Schedule", value: describeCronSchedule(task.cronExpression, task.cronTimezone) },
                { label: "Timezone", value: task.cronTimezone || "Not configured" },
                { label: "Next scheduled run", value: formatDateTime(task.cronNextRunAt) },
                { label: "Last run", value: formatDateTime(task.cronLastRunAt) },
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
            { label: "Billed status", value: task.billedAt ? `Billed ${formatDate(task.billedAt)}` : "Not billed yet" },
          ]} />
        </TaskMetaCard>
        <TaskMetaCard title="Linked records" icon={Link2}>
          <div className="space-y-4">
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
      </div>
    </TaskWorkspaceShell>
  );
}

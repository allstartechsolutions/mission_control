import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import TaskDetailContent from "@/components/TaskDetailContent";
import TaskLiveRefresh from "@/components/TaskLiveRefresh";
import TaskWorkspaceShell from "@/components/TaskWorkspaceShell";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/tasks";

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
      timerStartedBy: { select: { name: true, email: true } },
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
      <TaskDetailContent task={task} availableTags={availableTags} />
    </TaskWorkspaceShell>
  );
}

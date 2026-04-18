import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import BoardLiveRefresh from "@/components/BoardLiveRefresh";
import FullPageModal from "@/components/FullPageModal";
import ProjectBoard from "@/components/ProjectBoard";
import ProjectWorkspaceShell from "@/components/ProjectWorkspaceShell";
import TaskDetailContent from "@/components/TaskDetailContent";
import TaskForm from "@/components/TaskForm";
import TaskWorkspaceShell from "@/components/TaskWorkspaceShell";
import { ensureProjectBoard, ensureProjectTaskPlacements } from "@/lib/boards";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/projects";
import { serializeCurrency } from "@/lib/tasks";

export const dynamic = "force-dynamic";

function pathnameForBoard(projectId: string, milestone: string, taskId: string, modal: "show" | "edit") {
  const params = new URLSearchParams();
  params.set("modal", modal);
  params.set("taskId", taskId);
  if (milestone && milestone !== "all") params.set("milestone", milestone);
  return `/projects/${projectId}/board?${params.toString()}`;
}

export default async function ProjectBoardPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ milestone?: string; modal?: string; taskId?: string; boardColumnId?: string }>;
}) {
  noStore();
  const { id } = await params;
  const { milestone = "all", modal, taskId, boardColumnId = "" } = await searchParams;
  const boardReturnHref = `/projects/${id}/board${milestone && milestone !== "all" ? `?milestone=${encodeURIComponent(milestone)}` : ""}`;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, companyName: true } },
      requester: { select: { name: true } },
      milestones: {
        where: { status: { not: "archived" } },
        include: { tasks: { select: { id: true } } },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  if (!project) notFound();

  const board = await ensureProjectBoard(project.id);
  await ensureProjectTaskPlacements(project.id, board.id);

  const hydratedBoard = await prisma.board.findUnique({
    where: { id: board.id },
    include: {
      columns: {
        orderBy: { sortOrder: "asc" },
        include: {
          placements: {
            orderBy: [{ sortOrder: "asc" }, { updatedAt: "asc" }],
            include: {
              task: {
                include: {
                  assignedTo: { select: { name: true, email: true } },
                  milestone: { select: { id: true, title: true } },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!hydratedBoard) notFound();

  const tasks = hydratedBoard.columns.flatMap((column) => column.placements.map((placement) => ({
    id: placement.task.id,
    title: placement.task.title,
    description: placement.task.description,
    status: placement.task.status,
    dueLabel: formatDate(placement.task.dueDate),
    assignee: placement.task.assignedTo.name || placement.task.assignedTo.email,
    milestoneId: placement.task.milestone?.id || null,
    milestoneTitle: placement.task.milestone?.title || null,
    columnId: column.id,
    columnName: column.name,
  })));

  const shouldRenderCreateModal = modal === "new";
  const shouldRenderShowModal = modal === "show" && !!taskId;
  const shouldRenderEditModal = modal === "edit" && !!taskId;
  const needsModalData = shouldRenderCreateModal || shouldRenderShowModal || shouldRenderEditModal;

  const [teamMembers, clients, availableTags, selectedTask] = needsModalData
    ? await Promise.all([
        prisma.user.findMany({ orderBy: [{ name: "asc" }, { email: "asc" }], select: { id: true, name: true, email: true, role: true, status: true } }),
        prisma.client.findMany({
          orderBy: { companyName: "asc" },
          select: {
            id: true,
            companyName: true,
            employees: { select: { id: true, name: true, title: true, email: true, status: true }, orderBy: { name: "asc" } },
            projects: { select: { id: true, name: true, milestones: { where: { status: { not: "archived" } }, select: { id: true, title: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] } }, orderBy: { name: "asc" } },
          },
        }),
        prisma.taskTag.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
        (shouldRenderShowModal || shouldRenderEditModal)
          ? prisma.task.findUnique({
              where: { id: taskId! },
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
            })
          : Promise.resolve(null),
      ])
    : [null, null, null, null] as const;

  const selectedMilestoneId = milestone !== "all" && milestone !== "none" && project.milestones.some((item) => item.id === milestone) ? milestone : "";

  return (
    <ProjectWorkspaceShell
      activeTab="board"
      project={{
        id: project.id,
        name: project.name,
        status: project.status,
        priority: project.priority,
        clientId: project.client.id,
        clientName: project.client.companyName,
        requesterName: project.requester?.name ?? null,
        estimatedPrice: formatCurrency(project.estimatedPrice),
        finalPrice: formatCurrency(project.finalPrice),
        dueDate: formatDate(project.dueDate),
        milestoneCount: project.milestones.length,
      }}
    >
      <>
        <div className="space-y-4">
          <BoardLiveRefresh projectId={project.id} />
          <ProjectBoard
            projectId={project.id}
            columns={hydratedBoard.columns.map((column) => ({
              id: column.id,
              key: column.key,
              name: column.name,
              color: column.color,
              taskCount: column.placements.length,
            }))}
            tasks={tasks}
            milestones={project.milestones.map((milestone) => ({
              id: milestone.id,
              title: milestone.title,
              status: milestone.status,
              taskCount: tasks.filter((task) => task.milestoneId === milestone.id).length,
            }))}
          />
        </div>
        {shouldRenderCreateModal && teamMembers && clients && availableTags ? (
          <FullPageModal title="Add task" description="Create a task without losing your place on the board." closeHref={boardReturnHref}>
            <TaskForm
              mode="create"
              teamMembers={teamMembers}
              clients={clients}
              availableTags={availableTags}
              context={{
                clientLocked: true,
                projectLocked: true,
                milestoneLocked: !!selectedMilestoneId,
                contextLabel: selectedMilestoneId ? `${project.client.companyName} / ${project.name} / ${project.milestones.find((item) => item.id === selectedMilestoneId)?.title}` : `${project.client.companyName} / ${project.name}`,
                backHref: boardReturnHref,
                submitHref: boardReturnHref,
              }}
              initialValues={{
                clientId: project.client.id,
                projectId: project.id,
                milestoneId: selectedMilestoneId,
                boardColumnId: boardColumnId || hydratedBoard.columns[0]?.id || "",
              }}
            />
          </FullPageModal>
        ) : null}
        {shouldRenderShowModal && availableTags && selectedTask ? (
          <FullPageModal title={selectedTask.title} description="Review task details without losing your place on the board." closeHref={boardReturnHref}>
            <TaskWorkspaceShell
              activeTab="overview"
              listHref={boardReturnHref}
              listLabel="Board"
              overviewHref={`${pathnameForBoard(id, milestone, selectedTask.id, "show")}`}
              editHref={`${pathnameForBoard(id, milestone, selectedTask.id, "edit")}`}
              task={{
                id: selectedTask.id,
                title: selectedTask.title,
                status: selectedTask.status,
                executorType: selectedTask.executorType,
                assignedToName: selectedTask.assignedTo.name || selectedTask.assignedTo.email,
                dueDate: formatDate(selectedTask.dueDate),
                clientName: selectedTask.client?.companyName || "Standalone",
                projectName: selectedTask.project?.name || "No linked project",
                canDispatch: selectedTask.executorType !== "human" && selectedTask.status !== "completed" && selectedTask.status !== "canceled",
              }}
            >
              <TaskDetailContent task={selectedTask} availableTags={availableTags} backHref={boardReturnHref} backLabel="Back to board" />
            </TaskWorkspaceShell>
          </FullPageModal>
        ) : null}
        {shouldRenderEditModal && teamMembers && clients && availableTags && selectedTask ? (
          <FullPageModal title={`Edit task: ${selectedTask.title}`} description="Update the card, save, and drop right back into the same board view." closeHref={boardReturnHref}>
            <TaskForm
              mode="edit"
              taskId={selectedTask.id}
              teamMembers={teamMembers}
              clients={clients}
              availableTags={availableTags}
              context={{ backHref: boardReturnHref, submitHref: boardReturnHref }}
              initialValues={{
                title: selectedTask.title,
                description: selectedTask.description || "",
                assignedToId: selectedTask.assignedToId,
                status: selectedTask.status,
                dueDate: selectedTask.dueDate ? new Date(selectedTask.dueDate).toISOString().slice(0, 10) : "",
                startDate: selectedTask.startDate ? new Date(selectedTask.startDate).toISOString().slice(0, 10) : "",
                executorType: selectedTask.executorType,
                clientId: selectedTask.clientId || "",
                projectId: selectedTask.projectId || "",
                milestoneId: selectedTask.milestoneId || "",
                requesterEmployeeId: selectedTask.requesterEmployeeId || "",
                billable: selectedTask.billable,
                billingType: selectedTask.billingType === "none" ? "fixed" : selectedTask.billingType,
                amount: serializeCurrency(selectedTask.amount),
                cronEnabled: selectedTask.cronEnabled,
                cronExpression: selectedTask.cronExpression || "",
                cronTimezone: selectedTask.cronTimezone || "America/New_York",
                tagNames: selectedTask.tagAssignments.map((assignment) => assignment.tag.name).join(", "),
              }}
            />
          </FullPageModal>
        ) : null}
      </>
    </ProjectWorkspaceShell>
  );
}

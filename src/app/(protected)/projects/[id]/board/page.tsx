import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import BoardLiveRefresh from "@/components/BoardLiveRefresh";
import FullPageModal from "@/components/FullPageModal";
import ProjectBoard from "@/components/ProjectBoard";
import ProjectWorkspaceShell from "@/components/ProjectWorkspaceShell";
import TaskForm from "@/components/TaskForm";
import { ensureProjectBoard, ensureProjectTaskPlacements } from "@/lib/boards";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/projects";
import { serializeCurrency } from "@/lib/tasks";

export const dynamic = "force-dynamic";

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
  const shouldRenderEditModal = modal === "edit" && !!taskId;
  const needsModalData = shouldRenderCreateModal || shouldRenderEditModal;

  const [teamMembers, clients, editTask] = needsModalData
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
        shouldRenderEditModal ? prisma.task.findUnique({ where: { id: taskId! } }) : Promise.resolve(null),
      ])
    : [null, null, null] as const;

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
        {shouldRenderCreateModal && teamMembers && clients ? (
          <FullPageModal title="Add task" description="Create a task without losing your place on the board." closeHref={boardReturnHref}>
            <TaskForm
              mode="create"
              teamMembers={teamMembers}
              clients={clients}
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
        {shouldRenderEditModal && teamMembers && clients && editTask ? (
          <FullPageModal title={`Edit task: ${editTask.title}`} description="Update the card, save, and drop right back into the same board view." closeHref={boardReturnHref}>
            <TaskForm
              mode="edit"
              taskId={editTask.id}
              teamMembers={teamMembers}
              clients={clients}
              context={{ backHref: boardReturnHref, submitHref: boardReturnHref }}
              initialValues={{
                title: editTask.title,
                description: editTask.description || "",
                assignedToId: editTask.assignedToId,
                status: editTask.status,
                dueDate: new Date(editTask.dueDate).toISOString().slice(0, 10),
                startDate: editTask.startDate ? new Date(editTask.startDate).toISOString().slice(0, 10) : "",
                executorType: editTask.executorType,
                clientId: editTask.clientId || "",
                projectId: editTask.projectId || "",
                milestoneId: editTask.milestoneId || "",
                requesterEmployeeId: editTask.requesterEmployeeId || "",
                billable: editTask.billable,
                billingType: editTask.billingType === "none" ? "fixed" : editTask.billingType,
                amount: serializeCurrency(editTask.amount),
                cronEnabled: editTask.cronEnabled,
                cronExpression: editTask.cronExpression || "",
                cronTimezone: editTask.cronTimezone || "America/New_York",
              }}
            />
          </FullPageModal>
        ) : null}
      </>
    </ProjectWorkspaceShell>
  );
}

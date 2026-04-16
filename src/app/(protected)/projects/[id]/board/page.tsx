import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import BoardLiveRefresh from "@/components/BoardLiveRefresh";
import ProjectBoard from "@/components/ProjectBoard";
import ProjectWorkspaceShell from "@/components/ProjectWorkspaceShell";
import { ensureProjectBoard, ensureProjectTaskPlacements } from "@/lib/boards";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/projects";

export const dynamic = "force-dynamic";

export default async function ProjectBoardPage({ params }: { params: Promise<{ id: string }> }) {
  noStore();
  const { id } = await params;

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
    </ProjectWorkspaceShell>
  );
}

import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import ProjectBoardMockup from "@/components/ProjectBoardMockup";
import ProjectWorkspaceShell from "@/components/ProjectWorkspaceShell";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/projects";
import { formatTaskLabel } from "@/lib/tasks";

export const dynamic = "force-dynamic";

const previewTaskBlueprints = [
  {
    title: "Finalize kickoff checklist",
    description: "Confirm client access, briefing packet, and owner assignments before work starts.",
    status: "scheduled",
    milestoneIndex: 0,
    priority: "High",
    executorLabel: "Hulk",
    billableLabel: "Non-billable",
    dueOffsetDays: 2,
  },
  {
    title: "Wire up intake automation",
    description: "Connect the project intake form to the internal routing flow and validate handoff rules.",
    status: "in_progress",
    milestoneIndex: 0,
    priority: "High",
    executorLabel: "Agent",
    billableLabel: "Billable · Fixed",
    dueOffsetDays: 4,
  },
  {
    title: "Review hardware ordering blockers",
    description: "Waiting on final site measurements and vendor ETA before moving this card forward.",
    status: "waiting",
    milestoneIndex: 1,
    priority: "Medium",
    executorLabel: "Human",
    billableLabel: "Billable · Hourly",
    dueOffsetDays: 6,
  },
  {
    title: "Document client handoff notes",
    description: "Capture punch list items and operator notes that are not tied to a milestone.",
    status: "scheduled",
    milestoneIndex: null,
    priority: "Low",
    executorLabel: "Hulk",
    billableLabel: "Non-billable",
    dueOffsetDays: 8,
  },
  {
    title: "Launch remote monitoring baseline",
    description: "Baseline checks are green and the recurring monitoring profile has been enabled.",
    status: "completed",
    milestoneIndex: 1,
    priority: "Medium",
    executorLabel: "Automation",
    billableLabel: "Billable · Fixed",
    dueOffsetDays: -1,
  },
];

function dueLabelFromOffset(offsetDays: number) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return formatDate(date);
}

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
        include: {
          tasks: {
            select: { id: true },
          },
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
      tasks: {
        include: {
          assignedTo: { select: { name: true, email: true } },
          milestone: { select: { id: true, title: true } },
        },
        orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  if (!project) notFound();

  const boardTasks = project.tasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description || "No additional notes yet.",
    status: task.status,
    milestoneId: task.milestone?.id || null,
    milestoneTitle: task.milestone?.title || null,
    owner: task.assignedTo.name || task.assignedTo.email,
    dueLabel: formatDate(task.dueDate),
    executorLabel: formatTaskLabel(task.executorType),
    priority: project.priority,
    billableLabel: task.billable ? `Billable${task.billingType !== "none" ? ` · ${formatTaskLabel(task.billingType)}` : ""}` : "Non-billable",
  }));

  const milestones = project.milestones.map((milestone) => ({
    id: milestone.id,
    title: milestone.title,
    status: milestone.status,
    dueLabel: formatDate(milestone.dueDate),
    taskCount: milestone.tasks.length,
  }));

  const previewTasks = previewTaskBlueprints.map((task, index) => {
    const linkedMilestone = typeof task.milestoneIndex === "number" ? milestones[task.milestoneIndex] : null;
    return {
      id: `preview-${index}`,
      title: task.title,
      description: task.description,
      status: task.status,
      milestoneId: linkedMilestone?.id || null,
      milestoneTitle: linkedMilestone?.title || null,
      owner: project.requester?.name || project.client.companyName,
      dueLabel: dueLabelFromOffset(task.dueOffsetDays),
      executorLabel: task.executorLabel,
      priority: task.priority,
      billableLabel: task.billableLabel,
    };
  });

  const combinedTasks = boardTasks.length >= 4 ? boardTasks : [...boardTasks, ...previewTasks].slice(0, Math.max(4, previewTasks.length));

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
      <ProjectBoardMockup
        projectId={project.id}
        projectName={project.name}
        projectStatus={project.status}
        tasks={combinedTasks}
        milestones={milestones}
        usingPreviewData={boardTasks.length < 4}
      />
    </ProjectWorkspaceShell>
  );
}

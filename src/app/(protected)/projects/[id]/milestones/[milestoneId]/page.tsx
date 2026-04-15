import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, CircleDollarSign, FileText, ListChecks } from "lucide-react";
import DeleteMilestoneButton from "@/components/DeleteMilestoneButton";
import ProjectWorkspaceShell, { ProjectMetaCard, ProjectStats } from "@/components/ProjectWorkspaceShell";
import { formatCurrency, formatDate, formatEnumLabel } from "@/lib/projects";
import { prisma } from "@/lib/prisma";

export default async function MilestoneDetailPage({ params }: { params: Promise<{ id: string; milestoneId: string }> }) {
  const { id, milestoneId } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, companyName: true } },
      requester: { select: { name: true } },
      milestones: { select: { id: true }, where: { status: { not: "archived" } } },
    },
  });
  const milestone = await prisma.projectMilestone.findFirst({
    where: { id: milestoneId, projectId: id },
    include: {
      tasks: {
        select: {
          id: true,
          title: true,
          status: true,
          dueDate: true,
          assignedTo: { select: { name: true, email: true } },
        },
        orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  if (!project || !milestone) notFound();

  return (
    <ProjectWorkspaceShell
      activeTab="milestones"
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
      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <nav className="text-sm text-gray-400"><Link href="/projects" className="hover:text-[#405189]">Projects</Link><span className="mx-2">&rsaquo;</span><Link href={`/projects/${project.id}`} className="hover:text-[#405189]">{project.name}</Link><span className="mx-2">&rsaquo;</span><Link href={`/projects/${project.id}/milestones`} className="hover:text-[#405189]">Milestones</Link><span className="mx-2">&rsaquo;</span><span>{milestone.title}</span></nav>
          <h2 className="mt-2 text-xl font-semibold text-gray-800">{milestone.title}</h2>
          <p className="mt-1 text-sm text-gray-500">Dedicated milestone workspace with safe task linkage.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {milestone.status !== "archived" ? <Link href={`/tasks/new?projectId=${project.id}&milestoneId=${milestone.id}`} className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:border-[#405189] hover:text-[#405189]">New task</Link> : null}
          <Link href={`/projects/${project.id}/milestones/${milestone.id}/edit`} className="inline-flex items-center gap-2 rounded-md bg-[#405189] px-3 py-2 text-sm font-medium text-white hover:bg-[#364474]">Edit milestone</Link>
          <DeleteMilestoneButton projectId={project.id} milestoneId={milestone.id} milestoneTitle={milestone.title} hasLinkedTasks={milestone.tasks.length > 0} />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ProjectMetaCard title="Milestone brief" icon={FileText}>
          <p className="text-sm text-gray-700">{milestone.description || "No milestone notes yet."}</p>
        </ProjectMetaCard>
        <ProjectMetaCard title="Milestone snapshot" icon={CalendarDays}>
          <ProjectStats items={[
            { label: "Status", value: formatEnumLabel(milestone.status) },
            { label: "Due date", value: formatDate(milestone.dueDate) },
            { label: "Sort order", value: String(milestone.sortOrder) },
            { label: "Linked tasks", value: String(milestone.tasks.length) },
          ]} />
        </ProjectMetaCard>
        <ProjectMetaCard title="Financials" icon={CircleDollarSign}>
          <ProjectStats items={[
            { label: "Estimated price", value: formatCurrency(milestone.estimatedPrice) },
            { label: "Final price", value: formatCurrency(milestone.finalPrice) },
          ]} />
        </ProjectMetaCard>
        <ProjectMetaCard title="Linked tasks" icon={ListChecks}>
          {milestone.tasks.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">No tasks linked yet.</div>
          ) : (
            <div className="space-y-3">
              {milestone.tasks.map((task) => (
                <Link key={task.id} href={`/tasks/${task.id}`} className="block rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 hover:border-[#405189]/30 hover:bg-[#405189]/5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-sm font-semibold text-gray-800">{task.title}</div>
                      <div className="mt-1 text-xs text-gray-500">Assigned to {task.assignedTo.name || task.assignedTo.email}</div>
                    </div>
                    <div className="text-xs text-gray-500 sm:text-right">
                      <div>{formatEnumLabel(task.status)}</div>
                      <div className="mt-1">Due {formatDate(task.dueDate)}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </ProjectMetaCard>
      </div>
    </ProjectWorkspaceShell>
  );
}

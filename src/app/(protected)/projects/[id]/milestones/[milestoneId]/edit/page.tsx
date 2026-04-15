import Link from "next/link";
import { notFound } from "next/navigation";
import DeleteMilestoneButton from "@/components/DeleteMilestoneButton";
import MilestoneForm from "@/components/MilestoneForm";
import ProjectWorkspaceShell from "@/components/ProjectWorkspaceShell";
import { formatCurrency, formatDate, serializeCurrency } from "@/lib/projects";
import { prisma } from "@/lib/prisma";

export default async function EditMilestonePage({ params }: { params: Promise<{ id: string; milestoneId: string }> }) {
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
    include: { _count: { select: { tasks: true } } },
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
          <nav className="text-sm text-gray-400"><Link href="/projects" className="hover:text-[#405189]">Projects</Link><span className="mx-2">&rsaquo;</span><Link href={`/projects/${project.id}`} className="hover:text-[#405189]">{project.name}</Link><span className="mx-2">&rsaquo;</span><Link href={`/projects/${project.id}/milestones`} className="hover:text-[#405189]">Milestones</Link><span className="mx-2">&rsaquo;</span><Link href={`/projects/${project.id}/milestones/${milestone.id}`} className="hover:text-[#405189]">{milestone.title}</Link><span className="mx-2">&rsaquo;</span><span>Edit</span></nav>
          <h2 className="mt-2 text-xl font-semibold text-gray-800">Edit milestone</h2>
          <p className="mt-1 text-sm text-gray-500">Stable milestone record, safe updates, and no task link breakage.</p>
        </div>
        <DeleteMilestoneButton projectId={project.id} milestoneId={milestone.id} milestoneTitle={milestone.title} hasLinkedTasks={milestone._count.tasks > 0} />
      </div>
      <MilestoneForm
        mode="edit"
        projectId={project.id}
        milestoneId={milestone.id}
        initialValues={{
          title: milestone.title,
          description: milestone.description ?? "",
          status: milestone.status,
          dueDate: milestone.dueDate ? new Date(milestone.dueDate).toISOString().slice(0, 10) : "",
          estimatedPrice: serializeCurrency(milestone.estimatedPrice),
          finalPrice: serializeCurrency(milestone.finalPrice),
        }}
      />
    </ProjectWorkspaceShell>
  );
}

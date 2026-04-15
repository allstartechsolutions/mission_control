import Link from "next/link";
import { notFound } from "next/navigation";
import MilestoneForm from "@/components/MilestoneForm";
import ProjectWorkspaceShell from "@/components/ProjectWorkspaceShell";
import { formatCurrency, formatDate } from "@/lib/projects";
import { prisma } from "@/lib/prisma";

export default async function NewMilestonePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, companyName: true } },
      requester: { select: { name: true } },
      milestones: { select: { id: true }, where: { status: { not: "archived" } } },
    },
  });

  if (!project) notFound();

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
      <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
        <nav className="text-sm text-gray-400"><Link href="/projects" className="hover:text-[#405189]">Projects</Link><span className="mx-2">&rsaquo;</span><Link href={`/projects/${project.id}`} className="hover:text-[#405189]">{project.name}</Link><span className="mx-2">&rsaquo;</span><Link href={`/projects/${project.id}/milestones`} className="hover:text-[#405189]">Milestones</Link><span className="mx-2">&rsaquo;</span><span>New</span></nav>
        <h2 className="mt-2 text-xl font-semibold text-gray-800">New milestone</h2>
        <p className="mt-1 text-sm text-gray-500">Add a durable milestone without touching the project record itself.</p>
      </div>
      <MilestoneForm mode="create" projectId={project.id} />
    </ProjectWorkspaceShell>
  );
}

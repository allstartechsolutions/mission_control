import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, CircleDollarSign, FileText, ListChecks } from "lucide-react";
import ProjectWorkspaceShell, { MilestoneSummary, ProjectMetaCard, ProjectStats } from "@/components/ProjectWorkspaceShell";
import { formatCurrency, formatDate, formatEnumLabel } from "@/lib/projects";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  noStore();
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, companyName: true } },
      requester: { select: { name: true, title: true, email: true } },
      milestones: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
    },
  });

  if (!project) notFound();

  const activeMilestones = project.milestones.filter((milestone) => milestone.status !== "archived");

  return (
    <ProjectWorkspaceShell
      activeTab="overview"
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
        milestoneCount: activeMilestones.length,
      }}
    >
      <div className="grid gap-6 xl:grid-cols-2">
        <ProjectMetaCard title="Project scope" icon={FileText}>
          {project.description ? <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: project.description }} /> : <p className="text-sm text-gray-500">No description yet.</p>}
        </ProjectMetaCard>
        <ProjectMetaCard title="Project snapshot" icon={CalendarDays}>
          <ProjectStats items={[
            { label: "Client", value: project.client.companyName },
            { label: "Requester", value: project.requester?.name || "Unassigned" },
            { label: "Requester details", value: [project.requester?.title, project.requester?.email].filter(Boolean).join(" • ") || "Not set" },
            { label: "Status", value: formatEnumLabel(project.status) },
            { label: "Priority", value: project.priority },
            { label: "Start date", value: formatDate(project.startDate) },
            { label: "Due date", value: formatDate(project.dueDate) },
            { label: "Milestones", value: String(activeMilestones.length) },
          ]} />
        </ProjectMetaCard>
        <ProjectMetaCard title="Financials" icon={CircleDollarSign}>
          <ProjectStats items={[
            { label: "Estimated price", value: formatCurrency(project.estimatedPrice) },
            { label: "Final price", value: formatCurrency(project.finalPrice) },
          ]} />
        </ProjectMetaCard>
        <ProjectMetaCard title="Milestones" icon={ListChecks}>
          <MilestoneSummary projectId={project.id} items={activeMilestones.map((milestone) => ({ id: milestone.id, projectId: project.id, title: milestone.title, status: milestone.status, dueDate: formatDate(milestone.dueDate), estimatedPrice: formatCurrency(milestone.estimatedPrice), finalPrice: formatCurrency(milestone.finalPrice), description: milestone.description || "" }))} />
          {project.milestones.length > 0 ? <div className="mt-3 text-right"><Link href={`/projects/${project.id}/milestones`} className="text-sm font-medium text-[#405189] hover:underline">Manage all milestones &rarr;</Link></div> : null}
        </ProjectMetaCard>
      </div>
    </ProjectWorkspaceShell>
  );
}

import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ListChecks, Plus } from "lucide-react";
import ProjectWorkspaceShell, { MilestoneSummary } from "@/components/ProjectWorkspaceShell";
import { formatCurrency, formatDate } from "@/lib/projects";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MilestonesPage({ params }: { params: Promise<{ id: string }> }) {
  noStore();
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, companyName: true } },
      requester: { select: { name: true } },
      milestones: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        include: { _count: { select: { tasks: true } } },
      },
    },
  });

  if (!project) notFound();

  const activeMilestones = project.milestones.filter((m) => m.status !== "archived");
  const archivedMilestones = project.milestones.filter((m) => m.status === "archived");

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
        milestoneCount: activeMilestones.length,
      }}
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-[#405189]/10 p-2 text-[#405189]"><ListChecks size={18} /></div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Milestones</h2>
              <p className="text-sm text-gray-500">{activeMilestones.length} active milestone{activeMilestones.length !== 1 ? "s" : ""}{archivedMilestones.length > 0 ? ` · ${archivedMilestones.length} archived` : ""}</p>
            </div>
          </div>
          <Link href={`/projects/${project.id}/milestones/new`} className="inline-flex items-center gap-2 rounded-md bg-[#405189] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#364474]"><Plus size={15} />New milestone</Link>
        </div>

        <MilestoneSummary
          projectId={project.id}
          items={activeMilestones.map((milestone) => ({
            id: milestone.id,
            projectId: project.id,
            title: milestone.title,
            status: milestone.status,
            dueDate: formatDate(milestone.dueDate),
            estimatedPrice: formatCurrency(milestone.estimatedPrice),
            finalPrice: formatCurrency(milestone.finalPrice),
            description: milestone.description || "",
            taskCount: milestone._count.tasks,
          }))}
        />

        {archivedMilestones.length > 0 ? (
          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-gray-500 hover:text-gray-700">Show {archivedMilestones.length} archived milestone{archivedMilestones.length !== 1 ? "s" : ""}</summary>
            <div className="mt-3">
              <MilestoneSummary
                projectId={project.id}
                items={archivedMilestones.map((milestone) => ({
                  id: milestone.id,
                  projectId: project.id,
                  title: milestone.title,
                  status: milestone.status,
                  dueDate: formatDate(milestone.dueDate),
                  estimatedPrice: formatCurrency(milestone.estimatedPrice),
                  finalPrice: formatCurrency(milestone.finalPrice),
                  description: milestone.description || "",
                  taskCount: milestone._count.tasks,
                }))}
              />
            </div>
          </details>
        ) : null}
      </div>
    </ProjectWorkspaceShell>
  );
}

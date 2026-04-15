import { unstable_noStore as noStore } from "next/cache";
import { CircleDollarSign, FolderKanban, ListChecks } from "lucide-react";
import ProjectsTable from "@/components/ProjectsTable";
import { formatCurrency, formatDate } from "@/lib/projects";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  noStore();
  const projects = await prisma.project.findMany({
    include: {
      client: { select: { companyName: true } },
      requester: { select: { name: true } },
      _count: { select: { milestones: true } },
    },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
  });

  const totalEstimated = projects.reduce((sum, project) => sum + Number(project.estimatedPrice || 0), 0);
  const totalFinal = projects.reduce((sum, project) => sum + Number(project.finalPrice || 0), 0);
  const totalMilestones = projects.reduce((sum, project) => sum + project._count.milestones, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-800">Projects</h1>
          <nav className="text-sm text-gray-400"><span className="text-[#405189]">Mission Control</span><span className="mx-2">&rsaquo;</span><span>Projects</span></nav>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Active projects</p><div className="mt-1 flex items-center gap-2 text-gray-800"><FolderKanban size={18} className="text-[#405189]" /><p className="text-2xl font-semibold">{projects.filter((project) => project.status === "active").length}</p></div></div>
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Milestones</p><div className="mt-1 flex items-center gap-2 text-gray-800"><ListChecks size={18} className="text-[#405189]" /><p className="text-2xl font-semibold">{totalMilestones}</p></div></div>
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Estimated / final</p><div className="mt-1 flex items-center gap-2 text-gray-800"><CircleDollarSign size={18} className="text-[#405189]" /><p className="text-sm font-semibold">{formatCurrency(totalEstimated)} / {formatCurrency(totalFinal)}</p></div></div>
        </div>
      </div>

      <ProjectsTable
        projects={projects.map((project) => ({
          id: project.id,
          name: project.name,
          clientName: project.client.companyName,
          requesterName: project.requester?.name ?? null,
          status: project.status,
          priority: project.priority,
          estimatedPrice: formatCurrency(project.estimatedPrice),
          finalPrice: formatCurrency(project.finalPrice),
          milestoneCount: project._count.milestones,
          dueDate: formatDate(project.dueDate),
        }))}
      />
    </div>
  );
}

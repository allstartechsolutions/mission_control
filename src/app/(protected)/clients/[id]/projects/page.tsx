import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import { CircleDollarSign, FolderKanban, ListChecks } from "lucide-react";
import { ClientWorkspaceShell, EmptyState } from "@/components/ClientWorkspaceShell";
import ProjectsTable from "@/components/ProjectsTable";
import { formatCurrency, formatDate } from "@/lib/projects";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ClientProjectsPage({ params }: { params: Promise<{ id: string }> }) {
  noStore();
  const { id } = await params;

  const client = await prisma.client.findUnique({
    where: { id },
    select: {
      id: true,
      companyName: true,
      logoPath: true,
      status: true,
      phone: true,
      city: true,
      state: true,
      primaryContactName: true,
      primaryContactTitle: true,
      primaryContactEmail: true,
      primaryContactPhone: true,
      _count: { select: { locations: true, employees: true, projects: true, accounts: true } },
      projects: {
        include: {
          requester: { select: { name: true } },
          _count: { select: { milestones: true } },
        },
        orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
      },
    },
  });

  if (!client) notFound();

  const totalEstimated = client.projects.reduce((sum, project) => sum + Number(project.estimatedPrice || 0), 0);
  const totalMilestones = client.projects.reduce((sum, project) => sum + project._count.milestones, 0);

  return (
    <ClientWorkspaceShell
      activeTab="projects"
      client={{
        id: client.id,
        companyName: client.companyName,
        logoPath: client.logoPath,
        status: client.status,
        primaryContactName: client.primaryContactName,
        primaryContactTitle: client.primaryContactTitle,
        primaryContactEmail: client.primaryContactEmail,
        primaryContactPhone: client.primaryContactPhone,
        phone: client.phone,
        city: client.city,
        state: client.state,
        employeeCount: client._count.employees,
        projectCount: client._count.projects,
        locationCount: client._count.locations,
        accountCount: client._count.accounts,
      }}
    >
      {client.projects.length === 0 ? (
        <div className="space-y-4">
          <div className="flex justify-end">
            <a href={`/projects/new?clientId=${client.id}`} className="inline-flex items-center gap-2 rounded-md bg-[#405189] px-3 py-2 text-sm font-medium text-white hover:bg-[#364474]">New project</a>
          </div>
          <EmptyState icon={FolderKanban} title="No projects yet" description="This client workspace is ready for real project records. Create the first one with requester filtering, financials, and milestone planning." />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Projects</p><div className="mt-1 flex items-center gap-2 text-gray-800"><FolderKanban size={18} className="text-[#405189]" /><p className="text-2xl font-semibold">{client.projects.length}</p></div></div>
            <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Milestones</p><div className="mt-1 flex items-center gap-2 text-gray-800"><ListChecks size={18} className="text-[#405189]" /><p className="text-2xl font-semibold">{totalMilestones}</p></div></div>
            <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Estimated pipeline</p><div className="mt-1 flex items-center gap-2 text-gray-800"><CircleDollarSign size={18} className="text-[#405189]" /><p className="text-sm font-semibold">{formatCurrency(totalEstimated)}</p></div></div>
          </div>
          <ProjectsTable
            projects={client.projects.map((project) => ({
              id: project.id,
              name: project.name,
              clientName: client.companyName,
              requesterName: project.requester?.name ?? null,
              status: project.status,
              priority: project.priority,
              estimatedPrice: formatCurrency(project.estimatedPrice),
              finalPrice: formatCurrency(project.finalPrice),
              milestoneCount: project._count.milestones,
              dueDate: formatDate(project.dueDate),
            }))}
            showClient={false}
            newHref={`/projects/new?clientId=${client.id}`}
          />
        </div>
      )}
    </ClientWorkspaceShell>
  );
}

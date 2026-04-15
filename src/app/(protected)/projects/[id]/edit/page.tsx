import Link from "next/link";
import { notFound } from "next/navigation";
import ProjectForm from "@/components/ProjectForm";
import ProjectWorkspaceShell from "@/components/ProjectWorkspaceShell";
import { formatCurrency, formatDate } from "@/lib/projects";
import { prisma } from "@/lib/prisma";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [project, clients] = await Promise.all([
    prisma.project.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, companyName: true } },
        requester: { select: { name: true } },
        milestones: { select: { id: true }, where: { status: { not: "archived" } } },
      },
    }),
    prisma.client.findMany({
      select: {
        id: true,
        companyName: true,
        employees: { select: { id: true, name: true, title: true, email: true, status: true }, orderBy: { name: "asc" } },
      },
      orderBy: { companyName: "asc" },
    }),
  ]);

  if (!project) notFound();

  return (
    <ProjectWorkspaceShell
      activeTab="edit"
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
        <nav className="text-sm text-gray-400"><Link href="/projects" className="hover:text-[#405189]">Projects</Link><span className="mx-2">&rsaquo;</span><Link href={`/projects/${project.id}`} className="hover:text-[#405189]">{project.name}</Link><span className="mx-2">&rsaquo;</span><span>Edit</span></nav>
        <h2 className="mt-2 text-xl font-semibold text-gray-800">Edit project</h2>
        <p className="mt-1 text-sm text-gray-500">Update scope, requester, pricing, or milestone structure without leaving the project workspace.</p>
      </div>
      <ProjectForm
        mode="edit"
        projectId={project.id}
        clients={clients}
        initialValues={{
          name: project.name,
          clientId: project.clientId,
          requesterId: project.requesterId ?? "",
          status: project.status,
          priority: project.priority,
          description: project.description ?? "",
          estimatedPrice: project.estimatedPrice ? Number(project.estimatedPrice).toFixed(2) : "",
          finalPrice: project.finalPrice ? Number(project.finalPrice).toFixed(2) : "",
          startDate: project.startDate ? new Date(project.startDate).toISOString().slice(0, 10) : "",
          dueDate: project.dueDate ? new Date(project.dueDate).toISOString().slice(0, 10) : "",
        }}
      />
    </ProjectWorkspaceShell>
  );
}

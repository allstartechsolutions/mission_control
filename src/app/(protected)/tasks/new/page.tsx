import Link from "next/link";
import TaskForm from "@/components/TaskForm";
import { prisma } from "@/lib/prisma";

export default async function NewTaskPage({ searchParams }: { searchParams: Promise<{ clientId?: string; projectId?: string; milestoneId?: string }> }) {
  const { clientId: rawClientId, projectId: rawProjectId, milestoneId: rawMilestoneId } = await searchParams;
  const [teamMembers, clients, projectContext, milestoneContext] = await Promise.all([
    prisma.user.findMany({ orderBy: [{ name: "asc" }, { email: "asc" }], select: { id: true, name: true, email: true, role: true, status: true } }),
    prisma.client.findMany({
      orderBy: { companyName: "asc" },
      select: {
        id: true,
        companyName: true,
        employees: { select: { id: true, name: true, title: true, email: true, status: true }, orderBy: { name: "asc" } },
        projects: { select: { id: true, name: true, milestones: { where: { status: { not: "archived" } }, select: { id: true, title: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] } }, orderBy: { name: "asc" } },
      },
    }),
    rawProjectId ? prisma.project.findUnique({ where: { id: rawProjectId }, select: { id: true, name: true, clientId: true, client: { select: { companyName: true } } } }) : Promise.resolve(null),
    rawMilestoneId ? prisma.projectMilestone.findFirst({ where: { id: rawMilestoneId, status: { not: "archived" } }, select: { id: true, title: true, projectId: true, project: { select: { id: true, name: true, clientId: true, client: { select: { companyName: true } } } } } }) : Promise.resolve(null),
  ]);

  const clientId = milestoneContext?.project.clientId || projectContext?.clientId || (rawClientId && clients.some((client) => client.id === rawClientId) ? rawClientId : "");
  const projectId = milestoneContext?.projectId || (projectContext && clients.some((client) => client.projects.some((project) => project.id === projectContext.id)) ? projectContext.id : "");
  const milestoneId = milestoneContext && clients.some((client) => client.projects.some((project) => project.milestones.some((milestone) => milestone.id === milestoneContext.id))) ? milestoneContext.id : "";

  const context = milestoneContext ? {
    clientLocked: true,
    projectLocked: true,
    milestoneLocked: true,
    contextLabel: `${milestoneContext.project.client.companyName} / ${milestoneContext.project.name} / ${milestoneContext.title}`,
    backHref: `/projects/${milestoneContext.project.id}`,
  } : projectContext ? {
    clientLocked: true,
    projectLocked: true,
    contextLabel: `${projectContext.client.companyName} / ${projectContext.name}`,
    backHref: `/projects/${projectContext.id}`,
  } : clientId ? {
    clientLocked: !!rawClientId,
    contextLabel: clients.find((client) => client.id === clientId)?.companyName,
    backHref: rawClientId ? `/clients/${clientId}` : "/tasks",
  } : undefined;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <nav className="text-sm text-gray-400"><Link href="/tasks" className="hover:text-[#405189]">Tasks</Link><span className="mx-2">&rsaquo;</span><span>Create</span></nav>
          <h1 className="mt-2 text-xl font-semibold text-gray-800">Create task</h1>
          <p className="mt-1 text-sm text-gray-500">Create standalone or linked tasks with assignment, billing, and delivery context.</p>
        </div>
        <Link href="/tasks" className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50">Back to tasks</Link>
      </div>
      <TaskForm mode="create" teamMembers={teamMembers} clients={clients} context={context} initialValues={{ clientId, projectId, milestoneId }} />
    </div>
  );
}

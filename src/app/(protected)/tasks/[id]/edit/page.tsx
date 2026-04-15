import Link from "next/link";
import { notFound } from "next/navigation";
import TaskForm from "@/components/TaskForm";
import TaskWorkspaceShell from "@/components/TaskWorkspaceShell";
import { prisma } from "@/lib/prisma";
import { formatDate, serializeCurrency } from "@/lib/tasks";

export default async function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [task, teamMembers, clients] = await Promise.all([
    prisma.task.findUnique({
      where: { id },
      include: {
        assignedTo: { select: { name: true, email: true } },
        client: { select: { companyName: true } },
        project: { select: { name: true } },
      },
    }),
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
  ]);

  if (!task) notFound();

  return (
    <TaskWorkspaceShell
      activeTab="edit"
      task={{
        id: task.id,
        title: task.title,
        status: task.status,
        executorType: task.executorType,
        assignedToName: task.assignedTo.name || task.assignedTo.email,
        dueDate: formatDate(task.dueDate),
        clientName: task.client?.companyName || "Standalone",
        projectName: task.project?.name || "No linked project",
        canDispatch: task.executorType !== "human" && task.status !== "completed" && task.status !== "canceled",
      }}
    >
      <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
        <nav className="text-sm text-gray-400"><Link href="/tasks" className="hover:text-[#405189]">Tasks</Link><span className="mx-2">&rsaquo;</span><Link href={`/tasks/${task.id}`} className="hover:text-[#405189]">{task.title}</Link><span className="mx-2">&rsaquo;</span><span>Edit</span></nav>
        <h2 className="mt-2 text-xl font-semibold text-gray-800">Edit task</h2>
        <p className="mt-1 text-sm text-gray-500">Update ownership, billing, and linked delivery context without leaving the task workspace.</p>
      </div>
      <TaskForm
        mode="edit"
        taskId={task.id}
        teamMembers={teamMembers}
        clients={clients}
        initialValues={{
          title: task.title,
          description: task.description || "",
          assignedToId: task.assignedToId,
          status: task.status,
          dueDate: new Date(task.dueDate).toISOString().slice(0, 10),
          startDate: task.startDate ? new Date(task.startDate).toISOString().slice(0, 10) : "",
          executorType: task.executorType,
          clientId: task.clientId || "",
          projectId: task.projectId || "",
          milestoneId: task.milestoneId || "",
          requesterEmployeeId: task.requesterEmployeeId || "",
          billable: task.billable,
          billingType: task.billingType === "none" ? "fixed" : task.billingType,
          amount: serializeCurrency(task.amount),
          cronEnabled: task.cronEnabled,
          cronExpression: task.cronExpression || "",
          cronTimezone: task.cronTimezone || "America/New_York",
        }}
      />
    </TaskWorkspaceShell>
  );
}

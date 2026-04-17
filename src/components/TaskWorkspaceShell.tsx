import Link from "next/link";
import { Check, Pencil, type LucideIcon } from "lucide-react";
import CompleteTaskButton from "@/components/CompleteTaskButton";
import DeleteTaskButton from "@/components/DeleteTaskButton";
import DispatchTaskButton from "@/components/DispatchTaskButton";
import TaskStatusBadge from "@/components/TaskStatusBadge";
import { formatTaskLabel } from "@/lib/tasks";

export type TaskWorkspaceSummary = {
  id: string;
  title: string;
  status: string;
  executorType: string;
  assignedToName: string;
  dueDate: string;
  clientName: string;
  projectName: string;
  canDispatch: boolean;
};

const tabs = [
  { label: "Overview", href: (id: string) => `/tasks/${id}` },
  { label: "Edit", href: (id: string) => `/tasks/${id}/edit` },
];

export default function TaskWorkspaceShell({ task, activeTab, children, liveBadge }: { task: TaskWorkspaceSummary; activeTab: "overview" | "edit"; children: React.ReactNode; liveBadge?: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 bg-gradient-to-r from-[#405189] via-[#4b5fa3] to-[#6d83c8] px-5 py-5 text-white sm:px-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-4">
              <div>
                <nav className="text-sm text-white/70"><Link href="/tasks" className="hover:text-white">Tasks</Link><span className="mx-2">&rsaquo;</span><span className="text-white">{task.title}</span></nav>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-semibold tracking-tight">{task.title}</h1>
                  <TaskStatusBadge status={task.status} />
                  <span className="inline-flex rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold capitalize text-white ring-1 ring-inset ring-white/20">{formatTaskLabel(task.executorType)}</span>
                  {liveBadge}
                </div>
              </div>
              <div className="grid gap-3 text-sm text-white/90 md:grid-cols-4">
                <div className="rounded-lg border border-white/10 bg-white/10 px-3 py-2"><div className="text-xs font-semibold uppercase tracking-wider text-white/60">Assigned to</div><div className="mt-1 font-medium text-white">{task.assignedToName}</div></div>
                <div className="rounded-lg border border-white/10 bg-white/10 px-3 py-2"><div className="text-xs font-semibold uppercase tracking-wider text-white/60">Due date</div><div className="mt-1 font-medium text-white">{task.dueDate}</div></div>
                <div className="rounded-lg border border-white/10 bg-white/10 px-3 py-2"><div className="text-xs font-semibold uppercase tracking-wider text-white/60">Client</div><div className="mt-1 font-medium text-white">{task.clientName}</div></div>
                <div className="rounded-lg border border-white/10 bg-white/10 px-3 py-2"><div className="text-xs font-semibold uppercase tracking-wider text-white/60">Project</div><div className="mt-1 font-medium text-white">{task.projectName}</div></div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 xl:justify-end">
              {task.canDispatch ? <DispatchTaskButton taskId={task.id} /> : null}
              <div className="flex items-center gap-2 rounded-xl bg-white/10 p-1.5 ring-1 ring-inset ring-white/10 backdrop-blur-sm">
                <Link href={`/tasks/${task.id}/edit`} className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500 text-white shadow-sm ring-1 ring-inset ring-white/20 transition hover:bg-blue-400" title="Edit task" aria-label="Edit task"><Pencil size={15} /></Link>
                {task.status !== "completed" ? <CompleteTaskButton taskId={task.id} taskTitle={task.title} /> : <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-sm ring-1 ring-inset ring-white/20" title="Task completed" aria-label="Task completed"><Check size={15} /></span>}
                <DeleteTaskButton taskId={task.id} taskTitle={task.title} />
              </div>
            </div>
          </div>
        </div>
        <div className="border-b border-gray-200 bg-gray-50 px-3 sm:px-4"><div className="flex flex-wrap gap-2 py-3">{tabs.map((tab) => { const isActive = (activeTab === "overview" && tab.label === "Overview") || (activeTab === "edit" && tab.label === "Edit"); return <Link key={tab.label} href={tab.href(task.id)} className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition ${isActive ? "bg-[#405189] text-white shadow-sm" : "bg-white text-gray-600 ring-1 ring-inset ring-gray-200 hover:text-[#405189]"}`}>{tab.label}</Link>; })}</div></div>
      </section>
      {children}
    </div>
  );
}

export function TaskMetaCard({ title, icon: Icon, children }: { title: string; icon: LucideIcon; children: React.ReactNode }) {
  return <section className="rounded-lg border border-gray-200 bg-white shadow-sm"><div className="flex items-center gap-2 border-b border-gray-200 px-5 py-4"><div className="rounded-md bg-[#405189]/10 p-2 text-[#405189]"><Icon size={16} /></div><h2 className="text-sm font-semibold text-gray-800">{title}</h2></div><div className="p-5">{children}</div></section>;
}

export function TaskStats({ items }: { items: Array<{ label: string; value: string }> }) {
  return <dl className="grid gap-4 sm:grid-cols-2">{items.map((item) => <div key={item.label} className="rounded-lg bg-gray-50 px-4 py-3"><dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">{item.label}</dt><dd className="mt-1 text-sm font-medium text-gray-800">{item.value}</dd></div>)}</dl>;
}

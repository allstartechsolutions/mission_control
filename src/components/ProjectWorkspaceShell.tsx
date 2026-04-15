import Link from "next/link";
import { Archive, CalendarDays, CircleDollarSign, Flag, Pencil, Plus, type LucideIcon } from "lucide-react";
import { formatEnumLabel } from "@/lib/format";

const statusStyles: Record<string, string> = {
  planned: "bg-slate-100 text-slate-700 ring-slate-500/20",
  active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  on_hold: "bg-amber-50 text-amber-700 ring-amber-600/20",
  completed: "bg-sky-50 text-sky-700 ring-sky-600/20",
};

export type ProjectWorkspaceSummary = {
  id: string;
  name: string;
  status: string;
  priority: string;
  clientId: string;
  clientName: string;
  requesterName: string | null;
  estimatedPrice: string;
  finalPrice: string;
  dueDate: string;
  milestoneCount: number;
};

const tabs = [
  { label: "Overview", href: (id: string) => `/projects/${id}` },
  { label: "Milestones", href: (id: string) => `/projects/${id}/milestones` },
  { label: "Edit", href: (id: string) => `/projects/${id}/edit` },
];

export default function ProjectWorkspaceShell({ project, activeTab, children }: { project: ProjectWorkspaceSummary; activeTab: "overview" | "milestones" | "edit"; children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 bg-gradient-to-r from-[#405189] via-[#4b5fa3] to-[#6d83c8] px-5 py-5 text-white sm:px-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-4">
              <div>
                <nav className="text-sm text-white/70">
                  <Link href="/projects" className="hover:text-white">Projects</Link>
                  <span className="mx-2">&rsaquo;</span>
                  <span className="text-white">{project.name}</span>
                </nav>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${statusStyles[project.status] || statusStyles.planned}`}>{formatEnumLabel(project.status)}</span>
                  <span className="inline-flex rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold capitalize text-white ring-1 ring-inset ring-white/20">{formatEnumLabel(project.priority)} priority</span>
                </div>
              </div>
              <div className="grid gap-3 text-sm text-white/90 md:grid-cols-4">
                <div className="rounded-lg border border-white/10 bg-white/10 px-3 py-2"><div className="text-xs font-semibold uppercase tracking-wider text-white/60">Client</div><div className="mt-1 font-medium text-white">{project.clientName}</div></div>
                <div className="rounded-lg border border-white/10 bg-white/10 px-3 py-2"><div className="text-xs font-semibold uppercase tracking-wider text-white/60">Requester</div><div className="mt-1 font-medium text-white">{project.requesterName || "Unassigned"}</div></div>
                <div className="rounded-lg border border-white/10 bg-white/10 px-3 py-2"><div className="text-xs font-semibold uppercase tracking-wider text-white/60">Estimated / final</div><div className="mt-1 font-medium text-white">{project.estimatedPrice} / {project.finalPrice}</div></div>
                <div className="rounded-lg border border-white/10 bg-white/10 px-3 py-2"><div className="text-xs font-semibold uppercase tracking-wider text-white/60">Due / milestones</div><div className="mt-1 font-medium text-white">{project.dueDate} · {project.milestoneCount}</div></div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 xl:justify-end">
              <Link href={`/tasks/new?projectId=${project.id}`} className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/15"><Plus size={15} />New task</Link>
              <Link href={`/projects/${project.id}/edit`} className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/15"><Pencil size={15} />Edit project</Link>
              <Link href={`/clients/${project.clientId}/projects`} className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-medium text-[#405189] hover:bg-slate-100">Client workspace</Link>
            </div>
          </div>
        </div>
        <div className="border-b border-gray-200 bg-gray-50 px-3 sm:px-4"><div className="flex flex-wrap gap-2 py-3">{tabs.map((tab) => { const isActive = (activeTab === "overview" && tab.label === "Overview") || (activeTab === "milestones" && tab.label === "Milestones") || (activeTab === "edit" && tab.label === "Edit"); return <Link key={tab.label} href={tab.href(project.id)} className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition ${isActive ? "bg-[#405189] text-white shadow-sm" : "bg-white text-gray-600 ring-1 ring-inset ring-gray-200 hover:text-[#405189]"}`}>{tab.label}{tab.label === "Milestones" ? <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${isActive ? "bg-white/15 text-white" : "bg-gray-100 text-gray-500"}`}>{project.milestoneCount}</span> : null}</Link>; })}</div></div>
      </section>
      {children}
    </div>
  );
}

export function ProjectMetaCard({ title, icon: Icon, children }: { title: string; icon: LucideIcon; children: React.ReactNode }) {
  return <section className="rounded-lg border border-gray-200 bg-white shadow-sm"><div className="flex items-center gap-2 border-b border-gray-200 px-5 py-4"><div className="rounded-md bg-[#405189]/10 p-2 text-[#405189]"><Icon size={16} /></div><h2 className="text-sm font-semibold text-gray-800">{title}</h2></div><div className="p-5">{children}</div></section>;
}

export function ProjectStats({ items }: { items: Array<{ label: string; value: string }> }) {
  return <dl className="grid gap-4 sm:grid-cols-2">{items.map((item) => <div key={item.label} className="rounded-lg bg-gray-50 px-4 py-3"><dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">{item.label}</dt><dd className="mt-1 text-sm font-medium text-gray-800">{item.value}</dd></div>)}</dl>;
}

const milestoneStatusStyles: Record<string, string> = {
  ...statusStyles,
  done: "bg-sky-50 text-sky-700 ring-sky-600/20",
  blocked: "bg-red-50 text-red-700 ring-red-600/20",
  archived: "bg-gray-100 text-gray-500 ring-gray-400/20",
};

export function MilestoneSummary({ items, projectId }: { items: Array<{ id?: string; projectId?: string; title: string; status: string; dueDate: string; estimatedPrice: string; finalPrice: string; description: string; taskCount?: number }>; projectId?: string }) {
  if (items.length === 0) return <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">{projectId ? <Link href={`/projects/${projectId}/milestones/new`} className="text-[#405189] hover:underline">Create the first milestone</Link> : "No milestones yet."}</div>;
  return <div className="space-y-3">{items.map((item, index) => <div key={item.id || `${item.title}-${index}`} className={`rounded-lg border border-gray-200 px-4 py-4 ${item.status === "archived" ? "bg-gray-100 opacity-75" : "bg-gray-50"}`}><div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-semibold text-gray-800">{item.id && item.projectId ? <Link href={`/projects/${item.projectId}/milestones/${item.id}`} className="hover:text-[#405189] hover:underline">{item.title}</Link> : item.title}</h3><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${milestoneStatusStyles[item.status] || milestoneStatusStyles.planned}`}>{formatEnumLabel(item.status)}</span>{item.status === "archived" ? <Archive size={14} className="text-gray-400" /> : null}{item.taskCount !== undefined ? <span className="text-xs text-gray-500">{item.taskCount} task{item.taskCount !== 1 ? "s" : ""}</span> : null}{item.id && item.projectId && item.status !== "archived" ? <Link href={`/tasks/new?milestoneId=${item.id}&projectId=${item.projectId}`} className="inline-flex items-center rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-[#405189] hover:border-[#405189]/30 hover:bg-[#405189]/5">+ Task</Link> : null}{item.id && item.projectId ? <Link href={`/projects/${item.projectId}/milestones/${item.id}/edit`} className="inline-flex items-center rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-600 hover:border-gray-300 hover:text-[#405189]"><Pencil size={12} className="mr-1" />Edit</Link> : null}</div><p className="mt-2 text-sm text-gray-600">{item.description || "No milestone notes yet."}</p></div><div className="grid gap-2 text-right text-xs text-gray-500 sm:grid-cols-3 lg:min-w-[320px]"><div><div className="font-semibold uppercase tracking-wider">Due</div><div className="mt-1 text-sm font-medium text-gray-700">{item.dueDate}</div></div><div><div className="font-semibold uppercase tracking-wider">Estimated</div><div className="mt-1 text-sm font-medium text-gray-700">{item.estimatedPrice}</div></div><div><div className="font-semibold uppercase tracking-wider">Final</div><div className="mt-1 text-sm font-medium text-gray-700">{item.finalPrice}</div></div></div></div></div>)}</div>;
}

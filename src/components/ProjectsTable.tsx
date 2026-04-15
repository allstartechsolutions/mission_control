"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Eye, Pencil, Plus, Search } from "lucide-react";
import { formatEnumLabel } from "@/lib/format";

const statusStyles: Record<string, string> = {
  planned: "bg-slate-100 text-slate-700 ring-slate-500/20",
  active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  on_hold: "bg-amber-50 text-amber-700 ring-amber-600/20",
  completed: "bg-sky-50 text-sky-700 ring-sky-600/20",
};

const priorityStyles: Record<string, string> = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-indigo-50 text-indigo-700",
  high: "bg-orange-50 text-orange-700",
  urgent: "bg-rose-50 text-rose-700",
};

type ProjectRow = {
  id: string;
  name: string;
  clientName: string;
  requesterName: string | null;
  status: string;
  priority: string;
  estimatedPrice: string;
  finalPrice: string;
  milestoneCount: number;
  dueDate: string;
};

export default function ProjectsTable({ projects, basePath = "/projects", newHref = "/projects/new", showClient = true }: { projects: ProjectRow[]; basePath?: string; newHref?: string; showClient?: boolean }) {
  const [query, setQuery] = useState("");

  const filteredProjects = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return projects;
    return projects.filter((project) => [project.name, project.clientName, project.requesterName, project.status, project.priority].filter(Boolean).some((value) => value!.toLowerCase().includes(term)));
  }, [projects, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">Projects</h2>
          <p className="text-sm text-gray-500">Search active work, review scope, and jump into each workspace.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects..." className="w-full rounded-md border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-700 outline-none focus:border-[#405189] focus:bg-white" />
          </div>
          <Link href={newHref} className="inline-flex items-center justify-center gap-2 rounded-md bg-[#405189] px-3 py-2 text-sm font-medium text-white hover:bg-[#364474]">
            <Plus size={16} />
            New project
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-4 py-3">Project</th>
                {showClient ? <th className="px-4 py-3">Client</th> : null}
                <th className="px-4 py-3">Requester</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Milestones</th>
                <th className="px-4 py-3">Estimated</th>
                <th className="px-4 py-3">Final</th>
                <th className="px-4 py-3">Due</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredProjects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50/80">
                  <td className="px-4 py-4">
                    <Link href={`${basePath}/${project.id}`} className="font-semibold text-gray-800 hover:text-[#405189]">{project.name}</Link>
                  </td>
                  {showClient ? <td className="px-4 py-4 text-gray-600">{project.clientName}</td> : null}
                  <td className="px-4 py-4 text-gray-600">{project.requesterName || "Unassigned"}</td>
                  <td className="px-4 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${statusStyles[project.status] || statusStyles.planned}`}>{formatEnumLabel(project.status)}</span></td>
                  <td className="px-4 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${priorityStyles[project.priority] || priorityStyles.medium}`}>{formatEnumLabel(project.priority)}</span></td>
                  <td className="px-4 py-4 text-gray-700">{project.milestoneCount}</td>
                  <td className="px-4 py-4 text-gray-700">{project.estimatedPrice}</td>
                  <td className="px-4 py-4 text-gray-700">{project.finalPrice}</td>
                  <td className="px-4 py-4 text-gray-600">{project.dueDate}</td>
                  <td className="px-4 py-4"><div className="flex justify-end gap-1.5"><Link href={`${basePath}/${project.id}`} className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#405189] text-white hover:bg-[#364474]" title="Open workspace"><Eye size={15} /></Link><Link href={`${basePath}/${project.id}/edit`} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:border-[#405189] hover:text-[#405189]" title="Edit project"><Pencil size={15} /></Link></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredProjects.length === 0 ? <div className="border-t border-gray-100 px-4 py-10 text-center text-sm text-gray-500">No projects matched your search.</div> : null}
      </div>
    </div>
  );
}

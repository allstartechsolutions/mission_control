import { formatTaskLabel } from "@/lib/tasks";

const statusStyles: Record<string, string> = {
  scheduled: "bg-slate-100 text-slate-700 ring-slate-500/20",
  in_progress: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
  waiting: "bg-amber-50 text-amber-700 ring-amber-500/20",
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  canceled: "bg-rose-50 text-rose-700 ring-rose-600/20",
};

export default function TaskStatusBadge({ status }: { status: string }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${statusStyles[status] || statusStyles.scheduled}`}>{formatTaskLabel(status)}</span>;
}

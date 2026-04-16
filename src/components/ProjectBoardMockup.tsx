import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCircle2, Clock3, Layers3, ListFilter, Milestone, Sparkles, TimerReset, UserRound } from "lucide-react";
import TaskStatusBadge from "@/components/TaskStatusBadge";

type BoardTask = {
  id: string;
  title: string;
  description: string;
  status: string;
  milestoneId: string | null;
  milestoneTitle: string | null;
  owner: string;
  dueLabel: string;
  executorLabel: string;
  priority: string;
  billableLabel: string;
};

type MilestoneOption = {
  id: string;
  title: string;
  status: string;
  dueLabel: string;
  taskCount: number;
};

const boardColumns = [
  { key: "backlog", label: "Backlog", tone: "border-slate-200 bg-slate-50/80", accent: "bg-slate-500" },
  { key: "scheduled", label: "Scheduled", tone: "border-sky-200 bg-sky-50/80", accent: "bg-sky-500" },
  { key: "in_progress", label: "In Progress", tone: "border-indigo-200 bg-indigo-50/70", accent: "bg-indigo-500" },
  { key: "waiting", label: "Blocked", tone: "border-rose-200 bg-rose-50/80", accent: "bg-rose-500" },
  { key: "completed", label: "Done", tone: "border-emerald-200 bg-emerald-50/80", accent: "bg-emerald-500" },
] as const;

const milestoneStyles: Record<string, string> = {
  planned: "bg-slate-100 text-slate-700 ring-slate-500/20",
  active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  on_hold: "bg-amber-50 text-amber-700 ring-amber-600/20",
  completed: "bg-sky-50 text-sky-700 ring-sky-600/20",
  blocked: "bg-rose-50 text-rose-700 ring-rose-600/20",
};

function CardPill({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-gray-600 ring-1 ring-inset ring-gray-200">{children}</span>;
}

export default function ProjectBoardMockup({
  projectId,
  projectName,
  projectStatus,
  tasks,
  milestones,
  usingPreviewData,
}: {
  projectId: string;
  projectName: string;
  projectStatus: string;
  tasks: BoardTask[];
  milestones: MilestoneOption[];
  usingPreviewData: boolean;
}) {
  const noMilestoneCount = tasks.filter((task) => !task.milestoneId).length;
  const completedCount = tasks.filter((task) => task.status === "completed").length;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-[#405189]/15 bg-gradient-to-r from-[#f8faff] to-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#405189]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#405189]">
              <Sparkles size={14} />
              Project board mockup
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-gray-900">{projectName} delivery board</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
                A project-specific kanban view with milestone context, visible loose work, and enough structure to validate the first phase before deeper workflow logic.
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[420px]">
            <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Project status</div>
              <div className="mt-2 text-sm font-semibold capitalize text-gray-800">{projectStatus.replace("_", " ")}</div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Milestones</div>
              <div className="mt-2 text-sm font-semibold text-gray-800">{milestones.length} tracked</div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Tasks</div>
              <div className="mt-2 text-sm font-semibold text-gray-800">{tasks.length} cards, {noMilestoneCount} loose</div>
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 ring-1 ring-inset ring-gray-200"><ListFilter size={13} /> Milestone filters sit above the board</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 ring-1 ring-inset ring-gray-200"><Layers3 size={13} /> Status stays left-to-right</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 ring-1 ring-inset ring-gray-200"><Milestone size={13} /> No Milestone stays visible instead of disappearing</span>
          {usingPreviewData ? <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1.5 font-medium text-amber-700 ring-1 ring-inset ring-amber-200"><TimerReset size={13} /> Preview data is filling gaps for the mockup</span> : null}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Milestone lens</h3>
              <p className="mt-1 text-xs text-gray-500">Filter the board by milestone without losing project-wide status flow.</p>
            </div>
            <Milestone size={16} className="text-[#405189]" />
          </div>
          <div className="space-y-2">
            <button className="flex w-full items-center justify-between rounded-xl border border-[#405189]/20 bg-[#405189]/5 px-3 py-3 text-left shadow-sm">
              <span>
                <span className="block text-sm font-semibold text-[#405189]">All project tasks</span>
                <span className="block text-xs text-gray-500">See the whole delivery board</span>
              </span>
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-[#405189] ring-1 ring-inset ring-[#405189]/15">{tasks.length}</span>
            </button>
            {milestones.map((milestone) => (
              <button key={milestone.id} className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-left transition hover:border-[#405189]/25 hover:bg-[#405189]/[0.03]">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-gray-800">{milestone.title}</span>
                  <span className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-gray-500">
                    <span className={`inline-flex rounded-full px-2 py-0.5 font-semibold ring-1 ring-inset ${milestoneStyles[milestone.status] || milestoneStyles.planned}`}>{milestone.status.replace("_", " ")}</span>
                    <span>{milestone.dueLabel}</span>
                  </span>
                </span>
                <span className="ml-3 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 ring-1 ring-inset ring-gray-200">{milestone.taskCount}</span>
              </button>
            ))}
            <button className="flex w-full items-center justify-between rounded-xl border border-dashed border-gray-300 bg-white px-3 py-3 text-left transition hover:border-[#405189]/30">
              <span>
                <span className="block text-sm font-semibold text-gray-800">No milestone</span>
                <span className="block text-xs text-gray-500">Loose project tasks that still belong on the board</span>
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-inset ring-slate-200">{noMilestoneCount}</span>
            </button>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-800"><CheckCircle2 size={16} className="text-emerald-600" /> First-phase fit</div>
            <ul className="mt-3 space-y-2 text-xs leading-5 text-gray-600">
              <li>Real project page, not a disconnected concept doc.</li>
              <li>Cards can graduate into drag-and-drop later.</li>
              <li>Milestones act like a lens, not a separate backlog.</li>
            </ul>
          </div>
        </aside>

        <div className="space-y-4">
          <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
            {boardColumns.map((column) => {
              const columnTasks = tasks.filter((task) => task.status === column.key);
              return (
                <div key={column.key} className={`rounded-xl border p-3 shadow-sm ${column.tone}`}>
                  <div className="mb-3 flex items-center justify-between rounded-lg bg-white/90 px-3 py-2 ring-1 ring-inset ring-white/70">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${column.accent}`} />
                      <h3 className="text-sm font-semibold text-gray-800">{column.label}</h3>
                    </div>
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">{columnTasks.length}</span>
                  </div>
                  <div className="space-y-3">
                    {columnTasks.map((task) => (
                      <article key={task.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900">{task.title}</h4>
                            <p className="mt-1 text-xs leading-5 text-gray-500">{task.description}</p>
                          </div>
                          <TaskStatusBadge status={task.status} />
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <CardPill>{task.milestoneTitle || "No Milestone"}</CardPill>
                          <CardPill>{task.priority} priority</CardPill>
                          <CardPill>{task.executorLabel}</CardPill>
                          <CardPill>{task.billableLabel}</CardPill>
                        </div>
                        <div className="mt-4 grid gap-2 text-xs text-gray-500 sm:grid-cols-2">
                          <div className="inline-flex items-center gap-1.5"><UserRound size={13} /> {task.owner}</div>
                          <div className="inline-flex items-center gap-1.5"><CalendarDays size={13} /> {task.dueLabel}</div>
                        </div>
                      </article>
                    ))}
                    {columnTasks.length === 0 ? <div className="rounded-xl border border-dashed border-gray-300 bg-white/80 px-4 py-8 text-center text-xs text-gray-500">No cards in {column.label.toLowerCase()}.</div> : null}
                  </div>
                </div>
              );
            })}
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Milestone-aware board summary</h3>
                <p className="mt-1 text-xs text-gray-500">A second read of the same work, showing that milestones are context layered onto the board, not a separate planning object.</p>
              </div>
              <Link href={`/tasks/new?projectId=${projectId}`} className="inline-flex items-center gap-2 rounded-md bg-[#405189] px-3 py-2 text-sm font-medium text-white hover:bg-[#364474]">
                Add project task <ArrowRight size={15} />
              </Link>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {milestones.map((milestone) => {
                const milestoneTasks = tasks.filter((task) => task.milestoneId === milestone.id);
                return (
                  <div key={milestone.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-gray-800">{milestone.title}</div>
                        <div className="mt-1 text-xs text-gray-500">{milestone.dueLabel}</div>
                      </div>
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${milestoneStyles[milestone.status] || milestoneStyles.planned}`}>{milestone.status.replace("_", " ")}</span>
                    </div>
                    <div className="mt-3 space-y-2">
                      {milestoneTasks.slice(0, 3).map((task) => <div key={task.id} className="rounded-lg bg-white px-3 py-2 text-xs text-gray-600 ring-1 ring-inset ring-gray-200">{task.title}</div>)}
                      {milestoneTasks.length === 0 ? <div className="rounded-lg border border-dashed border-gray-300 px-3 py-3 text-xs text-gray-500">No linked cards yet.</div> : null}
                    </div>
                  </div>
                );
              })}
              <div className="rounded-xl border border-dashed border-gray-300 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-gray-800">No Milestone</div>
                    <div className="mt-1 text-xs text-gray-500">Backlog and support work that still belongs inside the project.</div>
                  </div>
                  <Clock3 size={16} className="text-slate-400" />
                </div>
                <div className="mt-3 space-y-2">
                  {tasks.filter((task) => !task.milestoneId).slice(0, 3).map((task) => <div key={task.id} className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700 ring-1 ring-inset ring-slate-200">{task.title}</div>)}
                  {noMilestoneCount === 0 ? <div className="rounded-lg border border-dashed border-gray-300 px-3 py-3 text-xs text-gray-500">No loose project work right now.</div> : null}
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-500">
              <span>{completedCount} completed card{completedCount === 1 ? "" : "s"} already visible in context.</span>
              <span>Loose work and milestone work share one operating surface.</span>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

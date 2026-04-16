"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, InputHTMLAttributes, useEffect, useMemo, useState } from "react";
import DatePicker from "@/components/DatePicker";
import SearchableSelect from "@/components/SearchableSelect";
import { cronExpressionFromBuilder, defaultCronTimezone, describeCronSchedule, formatTaskLabel, getDefaultTaskScheduleBuilderState, getExecutorBehavior, inferTaskScheduleBuilderState, isNonHumanExecutor, taskBillingTypeOptions, taskExecutorTypeOptions, taskStatusOptions, weekdayOptions, type TaskScheduleBuilderState } from "@/lib/tasks";

type TaskFormValues = {
  title: string;
  description: string;
  assignedToId: string;
  status: string;
  dueDate: string;
  startDate: string;
  executorType: string;
  clientId: string;
  projectId: string;
  milestoneId: string;
  requesterEmployeeId: string;
  billable: boolean;
  billingType: string;
  amount: string;
  cronEnabled: boolean;
  cronExpression: string;
  cronTimezone: string;
  boardColumnId: string;
};

type ClientOption = {
  id: string;
  companyName: string;
  employees: Array<{ id: string; name: string; title: string | null; email: string | null; status: string }>;
  projects: Array<{ id: string; name: string; milestones: Array<{ id: string; title: string }> }>;
};

type TaskContext = {
  clientLocked?: boolean;
  projectLocked?: boolean;
  milestoneLocked?: boolean;
  contextLabel?: string;
  backHref?: string;
};

const defaultValues: TaskFormValues = {
  title: "",
  description: "",
  assignedToId: "",
  status: "scheduled",
  dueDate: "",
  startDate: "",
  executorType: "human",
  clientId: "",
  projectId: "",
  milestoneId: "",
  requesterEmployeeId: "",
  billable: false,
  billingType: "fixed",
  amount: "",
  cronEnabled: false,
  cronExpression: "",
  cronTimezone: defaultCronTimezone,
  boardColumnId: "",
};

function Field({ label, hint, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return <label className="block space-y-1.5"><span className="text-sm font-medium text-gray-700">{label}</span><input {...props} className="form-control" />{hint ? <span className="block text-xs text-gray-500">{hint}</span> : null}</label>;
}

export default function TaskForm({ mode, taskId, initialValues, teamMembers, clients, context }: { mode: "create" | "edit"; taskId?: string; initialValues?: Partial<TaskFormValues>; teamMembers: Array<{ id: string; name: string | null; email: string; role: string; status: string }>; clients: ClientOption[]; context?: TaskContext; }) {
  const router = useRouter();
  const [values, setValues] = useState<TaskFormValues>({ ...defaultValues, ...initialValues });
  const [scheduleBuilder, setScheduleBuilder] = useState<TaskScheduleBuilderState>(() => inferTaskScheduleBuilderState(initialValues?.cronEnabled, initialValues?.cronExpression, initialValues?.cronTimezone));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const endpoint = useMemo(() => (mode === "create" ? "/api/tasks" : `/api/tasks/${taskId}`), [mode, taskId]);
  const method = mode === "create" ? "POST" : "PATCH";
  const isNonHuman = isNonHumanExecutor(values.executorType);
  const executorBehavior = getExecutorBehavior(values.executorType);

  const assigneeOptions = teamMembers.filter((member) => member.status === "active").map((member) => ({ value: member.id, label: member.name || member.email, description: [member.role, member.email].filter(Boolean).join(" • ") }));
  const clientOptions = clients.map((client) => ({ value: client.id, label: client.companyName, description: `${client.projects.length} projects • ${client.employees.filter((employee) => employee.status === "active").length} active contacts` }));
  const selectedClient = clients.find((client) => client.id === values.clientId);
  const selectedProject = selectedClient?.projects.find((project) => project.id === values.projectId);
  const projectOptions = (selectedClient?.projects || []).map((project) => ({ value: project.id, label: project.name, description: `${project.milestones.length} milestones` }));
  const milestoneOptions = (selectedProject?.milestones || []).map((milestone) => ({ value: milestone.id, label: milestone.title }));
  const requesterOptions = (selectedClient?.employees || []).filter((employee) => employee.status === "active").map((employee) => ({ value: employee.id, label: employee.name, description: [employee.title, employee.email].filter(Boolean).join(" • ") || "Active requester" }));

  useEffect(() => {
    if (values.projectId && !projectOptions.some((option) => option.value === values.projectId)) {
      setValues((current) => ({ ...current, projectId: "", milestoneId: "" }));
    }
  }, [projectOptions, values.projectId]);

  useEffect(() => {
    if (values.milestoneId && !milestoneOptions.some((option) => option.value === values.milestoneId)) {
      setValues((current) => ({ ...current, milestoneId: "" }));
    }
  }, [milestoneOptions, values.milestoneId]);

  useEffect(() => {
    if (values.requesterEmployeeId && !requesterOptions.some((option) => option.value === values.requesterEmployeeId)) {
      setValues((current) => ({ ...current, requesterEmployeeId: "" }));
    }
  }, [requesterOptions, values.requesterEmployeeId]);

  useEffect(() => {
    if (!isNonHuman) {
      setValues((current) => ({ ...current, cronEnabled: false, cronExpression: "", cronTimezone: defaultCronTimezone }));
      setScheduleBuilder(getDefaultTaskScheduleBuilderState());
    }
  }, [isNonHuman]);

  function updateValue<K extends keyof TaskFormValues>(key: K, value: TaskFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function updateSchedule<Key extends keyof TaskScheduleBuilderState>(key: Key, value: TaskScheduleBuilderState[Key]) {
    setScheduleBuilder((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    let derivedCronEnabled = false;
    let derivedCronExpression = "";
    let derivedCronTimezone = defaultCronTimezone;

    if (isNonHuman) {
      try {
        const derived = cronExpressionFromBuilder(scheduleBuilder);
        derivedCronEnabled = derived.cronEnabled;
        derivedCronExpression = derived.cronExpression || "";
        derivedCronTimezone = derived.cronTimezone;
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "Unable to build the schedule.");
        setSaving(false);
        return;
      }
    }

    const formData = new FormData();
    formData.set("title", values.title);
    formData.set("description", values.description);
    formData.set("assignedToId", values.assignedToId);
    formData.set("status", values.status);
    formData.set("dueDate", values.dueDate);
    formData.set("startDate", values.startDate);
    formData.set("executorType", values.executorType);
    formData.set("clientId", values.clientId);
    formData.set("projectId", values.projectId);
    formData.set("milestoneId", values.milestoneId);
    formData.set("requesterEmployeeId", values.requesterEmployeeId);
    formData.set("billable", String(values.billable));
    formData.set("billingType", values.billingType);
    formData.set("amount", values.amount);
    formData.set("cronEnabled", String(isNonHuman && derivedCronEnabled));
    formData.set("cronExpression", isNonHuman ? derivedCronExpression : "");
    formData.set("cronTimezone", isNonHuman ? derivedCronTimezone : "");
    formData.set("boardColumnId", values.boardColumnId);

    const response = await fetch(endpoint, { method, body: formData });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(data.error || `Unable to ${mode} task.`);
      setSaving(false);
      return;
    }

    router.push(`/tasks/${data.task.id}`);
    router.refresh();
  }

  const generatedSchedule = useMemo(() => {
    if (!isNonHuman || scheduleBuilder.mode === "none") return { summary: "", cronExpression: "" };
    try {
      const built = cronExpressionFromBuilder(scheduleBuilder);
      return {
        summary: describeCronSchedule(built.cronExpression, built.cronTimezone),
        cronExpression: built.cronExpression || "",
      };
    } catch {
      return { summary: "Finish the schedule fields to preview the run timing.", cronExpression: "" };
    }
  }, [isNonHuman, scheduleBuilder]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4"><h2 className="text-sm font-semibold text-gray-800">Task details</h2><p className="mt-1 text-sm text-gray-500">Capture ownership, status, due dates, and optional client delivery context.</p></div>
        <div className="grid gap-4 p-5 md:grid-cols-2">
          <div className="md:col-span-2"><Field label="Task title" value={values.title} onChange={(event) => updateValue("title", event.target.value)} placeholder="Follow up on mobile rollout blockers" required /></div>
          <SearchableSelect label="Assigned to" placeholder="Select a team member" searchPlaceholder="Search team..." emptyMessage="No active team members matched." value={values.assignedToId} onChange={(value) => updateValue("assignedToId", value)} options={assigneeOptions} hint="Required. Defaults are validated against active team members." />
          <label className="block space-y-1.5"><span className="text-sm font-medium text-gray-700">Status</span><select value={values.status} onChange={(event) => updateValue("status", event.target.value)} className="form-select">{taskStatusOptions.map((option) => <option key={option} value={option}>{formatTaskLabel(option)}</option>)}</select></label>
          <DatePicker label="Due date" value={values.dueDate} onChange={(value) => updateValue("dueDate", value)} required hint="Required for every task." />
          <DatePicker label="Start date" value={values.startDate} onChange={(value) => updateValue("startDate", value)} />
          <label className="block space-y-1.5"><span className="text-sm font-medium text-gray-700">Executor type</span><select value={values.executorType} onChange={(event) => updateValue("executorType", event.target.value)} className="form-select">{taskExecutorTypeOptions.map((option) => <option key={option} value={option}>{formatTaskLabel(option)}</option>)}</select></label>
          <div className="md:col-span-2 rounded-lg border border-[#405189]/15 bg-[#405189]/5 px-4 py-3 text-sm text-gray-700">
            <div className="font-semibold text-[#405189]">{executorBehavior.label}</div>
            <p className="mt-1">{executorBehavior.summary}</p>
            {isNonHuman ? <p className="mt-2 text-xs text-gray-500">Non-human executors can be scheduled with a simple builder below. Mission Control still stores the cron behind the scenes.</p> : <p className="mt-2 text-xs text-gray-500">Human tasks stay manually operated, so scheduling controls stay hidden.</p>}
          </div>
          <div className="md:col-span-2"><label className="block space-y-1.5"><span className="text-sm font-medium text-gray-700">Description</span><textarea value={values.description} onChange={(event) => updateValue("description", event.target.value)} rows={4} placeholder="Add delivery notes, dependencies, or next steps." className="form-control" /></label></div>
        </div>
      </div>

      {isNonHuman ? (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-4"><h2 className="text-sm font-semibold text-gray-800">Execution scheduling</h2><p className="mt-1 text-sm text-gray-500">Pick how this non-human task should run. Mission Control generates the cron expression behind the scenes and keeps it pinned to Eastern time by default.</p></div>
          <div className="space-y-4 p-5">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-gray-700">Schedule type</span>
              <select value={scheduleBuilder.mode} onChange={(event) => updateSchedule("mode", event.target.value as TaskScheduleBuilderState["mode"])} className="form-select">
                <option value="none">Run manually only</option>
                <option value="one_time">One time</option>
                <option value="daily">Daily</option>
                <option value="weekdays">Weekdays</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="custom">Custom cron</option>
              </select>
            </label>

            {scheduleBuilder.mode !== "none" ? (
              <div className="grid gap-4 md:grid-cols-2">
                {scheduleBuilder.mode === "one_time" ? <DatePicker label="Run date" value={scheduleBuilder.date} onChange={(value) => updateSchedule("date", value)} required hint="Single run date for this task." /> : null}
                {scheduleBuilder.mode !== "custom" ? <Field label="Run time" type="time" value={scheduleBuilder.time} onChange={(event) => updateSchedule("time", event.target.value)} required hint="Stored in Eastern time unless you explicitly change the timezone." /> : null}
                {scheduleBuilder.mode === "weekly" ? <label className="block space-y-1.5"><span className="text-sm font-medium text-gray-700">Day of week</span><select value={scheduleBuilder.dayOfWeek} onChange={(event) => updateSchedule("dayOfWeek", event.target.value)} className="form-select">{weekdayOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label> : null}
                {scheduleBuilder.mode === "monthly" ? <Field label="Day of month" type="number" min="1" max="31" value={scheduleBuilder.dayOfMonth} onChange={(event) => updateSchedule("dayOfMonth", event.target.value)} required hint="Mission Control will run it on this day each month." /> : null}
                <Field label="Timezone" value={scheduleBuilder.timezone} onChange={(event) => updateSchedule("timezone", event.target.value)} placeholder={defaultCronTimezone} hint="Defaults to America/New_York for Mission Control operations." required />
                {scheduleBuilder.mode === "custom" ? <div className="md:col-span-2"><Field label="Custom cron expression" value={scheduleBuilder.customExpression} onChange={(event) => updateSchedule("customExpression", event.target.value)} placeholder="0 6 * * 1-5" hint="Use this only when the builder options do not fit." required /></div> : null}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">This task will stay manual until you choose a recurring or one-time schedule.</div>
            )}

            {scheduleBuilder.mode !== "none" ? (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                <div className="font-medium">Schedule preview</div>
                <div className="mt-1">{generatedSchedule.summary}</div>
                {scheduleBuilder.mode !== "custom" && generatedSchedule.cronExpression ? <div className="mt-2 text-xs text-emerald-700">Generated cron: {generatedSchedule.cronExpression}</div> : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4"><h2 className="text-sm font-semibold text-gray-800">Linked context</h2><p className="mt-1 text-sm text-gray-500">Tasks can stand alone or connect to a client, project, and milestone.</p></div>
        <div className="grid gap-4 p-5 md:grid-cols-2">
          {mode === "create" && context?.contextLabel ? <div className="md:col-span-2 rounded-lg border border-[#405189]/15 bg-[#405189]/5 px-4 py-3 text-sm text-gray-700">Creating from <span className="font-semibold text-[#405189]">{context.contextLabel}</span>. Linked context is already narrowed for faster task capture.</div> : null}
          <SearchableSelect label="Client" placeholder="Optional client" searchPlaceholder="Search clients..." emptyMessage="No clients matched." value={values.clientId} onChange={(value) => updateValue("clientId", value)} options={clientOptions} disabled={context?.clientLocked} clearable={!context?.clientLocked} hint={context?.clientLocked ? "This task is being created from a specific client context." : "Optional. Selecting a client filters requester and project choices."} />
          <SearchableSelect label="Requester" placeholder={values.clientId ? "Optional requester" : "Choose a client first"} searchPlaceholder="Search requester..." emptyMessage={values.clientId ? "No active contacts matched." : "Select a client first."} value={values.requesterEmployeeId} onChange={(value) => updateValue("requesterEmployeeId", value)} options={requesterOptions} disabled={!values.clientId} clearable hint="Optional. Searchable and filtered to active contacts for the selected client." />
          <SearchableSelect label="Project" placeholder={values.clientId ? "Optional project" : "Choose a client first"} searchPlaceholder="Search projects..." emptyMessage={values.clientId ? "No projects matched." : "Select a client first."} value={values.projectId} onChange={(value) => updateValue("projectId", value)} options={projectOptions} disabled={!values.clientId || context?.projectLocked} clearable={!context?.projectLocked} hint={context?.projectLocked ? "This task is being created from a specific project context." : "Optional. Tasks remain first-class even without a project link."} />
          <SearchableSelect label="Milestone" placeholder={values.projectId ? "Optional milestone" : "Choose a project first"} searchPlaceholder="Search milestones..." emptyMessage={values.projectId ? "No milestones matched." : "Select a project first."} value={values.milestoneId} onChange={(value) => updateValue("milestoneId", value)} options={milestoneOptions} disabled={!values.projectId || context?.milestoneLocked} clearable={!context?.milestoneLocked} hint={context?.milestoneLocked ? "This task is being created from a specific milestone context." : "Optional. Filtered by the selected project."} />
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4"><h2 className="text-sm font-semibold text-gray-800">Billing</h2><p className="mt-1 text-sm text-gray-500">Only show billable details when the task actually needs billing data.</p></div>
        <div className="space-y-4 p-5">
          <label className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700"><input type="checkbox" checked={values.billable} onChange={(event) => updateValue("billable", event.target.checked)} className="h-4 w-4 rounded border-gray-300 text-[#405189] focus:ring-[#405189]" />Billable task</label>
          {values.billable ? <div className="grid gap-4 md:grid-cols-2"><label className="block space-y-1.5"><span className="text-sm font-medium text-gray-700">Billing type</span><select value={values.billingType} onChange={(event) => updateValue("billingType", event.target.value)} className="form-select">{taskBillingTypeOptions.filter((option) => option !== "none").map((option) => <option key={option} value={option}>{formatTaskLabel(option)}</option>)}</select></label><Field label="Amount" value={values.amount} onChange={(event) => updateValue("amount", event.target.value)} placeholder="450.00" hint="Future-ready billed tracking is stored separately in the task schema." /></div> : null}
        </div>
      </div>

      {error ? <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Link href={mode === "create" ? (context?.backHref || "/tasks") : `/tasks/${taskId}`} className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50">Cancel</Link><button type="submit" disabled={saving} className="inline-flex items-center justify-center rounded-md bg-[#405189] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#364474] disabled:cursor-not-allowed disabled:opacity-60">{saving ? (mode === "create" ? "Creating task..." : "Saving changes...") : mode === "create" ? "Create task" : "Save changes"}</button></div>
    </form>
  );
}

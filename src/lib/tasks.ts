import { Prisma, TaskBillingType, TaskExecutorType, TaskStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { computeNextRunAt } from "@/lib/cron";
import { formatEnumLabel } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const taskStatusOptions = Object.values(TaskStatus);
export const taskExecutorTypeOptions = Object.values(TaskExecutorType);
export const taskBillingTypeOptions = Object.values(TaskBillingType);
export const defaultCronTimezone = "America/New_York";
export const weekdayOptions = [
  { value: "1", label: "Monday", shortLabel: "Mon" },
  { value: "2", label: "Tuesday", shortLabel: "Tue" },
  { value: "3", label: "Wednesday", shortLabel: "Wed" },
  { value: "4", label: "Thursday", shortLabel: "Thu" },
  { value: "5", label: "Friday", shortLabel: "Fri" },
  { value: "6", label: "Saturday", shortLabel: "Sat" },
  { value: "0", label: "Sunday", shortLabel: "Sun" },
] as const;

export type TaskScheduleMode = "none" | "one_time" | "daily" | "weekdays" | "weekly" | "monthly" | "custom";

export type TaskScheduleBuilderState = {
  mode: TaskScheduleMode;
  time: string;
  dayOfWeek: string;
  dayOfMonth: string;
  date: string;
  customExpression: string;
  timezone: string;
};

type CronDateParts = {
  minute: number;
  hour: number;
  dayOfMonth: number;
  month: number;
  dayOfWeek: number;
  year: number;
};

const taskLabelMap: Record<string, string> = {
  scheduled: "Scheduled",
  in_progress: "In Progress",
  waiting: "Waiting",
  failed: "Failed",
  completed: "Completed",
  canceled: "Canceled",
  overdue: "Overdue",
  human: "Human",
  hulk: "Hulk",
  agent: "Agent",
  automation: "Automation",
  none: "None",
  fixed: "Fixed",
  hourly: "Hourly",
};

const defaultScheduleBuilderState: TaskScheduleBuilderState = {
  mode: "none",
  time: "09:00",
  dayOfWeek: "1",
  dayOfMonth: "1",
  date: "",
  customExpression: "",
  timezone: defaultCronTimezone,
};

function parseTimeParts(value: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) throw new Error("Choose a valid execution time.");
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) throw new Error("Choose a valid execution time.");
  return { hours, minutes };
}

function normalizeDayOfMonth(value: string) {
  const day = Number(value);
  if (!Number.isInteger(day) || day < 1 || day > 31) throw new Error("Choose a valid day of month.");
  return String(day);
}

function getCronDateParts(date: Date, timezone: string): CronDateParts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
    weekday: "short",
  });

  const parts = formatter.formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value || "";
  const weekdayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  return {
    minute: Number(value("minute")),
    hour: Number(value("hour")),
    dayOfMonth: Number(value("day")),
    month: Number(value("month")),
    dayOfWeek: weekdayMap[value("weekday")] ?? 0,
    year: Number(value("year")),
  };
}

function matchesCronField(field: string, value: number, minimum: number) {
  return field.split(",").some((segment) => {
    const trimmed = segment.trim();
    if (!trimmed) return false;

    const [base, stepRaw] = trimmed.split("/");
    const step = stepRaw ? Number(stepRaw) : 1;
    if (!Number.isInteger(step) || step < 1) return false;

    if (base === "*") return ((value - minimum) % step) === 0;
    if (/^\d+$/.test(base)) return value === Number(base);

    const rangeMatch = /^(\d+)-(\d+)$/.exec(base);
    if (!rangeMatch) return false;

    const start = Number(rangeMatch[1]);
    const end = Number(rangeMatch[2]);
    if (start > end || value < start || value > end) return false;
    return ((value - start) % step) === 0;
  });
}

export function getDefaultTaskScheduleBuilderState(): TaskScheduleBuilderState {
  return { ...defaultScheduleBuilderState };
}

export function cronExpressionFromBuilder(schedule: TaskScheduleBuilderState) {
  const timezone = schedule.timezone?.trim() || defaultCronTimezone;

  switch (schedule.mode) {
    case "none":
      return { cronEnabled: false, cronExpression: null as string | null, cronTimezone: timezone };
    case "daily": {
      const { hours, minutes } = parseTimeParts(schedule.time);
      return { cronEnabled: true, cronExpression: `${minutes} ${hours} * * *`, cronTimezone: timezone };
    }
    case "weekdays": {
      const { hours, minutes } = parseTimeParts(schedule.time);
      return { cronEnabled: true, cronExpression: `${minutes} ${hours} * * 1-5`, cronTimezone: timezone };
    }
    case "weekly": {
      const { hours, minutes } = parseTimeParts(schedule.time);
      return { cronEnabled: true, cronExpression: `${minutes} ${hours} * * ${schedule.dayOfWeek || "1"}`, cronTimezone: timezone };
    }
    case "monthly": {
      const { hours, minutes } = parseTimeParts(schedule.time);
      return { cronEnabled: true, cronExpression: `${minutes} ${hours} ${normalizeDayOfMonth(schedule.dayOfMonth)} * *`, cronTimezone: timezone };
    }
    case "one_time": {
      if (!schedule.date) throw new Error("Choose a date for the one-time run.");
      const { hours, minutes } = parseTimeParts(schedule.time);
      const [year, month, day] = schedule.date.split("-");
      if (!year || !month || !day) throw new Error("Choose a valid date for the one-time run.");
      return { cronEnabled: true, cronExpression: `${minutes} ${hours} ${Number(day)} ${Number(month)} * ${year}`, cronTimezone: timezone };
    }
    case "custom": {
      const expression = schedule.customExpression.trim();
      if (!expression) throw new Error("Cron expression is required for a custom schedule.");
      return { cronEnabled: true, cronExpression: expression, cronTimezone: timezone };
    }
    default:
      return { cronEnabled: false, cronExpression: null as string | null, cronTimezone: timezone };
  }
}

function isNumericCronTimeField(value: string) {
  return /^\d{1,2}$/.test(value);
}

function formatScheduleTimeLabel(value: string) {
  if (!/^\d{2}:\d{2}$/.test(value)) return "";
  const formatted = new Date(`2000-01-01T${value}:00`);
  if (Number.isNaN(formatted.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(formatted);
}

export function inferTaskScheduleBuilderState(cronEnabled: boolean | null | undefined, cronExpression: string | null | undefined, cronTimezone: string | null | undefined): TaskScheduleBuilderState {
  const timezone = cronTimezone || defaultCronTimezone;
  if (!cronEnabled || !cronExpression) return { ...defaultScheduleBuilderState, timezone };

  const expression = cronExpression.trim();
  const parts = expression.split(/\s+/);

  if (parts.length === 6 && /^\d{4}$/.test(parts[5])) {
    const [minute, hour, day, month, _weekday, year] = parts;
    if (isNumericCronTimeField(minute) && isNumericCronTimeField(hour)) {
      return {
        mode: "one_time",
        time: `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`,
        dayOfWeek: "1",
        dayOfMonth: day,
        date: `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`,
        customExpression: expression,
        timezone,
      };
    }
  }

  if (parts.length === 5) {
    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

    if (isNumericCronTimeField(minute) && isNumericCronTimeField(hour)) {
      const time = `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;

      if (dayOfMonth === "*" && month === "*" && dayOfWeek === "*") return { ...defaultScheduleBuilderState, mode: "daily", time, customExpression: expression, timezone };
      if (dayOfMonth === "*" && month === "*" && dayOfWeek === "1-5") return { ...defaultScheduleBuilderState, mode: "weekdays", time, customExpression: expression, timezone };
      if (dayOfMonth === "*" && month === "*" && /^[0-6]$/.test(dayOfWeek)) return { ...defaultScheduleBuilderState, mode: "weekly", time, dayOfWeek, customExpression: expression, timezone };
      if (/^\d{1,2}$/.test(dayOfMonth) && month === "*" && dayOfWeek === "*") return { ...defaultScheduleBuilderState, mode: "monthly", time, dayOfMonth, customExpression: expression, timezone };
    }
  }

  return { ...defaultScheduleBuilderState, mode: "custom", customExpression: expression, timezone };
}

export function describeCronSchedule(cronExpression: string | null | undefined, cronTimezone: string | null | undefined) {
  if (!cronExpression) return "Not scheduled";
  const schedule = inferTaskScheduleBuilderState(true, cronExpression, cronTimezone);
  const timeLabel = formatScheduleTimeLabel(schedule.time);
  const timezoneLabel = schedule.timezone || defaultCronTimezone;

  switch (schedule.mode) {
    case "one_time":
      return `One time on ${formatDate(schedule.date)} at ${timeLabel} (${timezoneLabel})`;
    case "daily":
      return `Daily at ${timeLabel} (${timezoneLabel})`;
    case "weekdays":
      return `Weekdays at ${timeLabel} (${timezoneLabel})`;
    case "weekly": {
      const weekday = weekdayOptions.find((option) => option.value === schedule.dayOfWeek)?.label || "Selected day";
      return `Weekly on ${weekday} at ${timeLabel} (${timezoneLabel})`;
    }
    case "monthly":
      return `Monthly on day ${schedule.dayOfMonth} at ${timeLabel} (${timezoneLabel})`;
    case "custom":
      return `Custom cron: ${cronExpression} (${timezoneLabel})`;
    default:
      return "Not scheduled";
  }
}

export function matchesCronExpression(cronExpression: string, timezone: string, date: Date) {
  const fields = cronExpression.trim().split(/\s+/);
  if (fields.length !== 5 && fields.length !== 6) throw new Error("Cron expressions must have 5 fields, or 6 fields including year.");

  const [minute, hour, dayOfMonth, month, dayOfWeek, year] = fields;
  const parts = getCronDateParts(date, timezone);

  return matchesCronField(minute, parts.minute, 0)
    && matchesCronField(hour, parts.hour, 0)
    && matchesCronField(dayOfMonth, parts.dayOfMonth, 1)
    && matchesCronField(month, parts.month, 1)
    && matchesCronField(dayOfWeek, parts.dayOfWeek === 0 ? 0 : parts.dayOfWeek, 0)
    && (!year || matchesCronField(year, parts.year, 1970));
}

export function getNextCronRunAt(cronExpression: string, timezone: string, fromDate = new Date()) {
  const fields = cronExpression.trim().split(/\s+/);
  if (fields.length !== 5 && fields.length !== 6) throw new Error("Cron expressions must have 5 fields, or 6 fields including year.");

  const limitMinutes = fields.length === 6 ? 60 * 24 * 366 * 5 : 60 * 24 * 366;
  const cursor = new Date(fromDate);
  cursor.setSeconds(0, 0);
  cursor.setMinutes(cursor.getMinutes() + 1);

  for (let checked = 0; checked < limitMinutes; checked += 1) {
    if (matchesCronExpression(cronExpression, timezone, cursor)) return new Date(cursor);
    cursor.setMinutes(cursor.getMinutes() + 1);
  }

  return null;
}

export function toNullableString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function parseCurrency(value: string | null | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  const normalized = Number(trimmed.replace(/[$,\s]/g, ""));
  if (Number.isNaN(normalized)) throw new Error("Invalid currency value.");
  return new Prisma.Decimal(normalized.toFixed(2));
}

export function parseDate(value: string | null | undefined, label = "date") {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  const date = new Date(`${trimmed}T00:00:00`);
  if (Number.isNaN(date.getTime())) throw new Error(`Invalid ${label} value.`);
  return date;
}

export function serializeCurrency(value: Prisma.Decimal | number | string | null | undefined) {
  if (value == null) return "";
  return Number(value).toFixed(2);
}

export function formatCurrency(value: Prisma.Decimal | number | null | undefined) {
  if (value == null) return "Not set";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value));
}

export function formatDate(value: Date | string | null | undefined) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export function formatDateTime(value: Date | string | null | undefined) {
  if (!value) return "Not scheduled";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatTaskLabel(value: string) {
  return taskLabelMap[value] ?? formatEnumLabel(value);
}

export function isNonHumanExecutor(executorType: string | null | undefined) {
  return executorType === "hulk" || executorType === "agent" || executorType === "automation";
}

export function sanitizeCronFields(input: { executorType: string; cronEnabled: boolean; cronExpression: string | null; cronTimezone: string | null; }) {
  if (!isNonHumanExecutor(input.executorType)) {
    return {
      cronEnabled: false,
      cronExpression: null,
      cronTimezone: null,
      cronNextRunAt: null,
      cronLastRunAt: null,
    };
  }

  if (!input.cronEnabled) {
    return {
      cronEnabled: false,
      cronExpression: null,
      cronTimezone: defaultCronTimezone,
      cronNextRunAt: null,
      cronLastRunAt: null,
    };
  }

  if (!input.cronExpression) throw new Error("Cron expression is required when scheduled execution is enabled.");

  const cronTimezone = input.cronTimezone || defaultCronTimezone;

  return {
    cronEnabled: true,
    cronExpression: input.cronExpression,
    cronTimezone,
    cronNextRunAt: computeNextRunAt(input.cronExpression, cronTimezone),
  };
}

export function getExecutorBehavior(executorType: string) {
  switch (executorType) {
    case "hulk":
      return {
        label: "Hulk runbook",
        summary: "Operator-driven execution with a named teammate or field operator carrying the run.",
        scheduledAction: "Dispatch Hulk",
        inProgressAction: "Hulk running now",
        waitingAction: "Waiting on Hulk follow-up",
        failedAction: "Hulk run failed",
        completedAction: "Hulk run complete",
      };
    case "agent":
      return {
        label: "Agent execution",
        summary: "An AI or software agent owns the active execution path and reports back through the task.",
        scheduledAction: "Launch agent",
        inProgressAction: "Agent is executing",
        waitingAction: "Waiting on agent input",
        failedAction: "Agent run failed",
        completedAction: "Agent run complete",
      };
    case "automation":
      return {
        label: "Automation job",
        summary: "System-triggered execution intended for repeatable or unattended operations.",
        scheduledAction: "Queue automation",
        inProgressAction: "Automation is running",
        waitingAction: "Waiting on automation condition",
        failedAction: "Automation failed",
        completedAction: "Automation run complete",
      };
    case "human":
    default:
      return {
        label: "Human task",
        summary: "A person owns the work and the task acts as the operating record.",
        scheduledAction: "Start",
        inProgressAction: "In progress",
        waitingAction: "Waiting",
        failedAction: "Failed",
        completedAction: "Done",
      };
  }
}

export function buildTaskNextStepLabel(task: {
  status: string;
  dueDate: Date;
  executorType: string;
  cronEnabled?: boolean | null;
  cronExpression?: string | null;
  cronTimezone?: string | null;
  cronNextRunAt?: Date | string | null;
  requesterEmployee?: { name: string | null } | null;
  assignedTo: { name: string | null; email: string };
}) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  const dueDate = new Date(task.dueDate);
  const requesterName = task.requesterEmployee?.name || "requester";
  const ownerName = task.assignedTo.name || task.assignedTo.email;
  const executor = getExecutorBehavior(task.executorType);
  const scheduleSuffix = task.cronEnabled
    ? task.cronNextRunAt
      ? ` Next scheduled run ${formatDateTime(task.cronNextRunAt)}.`
      : task.cronExpression
        ? ` ${describeCronSchedule(task.cronExpression, task.cronTimezone)}.`
        : " Scheduling is enabled."
    : "";

  if (task.status === "waiting") return `${executor.waitingAction}.${scheduleSuffix}`.trim();
  if (task.status === "failed") return `${executor.failedAction}. Review the latest run output before retrying.${scheduleSuffix}`.trim();
  if (task.status === "completed") return `${executor.completedAction}. Review outputs, follow-up, and billing cleanup.`;
  if (dueDate < todayStart) return `${executor.label} is past due. Follow up with ${ownerName} now.${scheduleSuffix}`.trim();
  if (dueDate >= todayStart && dueDate <= todayEnd) return `${executor.inProgressAction} is due today. Keep ${ownerName} moving.${scheduleSuffix}`.trim();
  if (task.status === "scheduled") {
    if (task.executorType === "human") return `Queued next for ${ownerName}.`;
    return `${executor.scheduledAction} when ready.${scheduleSuffix}`.trim();
  }
  if (task.status === "in_progress") return `${executor.inProgressAction} with ${ownerName}.${scheduleSuffix}`.trim();
  return `Review ${requesterName}'s request and triage execution.`;
}

export async function resolveTaskActorId() {
  const session = await auth();
  if (session?.user?.id) return session.user.id;

  const fallback = await prisma.user.findUnique({ where: { email: "hulk@allstartech.com" }, select: { id: true } });
  if (fallback?.id) return fallback.id;

  throw new Error("Unable to resolve task creator.");
}

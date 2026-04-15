import { Prisma, TaskEventLevel, TaskRunStatus, TaskRunTrigger } from "@prisma/client";
import { prisma } from "@/lib/prisma";

function toJson(value: unknown): Prisma.InputJsonValue | typeof Prisma.JsonNull | undefined {
  if (value === undefined) return undefined;
  if (value === null) return Prisma.JsonNull;
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export function truncateText(value: string | null | undefined, maxLength = 4000) {
  if (!value) return null;
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength)}\n...[truncated ${value.length - maxLength} chars]`;
}

export async function createTaskRun(input: {
  taskId: string;
  trigger: TaskRunTrigger;
  initiatedByUserId?: string | null;
  dispatchMode?: string | null;
  commandOrPrompt?: string | null;
  summary?: string | null;
  logPath?: string | null;
  metadata?: unknown;
}) {
  return prisma.taskRun.create({
    data: {
      taskId: input.taskId,
      trigger: input.trigger,
      initiatedByUserId: input.initiatedByUserId || null,
      dispatchMode: input.dispatchMode || null,
      commandOrPrompt: input.commandOrPrompt || null,
      summary: input.summary || null,
      logPath: input.logPath || null,
      metadata: toJson(input.metadata),
    },
  });
}

export async function addTaskEvent(input: {
  taskId: string;
  runId?: string | null;
  level?: TaskEventLevel;
  eventType: string;
  message: string;
  details?: unknown;
}) {
  return prisma.taskRunEvent.create({
    data: {
      taskId: input.taskId,
      runId: input.runId || null,
      level: input.level || TaskEventLevel.info,
      eventType: input.eventType,
      message: input.message,
      details: toJson(input.details),
    },
  });
}

export async function markTaskRunStatus(runId: string, input: {
  status?: TaskRunStatus;
  summary?: string | null;
  startedAt?: Date | null;
  finishedAt?: Date | null;
  exitCode?: number | null;
  errorMessage?: string | null;
  errorStack?: string | null;
  logPath?: string | null;
  dispatchMode?: string | null;
  commandOrPrompt?: string | null;
  metadata?: unknown;
}) {
  return prisma.taskRun.update({
    where: { id: runId },
    data: {
      status: input.status === undefined ? undefined : input.status,
      summary: input.summary === undefined ? undefined : input.summary,
      startedAt: input.startedAt === undefined ? undefined : input.startedAt,
      finishedAt: input.finishedAt === undefined ? undefined : input.finishedAt,
      exitCode: input.exitCode === undefined ? undefined : input.exitCode,
      errorMessage: input.errorMessage === undefined ? undefined : input.errorMessage,
      errorStack: input.errorStack === undefined ? undefined : input.errorStack,
      logPath: input.logPath === undefined ? undefined : input.logPath,
      dispatchMode: input.dispatchMode === undefined ? undefined : input.dispatchMode,
      commandOrPrompt: input.commandOrPrompt === undefined ? undefined : input.commandOrPrompt,
      metadata: input.metadata === undefined ? undefined : toJson(input.metadata),
    },
  });
}

export async function recordTaskLifecycleEvent(input: {
  taskId: string;
  actorUserId?: string | null;
  status: string;
  message: string;
  details?: unknown;
}) {
  const run = await prisma.taskRun.create({
    data: {
      taskId: input.taskId,
      trigger: TaskRunTrigger.lifecycle,
      initiatedByUserId: input.actorUserId || null,
      status: input.status === "completed" ? TaskRunStatus.succeeded : TaskRunStatus.running,
      summary: input.message,
      startedAt: new Date(),
      finishedAt: new Date(),
      metadata: toJson({ status: input.status, ...(input.details && typeof input.details === 'object' ? input.details as Record<string, unknown> : { details: input.details }) }),
    },
  });

  await addTaskEvent({
    taskId: input.taskId,
    runId: run.id,
    eventType: "task.status_changed",
    message: input.message,
    details: { status: input.status, actorUserId: input.actorUserId || null, details: input.details ?? null },
  });

  return run;
}

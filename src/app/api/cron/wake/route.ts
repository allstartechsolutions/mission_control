import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeNextRunAt } from "@/lib/cron";
import { dispatchScheduledTask } from "@/lib/task-execution";
import { addTaskEvent } from "@/lib/task-runs";
import { defaultCronTimezone, isNonHumanExecutor } from "@/lib/tasks";

export const dynamic = "force-dynamic";

/**
 * POST /api/cron/wake
 *
 * Scheduler tick endpoint. Call this on an interval (e.g. every minute via
 * system cron, or on-demand) to process due scheduled tasks.
 *
 * For each task where cronEnabled=true and cronNextRunAt <= now:
 *   1. Transition status from scheduled -> in_progress
 *   2. Set cronLastRunAt = now
 *   3. Compute and set cronNextRunAt for the next occurrence
 *   4. Set startDate if not already set
 *
 * One-time schedules with no future occurrence get cronEnabled set to false
 * after firing.
 *
 * Protected by a bearer token from CRON_SECRET, or falls back to AUTH_SECRET / NEXTAUTH_SECRET.
 */
function isAuthorized(request: Request) {
  const cronSecret = process.env.CRON_SECRET || process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!cronSecret) return false;

  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
  const queryToken = new URL(request.url).searchParams.get("key");
  return bearerToken === cronSecret || queryToken === cronSecret;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Find all tasks that are due for execution.
  // Exclude tasks whose last run was < 90 seconds ago to prevent rapid
  // re-dispatch loops when a task fails quickly and lands back in "waiting".
  const cooldownCutoff = new Date(now.getTime() - 90_000);
  const dueTasks = await prisma.task.findMany({
    where: {
      cronEnabled: true,
      cronNextRunAt: { lte: now },
      status: { in: ["scheduled", "waiting"] },
      OR: [
        { cronLastRunAt: null },
        { cronLastRunAt: { lt: cooldownCutoff } },
      ],
    },
    select: {
      id: true,
      title: true,
      cronExpression: true,
      cronTimezone: true,
      executorType: true,
      description: true,
      startDate: true,
      assignedTo: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  const results: { id: string; title: string; action: string; dispatch?: string; logPath?: string; error?: string }[] = [];

  for (const task of dueTasks) {
    if (!isNonHumanExecutor(task.executorType)) continue;

    const expression = task.cronExpression!;
    const timezone = task.cronTimezone || defaultCronTimezone;

    // Compute the next occurrence after now
    const nextRunAt = computeNextRunAt(expression, timezone, now);
    const isOneTime = nextRunAt === null;

    await prisma.task.update({
      where: { id: task.id },
      data: {
        status: "in_progress",
        startDate: task.startDate || now,
        cronLastRunAt: now,
        cronNextRunAt: nextRunAt,
        // Disable cron for one-time schedules that have fired
        cronEnabled: !isOneTime,
      },
    });

    try {
      const dispatch = await dispatchScheduledTask(task);
      await addTaskEvent({
        taskId: task.id,
        runId: dispatch.runId,
        eventType: "task.dispatch.scheduled",
        message: "Scheduled dispatch queued by cron wake.",
        details: { runId: dispatch.runId, logPath: dispatch.logPath, evaluatedAt: now.toISOString(), nextRunAt: nextRunAt?.toISOString() || null },
      });
      results.push({
        id: task.id,
        title: task.title,
        action: isOneTime ? "fired_once" : "fired_recurring",
        dispatch: dispatch.queued ? "queued" : "skipped",
        logPath: dispatch.logPath,
      });
    } catch (error) {
      await prisma.task.update({ where: { id: task.id }, data: { status: "waiting" } });
      await addTaskEvent({
        taskId: task.id,
        level: "error" as never,
        eventType: "task.dispatch.failed",
        message: error instanceof Error ? error.message : "Dispatch failed.",
        details: { evaluatedAt: now.toISOString() },
      });
      results.push({
        id: task.id,
        title: task.title,
        action: "dispatch_failed",
        dispatch: "failed",
        error: error instanceof Error ? error.message : "Dispatch failed.",
      });
    }

    revalidatePath(`/tasks/${task.id}`);
    revalidatePath(`/tasks/${task.id}/edit`);
  }

  revalidatePath("/tasks");

  return NextResponse.json({
    ok: true,
    evaluatedAt: now.toISOString(),
    fired: results.length,
    tasks: results,
  });
}

/**
 * GET /api/cron/wake
 *
 * Returns the current state of all cron-enabled tasks for diagnostics.
 */
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tasks = await prisma.task.findMany({
    where: { cronEnabled: true },
    select: {
      id: true,
      title: true,
      status: true,
      executorType: true,
      cronExpression: true,
      cronTimezone: true,
      cronEnabled: true,
      cronLastRunAt: true,
      cronNextRunAt: true,
    },
    orderBy: { cronNextRunAt: "asc" },
  });

  return NextResponse.json({ tasks });
}

import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTimerElapsedMinutes, resolveTaskActorId } from "@/lib/tasks";

export const dynamic = "force-dynamic";

function revalidateTaskPaths(task: { id: string; clientId: string | null; projectId: string | null }) {
  revalidatePath("/tasks");
  revalidatePath(`/tasks/${task.id}`);
  revalidatePath(`/tasks/${task.id}/edit`);
  if (task.clientId) revalidatePath(`/clients/${task.clientId}`);
  if (task.projectId) {
    revalidatePath(`/projects/${task.projectId}`);
    revalidatePath(`/projects/${task.projectId}/board`);
  }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const actorId = await resolveTaskActorId();
    const body = await request.json().catch(() => ({}));
    const action = typeof body?.action === "string" ? body.action.trim().toLowerCase() : "";

    if (!["start", "pause", "resume", "stop"].includes(action)) {
      return NextResponse.json({ error: "Invalid timer action." }, { status: 400 });
    }

    const task = await prisma.task.findUnique({
      where: { id },
      select: { id: true, clientId: true, projectId: true, timerState: true, timerStartedAt: true },
    });

    if (!task) return NextResponse.json({ error: "Task not found." }, { status: 404 });

    const now = new Date();

    if (action === "start") {
      if (task.timerState === "running") return NextResponse.json({ error: "Timer is already running." }, { status: 409 });
      if (task.timerState === "paused") return NextResponse.json({ error: "Timer is paused. Resume it or stop it first." }, { status: 409 });

      const updatedTask = await prisma.task.update({
        where: { id },
        data: {
          timerState: "running",
          timerStartedAt: now,
          timerStartedById: actorId,
          status: task.timerState === "idle" ? "in_progress" : undefined,
        },
        include: { timerStartedBy: { select: { name: true, email: true } } },
      });

      revalidateTaskPaths(task);
      return NextResponse.json({ task: updatedTask });
    }

    if (action === "resume") {
      if (task.timerState !== "paused") return NextResponse.json({ error: "Only paused timers can be resumed." }, { status: 409 });

      const updatedTask = await prisma.task.update({
        where: { id },
        data: {
          timerState: "running",
          timerStartedAt: now,
          timerStartedById: actorId,
          status: "in_progress",
        },
        include: { timerStartedBy: { select: { name: true, email: true } } },
      });

      revalidateTaskPaths(task);
      return NextResponse.json({ task: updatedTask });
    }

    if (task.timerState !== "running" || !task.timerStartedAt) {
      return NextResponse.json({ error: "No running timer to update." }, { status: 409 });
    }

    const minutes = getTimerElapsedMinutes(task.timerStartedAt, now);
    const [entry, updatedTask] = await prisma.$transaction([
      prisma.taskTimeEntry.create({
        data: {
          taskId: id,
          recordedById: actorId,
          startedAt: task.timerStartedAt,
          endedAt: now,
          minutes,
          note: action === "pause" ? "Timer paused" : "Timer stopped",
        },
        include: { recordedBy: { select: { name: true, email: true } } },
      }),
      prisma.task.update({
        where: { id },
        data: {
          timerState: action === "pause" ? "paused" : "idle",
          timerStartedAt: null,
          timerStartedById: null,
        },
        include: { timerStartedBy: { select: { name: true, email: true } } },
      }),
    ]);

    revalidateTaskPaths(task);
    return NextResponse.json({ task: updatedTask, entry });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update timer." }, { status: 500 });
  }
}

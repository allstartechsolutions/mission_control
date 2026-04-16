import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { recordTaskLifecycleEvent } from "@/lib/task-runs";
import { prisma } from "@/lib/prisma";
import { resolveTaskActorId, taskStatusOptions } from "@/lib/tasks";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const status = typeof body.status === "string" ? body.status.toLowerCase() : "";

    if (!taskStatusOptions.includes(status as never)) {
      return NextResponse.json({ error: "Invalid task status." }, { status: 400 });
    }

    const existing = await prisma.task.findUnique({
      where: { id },
      select: { id: true, title: true, status: true, clientId: true, projectId: true, startDate: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Task not found." }, { status: 404 });
    }

    const actorUserId = await resolveTaskActorId();
    const task = await prisma.task.update({
      where: { id },
      data: {
        status: status as never,
        startDate: status === "in_progress" && !existing.startDate ? new Date() : existing.startDate,
      },
    });

    await recordTaskLifecycleEvent({
      taskId: id,
      actorUserId,
      status,
      message: `Task status changed from ${existing.status} to ${status}.`,
      details: { previousStatus: existing.status, nextStatus: status, title: existing.title },
    });

    revalidatePath("/tasks");
    revalidatePath(`/tasks/${id}`);
    revalidatePath(`/tasks/${id}/edit`);
    if (existing.clientId) revalidatePath(`/clients/${existing.clientId}`);
    if (existing.projectId) {
      revalidatePath(`/projects/${existing.projectId}`);
      revalidatePath(`/projects/${existing.projectId}/board`);
    }

    return NextResponse.json({ task });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update task status." }, { status: 500 });
  }
}

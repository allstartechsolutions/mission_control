import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { dispatchTaskNow } from "@/lib/task-execution";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        assignedTo: { select: { name: true, email: true } },
      },
    });

    if (!task) return NextResponse.json({ error: "Task not found." }, { status: 404 });
    if (task.executorType === "human") {
      return NextResponse.json({ error: "Human tasks are manual only. Change the task status directly instead of dispatching it." }, { status: 400 });
    }
    if (!task.description?.trim()) {
      return NextResponse.json({ error: "Task description is required before dispatching." }, { status: 400 });
    }

    const dispatch = await dispatchTaskNow(task);

    await prisma.task.update({
      where: { id: task.id },
      data: {
        status: "in_progress",
        cronLastRunAt: new Date(),
      },
    });

    revalidatePath("/tasks");
    revalidatePath(`/tasks/${task.id}`);
    if (task.clientId) revalidatePath(`/clients/${task.clientId}`);
    if (task.projectId) revalidatePath(`/projects/${task.projectId}`);

    return NextResponse.json({
      ok: true,
      dispatch,
      taskId: task.id,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to dispatch task." }, { status: 500 });
  }
}

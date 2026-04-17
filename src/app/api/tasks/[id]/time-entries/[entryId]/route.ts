import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseTaskTimeEntryEditInput, toNullableString } from "@/lib/tasks";

export const dynamic = "force-dynamic";

async function revalidateTaskTimePaths(task: { id: string; clientId: string | null; projectId: string | null; }) {
  revalidatePath("/tasks");
  revalidatePath(`/tasks/${task.id}`);
  revalidatePath(`/tasks/${task.id}/edit`);
  if (task.clientId) revalidatePath(`/clients/${task.clientId}`);
  if (task.projectId) {
    revalidatePath(`/projects/${task.projectId}`);
    revalidatePath(`/projects/${task.projectId}/board`);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string; entryId: string }> }) {
  try {
    const { id, entryId } = await context.params;
    const task = await prisma.task.findUnique({ where: { id }, select: { id: true, clientId: true, projectId: true } });
    if (!task) return NextResponse.json({ error: "Task not found." }, { status: 404 });

    const entry = await prisma.taskTimeEntry.findFirst({ where: { id: entryId, taskId: id }, select: { id: true } });
    if (!entry) return NextResponse.json({ error: "Time entry not found." }, { status: 404 });

    const formData = await request.formData();
    const { startedAt, endedAt, minutes } = parseTaskTimeEntryEditInput({
      startedAt: toNullableString(formData.get("startedAt")),
      endedAt: toNullableString(formData.get("endedAt")),
      minutes: toNullableString(formData.get("minutes")),
    });

    const updatedEntry = await prisma.taskTimeEntry.update({
      where: { id: entryId },
      data: {
        startedAt,
        endedAt,
        minutes,
        note: toNullableString(formData.get("note")),
      },
      include: { recordedBy: { select: { name: true, email: true } } },
    });

    await revalidateTaskTimePaths(task);
    return NextResponse.json({ entry: updatedEntry });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update time entry." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string; entryId: string }> }) {
  try {
    const { id, entryId } = await context.params;
    const task = await prisma.task.findUnique({ where: { id }, select: { id: true, clientId: true, projectId: true } });
    if (!task) return NextResponse.json({ error: "Task not found." }, { status: 404 });

    const entry = await prisma.taskTimeEntry.findFirst({ where: { id: entryId, taskId: id }, select: { id: true } });
    if (!entry) return NextResponse.json({ error: "Time entry not found." }, { status: 404 });

    await prisma.taskTimeEntry.delete({ where: { id: entryId } });

    await revalidateTaskTimePaths(task);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to delete time entry." }, { status: 500 });
  }
}

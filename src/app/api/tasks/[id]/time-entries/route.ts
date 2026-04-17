import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseTaskTimeEntryInput, resolveTaskActorId, toNullableString } from "@/lib/tasks";

export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const task = await prisma.task.findUnique({ where: { id }, select: { id: true, clientId: true, projectId: true } });
    if (!task) return NextResponse.json({ error: "Task not found." }, { status: 404 });

    const formData = await request.formData();
    const { startedAt, endedAt, minutes } = parseTaskTimeEntryInput({
      entryDate: toNullableString(formData.get("entryDate")),
      startTime: toNullableString(formData.get("startTime")),
      minutes: toNullableString(formData.get("minutes")),
    });

    const recordedById = await resolveTaskActorId();
    const entry = await prisma.taskTimeEntry.create({
      data: {
        taskId: id,
        recordedById,
        startedAt,
        endedAt,
        minutes,
        note: toNullableString(formData.get("note")),
      },
      include: { recordedBy: { select: { name: true, email: true } } },
    });

    revalidatePath("/tasks");
    revalidatePath(`/tasks/${id}`);
    revalidatePath(`/tasks/${id}/edit`);
    if (task.clientId) revalidatePath(`/clients/${task.clientId}`);
    if (task.projectId) {
      revalidatePath(`/projects/${task.projectId}`);
      revalidatePath(`/projects/${task.projectId}/board`);
    }

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save time entry." }, { status: 500 });
  }
}

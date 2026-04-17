import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function DELETE(_request: Request, context: { params: Promise<{ id: string; entryId: string }> }) {
  try {
    const { id, entryId } = await context.params;
    const task = await prisma.task.findUnique({ where: { id }, select: { id: true, clientId: true, projectId: true } });
    if (!task) return NextResponse.json({ error: "Task not found." }, { status: 404 });

    const entry = await prisma.taskTimeEntry.findFirst({ where: { id: entryId, taskId: id }, select: { id: true } });
    if (!entry) return NextResponse.json({ error: "Time entry not found." }, { status: 404 });

    await prisma.taskTimeEntry.delete({ where: { id: entryId } });

    revalidatePath("/tasks");
    revalidatePath(`/tasks/${id}`);
    revalidatePath(`/tasks/${id}/edit`);
    if (task.clientId) revalidatePath(`/clients/${task.clientId}`);
    if (task.projectId) {
      revalidatePath(`/projects/${task.projectId}`);
      revalidatePath(`/projects/${task.projectId}/board`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to delete time entry." }, { status: 500 });
  }
}

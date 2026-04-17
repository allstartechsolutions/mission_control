import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseTagNames, syncTaskTags } from "@/lib/tasks";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const task = await prisma.task.findUnique({ where: { id }, select: { id: true } });
    if (!task) return NextResponse.json({ error: "Task not found." }, { status: 404 });

    const body = await request.json();
    const tagNames = parseTagNames(typeof body.tagNames === "string" ? body.tagNames : "");
    const tags = await syncTaskTags(task.id, tagNames);

    revalidatePath("/tasks");
    revalidatePath(`/tasks/${task.id}`);
    revalidatePath(`/tasks/${task.id}/edit`);

    return NextResponse.json({ tags });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update tags." }, { status: 500 });
  }
}

import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { ensureProjectBoard, rebalanceBoardColumn } from "@/lib/boards";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: projectId } = await context.params;
    const body = await request.json();
    const taskId = typeof body.taskId === "string" ? body.taskId : "";
    const columnId = typeof body.columnId === "string" ? body.columnId : "";
    const targetIndex = Number.isInteger(body.targetIndex) ? body.targetIndex : 0;

    if (!taskId || !columnId) {
      return NextResponse.json({ error: "Task and column are required." }, { status: 400 });
    }

    const board = await ensureProjectBoard(projectId);
    const targetColumn = board.columns.find((column) => column.id === columnId);
    if (!targetColumn) {
      return NextResponse.json({ error: "Board column not found." }, { status: 404 });
    }

    const task = await prisma.task.findFirst({ where: { id: taskId, projectId }, select: { id: true } });
    if (!task) {
      return NextResponse.json({ error: "Task not found on this project board." }, { status: 404 });
    }

    const placement = await prisma.taskBoardPlacement.findUnique({ where: { taskId } });
    if (!placement) {
      return NextResponse.json({ error: "Task board placement not found." }, { status: 404 });
    }

    const siblingPlacements = await prisma.taskBoardPlacement.findMany({
      where: { boardId: board.id, columnId },
      orderBy: [{ sortOrder: "asc" }, { updatedAt: "asc" }],
      select: { id: true },
    });

    const nextIndex = Math.max(0, Math.min(targetIndex, siblingPlacements.length));

    await prisma.$transaction(async (tx) => {
      const oldColumnId = placement.columnId;

      await tx.taskBoardPlacement.updateMany({
        where: {
          boardId: board.id,
          columnId,
          sortOrder: { gte: nextIndex },
        },
        data: { sortOrder: { increment: 1 } },
      });

      await tx.taskBoardPlacement.update({
        where: { taskId },
        data: { columnId, sortOrder: nextIndex },
      });

      const oldPlacements = await tx.taskBoardPlacement.findMany({
        where: { boardId: board.id, columnId: oldColumnId },
        orderBy: [{ sortOrder: "asc" }, { updatedAt: "asc" }],
        select: { id: true },
      });

      for (const [index, item] of oldPlacements.entries()) {
        await tx.taskBoardPlacement.update({ where: { id: item.id }, data: { sortOrder: index } });
      }

      const newPlacements = await tx.taskBoardPlacement.findMany({
        where: { boardId: board.id, columnId },
        orderBy: [{ sortOrder: "asc" }, { updatedAt: "asc" }],
        select: { id: true },
      });

      for (const [index, item] of newPlacements.entries()) {
        await tx.taskBoardPlacement.update({ where: { id: item.id }, data: { sortOrder: index } });
      }
    });

    await rebalanceBoardColumn(board.id, columnId);
    if (placement.columnId !== columnId) await rebalanceBoardColumn(board.id, placement.columnId);

    revalidatePath(`/projects/${projectId}`);
    revalidatePath(`/projects/${projectId}/board`);
    revalidatePath(`/tasks/${taskId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to move board card." }, { status: 500 });
  }
}

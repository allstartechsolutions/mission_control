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

    const movingWithinSameColumn = placement.columnId === columnId;
    const maxTargetIndex = movingWithinSameColumn ? Math.max(0, siblingPlacements.length - 1) : siblingPlacements.length;
    const nextIndex = Math.max(0, Math.min(targetIndex, maxTargetIndex));

    await prisma.$transaction(async (tx) => {
      const originalColumnId = placement.columnId;

      await tx.taskBoardPlacement.update({
        where: { taskId },
        data: { sortOrder: -1 },
      });

      const destinationPlacements = await tx.taskBoardPlacement.findMany({
        where: { boardId: board.id, columnId },
        orderBy: [{ sortOrder: "asc" }, { updatedAt: "asc" }],
        select: { id: true },
      });

      const destinationIds = destinationPlacements.map((item) => item.id).filter((id) => id !== placement.id);
      destinationIds.splice(nextIndex, 0, placement.id);

      if (destinationIds.length > 0) {
        await Promise.all(destinationIds.map((id, index) => tx.taskBoardPlacement.update({ where: { id }, data: { columnId, sortOrder: index + 1000 } })));
        await Promise.all(destinationIds.map((id, index) => tx.taskBoardPlacement.update({ where: { id }, data: { columnId, sortOrder: index } })));
      }

      if (originalColumnId !== columnId) {
        const sourcePlacements = await tx.taskBoardPlacement.findMany({
          where: { boardId: board.id, columnId: originalColumnId },
          orderBy: [{ sortOrder: "asc" }, { updatedAt: "asc" }],
          select: { id: true },
        });

        if (sourcePlacements.length > 0) {
          await Promise.all(sourcePlacements.map((item, index) => tx.taskBoardPlacement.update({ where: { id: item.id }, data: { sortOrder: index + 1000 } })));
          await Promise.all(sourcePlacements.map((item, index) => tx.taskBoardPlacement.update({ where: { id: item.id }, data: { sortOrder: index } })));
        }
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

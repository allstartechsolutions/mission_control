import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function serializeVersion(parts: Array<Date | null | undefined>) {
  return parts.map((value) => value?.toISOString() || "0").join(":");
}

async function getVersion(taskId: string | null, projectId: string | null) {
  const taskWhere = taskId ? { id: taskId } : projectId ? { projectId } : undefined;
  const runWhere = taskId ? { taskId } : projectId ? { task: { projectId } } : undefined;
  const eventWhere = taskId ? { taskId } : projectId ? { task: { projectId } } : undefined;
  const placementWhere = projectId ? { board: { projectId } } : taskId ? { taskId } : undefined;
  const boardWhere = projectId ? { projectId } : undefined;
  const columnWhere = projectId ? { board: { projectId } } : undefined;

  const [taskAgg, runAgg, eventAgg, placementAgg, boardAgg, columnAgg] = await Promise.all([
    prisma.task.aggregate({ where: taskWhere, _max: { updatedAt: true } }),
    prisma.taskRun.aggregate({ where: runWhere, _max: { updatedAt: true } }),
    prisma.taskRunEvent.aggregate({ where: eventWhere, _max: { createdAt: true } }),
    prisma.taskBoardPlacement.aggregate({ where: placementWhere, _max: { updatedAt: true } }),
    prisma.board.aggregate({ where: boardWhere, _max: { updatedAt: true } }),
    prisma.boardColumn.aggregate({ where: columnWhere, _max: { updatedAt: true } }),
  ]);

  return serializeVersion([
    taskAgg._max.updatedAt,
    runAgg._max.updatedAt,
    eventAgg._max.createdAt,
    placementAgg._max.updatedAt,
    boardAgg._max.updatedAt,
    columnAgg._max.updatedAt,
  ]);
}

function sseMessage(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get("taskId");
  const projectId = searchParams.get("projectId");

  let closed = false;
  const stream = new ReadableStream({
    async start(controller) {
      let currentVersion = await getVersion(taskId, projectId);
      controller.enqueue(new TextEncoder().encode(sseMessage("connected", { version: currentVersion, taskId, projectId })));

      const interval = setInterval(async () => {
        if (closed) return;
        try {
          const nextVersion = await getVersion(taskId, projectId);
          if (nextVersion !== currentVersion) {
            currentVersion = nextVersion;
            controller.enqueue(new TextEncoder().encode(sseMessage("task-update", { version: currentVersion, taskId, projectId })));
          } else {
            controller.enqueue(new TextEncoder().encode(`: keepalive ${Date.now()}\n\n`));
          }
        } catch (error) {
          controller.enqueue(new TextEncoder().encode(sseMessage("error", { message: error instanceof Error ? error.message : "stream error" })));
        }
      }, 2000);

      request.signal.addEventListener("abort", () => {
        closed = true;
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

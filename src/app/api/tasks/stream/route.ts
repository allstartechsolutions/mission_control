import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function serializeVersion(parts: Array<Date | null | undefined>) {
  return parts.map((value) => value?.toISOString() || "0").join(":");
}

async function getVersion(taskId: string | null) {
  const [taskAgg, runAgg, eventAgg] = await Promise.all([
    prisma.task.aggregate({
      where: taskId ? { id: taskId } : undefined,
      _max: { updatedAt: true },
    }),
    prisma.taskRun.aggregate({
      where: taskId ? { taskId } : undefined,
      _max: { updatedAt: true },
    }),
    prisma.taskRunEvent.aggregate({
      where: taskId ? { taskId } : undefined,
      _max: { createdAt: true },
    }),
  ]);

  return serializeVersion([taskAgg._max.updatedAt, runAgg._max.updatedAt, eventAgg._max.createdAt]);
}

function sseMessage(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get("taskId");

  let closed = false;
  const stream = new ReadableStream({
    async start(controller) {
      let currentVersion = await getVersion(taskId);
      controller.enqueue(new TextEncoder().encode(sseMessage("connected", { version: currentVersion, taskId })));

      const interval = setInterval(async () => {
        if (closed) return;
        try {
          const nextVersion = await getVersion(taskId);
          if (nextVersion !== currentVersion) {
            currentVersion = nextVersion;
            controller.enqueue(new TextEncoder().encode(sseMessage("task-update", { version: currentVersion, taskId })));
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

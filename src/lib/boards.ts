import { prisma } from "@/lib/prisma";

export const DEFAULT_BOARD_COLUMNS = [
  { key: "backlog", name: "Backlog", color: "slate", sortOrder: 0 },
  { key: "scheduled", name: "Scheduled", color: "sky", sortOrder: 1 },
  { key: "in_progress", name: "In Progress", color: "indigo", sortOrder: 2 },
  { key: "blocked", name: "Blocked", color: "rose", sortOrder: 3 },
  { key: "done", name: "Done", color: "emerald", sortOrder: 4 },
] as const;

export type DefaultBoardColumnKey = (typeof DEFAULT_BOARD_COLUMNS)[number]["key"];

const statusToColumnKey: Record<string, DefaultBoardColumnKey> = {
  scheduled: "scheduled",
  waiting: "blocked",
  in_progress: "in_progress",
  failed: "blocked",
  completed: "done",
  canceled: "done",
};

export function getDefaultColumnKeyForTaskStatus(status: string): DefaultBoardColumnKey {
  return statusToColumnKey[status] || "scheduled";
}

async function syncBoardColumnsToDefault(boardId: string) {
  return prisma.$transaction(async (tx) => {
    const existingColumns = await tx.boardColumn.findMany({
      where: { boardId },
      orderBy: { sortOrder: "asc" },
    });

    const legacyReadyColumn = existingColumns.find((column) => column.key === "ready");
    if (legacyReadyColumn) {
      await tx.boardColumn.update({
        where: { id: legacyReadyColumn.id },
        data: { key: "scheduled", name: "Scheduled", color: "sky", sortOrder: 1 },
      });
    }

    for (const column of DEFAULT_BOARD_COLUMNS) {
      const existing = existingColumns.find((item) => item.key === column.key || (column.key === "scheduled" && item.key === "ready"));
      if (existing) {
        await tx.boardColumn.update({
          where: { id: existing.id },
          data: {
            key: column.key,
            name: column.name,
            color: column.color,
            sortOrder: column.sortOrder,
          },
        });
        continue;
      }

      await tx.boardColumn.create({
        data: {
          boardId,
          key: column.key,
          name: column.name,
          color: column.color,
          sortOrder: column.sortOrder,
        },
      });
    }

    const staleColumns = await tx.boardColumn.findMany({ where: { boardId } });
    const staleIds = staleColumns
      .filter((column) => !DEFAULT_BOARD_COLUMNS.some((item) => item.key === column.key))
      .map((column) => column.id);

    if (staleIds.length > 0) {
      await tx.taskBoardPlacement.deleteMany({ where: { boardId, columnId: { in: staleIds } } });
      await tx.boardColumn.deleteMany({ where: { id: { in: staleIds } } });
    }

    return tx.board.findUniqueOrThrow({
      where: { id: boardId },
      include: { columns: { orderBy: { sortOrder: "asc" } } },
    });
  });
}

async function createProjectBoard(projectId: string, projectName: string) {
  return prisma.board.create({
    data: {
      projectId,
      scope: "project",
      name: `${projectName} Board`,
      columns: {
        create: DEFAULT_BOARD_COLUMNS.map((column) => ({
          key: column.key,
          name: column.name,
          color: column.color,
          sortOrder: column.sortOrder,
        })),
      },
    },
    include: {
      columns: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function ensureProjectBoard(projectId: string) {
  const existing = await prisma.board.findUnique({
    where: { projectId },
    include: { columns: { orderBy: { sortOrder: "asc" } } },
  });
  if (existing) {
    return syncBoardColumnsToDefault(existing.id);
  }

  const project = await prisma.project.findUnique({ where: { id: projectId }, select: { id: true, name: true } });
  if (!project) throw new Error("Project not found.");

  const created = await createProjectBoard(project.id, project.name);
  await ensureProjectTaskPlacements(project.id, created.id);
  return created;
}

export async function ensureProjectTaskPlacements(projectId: string, boardId?: string) {
  const board = boardId
    ? await prisma.board.findUnique({ where: { id: boardId }, include: { columns: true } })
    : await ensureProjectBoard(projectId);

  if (!board) throw new Error("Board not found.");

  const columnByKey = new Map(board.columns.map((column) => [column.key, column]));
  const tasks = await prisma.task.findMany({
    where: { projectId },
    select: {
      id: true,
      status: true,
      boardPlacement: { select: { id: true } },
    },
    orderBy: [{ dueDate: { sort: "asc", nulls: "last" } }, { createdAt: "asc" }],
  });

  for (const task of tasks) {
    if (task.boardPlacement) continue;
    const key = getDefaultColumnKeyForTaskStatus(task.status);
    const column = columnByKey.get(key) || board.columns[0];
    if (!column) continue;
    const count = await prisma.taskBoardPlacement.count({ where: { boardId: board.id, columnId: column.id } });
    await prisma.taskBoardPlacement.create({
      data: {
        taskId: task.id,
        boardId: board.id,
        columnId: column.id,
        sortOrder: count,
      },
    });
  }

  return board;
}

export async function syncTaskBoardPlacement(taskId: string, projectId: string | null, status: string) {
  const existingPlacement = await prisma.taskBoardPlacement.findUnique({ where: { taskId } });

  if (!projectId) {
    if (existingPlacement) {
      await prisma.taskBoardPlacement.delete({ where: { taskId } });
    }
    return null;
  }

  const board = await ensureProjectBoard(projectId);
  const columnKey = getDefaultColumnKeyForTaskStatus(status);
  const column = board.columns.find((item) => item.key === columnKey) || board.columns[0];
  if (!column) return null;

  if (existingPlacement) {
    if (existingPlacement.boardId === board.id) return existingPlacement;
    await prisma.taskBoardPlacement.delete({ where: { taskId } });
  }

  const count = await prisma.taskBoardPlacement.count({ where: { boardId: board.id, columnId: column.id } });
  return prisma.taskBoardPlacement.create({
    data: {
      taskId,
      boardId: board.id,
      columnId: column.id,
      sortOrder: count,
    },
  });
}

export async function rebalanceBoardColumn(boardId: string, columnId: string) {
  const placements = await prisma.taskBoardPlacement.findMany({
    where: { boardId, columnId },
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "asc" }],
    select: { id: true },
  });

  await Promise.all(
    placements.map((placement, index) =>
      prisma.taskBoardPlacement.update({ where: { id: placement.id }, data: { sortOrder: index } }),
    ),
  );
}

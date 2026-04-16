-- CreateEnum
CREATE TYPE "BoardScope" AS ENUM ('project');

-- CreateTable
CREATE TABLE "Board" (
    "id" TEXT NOT NULL,
    "scope" "BoardScope" NOT NULL DEFAULT 'project',
    "name" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Board_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoardColumn" (
    "id" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BoardColumn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskBoardPlacement" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "columnId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TaskBoardPlacement_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE UNIQUE INDEX "Board_projectId_key" ON "Board"("projectId");
CREATE INDEX "Board_scope_idx" ON "Board"("scope");
CREATE UNIQUE INDEX "BoardColumn_boardId_key_key" ON "BoardColumn"("boardId", "key");
CREATE UNIQUE INDEX "BoardColumn_boardId_sortOrder_key" ON "BoardColumn"("boardId", "sortOrder");
CREATE INDEX "BoardColumn_boardId_idx" ON "BoardColumn"("boardId");
CREATE UNIQUE INDEX "TaskBoardPlacement_taskId_key" ON "TaskBoardPlacement"("taskId");
CREATE UNIQUE INDEX "TaskBoardPlacement_boardId_columnId_sortOrder_key" ON "TaskBoardPlacement"("boardId", "columnId", "sortOrder");
CREATE INDEX "TaskBoardPlacement_boardId_columnId_idx" ON "TaskBoardPlacement"("boardId", "columnId");
CREATE INDEX "TaskBoardPlacement_columnId_sortOrder_idx" ON "TaskBoardPlacement"("columnId", "sortOrder");

-- FKs
ALTER TABLE "Board" ADD CONSTRAINT "Board_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BoardColumn" ADD CONSTRAINT "BoardColumn_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TaskBoardPlacement" ADD CONSTRAINT "TaskBoardPlacement_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TaskBoardPlacement" ADD CONSTRAINT "TaskBoardPlacement_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TaskBoardPlacement" ADD CONSTRAINT "TaskBoardPlacement_columnId_fkey" FOREIGN KEY ("columnId") REFERENCES "BoardColumn"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill one project board per existing project
INSERT INTO "Board" ("id", "scope", "name", "projectId", "createdAt", "updatedAt")
SELECT 'board_' || md5(p.id), 'project', p.name || ' Board', p.id, NOW(), NOW()
FROM "Project" p
LEFT JOIN "Board" b ON b."projectId" = p.id
WHERE b.id IS NULL;

-- Backfill default columns per board
INSERT INTO "BoardColumn" ("id", "boardId", "key", "name", "color", "sortOrder", "createdAt", "updatedAt")
SELECT 'boardcol_' || md5(b.id || '_' || c.key), b.id, c.key, c.name, c.color, c.sort_order, NOW(), NOW()
FROM "Board" b
CROSS JOIN (
  VALUES
    ('backlog', 'Backlog', 'slate', 0),
    ('ready', 'Ready', 'sky', 1),
    ('in_progress', 'In Progress', 'indigo', 2),
    ('blocked', 'Blocked', 'rose', 3),
    ('done', 'Done', 'emerald', 4)
) AS c(key, name, color, sort_order)
LEFT JOIN "BoardColumn" existing ON existing."boardId" = b.id AND existing.key = c.key
WHERE existing.id IS NULL;

-- Backfill project task placements
WITH mapped_tasks AS (
  SELECT
    t.id AS task_id,
    b.id AS board_id,
    bc.id AS column_id,
    ROW_NUMBER() OVER (
      PARTITION BY b.id, bc.id
      ORDER BY t."dueDate" ASC, t."createdAt" ASC, t.id ASC
    ) - 1 AS sort_order
  FROM "Task" t
  JOIN "Board" b ON b."projectId" = t."projectId"
  JOIN "BoardColumn" bc ON bc."boardId" = b.id
    AND bc.key = CASE
      WHEN t.status = 'scheduled' THEN 'backlog'
      WHEN t.status = 'in_progress' THEN 'in_progress'
      WHEN t.status = 'waiting' THEN 'blocked'
      WHEN t.status = 'failed' THEN 'blocked'
      WHEN t.status = 'completed' THEN 'done'
      WHEN t.status = 'canceled' THEN 'done'
      ELSE 'ready'
    END
  LEFT JOIN "TaskBoardPlacement" tbp ON tbp."taskId" = t.id
  WHERE t."projectId" IS NOT NULL AND tbp.id IS NULL
)
INSERT INTO "TaskBoardPlacement" ("id", "taskId", "boardId", "columnId", "sortOrder", "createdAt", "updatedAt")
SELECT 'tbp_' || md5(task_id), task_id, board_id, column_id, sort_order, NOW(), NOW()
FROM mapped_tasks;

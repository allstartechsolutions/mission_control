-- CreateEnum
CREATE TYPE "TaskRunStatus" AS ENUM ('queued', 'running', 'succeeded', 'failed');

-- CreateEnum
CREATE TYPE "TaskRunTrigger" AS ENUM ('manual', 'scheduled', 'lifecycle');

-- CreateEnum
CREATE TYPE "TaskEventLevel" AS ENUM ('info', 'warning', 'error');

-- CreateTable
CREATE TABLE "TaskRun" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "trigger" "TaskRunTrigger" NOT NULL,
    "status" "TaskRunStatus" NOT NULL DEFAULT 'queued',
    "dispatchMode" TEXT,
    "commandOrPrompt" TEXT,
    "summary" TEXT,
    "logPath" TEXT,
    "initiatedByUserId" TEXT,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "exitCode" INTEGER,
    "errorMessage" TEXT,
    "errorStack" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaskRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskRunEvent" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "runId" TEXT,
    "level" "TaskEventLevel" NOT NULL DEFAULT 'info',
    "eventType" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskRunEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TaskRun_taskId_createdAt_idx" ON "TaskRun"("taskId", "createdAt");

-- CreateIndex
CREATE INDEX "TaskRun_status_createdAt_idx" ON "TaskRun"("status", "createdAt");

-- CreateIndex
CREATE INDEX "TaskRun_initiatedByUserId_idx" ON "TaskRun"("initiatedByUserId");

-- CreateIndex
CREATE INDEX "TaskRunEvent_taskId_createdAt_idx" ON "TaskRunEvent"("taskId", "createdAt");

-- CreateIndex
CREATE INDEX "TaskRunEvent_runId_createdAt_idx" ON "TaskRunEvent"("runId", "createdAt");

-- CreateIndex
CREATE INDEX "TaskRunEvent_eventType_createdAt_idx" ON "TaskRunEvent"("eventType", "createdAt");

-- AddForeignKey
ALTER TABLE "TaskRun" ADD CONSTRAINT "TaskRun_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskRun" ADD CONSTRAINT "TaskRun_initiatedByUserId_fkey" FOREIGN KEY ("initiatedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskRunEvent" ADD CONSTRAINT "TaskRunEvent_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskRunEvent" ADD CONSTRAINT "TaskRunEvent_runId_fkey" FOREIGN KEY ("runId") REFERENCES "TaskRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;


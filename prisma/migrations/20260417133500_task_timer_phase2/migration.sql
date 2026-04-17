-- CreateEnum
CREATE TYPE "TaskTimerState" AS ENUM ('idle', 'running', 'paused');

-- AlterTable
ALTER TABLE "Task"
  ADD COLUMN "timerStartedAt" TIMESTAMP(3),
  ADD COLUMN "timerStartedById" TEXT,
  ADD COLUMN "timerState" "TaskTimerState" NOT NULL DEFAULT 'idle';

-- CreateIndex
CREATE INDEX "Task_timerState_idx" ON "Task"("timerState");
CREATE INDEX "Task_timerStartedById_idx" ON "Task"("timerStartedById");

-- AddForeignKey
ALTER TABLE "Task"
  ADD CONSTRAINT "Task_timerStartedById_fkey"
  FOREIGN KEY ("timerStartedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

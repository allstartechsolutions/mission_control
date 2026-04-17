-- CreateTable
CREATE TABLE "TaskTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaskTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskTagAssignment" (
    "taskId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskTagAssignment_pkey" PRIMARY KEY ("taskId","tagId")
);

-- CreateTable
CREATE TABLE "TaskTimeEntry" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "recordedById" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3) NOT NULL,
    "minutes" INTEGER NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaskTimeEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TaskTag_name_idx" ON "TaskTag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TaskTag_normalizedName_key" ON "TaskTag"("normalizedName");

-- CreateIndex
CREATE INDEX "TaskTagAssignment_tagId_idx" ON "TaskTagAssignment"("tagId");

-- CreateIndex
CREATE INDEX "TaskTimeEntry_taskId_startedAt_idx" ON "TaskTimeEntry"("taskId", "startedAt");

-- CreateIndex
CREATE INDEX "TaskTimeEntry_recordedById_idx" ON "TaskTimeEntry"("recordedById");

-- AddForeignKey
ALTER TABLE "TaskTagAssignment" ADD CONSTRAINT "TaskTagAssignment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskTagAssignment" ADD CONSTRAINT "TaskTagAssignment_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "TaskTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskTimeEntry" ADD CONSTRAINT "TaskTimeEntry_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskTimeEntry" ADD CONSTRAINT "TaskTimeEntry_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

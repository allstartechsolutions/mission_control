-- Rename legacy Ready board columns to Scheduled and normalize default ordering.
UPDATE "BoardColumn"
SET "key" = 'scheduled',
    "name" = 'Scheduled',
    "color" = 'sky',
    "sortOrder" = 1,
    "updatedAt" = NOW()
WHERE "key" = 'ready';

UPDATE "BoardColumn"
SET "name" = 'Backlog',
    "color" = 'slate',
    "sortOrder" = 0,
    "updatedAt" = NOW()
WHERE "key" = 'backlog';

UPDATE "BoardColumn"
SET "name" = 'Scheduled',
    "color" = 'sky',
    "sortOrder" = 1,
    "updatedAt" = NOW()
WHERE "key" = 'scheduled';

UPDATE "BoardColumn"
SET "name" = 'In Progress',
    "color" = 'indigo',
    "sortOrder" = 2,
    "updatedAt" = NOW()
WHERE "key" = 'in_progress';

UPDATE "BoardColumn"
SET "name" = 'Blocked',
    "color" = 'rose',
    "sortOrder" = 3,
    "updatedAt" = NOW()
WHERE "key" = 'blocked';

UPDATE "BoardColumn"
SET "name" = 'Done',
    "color" = 'emerald',
    "sortOrder" = 4,
    "updatedAt" = NOW()
WHERE "key" = 'done';

INSERT INTO "BoardColumn" ("id", "boardId", "key", "name", "color", "sortOrder", "createdAt", "updatedAt")
SELECT 'boardcol_' || md5(b.id || '_scheduled'), b.id, 'scheduled', 'Scheduled', 'sky', 1, NOW(), NOW()
FROM "Board" b
LEFT JOIN "BoardColumn" existing ON existing."boardId" = b.id AND existing."key" = 'scheduled'
WHERE existing.id IS NULL;

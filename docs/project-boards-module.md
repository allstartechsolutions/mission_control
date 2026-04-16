# Project Boards module

## Purpose

Each project gets a Kanban-style board that visualizes project tasks by delivery state.

## Core data model

Primary tables:

- `Board`
- `BoardColumn`
- `TaskBoardPlacement`

Key rules:

- one `Board` per `Project`
- default columns come from `src/lib/boards.ts`
- each task can have at most one board placement
- placements are ordered within each column by `sortOrder`

Default column keys:

- `backlog`
- `scheduled`
- `in_progress`
- `blocked`
- `done`

Task status to board column mapping currently resolves as:

- `scheduled` -> `scheduled`
- `waiting` -> `blocked`
- `in_progress` -> `in_progress`
- `failed` -> `blocked`
- `completed` -> `done`
- `canceled` -> `done`

## Main page

- `/projects/[id]/board`

## API

- `PATCH /api/projects/[id]/board`

Payload shape:

- `taskId`
- `columnId`
- `targetIndex`

## Important behaviors

- Board is created automatically when a project is created or normalized when accessed.
- Legacy `ready` columns are migrated in-place to `scheduled`.
- Stale non-default columns are deleted during board normalization.
- Placement create/sync happens when project tasks are created or when board consistency is ensured.
- Rebalance logic rewrites sort orders after moves.

## Production and security notes

- Board normalization mutates DB structure, not just reads it. That is acceptable now, but should be understood during debugging.
- If custom board columns are wanted later, current sync logic will fight that and delete them.

## Operational gotchas

- Moving a card between columns does not currently update the task's `status`. That means board view and task detail can drift.
- `backlog` exists as a default column but is not currently targeted by the status mapping helper.
- Placements are project-scoped, so a task with no project should never have a board placement.

## AI instructions

### Safe assistant behavior

- If JR asks to "move a task on the board", assume that is a board placement change only unless they also ask to change task status.
- If JR expects the move to reflect actual workflow state, update both placement and `Task.status` deliberately, not implicitly.
- Never place a task on a project board if the task is not linked to that project.

### Validation rules

- Confirm the task belongs to the selected project before any move.
- Use valid target columns from the board itself, not hard-coded guesses from memory.
- After a move, verify whether task status also needs to be reconciled.

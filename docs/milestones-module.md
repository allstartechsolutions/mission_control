# Milestones module

## Purpose

`ProjectMilestone` breaks a project into major checkpoints with their own status, order, due date, and optional commercial values.

## Core data model

Primary table: `ProjectMilestone`

Key fields:

- `projectId` (required)
- `title` (required)
- `description`
- `status` (`planned`, `active`, `done`, `blocked`, `archived`)
- `sortOrder`
- `dueDate`
- `estimatedPrice`, `finalPrice`

Key relationships:

- belongs to one `Project`
- has many `Task`

## Main pages

- `/projects/[id]/milestones`
- `/projects/[id]/milestones/new`
- `/projects/[id]/milestones/[milestoneId]`
- `/projects/[id]/milestones/[milestoneId]/edit`

## APIs

- `GET|POST /api/projects/[id]/milestones`
- `GET|PATCH|DELETE /api/projects/[id]/milestones/[milestoneId]`

## Important behaviors

- Milestone title is required.
- Create appends by setting `sortOrder` to current max plus one.
- Update can change `sortOrder` directly.
- Delete becomes archive if tasks are linked. Only task-free milestones are hard-deleted.

## Production and security notes

- The archive-on-delete behavior is good operational protection. Keep it.
- Milestone financial fields should stay aligned with project budgeting conventions if reporting is added later.

## Operational gotchas

- There is no automatic rebalance when manually changing `sortOrder`; duplicates or odd gaps are possible if edits are careless.
- Archiving a milestone with tasks does not automatically archive or move those tasks.
- Milestone status is independent from project status and task status.

## AI instructions

### When adding a milestone

Require:

- project
- title

Capture when known:

- description
- status
- due date
- estimated/final price

### Validation rules

- Never create a milestone without an existing parent project.
- Default to `planned` if status is not specified.
- If JR refers to phases informally, translate them into milestone titles but keep wording business-readable.

### Safe behavior

- Prefer archiving over deleting when there is any chance tasks already reference the milestone.
- Do not reorder multiple milestones casually unless JR asked for the sequence change.
- If a milestone is effectively complete but open tasks remain, flag the inconsistency instead of forcing a status change automatically.

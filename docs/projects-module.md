# Projects module

## Purpose

`Project` is the client-linked delivery record for larger bodies of work. It carries ownership, commercial values, schedule targets, requester linkage, and the project board.

## Core data model

Primary table: `Project`

Key fields:

- `name` (required)
- `clientId` (required)
- `requesterId` (optional `ClientEmployee`)
- `status` (`planned`, `active`, `on_hold`, `completed`)
- `priority` (`low`, `medium`, `high`, `urgent`)
- `description`
- `estimatedPrice`, `finalPrice`
- `startDate`, `dueDate`

Key relationships:

- belongs to one `Client`
- optional requester from `ClientEmployee`
- has many `ProjectMilestone`
- has many `Task`
- has one `Board`

## Main pages

- `/projects`
- `/projects/new`
- `/projects/[id]`
- `/projects/[id]/edit`
- `/clients/[id]/projects`

## APIs

- `POST /api/projects`
- `PATCH /api/projects/[id]`

## Important behaviors

- Project name and client are required.
- Requester, when present, must belong to the selected client.
- Create/update ensures a project board exists.
- Updating project name also renames the linked board to `${project.name} Board`.
- Currency and dates are parsed server-side from form payloads.

## Production and security notes

- A project anchors many downstream records, so client changes must be validated carefully.
- Description may contain rich text/HTML output from the editor. Sanitization expectations should be reviewed if external content is ever injected.
- There is no project delete route yet. That is safer than accidental cascade loss.

## Operational gotchas

- Changing the project client can invalidate assumptions about milestones, tasks, and requester employees, so assistant workflows should treat client moves as high-risk edits.
- Board creation is automatic, which is convenient, but also means every project implicitly gains task-board behavior.

## AI instructions

### When adding a project

Require:

- project name
- client

Strongly recommended:

- status
- priority
- requester if one exists
- due date
- estimated price if known
- summary/description

### Validation rules

- Never link a requester employee from a different client.
- Do not assume a project should move to another client just because the name changes.
- Normalize status and priority to supported values only.

### Safe behavior

- If JR asks to create a project from a suggestion, confirm whether the suggestion title should become the project name and whether the suggestion should be referenced in notes.
- Do not fabricate pricing or due dates.
- Be careful with client changes on existing projects. That should usually be explicit and deliberate.

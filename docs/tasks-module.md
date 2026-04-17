# Tasks module

## Purpose

`Task` is the operational work record. It supports human work, Hulk-run work, agent work, and automation work, with optional client/project/milestone/requester linkage and billing metadata.

## Core data model

Primary tables: `Task`, `TaskTag`, `TaskTagAssignment`, `TaskTimeEntry`

Key fields:

- `title` (required)
- `description`
- `status` (`scheduled`, `in_progress`, `waiting`, `failed`, `completed`, `canceled`)
- `executorType` (`human`, `hulk`, `agent`, `automation`)
- `billingType` (`none`, `fixed`, `hourly`)
- `billable`
- `amount`, `billedAt`
- `startDate`, `dueDate` (due date required)
- `createdById`, `assignedToId` (required)
- optional `clientId`, `projectId`, `milestoneId`, `requesterEmployeeId`
- optional scheduling fields: `cronEnabled`, `cronExpression`, `cronTimezone`, `cronLastRunAt`, `cronNextRunAt`
- task tags via `TaskTag` + `TaskTagAssignment`
- manual task time history via `TaskTimeEntry` (`startedAt`, `endedAt`, `minutes`, `note`, `recordedById`)

## Main pages

- `/tasks`
- `/tasks/new`
- `/tasks/[id]`
- `/tasks/[id]/edit`

## APIs

- `GET|POST /api/tasks`
- `GET|PATCH|DELETE /api/tasks/[id]`
- `POST /api/tasks/[id]/time-entries`
- `PATCH /api/tasks/[id]/status`
- `POST /api/tasks/[id]/dispatch`
- `GET /api/tasks/stream`

## Important behaviors

- Title, assignee, and due date are required.
- `createdById` resolves from session, with fallback to `hulk@allstartech.com`.
- Relationship validation is strict:
  - selected project must exist
  - selected milestone must belong to the selected project
  - selected requester employee must belong to the resolved client
  - selecting project or milestone can implicitly resolve `clientId`
- Non-human executor types can carry schedule fields. Human tasks cannot.
- When a project-linked task is created, board placement is created or synced automatically.

## Status and execution model

- `human`: managed manually through status changes
- `hulk`: dispatched into Hulk's routed assistant session
- `agent`: dispatched as an OpenClaw agent-style run
- `automation`: dispatched from a shell runbook in the task description

## Billing behavior

- If `billable` is false, billing type is forced to `none` and amount is cleared.
- If `billable` is true, amount is optional in schema but should be treated as intentionally set or intentionally blank by ops.
- Time tracking is independent from billing. All tasks can log time, even when billing is `none` or fixed.

## Production and security notes

- Task descriptions for automation may contain executable shell. Treat them like code, not prose.
- Dispatch is disabled for human tasks by API design.
- Status-only updates create lifecycle run/event records, which is useful audit history.

## Phase 1 UI now available

- Task create/edit supports comma-separated tags with autocomplete from existing tags.
- Saving a task can create new tags and assign multiple tags safely.
- Task detail shows tags, total tracked time, manual time entry form, and full time-entry history.
- Task list surfaces tracked time and tags inline for quick triage.

## Operational gotchas

- Scheduled tasks can re-enter from `waiting`, not just `scheduled`, after cooldown.
- Board placement sync uses task status mapping, but board drag does not sync status back.
- Deleting tasks is allowed via API, so be cautious around tasks with useful run history.
- `GET /api/tasks/stream` exists for live refresh behavior and should be considered part of UI runtime, not public API.

## AI instructions

### When adding a task

Require:

- title
- assignee
- due date

Decide carefully:

- executor type
- status
- whether the task should link to a client, project, milestone, and requester
- whether it is billable
- whether scheduling should be enabled

### Validation rules

- Never create a milestone-linked task without verifying the milestone belongs to the same project.
- Never assign a requester employee from a different client.
- Do not enable cron scheduling for `human` tasks.
- If `automation` is selected, make sure the description contains a real shell runbook.
- If `hulk` or `agent` is selected, make sure the description is actionable enough to dispatch.

### Safe behavior

- If JR says "add a task" but not who owns it, stop and ask. Assignee is required and operationally important.
- Do not infer project linkage from title alone.
- Do not mark a task completed automatically just because a related message sounds positive. Status is a deliberate workflow write.
- Be cautious deleting tasks. Prefer status changes or archival patterns unless JR explicitly wants deletion.

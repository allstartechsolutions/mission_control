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
- timer fields: `timerState` (`idle`, `running`, `paused`), `timerStartedAt`, `timerStartedById`
- task tags via `TaskTag` + `TaskTagAssignment`
- task time history via `TaskTimeEntry` (`startedAt`, `endedAt`, `minutes`, `note`, `recordedById`) for both manual entries and completed timer sessions

## Main pages

- `/tasks`
- `/tasks/new`
- `/tasks/[id]`
- `/tasks/[id]/edit`

## APIs

- `GET|POST /api/tasks`
- `GET|PATCH|DELETE /api/tasks/[id]`
- `POST /api/tasks/[id]/time-entries`
- `DELETE /api/tasks/[id]/time-entries/[entryId]`
- `POST /api/tasks/[id]/timer`
- `PATCH /api/tasks/[id]/status`
- `PATCH /api/tasks/[id]/tags`
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

## Time tracking behavior

- Manual time entry remains available for backfill or corrections.
- Live timer supports `start`, `pause`, `resume`, and `stop`.
- `pause` and `stop` automatically write a `TaskTimeEntry` using the real timer start and end timestamps.
- `resume` starts a new running segment, so total tracked time accumulates across multiple work sessions on the same task.
- `stop` clears the running timer and leaves the task's tracked history intact.
- Time tracking stays separate from billing. Billable state does not control whether time can be logged.

## Billing behavior

- If `billable` is false, billing type is forced to `none` and amount is cleared.
- If `billable` is true, amount is optional in schema but should be treated as intentionally set or intentionally blank by ops.
- Time tracking is independent from billing. All tasks can log time, even when billing is `none` or fixed.

## Production and security notes

- Task descriptions for automation may contain executable shell. Treat them like code, not prose.
- Dispatch is disabled for human tasks by API design.
- Status-only updates create lifecycle run/event records, which is useful audit history.

## Time tracking UI now available

- Task detail shows total tracked time, current timer state, and who started the active timer.
- Operators can start, pause, resume, or stop the task timer directly from the task page.
- Running timers show the active session duration on the task page.
- Existing time entries can now be deleted from the task page when cleanup is needed.
- Manual entries still sit alongside timer-generated history in one timeline.

## Phase 1 UI now available

- Task create/edit supports comma-separated tags with autocomplete from existing tags.
- Saving a task can create new tags and assign multiple tags safely.
- Task detail shows tags as interactive chips with inline add/remove (no need to visit the edit page).
- Task list and task form render tags as polished label chips instead of plain text.
- Tags can be updated independently via `PATCH /api/tasks/[id]/tags` with a `{ tagNames }` JSON body.
- Task list surfaces tracked time and tags inline for quick triage.

## Operational gotchas

- Scheduled tasks can re-enter from `waiting`, not just `scheduled`, after cooldown.
- Timer pause and stop currently stamp a simple system note (`Timer paused` or `Timer stopped`) onto the generated entry instead of prompting for a custom note.
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

# Task execution runtime

## Purpose

This runtime turns non-human tasks into executable work with dispatch records, event history, cron scheduling, and log files.

## Main code paths

- Dispatch planning: `src/lib/task-execution.ts`
- Cron parsing and next-run calculation: `src/lib/tasks.ts`, `src/lib/cron.ts`
- Run and event persistence: `src/lib/task-runs.ts`
- Cron wake API: `src/app/api/cron/wake/route.ts`
- Manual dispatch API: `src/app/api/tasks/[id]/dispatch/route.ts`
- Status updates: `src/app/api/tasks/[id]/status/route.ts`

## Dispatch modes

`buildScheduledDispatchPlan()` emits one of these modes:

- `shell` for `automation`
- `session-send` for `hulk`
- `openclaw-agent` for `agent`

### Mode behavior

- `automation` requires a shell snippet in the task description, either `shell: ...` or fenced bash.
- `hulk` routes instructions back into Hulk's real JR session.
- `agent` builds a bounded execution prompt for an assigned agent identity.

## Runtime records

### `TaskRun`

Stores:

- trigger (`manual`, `scheduled`, `lifecycle`)
- status (`queued`, `running`, `succeeded`, `failed`)
- dispatch mode
- command/prompt snapshot
- summary
- log path
- start/finish timestamps
- exit code and errors
- metadata JSON

### `TaskRunEvent`

Stores timestamped event rows tied to either a run or the task overall.

## Cron wake behavior

`POST /api/cron/wake`:

- is protected by bearer token or `?key=` using `CRON_SECRET`, falling back to auth secrets
- finds due tasks where `cronEnabled = true`
- only dispatches non-human tasks
- allows status `scheduled` or `waiting`
- enforces a 90-second cooldown based on `cronLastRunAt`
- sets task status to `in_progress`
- advances `cronLastRunAt` and `cronNextRunAt`
- disables one-time schedules after they fire
- creates dispatch event records

`GET /api/cron/wake` returns current cron-enabled task state for diagnostics.

## Scheduling rules

- Human tasks cannot keep cron fields.
- Supported schedule builder modes map to cron expressions: one-time, daily, weekdays, weekly, monthly, custom.
- One-time expressions use a 6th year field.
- `cronNextRunAt` is precomputed and persisted.

## Logs and files

- Detached task runner writes logs under `task-runs/<runId>.log`
- Actual runner entry is `scripts/run-scheduled-task.ts`
- Runtime depends on `tsx` from local dependencies

## Production and security notes

- Task descriptions can become prompts or shell commands. This is the most sensitive path in the app.
- Cron endpoint must never be publicly callable without the shared secret.
- Log files may contain task instructions or failure output, so treat `task-runs/` as sensitive operational data.
- `routeThroughUserSession` and `allowUserFacingReply` mean some scheduled tasks can surface directly in JR's routed chat.

## Operational gotchas

- Dispatch queuing marks task state before child execution actually succeeds.
- A malformed automation shell runbook fails late, at dispatch/runtime time.
- The task runner is detached, so local debugging requires checking DB run rows and log files together.
- Lifecycle status changes also create synthetic `TaskRun` rows, which is useful but means not every run row represents a real external execution.

## AI instructions

### When JR asks to schedule or dispatch a task

Check, in order:

1. executor type
2. description completeness
3. schedule validity
4. whether user-facing replies are intended
5. whether the task is safe to run unattended

### Never do automatically

- Never convert a vague instruction into an automation shell runbook on your own.
- Never expose secrets in task descriptions just to make automation easier.
- Never enable cron on a human task.
- Never claim a dispatch succeeded just because it was queued.

### Production-safe assistant behavior

- For automation, insist on explicit command/runbook text.
- For Hulk or agent execution, make sure the description is understandable as an operational brief.
- After dispatch, inspect run state or logs before reporting completion.
- If a task can message JR directly, be deliberate. Do not create noisy self-triggering loops.

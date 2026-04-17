# System overview

## Stack

- Next.js App Router
- React 19
- Prisma + PostgreSQL
- NextAuth credentials auth with JWT session strategy
- Local disk storage for uploaded files and task run logs
- OpenClaw-oriented task dispatch runtime for human, Hulk, agent, and automation work

## High-level architecture

### UI shell

- Protected shell: `src/app/(protected)/layout.tsx`
- Sidebar/header/app chrome lives in `src/components/`
- Most operational screens are server-rendered pages with `dynamic = "force-dynamic"` and `noStore()` where freshness matters

### Data layer

- Prisma client singleton: `src/lib/prisma.ts`
- Schema: `prisma/schema.prisma`
- Domain helpers: `src/lib/projects.ts`, `src/lib/tasks.ts`, `src/lib/boards.ts`, `src/lib/task-execution.ts`, `src/lib/task-runs.ts`

### Storage

- Client logos: `src/lib/client-logo-storage.ts`
- Client employee images: `src/lib/client-employee-storage.ts`
- Suggestion attachments: `src/lib/suggestion-attachment-storage.ts`
- Task run logs: `task-runs/*.log`
- Client account secrets are encrypted before DB write by `src/lib/account-crypto.ts`

## Auth and access

### Login and session flow

- Login page: `/login`
- Register page exists but self-service registration API returns `403`
- NextAuth route: `src/app/api/auth/[...nextauth]/route.ts`
- Credentials provider uses bcrypt password checks against `User.password`
- `src/middleware.ts` protects everything except auth pages, auth APIs, and cron API

### Important auth reality

Authenticated access is implemented. Fine-grained authorization is still thin.

Examples:

- Team create/update/delete requires a signed-in session, but routes are not admin-only yet.
- Task dispatch and many operational writes rely on authenticated app access plus route validation, not role-specific policy.

Treat this as an operational risk until role-based authorization is added.

## Current module inventory

### Clients domain

- Clients
- Client Locations
- Client Employees
- Client Accounts
- Client detail workspace tabs for overview, locations, employees, projects, and accounts

### Delivery domain

- Projects
- Project Milestones
- Project Boards
- Tasks
- Task execution runtime, run history, and cron wake

### Intake domain

- Suggestions with attachments and review status

### Internal ops domain

- Team
- Auth/session handling

## Main protected routes

### Core

- `/dashboard`
- `/clients`
- `/projects`
- `/tasks`
- `/suggestions`
- `/team`

### Clients workspace

- `/clients/new`
- `/clients/[id]`
- `/clients/[id]/edit`
- `/clients/[id]/locations`
- `/clients/[id]/locations/new`
- `/clients/[id]/locations/[locationId]/edit`
- `/clients/[id]/employees`
- `/clients/[id]/employees/new`
- `/clients/[id]/employees/[employeeId]/edit`
- `/clients/[id]/projects`
- `/clients/[id]/accounts`
- `/clients/[id]/accounts/new`
- `/clients/[id]/accounts/[accountId]/edit`

### Projects workspace

- `/projects/new`
- `/projects/[id]`
- `/projects/[id]/edit`
- `/projects/[id]/milestones`
- `/projects/[id]/milestones/new`
- `/projects/[id]/milestones/[milestoneId]`
- `/projects/[id]/milestones/[milestoneId]/edit`
- `/projects/[id]/board`

### Tasks and suggestions

- `/tasks/new`
- `/tasks/[id]`
- `/tasks/[id]/edit`
- `/suggestions/new`
- `/suggestions/[id]`
- `/suggestions/[id]/edit`

## API surface by domain

### Clients

- `POST /api/clients`
- `PATCH /api/clients/[id]`
- `POST /api/clients/[id]/locations`
- `PATCH|DELETE /api/clients/[id]/locations/[locationId]`
- `POST /api/clients/[id]/employees`
- `PATCH /api/clients/[id]/employees/[employeeId]`
- `PATCH /api/clients/[id]/employees/[employeeId]/status`
- `POST /api/clients/[id]/accounts`
- `PATCH /api/clients/[id]/accounts/[accountId]`

### Projects and boards

- `POST /api/projects`
- `PATCH /api/projects/[id]`
- `GET|POST /api/projects/[id]/milestones`
- `GET|PATCH|DELETE /api/projects/[id]/milestones/[milestoneId]`
- `PATCH /api/projects/[id]/board`

### Tasks

- `GET|POST /api/tasks`
- `GET|PATCH|DELETE /api/tasks/[id]`
- `POST /api/tasks/[id]/time-entries`
- `DELETE /api/tasks/[id]/time-entries/[entryId]`
- `POST /api/tasks/[id]/timer`
- `PATCH /api/tasks/[id]/status`
- `POST /api/tasks/[id]/dispatch`
- `GET /api/tasks/stream`

### Suggestions

- `GET|POST /api/suggestions`
- `GET|PATCH|DELETE /api/suggestions/[id]`
- `DELETE /api/suggestions/[id]/attachments/[attachmentId]`

### Team and runtime

- `POST /api/team`
- `PATCH|DELETE /api/team/[id]`
- `PATCH /api/team/[id]/status`
- `POST|GET /api/cron/wake`

## Core data model map

### Organization records

- `Client`
- `ClientLocation`
- `ClientEmployee`
- `ClientEmployeeLocation`
- `ClientAccount`

### Delivery records

- `Project`
- `ProjectMilestone`
- `Task`
- `TaskTag`
- `TaskTagAssignment`
- `TaskTimeEntry`
- `Board`
- `BoardColumn`
- `TaskBoardPlacement`
- `TaskRun`
- `TaskRunEvent`

### Internal records

- `User`
- `Account`
- `Session`
- `VerificationToken`
- `Suggestion`
- `SuggestionAttachment`

## Operational gotchas

- Dashboard is still placeholder data, not live operations output.
- Project boards are project-scoped only.
- Dragging a task card between board columns reorders placements, but the current board route does not also update `Task.status`.
- Milestone delete archives instead of deleting when tasks are linked.
- Client account updates require supplying fresh username and password, because API writes encrypted replacements rather than partial secret patches.
- Human tasks cannot be dispatched through the task runtime.
- Scheduled execution is only valid for non-human executor types.

## Recommended next hardening work

1. Add admin-only authorization for team management and other sensitive writes.
2. Decide whether board column moves should also mutate task status.
3. Add secure reveal/rotation workflow for client account secrets, with audit logging.
4. Add delete policies and audit trails where data is still easy to remove silently.
5. Replace placeholder dashboard with real operational metrics.

# Mission Control docs

Production handoff and operator docs for the current Mission Control rebuild.

## Module docs

- `system-overview.md` - architecture, runtime shape, route map, and current module inventory.
- `clients-module.md` - core client record and client workspace overview.
- `client-locations-module.md` - client site/location records and lifecycle rules.
- `client-employees-module.md` - client-side employee/contact records and location linkage.
- `client-accounts-module.md` - encrypted credential/account storage for each client.
- `projects-module.md` - project records, client linkage, pricing, and milestone ownership.
- `milestones-module.md` - project milestone behavior, ordering, and archive rules.
- `project-boards-module.md` - project Kanban board structure and task placement rules.
- `tasks-module.md` - task CRUD, status model, billing, scheduling, and linked record validation.
- `task-execution-runtime.md` - cron wake, dispatch modes, task runs, logs, and execution safety.
- `suggestions-module.md` - suggestion intake, review lifecycle, and attachments.
- `team-and-auth-module.md` - users, auth flow, access protection, and team management.
- `ai-data-operations.md` - how Hulk or any assistant should safely add or update data in production.
- `nextjs-caching-rules.md` - live-data caching rules for mutable operational routes.
- `runbook.md` - deploy/start/build notes for this app.
- `dev-production-split.md` - recommended same-machine split between stable production and safe development.

## Ground rule

These docs describe the current app in `/home/jr/MissionControl`, not the deleted legacy system.

## Current gaps called out in docs

The docs intentionally call out unfinished or risky areas, especially:

- dashboard is still placeholder/demo data
- some modules have create/update but not full delete flows
- project board movement currently does not change `Task.status` automatically
- team authorization is authenticated-only in several routes, not admin-gated yet

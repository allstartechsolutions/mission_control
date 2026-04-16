# Mission Control dev and production split

This is the recommended same-machine split for JR's current Mission Control setup.

## Goal

Keep production stable on `/home/jr/MissionControl` and port `3001`, while giving development its own code checkout, service, env file, database, and visual identity.

## Recommended final layout

```text
/home/jr/
  MissionControl/                # production checkout
    .env                         # production secrets only
  MissionControl-dev/            # development worktree/checkout
    .env.development.local       # development secrets only
```

Supporting files already live in the repo under:

```text
/home/jr/MissionControl/deploy/systemd/
/home/jr/MissionControl/scripts/
/home/jr/MissionControl/docs/
```

## Branch and git strategy

Use one repo with separate branches and separate working trees.

- `master`: production branch
- `develop`: integration branch for active dev
- optional short-lived feature branches from `develop`

Recommended workflow:

1. Production checkout stays at `/home/jr/MissionControl` on `master`
2. Development checkout lives at `/home/jr/MissionControl-dev` on `develop`
3. Build and test in dev first
4. Promote by merging `develop` into `master`
5. Deploy only from the production checkout

Rules:

- Never do day-to-day feature work directly inside the production folder
- Never point dev service at the production database
- Never reuse production `.env` in dev
- Keep commits small enough that rollback is easy

## Service names

Use separate user services:

- production: `mission-control.service`
- development: `mission-control-dev.service`

## Ports and URLs

Keep production unchanged.

| Environment | Port | Public URL | Internal URL |
| --- | ---: | --- | --- |
| Production | 3001 | `http://192.168.20.30:3001` | `http://127.0.0.1:3001` |
| Development | 3002 | `http://192.168.20.30:3002` | `http://127.0.0.1:3002` |

If JR later puts either behind a reverse proxy/domain, keep the split anyway.

## Database split

Use separate PostgreSQL databases and ideally separate DB users.

- production DB: `mission_control`
- development DB: `mission_control_dev`

Recommended connection strings:

- production: `postgresql://mission_control:...@localhost:5432/mission_control`
- development: `postgresql://mission_control_dev:...@localhost:5432/mission_control_dev`

Rules:

- Prisma `migrate dev`, `db push`, and seed testing happen against dev only
- Production schema changes should be applied intentionally during promotion, after backup
- Never run destructive seed behavior against production

## Env file separation

Production:

- `/home/jr/MissionControl/.env`

Development:

- `/home/jr/MissionControl-dev/.env.development.local`

Use different values for all of these:

- `DATABASE_URL`
- `AUTH_SECRET`
- `NEXTAUTH_SECRET`
- `CRON_SECRET`
- `CLIENT_ACCOUNT_CREDENTIALS_KEY`
- `AUTH_URL`
- `NEXTAUTH_URL`
- `INTERNAL_APP_URL`
- `MISSION_CONTROL_ENV`
- visual environment label vars

Recommended labels:

- production: `MISSION_CONTROL_ENV=production`
- development: `MISSION_CONTROL_ENV=development`
- development public badge: `NEXT_PUBLIC_APP_ENV_LABEL=DEV`
- development banner tone: `NEXT_PUBLIC_APP_ENV_TONE=amber`

## Visual DEV labeling

Dev should be visually obvious so no one mistakes it for live production.

Recommended:

- top banner saying `DEV ENVIRONMENT`
- header badge that says `DEV`
- amber or red accent tone instead of the normal production-only feel
- optional browser tab title suffix like `(DEV)` later

The repo now includes a safe UI badge/banner hook for this.

## Promotion checklist

Before promoting dev to production:

1. Confirm all intended changes are committed in dev
2. Confirm dev service is healthy on port `3002`
3. Run lint/build in dev
4. Verify auth login flow in dev
5. Verify key operational pages in dev:
   - dashboard
   - clients
   - projects
   - tasks
   - suggestions
   - team
6. Review Prisma/schema changes carefully
7. Create a fresh production DB backup before any production schema or data change
8. Merge `develop` into `master`
9. In production checkout, pull latest `master`
10. Reconfirm production `.env` is untouched and still points to prod DB/URLs
11. Run production deploy script
12. Smoke test production on port `3001`

## Deployment rules

Production deploys must happen only from `/home/jr/MissionControl`.

Production deploy rules:

- port stays `3001`
- service stays `mission-control.service`
- production `.env` stays local and uncommitted
- backup first if DB-affecting change is involved
- no experimental fixes directly in prod

Development rules:

- use `/home/jr/MissionControl-dev`
- run on `3002`
- use `mission_control_dev` DB
- safe place for migrations, seed tests, UI tweaks, and runtime experiments

## Rollback and recovery

If a promotion goes bad:

1. Stop and assess, do not hot-edit production blindly
2. Roll production code back to the previous known-good commit on `master`
3. Restore the previous service state
4. If needed, restore the pre-deploy DB backup
5. Re-test production on `3001`
6. Move the failed fix back to `develop` for diagnosis

Minimum rollback assets to have before risky deploys:

- git commit hash of last known-good production
- fresh SQL backup in `DB_Backups/`
- note of the exact env/service settings in use

## What is already implemented in the repo now

This repo now includes:

- dev/prod split docs
- example env templates for production and development
- helper scripts for dev worktree setup and dev service control
- a development systemd service template for `/home/jr/MissionControl-dev`
- UI support for a visible non-production banner/badge

## What still needs a deliberate follow-up on the machine

These steps are documented but not forced automatically:

1. create PostgreSQL DB/user for `mission_control_dev`
2. create `/home/jr/MissionControl-dev` via git worktree
3. copy `.env.development.example` to `.env.development.local` in the dev checkout
4. install and start `mission-control-dev.service`
5. run Prisma commands against dev DB only

## Recommended final target state

- `/home/jr/MissionControl` -> `master`, prod env, prod DB, port 3001, prod service
- `/home/jr/MissionControl-dev` -> `develop`, dev env, dev DB, port 3002, dev service
- promotions happen by merge, backup, deploy, smoke test

# Runbook

## Environment split

Production stays on `/home/jr/MissionControl` and port `3001`.

Use `docs/dev-production-split.md` for the recommended same-machine dev/prod split, including a dedicated dev worktree at `/home/jr/MissionControl-dev`, port `3002`, and a separate `mission_control_dev` database.

New helper commands:

```bash
npm run dev:worktree
npm run dev:service:install
npm run dev:start
npm run dev:status
npm run dev:stop
```

## Install

```bash
npm install
```

## Database

Env file expects PostgreSQL:

- `DATABASE_URL`
- `AUTH_URL`
- `NEXTAUTH_URL`
- auth secrets

Common commands:

```bash
npm run db:push
npm run db:seed
```

## Safe local deploy and LAN start

Use the deploy script instead of running `next build` and `next start` separately:

```bash
npm run deploy:lan
```

What it does, in order:

1. Stops the old Mission Control Next.js process using `.missioncontrol.pid`
2. Removes the old `.next` directory
3. Runs a fresh production build
4. Starts a fresh `next start --hostname 0.0.0.0 --port 3001`
5. Waits for the app to answer on HTTP before reporting success

If you need to stop the LAN server manually:

```bash
npm run stop:lan
```

## Scheduled task wake

The app does not self-tick. A real scheduler must call the protected wake endpoint every minute with the cron secret.

Manual invocation:

```bash
npm run cron:wake
```

Recommended user crontab entry:

```cron
* * * * * cd /home/jr/MissionControl && ./scripts/cron-wake.sh >> /home/jr/MissionControl/cron-wake.log 2>&1
```

`./scripts/cron-wake.sh` loads `.env`, uses `CRON_SECRET` when present, and otherwise falls back to `AUTH_SECRET` / `NEXTAUTH_SECRET`. It calls the local app on `http://127.0.0.1:3001/api/cron/wake` by default, which avoids LAN routing issues.

Current configured LAN base URL from `.env`:

- `http://192.168.20.30:3001`

## Why this fixes the stale CSS / asset mismatch

The bad state happened when an older `next start` server kept running with an older in-memory build manifest while `.next` was rebuilt later.

`npm run deploy:lan` avoids that by stopping the old server before the rebuild, deleting the prior `.next` output, then building and starting a brand new server from that new build. That keeps the running process and the `.next` assets in sync.

## Verification checklist

1. Build succeeds
2. Start succeeds on `0.0.0.0:3001`
3. Open the LAN URL from another device on the network
4. Create a client and confirm it appears immediately on `/clients`
5. Edit that client and confirm the index reflects the change without restart

## Known follow-up

Next.js 16 warns that `src/middleware.ts` should move to the `proxy` convention later. That is separate from the Clients caching fix.

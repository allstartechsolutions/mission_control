# Next.js caching rules for mutable business routes

## Issue we hit

The Clients index was being built as a static route.

That meant:

- `/clients` was prerendered during `next build`
- creating or editing a client updated PostgreSQL correctly
- but the user kept seeing stale data until the app was rebuilt or restarted

This is exactly the wrong behavior for an internal business CRUD screen.

## Definitive fix applied

### 1. Mark the operational read routes as dynamic

Applied to:

- `src/app/(protected)/clients/page.tsx`
- `src/app/(protected)/clients/[id]/edit/page.tsx`

Implementation used:

- `export const dynamic = "force-dynamic"`
- `noStore()` at render time

This tells App Router not to treat these routes as static/prerenderable cache targets.

### 2. Revalidate affected paths after mutations

Applied to:

- `src/app/api/clients/route.ts`
- `src/app/api/clients/[id]/route.ts`

Implementation used:

- `revalidatePath("/clients")` after create and update
- `revalidatePath(`/clients/${id}/edit`)` after update

This clears any route cache that could still be hanging around for those paths.

## Architectural rule

For mutable operational modules in this app:

1. Server-render the page from the source of truth
2. Opt the route out of static caching
3. Revalidate impacted paths immediately after every write
4. Treat `router.refresh()` as a client refresh assist, not the primary freshness guarantee

## What not to do

Do not fix stale data by:

- telling users to restart the server
- relying only on client-side refresh calls
- adding random query-string cache busters
- converting the whole app to client-side fetching just to dodge route caching

## Quick verification signal

After a production build, `/clients` should show up as dynamic in build output, not static.

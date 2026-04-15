# Clients module

## User-facing scope today

The current Clients module supports:

- client directory/index
- create client flow
- edit client flow
- logo upload with immediate preview in the browser
- persisted logo storage on local disk
- client employee counts on the index

## Main files

- Index page: `src/app/(protected)/clients/page.tsx`
- New page: `src/app/(protected)/clients/new/page.tsx`
- Edit page: `src/app/(protected)/clients/[id]/edit/page.tsx`
- Form UI: `src/components/ClientForm.tsx`
- Index table UI: `src/components/ClientsTable.tsx`
- Create API: `src/app/api/clients/route.ts`
- Update API: `src/app/api/clients/[id]/route.ts`
- Logo storage helper: `src/lib/client-logo-storage.ts`

## How the flow works

### Index

`/clients` is a server-rendered operational page. It queries Prisma directly for the client list and employee counts, then passes normalized rows into the client table UI.

### Create

1. User opens `/clients/new`
2. `ClientForm` builds a `FormData` payload
3. `POST /api/clients` creates the client record
4. If a logo file was attached, the API stores it on disk and updates `logoPath`
5. The API revalidates `/clients`
6. The client app navigates back to `/clients` and refreshes the router

### Edit

1. User opens `/clients/[id]/edit`
2. The edit page loads the current client from Prisma
3. `ClientForm` submits a multipart `PATCH` request to `/api/clients/[id]`
4. The API updates the database and optionally replaces the logo file
5. The API revalidates both `/clients` and `/clients/[id]/edit`
6. The client app navigates back to `/clients` and refreshes the router

## Why this route is special

Clients is an operational CRUD area. Users expect new records and edits to appear immediately. Do not treat it like a cache-friendly brochure page.

## UI rule for index tables

For operational index data tables, use compact icon-only action buttons inside table rows instead of labeled text buttons. This keeps row actions clear without consuming too much horizontal space.

Apply this pattern to future index tables:

- keep page or header level primary actions, like create, as normal labeled buttons when that improves clarity
- use recognizable icons for row actions, with `title`, `aria-label`, and/or screen-reader text so the action stays obvious and accessible
- preserve semantic styling where it already communicates meaning, like primary actions staying primary-colored
- keep row actions visually compact and aligned to the right edge of the table

## Extension guidance

When adding client detail pages, employee CRUD, or related workflows:

- keep reads on server routes/components
- mark mutable business routes as dynamic
- revalidate affected paths after every write
- do not rely on build-time prerendering for live operational data
- follow the index-table icon-action rule above for row-level actions

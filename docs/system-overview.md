# System overview

## Stack

- Next.js 16 App Router
- React 19
- Prisma + PostgreSQL
- NextAuth v5 beta for auth
- Local file storage for uploaded client assets

## Current app areas

### Auth

- Login page: `src/app/login/page.tsx`
- Register page: `src/app/register/page.tsx`
- NextAuth API: `src/app/api/auth/[...nextauth]/route.ts`
- Register API: `src/app/api/register/route.ts`
- Protected shell: `src/app/(protected)/layout.tsx`
- Route protection: `src/middleware.ts`

### Protected product routes

- Dashboard: `src/app/(protected)/dashboard/page.tsx`
- Clients index: `src/app/(protected)/clients/page.tsx`
- Client create: `src/app/(protected)/clients/new/page.tsx`
- Client edit: `src/app/(protected)/clients/[id]/edit/page.tsx`
- Assets button library: `src/app/(protected)/assets/buttons/page.tsx`

### Shared UI

- App shell: `src/components/AppShell.tsx`
- Header: `src/components/Header.tsx`
- Sidebar: `src/components/Sidebar.tsx`
- Clients table: `src/components/ClientsTable.tsx`
- Client form: `src/components/ClientForm.tsx`

### Data layer

- Prisma client singleton: `src/lib/prisma.ts`
- Schema: `prisma/schema.prisma`
- Client logo storage: `src/lib/client-logo-storage.ts`

## Current data model highlights

### `Client`

Primary business account record with:

- company identity
- address fields
- main phone/mobile/WhatsApp
- primary contact fields
- status
- uploaded logo path

### `ClientEmployee`

Child records connected to a client. The Clients index already counts employees per client.

## Notes for future work

- This app is now a real App Router business app, not a static marketing-style site.
- Mutable operational screens should be treated as live data surfaces.
- When adding new business modules, follow the same pattern documented in `nextjs-caching-rules.md`.

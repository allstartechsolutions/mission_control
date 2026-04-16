# Clients module

## Purpose

`Client` is the top-level business account record. Everything customer-facing hangs off it: locations, client-side employees, projects, accounts, tasks, and suggestions.

## Core data model

Primary table: `Client`

Key fields:

- `companyName` (required)
- `status` (`active`, `onboarding`, `inactive` in current API)
- address fields
- contact channels
- primary contact fields
- `logoPath`

Key relationships:

- one-to-many with `ClientLocation`
- one-to-many with `ClientEmployee`
- one-to-many with `Project`
- one-to-many with `ClientAccount`
- optional linkage from `Suggestion`
- optional linkage from `Task`

## Main pages

- `/clients`
- `/clients/new`
- `/clients/[id]`
- `/clients/[id]/edit`
- `/clients/[id]/projects`

The client overview page is the workspace entry point and shows counts for locations, employees, projects, and accounts.

## APIs

- `POST /api/clients`
- `PATCH /api/clients/[id]`

Both are multipart form endpoints because logo upload is supported.

## Important behaviors

- Company name is required.
- Logo upload is optional and stored on local disk.
- Create/update revalidates the client list plus key dependent client routes.
- Client list is a live operational screen and should not be treated like a static marketing page.

## Production and security notes

- Client deletion is not exposed here. That is good, because deleting a client would cascade into multiple linked records.
- Treat `primaryContactEmail`, phone data, and address data as business-sensitive PII.
- Uploaded logos live on local storage. Backup strategy must include uploaded assets, not just PostgreSQL.

## Operational gotchas

- Client status validation exists in the API, not as a shared enum in Prisma, so keep docs/UI/API aligned manually.
- Any future bulk import or assistant automation must avoid duplicate clients created from small naming variations.
- If you move a project or task to a different client, validate linked requester and milestone relationships too.

## AI instructions

### When JR asks to add a client

Capture or confirm:

- company name
- status if explicitly known, otherwise default to `active`
- primary contact name/email/phone if available
- business address if available
- whether a logo file is being attached

### Validation rules

- Never create a client without a company name.
- Before creating, search the app or DB for likely duplicates by company name spelling.
- Normalize blank strings to null, not placeholder text.
- Do not invent address or contact data to fill gaps.

### Safe assistant behavior

- If JR gives incomplete info, create the client only when the missing fields are optional and clearly safe to leave blank.
- If there is any risk of duplicate identity, stop and confirm before writing.
- Never merge or reassign client-linked records automatically without explicit approval.

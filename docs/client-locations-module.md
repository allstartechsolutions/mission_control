# Client Locations module

## Purpose

`ClientLocation` stores a client's physical sites or operating locations. It exists so employees, service coverage, and later site-specific work can point at a real place instead of free text.

## Core data model

Primary table: `ClientLocation`

Key fields:

- `clientId` (required)
- `name` (required)
- address fields
- `phone`
- `status` (`active`, `inactive` in API)

Key relationships:

- belongs to one `Client`
- may be primary location for many `ClientEmployee` records
- may be linked as secondary location through `ClientEmployeeLocation`

## Main pages

- `/clients/[id]/locations`
- `/clients/[id]/locations/new`
- `/clients/[id]/locations/[locationId]/edit`

## APIs

- `POST /api/clients/[id]/locations`
- `PATCH /api/clients/[id]/locations/[locationId]`
- `DELETE /api/clients/[id]/locations/[locationId]`

## Important behaviors

- Location name is required.
- The parent client must exist.
- Delete is a hard delete through Prisma.
- Route revalidation refreshes the client workspace and locations list after changes.

## Production and security notes

- Because locations can be linked to employees, deletion should be treated carefully in operations even though the API allows it.
- If location history matters later, replace hard delete with archive/inactive semantics plus audit logging.

## Operational gotchas

- There is no dedicated status-only route; status changes go through full edit payloads.
- If a deleted location is referenced as a primary location on an employee, Prisma `onDelete: SetNull` protects the employee record, but secondary joins will cascade away.

## AI instructions

### When adding a location

Require:

- parent client
- location name

Good to capture when available:

- full address
- phone
- active vs inactive state

### Safe behavior

- Never create a location without tying it to a specific existing client.
- If JR gives an address but not a site label, propose a clean `name` like `Main Office` or `Warehouse`, but confirm before writing if it is ambiguous.
- Do not delete a location automatically if employees may still be tied to it. Prefer setting inactive unless JR explicitly wants deletion.

# Client Employees module

## Purpose

`ClientEmployee` stores the people who work for a client, especially requesters, contacts, and stakeholders tied to projects or tasks.

## Core data model

Primary table: `ClientEmployee`

Key fields:

- `clientId` (required)
- `name` (required)
- `title`
- `email`, `phone`, `mobile`, `whatsapp`
- `profileImagePath`
- `status` (`active`, `inactive` in API)
- `primaryLocationId`

Key relationships:

- belongs to one `Client`
- optional primary location via `ClientLocation`
- many-to-many secondary locations via `ClientEmployeeLocation`
- may be linked as `requester` on `Project`
- may be linked as `requesterEmployee` on `Task`

## Main pages

- `/clients/[id]/employees`
- `/clients/[id]/employees/new`
- `/clients/[id]/employees/[employeeId]/edit`

## APIs

- `POST /api/clients/[id]/employees`
- `PATCH /api/clients/[id]/employees/[employeeId]`
- `PATCH /api/clients/[id]/employees/[employeeId]/status`

## Important behaviors

- Employee name is required.
- Parent client must exist.
- Profile image upload is optional and stored on local disk.
- Secondary locations are replaced wholesale on edit.
- Secondary locations matching the primary location are filtered out.

## Production and security notes

- These records often hold personal contact data. Treat them like business PII.
- No delete route currently exists. That is safer than silent hard-deletion because employees can be linked to tasks and projects.
- Requester validation on projects/tasks relies on this table belonging to the selected client.

## Operational gotchas

- Editing an employee overwrites secondary location joins with the submitted list. Partial patch semantics do not exist.
- Status changes are simple and do not validate downstream project/task references.
- If a location changes, requester relationships remain valid because they are employee-based, not location-based.

## AI instructions

### When adding a client employee

Require:

- parent client
- employee name

Capture when known:

- title
- email and phone channels
- primary location
- secondary locations
- active vs inactive
- profile image file

### Validation rules

- Never link an employee to a location from another client.
- If JR names a requester already existing under the same client, check for duplicates before creating a second record.
- Prefer updating an existing employee instead of creating near-duplicate contacts.

### Safe behavior

- Do not mark an employee inactive just because they stop being a requester on one project.
- Do not remove location links unless JR asked for it or the new submitted record clearly replaces them.
- If an employee is referenced by open projects or tasks, prefer status changes over destructive cleanup.

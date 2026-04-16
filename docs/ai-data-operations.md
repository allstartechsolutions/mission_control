# AI data operations guide

## Purpose

This is the production-safe rulebook for Hulk or any assistant when JR asks to add or update data in Mission Control.

## General operating stance

- Prefer precision over speed.
- Validate relationships before writes.
- Preserve existing data unless JR clearly asked to replace it.
- Never treat missing information as permission to invent values.
- When a write could damage structure, stop and confirm.

## Universal write checklist

Before any create or update:

1. Identify the exact target module.
2. Identify required fields.
3. Check whether a parent record must already exist.
4. Check for duplicate or near-duplicate records.
5. Validate cross-record relationships.
6. Confirm whether this is create, update, status change, or delete.
7. Prefer the least destructive operation that satisfies JR's request.

## Module-specific rules

### Clients

- Require `companyName`.
- Check for duplicate company names first.
- Do not merge clients automatically.

### Client Locations

- Require parent client and location name.
- Prefer inactive over delete unless deletion is explicit.

### Client Employees

- Require parent client and employee name.
- Reuse existing employee records when the person clearly already exists.
- Validate location links belong to the same client.

### Client Accounts

- Require parent client, account name, username, and password.
- Never expose or store plaintext secrets outside the intended write path.
- Never overwrite credentials on partial instructions.

### Projects

- Require project name and client.
- Requester must belong to that client.
- Treat client changes on existing projects as high-risk.

### Milestones

- Require project and title.
- Prefer archive behavior over destructive cleanup when tasks are linked.

### Tasks

- Require title, assignee, due date.
- Validate all links: client, project, milestone, requester employee.
- Do not schedule human tasks.
- Do not dispatch non-human tasks without actionable descriptions.

### Suggestions

- Require title and body.
- Use suggestions for ideas, not tasks or projects, unless JR clearly wants execution records.

### Team

- Require name, email, password for create.
- Treat role changes as sensitive.
- Prefer inactive over delete.

## What should never be done automatically

- deleting a client
- moving a project to another client without explicit approval
- rotating or overwriting stored credentials without explicit instruction
- enabling cron or automation from vague prose
- fabricating due dates, prices, requester links, or credentials
- assuming a board move is the same as a status change
- creating duplicate people or companies because matching was skipped
- exposing secrets in logs, docs, commits, or chat

## How to interpret JR's requests

### "Add ..."

Usually means create a new record, but check for an existing record first.

### "Update ..." or "change ..."

Assume patch semantics where possible. Do not clear unspecified fields unless the UI/API requires full replacement and JR understands that.

### "Delete ..."

Treat as high-risk. Check linked records first. If there is a safer inactive/archive route, recommend it unless JR is clearly asking for permanent removal.

### "Set up automation" or "schedule this"

Treat as task-runtime work, not a casual data edit. Require explicit execution instructions and validate executor type.

## Response pattern for production-safe assistance

When the request is clear and safe, write the data and report exactly what changed.

When the request is ambiguous, ask the smallest clarifying question needed, usually one of:

- which client/project/person?
- create new or update existing?
- what assignee/due date/status?
- should this be inactive/archive instead of delete?
- do you want credentials replaced or left alone?

## Final rule

Mission Control is an operational system, not a scratchpad. If a guess could create bad business data, do not guess.

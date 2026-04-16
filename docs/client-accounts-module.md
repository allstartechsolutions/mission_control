# Client Accounts module

## Purpose

`ClientAccount` stores credentials or access records associated with a client, like vendor portals, service dashboards, or admin accounts.

## Core data model

Primary table: `ClientAccount`

Key fields:

- `clientId` (required)
- `name` (required)
- `description`
- `usernameEncrypted` (required)
- `passwordEncrypted` (required)

Key relationship:

- belongs to one `Client`

## Main pages

- `/clients/[id]/accounts`
- `/clients/[id]/accounts/new`
- `/clients/[id]/accounts/[accountId]/edit`

## APIs

- `POST /api/clients/[id]/accounts`
- `PATCH /api/clients/[id]/accounts/[accountId]`

These endpoints use JSON, not multipart form payloads.

## Important behaviors

- Name, username, and password are required on both create and update.
- Secrets are encrypted before storage using AES-256-GCM in `src/lib/account-crypto.ts`.
- Encryption key comes from `CLIENT_ACCOUNT_CREDENTIALS_KEY` and must decode to exactly 32 bytes.
- Account routes currently support create and update, not delete.

## Production and security notes

- This is one of the highest sensitivity modules in the app.
- Backups contain encrypted secrets, so key management matters as much as DB backup management.
- If the encryption key changes without migration support, existing secrets become unreadable.
- Avoid logging raw request bodies or plaintext credentials anywhere near this flow.

## Operational gotchas

- Update requires sending a full replacement username and password, not just a name/description patch.
- There is no credential reveal, audit log, or rotation history yet.
- If the encryption key is missing or malformed, account writes fail hard.

## AI instructions

### When JR asks to add a client account

Require:

- parent client
- account display name
- username
- password

Optional:

- description explaining what the account is for

### Safe behavior

- Never invent credentials.
- Never downgrade or blank out secrets because JR omitted them on an update request. If the API requires them and JR did not provide them, stop and ask.
- Never paste account secrets into docs, comments, commits, logs, or chat unless JR explicitly asks and the channel is safe.
- Never rotate or overwrite credentials automatically without explicit instruction.

### Validation rules

- Confirm the target client carefully. Credential records on the wrong client are costly.
- Treat `name` as a human-facing label like `GoDaddy`, `Office 365 Admin`, or `Meraki Dashboard`, not as a secret field.

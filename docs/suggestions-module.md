# Suggestions module

## Purpose

`Suggestion` is the intake and review queue for ideas, improvements, and proposed work, optionally linked to a client.

## Core data model

Primary tables:

- `Suggestion`
- `SuggestionAttachment`

Key fields on `Suggestion`:

- `title` (required)
- `body` (required)
- `category`, `area`
- `impact`, `effort`
- `whyItMatters`, `expectedOutcome`
- `linkedProject`
- `decisionNotes`
- `status` (`new`, `under_review`, `planned`, `accepted`, `rejected`, `implemented`, `archived`)
- `suggestedById` (required `User`)
- optional `clientId`

## Main pages

- `/suggestions`
- `/suggestions/new`
- `/suggestions/[id]`
- `/suggestions/[id]/edit`

## APIs

- `GET|POST /api/suggestions`
- `GET|PATCH|DELETE /api/suggestions/[id]`
- `DELETE /api/suggestions/[id]/attachments/[attachmentId]`

## Important behaviors

- User must be authenticated.
- Title and body are required.
- Attachments are stored on local disk and tracked in `SuggestionAttachment`.
- `suggestedById` always comes from the active session, not the form.
- Delete removes the suggestion record and then removes stored attachments.

## Production and security notes

- Attachment uploads may contain sensitive client materials. Backup and retention policy should include them.
- `linkedProject` is currently free text, not a foreign key.
- Suggestion status changes are not audited beyond row updates.

## Operational gotchas

- `linkedProject` can drift from real project names because it is not relational.
- Editing a suggestion can add new attachments, but attachment deletion is a separate endpoint.
- This module is good for intake, but not yet a full approval workflow engine.

## AI instructions

### When adding a suggestion

Require:

- title
- body

Capture when known:

- client linkage
- category or area
- impact and effort
- why it matters
- expected outcome
- supporting attachments

### Safe behavior

- Do not create a project automatically just because a suggestion exists.
- If JR asks to "log this idea," use suggestions unless they explicitly want a project or task instead.
- Do not present `linkedProject` as a guaranteed relational link.
- Preserve JR's wording where strategic nuance matters, especially in `whyItMatters` and `decisionNotes`.

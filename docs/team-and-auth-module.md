# Team and auth module

## Purpose

This module covers internal users, authentication, protected routing, and basic team administration.

## Core data model

Primary auth/team tables:

- `User`
- `Account`
- `Session`
- `VerificationToken`

Important `User` fields:

- `name`
- `email` (unique)
- `password` (bcrypt hash for credentials auth)
- `role` (`admin` or `user` in current app logic)
- `phone`, `mobile`, `whatsapp`
- `status` (`active`, default active)

## Main pages

- `/login`
- `/register`
- `/team`
- `/team/new`
- `/team/[id]/edit`

## APIs

- `POST /api/auth/[...nextauth]` and related NextAuth handlers
- `POST /api/register` returns `403` because self-service registration is disabled
- `POST /api/team`
- `PATCH|DELETE /api/team/[id]`
- `PATCH /api/team/[id]/status`

## Important behaviors

- Credentials auth checks email + bcrypt password.
- Session strategy is JWT.
- Auth redirects signed-in users away from `/login` and `/register` to `/dashboard`.
- Unauthenticated users are redirected to `/login` for protected routes.
- Team create/update validates unique email and password length when password is supplied.
- Signed-in users cannot delete their own user record.

## Production and security notes

- Current team write routes require authentication, but not explicit admin role enforcement. This is a real security gap.
- The dashboard is not an authorization boundary. Middleware is.
- If credentials auth remains the primary method, password reset and MFA are future gaps to track.

## Operational gotchas

- `/register` page exists, but API intentionally blocks self-service registration. That is expected behavior.
- Team status update route does not currently check auth explicitly in the handler, relying on middleware-protected access.
- `role` is free text in schema but constrained to admin/user in route logic.

## AI instructions

### When adding a team member

Require:

- name
- email
- password

Capture when known:

- role
- phone/mobile/whatsapp

### Safe behavior

- Never create team members through self-service registration flow. Use the team admin flow.
- Never lower security by picking a weak or placeholder password unless JR explicitly instructs that and understands the risk.
- Never delete a team member automatically because they are inactive. Prefer status changes first.
- Treat role changes as high-impact. If JR says "make them admin," do it deliberately and only for the correct user.

### Validation rules

- Email must be unique.
- Password must be at least 8 characters.
- If updating without a new password, do not overwrite the stored hash.

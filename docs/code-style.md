# Code Style

## General

- Prefer TypeScript types from `packages/shared` when both web and API need the same shape.
- Keep route files thin; put business logic in services.
- Use Zod schemas for request validation.
- Use Prisma for database access.
- Keep naming domain-first: course, module, lesson, quiz, challenge, enrollment, certificate.
- Avoid unrelated refactors inside feature work.
- Prefer small, local changes over broad rewrites.
- Keep user-facing copy clear and direct.

## Web

- Use the Next.js App Router.
- Keep screens in `apps/web/app`.
- Keep reusable UI in `apps/web/components`.
- Keep API calls and cache hooks in `apps/web/lib` and `apps/web/hooks`.
- Use TanStack Query for server state.
- Use shared UI primitives before adding new one-off controls.

## API

- Group routes by audience: public, auth, student, admin, payments.
- Validate input before service calls.
- Return consistent response objects with `success`, `message`, and optional `data`.
- Throw `AppError` for expected failures.
- Capture unexpected errors with Sentry.

## Database

- Add migrations for schema changes.
- Preserve cascade behavior intentionally.
- Index fields used for filtering, lookup, and dashboards.
- Keep unique constraints close to product rules.

## Docs

- Keep pages short.
- Put operational commands in code blocks.
- Update `SUMMARY.md` when adding a page.
- Favor tables, diagrams, and lists when they reduce explanation.

## File Patterns

| Need | Where to put it |
| --- | --- |
| Public web page | `apps/web/app/.../page.tsx` |
| Shared UI | `apps/web/components/ui` |
| Feature component | nearest `components` folder |
| API route | `apps/api/src/routes/<area>` |
| API service | next to the route file |
| Request schema | route area `*.schemas.ts` |
| Database change | Prisma schema plus migration |
| Shared type/schema | `packages/shared/src` |
| Email template | `apps/api/src/templates` |

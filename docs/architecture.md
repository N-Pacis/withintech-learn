# Architecture

## Repo Layout

| Path | Responsibility |
| --- | --- |
| `apps/web` | Next.js UI, app routes, components, hooks, API client. |
| `apps/api` | Express API, Prisma, routes, services, middleware, templates. |
| `apps/executor` | Small Go service for challenge execution through Judge0. |
| `packages/shared` | Shared schemas, types, and role constants. |
| `infra` | Nginx, PostgreSQL init, and backup scripts. |
| `docs` | GitBook documentation. |

## Runtime Boundaries

- Web calls API through `NEXT_PUBLIC_API_URL`.
- API owns auth, database writes, payments, emails, uploads, scoring, and certificates.
- Executor owns code execution requests only.
- Judge0 runs isolated from the app database and app Redis.
- Nginx terminates HTTPS and routes frontend and API domains.

## Main Flows

| Flow | Path |
| --- | --- |
| Public browse | Browser -> Web -> API public routes -> PostgreSQL/Redis |
| Student course | Browser -> Web protected route -> API student routes -> PostgreSQL |
| Payment | Browser -> API payments -> Xentripay -> Payment row/status |
| Upload | Browser -> API upload middleware -> S3-compatible storage -> storage key in DB |
| Challenge run | Browser -> API challenge route -> Executor -> Judge0 -> API response/submission |
| Admin edit | Browser -> Admin route -> API admin route -> Prisma transaction |

## Auth Shape

- API uses cookies and JWT access/refresh tokens.
- Web calls API with `credentials: "include"`.
- Failed protected calls attempt refresh once, then redirect to sign in.
- Admin access is enforced by `authenticate` and `isAdmin` middleware.

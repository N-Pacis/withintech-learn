# AGENTS.md

This is the file AI agents read before touching this codebase. `docs/` (Mintlify) is sanitized, external-facing product/architecture framing — safe to share with partners, but deliberately stripped of real env var names, routes, and file paths. This file is the opposite: internal, concrete, and authoritative for how to actually build here. When the two conflict on a technical detail, this file wins.

You are a principal-level engineer working on WithinTech Learn, an LMS for WithinTech camp and program participants.

## 1. Workflow

1. Read this file.
2. Read the skills named in the prompt (`.agents/skills/`) plus any clearly needed supporting skill.
3. Inspect the relevant code — don't assume, check `apps/api/prisma/schema.prisma`, the real routes, the real services.
4. Ask a focused question only if there's real ambiguity.
5. Write a detailed implementation prompt to `prompts/<name>.md`.
6. Ask: "I prepared the implementation prompt at prompts/<name>.md. Good to execute?"
7. Implement only after approval.
8. Run available checks (`pnpm lint`, `pnpm build` for affected workspaces).
9. Share exact steps to verify the change.

## 2. Product

WithinTech Learn delivers courses, quizzes, coding challenges, and certificates to program participants, with enrollment and payments gating access.

**In scope:** course/module/lesson content and delivery, quizzes, coding challenges with Judge0-backed execution, enrollments, certificates, payments via XentriPay, admin content/user/enrollment/payment management, invitations, email notifications.

**Out of scope — do not build without explicit sign-off:**
- Mobile app.
- Discussion forums, comments, or other social features.
- Live video / streaming classes.
- A recommendation engine.
- Any payment provider other than XentriPay.
- Any auth method other than JWT (access/refresh) + Google OAuth.

Do not overbuild. If a task seems to imply one of the above, ask first.

## 3. Architecture

| App | Path | Responsibility |
|---|---|---|
| Web | `apps/web` | Next.js UI. Displays data, handles routing/forms. Talks to the API only via `NEXT_PUBLIC_API_URL`. No business logic, no secrets. |
| API | `apps/api` | Express + TypeScript. Owns data writes, auth, authorization, payments, uploads, scoring, certificates. |
| Executor | `apps/executor` | Go service bridging to Judge0 (`docker-compose.judge0.yml`) for isolated code-challenge execution. Called only by the API (`EXECUTOR_URL` / `EXECUTOR_SECRET`), never directly by the web app. |
| Shared | `packages/shared` | Cross-app TypeScript types/schemas. Reuse a shape from here before redefining it in web or API. |
| Docs | `docs/` | Sanitized Mintlify product/engineering docs. Good for product framing, not for exact technical specifics. |

Secrets and privileged operations (payments, uploads, code execution, email) never run in `apps/web` — always through `apps/api`.

## 4. Tech stack

- **Web:** Next.js 16, React 19, Tailwind CSS 4, TanStack Query, Radix UI, Tiptap (rich text), CodeMirror/Sandpack (challenge editor).
- **API:** Express 4, TypeScript, Prisma 7 + PostgreSQL (`@prisma/adapter-pg`), Redis/ioredis (cache + rate limiting), JWT (`jsonwebtoken`) + Google OAuth (`google-auth-library`), AWS SDK v3 (S3/B2), Nodemailer, Sentry, Puppeteer (certificate PDFs).
- **Execution:** Go + Judge0.
- **Payments:** XentriPay.

**Do not:**
- Introduce a second ORM alongside Prisma.
- Add a second auth library or session scheme alongside JWT + Google OAuth.
- Add a new payment provider or storage provider without asking first.
- Call S3, Judge0/executor, or XentriPay directly from `apps/web` — route everything through `apps/api`.

## 5. Data model

Core concepts: User (Visitor / Student / Admin), Course → Module → Lesson, Quiz/Question, Enrollment, Certificate, Payment, Challenge → Submission, Progress records.

`apps/api/prisma/schema.prisma` is the source of truth for exact fields, relations, and constraints — read it before touching data, don't rely on this summary or on `docs/system/data-model.mdx` for field-level accuracy. Migrations live in `apps/api/prisma/migrations`.

Status enums already defined by the product (reuse, don't invent new ones):
- Course: draft, published, archived.
- Access: free, paid-course, paid-certificate.
- Enrollment: pending, enrolled, passed.
- Payment: pending, paid, failed, expired.
- Submission: accepted, incorrect answer, timeout, runtime error, compile error.

## 6. API contracts

`apps/api/swagger.json` and `apps/api/src/routes/**` are the source of truth for exact paths and HTTP methods. Routes are grouped by audience (`public/`, student-facing, `admin/`). Don't flip a method or invent a new path without checking these first — other things depend on the existing shape.

## 7. Security

Never expose to the browser, logs, commits, or docs: `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`, `EXECUTOR_SECRET`, `JUDGE0_SECRET_KEY_BASE` / `JUDGE0_AUTH_TOKEN`, `XENTRIPAY_API_KEY`, `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`, `SMTP_USER` / `SMTP_PASS`, `SENTRY_DSN`.

- Never return hidden challenge tests to the client.
- Admin routes must go through role/permission middleware — check it exists before assuming a route is protected.
- Validate request bodies (zod) before running product logic.
- If a secret ever leaks into a log, screenshot, or doc, flag it for rotation immediately.

## 8. Code standards

- Keep Express route handlers thin; business logic lives in `apps/api/src/services/*.service.ts`.
- Validate inputs before service calls.
- Reuse `packages/shared` types across web and API instead of duplicating shapes.
- Small functions, explicit types, no `any`.
- No unrelated refactors, no over-engineering, no changes outside the task's scope.
- Keep product language domain-first: course, module, lesson, quiz, challenge, enrollment, certificate.

## 9. Checks to run

- `pnpm lint` and `pnpm build` for every workspace touched.
- There is no automated test suite in this repo today. If a task genuinely needs test coverage, ask which framework/approach before introducing one — don't pick silently.

## 10. When in doubt

1. Check `docs/` for product/architecture framing first.
2. If still ambiguous, ask one focused question.
3. Keep the change small.
4. Save a prompt to `prompts/`.
5. Get approval.
6. Implement, run checks, share test steps.

Rule of thumb: if you'd have to repeat something in more than one prompt, it belongs in this file.

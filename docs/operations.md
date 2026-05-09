# Operations

## Common Commands

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm backend
pnpm frontend
pnpm executor
pnpm run docs
```

## Database

```bash
cd apps/api
npx prisma migrate deploy
pnpm --filter @withintech-learn/api seed
```

## Docker

```bash
docker compose up --build -d
docker compose logs -f api
docker compose logs -f web
docker compose logs -f docs
```

## Environment

All environment variables are listed in [Environment](environment.md). Start from `.env.example`, then fill real values in `.env`.

## Release Checks

- Build web and API.
- Run lint.
- Apply migrations.
- Confirm `/health`.
- Confirm `/health/full`.
- Submit one quiz attempt.
- Submit one coding challenge.
- Test one payment path in provider sandbox or staging.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Web cannot reach API | `NEXT_PUBLIC_API_URL`, CORS `APP_URL`, API container health. |
| Login loops | Refresh cookie, JWT secrets, browser credentials mode. |
| Course missing publicly | Course status must be `published`. |
| Upload fails | Storage env vars, bucket permissions, file type. |
| Challenge never returns | Executor URL, Judge0 URL, Judge0 worker health. |
| Payment stuck | Xentripay reference, provider status endpoint, `Payment.status`. |
| Certificate missing | Course completion, quiz pass status, certificate uniqueness. |

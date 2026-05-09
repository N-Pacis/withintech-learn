# Environment

Use `.env.example` as the source of truth. Keep real values in `.env` only.

## Database And Runtime

| Variable | Purpose | Required |
| --- | --- | --- |
| `DATABASE_URL` | Prisma/PostgreSQL connection string used by the API. | Yes |
| `POSTGRES_USER` | Docker Compose PostgreSQL username. | Yes for Compose |
| `POSTGRES_PASSWORD` | Docker Compose PostgreSQL password and backup script auth. | Yes for Compose |
| `REDIS_URL` | API Redis connection. Defaults to `redis://localhost:6379`. | Recommended |
| `NODE_ENV` | Runtime mode for cookies, logging, and Sentry environment. | Yes |
| `PORT` | API port. Defaults to `3001`. | Optional |
| `BCRYPT_ROUNDS` | Password and OTP hash cost. Defaults to `12`. | Optional |

## Auth

| Variable | Purpose | Required |
| --- | --- | --- |
| `JWT_ACCESS_SECRET` | Signs access, reset, and magic login tokens. | Yes |
| `JWT_REFRESH_SECRET` | Signs refresh tokens. | Yes |
| `JWT_ACCESS_EXPIRES_IN` | Present in `.env.example`; token TTL is currently hardcoded in code. | No |
| `JWT_REFRESH_EXPIRES_IN` | Present in `.env.example`; token TTL is currently hardcoded in code. | No |
| `GOOGLE_CLIENT_ID` | API Google OAuth verification. | For Google login |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Browser Google OAuth client id. | For Google login |
| `ADMIN_SEED_EMAIL` | Initial/admin seed account email. | For seed/auth bootstrap |

## App URLs

| Variable | Purpose | Required |
| --- | --- | --- |
| `APP_URL` | Frontend origin for API CORS, emails, and links. | Yes |
| `NEXT_PUBLIC_APP_URL` | Public frontend origin used by certificates and invitations. | Yes |
| `NEXT_PUBLIC_API_URL` | Public API base URL used by the web app. | Yes |

## Email

| Variable | Purpose | Required |
| --- | --- | --- |
| `SMTP_HOST` | SMTP host. | Yes |
| `SMTP_PORT` | SMTP port. Defaults to `587` when omitted. | Recommended |
| `SMTP_USER` | SMTP username. | Yes |
| `SMTP_PASS` | SMTP password. | Yes |
| `EMAIL_FROM` | Sender address for app emails. | Yes |

## Storage

| Variable | Purpose | Required |
| --- | --- | --- |
| `STORAGE_PROVIDER` | Storage provider label. Current implementation uses S3-compatible storage. | Optional |
| `AWS_REGION` | S3-compatible region. | Yes |
| `AWS_ACCESS_KEY_ID` | S3-compatible access key. | Yes |
| `AWS_SECRET_ACCESS_KEY` | S3-compatible secret key. | Yes |
| `S3_BUCKET_NAME` | Bucket for uploaded course/block media. | Yes |

## Payments

| Variable | Purpose | Required |
| --- | --- | --- |
| `XENTRIPAY_API_KEY` | Xentripay API key. The service throws on startup if missing. | Yes |
| `XENTRIPAY_BASE_URL` | Xentripay API base URL. Defaults to test URL. | Recommended |

## Executor And Judge0

| Variable | Purpose | Required |
| --- | --- | --- |
| `EXECUTOR_URL` | API-to-executor URL. Defaults to `http://localhost:4001`. | Recommended |
| `EXECUTOR_SECRET` | Optional shared secret between API and executor. | Optional |
| `JUDGE0_URL` | Executor-to-Judge0 URL. Defaults to `http://localhost:2358`; Compose sets it to host gateway. | Recommended |
| `JUDGE0_SECRET_KEY_BASE` | Rails secret required by Judge0 Docker services. | Yes for Judge0 |

## Monitoring

| Variable | Purpose | Required |
| --- | --- | --- |
| `SENTRY_DSN` | Enables Sentry error tracking. | Production |

## Public Branding

| Variable | Purpose | Required |
| --- | --- | --- |
| `NEXT_PUBLIC_BRAND_NAME` | Brand name used in exports and UI fallbacks. | Optional |
| `NEXT_PUBLIC_SUPPORT_PHONE` | Support phone shown in exports/contact areas. | Optional |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | Support email shown in exports/contact areas. | Optional |
| `NEXT_PUBLIC_SUPPORT_WEBSITE` | Support website shown in exports/contact areas. | Optional |
| `NEXT_PUBLIC_SOCIAL_HANDLE` | Social handle shown in exports/contact areas. | Optional |
| `NEXT_PUBLIC_SOCIAL_PLATFORMS` | Social platforms metadata for public display/export use. | Optional |

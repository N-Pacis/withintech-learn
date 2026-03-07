# WithinTech-Learn

A monorepo LMS platform built with Next.js (web) and Express + Prisma (API).

---

## Structure

```
withintech-learn/
├── apps/
│   ├── api/          # Express REST API (Node.js + TypeScript + Prisma)
│   └── web/          # Next.js frontend
├── packages/
│   └── shared/       # Shared types/utilities across apps
├── infra/
│   ├── nginx/        # Nginx reverse-proxy config
│   └── postgres/     # DB init SQL
├── docker-compose.yml
└── .env.example
```

## Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL 16 running on the host machine
- Docker (for Redis)

---

## Setup

```bash
# Install dependencies
pnpm install

# Copy and fill in env vars
cp .env.example .env
```

Key vars to set in `.env`:

| Variable | Description |
|---|---|
| `DATABASE_URL` | Postgres connection string — use `localhost` when running locally, `host.docker.internal` when running in Docker |
| `JWT_ACCESS_SECRET` | Secret for access tokens |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens |
| `SMTP_HOST / PORT / USER / PASS` | Email sending credentials |
| `EMAIL_FROM` | Sender address |
| `ADMIN_SEED_EMAIL` | Email for the initial admin account |
| `APP_URL` | Frontend origin (for CORS) |

---

## Running locally

Postgres runs on your host machine. Only Redis runs in Docker.

```bash
# Start Redis
docker compose up redis -d

# Run API (from root or apps/api)
pnpm --filter @withintech-learn/api dev

# Run web (from root or apps/web)
pnpm --filter @withintech-learn/web dev

# Run everything in parallel
pnpm dev
```

API runs on `http://localhost:3001`, web on `http://localhost:3000`.

---

## Database

```bash
cd apps/api

# Apply migrations
npx prisma migrate dev

# Open Prisma Studio
npx prisma studio

# Regenerate client after schema changes
npx prisma generate
```

---

## Docker (full stack)

Postgres must be running on the host. Set `DATABASE_URL` using `host.docker.internal` so containers can reach it:

```
DATABASE_URL=postgresql://<user>:<pass>@host.docker.internal:5432/<db>
```

Then:

```bash
docker compose up --build
```

Nginx proxies port 80/443 → web (3000) and api (3001). Redis runs as a container; Postgres is served from the host.

---

## Seed admin

Run the seed script once after the DB is ready. It creates the `admin` and `student` roles and the first admin user:

```bash
pnpm --filter @withintech-learn/api seed
```

The script prints the admin email and a one-time plain-text password to stdout. Store it — it will not be shown again.

---

## API docs

The OpenAPI spec lives at `apps/api/swagger.json`. **Any time an API route is added or changed, `swagger.json` must be updated in the same commit.**

Swagger UI is served by the API at `http://localhost:3001/api-docs`.

---

## Auth flow

| Route | Description |
|---|---|
| `POST /api/auth/seed` | Create initial admin (one-time) |
| `POST /api/auth/login` | Returns access + refresh tokens |
| `POST /api/auth/refresh` | Exchange refresh token for new access token |
| `POST /api/auth/logout` | Invalidate session |
| `POST /api/auth/register` | Admin registers a new student |
| `POST /api/auth/password-reset/request` | Send OTP to email |
| `POST /api/auth/password-reset/confirm` | Verify OTP and set new password |
| `POST /api/auth/password/change` | Change password (authenticated) |

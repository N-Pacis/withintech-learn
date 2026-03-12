# WithinTech Learn

WithinTech Learn is an LMS designed to provide Withintech camp and programs participants access to a vast array of courses that will equip them with the skills needed to thrive in this AI era.

---

## 1. Folder Structure

```
withintech-learn/
├── apps/
│   ├── api/          # Express REST API — TypeScript, Prisma, PostgreSQL
│   └── web/          # Next.js frontend
├── packages/
│   └── shared/       # Shared types across apps
├── infra/
│   ├── nginx/        # Reverse-proxy config
│   └── postgres/     # DB init SQL
├── docker-compose.yml
└── .env
```

---

## 2. Setup & Running

**Prerequisites:** Node.js 20+, pnpm 9+, PostgreSQL 16

```bash
# Install all dependencies
pnpm install

# Copy env file and fill in values
cp .env.example .env

# Apply DB migrations
cd apps/api && npx prisma migrate deploy

# Seed the first admin account
pnpm --filter @withintech-learn/api seed

# Run both apps in parallel
pnpm dev
```

API → `http://localhost:3001` · Web → `http://localhost:3000`

---

## 3. Tools Used

| Layer | Stack |
|---|---|
| Frontend | Next.js 14, TanStack Query, Tailwind CSS, Sonner |
| Backend | Express, TypeScript, Prisma ORM |
| Database | PostgreSQL |
| Storage | AWS S3 / Backblaze B2 (S3-compatible) |
| Email | Nodemailer (SMTP) |
| Monitoring | Sentry |
| Infra | Docker, Nginx, GitHub Actions |

---

## 4. API Keys Needed

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | Signing access tokens |
| `JWT_REFRESH_SECRET` | Signing refresh tokens |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | S3-compatible file storage |
| `S3_BUCKET_NAME` / `AWS_REGION` | Storage bucket |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | Email delivery |
| `EMAIL_FROM` | Sender address |
| `ADMIN_SEED_EMAIL` | Email for the initial admin account |
| `SENTRY_DSN` | Error tracking |
| `APP_URL` / `NEXT_PUBLIC_APP_URL` | App origin (used in certificates and CORS) |
| `NEXT_PUBLIC_API_URL` | API base URL consumed by the frontend |

---

## 5. Deployment

The app runs on a single VPS using Docker Compose. Nginx sits in front as a reverse proxy on ports 80/443 and routes traffic to the web (3000) and API (3001) containers. PostgreSQL runs on the host machine.

Deployments are triggered via GitHub Actions on push to `main`. The workflow SSHs into the server, pulls the latest image, and uses `docker-rollout` for zero-downtime container replacement.

```bash
# Full stack build and start
docker compose up --build -d
```

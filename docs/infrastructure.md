# Infrastructure

## Local Services

`docker-compose.yml` runs:

| Service | Role |
| --- | --- |
| `postgres` | App database. |
| `redis` | Cache and lightweight shared state. |
| `executor` | Go execution bridge. |
| `api` | Express API. |
| `web` | Next.js app. |
| `nginx` | Public reverse proxy. |
| `docs` | GitBook/HonKit docs server. |

## Ports

| Port | Service |
| --- | --- |
| `3000` | Web |
| `3001` | API |
| `4000` | Docs |
| `4001` | Executor |
| `2358` | Judge0 API |
| `80`, `443` | Nginx |

## Judge0

Judge0 is managed separately with `docker-compose.judge0.yml`.

```bash
pnpm judge0:up
pnpm judge0:down
```

Judge0 has its own PostgreSQL and Redis. It does not share the app database.

## Production

- Nginx routes `learn.withintech.org` to the web service.
- Nginx routes `api.learn.withintech.org` to the API service.
- TLS certificates are read from `/etc/letsencrypt`.
- Docker health checks gate web and API startup.
- PostgreSQL and Redis use persistent Docker volumes.

## Volumes And State

| State | Stored in |
| --- | --- |
| App relational data | PostgreSQL volume |
| Cache | Redis volume |
| Uploaded media | S3-compatible bucket |
| Judge0 data | Separate Judge0 PostgreSQL/Redis volumes |
| TLS certificates | Host `/etc/letsencrypt` |

## Environment

Compose reads the root `.env`. The required groups are database, Redis, app URLs, JWT secrets, SMTP, storage, Xentripay, executor, Judge0, and optional public branding. See [Environment](environment.md).

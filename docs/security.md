# Security

## Access Control

| Area | Control |
| --- | --- |
| Student pages | Web redirects unauthenticated users to sign in. |
| Admin pages | Web redirects non-admin users to learn area. |
| Student API | `authenticate` middleware. |
| Admin API | `authenticate` plus `isAdmin`. |
| Cookies | API uses credentialed requests and refresh flow. |

## Request Safety

- Zod validates request bodies and important query strings.
- Login, password reset, and quiz attempts have rate limits.
- File uploads use multer limits and image-specific middleware.
- Student imports accept `.xlsx`, `.xls`, and `.csv`, capped at 10MB and 500 rows.
- API uses `helmet`, CORS allowlist, JSON parsing, compression, and request logging.

## Sensitive Areas

| Area | Notes |
| --- | --- |
| JWT secrets | Must be unique per environment. |
| OTP | Stored on user with purpose and expiry. |
| Payments | Store provider reference and status, not provider secrets in code. |
| Challenge tests | Hidden tests should not appear in public responses. |
| Judge0 | Runs isolated with its own database and Redis. |
| Storage | Store object keys in DB; keep credentials in env. |

## Operational Rules

- Do not commit `.env`.
- Do not expose hidden challenge test cases.
- Do not bypass API permission checks from the web.
- Confirm `/health/full` after deployment.
- Rotate secrets if logs or screenshots leak them.

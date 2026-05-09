# API

## Shape

The API is an Express app in `apps/api`. Routes are grouped by audience:

| Group | Purpose |
| --- | --- |
| Public | Courses, challenges, and stats. |
| Auth | Login, refresh, verification, reset, signup, Google auth. |
| Student | Enrollments, course progress, quizzes, challenges, certificates. |
| Admin | Content, users, enrollments, analytics, challenges, invitations. |
| Payments | Xentripay payment creation, status, and callbacks. |

## Middleware

- `helmet`, `cors`, `cookieParser`, JSON body parsing, compression, and request logging.
- Route-specific rate limits for login, password reset, and quiz attempts.
- `authenticate` protects student and admin routes.
- `isAdmin` protects admin routes.
- Validation middleware uses Zod schemas.
- Upload middleware handles file inputs.

## Services

| Service | Responsibility |
| --- | --- |
| Course/challenge cache | Cache public and repeated reads with Redis. |
| Storage | S3-compatible uploads and signed access. |
| Email | SMTP delivery for OTP, invites, welcomes, and receipts. |
| Xentripay | Payment provider integration. |
| Scoring | User score and completion calculations. |

## Response Contract

Most API responses use:

```json
{
  "success": true,
  "message": "Done",
  "data": {}
}
```

Expected failures return the same shape with `success: false` and an HTTP status that matches the error.

## Route Protection

| Route group | Protection |
| --- | --- |
| `/public/*` | Open. |
| `/auth/login`, `/auth/signup`, reset, verify | Open with validation and rate limits where needed. |
| `/auth/profile`, change password | Authenticated. |
| `/student/*` | Authenticated student/admin session. |
| `/admin/*` | Authenticated admin only. |
| `/payments/initiate`, `/payments/status/:txId` | Authenticated. |
| `/admin/payments` | Authenticated admin only. |

## API Docs

- Swagger UI: `/docs`
- Raw OpenAPI JSON: `/docs-json`
- Liveness: `/health`
- Readiness: `/health/full`

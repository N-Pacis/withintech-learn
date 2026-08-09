# Skill: Judge0 code execution

## Where this lives
- `apps/api/src/routes/challenges.execution.ts` — API side of the execution bridge.
- `apps/executor/` — Go service that talks to Judge0.
- `docker-compose.judge0.yml` — Judge0 stack definition.

## Config
- `EXECUTOR_URL` / `EXECUTOR_SECRET` — API → executor connection. The executor should reject requests without the correct secret.
- `JUDGE0_SECRET_KEY_BASE` / `JUDGE0_AUTH_TOKEN` — required by the Judge0 image itself.

## Rules
- Only `apps/api` calls the executor. `apps/web` never talks to `apps/executor` or Judge0 directly.
- Code execution is isolated from product data — the executor should not have direct DB access; results flow back through the API.
- Hidden challenge tests must never be sent to the client or written to logs. Only visible tests and the pass/fail result are client-facing.
- Submission results map onto the existing status set: `accepted`, `incorrect answer`, `timeout`, `runtime error`, `compile error`. Don't introduce new statuses without checking `apps/api/prisma/schema.prisma` and updating it deliberately.
- Treat execution as untrusted input: enforce timeouts and resource limits on the executor side, not just the API side.

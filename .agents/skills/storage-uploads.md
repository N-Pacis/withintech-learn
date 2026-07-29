# Skill: File storage (S3 / Backblaze B2)

## Where this lives
- `apps/api/src/services/storage.service.ts` — storage client (S3-compatible: AWS S3 or Backblaze B2).
- `apps/api/src/middleware/upload.middleware.ts` — upload constraints (file type, size) enforced before a file reaches storage logic.

## Config
- `STORAGE_PROVIDER` — selects S3 vs B2 (both are S3-compatible).
- `AWS_REGION` / `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `S3_BUCKET_NAME`.

## Rules
- Uploads always pass through `upload.middleware.ts` first — don't add a new upload path that bypasses its file-type/size checks.
- Postgres stores a reference to the uploaded file (URL/key), never the file bytes and never storage credentials.
- Uploaded media (course/lesson assets, certificates, etc.) is stored outside the app containers — don't add code that persists uploads to local disk in a way that survives only inside a container.
- `apps/web` never talks to S3/B2 directly; uploads and reads of stored files go through `apps/api`.

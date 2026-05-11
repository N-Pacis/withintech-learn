-- Add CourseAccessType enum and access-related columns to Course table.
-- Idempotent: safe to run on both fresh and existing databases.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CourseAccessType') THEN
    CREATE TYPE "CourseAccessType" AS ENUM ('FREE', 'PAID', 'PAID_CERTIFICATE');
  END IF;
END $$;

ALTER TABLE "Course"
  ADD COLUMN IF NOT EXISTS "accessType"       "CourseAccessType" NOT NULL DEFAULT 'FREE',
  ADD COLUMN IF NOT EXISTS "price"            DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "certificatePrice" DOUBLE PRECISION;

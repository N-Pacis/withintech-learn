-- Add stable auto-incrementing number to Challenge
-- Uses a sequence so existing rows get sequential numbers assigned by insertion order

CREATE SEQUENCE IF NOT EXISTS "Challenge_number_seq";

ALTER TABLE "Challenge"
  ADD COLUMN IF NOT EXISTS "number" INTEGER NOT NULL DEFAULT nextval('"Challenge_number_seq"');

-- Backfill existing rows with sequential values based on createdAt order
-- so the numbers are stable and meaningful rather than arbitrary
UPDATE "Challenge"
SET "number" = sub.rn
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt" ASC) AS rn
  FROM "Challenge"
) sub
WHERE "Challenge".id = sub.id;

-- Advance the sequence past all existing values
SELECT setval('"Challenge_number_seq"', COALESCE((SELECT MAX("number") FROM "Challenge"), 0) + 1, false);

-- Set the column default to use the sequence going forward
ALTER TABLE "Challenge"
  ALTER COLUMN "number" SET DEFAULT nextval('"Challenge_number_seq"');

-- Enforce uniqueness
DROP INDEX IF EXISTS "Challenge_number_key";
CREATE UNIQUE INDEX "Challenge_number_key" ON "Challenge"("number");

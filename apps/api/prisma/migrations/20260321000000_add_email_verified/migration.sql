-- AlterTable: add emailVerified column, default false for new rows
ALTER TABLE "User" ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false;

-- Existing users are considered verified
UPDATE "User" SET "emailVerified" = true;

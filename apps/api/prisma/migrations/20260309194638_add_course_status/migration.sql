-- CreateEnum
CREATE TYPE "CourseStatus" AS ENUM ('draft', 'published', 'archived');

-- AlterTable: add status column with default draft
ALTER TABLE "Course" ADD COLUMN "status" "CourseStatus" NOT NULL DEFAULT 'draft';

-- Migrate existing published courses
UPDATE "Course" SET "status" = 'published' WHERE "isPublished" = true;

-- Drop old column
ALTER TABLE "Course" DROP COLUMN "isPublished";

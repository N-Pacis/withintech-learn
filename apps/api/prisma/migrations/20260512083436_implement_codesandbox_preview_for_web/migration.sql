/*
  Warnings:

  - The values [PAID] on the enum `CourseAccessType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
ALTER TYPE "BlockType" ADD VALUE 'playground';

-- AlterEnum
BEGIN;
CREATE TYPE "CourseAccessType_new" AS ENUM ('FREE', 'PAID_COURSE', 'PAID_CERTIFICATE');
ALTER TABLE "public"."Course" ALTER COLUMN "accessType" DROP DEFAULT;
ALTER TABLE "Course" ALTER COLUMN "accessType" TYPE "CourseAccessType_new" USING ("accessType"::text::"CourseAccessType_new");
ALTER TYPE "CourseAccessType" RENAME TO "CourseAccessType_old";
ALTER TYPE "CourseAccessType_new" RENAME TO "CourseAccessType";
DROP TYPE "public"."CourseAccessType_old";
ALTER TABLE "Course" ALTER COLUMN "accessType" SET DEFAULT 'FREE';
COMMIT;

-- AlterTable
ALTER TABLE "LessonBlock" ADD COLUMN     "playgroundData" JSONB;

-- AlterTable
ALTER TABLE "ModuleBlock" ADD COLUMN     "playgroundData" JSONB;

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "institution" TEXT;

-- CreateIndex
CREATE INDEX "User_institution_idx" ON "User"("institution");

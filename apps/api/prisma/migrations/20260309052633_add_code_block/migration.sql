-- AlterEnum
ALTER TYPE "BlockType" ADD VALUE 'code';

-- AlterTable
ALTER TABLE "ModuleBlock" ADD COLUMN     "language" TEXT;

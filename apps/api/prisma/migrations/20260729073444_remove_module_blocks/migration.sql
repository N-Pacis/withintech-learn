/*
  Warnings:

  - You are about to drop the `ModuleBlock` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ModuleBlock" DROP CONSTRAINT "ModuleBlock_moduleId_fkey";

-- DropTable
DROP TABLE "ModuleBlock";

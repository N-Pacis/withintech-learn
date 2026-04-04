-- CreateEnum
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Difficulty') THEN
        CREATE TYPE "Difficulty" AS ENUM ('easy', 'medium', 'hard');
    END IF;
END $$;

-- CreateEnum
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ChallengeStatus') THEN
        CREATE TYPE "ChallengeStatus" AS ENUM ('draft', 'published');
    END IF;
END $$;

-- CreateEnum
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SubmissionStatus') THEN
        CREATE TYPE "SubmissionStatus" AS ENUM (
            'accepted',
            'wrong_answer',
            'time_limit_exceeded',
            'runtime_error',
            'compile_error'
        );
    END IF;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "Challenge" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "status" "ChallengeStatus" NOT NULL DEFAULT 'draft',
    "starterCode" JSONB NOT NULL,
    "timeLimit" INTEGER NOT NULL DEFAULT 5,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Challenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ChallengeTestCase" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "expectedOutput" TEXT NOT NULL,
    "isHidden" BOOLEAN NOT NULL DEFAULT true,
    "orderIndex" INTEGER NOT NULL,

    CONSTRAINT "ChallengeTestCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ChallengeSubmission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" "SubmissionStatus" NOT NULL,
    "testsPassed" INTEGER NOT NULL,
    "totalTests" INTEGER NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChallengeSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ChallengeProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChallengeProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
DROP INDEX IF EXISTS "Challenge_slug_key";
CREATE UNIQUE INDEX "Challenge_slug_key" ON "Challenge"("slug");

-- CreateIndex
DROP INDEX IF EXISTS "Challenge_status_idx";
CREATE INDEX "Challenge_status_idx" ON "Challenge"("status");

-- CreateIndex
DROP INDEX IF EXISTS "ChallengeTestCase_challengeId_orderIndex_key";
CREATE UNIQUE INDEX "ChallengeTestCase_challengeId_orderIndex_key"
ON "ChallengeTestCase"("challengeId", "orderIndex");

-- CreateIndex
DROP INDEX IF EXISTS "ChallengeSubmission_userId_challengeId_idx";
CREATE INDEX "ChallengeSubmission_userId_challengeId_idx"
ON "ChallengeSubmission"("userId", "challengeId");

-- CreateIndex
DROP INDEX IF EXISTS "ChallengeProgress_userId_challengeId_key";
CREATE UNIQUE INDEX "ChallengeProgress_userId_challengeId_key"
ON "ChallengeProgress"("userId", "challengeId");

-- AddForeignKey
ALTER TABLE "Challenge" DROP CONSTRAINT IF EXISTS "Challenge_createdById_fkey";
ALTER TABLE "Challenge" ADD CONSTRAINT "Challenge_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeTestCase" DROP CONSTRAINT IF EXISTS "ChallengeTestCase_challengeId_fkey";
ALTER TABLE "ChallengeTestCase" ADD CONSTRAINT "ChallengeTestCase_challengeId_fkey"
  FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeSubmission" DROP CONSTRAINT IF EXISTS "ChallengeSubmission_userId_fkey";
ALTER TABLE "ChallengeSubmission" ADD CONSTRAINT "ChallengeSubmission_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeSubmission" DROP CONSTRAINT IF EXISTS "ChallengeSubmission_challengeId_fkey";
ALTER TABLE "ChallengeSubmission" ADD CONSTRAINT "ChallengeSubmission_challengeId_fkey"
  FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeProgress" DROP CONSTRAINT IF EXISTS "ChallengeProgress_userId_fkey";
ALTER TABLE "ChallengeProgress" ADD CONSTRAINT "ChallengeProgress_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeProgress" DROP CONSTRAINT IF EXISTS "ChallengeProgress_challengeId_fkey";
ALTER TABLE "ChallengeProgress" ADD CONSTRAINT "ChallengeProgress_challengeId_fkey"
  FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Fix B: keep the anti-cheat warnings instead of throwing them away.
-- Existing attempts get 0, which is honest — nothing was recorded for them.
ALTER TABLE "QuizAttempt" ADD COLUMN IF NOT EXISTS "warningCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "QuizAttempt" ADD COLUMN IF NOT EXISTS "timedOut" BOOLEAN NOT NULL DEFAULT false;

-- Fix C: one sitting of a quiz, with the deadline held by the server.
-- CreateTable
CREATE TABLE IF NOT EXISTS "QuizAttemptSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),
    "attemptId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizAttemptSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "QuizAttemptSession_attemptId_key"
    ON "QuizAttemptSession"("attemptId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "QuizAttemptSession_userId_quizId_idx"
    ON "QuizAttemptSession"("userId", "quizId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "QuizAttemptSession_expiresAt_idx"
    ON "QuizAttemptSession"("expiresAt");

-- AddForeignKey
ALTER TABLE "QuizAttemptSession" DROP CONSTRAINT IF EXISTS "QuizAttemptSession_userId_fkey";
ALTER TABLE "QuizAttemptSession" ADD CONSTRAINT "QuizAttemptSession_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAttemptSession" DROP CONSTRAINT IF EXISTS "QuizAttemptSession_quizId_fkey";
ALTER TABLE "QuizAttemptSession" ADD CONSTRAINT "QuizAttemptSession_quizId_fkey"
    FOREIGN KEY ("quizId") REFERENCES "Quiz"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAttemptSession" DROP CONSTRAINT IF EXISTS "QuizAttemptSession_attemptId_fkey";
ALTER TABLE "QuizAttemptSession" ADD CONSTRAINT "QuizAttemptSession_attemptId_fkey"
    FOREIGN KEY ("attemptId") REFERENCES "QuizAttempt"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

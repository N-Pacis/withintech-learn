-- CreateTable
CREATE TABLE IF NOT EXISTS "QuizAttemptAnswer" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizAttemptAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "QuizAttemptAnswer_attemptId_idx"
    ON "QuizAttemptAnswer"("attemptId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "QuizAttemptAnswer_attemptId_questionId_optionId_key"
    ON "QuizAttemptAnswer"("attemptId", "questionId", "optionId");

-- AddForeignKey
ALTER TABLE "QuizAttemptAnswer" DROP CONSTRAINT IF EXISTS "QuizAttemptAnswer_attemptId_fkey";
ALTER TABLE "QuizAttemptAnswer" ADD CONSTRAINT "QuizAttemptAnswer_attemptId_fkey"
    FOREIGN KEY ("attemptId") REFERENCES "QuizAttempt"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

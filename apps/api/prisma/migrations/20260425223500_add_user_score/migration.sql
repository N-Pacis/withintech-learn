-- Add score column for challenge leaderboard sorting
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'User'
          AND column_name = 'score'
    ) THEN
        ALTER TABLE "User" ADD COLUMN "score" DOUBLE PRECISION NOT NULL DEFAULT 0;
    END IF;
END $$;

-- Keep the DB aligned with @@index([score]) in schema.prisma
DROP INDEX IF EXISTS "User_score_idx";
CREATE INDEX "User_score_idx" ON "User"("score");

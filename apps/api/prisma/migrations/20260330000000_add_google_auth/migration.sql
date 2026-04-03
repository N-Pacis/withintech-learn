-- Add provider column (email or google)
ALTER TABLE "User" ADD COLUMN "provider" TEXT NOT NULL DEFAULT 'email';

-- Make passwordHash nullable (Google users have no password)
ALTER TABLE "User" ALTER COLUMN "passwordHash" DROP NOT NULL;

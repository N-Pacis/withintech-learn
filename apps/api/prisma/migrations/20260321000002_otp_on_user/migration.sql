-- Add OTP fields directly to User
ALTER TABLE "User" ADD COLUMN "otpCode"      TEXT;
ALTER TABLE "User" ADD COLUMN "otpPurpose"   TEXT;
ALTER TABLE "User" ADD COLUMN "otpExpiresAt" TIMESTAMP(3);

-- Drop the OtpCode table (no longer needed)
DROP TABLE IF EXISTS "OtpCode";

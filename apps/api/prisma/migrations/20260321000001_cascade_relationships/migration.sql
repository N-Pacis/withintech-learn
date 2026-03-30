-- Drop existing foreign key constraints and re-add with CASCADE / SET NULL

-- OtpCode.userId → User (Cascade)
ALTER TABLE "OtpCode" DROP CONSTRAINT "OtpCode_userId_fkey";
ALTER TABLE "OtpCode" ADD CONSTRAINT "OtpCode_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Course.createdById → User (Cascade)
ALTER TABLE "Course" DROP CONSTRAINT "Course_createdById_fkey";
ALTER TABLE "Course" ADD CONSTRAINT "Course_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- StudentCourse.studentId → User (Cascade)
ALTER TABLE "StudentCourse" DROP CONSTRAINT "StudentCourse_studentId_fkey";
ALTER TABLE "StudentCourse" ADD CONSTRAINT "StudentCourse_studentId_fkey"
  FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ModuleProgress.userId → User (Cascade)
ALTER TABLE "ModuleProgress" DROP CONSTRAINT "ModuleProgress_userId_fkey";
ALTER TABLE "ModuleProgress" ADD CONSTRAINT "ModuleProgress_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- QuizAttempt.userId → User (Cascade)
ALTER TABLE "QuizAttempt" DROP CONSTRAINT "QuizAttempt_userId_fkey";
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Certificate.userId → User (Cascade)
ALTER TABLE "Certificate" DROP CONSTRAINT "Certificate_userId_fkey";
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- User.createdById → User self-reference (SetNull)
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_createdById_fkey";
ALTER TABLE "User" ADD CONSTRAINT "User_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

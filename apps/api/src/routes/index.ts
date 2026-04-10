import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { isAdmin } from "../middleware/isAdmin.middleware";
import {
  loginLimiter,
  passwordResetRequestLimiter,
  passwordResetConfirmLimiter,
  quizAttemptLimiter,
} from "../middleware/rateLimiter.middleware";
import authRouter from "./auth/auth.routes";
import adminCoursesRouter from "./admin/courses.routes";
import adminModulesRouter from "./admin/modules.routes";
import adminLessonsRouter from "./admin/lessons.routes";
import adminQuizzesRouter from "./admin/quizzes.routes";
import adminUsersRouter from "./admin/users.routes";
import adminEnrollmentsRouter from "./admin/enrollments.routes";
import adminAnalyticsRouter from "./admin/analytics.routes";
import adminChallengesRouter from "./admin/challenges.routes";
import studentCoursesRouter from "./student/courses.routes";
import studentQuizRouter from "./student/quiz.routes";
import studentChallengesRouter from "./student/challenges.routes";
import certificatesRouter from "./student/certificates.routes";
import publicCoursesRouter from "./public/courses.routes";

const router = Router();

// ── Route-specific limiters ───────────────────────────────────────────────────
router.post("/auth/login", loginLimiter);
router.post("/auth/password-reset/request", passwordResetRequestLimiter);
router.post("/auth/password-reset/confirm", passwordResetConfirmLimiter);
router.post(
  "/student/quizzes/:quizId/attempt",
  authenticate,
  quizAttemptLimiter,
);

// ── Public routes ─────────────────────────────────────────────────────────────
router.use(publicCoursesRouter);
router.use(authRouter);

// ── Admin routes ──────────────────────────────────────────────────────────────
router.use("/admin", authenticate, isAdmin);
router.use(adminCoursesRouter);
router.use(adminModulesRouter);
router.use(adminLessonsRouter);
router.use(adminQuizzesRouter);
router.use(adminUsersRouter);
router.use(adminEnrollmentsRouter);
router.use(adminAnalyticsRouter);
router.use(adminChallengesRouter);

// ── Student routes ────────────────────────────────────────────────────────────
router.use("/student", authenticate);
router.use(studentCoursesRouter);
router.use(studentQuizRouter);
router.use(studentChallengesRouter);

// ── Certificate routes ────────────────────────────────────────────────────────
router.use(certificatesRouter);

export default router;

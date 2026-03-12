import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/isAdmin.middleware';
import authRouter from './auth/auth.routes';
import adminCoursesRouter from './admin/courses.routes';
import adminModulesRouter from './admin/modules.routes';
import adminQuizzesRouter from './admin/quizzes.routes';
import adminUsersRouter from './admin/users.routes';
import studentCoursesRouter from './student/courses.routes';
import studentQuizRouter from './student/quiz.routes';
import publicCoursesRouter from './public/courses.routes';

const router = Router();

router.use(publicCoursesRouter);
router.use(authRouter);

// All /admin/* routes require a valid JWT and admin role
router.use('/admin', authenticate, isAdmin);
router.use(adminCoursesRouter);
router.use(adminModulesRouter);
router.use(adminQuizzesRouter);
router.use(adminUsersRouter);

// All /student/* routes require a valid JWT (any role)
router.use('/student', authenticate);
router.use(studentCoursesRouter);
router.use(studentQuizRouter);

export default router;

import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/isAdmin.middleware';
import authRouter from './auth/auth.routes';
import adminCoursesRouter from './admin/courses.routes';
import adminModulesRouter from './admin/modules.routes';
import adminQuizzesRouter from './admin/quizzes.routes';

const router = Router();

router.use(authRouter);

router.use('/admin', authenticate, isAdmin);
router.use(adminCoursesRouter);
router.use(adminModulesRouter);
router.use(adminQuizzesRouter);

export default router;

import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import { uploadImage } from '../../middleware/upload.middleware';
import { addLessonSchema, updateLessonSchema, reorderLessonsSchema, addLessonBlockSchema, updateLessonBlockSchema } from './lessons.schemas';
import * as ctrl from '../../controllers/lessons.controller';

const router = Router();

// ─── Lesson CRUD ──────────────────────────────────────────────────────────────

router.post('/admin/modules/:moduleId/lessons', validate(addLessonSchema), ctrl.postAddLesson);
router.get('/admin/modules/:moduleId/lessons', ctrl.getListLessons);
router.post('/admin/modules/:moduleId/lessons/reorder', validate(reorderLessonsSchema), ctrl.postReorderLessons);
router.get('/admin/lessons/:id', ctrl.getOneLesson);
router.patch('/admin/lessons/:id', validate(updateLessonSchema), ctrl.patchUpdateLesson);
router.delete('/admin/lessons/:id', ctrl.deleteLesson);

// ─── Lesson Block CRUD ────────────────────────────────────────────────────────

router.post('/admin/lessons/:lessonId/blocks', validate(addLessonBlockSchema), ctrl.postAddLessonBlock);
router.get('/admin/lessons/:lessonId/blocks', ctrl.getListLessonBlocks);
router.post('/admin/lessons/:lessonId/blocks/reorder', validate(reorderLessonsSchema), ctrl.postReorderLessonBlocks);
router.patch('/admin/lessons/:lessonId/blocks/:id', validate(updateLessonBlockSchema), ctrl.patchUpdateLessonBlock);
router.delete('/admin/lessons/:lessonId/blocks/:id', ctrl.deleteLessonBlock);
router.post('/admin/lessons/:lessonId/blocks/:blockId/upload-image', uploadImage, ctrl.postUploadLessonBlockImage);

export default router;

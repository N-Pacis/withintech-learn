import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import { uploadImage } from '../../middleware/upload.middleware';
import { createCourseSchema, updateCourseSchema } from './courses.schemas';
import * as ctrl from '../../controllers/courses.controller';

const router = Router();

router.post('/admin/courses', validate(createCourseSchema), ctrl.postCreateCourse);
router.get('/admin/courses', ctrl.getListCourses);
router.get('/admin/courses/:id', ctrl.getOneCourse);
router.patch('/admin/courses/:id', validate(updateCourseSchema), ctrl.patchUpdateCourse);
router.delete('/admin/courses/:id', ctrl.deleteCourse);
router.patch('/admin/courses/:id/publish', ctrl.patchPublishCourse);
router.patch('/admin/courses/:id/archive', ctrl.patchArchiveCourse);
router.post('/admin/courses/:id/upload-thumbnail', uploadImage, ctrl.postUploadThumbnail);

export default router;

import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import { addModuleSchema, updateModuleSchema, reorderSchema } from './modules.schemas';
import * as ctrl from '../../controllers/modules.controller';

const router = Router();

router.post('/admin/courses/:courseId/modules', validate(addModuleSchema), ctrl.postAddModule);
router.get('/admin/courses/:courseId/modules', ctrl.getListModules);
router.post('/admin/courses/:courseId/modules/reorder', validate(reorderSchema), ctrl.postReorderModules);
router.get('/admin/modules/:id', ctrl.getOneModule);
router.patch('/admin/modules/:id', validate(updateModuleSchema), ctrl.patchUpdateModule);
router.delete('/admin/modules/:id', ctrl.deleteModule);

export default router;

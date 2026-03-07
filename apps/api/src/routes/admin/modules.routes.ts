import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import { uploadImage } from '../../middleware/upload.middleware';
import { addModuleSchema, updateModuleSchema, reorderSchema, addBlockSchema, updateBlockSchema } from './modules.schemas';
import * as ctrl from '../../controllers/modules.controller';

const router = Router();

router.post('/admin/courses/:courseId/modules', validate(addModuleSchema), ctrl.postAddModule);
router.get('/admin/courses/:courseId/modules', ctrl.getListModules);
router.post('/admin/courses/:courseId/modules/reorder', validate(reorderSchema), ctrl.postReorderModules);
router.get('/admin/modules/:id', ctrl.getOneModule);
router.patch('/admin/modules/:id', validate(updateModuleSchema), ctrl.patchUpdateModule);
router.delete('/admin/modules/:id', ctrl.deleteModule);

router.post('/admin/modules/:moduleId/blocks', validate(addBlockSchema), ctrl.postAddBlock);
router.get('/admin/modules/:moduleId/blocks', ctrl.getListBlocks);
router.post('/admin/modules/:moduleId/blocks/reorder', validate(reorderSchema), ctrl.postReorderBlocks);
router.patch('/admin/modules/:moduleId/blocks/:id', validate(updateBlockSchema), ctrl.patchUpdateBlock);
router.delete('/admin/modules/:moduleId/blocks/:id', ctrl.deleteBlock);
router.post('/admin/modules/:moduleId/blocks/:blockId/upload-image', uploadImage, ctrl.postUploadBlockImage);

export default router;

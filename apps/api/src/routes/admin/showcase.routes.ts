import { Router } from 'express';
import {
  getAdminListShowcase,
  getAdminShowcaseDetail,
  patchApproveShowcase,
  patchRejectShowcase,
  patchFeatureShowcase,
  patchArchiveShowcase,
  deleteAdminShowcase,
} from '../../controllers/showcase.controller';

const router = Router();

router.get('/admin/showcase',                  getAdminListShowcase);
router.get('/admin/showcase/:id',              getAdminShowcaseDetail);
router.patch('/admin/showcase/:id/approve',    patchApproveShowcase);
router.patch('/admin/showcase/:id/reject',     patchRejectShowcase);
router.patch('/admin/showcase/:id/feature',    patchFeatureShowcase);
router.patch('/admin/showcase/:id/archive',    patchArchiveShowcase);
router.delete('/admin/showcase/:id',           deleteAdminShowcase);

export default router;

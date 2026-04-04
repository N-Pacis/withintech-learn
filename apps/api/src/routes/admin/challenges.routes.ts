import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import {
  createChallengeSchema,
  updateChallengeSchema,
  listChallengesSchema,
  createTestCaseSchema,
  updateTestCaseSchema,
  runChallengeSchema,
} from './challenges.schemas';
import * as ctrl from '../../controllers/adminChallenges.controller';

const router = Router();

// ── Challenges ────────────────────────────────────────────────────────────────
router.post('/admin/challenges',      validate(createChallengeSchema), ctrl.postCreateChallenge);
router.get('/admin/challenges',       ctrl.getListChallenges);
router.get('/admin/challenges/:id',   ctrl.getOneChallenge);
router.patch('/admin/challenges/:id', validate(updateChallengeSchema), ctrl.patchUpdateChallenge);
router.delete('/admin/challenges/:id', ctrl.deleteChallenge);
router.patch('/admin/challenges/:id/publish',   ctrl.patchPublishChallenge);
router.patch('/admin/challenges/:id/unpublish', ctrl.patchUnpublishChallenge);
router.post('/admin/challenges/:id/run', validate(runChallengeSchema), ctrl.postRunChallenge);

// ── Test Cases ────────────────────────────────────────────────────────────────
router.post('/admin/challenges/:id/test-cases',   validate(createTestCaseSchema), ctrl.postAddTestCase);
router.patch('/admin/test-cases/:testCaseId',     validate(updateTestCaseSchema), ctrl.patchUpdateTestCase);
router.delete('/admin/test-cases/:testCaseId',    ctrl.deleteTestCase);

export default router;

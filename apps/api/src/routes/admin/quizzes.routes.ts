import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import {
  createQuizSchema, updateQuizSchema,
  addQuestionSchema, updateQuestionSchema, reorderQuestionsSchema,
  addOptionSchema, updateOptionSchema,
} from './quizzes.schemas';
import * as ctrl from '../../controllers/quizzes.controller';

const router = Router();

router.post('/admin/modules/:moduleId/quiz', validate(createQuizSchema), ctrl.postCreateModuleQuiz);
router.post('/admin/courses/:courseId/quiz', validate(createQuizSchema), ctrl.postCreateCourseQuiz);
router.get('/admin/quizzes/:id', ctrl.getQuiz);
router.patch('/admin/quizzes/:id', validate(updateQuizSchema), ctrl.patchUpdateQuiz);
router.delete('/admin/quizzes/:id', ctrl.deleteQuiz);

router.post('/admin/quizzes/:quizId/questions', validate(addQuestionSchema), ctrl.postAddQuestion);
router.post('/admin/quizzes/:quizId/questions/reorder', validate(reorderQuestionsSchema), ctrl.postReorderQuestions);
router.patch('/admin/questions/:id', validate(updateQuestionSchema), ctrl.patchUpdateQuestion);
router.delete('/admin/questions/:id', ctrl.deleteQuestion);

router.post('/admin/questions/:questionId/options', validate(addOptionSchema), ctrl.postAddOption);
router.patch('/admin/options/:id', validate(updateOptionSchema), ctrl.patchUpdateOption);
router.delete('/admin/options/:id', ctrl.deleteOption);

export default router;

import { Router, Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import { badRequest } from "../../utils/errors";
import {
  listPublishedCourses,
  getPublishedCourseBySlug,
  getStudentModule,
  completeModule,
  completeCourse,
  enrollInCourse,
  getStudentStats,
  getStudentLesson,
  completeLesson,
} from "./courses.service";

const router = Router();

const listSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  filter: z.enum(["all", "enrolled", "not_enrolled", "passed"]).default("all"),
});

router.get(
  "/student/courses",
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = listSchema.safeParse(req.query);
    if (!parsed.success)
      throw badRequest(parsed.error.errors[0]?.message ?? "Validation error");
    const result = await listPublishedCourses({
      userId: req.user!.userId,
      ...parsed.data,
    });
    sendSuccess(res, result);
  }),
);

router.get(
  "/student/courses/:slug",
  asyncHandler(async (req: Request, res: Response) => {
    const result = await getPublishedCourseBySlug(
      req.params.slug,
      req.user!.userId,
    );
    sendSuccess(res, result);
  }),
);

router.get(
  "/student/courses/:slug/modules/:moduleId",
  asyncHandler(async (req: Request, res: Response) => {
    const result = await getStudentModule(
      req.params.slug,
      req.params.moduleId,
      req.user!.userId,
    );
    sendSuccess(res, result);
  }),
);

router.get(
  "/student/courses/:slug/modules/:moduleId/lessons/:lessonId",
  asyncHandler(async (req: Request, res: Response) => {
    const result = await getStudentLesson(
      req.params.slug,
      req.params.moduleId,
      req.params.lessonId,
      req.user!.userId,
    );
    sendSuccess(res, result);
  }),
);

router.post(
  "/student/courses/:slug/modules/:moduleId/lessons/:lessonId/progress",
  asyncHandler(async (req: Request, res: Response) => {
    const result = await completeLesson(
      req.params.slug,
      req.params.moduleId,
      req.params.lessonId,
      req.user!.userId,
    );
    sendSuccess(res, result, "Lesson completed", 201);
  }),
);

router.post(
  "/student/courses/:slug/modules/:moduleId/progress",
  asyncHandler(async (req: Request, res: Response) => {
    const result = await completeModule(
      req.params.slug,
      req.params.moduleId,
      req.user!.userId,
    );
    sendSuccess(res, result, "Module completed", 201);
  }),
);

router.post(
  "/student/courses/:slug/complete",
  asyncHandler(async (req: Request, res: Response) => {
    const result = await completeCourse(req.params.slug, req.user!.userId);
    sendSuccess(res, result, "Course completed");
  }),
);

router.post(
  "/student/courses/:id/enroll",
  asyncHandler(async (req: Request, res: Response) => {
    const result = await enrollInCourse(req.user!.userId, req.params.id);
    sendSuccess(res, result, "Enrolled successfully", 201);
  }),
);

router.get(
  "/student/stats",
  asyncHandler(async (req: Request, res: Response) => {
    const result = await getStudentStats(req.user!.userId);
    sendSuccess(res, result);
  }),
);

export default router;

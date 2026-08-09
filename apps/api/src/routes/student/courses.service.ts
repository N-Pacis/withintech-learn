import { prisma } from "../../db/prisma";
import { getSignedUrl } from "../../services/storage.service";
import { notFound, badRequest, forbidden } from "../../utils/errors";
import { upsertCertificate } from "./certificates.service";
import {
  getCachedCourse,
  getCachedModule,
  buildAndCacheCourse,
} from "../../services/course-cache.service";
import { recalculateUserScore } from "../../utils/scoring";

const withThumbnailUrl = async <T extends { thumbnailKey: string | null }>(
  course: T,
) => {
  if (!course.thumbnailKey) return { ...course, thumbnailUrl: null };
  return { ...course, thumbnailUrl: await getSignedUrl(course.thumbnailKey) };
};

export type EnrollmentFilter = "all" | "enrolled" | "not_enrolled" | "passed";

export const listPublishedCourses = async ({
  userId,
  page,
  limit,
  search,
  filter,
}: {
  userId: string;
  page: number;
  limit: number;
  search?: string;
  filter: EnrollmentFilter;
}) => {
  const searchWhere = search
    ? {
        OR: [
          { title: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  let enrolledCourseIds: string[] | null = null;
  if (filter !== "all") {
    if (filter === "not_enrolled") {
      const enrollments = await prisma.studentCourse.findMany({
        where: { studentId: userId },
        select: { courseId: true },
      });
      enrolledCourseIds = enrollments.map((e) => e.courseId);
    } else {
      const status = filter === "passed" ? "PASSED" : "ENROLLED";
      const enrollments = await prisma.studentCourse.findMany({
        where: { studentId: userId, status },
        select: { courseId: true },
      });
      enrolledCourseIds = enrollments.map((e) => e.courseId);
    }
  }

  const filterWhere =
    filter === "not_enrolled" && enrolledCourseIds
      ? { id: { notIn: enrolledCourseIds } }
      : enrolledCourseIds
        ? { id: { in: enrolledCourseIds } }
        : {};

  const where = {
    status: "published" as const,
    ...searchWhere,
    ...filterWhere,
  };

  const [total, courses] = await Promise.all([
    prisma.course.count({ where }),
    prisma.course.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        thumbnailKey: true,
        status: true,
        accessType: true,
        price: true,
        certificatePrice: true,
        _count: { select: { modules: true } },
        enrollments: {
          where: { studentId: userId },
          select: { status: true, enrolledAt: true },
        },
      },
    }),
  ]);

  // Batch-fetch all course IDs where this user has a certificate row
  const certCourseIds = new Set(
    (
      await prisma.certificate.findMany({
        where: { userId },
        select: { courseId: true },
      })
    ).map((c) => c.courseId),
  );

  const coursesWithUrls = await Promise.all(
    courses.map(async (c) => {
      const enrollment = c.enrollments[0] ?? null;
      const { thumbnailKey, _count, enrollments: _, ...rest } = c;
      return {
        ...rest,
        ...(await withThumbnailUrl({ thumbnailKey })),
        module_count: _count.modules,
        enrollment_status: enrollment?.status ?? null,
        enrolled_at: enrollment?.enrolledAt ?? null,
        has_certificate: certCourseIds.has(c.id),
      };
    }),
  );

  return { total, page, limit, courses: coursesWithUrls };
};

// Returns course info + module list with completion status
export const getCoursePreview = async (slug: string) => {
  let cached = await getCachedCourse(slug);
  if (!cached) {
    const dbCourse = await prisma.course.findFirst({
      where: { slug, status: "published" },
      select: { id: true },
    });
    if (!dbCourse) throw notFound("Course not found");
    await buildAndCacheCourse(dbCourse.id);
    cached = await getCachedCourse(slug);
  }
  if (!cached) throw notFound("Course not found");

  return {
    id: cached.id,
    title: cached.title,
    slug: cached.slug,
    description: cached.description,
    accessType: cached.accessType,
    price: cached.price,
    certificatePrice: cached.certificatePrice,
    ...(await withThumbnailUrl({ thumbnailKey: cached.thumbnailKey })),
  };
};

export const getPublishedCourseBySlug = async (
  slug: string,
  userId: string,
) => {
  // Try cache first; fall back to DB and populate cache on miss
  let cached = await getCachedCourse(slug);
  if (!cached) {
    const dbCourse = await prisma.course.findFirst({
      where: { slug, status: "published" },
      select: { id: true },
    });
    if (!dbCourse) throw notFound("Course not found");
    await buildAndCacheCourse(dbCourse.id);
    cached = await getCachedCourse(slug);
  }
  if (!cached) throw notFound("Course not found");

  const enrollment = await prisma.studentCourse.findUnique({
    where: { studentId_courseId: { studentId: userId, courseId: cached.id } },
    select: { status: true, enrolledAt: true },
  });
  if (!enrollment)
    throw forbidden("You must be enrolled to access this course");

  const [completedSet, lastCourseQuizAttempt, certRow] = await Promise.all([
    prisma.moduleProgress
      .findMany({
        where: { userId, moduleId: { in: cached.moduleIds } },
        select: { moduleId: true },
      })
      .then((rows) => new Set(rows.map((r) => r.moduleId))),
    cached.quiz
      ? prisma.quizAttempt.findFirst({
          where: { userId, quizId: cached.quiz.id },
          orderBy: { createdAt: "desc" },
          select: { id: true, score: true, status: true, createdAt: true },
        })
      : null,
    prisma.certificate.findUnique({
      where: { userId_courseId: { userId, courseId: cached.id } },
      select: { id: true },
    }),
  ]);

  // Modules in cache are ordered; fetch titles from cache via module keys
  const firstIncompleteIndex = cached.moduleIds.findIndex(
    (id) => !completedSet.has(id),
  );
  const reachableUpTo =
    firstIncompleteIndex === -1
      ? cached.moduleIds.length
      : firstIncompleteIndex;

  const modules = await Promise.all(
    cached.moduleIds.map(async (moduleId, i) => {
      const mod = await getCachedModule(moduleId);
      return {
        id: moduleId,
        title: mod?.title ?? "",
        orderIndex: mod?.orderIndex ?? 0,
        isCompleted: completedSet.has(moduleId),
        isLocked: i > reachableUpTo,
        lessonCount: mod?.lessons?.length ?? 0,
        hasLessons: (mod?.lessons?.length ?? 0) > 0,
      };
    }),
  );

  return {
    id: cached.id,
    title: cached.title,
    slug: cached.slug,
    description: cached.description,
    status: "published",
    accessType: cached.accessType,
    price: cached.price,
    certificatePrice: cached.certificatePrice,
    ...(await withThumbnailUrl({ thumbnailKey: cached.thumbnailKey })),
    enrollment_status: enrollment.status,
    enrolled_at: enrollment.enrolledAt,
    has_certificate: !!certRow,
    modules,
    quiz: cached.quiz ?? null,
    lastCourseQuizAttempt: lastCourseQuizAttempt ?? null,
  };
};

export const completeCourse = async (slug: string, userId: string) => {
  const course = await prisma.course.findFirst({
    where: { slug, status: "published" },
    include: { quiz: { select: { id: true } } },
  });
  if (!course) throw notFound("Course not found");

  const enrollment = await prisma.studentCourse.findUnique({
    where: { studentId_courseId: { studentId: userId, courseId: course.id } },
  });
  if (!enrollment) throw forbidden("You must be enrolled");
  if (enrollment.status === "PASSED")
    throw badRequest("Course already completed");

  if (course.quiz) {
    const lastAttempt = await prisma.quizAttempt.findFirst({
      where: { userId, quizId: course.quiz.id },
      orderBy: { createdAt: "desc" },
      select: { status: true },
    });
    if (!lastAttempt || lastAttempt.status !== "pass") {
      throw badRequest(
        "You must pass the course quiz before completing this course",
      );
    }
  }

  // For PAID_CERTIFICATE courses, certificate is issued only after certificate payment
  // completeCourse marks the enrollment as PASSED but skips certificate creation
  const shouldIssueCertificate = course.accessType !== "PAID_CERTIFICATE";

  if (!shouldIssueCertificate) {
    // Verify a paid certificate payment exists before marking PASSED
    const certPayment = await prisma.payment.findFirst({
      where: { userId, courseId: course.id, type: "CERTIFICATE", status: "PAID" },
    });
    if (!certPayment) {
      throw forbidden(
        "A certificate payment is required. Please complete the certificate payment to receive your certificate.",
      );
    }
  }

  const ops: Promise<unknown>[] = [
    prisma.studentCourse.update({
      where: { studentId_courseId: { studentId: userId, courseId: course.id } },
      data: { status: "PASSED" },
      select: { id: true, status: true },
    }),
  ];
  if (shouldIssueCertificate) ops.push(upsertCertificate(userId, course.id));

  const [updated] = await Promise.all(ops);
  await recalculateUserScore(userId);
  return updated;
};

// Returns a single module with its lesson list + quiz (no isCorrect) + last attempt
export const getStudentModule = async (
  slug: string,
  moduleId: string,
  userId: string,
) => {
  // Verify enrollment via course cache (or DB fallback)
  let cachedCourse = await getCachedCourse(slug);
  if (!cachedCourse) {
    const dbCourse = await prisma.course.findFirst({
      where: { slug, status: "published" },
      select: { id: true },
    });
    if (!dbCourse) throw notFound("Course not found");
    await buildAndCacheCourse(dbCourse.id);
    cachedCourse = await getCachedCourse(slug);
  }
  if (!cachedCourse) throw notFound("Course not found");

  const enrollment = await prisma.studentCourse.findUnique({
    where: {
      studentId_courseId: { studentId: userId, courseId: cachedCourse.id },
    },
  });
  if (!enrollment)
    throw forbidden("You must be enrolled to access this course");

  // Try module cache; fall back to DB
  let cachedMod = await getCachedModule(moduleId);
  if (!cachedMod) {
    await buildAndCacheCourse(cachedCourse.id);
    cachedMod = await getCachedModule(moduleId);
  }
  if (!cachedMod || !cachedCourse.moduleIds.includes(moduleId))
    throw notFound("Module not found");

  // Enforce sequential progression: all previous modules must be completed
  const moduleIndex = cachedCourse.moduleIds.indexOf(moduleId);
  if (moduleIndex > 0) {
    const previousIds = cachedCourse.moduleIds.slice(0, moduleIndex);
    const completedCount = await prisma.moduleProgress.count({
      where: { userId, moduleId: { in: previousIds } },
    });
    if (completedCount < previousIds.length) {
      throw forbidden(
        "You must complete previous modules before accessing this one",
      );
    }
  }

  const lastAttempt = cachedMod.quiz
    ? await prisma.quizAttempt.findFirst({
        where: { userId, quizId: cachedMod.quiz!.id },
        orderBy: { createdAt: "desc" },
        select: { id: true, score: true, status: true, createdAt: true },
      })
    : null;

  // Build lesson list with completion / lock state (empty for legacy modules)
  // Guard: modules cached before the lessons feature was deployed won't have the field
  const cachedLessons = cachedMod.lessons ?? [];

  let lessons: {
    id: string;
    title: string;
    orderIndex: number;
    isCompleted: boolean;
    isLocked: boolean;
  }[] = [];

  if (cachedLessons.length > 0) {
    const lessonIds = cachedLessons.map((l) => l.id);
    const completedLessonSet = new Set(
      (
        await prisma.lessonProgress.findMany({
          where: { userId, lessonId: { in: lessonIds } },
          select: { lessonId: true },
        })
      ).map((r) => r.lessonId),
    );
    const firstIncompleteLessonIdx = cachedLessons.findIndex(
      (l) => !completedLessonSet.has(l.id),
    );
    const lessonReachableUpTo =
      firstIncompleteLessonIdx === -1
        ? cachedLessons.length
        : firstIncompleteLessonIdx;

    lessons = cachedLessons.map((l, i) => ({
      id: l.id,
      title: l.title,
      orderIndex: l.orderIndex,
      isCompleted: completedLessonSet.has(l.id),
      isLocked: i > lessonReachableUpTo,
    }));
  }

  return { ...cachedMod, lessons, lastAttempt: lastAttempt ?? null };
};

export const completeModule = async (
  slug: string,
  moduleId: string,
  userId: string,
) => {
  const course = await prisma.course.findFirst({
    where: { slug, status: "published" },
    select: { id: true },
  });
  if (!course) throw notFound("Course not found");

  const enrollment = await prisma.studentCourse.findUnique({
    where: { studentId_courseId: { studentId: userId, courseId: course.id } },
  });
  if (!enrollment) throw forbidden("You must be enrolled");

  // Enforce sequential progression
  const courseModules = await prisma.module.findMany({
    where: { courseId: course.id },
    orderBy: { orderIndex: "asc" },
    select: { id: true },
  });
  const moduleIndex = courseModules.findIndex((m) => m.id === moduleId);
  if (moduleIndex === -1) throw notFound("Module not found");
  if (moduleIndex > 0) {
    const previousIds = courseModules.slice(0, moduleIndex).map((m) => m.id);
    const completedCount = await prisma.moduleProgress.count({
      where: { userId, moduleId: { in: previousIds } },
    });
    if (completedCount < previousIds.length) {
      throw forbidden("You must complete previous modules first");
    }
  }

  const mod = await prisma.module.findFirst({
    where: { id: moduleId, courseId: course.id },
    include: { quiz: { select: { id: true } } },
  });
  if (!mod) throw notFound("Module not found");

  if (mod.quiz) {
    const lastAttempt = await prisma.quizAttempt.findFirst({
      where: { userId, quizId: mod.quiz.id },
      orderBy: { createdAt: "desc" },
      select: { status: true },
    });
    if (!lastAttempt || lastAttempt.status !== "pass") {
      throw badRequest("You must pass the quiz before completing this module");
    }
  }

  const progress = await prisma.moduleProgress.upsert({
    where: { userId_moduleId: { userId, moduleId } },
    create: { userId, moduleId },
    update: {},
    select: { id: true, completedAt: true },
  });

  // Auto-complete course if this was the last module and the course has no final quiz
  const courseWithQuiz = await prisma.course.findUnique({
    where: { id: course.id },
    select: { accessType: true, quiz: { select: { id: true } } },
  });

  // Auto-complete course when all modules are done and there is no final quiz.
  // For PAID_CERTIFICATE: mark PASSED (content done) but skip certificate —
  // the certificate is created by the payment flow after the student pays.
  if (!courseWithQuiz?.quiz) {
    const completedCount = await prisma.moduleProgress.count({
      where: { userId, moduleId: { in: courseModules.map((m) => m.id) } },
    });
    if (completedCount === courseModules.length) {
      const ops: Promise<unknown>[] = [
        prisma.studentCourse.update({
          where: {
            studentId_courseId: { studentId: userId, courseId: course.id },
          },
          data: { status: "PASSED" },
        }),
      ];
      if (courseWithQuiz?.accessType !== "PAID_CERTIFICATE") {
        ops.push(upsertCertificate(userId, course.id));
      }
      await Promise.all(ops);
    }
  }

  await recalculateUserScore(userId);
  return progress;
};

// Returns a single lesson with blocks + quiz (no isCorrect) + last attempt
export const getStudentLesson = async (
  slug: string,
  moduleId: string,
  lessonId: string,
  userId: string,
) => {
  // Verify enrollment via course cache
  let cachedCourse = await getCachedCourse(slug);
  if (!cachedCourse) {
    const dbCourse = await prisma.course.findFirst({
      where: { slug, status: "published" },
      select: { id: true },
    });
    if (!dbCourse) throw notFound("Course not found");
    await buildAndCacheCourse(dbCourse.id);
    cachedCourse = await getCachedCourse(slug);
  }
  if (!cachedCourse) throw notFound("Course not found");

  const enrollment = await prisma.studentCourse.findUnique({
    where: {
      studentId_courseId: { studentId: userId, courseId: cachedCourse.id },
    },
  });
  if (!enrollment)
    throw forbidden("You must be enrolled to access this course");

  // Verify module exists and is accessible
  if (!cachedCourse.moduleIds.includes(moduleId))
    throw notFound("Module not found");

  const moduleIndex = cachedCourse.moduleIds.indexOf(moduleId);
  if (moduleIndex > 0) {
    const previousIds = cachedCourse.moduleIds.slice(0, moduleIndex);
    const completedCount = await prisma.moduleProgress.count({
      where: { userId, moduleId: { in: previousIds } },
    });
    if (completedCount < previousIds.length) {
      throw forbidden(
        "You must complete previous modules before accessing this one",
      );
    }
  }

  let cachedMod = await getCachedModule(moduleId);
  if (!cachedMod) {
    await buildAndCacheCourse(cachedCourse.id);
    cachedMod = await getCachedModule(moduleId);
  }
  if (!cachedMod) throw notFound("Module not found");

  // Guard: modules cached before the lessons feature was deployed won't have the field
  const modLessons = cachedMod.lessons ?? [];

  const cachedLesson = modLessons.find((l) => l.id === lessonId);
  if (!cachedLesson) throw notFound("Lesson not found");

  // Enforce sequential lesson progression
  const lessonIndex = modLessons.findIndex((l) => l.id === lessonId);
  if (lessonIndex > 0) {
    const previousLessonIds = modLessons
      .slice(0, lessonIndex)
      .map((l) => l.id);
    const completedLessonCount = await prisma.lessonProgress.count({
      where: { userId, lessonId: { in: previousLessonIds } },
    });
    if (completedLessonCount < previousLessonIds.length) {
      throw forbidden(
        "You must complete previous lessons before accessing this one",
      );
    }
  }

  // Build response with signed URLs
  const blocks = await Promise.all(
    cachedLesson.blocks.map(async (b) => ({
      ...b,
      url:
        b.type === "image" && b.storageKey
          ? await getSignedUrl(b.storageKey)
          : null,
    })),
  );

  const lastAttempt = cachedLesson.quiz
    ? await prisma.quizAttempt.findFirst({
        where: { userId, quizId: cachedLesson.quiz.id },
        orderBy: { createdAt: "desc" },
        select: { id: true, score: true, status: true, createdAt: true },
      })
    : null;

  return {
    id: cachedLesson.id,
    title: cachedLesson.title,
    orderIndex: cachedLesson.orderIndex,
    blocks,
    quiz: cachedLesson.quiz,
    lastAttempt: lastAttempt ?? null,
  };
};

export const completeLesson = async (
  slug: string,
  moduleId: string,
  lessonId: string,
  userId: string,
) => {
  // Verify enrollment
  const course = await prisma.course.findFirst({
    where: { slug, status: "published" },
    select: { id: true },
  });
  if (!course) throw notFound("Course not found");

  const enrollment = await prisma.studentCourse.findUnique({
    where: { studentId_courseId: { studentId: userId, courseId: course.id } },
  });
  if (!enrollment) throw forbidden("You must be enrolled");

  // Verify lesson belongs to module
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      quiz: { select: { id: true } },
      module: { select: { id: true, courseId: true } },
    },
  });
  if (
    !lesson ||
    lesson.module.id !== moduleId ||
    lesson.module.courseId !== course.id
  ) {
    throw notFound("Lesson not found");
  }

  // Enforce sequential lesson progression
  const moduleLessons = await prisma.lesson.findMany({
    where: { moduleId },
    orderBy: { orderIndex: "asc" },
    select: { id: true },
  });
  const lessonIndex = moduleLessons.findIndex((l) => l.id === lessonId);
  if (lessonIndex > 0) {
    const previousLessonIds = moduleLessons
      .slice(0, lessonIndex)
      .map((l) => l.id);
    const completedCount = await prisma.lessonProgress.count({
      where: { userId, lessonId: { in: previousLessonIds } },
    });
    if (completedCount < previousLessonIds.length) {
      throw forbidden("You must complete previous lessons first");
    }
  }

  // Verify lesson quiz passed (lesson quiz is mandatory)
  if (lesson.quiz) {
    const lastAttempt = await prisma.quizAttempt.findFirst({
      where: { userId, quizId: lesson.quiz.id },
      orderBy: { createdAt: "desc" },
      select: { status: true },
    });
    if (!lastAttempt || lastAttempt.status !== "pass") {
      throw badRequest(
        "You must pass the lesson quiz before completing this lesson",
      );
    }
  }

  const progress = await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    create: { userId, lessonId },
    update: {},
    select: { id: true, completedAt: true },
  });

  // Auto-complete module if all lessons are done and module has no module-level quiz
  const mod = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { quiz: { select: { id: true } } },
  });

  if (mod && !mod.quiz) {
    const completedLessonCount = await prisma.lessonProgress.count({
      where: { userId, lessonId: { in: moduleLessons.map((l) => l.id) } },
    });
    if (completedLessonCount === moduleLessons.length) {
      // All lessons complete, auto-complete the module
      await prisma.moduleProgress.upsert({
        where: { userId_moduleId: { userId, moduleId } },
        create: { userId, moduleId },
        update: {},
      });

      // Check if all modules are done and course has no quiz → auto-complete course
      const courseModules = await prisma.module.findMany({
        where: { courseId: course.id },
        orderBy: { orderIndex: "asc" },
        select: { id: true },
      });
      const courseWithQuiz = await prisma.course.findUnique({
        where: { id: course.id },
        select: { accessType: true, quiz: { select: { id: true } } },
      });
      // Auto-complete course when all modules are done and there is no final quiz.
      // For PAID_CERTIFICATE: mark PASSED (content done) but skip certificate —
      // the certificate is created by the payment flow after the student pays.
      if (!courseWithQuiz?.quiz) {
        const completedModuleCount = await prisma.moduleProgress.count({
          where: { userId, moduleId: { in: courseModules.map((m) => m.id) } },
        });
        if (completedModuleCount === courseModules.length) {
          const ops: Promise<unknown>[] = [
            prisma.studentCourse.update({
              where: {
                studentId_courseId: { studentId: userId, courseId: course.id },
              },
              data: { status: "PASSED" },
            }),
          ];
          if (courseWithQuiz?.accessType !== "PAID_CERTIFICATE") {
            ops.push(upsertCertificate(userId, course.id));
          }
          await Promise.all(ops);
        }
      }
    }
  }

  await recalculateUserScore(userId);
  return progress;
};

export const getStudentStats = async (userId: string) => {
  const [enrolled, completed, modulesFinished] = await Promise.all([
    prisma.studentCourse.count({
      where: { studentId: userId, status: "ENROLLED" },
    }),
    prisma.studentCourse.count({
      where: { studentId: userId, status: "PASSED" },
    }),
    prisma.moduleProgress.count({ where: { userId } }),
  ]);

  const total = enrolled + completed;
  return {
    enrolled,
    completed,
    modulesFinished,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    total,
  };
};

export const enrollInCourse = async (userId: string, courseId: string) => {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) throw notFound("Course not found");
  if (course.status !== "published")
    throw badRequest("Course is not available for enrollment");

  // Paid courses are enrolled automatically via the payment webhook
  if (course.accessType === "PAID_COURSE") {
    const paid = await prisma.payment.findFirst({
      where: { userId, courseId, type: "COURSE_ACCESS", status: "PAID" },
    });
    if (!paid) throw forbidden("Payment required to enroll in this course");
  }

  const existing = await prisma.studentCourse.findUnique({
    where: { studentId_courseId: { studentId: userId, courseId } },
  });
  if (existing) throw badRequest("Already enrolled in this course");

  const enrollment = await prisma.studentCourse.create({
    data: { studentId: userId, courseId, status: "ENROLLED" },
  });
  await recalculateUserScore(userId);
  return enrollment;
};

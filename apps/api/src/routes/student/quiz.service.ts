import { prisma } from "../../db/prisma";
import { badRequest, notFound, forbidden } from "../../utils/errors";
import { upsertCertificate } from "./certificates.service";
import { recalculateUserScore } from "../../utils/scoring";

export interface SubmittedAnswer {
  questionId: string;
  chosenOptionIds: string[];
}

// ─── Attempt window ───────────────────────────────────────────────────────────

/**
 * maxAttempts is a rolling limit, not a lifetime one: a student gets
 * `quiz.maxAttempts` attempts per ATTEMPT_WINDOW_HOURS, and the slots come back
 * on their own as old attempts age out.
 *
 * Why a window and not a hard cap: a lesson quiz gates every later lesson,
 * every later module, and the certificate. A lifetime cap would end a student's
 * course with no way back except an admin editing the database. A window still
 * stops the real risk — fast repeated guessing to discover the answers — because
 * guessing across days is not worth anyone's time. Farming the leaderboard is
 * stopped separately, by refusing any attempt after a pass.
 */
const ATTEMPT_WINDOW_HOURS = 8;
const ATTEMPT_WINDOW_MS = ATTEMPT_WINDOW_HOURS * 60 * 60 * 1000;

const windowStart = () => new Date(Date.now() - ATTEMPT_WINDOW_MS);

/**
 * When the next slot opens, or null if one is free now. Attempts leave the
 * window one at a time, so the student is unblocked as soon as the oldest
 * attempt still counted against them is old enough to drop out.
 *
 * `recentDesc` must be the in-window attempts, newest first.
 */
const nextAttemptAt = (
  recentDesc: { createdAt: Date }[],
  maxAttempts: number,
): Date | null => {
  if (recentDesc.length < maxAttempts) return null;
  const blocking = recentDesc[maxAttempts - 1].createdAt;
  return new Date(blocking.getTime() + ATTEMPT_WINDOW_MS);
};

const describeWait = (until: Date) => {
  const minutes = Math.max(1, Math.ceil((until.getTime() - Date.now()) / 60000));
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"}`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  const h = `${hours} hour${hours === 1 ? "" : "s"}`;
  return rest === 0 ? h : `${h} ${rest} minute${rest === 1 ? "" : "s"}`;
};

// ─── Loading + access checks ──────────────────────────────────────────────────

/**
 * Loads a quiz with its questions and options, and checks that the user is
 * enrolled in whatever course the quiz belongs to. A quiz can hang off a
 * course, a module, or a lesson, so we walk up to the course either way.
 */
const loadQuizForStudent = async (userId: string, quizId: string) => {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: {
        orderBy: { orderIndex: "asc" },
        include: { options: { orderBy: { orderIndex: "asc" } } },
      },
      course: { select: { accessType: true } },
    },
  });
  if (!quiz) throw notFound("Quiz not found");

  let courseId: string | null = quiz.courseId;

  if (!courseId && quiz.moduleId) {
    const mod = await prisma.module.findUnique({
      where: { id: quiz.moduleId },
      select: { courseId: true },
    });
    if (!mod) throw notFound("Module not found");
    courseId = mod.courseId;
  }

  if (!courseId && quiz.lessonId) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: quiz.lessonId },
      select: { module: { select: { courseId: true } } },
    });
    if (!lesson) throw notFound("Lesson not found");
    courseId = lesson.module.courseId;
  }

  if (courseId) {
    const enrollment = await prisma.studentCourse.findUnique({
      where: { studentId_courseId: { studentId: userId, courseId } },
      select: { studentId: true },
    });
    if (!enrollment)
      throw forbidden("You must be enrolled to attempt this quiz");
  }

  return quiz;
};

type LoadedQuiz = Awaited<ReturnType<typeof loadQuizForStudent>>;

// ─── Marking ──────────────────────────────────────────────────────────────────

/**
 * Marks a set of chosen options against the quiz. Pure — no database access —
 * so the same function serves a fresh submission and a replay of a stored one.
 */
const markAnswers = (quiz: LoadedQuiz, answerMap: Map<string, string[]>) => {
  const isCourseQuiz = !!quiz.courseId;
  let correctCount = 0;

  const questions = quiz.questions.map((question) => {
    const chosenSet = new Set(answerMap.get(question.id) ?? []);
    const correctSet = new Set(
      question.options.filter((o) => o.isCorrect).map((o) => o.id),
    );

    // Correct only if the chosen set matches the correct set exactly.
    // A question with no correct option configured is awarded automatically.
    const isCorrect =
      correctSet.size === 0 ||
      (chosenSet.size === correctSet.size &&
        [...chosenSet].every((id) => correctSet.has(id)));

    if (isCorrect) correctCount++;

    return {
      questionId: question.id,
      text: question.text,
      isCorrect,
      options: question.options.map((o) => {
        const wasChosen = chosenSet.has(o.id);
        return {
          id: o.id,
          text: o.text,
          // Course quizzes only reveal isCorrect on options the student chose.
          ...(isCourseQuiz
            ? wasChosen
              ? { isCorrect: o.isCorrect }
              : {}
            : { isCorrect: o.isCorrect }),
          wasChosen,
        };
      }),
    };
  });

  const score =
    quiz.questions.length === 0
      ? 0
      : Math.round((correctCount / quiz.questions.length) * 100);

  return { questions, score };
};

// ─── Submit ───────────────────────────────────────────────────────────────────

export const submitQuiz = async (
  userId: string,
  quizId: string,
  answers: SubmittedAnswer[],
) => {
  const quiz = await loadQuizForStudent(userId, quizId);

  // A pass closes the quiz for good. Failed attempts are limited per window.
  const [passedBefore, recent] = await Promise.all([
    prisma.quizAttempt.findFirst({
      where: { userId, quizId, status: "pass" },
      select: { id: true },
    }),
    prisma.quizAttempt.findMany({
      where: { userId, quizId, createdAt: { gte: windowStart() } },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
  ]);

  if (passedBefore) throw badRequest("You have already passed this quiz");

  const blockedUntil = nextAttemptAt(recent, quiz.maxAttempts);
  if (blockedUntil)
    throw badRequest(
      `You have used your ${quiz.maxAttempts} attempts for now. You can try again in ${describeWait(blockedUntil)}.`,
    );

  // ── Validate the payload ──
  if (answers.length !== quiz.questions.length)
    throw badRequest(
      `Expected ${quiz.questions.length} answers, got ${answers.length}`,
    );

  const questionIds = new Set(quiz.questions.map((q) => q.id));
  const optionIds = new Set(
    quiz.questions.flatMap((q) => q.options.map((o) => o.id)),
  );

  if (new Set(answers.map((a) => a.questionId)).size !== answers.length)
    throw badRequest("Duplicate question in submitted answers");

  for (const answer of answers) {
    if (!questionIds.has(answer.questionId))
      throw badRequest(
        `Question ${answer.questionId} does not belong to this quiz`,
      );
    for (const optionId of answer.chosenOptionIds) {
      if (!optionIds.has(optionId))
        throw badRequest(`Option ${optionId} does not belong to this quiz`);
    }
  }

  // ── Mark ──
  const answerMap = new Map(
    answers.map((a) => [a.questionId, a.chosenOptionIds]),
  );
  const { questions, score } = markAnswers(quiz, answerMap);
  const status = score >= quiz.passingScore ? "pass" : "fail";

  // Nested create runs in one implicit transaction: an attempt is never
  // written without its answers.
  const attempt = await prisma.quizAttempt.create({
    data: {
      userId,
      quizId,
      score,
      status,
      answers: {
        create: answers.flatMap((a) =>
          a.chosenOptionIds.map((optionId) => ({
            questionId: a.questionId,
            optionId,
          })),
        ),
      },
    },
    select: {
      id: true,
      score: true,
      status: true,
      quizId: true,
      createdAt: true,
    },
  });

  // Auto-complete the course when a course quiz is passed.
  // PAID_CERTIFICATE: mark PASSED but skip the certificate — the payment flow
  // creates it after the student pays.
  if (quiz.courseId && status === "pass") {
    const ops: Promise<unknown>[] = [
      prisma.studentCourse.update({
        where: {
          studentId_courseId: { studentId: userId, courseId: quiz.courseId },
        },
        data: { status: "PASSED" },
      }),
    ];
    if (quiz.course?.accessType !== "PAID_CERTIFICATE") {
      ops.push(upsertCertificate(userId, quiz.courseId));
    }
    await Promise.all(ops);
  }

  await recalculateUserScore(userId);

  // Count this attempt too — it is inside the window by definition.
  const inWindow = [{ createdAt: attempt.createdAt }, ...recent];
  const attemptsUsed = inWindow.length;

  return {
    attempt: {
      ...attempt,
      lessonId: quiz.lessonId ?? null,
      moduleId: quiz.moduleId ?? null,
      courseId: quiz.courseId ?? null,
    },
    questions,
    maxAttempts: quiz.maxAttempts,
    windowHours: ATTEMPT_WINDOW_HOURS,
    attemptsUsed,
    attemptsLeft: Math.max(0, quiz.maxAttempts - attemptsUsed),
    retryAvailableAt:
      status === "pass" ? null : nextAttemptAt(inWindow, quiz.maxAttempts),
  };
};

// ─── Read attempt state ───────────────────────────────────────────────────────

/**
 * Everything the quiz UI needs: how many attempts are left, whether a retake is
 * allowed, and the last attempt replayed as a marked result.
 */
export const getQuizAttemptState = async (userId: string, quizId: string) => {
  const quiz = await loadQuizForStudent(userId, quizId);

  const [attemptsTotal, recent, latest] = await Promise.all([
    prisma.quizAttempt.count({ where: { userId, quizId } }),
    prisma.quizAttempt.findMany({
      where: { userId, quizId, createdAt: { gte: windowStart() } },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
    prisma.quizAttempt.findFirst({
      where: { userId, quizId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        score: true,
        status: true,
        quizId: true,
        createdAt: true,
        answers: { select: { questionId: true, optionId: true } },
      },
    }),
  ]);

  const passed = latest?.status === "pass";

  let lastResult: {
    attempt: {
      id: string;
      score: number;
      status: string;
      createdAt: Date;
      quizId: string;
      lessonId: string | null;
      moduleId: string | null;
      courseId: string | null;
    };
    questions: ReturnType<typeof markAnswers>["questions"];
  } | null = null;

  let contentChanged = false;

  // Attempts made before the answers table existed have no rows to replay.
  if (latest && latest.answers.length > 0) {
    const answerMap = new Map<string, string[]>();
    for (const row of latest.answers) {
      answerMap.set(row.questionId, [
        ...(answerMap.get(row.questionId) ?? []),
        row.optionId,
      ]);
    }

    const currentIds = new Set(quiz.questions.map((q) => q.id));
    contentChanged =
      answerMap.size !== quiz.questions.length ||
      [...answerMap.keys()].some((id) => !currentIds.has(id));

    const { questions } = markAnswers(quiz, answerMap);

    lastResult = {
      // The stored score stays authoritative. We never show the re-marked one,
      // because the quiz content may have changed since the attempt.
      attempt: {
        id: latest.id,
        score: latest.score,
        status: latest.status,
        createdAt: latest.createdAt,
        quizId: latest.quizId,
        lessonId: quiz.lessonId ?? null,
        moduleId: quiz.moduleId ?? null,
        courseId: quiz.courseId ?? null,
      },
      questions,
    };
  }

  const attemptsUsed = recent.length;

  return {
    quizId: quiz.id,
    maxAttempts: quiz.maxAttempts,
    windowHours: ATTEMPT_WINDOW_HOURS,
    /** attempts inside the current window — this is what the limit counts */
    attemptsUsed,
    attemptsLeft: Math.max(0, quiz.maxAttempts - attemptsUsed),
    /** every attempt ever, for display only */
    attemptsTotal,
    canAttempt: !passed && attemptsUsed < quiz.maxAttempts,
    /** when the next slot opens; null when one is free now or the quiz is passed */
    retryAvailableAt: passed ? null : nextAttemptAt(recent, quiz.maxAttempts),
    passed,
    contentChanged,
    lastAttempt: latest
      ? {
          id: latest.id,
          score: latest.score,
          status: latest.status,
          createdAt: latest.createdAt,
        }
      : null,
    lastResult,
  };
};

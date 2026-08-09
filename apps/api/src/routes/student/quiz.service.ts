import { prisma } from "../../db/prisma";
import { badRequest, notFound, forbidden } from "../../utils/errors";
import { upsertCertificate } from "./certificates.service";
import { recalculateUserScore } from "../../utils/scoring";
import {
  assertModuleLessonsCompleted,
  assertCourseModulesCompleted,
} from "../../utils/progress-gates";

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

// ─── Timed sittings ───────────────────────────────────────────────────────────

/**
 * Two minutes per question. These are mostly multiple choice, so the limit is
 * comfortable for someone who studied the lesson and far too short for someone
 * reading it for the first time during the quiz.
 *
 * This is the point of the whole timing feature: we cannot stop a student from
 * opening the lesson in another tab — they are allowed to read it — but we can
 * make it cost more time than they have.
 */
const SECONDS_PER_QUESTION = 120;

/**
 * How late a submission may arrive and still be graded. Covers a slow network
 * on the last request, not a student who kept working past the deadline.
 */
const LATE_SUBMIT_GRACE_MS = 15_000;

const timeLimitSecondsFor = (questionCount: number) =>
  questionCount * SECONDS_PER_QUESTION;

interface SessionRow {
  id: string;
  startedAt: Date;
  expiresAt: Date;
}

const describeSession = (session: SessionRow, questionCount: number) => ({
  sessionId: session.id,
  startedAt: session.startedAt,
  expiresAt: session.expiresAt,
  timeLimitSeconds: timeLimitSecondsFor(questionCount),
  secondsRemaining: Math.max(
    0,
    Math.ceil((session.expiresAt.getTime() - Date.now()) / 1000),
  ),
});

/** The one sitting still open, if any. */
const findOpenSession = (userId: string, quizId: string) =>
  prisma.quizAttemptSession.findFirst({
    where: { userId, quizId, closedAt: null },
    orderBy: { startedAt: "desc" },
  });

/**
 * Turns one abandoned sitting into a zero.
 *
 * Claim the session first with a conditional update. Two requests can arrive at
 * the same moment — whoever wins writes the attempt, the loser does nothing, so
 * a sitting can never produce two attempts.
 */
const closeSessionAsTimedOut = async (
  sessionId: string,
  userId: string,
  quizId: string,
): Promise<boolean> => {
  const claimed = await prisma.quizAttemptSession.updateMany({
    where: { id: sessionId, closedAt: null },
    data: { closedAt: new Date() },
  });
  if (claimed.count === 0) return false;

  const attempt = await prisma.quizAttempt.create({
    data: { userId, quizId, score: 0, status: "fail", timedOut: true },
    select: { id: true },
  });
  await prisma.quizAttemptSession.update({
    where: { id: sessionId },
    data: { attemptId: attempt.id },
  });
  return true;
};

/**
 * Closes every sitting whose clock ran out without a submission.
 *
 * Without this the time limit would buy nothing: a student could start, read
 * the lesson, abandon the tab, and start again on a fresh clock. Walking away
 * has to cost exactly what failing costs.
 *
 * It runs lazily, on every read and write of this quiz, so there is no cron job
 * to keep alive. The grace period is subtracted here too, so a submission that
 * is merely slow is never reaped out from under itself.
 */
const closeExpiredSessions = async (userId: string, quizId: string) => {
  const expired = await prisma.quizAttemptSession.findMany({
    where: {
      userId,
      quizId,
      closedAt: null,
      expiresAt: { lt: new Date(Date.now() - LATE_SUBMIT_GRACE_MS) },
    },
    select: { id: true },
  });
  if (expired.length === 0) return;

  let closedAny = false;
  for (const session of expired) {
    const closed = await closeSessionAsTimedOut(session.id, userId, quizId);
    closedAny = closedAny || closed;
  }
  // A zero on a quiz the student has not passed carries the same "attempted but
  // never passed" penalty as any other fail, so the score has to be redone.
  if (closedAny) await recalculateUserScore(userId);
};

/**
 * Starts a sitting, or hands back the one already open.
 *
 * Resuming matters: a refresh, a flat battery or a dropped connection must not
 * restart the clock and must not cost another attempt. Only a genuinely new
 * sitting does.
 */
export const startQuizAttempt = async (userId: string, quizId: string) => {
  const quiz = await loadQuizForStudent(userId, quizId);

  if (quiz.moduleId) await assertModuleLessonsCompleted(userId, quiz.moduleId);
  if (quiz.courseId) await assertCourseModulesCompleted(userId, quiz.courseId);

  await closeExpiredSessions(userId, quizId);

  const passedBefore = await prisma.quizAttempt.findFirst({
    where: { userId, quizId, status: "pass" },
    select: { id: true },
  });
  if (passedBefore) throw badRequest("You have already passed this quiz");

  const open = await findOpenSession(userId, quizId);
  if (open) return describeSession(open, quiz.questions.length);

  const recent = await prisma.quizAttempt.findMany({
    where: { userId, quizId, createdAt: { gte: windowStart() } },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
  const blockedUntil = nextAttemptAt(recent, quiz.maxAttempts);
  if (blockedUntil)
    throw badRequest(
      `You have used your ${quiz.maxAttempts} attempts for now. You can try again in ${describeWait(blockedUntil)}.`,
    );

  const limitSeconds = timeLimitSecondsFor(quiz.questions.length);
  const session = await prisma.quizAttemptSession.create({
    data: {
      userId,
      quizId,
      expiresAt: new Date(Date.now() + limitSeconds * 1000),
    },
  });

  return describeSession(session, quiz.questions.length);
};

// ─── Submit ───────────────────────────────────────────────────────────────────

export const submitQuiz = async (
  userId: string,
  quizId: string,
  answers: SubmittedAnswer[],
  warningCount = 0,
) => {
  const quiz = await loadQuizForStudent(userId, quizId);

  // The content under the quiz must be finished first. The UI locks these
  // links, but the URL is reachable by hand.
  if (quiz.moduleId) await assertModuleLessonsCompleted(userId, quiz.moduleId);
  if (quiz.courseId) await assertCourseModulesCompleted(userId, quiz.courseId);

  // ── The sitting has to be open ──
  // Look before reaping: a submission inside the grace window must not be
  // closed as a timeout by its own request.
  const session = await findOpenSession(userId, quizId);
  if (!session)
    throw badRequest(
      "Your quiz sitting has ended. Start the quiz again to answer.",
    );

  if (Date.now() > session.expiresAt.getTime() + LATE_SUBMIT_GRACE_MS) {
    await closeSessionAsTimedOut(session.id, userId, quizId);
    await recalculateUserScore(userId);
    throw badRequest("Your time ran out. This attempt was scored 0.");
  }

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
      // Reported by the browser, so it is a signal for an admin to look at a
      // student, never proof on its own. Stored because a warning nobody keeps
      // is a warning nobody can act on.
      warningCount,
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

  // This sitting is done, whatever the result.
  await prisma.quizAttemptSession.update({
    where: { id: session.id },
    data: { closedAt: new Date(), attemptId: attempt.id },
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

  // Lazy expiry: a sitting the student walked away from becomes a zero the
  // next time anyone asks about this quiz. This is a read that writes, on
  // purpose — the alternative is a scheduled job for something that only ever
  // matters when a student comes back.
  await closeExpiredSessions(userId, quizId);

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
        timedOut: true,
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

  // Anything still open here is inside its clock — closeExpiredSessions ran at
  // the top. The student is mid-sitting and should be put straight back into it.
  const openSession = passed ? null : await findOpenSession(userId, quizId);

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
    /** how long a sitting lasts: two minutes per question */
    timeLimitSeconds: timeLimitSecondsFor(quiz.questions.length),
    /** a sitting the student is in the middle of, to be resumed on its own clock */
    activeSession: openSession
      ? describeSession(openSession, quiz.questions.length)
      : null,
    lastAttempt: latest
      ? {
          id: latest.id,
          score: latest.score,
          status: latest.status,
          createdAt: latest.createdAt,
          /** the clock ran out; this was never submitted by the student */
          timedOut: latest.timedOut,
        }
      : null,
    lastResult,
  };
};

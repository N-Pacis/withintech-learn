import { prisma } from "../db/prisma";

/*
 * ── POSITIVE indicators ──────────────────────────────────────────────────────
 *  Enroll in a course                1
 *  Complete a module                 2
 *  Complete a lesson                 1.5
 *  Pass a quiz (distinct per quiz)   3   — retakes don't stack
 *  Complete a course                10
 *  Earn a certificate               15
 *  Challenge attempt (per unique challenge, by difficulty):
 *    easy 1 · medium 2 · hard 3
 *  Challenge performance (bestTestRate × completionCap, by difficulty):
 *    easy ×8 · medium ×12 · hard ×20
 *    → fully solved easy   =  1 + 8   =  9 pts
 *    → fully solved medium =  2 + 12  = 14 pts
 *    → fully solved hard   =  3 + 20  = 23 pts
 *    → 8/10 tests on medium = 2 + 9.6 = 11.6 pts  (partial credit)
 *
 * ── NEGATIVE indicators ──────────────────────────────────────────────────────
 *  Never-passed quiz         −4  per quiz attempted but never passed (recoverable)
 *  Ghost enrollment          −1  per course enrolled >7 days ago with zero progress
 *                                exactly cancels the +1 enrollment point
 *  Stagnant challenge        −2  per challenge with ≥5 submissions and 0% test rate
 *
 * All penalties are recoverable: doing the right thing removes them on next
 * recalculation. Score floor is 0 (never goes negative).
 */

const ATTEMPT_PTS = { easy: 1, medium: 2, hard: 3 } as const;
const COMPLETION_PTS = { easy: 8, medium: 12, hard: 20 } as const;

const NEVER_PASSED_QUIZ_PENALTY = 4;
const GHOST_ENROLLMENT_PENALTY = 1;
const STAGNANT_CHALLENGE_PENALTY = 2;
const STAGNANT_SUBMISSION_THRESHOLD = 5;
const GHOST_ENROLLMENT_DAYS = 7;

type Difficulty = keyof typeof ATTEMPT_PTS;

export async function recalculateUserScore(userId: string): Promise<void> {
  const ghostCutoff = new Date(
    Date.now() - GHOST_ENROLLMENT_DAYS * 24 * 60 * 60 * 1000,
  );

  // ── Stage 1: parallel queries ────────────────────────────────────────────────
  const [
    enrollments,
    modules,
    lessons,
    allAttemptedQuizRows,
    passedQuizRows,
    courseCompletions,
    certificates,
    challengeSubmissions,
    ghostCandidates,
  ] = await Promise.all([
    prisma.studentCourse.count({ where: { studentId: userId } }),
    prisma.moduleProgress.count({ where: { userId } }),
    prisma.lessonProgress.count({ where: { userId } }),

    // All distinct quizzes this student touched (any status)
    prisma.quizAttempt.findMany({
      where: { userId },
      select: { quizId: true },
      distinct: ["quizId"],
    }),

    // Distinct quizzes the student passed at least once
    prisma.quizAttempt.findMany({
      where: { userId, status: "pass" },
      select: { quizId: true },
      distinct: ["quizId"],
    }),

    prisma.studentCourse.count({
      where: { studentId: userId, status: "PASSED" },
    }),
    prisma.certificate.count({ where: { userId } }),

    // All submissions — challenge scoring + stagnant detection
    prisma.challengeSubmission.findMany({
      where: { userId },
      select: {
        challengeId: true,
        testsPassed: true,
        totalTests: true,
        challenge: { select: { difficulty: true } },
      },
    }),

    // Courses enrolled > N days ago that are still ENROLLED (not completed)
    prisma.studentCourse.findMany({
      where: {
        studentId: userId,
        status: "ENROLLED",
        enrolledAt: { lt: ghostCutoff },
      },
      select: {
        courseId: true,
        course: {
          select: {
            modules: {
              select: {
                id: true,
                lessons: { select: { id: true } },
              },
            },
          },
        },
      },
    }),
  ]);

  // ── Quiz: positive + negative ────────────────────────────────────────────────
  const passedQuizIds = new Set(passedQuizRows.map((r) => r.quizId));
  const distinctQuizPasses = passedQuizIds.size;
  const neverPassedQuizzes = allAttemptedQuizRows.filter(
    (r) => !passedQuizIds.has(r.quizId),
  ).length;

  // ── Challenge scoring ────────────────────────────────────────────────────────
  const submissionsPerChallenge = new Map<string, number>();
  const bestPerChallenge = new Map<
    string,
    { difficulty: Difficulty; bestRate: number }
  >();

  for (const sub of challengeSubmissions) {
    submissionsPerChallenge.set(
      sub.challengeId,
      (submissionsPerChallenge.get(sub.challengeId) ?? 0) + 1,
    );

    const rate = sub.totalTests > 0 ? sub.testsPassed / sub.totalTests : 0;
    const existing = bestPerChallenge.get(sub.challengeId);
    if (!existing || rate > existing.bestRate) {
      bestPerChallenge.set(sub.challengeId, {
        difficulty: (sub.challenge.difficulty as Difficulty) ?? "medium",
        bestRate: rate,
      });
    }
  }

  let challengePts = 0;
  let stagnantChallenges = 0;

  for (const [challengeId, c] of bestPerChallenge) {
    challengePts +=
      (ATTEMPT_PTS[c.difficulty] ?? 2) +
      (COMPLETION_PTS[c.difficulty] ?? 10) * c.bestRate;

    if (
      c.bestRate === 0 &&
      (submissionsPerChallenge.get(challengeId) ?? 0) >=
        STAGNANT_SUBMISSION_THRESHOLD
    ) {
      stagnantChallenges++;
    }
  }

  // ── Ghost enrollment ─────────────────────────────────────────────────────────
  // Stage 2: check whether each ghost-candidate course has any progress.
  // Runs only when there are actually stale enrollments (usually 0).
  let ghostCount = 0;

  if (ghostCandidates.length > 0) {
    const allModuleIds = ghostCandidates.flatMap((e) =>
      e.course.modules.map((m) => m.id),
    );
    const allLessonIds = ghostCandidates.flatMap((e) =>
      e.course.modules.flatMap((m) => m.lessons.map((l) => l.id)),
    );

    const [completedModuleIds, completedLessonIds] = await Promise.all([
      allModuleIds.length > 0
        ? prisma.moduleProgress
            .findMany({
              where: { userId, moduleId: { in: allModuleIds } },
              select: { moduleId: true },
            })
            .then((rows) => new Set(rows.map((r) => r.moduleId)))
        : Promise.resolve(new Set<string>()),
      allLessonIds.length > 0
        ? prisma.lessonProgress
            .findMany({
              where: { userId, lessonId: { in: allLessonIds } },
              select: { lessonId: true },
            })
            .then((rows) => new Set(rows.map((r) => r.lessonId)))
        : Promise.resolve(new Set<string>()),
    ]);

    for (const enrollment of ghostCandidates) {
      const modIds = enrollment.course.modules.map((m) => m.id);
      const lesIds = enrollment.course.modules.flatMap((m) =>
        m.lessons.map((l) => l.id),
      );

      // Skip courses with no content yet — nothing to penalise
      if (modIds.length === 0 && lesIds.length === 0) continue;

      const hasProgress =
        modIds.some((id) => completedModuleIds.has(id)) ||
        lesIds.some((id) => completedLessonIds.has(id));

      if (!hasProgress) ghostCount++;
    }
  }

  // ── Combine ──────────────────────────────────────────────────────────────────
  const positive =
    enrollments * 1 +
    modules * 2 +
    lessons * 1.5 +
    distinctQuizPasses * 3 +
    courseCompletions * 10 +
    certificates * 15 +
    challengePts;

  const deductions =
    neverPassedQuizzes * NEVER_PASSED_QUIZ_PENALTY +
    ghostCount * GHOST_ENROLLMENT_PENALTY +
    stagnantChallenges * STAGNANT_CHALLENGE_PENALTY;

  const score = parseFloat(Math.max(0, positive - deductions).toFixed(2));

  await prisma.user.update({
    where: { id: userId },
    data: { score },
    select: { id: true },
  });
}

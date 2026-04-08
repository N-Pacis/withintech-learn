import { prisma } from '../../db/prisma';

export interface DailyActivePoint {
  date: string;    // "YYYY-MM-DD"
  active: number;  // distinct users who interacted with a module that day
}

export interface UsersOverTimePoint {
  date: string;  // "YYYY-MM-DD"
  users: number; // new registrations that day
}

export interface ChallengeLeaderboardEntry {
  userId:         string;
  firstName:      string;
  lastName:       string;
  problemsSolved: number;
}

export interface TrendPoint {
  month: string;     // "2024-01"
  enrolled: number;
  completed: number;
}

export interface TopCourse {
  id: string;
  title: string;
  enrolled: number;
  completed: number;
  completionRate: number;
}

export interface RetentionStats {
  registeredStudents: number; // all users with student role
  enrolledStudents: number;   // students with at least 1 enrollment
  enrollmentRate: number;     // enrolledStudents / registeredStudents %
  returningStudents: number;  // enrolled in 2+ courses
  retentionRate: number;      // returningStudents / enrolledStudents %
}

// Parse "YYYY-MM-DD" → local midnight (inclusive start).
function dayStart(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// Parse "YYYY-MM-DD" → local midnight of the NEXT day (exclusive upper bound).
function dayEnd(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d + 1);
}

// Parse "YYYY-MM" → first millisecond of that month.
function monthStart(ym: string): Date {
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, m - 1, 1);
}

// Parse "YYYY-MM" → first millisecond of the NEXT month (exclusive upper bound).
function monthEnd(ym: string): Date {
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, m, 1); // month is 0-based, so m = next month
}

// Enrollments + completions grouped by month for a given date range.
// Single indexed scan on StudentCourse(enrolledAt).
export async function enrollmentTrend(from: string, to: string): Promise<TrendPoint[]> {
  const fromDate = monthStart(from);
  const toDate   = monthEnd(to);

  const rows = await prisma.$queryRaw<{ month: string; enrolled: number; completed: number }[]>`
    SELECT
      TO_CHAR(DATE_TRUNC('month', "enrolledAt"), 'YYYY-MM') AS month,
      COUNT(*)::int                                           AS enrolled,
      COUNT(*) FILTER (WHERE status = 'PASSED')::int         AS completed
    FROM "StudentCourse"
    WHERE "enrolledAt" >= ${fromDate} AND "enrolledAt" < ${toDate}
    GROUP BY DATE_TRUNC('month', "enrolledAt")
    ORDER BY DATE_TRUNC('month', "enrolledAt") ASC
  `;

  return rows.map((r) => ({
    month: r.month,
    enrolled: Number(r.enrolled),
    completed: Number(r.completed),
  }));
}

// Top N published courses ranked by enrollment count.
// Single pass join — no N+1.
export async function topCourses(limit = 5): Promise<TopCourse[]> {
  const rows = await prisma.$queryRaw<{
    id: string;
    title: string;
    enrolled: number;
    completed: number;
  }[]>`
    SELECT
      c.id,
      c.title,
      COUNT(sc.id)::int                                        AS enrolled,
      COUNT(sc.id) FILTER (WHERE sc.status = 'PASSED')::int   AS completed
    FROM "Course" c
    LEFT JOIN "StudentCourse" sc ON sc."courseId" = c.id
    WHERE c.status = 'published'
    GROUP BY c.id, c.title
    ORDER BY enrolled DESC
    LIMIT 5
  `;

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    enrolled: Number(r.enrolled),
    completed: Number(r.completed),
    completionRate:
      Number(r.enrolled) > 0
        ? Math.round((Number(r.completed) / Number(r.enrolled)) * 100)
        : 0,
  }));
}

// Distinct students who completed or enrolled in at least one module per day.
// "Active" = has a ModuleProgress record on that day.
export async function dailyActiveLearners(from: string, to: string): Promise<DailyActivePoint[]> {
  const fromDate = dayStart(from);
  const toDate   = dayEnd(to);

  const rows = await prisma.$queryRaw<{ date: string; active: number }[]>`
    SELECT
      TO_CHAR("completedAt"::date, 'YYYY-MM-DD') AS date,
      COUNT(DISTINCT "userId")::int               AS active
    FROM "ModuleProgress"
    WHERE "completedAt" >= ${fromDate} AND "completedAt" < ${toDate}
    GROUP BY "completedAt"::date
    ORDER BY "completedAt"::date ASC
  `;

  return rows.map((r) => ({ date: r.date, active: Number(r.active) }));
}

// New user registrations per day for a given date range.
export async function usersOverTime(from: string, to: string): Promise<UsersOverTimePoint[]> {
  const fromDate = dayStart(from);
  const toDate   = dayEnd(to);

  const rows = await prisma.$queryRaw<{ date: string; users: number }[]>`
    SELECT
      TO_CHAR("createdAt"::date, 'YYYY-MM-DD') AS date,
      COUNT(*)::int                             AS users
    FROM "User"
    WHERE "createdAt" >= ${fromDate} AND "createdAt" < ${toDate}
    GROUP BY "createdAt"::date
    ORDER BY "createdAt"::date ASC
  `;

  return rows.map((r) => ({ date: r.date, users: Number(r.users) }));
}

// Top 5 students ranked by distinct challenges they got accepted on in the date range.
// Uses ChallengeSubmission.submittedAt — the authoritative timestamp of when a solve happened.
// ChallengeProgress.completedAt is only set on first-ever solve (upsert with update:{}),
// so it cannot be used to scope solves to a time window.
export async function challengeLeaderboard(from: string, to: string): Promise<ChallengeLeaderboardEntry[]> {
  const fromDate = dayStart(from);
  const toDate   = dayEnd(to);

  const rows = await prisma.$queryRaw<{
    user_id:         string;
    first_name:      string;
    last_name:       string;
    problems_solved: number;
  }[]>`
    SELECT
      u.id                                         AS user_id,
      u."firstName"                                AS first_name,
      u."lastName"                                 AS last_name,
      COUNT(DISTINCT cs."challengeId")::int        AS problems_solved
    FROM "ChallengeSubmission" cs
    JOIN "User" u ON u.id = cs."userId"
    WHERE cs.status = 'accepted'
      AND cs."submittedAt" >= ${fromDate}
      AND cs."submittedAt" <  ${toDate}
    GROUP BY u.id, u."firstName", u."lastName"
    ORDER BY problems_solved DESC
    LIMIT 5
  `;

  return rows.map((r) => ({
    userId:         r.user_id,
    firstName:      r.first_name,
    lastName:       r.last_name,
    problemsSolved: Number(r.problems_solved),
  }));
}

export interface ChallengeAnalytics {
  totalPublished: number;
  totalDraft: number;
  totalSubmissions: number;
  overallPassRate: number;
  totalSolvers: number;
  topChallenges: { id: string; title: string; difficulty: string; submissions: number; passRate: number }[];
  hardestChallenges: { id: string; title: string; difficulty: string; submissions: number; passRate: number }[];
}

export async function challengeAnalytics(): Promise<ChallengeAnalytics> {
  const [counts, submissionRows, topRows, hardestRows, solversResult] = await Promise.all([
    prisma.challenge.groupBy({
      by: ['status'],
      _count: { id: true },
    }),
    prisma.$queryRaw<{ total: number; accepted: number }[]>`
      SELECT COUNT(*)::int AS total,
             COUNT(*) FILTER (WHERE status = 'accepted')::int AS accepted
      FROM "ChallengeSubmission"
    `,
    // Top 5 by submission count (published only)
    prisma.$queryRaw<{ id: string; title: string; difficulty: string; submissions: number; accepted: number }[]>`
      SELECT c.id, c.title, c.difficulty,
             COUNT(cs.id)::int AS submissions,
             COUNT(cs.id) FILTER (WHERE cs.status = 'accepted')::int AS accepted
      FROM "Challenge" c
      LEFT JOIN "ChallengeSubmission" cs ON cs."challengeId" = c.id
      WHERE c.status = 'published'
      GROUP BY c.id, c.title, c.difficulty
      ORDER BY submissions DESC
      LIMIT 5
    `,
    // Hardest = published with ≥5 submissions, lowest pass rate
    prisma.$queryRaw<{ id: string; title: string; difficulty: string; submissions: number; accepted: number }[]>`
      SELECT c.id, c.title, c.difficulty,
             COUNT(cs.id)::int AS submissions,
             COUNT(cs.id) FILTER (WHERE cs.status = 'accepted')::int AS accepted
      FROM "Challenge" c
      JOIN "ChallengeSubmission" cs ON cs."challengeId" = c.id
      WHERE c.status = 'published'
      GROUP BY c.id, c.title, c.difficulty
      HAVING COUNT(cs.id) >= 5
      ORDER BY (COUNT(cs.id) FILTER (WHERE cs.status = 'accepted')::float / COUNT(cs.id)) ASC
      LIMIT 5
    `,
    // Unique solvers
    prisma.challengeSubmission.findMany({
      where: { status: 'accepted' },
      select: { userId: true },
      distinct: ['userId'],
    }),
  ]);

  const statusMap: Record<string, number> = {};
  for (const row of counts) statusMap[row.status] = row._count.id;

  const totalSubs = submissionRows[0] ? Number(submissionRows[0].total) : 0;
  const totalAcc  = submissionRows[0] ? Number(submissionRows[0].accepted) : 0;

  const toRow = (r: { id: string; title: string; difficulty: string; submissions: number; accepted: number }) => ({
    id: r.id,
    title: r.title,
    difficulty: r.difficulty,
    submissions: Number(r.submissions),
    passRate: Number(r.submissions) > 0
      ? Math.round((Number(r.accepted) / Number(r.submissions)) * 100)
      : 0,
  });

  return {
    totalPublished: statusMap['published'] ?? 0,
    totalDraft: statusMap['draft'] ?? 0,
    totalSubmissions: totalSubs,
    overallPassRate: totalSubs > 0 ? Math.round((totalAcc / totalSubs) * 100) : 0,
    totalSolvers: solversResult.length,
    topChallenges: topRows.map(toRow),
    hardestChallenges: hardestRows.map(toRow),
  };
}

// Students who came back for a second course (retention).
// CTE so the subquery runs once.
export async function retention(): Promise<RetentionStats> {
  const rows = await prisma.$queryRaw<{
    registered: number;
    enrolled: number;
    returning: number;
  }[]>`
    WITH per_student AS (
      SELECT "studentId", COUNT(DISTINCT "courseId") AS course_count
      FROM "StudentCourse"
      GROUP BY "studentId"
    ),
    registered AS (
      SELECT COUNT(*)::int AS cnt
      FROM "User" u
      JOIN "Role" r ON u."roleId" = r.id
      WHERE r.name = 'student'
    )
    SELECT
      (SELECT cnt FROM registered)                           AS registered,
      COUNT(*)::int                                          AS enrolled,
      COUNT(*) FILTER (WHERE course_count > 1)::int         AS returning
    FROM per_student
  `;

  const { registered = 0, enrolled = 0, returning = 0 } = rows[0] ?? {};
  const r = Number(registered);
  const e = Number(enrolled);
  const ret = Number(returning);

  return {
    registeredStudents: r,
    enrolledStudents: e,
    enrollmentRate:  r  > 0 ? Math.round((e   / r) * 100) : 0,
    returningStudents: ret,
    retentionRate:   e  > 0 ? Math.round((ret / e) * 100) : 0,
  };
}


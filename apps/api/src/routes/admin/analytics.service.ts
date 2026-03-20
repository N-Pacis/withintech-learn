import { prisma } from '../../db/prisma';

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
  totalStudents: number;
  returningStudents: number;  // enrolled in 2+ courses
  retentionRate: number;      // percentage
}

// Enrollments + completions grouped by month for the last N months.
// Single indexed scan on StudentCourse(enrolledAt).
export async function enrollmentTrend(months = 12): Promise<TrendPoint[]> {
  const since = new Date();
  since.setMonth(since.getMonth() - months);

  const rows = await prisma.$queryRaw<{ month: string; enrolled: number; completed: number }[]>`
    SELECT
      TO_CHAR(DATE_TRUNC('month', "enrolledAt"), 'YYYY-MM') AS month,
      COUNT(*)::int                                           AS enrolled,
      COUNT(*) FILTER (WHERE status = 'PASSED')::int         AS completed
    FROM "StudentCourse"
    WHERE "enrolledAt" >= ${since}
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

// Students who came back for a second course (retention).
// CTE so the subquery runs once.
export async function retention(): Promise<RetentionStats> {
  const rows = await prisma.$queryRaw<{ total: number; returning: number }[]>`
    WITH per_student AS (
      SELECT "studentId", COUNT(DISTINCT "courseId") AS course_count
      FROM "StudentCourse"
      GROUP BY "studentId"
    )
    SELECT
      COUNT(*)::int                                          AS total,
      COUNT(*) FILTER (WHERE course_count > 1)::int         AS returning
    FROM per_student
  `;

  const { total = 0, returning = 0 } = rows[0] ?? {};
  return {
    totalStudents: Number(total),
    returningStudents: Number(returning),
    retentionRate:
      Number(total) > 0 ? Math.round((Number(returning) / Number(total)) * 100) : 0,
  };
}

// All three queries run in parallel — total latency = slowest query.
export async function getAnalytics() {
  const [trend, courses, ret] = await Promise.all([
    enrollmentTrend(12),
    topCourses(5),
    retention(),
  ]);

  return {
    enrollmentTrend: trend,
    topCourses: courses,
    retention: ret,
  };
}

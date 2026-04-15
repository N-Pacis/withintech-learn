import { Router, Request, Response } from 'express';
import { prisma } from '../../db/prisma';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/response';
import { notFound } from '../../utils/errors';
import {
  getCachedStudentChallenge,
  buildAndCacheChallenge,
} from '../../services/challenge-cache.service';

const router = Router();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function excerpt(html: string, maxLen = 160): string {
  const text = stripHtml(html);
  return text.length <= maxLen ? text : text.slice(0, maxLen).replace(/\s+\S*$/, '') + '…';
}

// ─── List 10 random published challenges (no auth) ────────────────────────────

router.get('/public/challenges', asyncHandler(async (_req: Request, res: Response) => {
  // Fetch all published, shuffle server-side, return 10
  const all = await prisma.challenge.findMany({
    where:  { status: 'published' },
    select: {
      id:          true,
      number:      true,
      title:       true,
      slug:        true,
      difficulty:  true,
      description: true,
      _count:      { select: { testCases: true } },
    },
  });

  // Fisher-Yates shuffle
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }

  sendSuccess(res, all.slice(0, 10).map(c => ({
    id:                 c.id,
    number:             c.number,
    title:              c.title,
    slug:               c.slug,
    difficulty:         c.difficulty,
    descriptionExcerpt: excerpt(c.description),
    testCount:          c._count.testCases,
  })));
}));

// ─── Get single published challenge (no auth) ─────────────────────────────────

router.get('/public/challenges/:slug', asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;

  let cached = await getCachedStudentChallenge(slug);

  if (!cached) {
    const dbChallenge = await prisma.challenge.findFirst({
      where:  { slug, status: 'published' },
      select: { id: true },
    });
    if (!dbChallenge) throw notFound('Challenge not found');

    await buildAndCacheChallenge(dbChallenge.id);
    cached = await getCachedStudentChallenge(slug);
    if (!cached) throw notFound('Challenge not found');
  }

  sendSuccess(res, {
    id:               cached.id,
    title:            cached.title,
    slug:             cached.slug,
    description:      cached.description,
    difficulty:       cached.difficulty,
    starterCode:      cached.starterCode,
    functionParams:   cached.functionParams,
    returnType:       cached.returnType,
    timeLimit:        cached.timeLimit,
    visibleTestCases: cached.visibleTestCases,
  });
}));

export default router;

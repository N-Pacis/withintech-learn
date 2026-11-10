import { prisma } from "../../src/db/prisma";
import type { CourseDraft } from "./types";

// Rough coverage check: for each module quiz question, does the lesson text
// mention most of the meaningful words of the correct answer? It is a hint
// for reviewers, not a gate — the loader prints gaps and carries on.

const STOP = new Set(
  "a an and are as at be by can do for from has have how in is it its of on or that the this to was what when which with you your true false".split(
    " ",
  ),
);

const words = (s: string): string[] =>
  s
    .toLowerCase()
    .replace(/<[^>]+>/g, " ")
    .replace(/[^a-z0-9%+\-. ]/g, " ")
    .split(/\s+/)
    .map((w) => w.replace(/^[.\-]+|[.\-]+$/g, ""))
    .filter((w) => w.length > 2 && !STOP.has(w));

/** Structural errors in drafted quizzes; the loader refuses to run if any. */
export function quizDraftErrors(draft: CourseDraft): string[] {
  const errors: string[] = [];
  for (const lesson of draft.lessons) {
    if (!lesson.quiz) continue;
    const where = `${draft.key} / ${lesson.moduleTitle}`;
    if (lesson.quiz.questions.length === 0) errors.push(`${where}: quiz has no questions`);
    lesson.quiz.questions.forEach((q, i) => {
      if (q.options.length < 2) errors.push(`${where} Q${i + 1}: needs at least 2 options`);
      if (q.correct.length === 0) errors.push(`${where} Q${i + 1}: no correct option`);
      if (q.correct.some((c) => c < 0 || c >= q.options.length))
        errors.push(`${where} Q${i + 1}: correct index out of range`);
    });
  }
  return errors;
}

export async function reportCoverage(draft: CourseDraft): Promise<void> {
  let gaps = 0;
  for (const lesson of draft.lessons) {
    const quiz = await prisma.quiz.findFirst({
      where: { moduleId: lesson.moduleId },
      select: {
        questions: {
          select: {
            text: true,
            options: { where: { isCorrect: true }, select: { text: true } },
          },
        },
      },
    });
    if (!quiz) continue;
    const body = new Set(
      words(
        lesson.blocks
          .map((b) =>
            b.type === "text"
              ? b.html
              : b.type === "code"
                ? b.code
                : b.type === "image"
                  ? b.caption
                  : `${b.html} ${b.js}`,
          )
          .join(" "),
      ),
    );
    for (const q of quiz.questions) {
      for (const opt of q.options) {
        const key = words(opt.text);
        if (key.length === 0) continue;
        const hit = key.filter((w) => body.has(w)).length / key.length;
        if (hit < 0.5) {
          gaps++;
          console.log(`  coverage? ${lesson.moduleTitle}: "${q.text}" -> "${opt.text}"`);
        }
      }
    }
  }
  console.log(gaps === 0 ? "  coverage: every quiz answer is covered" : `  coverage: ${gaps} answer(s) to review`);
}

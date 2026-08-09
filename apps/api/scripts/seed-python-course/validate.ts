import type { Curriculum, Quiz } from "./types";

// Catches content mistakes before anything touches the database. Every rule
// here mirrors a constraint the API or the schema would enforce anyway, so a
// clean run means the admin UI can also load and edit the result.

const ALLOWED_TAGS = new Set([
  "h2",
  "h3",
  "p",
  "ul",
  "ol",
  "li",
  "strong",
  "em",
  "code",
  "hr",
  "br",
  "a",
  "blockquote",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
]);

const checkQuiz = (quiz: Quiz, where: string, errors: string[]) => {
  if (!quiz.title.trim()) errors.push(`${where}: quiz has an empty title`);
  if (quiz.passingScore < 0 || quiz.passingScore > 100)
    errors.push(`${where}: passingScore must be between 0 and 100`);
  if (quiz.maxAttempts < 1)
    errors.push(`${where}: maxAttempts must be at least 1`);
  if (quiz.questions.length === 0)
    errors.push(`${where}: quiz has no questions`);

  quiz.questions.forEach((q, qi) => {
    const at = `${where} > Q${qi + 1}`;
    if (!q.text.trim()) errors.push(`${at}: empty question text`);
    if (q.options.length < 2)
      errors.push(`${at}: needs at least 2 options, has ${q.options.length}`);
    if (new Set(q.options).size !== q.options.length)
      errors.push(`${at}: duplicate option text`);
    q.options.forEach((o, oi) => {
      if (!o.trim()) errors.push(`${at}: option ${oi + 1} is empty`);
    });
    // A question with no correct option is auto-awarded by markAnswers, which
    // silently inflates scores. Always a content bug.
    if (q.correct.length === 0)
      errors.push(`${at}: no correct option marked`);
    if (new Set(q.correct).size !== q.correct.length)
      errors.push(`${at}: the same correct index is listed twice`);
    q.correct.forEach((c) => {
      if (!Number.isInteger(c) || c < 0 || c >= q.options.length)
        errors.push(
          `${at}: correct index ${c} is outside the option list (0..${q.options.length - 1})`,
        );
    });
    if (q.correct.length === q.options.length)
      errors.push(`${at}: every option is marked correct`);
  });
};

const checkHtml = (html: string, where: string, errors: string[]) => {
  if (!html.trim()) {
    errors.push(`${where}: empty text block`);
    return;
  }
  // Rough tag balance check. The renderer trusts this HTML, so unclosed tags
  // would break the page layout for every student.
  const stack: string[] = [];
  const tagPattern = /<(\/?)([a-zA-Z0-9]+)([^>]*?)(\/?)>/g;
  let match: RegExpExecArray | null;
  while ((match = tagPattern.exec(html)) !== null) {
    const [, closing, rawTag, , selfClosing] = match;
    const tag = rawTag.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) {
      errors.push(`${where}: tag <${tag}> is not in the allowed list`);
      continue;
    }
    if (tag === "hr" || tag === "br" || selfClosing) continue;
    if (closing) {
      const open = stack.pop();
      if (open !== tag)
        errors.push(
          `${where}: </${tag}> closes <${open ?? "nothing"}> — tags are not nested correctly`,
        );
    } else {
      stack.push(tag);
    }
  }
  if (stack.length)
    errors.push(`${where}: unclosed tag(s) <${stack.join(">, <")}>`);

  if (/w3schools/i.test(html))
    errors.push(`${where}: links to w3schools — content must be original`);
};

export const validateCurriculum = (curriculum: Curriculum): string[] => {
  const errors: string[] = [];

  if (curriculum.modules.length < 8 || curriculum.modules.length > 10)
    errors.push(
      `Course must have between 8 and 10 modules, has ${curriculum.modules.length}`,
    );

  const moduleTitles = new Set<string>();

  curriculum.modules.forEach((mod, mi) => {
    const modWhere = `Module ${mi + 1} "${mod.title}"`;
    if (!mod.title.trim()) errors.push(`${modWhere}: empty title`);
    if (moduleTitles.has(mod.title))
      errors.push(`${modWhere}: duplicate module title`);
    moduleTitles.add(mod.title);
    if (mod.lessons.length === 0) errors.push(`${modWhere}: has no lessons`);

    const lessonTitles = new Set<string>();
    mod.lessons.forEach((lesson, li) => {
      const where = `${modWhere} > Lesson ${li + 1} "${lesson.title}"`;
      if (!lesson.title.trim()) errors.push(`${where}: empty title`);
      if (lessonTitles.has(lesson.title))
        errors.push(`${where}: duplicate lesson title inside the module`);
      lessonTitles.add(lesson.title);

      if (lesson.blocks.length === 0) errors.push(`${where}: has no blocks`);
      lesson.blocks.forEach((block, bi) => {
        const bWhere = `${where} > block ${bi + 1}`;
        if (block.type === "text") checkHtml(block.html, bWhere, errors);
        else if (!block.code.trim())
          errors.push(`${bWhere}: empty code block`);
      });

      if (lesson.quiz) checkQuiz(lesson.quiz, where, errors);
    });

    if (mod.quiz) checkQuiz(mod.quiz, modWhere, errors);
  });

  if (curriculum.finalExam) checkQuiz(curriculum.finalExam, "Final exam", errors);

  return errors;
};

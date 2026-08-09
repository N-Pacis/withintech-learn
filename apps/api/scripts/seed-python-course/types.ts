// Shape of the Python course curriculum.
//
// The seeder turns this data into Module / Lesson / LessonBlock / Quiz /
// Question / QuestionOption rows. Order indices are NOT written by hand: the
// seeder derives them from array position, starting at 1, which is what
// `validateReorder` in the admin services expects (contiguous, starting at 1).

/** A `text` block. `html` is rendered with dangerouslySetInnerHTML on the web. */
export interface TextBlock {
  type: "text";
  html: string;
}

/** A `code` block. `language` must be one of the languages the admin schema allows. */
export interface CodeBlock {
  type: "code";
  language: "python" | "bash" | "text";
  code: string;
}

export type Block = TextBlock | CodeBlock;

/**
 * One multiple-choice question.
 *
 * `correct` holds the indices (0-based) of the options in `options` that are
 * right. More than one index makes it a multi-answer question: the student
 * only scores when their chosen set matches exactly (see markAnswers in
 * student/quiz.service.ts).
 */
export interface Question {
  text: string;
  options: string[];
  correct: number[];
}

export interface Quiz {
  title: string;
  passingScore: number;
  maxAttempts: number;
  questions: Question[];
}

export interface Lesson {
  title: string;
  blocks: Block[];
  /** Lesson quizzes are mandatory: the student cannot finish the lesson until they pass. */
  quiz?: Quiz;
}

export interface Module {
  title: string;
  lessons: Lesson[];
  /** With a module quiz, the module does not auto-complete — the student must pass it. */
  quiz?: Quiz;
}

export interface Curriculum {
  /** Identifies the course to rebuild. The course row itself is never created here. */
  courseSlugContains: string;
  modules: Module[];
  /** Course-level quiz. Passing it completes the course and issues the certificate. */
  finalExam?: Quiz;
}

// ─── Small helpers used by the module content files ───────────────────────────

export const text = (html: string): TextBlock => ({ type: "text", html });

export const py = (code: string): CodeBlock => ({
  type: "code",
  language: "python",
  code,
});

export const sh = (code: string): CodeBlock => ({
  type: "code",
  language: "bash",
  code,
});

/** Shown as plain output, not as runnable source. */
export const out = (code: string): CodeBlock => ({
  type: "code",
  language: "text",
  code,
});

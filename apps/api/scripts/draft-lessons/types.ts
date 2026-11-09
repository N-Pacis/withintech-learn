// Draft lessons for modules whose content was lost when the ModuleBlock table
// was dropped (2026-08-09). Each draft targets an existing module by id; the
// loader only ever ADDS a lesson to a module that has none.

/** A `text` block. `html` is rendered with dangerouslySetInnerHTML on the web. */
export interface TextBlock {
  type: "text";
  html: string;
}

/** Must stay within CODE_LANGUAGES in src/routes/admin/lessons.schemas.ts. */
export type CodeLanguage =
  | "html"
  | "css"
  | "javascript"
  | "typescript"
  | "python"
  | "markdown"
  | "text"
  | "bash"
  | "cpp"
  | "yaml";

export interface CodeBlock {
  type: "code";
  language: CodeLanguage;
  code: string;
}

export type Block = TextBlock | CodeBlock;

/**
 * One multiple-choice question. `correct` holds 0-based indices into
 * `options`; more than one makes it multi-answer (exact-set scoring).
 */
export interface QuestionDraft {
  text: string;
  options: string[];
  correct: number[];
}

/**
 * A module quiz, created only when the module has no quiz yet. Existing
 * quizzes are never changed, so students mid-course aren't affected.
 */
export interface QuizDraft {
  title: string;
  passingScore: number;
  maxAttempts: number;
  questions: QuestionDraft[];
}

export interface LessonDraft {
  /** Existing Module.id in production. */
  moduleId: string;
  /** Module title at the time of drafting, used only for reports. */
  moduleTitle: string;
  lessonTitle: string;
  blocks: Block[];
  quiz?: QuizDraft;
}

export interface CourseDraft {
  /** Short key used on the command line (--course <key>). */
  key: string;
  courseSlug: string;
  lessons: LessonDraft[];
}

export const text = (html: string): TextBlock => ({ type: "text", html });

export const code = (language: CodeLanguage, source: string): CodeBlock => ({
  type: "code",
  language,
  code: source.replace(/^\n/, "").replace(/\s+$/, ""),
});

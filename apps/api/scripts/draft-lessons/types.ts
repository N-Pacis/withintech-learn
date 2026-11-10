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

/**
 * An `image` block. `file` is a PNG under scripts/draft-lessons/assets/; the
 * loader uploads it to S3 (blocks/<uuid>.png) on --apply and stores the key.
 */
export interface ImageBlock {
  type: "image";
  file: string;
  caption: string;
}

/** A `playground` block: Sandpack HTML/CSS/JS editor with a live preview. */
export interface PlaygroundBlock {
  type: "playground";
  html: string;
  css: string;
  js: string;
}

export type Block = TextBlock | CodeBlock | ImageBlock | PlaygroundBlock;

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

/** Diagrams carry their own title, so the caption (grey text under the image) defaults to empty. */
export const image = (file: string, caption = ""): ImageBlock => ({
  type: "image",
  file,
  caption,
});

export const playground = (widget: {
  html: string;
  css: string;
  js: string;
}): PlaygroundBlock => ({ type: "playground", ...widget });

const escapeHtml = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * A few lines of code inside a text block (e.g. in a reveal). Tiptap's
 * codeBlock node is off in this app, so each line becomes inline code with a
 * hard break, and leading spaces become non-breaking to keep indentation.
 */
export const codeLines = (source: string): string =>
  `<p>${source
    .replace(/^\n/, "")
    .replace(/\s+$/, "")
    .split("\n")
    .map((line) => `<code>${escapeHtml(line).replace(/^ +/, (sp) => " ".repeat(sp.length))}</code>`)
    .join("<br>")}</p>`;

/** Click-to-expand section in Tiptap's Details markup. */
export const reveal = (summary: string, bodyHtml: string): string =>
  `<details><summary>${summary}</summary><div data-type="detailsContent">${bodyHtml}</div></details>`;

export const code = (language: CodeLanguage, source: string): CodeBlock => ({
  type: "code",
  language,
  code: source.replace(/^\n/, "").replace(/\s+$/, ""),
});

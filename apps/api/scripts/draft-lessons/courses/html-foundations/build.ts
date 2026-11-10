import {
  codeLines,
  image,
  playground,
  reveal,
  text,
  type LessonDraft,
  type QuizDraft,
} from "../../types";

// Every HTML lesson has the same shape: a few lines of explanation, a live
// playground with starter code, a short "Your turn" list, and a revealed
// solution. Students edit the code and see the result immediately.

/** Starter page for the playground (Sandpack vanilla template). */
const page = (body: string): string => `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>My page</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
${body
  .replace(/^\n/, "")
  .replace(/\s+$/, "")
  .split("\n")
  .map((l) => "    " + l)
  .join("\n")}
    <script src="index.js"></script>
  </body>
</html>`;

const baseCss = `body { font-family: system-ui, sans-serif; padding: 16px; line-height: 1.5; }`;

export interface HtmlLessonSpec {
  moduleId: string;
  moduleTitle: string;
  lessonTitle: string;
  /** Short explanation (HTML). */
  intro: string;
  /** Optional diagram under assets/html-foundations/. */
  diagram?: string;
  /** Body markup the student starts from. */
  starter: string;
  /** Extra CSS for the starter (on top of a tiny base). */
  css?: string;
  /** "Your turn" tasks, shown as a numbered list. */
  tasks: string[];
  /** Solution markup, shown in a reveal. */
  solution: string;
  /** Module quiz, only for modules that have none. */
  quiz?: QuizDraft;
}

export const htmlLesson = (spec: HtmlLessonSpec): LessonDraft => ({
  moduleId: spec.moduleId,
  moduleTitle: spec.moduleTitle,
  lessonTitle: spec.lessonTitle,
  blocks: [
    text(spec.intro),
    ...(spec.diagram ? [image(`html-foundations/${spec.diagram}`)] : []),
    text(`<h3>Your turn</h3><ol>${spec.tasks.map((t) => `<li>${t}</li>`).join("")}</ol>`),
    playground({
      html: page(spec.starter),
      css: spec.css ? `${baseCss}\n${spec.css}` : baseCss,
      js: "",
    }),
    text(reveal("Show a solution", codeLines(spec.solution))),
  ],
  quiz: spec.quiz,
});

/** Module quiz defaults used across the platform (70% to pass, 3 attempts). */
export const quiz = (title: string, questions: QuizDraft["questions"]): QuizDraft => ({
  title,
  passingScore: 70,
  maxAttempts: 3,
  questions,
});

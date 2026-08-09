import { curriculum } from "./curriculum";

// Prints the shape of the curriculum: block and question counts per lesson.
// Useful for spotting a lesson that is far longer or thinner than the rest.
const rows: string[] = [];
let totalWords = 0;

curriculum.modules.forEach((mod, mi) => {
  const modQuestions = mod.quiz?.questions.length ?? 0;
  rows.push(`\nM${mi + 1} ${mod.title}  [module test: ${modQuestions} questions]`);

  mod.lessons.forEach((lesson, li) => {
    const textBlocks = lesson.blocks.filter((b) => b.type === "text").length;
    const codeBlocks = lesson.blocks.length - textBlocks;
    const words = lesson.blocks
      .filter((b) => b.type === "text")
      .reduce(
        (n, b) =>
          n + (b as { html: string }).html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length,
        0,
      );
    totalWords += words;
    const q = lesson.quiz?.questions.length ?? 0;
    rows.push(
      `   L${li + 1} ${lesson.title.padEnd(42)} ${String(lesson.blocks.length).padStart(3)} blocks ` +
        `(${textBlocks} text / ${codeBlocks} code) ${String(words).padStart(4)} words  ${q} quiz Q`,
    );
  });
});

console.log(rows.join("\n"));
console.log(`\nFinal exam: ${curriculum.finalExam?.questions.length ?? 0} questions`);
console.log(`Total prose words: ${totalWords.toLocaleString()}`);
console.log(
  `Average per lesson: ${Math.round(totalWords / curriculum.modules.reduce((n, m) => n + m.lessons.length, 0))} words`,
);

// Interactive knowledge check for lessons where the playground isn't a coding
// exercise. Questions live as plain data at the top of index.js; a short
// engine renders them with instant feedback and a one-line explanation.

export interface CheckQuestion {
  q: string;
  options: string[];
  /** 0-based index of the right option. */
  answer: number;
  /** Shown after answering, right or wrong. */
  why: string;
}

const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <h3>Check yourself</h3>
    <div id="quiz"></div>
    <p id="score"></p>
    <script src="index.js"></script>
  </body>
</html>`;

const css = `body { font-family: system-ui, sans-serif; padding: 14px; color: #1f2937; }
h3 { margin: 0 0 10px; color: #3d006b; }
.q { border: 2px solid #e9d5ff; border-radius: 12px; padding: 12px; margin-bottom: 10px; background: #faf5ff; }
.q p { margin: 0 0 8px; font-weight: 600; }
.q button { display: block; width: 100%; text-align: left; margin: 4px 0; padding: 8px 10px; border: 1px solid #d1d5db; border-radius: 8px; background: #fff; font: inherit; cursor: pointer; }
.q button.right { background: #e8f7ee; border-color: #15803d; color: #15803d; }
.q button.wrong { background: #fef2f2; border-color: #dc2626; color: #b91c1c; }
.why { font-size: 13px; color: #374151; margin-top: 6px; }
#score { font-weight: 700; color: #3d006b; }`;

const engine = `let answered = 0, correct = 0;
QUESTIONS.forEach(function (item) {
  const box = document.createElement("div");
  box.className = "q";
  box.innerHTML = "<p></p>";
  box.querySelector("p").textContent = item.q;
  item.options.forEach(function (opt, i) {
    const b = document.createElement("button");
    b.textContent = opt;
    b.onclick = function () {
      if (box.dataset.done) return;
      box.dataset.done = "1";
      answered++;
      if (i === item.answer) correct++;
      b.className = i === item.answer ? "right" : "wrong";
      box.querySelectorAll("button")[item.answer].className = "right";
      const why = document.createElement("div");
      why.className = "why";
      why.textContent = (i === item.answer ? "Correct. " : "Not quite. ") + item.why;
      box.appendChild(why);
      document.getElementById("score").textContent =
        correct + " / " + answered + " correct" + (answered === QUESTIONS.length ? " (refresh to try again)" : "");
    };
    box.appendChild(b);
  });
  document.getElementById("quiz").appendChild(box);
});`;

/** Playground block data for a knowledge check. */
export const knowledgeCheck = (questions: CheckQuestion[]) => ({
  html,
  css,
  js: `// Knowledge check: pick an answer to see if you're right and why.
const QUESTIONS = ${JSON.stringify(questions, null, 2)};

${engine}`,
});

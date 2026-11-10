// Playground exercises (Sandpack vanilla: /index.html + /styles.css + /index.js).
// Each one is real code the student edits and runs: a short function on top,
// a few tests at the bottom that show ✓ / ✗ in the preview.

const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <h3>Tests</h3>
    <ul id="results"></ul>
    <script src="index.js"></script>
  </body>
</html>`;

const css = `body { font-family: system-ui, sans-serif; padding: 12px; }
h3 { margin: 0 0 8px; color: #3d006b; }
ul { list-style: none; padding: 0; margin: 0; }
li { padding: 6px 10px; margin: 4px 0; border-radius: 8px; font: 13px ui-monospace, monospace; }
.pass { background: #e8f7ee; color: #15803d; }
.fail { background: #fef2f2; color: #b91c1c; }`;

const harness = `
// ---- test helpers (no need to edit below) ----
function test(name, fn) {
  const li = document.createElement("li");
  try { fn(); li.className = "pass"; li.textContent = "✓ " + name; }
  catch (e) { li.className = "fail"; li.textContent = "✗ " + name + ": " + e.message; }
  document.getElementById("results").appendChild(li);
}
function expect(actual) {
  return { toBe: function (expected) {
    if (JSON.stringify(actual) !== JSON.stringify(expected))
      throw new Error("expected " + JSON.stringify(expected) + ", got " + JSON.stringify(actual));
  } };
}`;

/** Lesson 5: fix the bug the tests reveal. */
export const debugExercise = {
  html,
  css,
  js: `// Bug report: "Saving 1500.50 RWF records 1500, and typing abc saves NaN."
// Fix parseAmount so every test below passes.
function parseAmount(raw) {
  return parseInt(raw);
}

test("whole numbers", () => expect(parseAmount("1500")).toBe(1500));
test("decimals are kept", () => expect(parseAmount("1500.50")).toBe(1500.5));
test("commas are allowed", () => expect(parseAmount("12,000")).toBe(12000));
test("text is rejected (returns null)", () => expect(parseAmount("abc") === null).toBe(true));
${harness}`,
};

/** Lesson 6: write the missing tests, find the bug, fix it. */
export const testingExercise = {
  html,
  css,
  js: `function totalByCategory(expenses) {
  const totals = {};
  for (const e of expenses) {
    totals[e.category] = (totals[e.category] || 0) + e.amount;
  }
  return totals;
}

test("sums amounts per category", () =>
  expect(totalByCategory([
    { category: "food", amount: 3200 },
    { category: "food", amount: 800 },
  ])).toBe({ food: 4000 }));

// Your turn:
// 1. Add a test: an empty list returns {}.
// 2. Add a test: negative amounts are ignored.
// 3. One of them fails. Fix totalByCategory until everything is green.
${harness}`,
};

/** Lesson 7: refactor without breaking the tests. */
export const refactorExercise = {
  html,
  css,
  js: `// Refactor this: better names, no magic number, same behaviour.
// The tests must stay green after every change.
function f(x) {
  let t = 0;
  for (const a of x) {
    if (a.v > 500000) a.big = true;
    t = t + a.v;
  }
  return t;
}

test("adds all amounts", () => expect(f([{ v: 1000 }, { v: 2500 }])).toBe(3500));
test("empty list is 0", () => expect(f([])).toBe(0));
test("flags large expenses", () => {
  const items = [{ v: 600000 }];
  f(items);
  expect(items[0].big).toBe(true);
});
${harness}`,
};

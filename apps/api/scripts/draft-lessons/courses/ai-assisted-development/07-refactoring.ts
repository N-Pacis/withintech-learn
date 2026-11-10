import { code, codeLines, playground, reveal, text, type LessonDraft } from "../../types";
import { refactorExercise } from "./widgets";

export const lesson: LessonDraft = {
  moduleId: "df136824-1b19-485c-935d-25cd51a6a77b",
  moduleTitle: "Refactoring, Code Review & Improvement Loops",
  lessonTitle: "Refactor safely and get a free code review",
  blocks: [
    text(`
<p>Your tracker works, but <code>main.py</code> is 200 lines of tangled input handling, maths and file I/O. Refactoring by hand is slow and scary. With AI it's fast, as long as you keep tests in the loop. The main value: making large cleanups fast, safe and consistent.</p>
<h3>The safe refactoring loop</h3>
<p><strong>Generate refactor → update tests → run tests → iterate until green.</strong> After every AI refactor, the next step is always to run (or generate) tests to verify behaviour is preserved.</p>
<h3>A good refactoring prompt</h3>
<p>Include the full current code and specific goals:</p>
`),
    code(
      "text",
      `
Act as a principal engineer. Refactor the code below (full file pasted).
Goals:
- Split into storage.py (JSON load/save), models.py (Expense), cli.py (input/output).
- Replace magic numbers with named constants.
- Keep JSON persistence, but add clear error handling for missing/corrupt files.
- Do not change behaviour. List every change you made.
`,
    ),
    text(`
<p>"Act as a principal engineer" helps because the model applies higher standards and deeper reasoning. Because this touches several files, run it in <strong>Cursor Composer or Agent mode</strong>, which is ideal for multi-file refactors and shows a reviewable diff.</p>
<h3>Before → after</h3>
`),
    code(
      "python",
      `
# Before
if amount > 500000:
    print("Warning!")
d = json.load(open("e.json"))

# After
LARGE_EXPENSE_RWF = 500_000
DATA_FILE = Path("expenses.json")

if amount > LARGE_EXPENSE_RWF:
    print(f"Warning: {amount:,} RWF is above your large-expense limit")
expenses = load_expenses(DATA_FILE)   # handles missing/corrupt files
`,
    ),
    text(`
<h3>Your turn: refactor with a safety net</h3>
<p>Rename <code>f</code>, <code>x</code>, <code>t</code>, <code>a</code>, <code>v</code>, and replace <code>500000</code> with a named constant. Run after each change: the tests must stay green. Try asking your AI tool for the refactor, then check it here.</p>
${reveal("Show one possible solution", codeLines(`
const LARGE_EXPENSE_RWF = 500000;

function totalSpent(expenses) {
  let total = 0;
  for (const expense of expenses) {
    if (expense.v > LARGE_EXPENSE_RWF) expense.big = true;
    total += expense.v;
  }
  return total;
}
// Tests still call f(...): add  const f = totalSpent;  or update the tests too.
`))}
`),
    playground(refactorExercise),
    text(`
<h3>AI as a code reviewer</h3>
<p>Before you open a pull request, ask the AI to <strong>rate quality, list issues, and suggest fixes with explanations</strong>:</p>
`),
    code(
      "text",
      `
Review this diff as a strict senior reviewer.
Give a 1-10 quality score, then list issues by severity
(bugs, security, naming, magic numbers, missing tests) with a suggested fix
and a one-line explanation for each.
`,
    ),
    text(`
<p>AI reviewers are good at catching magic numbers and poor naming, missing error handling, duplicated logic and untested branches. They're weaker at knowing your business rules; that part is still yours.</p>
<h3>Improvement loops</h3>
<p>Treat it as a cycle: <strong>review → refine → re-review</strong> until you're satisfied. Each pass is small, and the tests stay green throughout.</p>
<h3>Common mistakes</h3>
<ul>
<li>Accepting a big refactor without running the tests.</li>
<li>Pasting half the file, so the AI "fixes" code it can't see.</li>
<li>Vague goals ("make it better") instead of specific ones.</li>
</ul>
<h3>Try it</h3>
<p>Run the refactoring prompt on your tracker in Composer/Agent mode, run <code>pytest</code>, then ask for a review of the diff. Fix the top two issues and re-review.</p>
${reveal(
  "Show a sample answer",
  `<p>A typical first review of the tracker flags: magic numbers (<code>500000</code>), vague names (<code>d</code>, <code>e</code>), a file opened without <code>with</code>, input parsing mixed with business logic, and no test for the large-expense warning. Fix the first two, re-run <code>pytest</code>, then ask: <em>"Re-review the updated diff. What's left?"</em></p>`,
)}
<h3>Key takeaways</h3>
<ul>
<li>Refactor → test → iterate until green.</li>
<li>Give full code and specific goals; use Composer/Agent mode for multi-file work.</li>
<li>Ask reviews for a score, issues, fixes and explanations.</li>
</ul>
`),
  ],
};

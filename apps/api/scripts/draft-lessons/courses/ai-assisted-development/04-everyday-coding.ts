import { code, playground, codeLines, image, reveal, text, type LessonDraft } from "../../types";
import { knowledgeCheck } from "../../knowledge-check";

export const lesson: LessonDraft = {
  moduleId: "ec897e52-a1f9-4280-b4bf-936ba80921a1",
  moduleTitle: "AI for Everyday Coding & Implementation",
  lessonTitle: "Build the expense tracker feature by feature",
  blocks: [
    text(`
<p>The most common real-world use of AI today is turning natural-language requirements into working code quickly. In this lesson you'll build the core of the <strong>expense tracker</strong>: add, list and save expenses, one feature at a time.</p>
<h3>The loop</h3>
<p>Every feature follows the same workflow: <strong>generating → reviewing → running → iterating</strong> with follow-ups. You never paste code you haven't run.</p>
<h3>Step 1: a data model with type hints</h3>
<p>Always ask for <strong>type hints everywhere</strong>; they make AI output easier to review and catch mistakes early.</p>
`),
    image("ai-assisted-development/feature-loop.png"),
    code(
      "text",
      `
Write a Python dataclass Expense with: amount (float, RWF), category (str),
note (str), date (datetime.date). Add type hints everywhere.
Constraints: standard library only. Format: code only.
`,
    ),
    text(`
<h3>Step 2: persistence in a JSON file</h3>
<p>Keep it simple: save and load data to a JSON file. When you ask for a feature, include <strong>clear constraints, desired libraries, error handling and output format</strong>:</p>
`),
    code(
      "python",
      `
import json
from dataclasses import asdict
from datetime import date
from pathlib import Path

DATA_FILE = Path("expenses.json")

def save_expenses(expenses: list["Expense"]) -> None:
    """Write all expenses to DATA_FILE as JSON."""
    rows = [asdict(e) | {"date": e.date.isoformat()} for e in expenses]
    DATA_FILE.write_text(json.dumps(rows, indent=2))

def load_expenses() -> list["Expense"]:
    """Load expenses; return [] if the file is missing or corrupt."""
    if not DATA_FILE.exists():
        return []
    try:
        rows = json.loads(DATA_FILE.read_text())
    except json.JSONDecodeError:
        return []
    return [Expense(**r | {"date": date.fromisoformat(r["date"])}) for r in rows]
`,
    ),
    text(`
<h3>Step 3: let comments drive Copilot</h3>
<p>In comment-driven development, detailed docstrings or descriptive comments right above the code block trigger the best inline suggestions. Write the docstring for <code>add_expense()</code> and let Copilot fill the body.</p>
<h3>Step 4: multi-file changes</h3>
<p>When a change spans files (move storage into <code>storage.py</code>, update imports in <code>main.py</code>, add tests), use <strong>Cursor Composer or Agent mode</strong>. It generates and applies changes across multiple files from one prompt, and shows you a diff to accept.</p>
<h3>When it almost works</h3>
<p>Don't rewrite it yourself and don't start over. Paste the error message and the code back to AI with <em>"Fix this bug where…"</em>:</p>
`),
    code(
      "text",
      `
Fix this bug where load_expenses() crashes with
TypeError: Expense.__init__() got an unexpected keyword argument 'id'
when expenses.json has an extra "id" field. Keep unknown fields ignored.
`,
    ),
    text(`
<h3>Why small steps win</h3>
<p>Incremental prompting (feature by feature) beats one giant prompt because you can verify each piece, catch issues early, and guide the AI better. A 300-line answer to a giant prompt hides its bugs.</p>
<h3>Try it</h3>
<p>Add a <code>summary</code> command that prints the total per category for the current month. Use the loop: prompt with constraints → read → run with three sample expenses → follow up until the output is right.</p>
${reveal(
  "Show a sample answer",
  `<p>A prompt that works: <em>"Add summary_by_category(expenses, year, month) that returns a dict of totals for that month. Use type hints, ignore other months, return {} when empty. Then add a 'summary' CLI command that prints one line per category, sorted by amount."</em></p>
${codeLines(`
$ python main.py summary
food        4,000 RWF
transport   2,300 RWF
`)}
<p>Check it with an expense from last month too: it must not be counted.</p>`,
)}
<h3>Key takeaways</h3>
<ul>
<li>Generate → review → run → iterate, one feature at a time.</li>
<li>Include constraints, libraries, error handling and format in every feature prompt.</li>
<li>Docstrings drive Copilot; Composer/Agent mode handles multi-file changes.</li>
<li>AI handles implementation speed so you can focus on high-level design, logic and validation.</li>
</ul>
`),
    playground(knowledgeCheck([
          {
                "q": "AI code almost works but crashes on one input. Next step?",
                "options": [
                      "Start a new chat from scratch",
                      "Paste the error + code: \"Fix this bug where…\"",
                      "Rewrite it all by hand"
                ],
                "answer": 1,
                "why": "Give the AI the exact failure and iterate."
          },
          {
                "q": "Why build feature by feature instead of one giant prompt?",
                "options": [
                      "It uses fewer tokens",
                      "You can verify each piece and catch issues early",
                      "AI can't write long code"
                ],
                "answer": 1,
                "why": "Small steps are easy to review and debug."
          },
          {
                "q": "A change touches storage.py, main.py and tests. Best tool?",
                "options": [
                      "Inline completion",
                      "Cursor Composer / Agent mode",
                      "Copy-paste between chats"
                ],
                "answer": 1,
                "why": "Composer/Agent mode edits several files from one prompt."
          }
    ])),
  ],
};

import { code, playground, codeLines, reveal, text, type LessonDraft } from "../../types";
import { knowledgeCheck } from "../../knowledge-check";

export const lesson: LessonDraft = {
  moduleId: "63fffe22-ca04-4886-8ce8-23d45cab5844",
  moduleTitle: "Setting Up Your AI-Powered Development Environment",
  lessonTitle: "Set up VS Code, Copilot and Cursor in 20 minutes",
  blocks: [
    text(`
<p>Good tools remove friction. In this lesson you'll set up an editor with AI built in, make sure Python runs, and prove the whole thing works by having the AI write and run a small script.</p>
<h3>Option 1 (easiest start): VS Code + GitHub Copilot</h3>
<ol>
<li>Install <strong>VS Code</strong> and the <strong>Python</strong> extension.</li>
<li>Install the <strong>GitHub Copilot</strong> extension (Copilot Chat comes with it).</li>
<li>Activate it by <strong>signing in with your GitHub account</strong> when VS Code prompts you.</li>
</ol>
<p>Optional: <strong>Tabnine</strong> is a privacy-focused autocomplete extension (it can run models locally) if your company restricts cloud tools.</p>
<h3>Option 2: Cursor</h3>
<p><strong>Cursor</strong> is a VS Code fork with deeper built-in AI: Composer and Agent mode can edit several files from one prompt. In 2026 comparisons it often excels at multi-file edits and understanding a whole project. Your VS Code extensions and settings import in one click.</p>
<ul>
<li><strong>Cmd+K</strong> (Mac) / <strong>Ctrl+K</strong> (Windows): quick AI edit/chat on the selected code.</li>
<li><strong>Cmd+L</strong> / <strong>Ctrl+L</strong>: open the chat panel.</li>
</ul>
<p>Give Cursor project-wide instructions with a <code>.cursorrules</code> file in the project root:</p>
`),
    code(
      "text",
      `
# .cursorrules
You are helping build a Python 3.12 CLI app.
- Use type hints everywhere.
- Prefer the standard library; ask before adding dependencies.
- Every new function gets a pytest test in tests/.
- Keep functions under 30 lines.
`,
    ),
    text(`
<h3>Don't skip the Python setup</h3>
<p>AI writes the code, but you still need a working Python environment <strong>to run and test the code AI generates</strong>. Use one virtual environment per project:</p>
`),
    code(
      "bash",
      `
python3 --version            # 3.10+ is fine, 3.12 recommended
mkdir expense-tracker && cd expense-tracker
python3 -m venv .venv
source .venv/bin/activate    # Windows: .venv\\Scripts\\activate
pip install pytest
`,
    ),
    text(`
<p><strong>Hardware:</strong> the models run in the cloud, but editors, language servers and tests add up. <strong>16GB+ RAM</strong> keeps things smooth.</p>
<h3>Try it: verify your setup</h3>
<p>The goal of this exercise is to verify your AI setup generates and runs simple Python code. Create <code>main.py</code>, type the comment below, and let the AI complete it (Tab in Copilot, or Cmd/Ctrl+K in Cursor):</p>
`),
    code(
      "python",
      `
# Ask the user for an amount in RWF and a category, then print
# "Saved: <amount> RWF for <category>". Reject non-numeric amounts.
`,
    ),
    text(`
<p>Run <code>python main.py</code>, type a valid amount, then try <code>abc</code>. If the error case is handled, your setup works. This file is the start of the <strong>expense tracker</strong> we'll grow through the course.</p>
${reveal(
  "Show a sample answer",
  `<p>Your AI's version may differ, but it should loop until the amount is a number:</p>
${codeLines(`
while True:
    raw = input("Amount (RWF): ")
    try:
        amount = float(raw)
        break
    except ValueError:
        print("Please enter a number, e.g. 1500")
category = input("Category: ")
print(f"Saved: {amount:,.0f} RWF for {category}")
`)}
<p>If nothing appeared when you typed the comment, check you're signed in to Copilot (bottom-right status bar) and that the <code>.venv</code> interpreter is selected.</p>`,
)}
<h3>Common mistakes</h3>
<ul>
<li>Installing Copilot but never signing in. Nothing happens until you do.</li>
<li>Running code with the system Python instead of the project's <code>.venv</code>.</li>
<li>No project instructions, so the AI keeps guessing your style. Add <code>.cursorrules</code> (or Copilot's <code>.github/copilot-instructions.md</code>).</li>
</ul>
<h3>Key takeaways</h3>
<ul>
<li>VS Code + GitHub Copilot is the easiest start; Cursor goes deeper on multi-file work.</li>
<li>Cmd/Ctrl+K is Cursor's quick edit; <code>.cursorrules</code> sets project rules.</li>
<li>A working Python environment is what lets you run and test AI output.</li>
</ul>
`),
    playground(knowledgeCheck([
          {
                "q": "You installed Copilot but nothing is suggested. First thing to check?",
                "options": [
                      "Reinstall VS Code",
                      "That you signed in with GitHub",
                      "Buy more RAM"
                ],
                "answer": 1,
                "why": "Copilot stays inactive until you sign in."
          },
          {
                "q": "Where do you put project-wide instructions for Cursor?",
                "options": [
                      ".cursorrules",
                      "README.md",
                      "settings.json"
                ],
                "answer": 0,
                "why": "Cursor reads .cursorrules from the project root."
          },
          {
                "q": "Why set up a virtual environment if the AI writes the code?",
                "options": [
                      "AI refuses without it",
                      "To run and test the code it generates",
                      "It's only for non-AI projects"
                ],
                "answer": 1,
                "why": "You still have to run and test every suggestion."
          }
    ])),
  ],
};

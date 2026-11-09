import { code, text, type LessonDraft } from "../../types";

export const lesson: LessonDraft = {
  moduleId: "eeaec958-089f-4dd1-8137-36d318587cda",
  moduleTitle: "Documentation, Explaining & Maintaining Codebases",
  lessonTitle: "Docs in minutes: READMEs, docstrings and changelogs",
  blocks: [
    text(`
<p>Nobody likes writing docs, and nobody can maintain a project without them. AI flips the economics: clear, consistent documentation in minutes instead of hours.</p>
<h3>A README from your project files</h3>
<p>The quickest route to a professional README: feed the project files to AI and ask for structured README content.</p>
`),
    code(
      "text",
      `
Here are main.py, storage.py, models.py and requirements.txt.
Write a README.md with: one-line description, features, install,
usage examples (with sample output), running tests, project structure,
and a License section (MIT). Keep it under 120 lines.
`,
    ),
    text(`
<h3>Docstrings everywhere</h3>
<p>For a whole module, start your prompt with <em>"Add a module-level docstring and document every public item."</em> Ask for <strong>Google or NumPy style</strong>, which are modern and widely supported by Python tools (IDEs, Sphinx, mkdocstrings).</p>
`),
    code(
      "python",
      `
def monthly_total(expenses: list[Expense], year: int, month: int) -> float:
    """Return the total amount spent in a given month.

    Args:
        expenses: All recorded expenses.
        year: Four-digit year, e.g. 2026.
        month: Month number from 1 to 12.

    Returns:
        Sum of amounts in RWF for that month; 0.0 if none.

    Raises:
        ValueError: If month is not between 1 and 12.
    """
`,
    ),
    text(`
<p>Inline comments are different: good ones explain non-obvious logic and design decisions (<em>why</em>), not what each line obviously does.</p>
<h3>Understand unfamiliar code</h3>
<p>Inherited a file nobody understands? Paste the full code block and add <em>"explain like I'm a beginner"</em>. Then ask follow-ups: "What happens if the file is empty?", "Which function would I change to add currencies?"</p>
<h3>Changelogs from git</h3>
<p>AI is especially strong at turning git commits or diffs into clear changelog and release-note entries:</p>
`),
    code(
      "bash",
      `
git log --oneline v1.0..HEAD > changes.txt
# Prompt: "Turn these commits into release notes grouped by
#  Added / Fixed / Changed, written for end users."
`,
    ),
    text(`
<h3>APIs document themselves</h3>
<p>In FastAPI projects, AI can generate detailed OpenAPI docstrings (summaries, parameter descriptions, response examples) that show up automatically in the Swagger docs at <code>/docs</code>.</p>
<h3>Keep old code alive</h3>
<p>For legacy code, ask the AI to "suggest modernization steps": type hints, replacing deprecated APIs, splitting large functions. That's how you keep legacy code maintainable long-term.</p>
<h3>Try it</h3>
<p>Generate a README (MIT license) for your expense tracker, then add Google-style docstrings to <code>storage.py</code>. Read both and correct anything the AI got wrong; it's your documentation.</p>
<h3>Key takeaways</h3>
<ul>
<li>Feed files in, get a structured README out.</li>
<li>Google/NumPy docstrings; comments explain why.</li>
<li>Commits → changelogs; FastAPI → Swagger docs; legacy → modernization plan.</li>
</ul>
`),
  ],
};

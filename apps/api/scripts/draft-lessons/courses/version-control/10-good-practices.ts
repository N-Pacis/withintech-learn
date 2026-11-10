import { code, playground, reveal, text, type LessonDraft } from "../../types";
import { knowledgeCheck } from "../../knowledge-check";

export const lesson: LessonDraft = {
  moduleId: "fc5e40ff-cc90-4920-a64c-1dfffd13215a",
  moduleTitle: "Good Practices, Common Mistakes, .gitignore, README basics",
  lessonTitle: "Habits that keep a repo healthy",
  blocks: [
    text(`<h3>.gitignore: never commit these</h3>`),
    code(
      "text",
      `
# .gitignore
node_modules/
__pycache__/
.venv/
.env
*.log
.DS_Store
`,
    ),
    text(`
<p>One of the worst things you can commit to a public repo: <strong>API keys, passwords or .env files</strong>. If a file was already committed, adding it to <code>.gitignore</code> ignores it from now on, but past versions stay in history (rotate any leaked secret).</p>
<h3>Commit messages</h3>
<p>First line around <strong>50–72 characters</strong>: <em>Add login form validation</em>. Check exactly what you're about to commit with <code>git status</code> first.</p>
<h3>README.md</h3>
`),
    code(
      "markdown",
      `
# My Site
Personal portfolio built with HTML and CSS.

## Installation / Usage
git clone https://github.com/you/my-site.git
open index.html
`,
    ),
    text(`
<p>GitHub shows the README as the main page of the repository.</p>
<h3>Team habits</h3>
<ul>
<li>Don't commit directly on <code>main</code> in a team: it can break the stable version everyone relies on. Use branches + PRs.</li>
<li>Pull from the remote before pushing.</li>
<li>Never manually edit or delete files inside <code>.git</code>.</li>
</ul>
<h3>Try it</h3>
<p>Add a <code>.gitignore</code> and a README to your project, commit, push, and check GitHub's front page.</p>
${reveal(
  "Show the answer",
  `<p><code>git status</code> should no longer list ignored files like <code>.env</code>. On GitHub, the README renders under the file list.</p>`,
)}
`),
    playground(
      knowledgeCheck([
        { q: "Which file should NEVER be pushed to a public repo?", options: ["README.md", ".env with API keys", "index.html"], answer: 1, why: "Secrets in history can be found and abused." },
        { q: "You add .env to .gitignore after committing it. Is it gone from history?", options: ["Yes", "No, past versions stay in history"], answer: 1, why: ".gitignore only affects untracked files from now on." },
        { q: "Ideal length of a commit message's first line?", options: ["5 characters", "Around 50–72 characters", "As long as possible"], answer: 1, why: "Short and specific reads well in git log." },
      ]),
    ),
  ],
};

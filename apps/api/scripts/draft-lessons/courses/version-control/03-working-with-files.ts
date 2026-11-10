import { code, playground, reveal, text, type LessonDraft } from "../../types";
import { knowledgeCheck } from "../../knowledge-check";

export const lesson: LessonDraft = {
  moduleId: "6ff49380-7d86-4257-860a-247606fd5340",
  moduleTitle: "Working with Files – modify, stage, commit, git log basics",
  lessonTitle: "Edit, review, commit: the daily loop",
  blocks: [
    code(
      "bash",
      `
# edit hello.txt, then:
git status
# Changes not staged for commit:
#   modified:   hello.txt

git diff                 # line-by-line changes you have NOT staged yet
# - Hello
# + Hello, Kigali!

git add hello.txt        # copies the current version into the staging area
git commit -m "Greet Kigali"
`,
    ),
    text(`
<ul>
<li>New files are <strong>not</strong> tracked automatically. "Untracked files" means Git has never seen the file: <code>git add</code> it to start tracking.</li>
<li>Stage, then edit again → only the version from the moment you ran <code>git add</code> gets committed.</li>
<li>Delete a tracked file: <code>git rm file</code>, or delete it then <code>git add file</code>.</li>
</ul>
<h3>Read the history</h3>
`),
    code(
      "bash",
      `
git log --oneline
# 3f2a1c9 Greet Kigali
# a81b0e2 Add hello page

git log -p                       # messages + full diff of each commit
git log --oneline --graph        # draws branches and merge points (later lessons)
`,
    ),
    text(`
<h3>Try it</h3>
<p>Make three small commits, then run <code>git log --oneline</code> and <code>git log -p</code>. Delete a file with <code>git rm</code> and commit.</p>
${reveal(
  "Show the answer",
  `<p><code>--oneline</code> shows one short line per commit; <code>-p</code> adds the exact lines added (+) and removed (−). After <code>git rm old.txt</code>, <code>git status</code> shows <code>deleted: old.txt</code> under "Changes to be committed".</p>`,
)}
`),
    playground(
      knowledgeCheck([
        { q: "You edited a tracked file but haven't staged it. Which command shows the exact changed lines?", options: ["git log", "git diff", "git status -v"], answer: 1, why: "git diff shows unstaged changes line by line." },
        { q: "You want a compact list of past commits.", options: ["git log --oneline", "git history", "git show all"], answer: 0, why: "--oneline prints one line per commit." },
        { q: "Git starts tracking new files automatically.", options: ["True", "False"], answer: 1, why: "New files stay untracked until you git add them." },
      ]),
    ),
  ],
};

import { code, playground, reveal, text, type LessonDraft } from "../../types";
import { knowledgeCheck } from "../../knowledge-check";

export const lesson: LessonDraft = {
  moduleId: "f473fc44-1088-4bc9-a622-14272682ff30",
  moduleTitle: "Undoing Changes – restore, reset soft/mixed, checkout (safe beginner subset)",
  lessonTitle: "Undo safely: restore, reset, checkout",
  blocks: [
    text(`<p>Pick the row that matches your mistake:</p>
<table>
<tr><th>Mistake</th><th>Command</th><th>Your changes</th></tr>
<tr><td>Messed up a file, not staged</td><td><code>git restore hello.txt</code></td><td>Replaced with the last committed version (gone)</td></tr>
<tr><td>Staged a file by mistake</td><td><code>git restore --staged hello.txt</code></td><td>Kept, just unstaged</td></tr>
<tr><td>Bad last commit, want to re-stage properly</td><td><code>git reset --soft HEAD~1</code></td><td>Kept in the staging area</td></tr>
<tr><td>Undo last commit and unstage</td><td><code>git reset HEAD~1</code> (default <code>--mixed</code>)</td><td>Kept in the working directory, unstaged</td></tr>
<tr><td>⚠️ <code>git reset --hard HEAD~1</code></td><td>(not for beginners)</td><td>Working directory and staging reset: local changes permanently lost</td></tr>
</table>
<p><code>git restore .</code> discards working-directory changes; <code>git reset .</code> only unstages files.</p>
<h3>Look at an old version</h3>`),
    code(
      "bash",
      `
git log --oneline
# 3f2a1c9 Greet Kigali
# a81b0e2 Add hello page

git checkout a81b0e2      # "detached HEAD": a read-only look at that commit
git checkout main         # back to normal
`,
    ),
    text(`
<h3>Try it</h3>
<p>Commit a typo, then fix it with <code>git reset --soft HEAD~1</code>: correct the file, <code>git add</code>, and commit again.</p>
${reveal(
  "Show the answer",
  `<p>After <code>reset --soft</code>, <code>git log --oneline</code> no longer shows the bad commit, and <code>git status</code> shows its changes still staged. Fix, <code>git add</code>, <code>git commit -m "…"</code>: one clean commit.</p>`,
)}
`),
    playground(
      knowledgeCheck([
        { q: "You staged secrets.txt by mistake. Keep your edits but unstage it:", options: ["git restore secrets.txt", "git restore --staged secrets.txt", "git reset --hard"], answer: 1, why: "--staged only removes it from the staging area." },
        { q: "After git reset --soft HEAD~1, the undone commit's changes are…", options: ["Deleted", "Still staged", "Pushed"], answer: 1, why: "--soft moves the branch back and keeps changes staged." },
        { q: "You ran git checkout <old-hash>. How do you get back?", options: ["git checkout main", "git reset --hard", "Delete .git"], answer: 0, why: "Switch back to your branch to leave detached HEAD." },
      ]),
    ),
  ],
};

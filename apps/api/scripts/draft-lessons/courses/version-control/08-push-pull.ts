import { code, image, playground, reveal, text, type LessonDraft } from "../../types";
import { knowledgeCheck } from "../../knowledge-check";

export const lesson: LessonDraft = {
  moduleId: "df95914b-d9b2-4114-aee4-316081d7ad6a",
  moduleTitle: "Push & Pull – connect local ↔ remote, push, pull/fetch",
  lessonTitle: "Push, fetch and pull without surprises",
  blocks: [
    image("version-control/local-remote.png"),
    code(
      "bash",
      `
git push                 # send new local commits that the remote doesn't have yet
# Everything up-to-date    (nothing new to send)

git push
# ! [rejected] main -> main (fetch first)   the remote has commits you don't

git fetch origin         # download, don't merge. New commits land in origin/main
git log --all --oneline  # inspect them first
git merge origin/main    # then merge

git pull                 # shortcut: git fetch + git merge
`,
    ),
    text(`
<ul>
<li>After <code>git fetch</code>, new commits live in <strong>remote-tracking branches</strong> like <code>origin/main</code> until you merge them.</li>
<li><strong>Habit:</strong> <code>git pull</code> before you start work and before you push.</li>
<li>First push of a branch: <code>-u</code> (or <code>--set-upstream</code>) sets up tracking.</li>
</ul>
<h3>Try it</h3>
<p>Edit a file on GitHub's website and commit there. Then, locally, commit something and try <code>git push</code>.</p>
${reveal(
  "Show what happens",
  `<p>The push is rejected because GitHub has a commit you don't. Run <code>git pull</code> (fetch + merge), then <code>git push</code> succeeds.</p>`,
)}
`),
    playground(
      knowledgeCheck([
        { q: "You want to see teammates' new commits WITHOUT changing your branch yet.", options: ["git pull", "git fetch", "git push"], answer: 1, why: "fetch downloads into origin/main and doesn't merge." },
        { q: "git pull is a shortcut for…", options: ["git fetch + git merge", "git push + git fetch", "git clone"], answer: 0, why: "Pull fetches and then merges." },
        { q: "Your push is rejected (fetch first). What now?", options: ["git push --force", "git pull, then git push", "Delete the repo"], answer: 1, why: "Get the remote's commits first, then push." },
      ]),
    ),
  ],
};

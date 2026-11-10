import { code, playground, reveal, text, type LessonDraft } from "../../types";
import { knowledgeCheck } from "../../knowledge-check";

export const lesson: LessonDraft = {
  moduleId: "c87598e7-1023-493c-962d-d61de54cdb81",
  moduleTitle: "Branching Basics – create, switch, list branches",
  lessonTitle: "Branches: try ideas without breaking main",
  blocks: [
    text(`<p>A branch lets you work on a feature or fix without affecting the main code. Commit on <code>feature/…</code>; <code>main</code> stays pointing at the same commit it was on.</p>`),
    code(
      "bash",
      `
git branch                         # list local branches, * = current
# * main

git checkout -b feature/add-user-profile-page   # create + switch in one step
# (same as: git switch -c feature/add-user-profile-page)

echo "<h1>Profile</h1>" > profile.html
git add . && git commit -m "Add profile page"

git switch main                    # profile.html disappears from your folder
git switch feature/add-user-profile-page   # ...and comes back
git switch bugfix/header           # switch to another existing branch

git branch -d old-branch           # delete a branch once it's merged
`,
    ),
    text(`
<ul>
<li>Switching updates your files to match the branch: files that only exist on the other branch disappear from the working directory.</li>
<li>Uncommitted changes that would be overwritten? Git <strong>prevents the switch</strong> and warns you. Commit (or restore) first.</li>
<li>Name branches by purpose: <code>feature/add-user-profile-page</code>, <code>bugfix/header</code>.</li>
</ul>
<h3>Try it</h3>
<p>Create <code>feature/footer</code>, commit a <code>footer.html</code>, switch back to <code>main</code> and run <code>ls</code>.</p>
${reveal(
  "Show the answer",
  `<p><code>footer.html</code> isn't there on <code>main</code>. <code>git branch</code> shows both branches with <code>*</code> on main. Switch back and it reappears.</p>`,
)}
`),
    playground(
      knowledgeCheck([
        { q: "Create a branch AND switch to it in one command:", options: ["git branch -s new", "git checkout -b new", "git new branch"], answer: 1, why: "checkout -b (or switch -c) creates and switches." },
        { q: "You commit 3 times on feature. Where is main?", options: ["Moved with you", "Still on its old commit", "Deleted"], answer: 1, why: "Only the current branch moves when you commit." },
        { q: "In git branch output, the current branch is marked with…", options: ["#", "*", "→"], answer: 1, why: "An asterisk marks where you are." },
      ]),
    ),
  ],
};

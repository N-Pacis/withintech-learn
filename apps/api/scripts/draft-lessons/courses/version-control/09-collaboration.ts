import { code, image, playground, reveal, text, type LessonDraft } from "../../types";
import { knowledgeCheck } from "../../knowledge-check";

export const lesson: LessonDraft = {
  moduleId: "b81392ee-6ac8-41b6-9e79-44d17d3b4018",
  moduleTitle: "Collaboration Workflow – fork, clone, pull request basics",
  lessonTitle: "Contribute to someone else's project",
  blocks: [
    image("version-control/fork-pr.png"),
    code(
      "bash",
      `
# 1. Click "Fork" on GitHub: your own copy under your account
git clone https://github.com/you/project.git && cd project
git remote add upstream https://github.com/original/project.git

# 2. Sync before starting, so you build on the latest code
git pull upstream main

# 3. Work on a branch and push it to your fork
git switch -c fix/typo-in-readme
git commit -am "Fix typo in README"
git push -u origin fix/typo-in-readme

# 4. On GitHub: "Compare & pull request"  (base = branch you want it merged into)
# 5. After merge: tidy up
git switch main && git branch -d fix/typo-in-readme
`,
    ),
    text(`
<p>Anyone with write access to the original repo can merge your pull request. Then delete the feature branch locally and on your fork.</p>
<h3>Try it</h3>
<p>Fork a classmate's repo, fix one thing on a branch, and open a pull request.</p>
${reveal(
  "Show a checklist",
  `<p>Fork → clone → sync with upstream → branch → commit → push to your fork → open PR with a clear title and what you changed → respond to review → delete the branch after merge.</p>`,
)}
`),
    playground(
      knowledgeCheck([
        { q: "Forking a repository…", options: ["Deletes the original", "Creates your own copy under your account", "Merges your code"], answer: 1, why: "A fork is your copy on GitHub." },
        { q: "In a pull request, the base branch is…", options: ["Your feature branch", "The branch you want your changes merged into", "Always develop"], answer: 1, why: "Base receives the changes; compare is yours." },
        { q: "Before starting work on your fork you should…", options: ["Sync with upstream", "Delete main", "Force push"], answer: 0, why: "Syncing avoids building on outdated code." },
      ]),
    ),
  ],
};

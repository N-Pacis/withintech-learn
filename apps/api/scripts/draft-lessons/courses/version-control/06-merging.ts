import { code, image, playground, reveal, text, type LessonDraft } from "../../types";
import { knowledgeCheck } from "../../knowledge-check";

export const lesson: LessonDraft = {
  moduleId: "a72b92e3-6bb4-4b4b-b2d6-b5664cabee8c",
  moduleTitle: "Merging Branches – simple fast-forward & merge conflicts intro",
  lessonTitle: "Merging: fast-forward, merge commits and conflicts",
  blocks: [
    image("version-control/branch-merge.png"),
    code(
      "bash",
      `
git switch main                 # be on the branch that RECEIVES the changes
git merge feature/footer
# Fast-forward                   main had no new commits: pointer just moves, no new commit

git merge feature/header -m "Merge header work"
# Merge made by the 'ort' strategy.   both moved: a merge commit with two parents

git log --oneline --graph --decorate   # see branches and merge points
git branch -d feature/footer           # tidy up after merging
`,
    ),
    text(`<h3>When both sides changed the same lines: a conflict</h3>`),
    code(
      "text",
      `
<<<<<<< HEAD
<h1>Welcome to WithinTech</h1>
=======
<h1>Welcome to WithinTech Learn</h1>
>>>>>>> feature/header
`,
    ),
    text(`
<p>The markers show the start and end of the conflicting section. Keep what you want, delete the markers, then <code>git add &lt;file&gt;</code> followed by <code>git commit</code>.</p>
<p><strong>Fewer conflicts:</strong> merge or integrate small changes often.</p>
<h3>Try it</h3>
<p>Change the same line of <code>index.html</code> on two branches, merge them, resolve the conflict.</p>
${reveal(
  "Show the steps",
  `<p>1. <code>git merge feature/x</code> → CONFLICT. 2. Open the file, keep one heading, delete <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code>, <code>=======</code>, <code>&gt;&gt;&gt;&gt;&gt;&gt;&gt;</code>. 3. <code>git add index.html</code> 4. <code>git commit</code>. <code>git log --oneline --graph</code> now shows the merge.</p>`,
)}
`),
    playground(
      knowledgeCheck([
        { q: "main got no new commits since you branched. git merge feature will…", options: ["Create a merge commit", "Fast-forward main to feature's tip", "Fail"], answer: 1, why: "Nothing to combine, so Git just moves the pointer." },
        { q: "A merge commit has…", options: ["One parent", "Two parents", "No parents"], answer: 1, why: "It joins two lines of history." },
        { q: "You fixed the conflict markers. Next?", options: ["git push", "git add <file> then git commit", "git merge --again"], answer: 1, why: "Stage the resolved file, then commit to finish the merge." },
      ]),
    ),
  ],
};

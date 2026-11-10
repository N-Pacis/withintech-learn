import { code, image, playground, reveal, text, type LessonDraft } from "../../types";
import { knowledgeCheck } from "../../knowledge-check";

export const lesson: LessonDraft = {
  moduleId: "f7ce86ec-870b-4cf1-a715-d9e135023580",
  moduleTitle: "Your First Local Repository – init, status, add, commit",
  lessonTitle: "Your first repository: init, status, add, commit",
  blocks: [
    image("version-control/three-areas.png"),
    code(
      "bash",
      `
mkdir my-site && cd my-site
git init
# Initialized empty Git repository in .../my-site/.git/

echo "Hello" > hello.txt
git status
# Untracked files:
#   hello.txt

git add hello.txt          # or: git add .  (all new + changed files)
git status
# Changes to be committed:
#   new file:   hello.txt

git commit -m "Add hello page"
git status
# nothing to commit, working tree clean
`,
    ),
    text(`
<ul>
<li><code>git init</code> creates a hidden <code>.git</code> folder that stores everything: the full commit history, staging data, configuration and branches.</li>
<li><code>git add</code> moves the <em>current version</em> of a file into the staging area. Edit it again after adding, and only the version at the time of <code>git add</code> is committed.</li>
<li><code>git commit</code> without <code>-m</code> opens a text editor for a longer message.</li>
<li>Unsure what's happening? <code>git status</code>. It's always safe.</li>
</ul>
<p><strong>Good message:</strong> <em>Add login page with validation and error messages</em>. <strong>Bad:</strong> <em>stuff</em>, <em>fix</em>, <em>update</em>.</p>
<h3>Try it</h3>
<p>Run the commands above. Then edit <code>hello.txt</code>, <code>git add</code> it, edit it <em>again</em>, and commit. What does <code>git status</code> show afterwards?</p>
${reveal(
  "Show the answer",
  `<p>The second edit is still "modified": only the version you staged was committed. Run <code>git add hello.txt</code> and commit again to save it.</p>`,
)}
`),
    playground(
      knowledgeCheck([
        { q: "You just created notes.txt in a repo. git status says…", options: ["modified: notes.txt", "Untracked files: notes.txt", "nothing to commit"], answer: 1, why: "New files are untracked until you git add them." },
        { q: "Which command stages every new and changed file here?", options: ["git commit .", "git add .", "git stage all"], answer: 1, why: "git add . stages everything in the current directory." },
        { q: "Best commit message?", options: ["update", "Add login page with validation", "asdf"], answer: 1, why: "Say what changed and why, in a short line." },
      ]),
    ),
  ],
};

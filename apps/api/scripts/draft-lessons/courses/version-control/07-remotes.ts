import { code, playground, reveal, text, type LessonDraft } from "../../types";
import { knowledgeCheck } from "../../knowledge-check";

export const lesson: LessonDraft = {
  moduleId: "71eb88b7-575c-4306-ac48-8a7717f33c62",
  moduleTitle: "Remote Repositories – GitHub account, create repo, clone",
  lessonTitle: "Remotes: put your repo on GitHub",
  blocks: [
    text(`<p>A remote repository is a central hub for your project's code. By convention the main remote is called <strong>origin</strong>.</p>
<h3>Option A: start on GitHub, then clone (easiest)</h3>`),
    code(
      "bash",
      `
# create an empty repo on github.com, then:
git clone https://github.com/you/my-site.git
cd my-site
git branch            # * main  (clone puts you on main)
`,
    ),
    text(`<h3>Option B: connect an existing local repo</h3>`),
    code(
      "bash",
      `
git remote add origin https://github.com/you/my-site.git
git push -u origin main     # first push: -u sets the upstream, later just "git push"
git fetch                   # get the latest changes from GitHub (doesn't merge yet)
`,
    ),
    text(`
<p>After pushing, your commits and files appear on the repository page on GitHub.</p>
<p><strong>Passwords don't work for pushing</strong> (since 2021): use a <strong>Personal Access Token (PAT)</strong> or an <strong>SSH key</strong>.</p>
<h3>Try it</h3>
<p>Create a repo on GitHub, clone it, add a README, commit and push.</p>
${reveal(
  "Show the commands",
  `<p><code>git clone …</code> → <code>echo "# My site" &gt; README.md</code> → <code>git add . &amp;&amp; git commit -m "Add README"</code> → <code>git push</code>. Refresh the GitHub page: the README shows on the front page.</p>`,
)}
`),
    playground(
      knowledgeCheck([
        { q: "The default name for your main remote is…", options: ["github", "origin", "upstream"], answer: 1, why: "Git calls the cloned or added remote 'origin' by convention." },
        { q: "What does -u do in git push -u origin main?", options: ["Undo the push", "Sets upstream so later pushes just need git push", "Uploads all branches"], answer: 1, why: "It links local main to origin/main." },
        { q: "GitHub rejects your password when pushing. Use…", options: ["A longer password", "A Personal Access Token or SSH key", "git push --force"], answer: 1, why: "GitHub requires tokens or SSH keys for Git operations." },
      ]),
    ),
  ],
};

import { code, playground, reveal, text, type LessonDraft } from "../../types";
import { knowledgeCheck } from "../../knowledge-check";

export const lesson: LessonDraft = {
  moduleId: "a05d6d0d-52d8-4c45-88ec-0cd29aff7863",
  moduleTitle: "What is Version Control? Why Git? Installing Git",
  lessonTitle: "Git in 10 minutes: what it is and how to set it up",
  blocks: [
    text(`
<p><code>final.html</code>, <code>final-v2.html</code>, <code>final-REALLY.html</code>… A <strong>version control system</strong> ends that: it records changes to files over time so you can recall specific versions later.</p>
<ul>
<li><strong>Git</strong> is a <strong>distributed</strong> version control system, created by <strong>Linus Torvalds</strong> (2005, for the Linux kernel).</li>
<li>Every copy has the full history, so Git works completely <strong>offline</strong> after installation.</li>
<li><strong>GitHub</strong> is a cloud hosting service for Git repositories plus collaboration tools. Git ≠ GitHub.</li>
</ul>
<h3>Install and check</h3>
`),
    code(
      "bash",
      `
# Windows: git-scm.com · macOS: xcode-select --install · Linux: sudo apt install git
git --version
# git version 2.47.0
`,
    ),
    text(`<h3>Tell Git who you are (once per computer)</h3>`),
    code(
      "bash",
      `
git config --global user.name "Bruce"
git config --global user.email "bruce@example.com"
git config --list        # check
`,
    ),
    text(`
<p>Your name and email appear in commit history and are required by platforms like GitHub. Skip this and <strong>Git refuses to commit</strong> and shows an error asking you to set them.</p>
<h3>Try it</h3>
<p>Install Git, run <code>git --version</code>, then set your name and email.</p>
${reveal(
  "Show what success looks like",
  `<p><code>git config --list</code> should include <code>user.name=…</code> and <code>user.email=…</code>. If <code>git</code> is "not recognized" on Windows, reopen the terminal after installing.</p>`,
)}
`),
    playground(
      knowledgeCheck([
        { q: "You're on a bus with no internet. Can you commit?", options: ["No, Git needs internet", "Yes, Git works offline", "Only on GitHub"], answer: 1, why: "Git is distributed: the full history lives on your machine." },
        { q: "Git and GitHub are…", options: ["The same thing", "A tool and a hosting service for it", "Competitors"], answer: 1, why: "Git tracks versions; GitHub hosts repositories and adds collaboration." },
        { q: "Your first commit fails: 'Please tell me who you are'. Fix?", options: ["Reinstall Git", "git config --global user.name / user.email", "Create a GitHub account"], answer: 1, why: "Git needs your name and email to record who made each commit." },
      ]),
    ),
  ],
};

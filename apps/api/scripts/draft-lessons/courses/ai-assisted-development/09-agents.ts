import { code, playground, image, reveal, text, type LessonDraft } from "../../types";
import { knowledgeCheck } from "../../knowledge-check";

export const lesson: LessonDraft = {
  moduleId: "9418a7dd-1848-4c2d-9811-d2812023e8aa",
  moduleTitle:
    "Advanced Topics: Agents, Multi-Step Workflows & Measuring Impact",
  lessonTitle: "Agents, multi-step workflows and measuring real impact",
  blocks: [
    text(`
<p>So far you've driven every step. Agentic tools take a goal and run with it: read files, plan, edit, run tests, fix failures, repeat. Used well, they handle whole features. Used carelessly, they make a mess quickly.</p>
<h3>What "agentic" means</h3>
<p>An agentic AI workflow is AI that <strong>plans, executes multiple steps, and self-corrects</strong>. In Cursor this is <strong>Agent mode</strong>. Claude's <strong>computer use</strong> goes further: the model can interact with a browser and the file system.</p>
<h3>Multi-step prompting</h3>
<p>Agents work best when you break the task into clear, sequenced steps and say how to verify each one:</p>
`),
    image("ai-assisted-development/agent-loop.png"),
    code(
      "text",
      `
Goal: add support for recurring expenses to the expense tracker.
Steps:
1. Read models.py and storage.py; summarise the current data model. Stop and wait.
2. Add a "recurrence" field ("none" | "weekly" | "monthly"), default "none".
3. Generate due recurring expenses when the app starts.
4. Write pytest tests for weekly and monthly recurrence.
5. Run pytest and fix failures until green. Show me the final diff.
Constraints: keep JSON storage compatible with old files.
`,
    ),
    text(`
<p>Step 1's "stop and wait" is a checkpoint: you confirm the agent understood the codebase before it changes anything.</p>
<h3>Pitfalls to watch</h3>
<ul>
<li><strong>Hallucinations in planning or execution</strong>: inventing functions, files or APIs that don't exist. Checkpoints and tests catch these.</li>
<li><strong>Leaking proprietary code</strong>: agents send lots of context to cloud models. Check your company's policy, use privacy modes, and keep secrets out of the repo.</li>
<li><strong>Skill atrophy</strong>: if the agent does everything, you stop learning. Still understand and verify the key logic yourself.</li>
</ul>
<h3>Measure the impact, don't guess</h3>
<p>Feeling faster isn't evidence. Compare the time taken for the same kind of task with and without AI, and watch quality too:</p>
`),
    code(
      "text",
      `
Task                         Without AI   With AI   Bugs found later
Add CSV export                 90 min      25 min        0
Recurring expenses            180 min      60 min        1 (timezone)
Write tests for storage.py     60 min      15 min        0
`,
    ),
    text(`
<p>Track a few tasks for two weeks. If quality drops (more bugs, more rework), the time saved is fake.</p>
<h3>Try it</h3>
<p>Run the recurring-expenses prompt above in Cursor Agent mode on your tracker. Approve the plan at step 1, let it finish, then review the diff line by line before committing. Log how long it took.</p>
${reveal(
  "Show a sample answer",
  `<p>What a healthy run looks like: at step 1 the agent summarises <code>Expense</code> and the JSON storage correctly (if it invents files, stop and correct it). It adds <code>recurrence</code> with a default so old files still load, writes tests for weekly and monthly, hits a month-end edge case (31st), fixes it, and finishes green. Your review should check the default value, the month-end logic, and that no secrets or unrelated files changed.</p>`,
)}
<h3>Key takeaways</h3>
<ul>
<li>Agents plan, execute and self-correct; Cursor Agent mode and Claude computer use are examples.</li>
<li>Break work into sequenced steps with checkpoints and tests.</li>
<li>Guard against hallucinations, code leaks and skill atrophy.</li>
<li>Measure with/without AI on the same tasks.</li>
<li>The goal of the whole course: amplify your capabilities while staying in control.</li>
</ul>
`),
    playground(knowledgeCheck([
          {
                "q": "What makes a workflow \"agentic\"?",
                "options": [
                      "It autocompletes lines",
                      "It plans, runs several steps and self-corrects",
                      "It only answers questions"
                ],
                "answer": 1,
                "why": "Agents plan, act, observe and correct."
          },
          {
                "q": "Best place for a human checkpoint?",
                "options": [
                      "After the plan, before edits",
                      "Never",
                      "Only after deploying"
                ],
                "answer": 0,
                "why": "Approving the plan catches wrong assumptions early."
          },
          {
                "q": "How do you know AI actually made you faster?",
                "options": [
                      "It feels faster",
                      "Compare time and bugs on the same kind of task with vs without AI",
                      "Count lines generated"
                ],
                "answer": 1,
                "why": "Measure time and quality, not feelings or line counts."
          }
    ])),
  ],
};

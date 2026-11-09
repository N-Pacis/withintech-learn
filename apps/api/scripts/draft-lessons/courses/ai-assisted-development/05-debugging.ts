import { code, text, type LessonDraft } from "../../types";

export const lesson: LessonDraft = {
  moduleId: "1969d7cf-2440-48e4-8025-6a97927a4bc7",
  moduleTitle: "Avoid understanding the code you ship",
  lessonTitle: "Debugging & understanding code with AI",
  blocks: [
    text(`
<p>Your expense tracker crashes the moment someone types <code>1500.50</code>. You could stare at it for twenty minutes, or you could hand the AI exactly what it needs and get an explanation, a fix, and a way to stop it happening again in under a minute.</p>
<h3>The bug</h3>
`),
    code(
      "python",
      `
amount = int(input("Amount (RWF): "))   # user types 1500.50
`,
    ),
    code(
      "text",
      `
Traceback (most recent call last):
  File "main.py", line 14, in <module>
    amount = int(input("Amount (RWF): "))
ValueError: invalid literal for int() with base 10: '1500.50'
`,
    ),
    text(`
<p>This is a classic: type conversion errors like treating decimal amounts as <code>int</code>.</p>
<h3>A debugging prompt that works</h3>
<p>The fastest route is to paste the <strong>full traceback, the relevant code, and a clear prompt asking for explanation + fix</strong>. A strong debugging prompt always has three parts: the error traceback, the surrounding code context, and specific instructions like <em>explain + fix + prevent</em>.</p>
`),
    code(
      "text",
      `
Here is the traceback and the code around line 14 (pasted below).
1. Explain why this fails in one or two sentences.
2. Fix it so amounts with decimals work and invalid input asks again.
3. Suggest how to prevent this class of bug (validation, type hints, tests).
`,
    ),
    text(`
<p>That third line matters: after fixing a bug, prompt the AI to suggest preventive measures like validation, type hints or tests, so it doesn't come back.</p>
<h3>Logic bugs: think step by step</h3>
<p>Crashes are easy; wrong answers are harder. For complex logic bugs (an off-by-one in a monthly total, a fee that's wrong at the boundary) use <strong>chain-of-thought prompting plus sample inputs and expected outputs</strong>. Asking the model to think step by step guides it through logical reproduction and root-cause analysis instead of guessing.</p>
`),
    code(
      "text",
      `
monthly_total(expenses, month=3) returns 0 for March 31st expenses.
Input: [Expense(5000, "rent", date(2026, 3, 31))]  Expected: 5000  Actual: 0
Think step by step: trace the date filtering for this input, find the root
cause, then give the minimal fix and a pytest test for the boundary.
`,
    ),
    text(`
<h3>When the first fix doesn't work</h3>
<p>Don't start a new chat. Provide feedback on what still fails and iterate with more details: the new error, the input that breaks, what you expected.</p>
<h3>Let the tools trace for you</h3>
<p>Cursor's <strong>Debug / Agent mode</strong> can inject logging automatically to trace an issue, run the code, read the output and narrow down the cause.</p>
<h3>Understand before you ship</h3>
<p>AI debugging excels at explaining obscure error messages and suggesting precise, context-aware fixes. Use that: read the explanation, not just the patch. The biggest productivity gain is spending less time staring at errors while learning why they occur and how to avoid them. If you can't explain the fix, you're not done.</p>
<h3>Try it</h3>
<p>Introduce the <code>int()</code> bug above into your tracker, then use the three-part prompt. Apply the fix, run it with <code>1500.50</code> and <code>abc</code>, and add the test the AI suggests.</p>
<h3>Key takeaways</h3>
<ul>
<li>Paste traceback + code + "explain, fix, prevent".</li>
<li>Logic bugs: chain-of-thought plus sample input and expected output.</li>
<li>Iterate with feedback when a fix falls short.</li>
<li>Always understand the code you ship.</li>
</ul>
`),
  ],
};

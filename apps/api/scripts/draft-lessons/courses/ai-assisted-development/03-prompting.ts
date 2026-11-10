import { code, codeLines, image, playground, reveal, text, type LessonDraft } from "../../types";
import { promptBuilder } from "./widgets";

export const lesson: LessonDraft = {
  moduleId: "029e4f51-4399-432d-9235-f2c7eb8e4e60",
  moduleTitle: "Mastering Prompt Engineering for Coding",
  lessonTitle: "Prompts that produce code you can actually use",
  blocks: [
    text(`
<p>Same model, same task, wildly different results. The difference is the prompt. The AI only knows what you tell it, so a vague prompt gets generic or incorrect code, and a precise one gets code that fits your project. That's why prompt engineering matters so much for AI-assisted coding: <strong>output quality depends directly on input quality</strong>.</p>
<h3>Bad vs strong</h3>
`),
    image("ai-assisted-development/rtccfer.png"),
    code(
      "text",
      `
BAD:    write a function to validate phone numbers

STRONG:
Role: You are a senior Python developer.
Task: Write normalize_phone(raw: str) -> str for Rwandan mobile numbers.
Context: Input comes from a signup form. Valid results look like +2507XXXXXXXX.
         Users type "0788 123 456", "788123456" or "+250788123456".
Constraints: Standard library only, type hints, raise ValueError on invalid input.
Format: Return only the function, then 5 pytest tests.
Examples: "0788 123 456" -> "+250788123456"; "12345" -> ValueError
`,
    ),
    text(`
<h3>The RTCCFER framework</h3>
<ul>
<li><strong>R – Role</strong>: the role or persona assigned to the AI ("senior Python developer", "security reviewer").</li>
<li><strong>T – Task</strong>: one clear job.</li>
<li><strong>C – Context</strong>: project details, existing code snippets, requirements and edge cases.</li>
<li><strong>C – Constraints</strong>: libraries, versions, style rules, performance limits.</li>
<li><strong>F – Format</strong>: format specification, e.g. "only return code + tests".</li>
<li><strong>E – Examples</strong>: few-shot input/output pairs that show the exact pattern, style or output format you want.</li>
<li><strong>R – Refine</strong>: iterate with follow-ups.</li>
</ul>
<h3>Chain-of-Thought for tricky logic</h3>
<p>For anything with branching rules (fees, tax brackets, scheduling) add <em>"think step by step: list the rules and edge cases first, then write the code."</em> This <strong>Chain-of-Thought (CoT) prompting</strong> makes the model reason before it writes, which greatly improves complex logic.</p>
<h3>Iterate instead of chasing the perfect prompt</h3>
<p>In Cursor or Claude chat, iterative refinement with follow-up questions beats one perfect prompt: <em>"Now handle numbers starting with 072"</em>, <em>"Rename to snake_case"</em>, <em>"Add a test for empty input"</em>.</p>
<h3>Prompting Copilot inline</h3>
<p>Copilot reads your file, not a chat box. Descriptive comments or docstrings right above the code you're writing trigger the best suggestions:</p>
`),
    code(
      "python",
      `
def momo_fee(amount: int) -> int:
    """Return the MoMo transfer fee in RWF.

    Rules: 0 for amounts up to 1,000; 100 up to 10,000;
    250 above 10,000. Raise ValueError for amounts <= 0.
    """
    # Copilot now has enough to suggest a correct body
`,
    ),
    playground(promptBuilder),
    text(`
<h3>Common mistakes</h3>
<ul>
<li>Being too vague, leading to generic or incorrect code.</li>
<li>Leaving out existing code, so the AI invents names that don't match yours.</li>
<li>Not saying what format you want, then getting a wall of explanation.</li>
</ul>
<h3>Try it</h3>
<p>The goal is to compare bad vs strong prompts and see the jump in code quality. Send the BAD prompt above to your AI tool, then the STRONG one. Run both results against the five examples. Note which handles <code>"0788 123 456"</code> correctly.</p>
${reveal(
  "Show a sample answer",
  `<p>The BAD prompt usually returns a generic regex for international numbers that rejects <code>"0788 123 456"</code> or doesn't add <code>+250</code>. The STRONG prompt should produce something like:</p>
${codeLines(`
def normalize_phone(raw: str) -> str:
    digits = "".join(ch for ch in raw if ch.isdigit())
    if digits.startswith("250"):
        digits = digits[3:]
    if digits.startswith("0"):
        digits = digits[1:]
    if len(digits) != 9 or not digits.startswith("7"):
        raise ValueError(f"Invalid Rwandan mobile number: {raw!r}")
    return "+250" + digits
`)}
<p>…plus five tests, because the Format line asked for them.</p>`,
)}
<h3>Key takeaways</h3>
<ul>
<li>Use RTCCFER: Role, Task, Context, Constraints, Format, Examples, Refine.</li>
<li>Add "think step by step" for complex logic.</li>
<li>For Copilot, write the docstring first.</li>
<li>Iterate; don't expect one prompt to be perfect.</li>
</ul>
`),
  ],
};

import { code, codeLines, image, playground, reveal, text, type LessonDraft } from "../../types";
import { toolMap } from "./widgets";

export const lesson: LessonDraft = {
  moduleId: "79f25680-0d83-45ad-ac53-0d69603c76aa",
  moduleTitle: "Introduction to AI-Assisted Development",
  lessonTitle: "AI as your pair programmer",
  blocks: [
    text(`
<p>It's 9 a.m. and you need a function that totals a week of expenses by category. Ten years ago you'd open the docs and type it out line by line. Today you describe what you want, an AI tool drafts it in seconds, and you spend your time on the part that matters: <strong>checking it's right</strong>.</p>
<p>That's <strong>AI-assisted development</strong>: developers collaborate with AI tools to write, debug, and improve code faster. The AI does not replace you. It drafts, explains and suggests; you decide, review and ship.</p>
<h3>What it looks like in practice</h3>
<p>You write a clear comment or prompt. The AI proposes code. You read it, run it, and iterate.</p>
`),
    image("ai-assisted-development/human-in-the-loop.png"),
    code(
      "python",
      `
# Prompt (as a comment): total expenses per category, ignore negative amounts
def total_by_category(expenses: list[dict]) -> dict[str, float]:
    totals: dict[str, float] = {}
    for e in expenses:
        if e["amount"] < 0:
            continue
        totals[e["category"]] = totals.get(e["category"], 0) + e["amount"]
    return totals

print(total_by_category([
    {"category": "transport", "amount": 1500},
    {"category": "food", "amount": 3200},
    {"category": "transport", "amount": 800},
]))
# {'transport': 2300, 'food': 3200}
`,
    ),
    playground(toolMap),
    text(`
<h3>The three kinds of AI tools you'll use</h3>
<ul>
<li><strong>Inline completion</strong>: GitHub Copilot / Tabnine suggest the next lines as you type, right in the editor.</li>
<li><strong>Chat-based</strong>: Claude.ai, ChatGPT or the chat panel in your editor. Good for explaining, designing and debugging.</li>
<li><strong>Agentic</strong>: tools like Devin or Cursor's Agent mode plan and run multi-step tasks across files (we cover these in the last module).</li>
</ul>
<h3>Why it matters now</h3>
<p>Developer surveys and tool reports show that in some projects <strong>30–50%+ of code</strong> is now generated with AI assistance. Interviewers have noticed: a common question today is <em>"How do you use AI in your daily coding workflow?"</em> Done well, AI helps you ship features <strong>2–5x faster</strong> and learn new languages and frameworks quicker.</p>
<p>What it does <strong>not</strong> do is eliminate the need to understand code. That's not a benefit on offer, and believing it is the fastest way to ship bugs.</p>
<h3>The mindset that works</h3>
<p>Treat AI as an <strong>amplifier for your own judgment</strong> and always review the output. You remain responsible for the final code's quality, security and correctness (yes, that's true even when the AI wrote every line).</p>
<p><strong>Common pitfall:</strong> blindly trusting and shipping untested AI-generated code. The fix is a habit, not a tool: read it, run it, test it.</p>
<h3>Why Python in this course</h3>
<p>Python offers some of the highest productivity gains with AI thanks to its simple syntax and strong AI ecosystem, so the examples stay short and readable. Everything you learn transfers to TypeScript, Java or any other stack.</p>
<h3>Try it</h3>
<p>Open any AI chat tool and ask: <em>"Write a Python function that returns the busiest day from a list of (day, count) pairs. Include type hints and one example."</em> Then do three things before trusting it: read every line, run it, and try an edge case (an empty list). Did it handle it?</p>
${reveal(
  "Show a sample answer",
  `<p>A good result looks like this. Notice the empty-list check: many first drafts forget it and crash with <code>ValueError: max() arg is an empty sequence</code>.</p>
${codeLines(`
def busiest_day(counts: list[tuple[str, int]]) -> str | None:
    if not counts:
        return None
    return max(counts, key=lambda pair: pair[1])[0]

print(busiest_day([("Mon", 12), ("Tue", 30), ("Wed", 18)]))  # Tue
`)}
<p>If yours crashed on <code>[]</code>, reply to the AI: <em>"Handle an empty list by returning None."</em> That's the review → iterate loop in action.</p>`,
)}
<h3>Key takeaways</h3>
<ul>
<li>AI-assisted development = you and AI collaborating; you stay in charge.</li>
<li>Inline (Copilot/Tabnine), chat (Claude.ai) and agentic tools each fit different jobs.</li>
<li>Review and test everything; you own the result.</li>
<li>This course teaches you to use AI as a collaborative partner across the full dev lifecycle: planning, coding, debugging, testing, refactoring and docs.</li>
</ul>
`),
  ],
};

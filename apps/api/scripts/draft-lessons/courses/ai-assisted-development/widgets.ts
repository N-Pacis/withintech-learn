// Interactive widgets for the playground blocks (Sandpack vanilla template:
// /index.html + /styles.css + /index.js). Students can read and edit the code,
// so it stays short and plain. No template literals inside the widget JS, so
// the whole file can live inside these TypeScript template strings safely.

const page = (title: string, body: string): string => `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <h2>${title}</h2>
${body}
    <script src="index.js"></script>
  </body>
</html>`;

const base = `body { font-family: system-ui, sans-serif; margin: 0; padding: 18px; color: #1f2937; background: #fff; }
h2 { margin: 0 0 12px; font-size: 18px; color: #3d006b; }
button { font: inherit; border: 0; border-radius: 8px; padding: 8px 14px; cursor: pointer; background: #3d006b; color: #fff; }
button.ghost { background: #f3e8ff; color: #3d006b; }
button:disabled { opacity: .4; cursor: default; }
.card { border: 2px solid #e9d5ff; border-radius: 12px; padding: 12px; background: #faf5ff; }
.muted { color: #6b7280; font-size: 13px; }
pre { background: #141414; color: #e5e7eb; padding: 12px; border-radius: 10px; font-size: 13px; overflow-x: auto; white-space: pre-wrap; margin: 8px 0; }
`;

export const toolMap = {
  html: page(
    "Which AI tool fits the job?",
    `    <p class="muted">Click a tool type.</p>
    <div class="grid">
      <button class="tool" data-k="inline">Inline completion</button>
      <button class="tool" data-k="chat">Chat</button>
      <button class="tool" data-k="agent">Agentic</button>
    </div>
    <div id="detail" class="card">Pick one above.</div>`,
  ),
  css: `${base}.grid { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
.tool { background: #f3e8ff; color: #3d006b; }
.tool.on { background: #3d006b; color: #fff; }
#detail b { color: #3d006b; }`,
  js: `const tools = {
  inline: { name: "GitHub Copilot / Tabnine", when: "You know what to write and want the next lines suggested as you type.", example: "Write a docstring, press Tab to accept the body." },
  chat: { name: "Claude.ai / ChatGPT / editor chat", when: "You need to explain, design, or debug something.", example: "Paste a traceback and ask: explain, fix, prevent." },
  agent: { name: "Cursor Agent mode / Devin", when: "A task spans many files and steps: plan, edit, run tests, fix.", example: "Add recurring expenses, update storage and tests, run pytest." }
};
document.querySelectorAll(".tool").forEach(function (btn) {
  btn.addEventListener("click", function () {
    document.querySelectorAll(".tool").forEach(function (b) { b.classList.remove("on"); });
    btn.classList.add("on");
    const t = tools[btn.dataset.k];
    document.getElementById("detail").innerHTML =
      "<b>" + t.name + "</b><p>Use when: " + t.when + "</p><p class='muted'>Example: " + t.example + "</p>";
  });
});`,
};

export const setupChecklist = {
  html: page(
    "Setup checklist",
    `    <div class="bar"><div id="fill"></div></div>
    <p id="status" class="muted">0 of 6 done</p>
    <ul id="list"></ul>`,
  ),
  css: `${base}.bar { height: 10px; background: #f3e8ff; border-radius: 99px; overflow: hidden; }
#fill { height: 100%; width: 0; background: #3d006b; transition: width .3s; }
ul { list-style: none; padding: 0; }
li { padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
li.done span { text-decoration: line-through; color: #9ca3af; }
.party { color: #15803d; font-weight: 700; }`,
  js: `const steps = [
  "Install VS Code (or Cursor) and the Python extension",
  "Install GitHub Copilot and sign in with GitHub",
  "Create a project folder and a .venv virtual environment",
  "pip install pytest",
  "Add a .cursorrules (or copilot-instructions) file",
  "Let the AI write main.py and run it successfully"
];
const list = document.getElementById("list");
steps.forEach(function (text, i) {
  const li = document.createElement("li");
  li.innerHTML = "<label><input type='checkbox' data-i='" + i + "'> <span>" + text + "</span></label>";
  list.appendChild(li);
});
list.addEventListener("change", function () {
  const boxes = list.querySelectorAll("input");
  let done = 0;
  boxes.forEach(function (b) {
    b.closest("li").classList.toggle("done", b.checked);
    if (b.checked) done++;
  });
  document.getElementById("fill").style.width = (done / steps.length) * 100 + "%";
  const status = document.getElementById("status");
  status.textContent = done === steps.length ? "All set. Your AI dev environment is ready!" : done + " of " + steps.length + " done";
  status.className = done === steps.length ? "party" : "muted";
});`,
};

export const promptBuilder = {
  html: page(
    "Prompt builder (RTCCFER)",
    `    <div class="form" id="form"></div>
    <div class="meter"><div id="score"></div></div>
    <p id="label" class="muted"></p>
    <pre id="out"></pre>`,
  ),
  css: `${base}.form { display: grid; gap: 6px; }
.form label { font-size: 13px; font-weight: 600; color: #3d006b; }
.form input { width: 100%; box-sizing: border-box; padding: 7px 9px; border: 1px solid #d1d5db; border-radius: 8px; font: inherit; }
.meter { height: 10px; background: #f3e8ff; border-radius: 99px; margin-top: 12px; overflow: hidden; }
#score { height: 100%; width: 0; background: #ea7a28; transition: width .3s; }`,
  js: `const parts = [
  ["Role", "You are a senior Python developer."],
  ["Task", "Write normalize_phone(raw: str) -> str for Rwandan numbers."],
  ["Context", "Input comes from a signup form; users type '0788 123 456'."],
  ["Constraints", "Standard library only, type hints, raise ValueError."],
  ["Format", "Return only the function, then 5 pytest tests."],
  ["Examples", "'0788 123 456' -> '+250788123456'; '12345' -> ValueError"]
];
const form = document.getElementById("form");
parts.forEach(function (p) {
  form.insertAdjacentHTML("beforeend",
    "<label>" + p[0] + "<input data-k='" + p[0] + "' placeholder='" + p[1].replace(/'/g, "&#39;") + "'></label>");
});
function render() {
  let lines = [];
  let filled = 0;
  form.querySelectorAll("input").forEach(function (input) {
    if (input.value.trim()) { filled++; lines.push(input.dataset.k + ": " + input.value.trim()); }
  });
  document.getElementById("score").style.width = (filled / parts.length) * 100 + "%";
  const labels = ["Vague: expect generic code", "Getting there", "Good", "Strong: the AI has what it needs"];
  document.getElementById("label").textContent = labels[Math.min(3, Math.floor(filled / 2))] + " (" + filled + "/6)";
  document.getElementById("out").textContent = lines.length ? lines.join("\\n") : "Type in the fields (placeholders show an example).";
}
form.addEventListener("input", render);
render();`,
};

export const featureStepper = {
  html: page(
    "Build a feature in small steps",
    `    <div class="card">
      <p id="step" class="muted"></p>
      <p><b id="title"></b></p>
      <pre id="body"></pre>
    </div>
    <p><button class="ghost" id="back">Back</button> <button id="next">Next</button></p>`,
  ),
  css: base,
  js: `const steps = [
  ["Generate", "Prompt: Write save_expenses() and load_expenses() for a JSON file.\\nConstraints: stdlib only, type hints, return [] if the file is missing or corrupt."],
  ["Review", "Read it. Does load_expenses() handle a corrupt file?\\nIs the date stored as an ISO string? Any magic file names?"],
  ["Run", "$ python main.py add 1500 transport\\n$ python main.py list\\n1500.0 RWF  transport  2026-11-09"],
  ["Iterate", "Bug: KeyError when expenses.json has an extra 'id' field.\\nPrompt: Fix this bug where load_expenses() crashes on unknown fields. Keep them ignored."],
  ["Done", "Feature works, edge case covered. Next feature: monthly summary.\\nSame loop: generate -> review -> run -> iterate."]
];
let i = 0;
function show() {
  document.getElementById("step").textContent = "Step " + (i + 1) + " of " + steps.length;
  document.getElementById("title").textContent = steps[i][0];
  document.getElementById("body").textContent = steps[i][1];
  document.getElementById("back").disabled = i === 0;
  document.getElementById("next").disabled = i === steps.length - 1;
}
document.getElementById("next").onclick = function () { i++; show(); };
document.getElementById("back").onclick = function () { i--; show(); };
show();`,
};

export const tracebackExplorer = {
  html: page(
    "Click each line of the traceback",
    `    <div id="tb" class="tb"></div>
    <div id="explain" class="card">Click a line to see what it tells you.</div>`,
  ),
  css: `${base}.tb { background: #141414; border-radius: 10px; padding: 10px; margin-bottom: 12px; }
.line { font-family: ui-monospace, monospace; font-size: 13px; color: #e5e7eb; padding: 4px 6px; border-radius: 6px; cursor: pointer; white-space: pre; }
.line:hover, .line.on { background: #3d006b; }`,
  js: `const lines = [
  ["Traceback (most recent call last):", "Python is about to list the calls that led to the error, oldest first. The last entry is closest to the crash."],
  ["  File \\"main.py\\", line 14, in <module>", "Where to look: file main.py, line 14, at the top level of the script (not inside a function)."],
  ["    amount = int(input(\\"Amount (RWF): \\"))", "The exact line that ran. int() is being given whatever the user typed."],
  ["ValueError: invalid literal for int() with base 10: '1500.50'", "The error type (ValueError) and the bad value. int() can't parse decimals: use float(), or validate the input and ask again."]
];
const tb = document.getElementById("tb");
lines.forEach(function (l, i) {
  const div = document.createElement("div");
  div.className = "line";
  div.textContent = l[0];
  div.onclick = function () {
    tb.querySelectorAll(".line").forEach(function (d) { d.classList.remove("on"); });
    div.classList.add("on");
    document.getElementById("explain").textContent = l[1];
  };
  tb.appendChild(div);
});`,
};

export const testRunner = {
  html: page(
    "Mini test runner",
    `    <label><input type="checkbox" id="bug"> Introduce a bug (count negative amounts)</label>
    <pre id="code"></pre>
    <button id="run">Run tests</button>
    <ul id="results"></ul>`,
  ),
  css: `${base}ul { list-style: none; padding: 0; }
li { padding: 6px 10px; margin: 6px 0; border-radius: 8px; font-family: ui-monospace, monospace; font-size: 13px; }
.pass { background: #e8f7ee; color: #15803d; }
.fail { background: #fef2f2; color: #b91c1c; }`,
  js: `function makeTotal(buggy) {
  return function totalByCategory(expenses) {
    const totals = {};
    expenses.forEach(function (e) {
      if (!buggy && e.amount < 0) return;
      totals[e.category] = (totals[e.category] || 0) + e.amount;
    });
    return totals;
  };
}
const tests = [
  ["sums amounts per category", [{ category: "food", amount: 3200 }, { category: "food", amount: 800 }], { food: 4000 }],
  ["returns empty for no expenses", [], {}],
  ["ignores negative amounts", [{ category: "food", amount: -50 }], {}]
];
function show() {
  const buggy = document.getElementById("bug").checked;
  document.getElementById("code").textContent = makeTotal(buggy).toString();
}
document.getElementById("bug").onchange = show;
document.getElementById("run").onclick = function () {
  const fn = makeTotal(document.getElementById("bug").checked);
  const ul = document.getElementById("results");
  ul.innerHTML = "";
  tests.forEach(function (t) {
    const ok = JSON.stringify(fn(t[1])) === JSON.stringify(t[2]);
    ul.insertAdjacentHTML("beforeend", "<li class='" + (ok ? "pass" : "fail") + "'>" + (ok ? "PASS " : "FAIL ") + "test_" + t[0].replace(/ /g, "_") + "</li>");
  });
};
show();`,
};

export const refactorToggle = {
  html: page(
    "Before vs after the refactor",
    `    <p><button id="before">Before</button> <button class="ghost" id="after">After</button></p>
    <pre id="code"></pre>
    <div id="notes" class="card"></div>`,
  ),
  css: `${base}#notes li { margin: 4px 0; }`,
  js: `const versions = {
  before: {
    code: "def s(e):\\n    t = 0\\n    for x in e:\\n        if x['a'] > 500000:\\n            print('Warning!')\\n        t += x['a']\\n    d = json.load(open('e.json'))\\n    return t",
    notes: ["Score 4/10", "Names s, e, x, t, a say nothing", "Magic number 500000", "File opened and never closed, and unused", "No type hints, no tests"]
  },
  after: {
    code: "LARGE_EXPENSE_RWF = 500_000\\n\\ndef total_spent(expenses: list[Expense]) -> float:\\n    total = 0.0\\n    for expense in expenses:\\n        if expense.amount > LARGE_EXPENSE_RWF:\\n            warn_large(expense)\\n        total += expense.amount\\n    return total",
    notes: ["Score 9/10", "Descriptive names", "Named constant replaces the magic number", "Unused file read removed (lives in storage.py now)", "Type hints; behaviour kept, tests still green"]
  }
};
function show(which) {
  document.getElementById("code").textContent = versions[which].code;
  document.getElementById("notes").innerHTML = "<b>Review notes</b><ul><li>" + versions[which].notes.join("</li><li>") + "</li></ul>";
  document.getElementById("before").className = which === "before" ? "" : "ghost";
  document.getElementById("after").className = which === "after" ? "" : "ghost";
}
document.getElementById("before").onclick = function () { show("before"); };
document.getElementById("after").onclick = function () { show("after"); };
show("before");`,
};

export const readmeGenerator = {
  html: page(
    "README generator",
    `    <div class="form">
      <label>Project name <input id="name" value="expense-tracker"></label>
      <label>One-line description <input id="desc" value="Track daily expenses in RWF from the command line"></label>
      <label>Main command <input id="cmd" value="python main.py add 1500 transport"></label>
      <label>License <select id="lic"><option>MIT</option><option>Apache-2.0</option></select></label>
    </div>
    <pre id="out"></pre>`,
  ),
  css: `${base}.form { display: grid; gap: 6px; }
.form label { font-size: 13px; font-weight: 600; color: #3d006b; }
.form input, .form select { width: 100%; box-sizing: border-box; padding: 7px 9px; border: 1px solid #d1d5db; border-radius: 8px; font: inherit; }`,
  js: `function v(id) { return document.getElementById(id).value; }
function render() {
  document.getElementById("out").textContent = [
    "# " + v("name"),
    "",
    v("desc"),
    "",
    "## Install",
    "python3 -m venv .venv && source .venv/bin/activate",
    "pip install -r requirements.txt",
    "",
    "## Usage",
    v("cmd"),
    "",
    "## Tests",
    "pytest -q",
    "",
    "## License",
    v("lic")
  ].join("\\n");
}
document.querySelectorAll("input, select").forEach(function (el) { el.addEventListener("input", render); });
render();`,
};

export const agentSimulator = {
  html: page(
    "Agent simulator: add recurring expenses",
    `    <div id="log" class="log"></div>
    <p><button id="step">Next step</button> <span id="hint" class="muted"></span></p>
    <h2>AI impact calculator</h2>
    <div class="calc">
      <label>Minutes without AI <input id="without" type="number" value="180"></label>
      <label>Minutes with AI <input id="with" type="number" value="60"></label>
      <label>Bugs found later <input id="bugs" type="number" value="1"></label>
    </div>
    <p id="impact" class="card"></p>`,
  ),
  css: `${base}.log { background: #141414; color: #e5e7eb; border-radius: 10px; padding: 10px; min-height: 120px; font-family: ui-monospace, monospace; font-size: 13px; }
.log div { margin: 3px 0; }
.ok { color: #86efac; } .err { color: #fca5a5; } .you { color: #fdba74; }
.calc { display: flex; gap: 8px; flex-wrap: wrap; }
.calc label { font-size: 13px; color: #3d006b; font-weight: 600; }
.calc input { width: 90px; padding: 6px; border: 1px solid #d1d5db; border-radius: 8px; display: block; }`,
  js: `const steps = [
  ["PLAN", "Read models.py, storage.py. Plan: add recurrence field, generate due expenses at start, write tests.", ""],
  ["YOU", "Checkpoint: plan approved.", "you"],
  ["ACT", "Edited models.py (+recurrence), storage.py (+due_recurring()).", ""],
  ["ACT", "Created tests/test_recurring.py (weekly, monthly).", ""],
  ["OBSERVE", "pytest: 1 failed: monthly recurrence skips the 31st.", "err"],
  ["CORRECT", "Clamp day to the month's last day; re-run.", ""],
  ["OBSERVE", "pytest: 14 passed.", "ok"],
  ["YOU", "Review the diff line by line before committing.", "you"]
];
let i = 0;
document.getElementById("step").onclick = function () {
  if (i >= steps.length) return;
  const s = steps[i++];
  document.getElementById("log").insertAdjacentHTML("beforeend", "<div class='" + s[2] + "'>[" + s[0] + "] " + s[1] + "</div>");
  document.getElementById("hint").textContent = i === steps.length ? "Done. The agent planned, acted, observed and self-corrected." : "";
  this.disabled = i === steps.length;
};
function impact() {
  const a = +document.getElementById("without").value;
  const b = +document.getElementById("with").value;
  const bugs = +document.getElementById("bugs").value;
  const saved = a - b;
  const pct = a ? Math.round((saved / a) * 100) : 0;
  document.getElementById("impact").textContent =
    "Saved " + saved + " min (" + pct + "%). " + (bugs > 0 ? "Watch quality: " + bugs + " bug(s) found later eat into that saving." : "No extra bugs: real gain.");
}
document.querySelectorAll(".calc input").forEach(function (el) { el.addEventListener("input", impact); });
impact();`,
};

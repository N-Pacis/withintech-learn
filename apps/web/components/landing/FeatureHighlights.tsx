// ─── Feature Highlights ───────────────────────────────────────────────────────
// Three alternating rows: rich content, smart quizzes, progress tracking

const CheckIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// ─── Mock UI: Module content preview ─────────────────────────────────────────

function ModuleMockup() {
  return (
    <div className="bg-surface-card rounded-2xl border border-border shadow-xl overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border-subtle bg-surface dark:bg-surface-panel">
        <div className="w-2.5 h-2.5 rounded-full bg-red-300 dark:bg-red-500/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-amber-300 dark:bg-amber-500/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-300 dark:bg-emerald-500/70" />
        <span className="ml-2 font-body text-xs text-muted-contrast">
          Module 2 · Intro to APIs
        </span>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-1 px-4 py-3 border-b border-border-subtle overflow-hidden">
        {["Setup", "APIs", "Auth", "Deploy", "✓ Quiz"].map((label, i) => (
          <div key={i} className="flex items-center gap-1">
            <div
              className={`shrink-0 flex items-center justify-center rounded-full text-[9px] font-heading font-bold w-5 h-5
              ${i === 1 ? "bg-primary text-white" : i === 0 ? "bg-primary/15 text-primary" : "bg-surface-muted text-muted-contrast"}`}
            >
              {i === 0 ? "✓" : i + 1}
            </div>
            <span
              className={`font-body text-[9px] hidden sm:block ${i === 1 ? "text-primary font-semibold" : "text-muted-contrast"}`}
            >
              {label}
            </span>
            {i < 4 && <div className="w-4 h-px bg-fill-muted mx-0.5" />}
          </div>
        ))}
      </div>

      <div className="p-5 flex flex-col gap-4">
        {/* Text block */}
        <div>
          <p className="font-heading font-bold text-sm text-foreground mb-1.5">
            What is a REST API?
          </p>
          <div className="space-y-1.5">
            <div className="h-2 bg-surface-muted rounded w-full" />
            <div className="h-2 bg-surface-muted rounded w-5/6" />
            <div className="h-2 bg-surface-muted rounded w-4/6" />
          </div>
        </div>

        {/* Code block */}
        <div className="bg-editor rounded-xl p-4 font-body text-[11px] leading-relaxed border border-editor-border">
          <span className="text-sky-300">fetch</span>
          <span className="text-white">(</span>
          <span className="text-emerald-300">&apos;/api/courses&apos;</span>
          <span className="text-white">)</span>
          <br />
          <span className="text-slate-400 pl-2">.then</span>
          <span className="text-white">(res =&gt; res.</span>
          <span className="text-sky-300">json</span>
          <span className="text-white">())</span>
          <br />
          <span className="text-slate-400 pl-2">.then</span>
          <span className="text-white">(data =&gt; </span>
          <span className="text-sky-300">console</span>
          <span className="text-white">.</span>
          <span className="text-sky-300">log</span>
          <span className="text-white">(data))</span>
        </div>

        {/* Image block placeholder */}
        <div className="rounded-xl overflow-hidden h-20 bg-linear-to-br from-[#EDE9FE] to-[#DDD6FE] flex items-center justify-center">
          <span className="font-body text-xs text-[#7C3AED] opacity-60">diagram.png</span>
        </div>
      </div>
    </div>
  );
}

// ─── Mock UI: Quiz preview ────────────────────────────────────────────────────

function QuizMockup() {
  return (
    <div className="bg-surface-card rounded-2xl border border-border shadow-xl overflow-hidden">
      <div className="px-5 pt-5 pb-4 border-b border-border-subtle">
        <div className="flex items-center justify-between mb-1">
          <span className="font-heading font-bold text-sm text-foreground">
            Module Quiz
          </span>
          <span className="font-body text-xs text-muted-contrast">
            Pass: 70%
          </span>
        </div>
        <p className="font-body text-xs text-muted">
          Which HTTP methods are idempotent?
        </p>
      </div>

      <div className="p-5 flex flex-col gap-2.5">
        {[
          { label: "GET", state: "correct" },
          { label: "POST", state: "wrong" },
          { label: "PUT", state: "correct" },
          { label: "DELETE", state: "missed" },
        ].map(({ label, state }) => (
          <div
            key={label}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 border text-xs font-body
            ${
              state === "correct"
                ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-950/30 dark:border-green-900 dark:text-green-300"
                : state === "wrong"
                  ? "bg-red-50 border-red-200 text-red-600 dark:bg-red-950/30 dark:border-red-900 dark:text-red-300"
                  : "bg-blue-50 border-blue-200 border-dashed text-blue-600 dark:bg-blue-950/25 dark:border-blue-900 dark:text-blue-300"
            }`}
          >
            <div
              className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border
              ${
                state === "correct"
                  ? "bg-green-500 border-green-500 text-white"
                  : state === "wrong"
                    ? "bg-red-400 border-red-400 text-white"
                    : "border-blue-400 bg-surface-card"
              }`}
            >
              {state === "correct" && (
                <svg
                  width="9"
                  height="9"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              {state === "wrong" && (
                <svg
                  width="9"
                  height="9"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              )}
            </div>
            <span className="font-medium">{label}</span>
            <span className="ml-auto text-[10px] opacity-70">
              {state === "correct"
                ? "Correct ✓"
                : state === "wrong"
                  ? "Incorrect"
                  : "Should have chosen"}
            </span>
          </div>
        ))}

        <div className="mt-2 pt-3 border-t border-border-subtle flex items-center justify-between">
          <span className="font-body text-xs text-muted">Your score</span>
          <span className="font-heading font-bold text-base text-green-600 dark:text-green-300">
            75% · Passed
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Mock UI: Progress stats ──────────────────────────────────────────────────

function ProgressMockup() {
  return (
    <div className="bg-surface-card rounded-2xl border border-border shadow-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border-subtle">
        <p className="font-heading font-bold text-sm text-foreground">
          Your Progress
        </p>
      </div>

      <div className="p-5 flex flex-col gap-4">
        {/* Stat row */}
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              label: "Enrolled",
              value: "4",
              color: "text-primary",
              bg: "bg-primary/8 dark:bg-primary-soft/70",
            },
            {
              label: "Completed",
              value: "2",
              color: "text-green-600 dark:text-green-300",
              bg: "bg-green-50 dark:bg-green-950/30",
            },
            {
              label: "Modules done",
              value: "18",
              color: "text-orange-500 dark:text-orange-300",
              bg: "bg-orange-50 dark:bg-orange-950/30",
            },
            {
              label: "Certificates",
              value: "2",
              color: "text-blue-600 dark:text-blue-300",
              bg: "bg-blue-50 dark:bg-blue-950/30",
            },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`${bg} rounded-xl p-3`}>
              <p className={`font-heading font-black text-2xl ${color}`}>
                {value}
              </p>
              <p className="font-body text-xs text-muted mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Completion bar */}
        <div>
          <div className="flex justify-between mb-1.5">
            <span className="font-body text-xs text-muted">
              Completion rate
            </span>
            <span className="font-heading font-bold text-xs text-primary">
              50%
            </span>
          </div>
          <div className="w-full h-2.5 bg-[#F3F4F6] rounded-full overflow-hidden">
            <div className="h-full w-1/2 bg-linear-to-r from-[#3D006B] to-[#7C3AED] rounded-full" />
          </div>
          <p className="font-body text-[10px] text-muted-contrast mt-1">
            2 of 4 courses completed
          </p>
        </div>

        {/* Course pill list */}
        <div className="flex flex-col gap-2">
          {[
            { title: "REST APIs", done: true },
            { title: "JavaScript Basics", done: true },
            { title: "React Fundamentals", done: false },
            { title: "Node.js & Express", done: false },
          ].map(({ title, done }) => (
            <div key={title} className="flex items-center gap-2.5">
              <div
                className={`w-4 h-4 rounded-full shrink-0 flex items-center justify-center
                ${done ? "bg-green-500 text-white" : "border-2 border-border dark:bg-surface-panel"}`}
              >
                {done && (
                  <svg
                    width="8"
                    height="8"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <span
                className={`font-body text-xs ${done ? "text-foreground-soft" : "text-muted-contrast"}`}
              >
                {title}
              </span>
              {done && (
                <span className="ml-auto font-body text-[10px] text-green-600 dark:text-green-300 bg-green-50 dark:bg-green-950/30 px-2 py-0.5 rounded-full">
                  Done
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Mock UI: Challenge workspace ────────────────────────────────────────────

function ChallengeMockup() {
  return (
    <div className="bg-surface-card rounded-2xl border border-border shadow-xl overflow-hidden">
      {/* Title bar */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border-subtle bg-surface">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-heading font-bold text-xs text-foreground truncate">
            Kigali Coffee Pair
          </span>
          <span className="shrink-0 font-body text-[9px] font-medium px-2 py-0.5 rounded bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 uppercase tracking-wide">
            Easy
          </span>
        </div>
        <div className="shrink-0 flex items-center gap-1.5 bg-primary text-white text-[10px] font-body font-medium px-2.5 py-1 rounded">
          <svg
            width="9"
            height="9"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
          Submit
        </div>
      </div>

      {/* Language tabs */}
      <div className="flex items-center gap-1 px-3 py-2 bg-editor border-b border-editor-border">
        {["Python", "Java", "C++", "Go"].map((lang, i) => (
          <span
            key={lang}
            className={`font-mono text-[9px] px-2.5 py-1 rounded font-medium ${i === 0 ? "bg-primary text-white" : "text-muted-contrast"}`}
          >
            {lang}
          </span>
        ))}
      </div>

      {/* Code editor */}
      <div className="bg-editor px-4 py-3 font-mono text-[11px] leading-relaxed">
        <div>
          <span className="text-[#C586C0]">def</span>{" "}
          <span className="text-[#DCDCAA]">solution</span>
          <span className="text-white">(</span>
          <span className="text-[#9CDCFE]">bags</span>
          <span className="text-[#CE9178]">: int[]</span>
          <span className="text-white">, </span>
          <span className="text-[#9CDCFE]">shipment</span>
          <span className="text-[#CE9178]">: int</span>
          <span className="text-white">) → int[]:</span>
        </div>
        <div className="pl-4">
          <span className="text-[#9CDCFE]">seen</span>
          <span className="text-white"> = </span>
          <span className="text-[#CE9178]">{"{}"}</span>
        </div>
        <div className="pl-4">
          <span className="text-[#C586C0]">for</span>
          <span className="text-white"> i, b </span>
          <span className="text-[#C586C0]">in</span>
          <span className="text-white"> </span>
          <span className="text-[#DCDCAA]">enumerate</span>
          <span className="text-white">(bags):</span>
        </div>
        <div className="pl-8">
          <span className="text-[#C586C0]">if</span>
          <span className="text-white"> shipment - b </span>
          <span className="text-[#C586C0]">in</span>
          <span className="text-white"> seen:</span>
        </div>
        <div className="pl-12">
          <span className="text-[#C586C0]">return</span>
          <span className="text-white"> [seen[shipment - b], i]</span>
        </div>
        <div className="pl-8">
          <span className="text-[#9CDCFE]">seen</span>
          <span className="text-white">[b] = i</span>
        </div>
        <div className="flex items-center gap-1 mt-1">
          <span className="w-1.5 h-4 bg-[#9CDCFE] animate-pulse rounded-sm" />
        </div>
      </div>

      {/* Results panel */}
      <div className="border-t border-border">
        <div className="flex items-center gap-1 px-3 py-2 border-b border-border-subtle">
          <span className="font-body text-[10px] font-medium text-primary border-b-2 border-primary px-2 py-1.5">
            Results
          </span>
          <span className="font-body text-[10px] text-muted-contrast px-2 py-1.5">
            Submissions
          </span>
          <span className="ml-auto flex items-center gap-1 font-body text-[10px] font-semibold text-green-600 dark:text-green-300 bg-green-50 dark:bg-green-950/30 px-2 py-0.5 rounded-full">
            <svg
              width="9"
              height="9"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Accepted
          </span>
        </div>
        <div className="p-3 flex flex-col gap-1.5">
          {[
            { input: "bags=[120,380,200], shipment=500", output: "[0,1]" },
            { input: "bags=[150,250,350], shipment=500", output: "[0,2]" },
            { input: "bags=[100,400], shipment=500", output: "[0,1]" },
          ].map(({ input, output }, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-lg px-3 py-2 bg-green-50 dark:bg-green-950/25 border border-green-100 dark:border-green-900 text-[10px] font-mono"
            >
              <svg
                width="9"
                height="9"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-green-500 dark:text-green-300 shrink-0"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="text-muted truncate">{input}</span>
              <span className="ml-auto text-green-700 dark:text-green-300 shrink-0">
                → {output}
              </span>
            </div>
          ))}
          <p className="font-body text-[10px] text-muted-contrast text-center pt-1">
            3 / 3 test cases passed
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Individual feature row ───────────────────────────────────────────────────

interface FeatureRowProps {
  eyebrow: string;
  headline: string;
  body: string;
  bullets: string[];
  mockup: React.ReactNode;
  reverse?: boolean;
}

function FeatureRow({
  eyebrow,
  headline,
  body,
  bullets,
  mockup,
  reverse,
}: FeatureRowProps) {
  return (
    <div
      className={`flex flex-col gap-12 lg:gap-20 items-center ${reverse ? "lg:flex-row-reverse" : "lg:flex-row"}`}
    >
      {/* Copy */}
      <div className="lg:w-[45%] flex flex-col gap-6">
        <div>
          <span className="inline-block font-body text-[10px] tracking-widest uppercase text-orange-500 dark:text-orange-300 border border-orange-500/40 dark:border-orange-300/30 px-3 py-1 rounded mb-4">
            {eyebrow}
          </span>
          <h3 className="font-heading font-black text-3xl lg:text-4xl text-foreground tracking-tight leading-tight">
            {headline}
          </h3>
        </div>
        <p className="font-body text-base text-muted leading-relaxed">{body}</p>
        <ul className="flex flex-col gap-3">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-3">
              <span className="shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary mt-0.5">
                <CheckIcon />
              </span>
              <span className="font-body text-sm text-foreground-soft">
                {b}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Mockup */}
      <div className="lg:w-[55%] w-full">{mockup}</div>
    </div>
  );
}

// ─── Section export ───────────────────────────────────────────────────────────

export default function FeatureHighlights() {
  return (
    <section
      id="demo"
      className="bg-surface py-20 lg:py-32 border-y border-border"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section header */}
        <div className="mb-20 lg:mb-28">
          <p className="font-heading text-xs tracking-widest uppercase text-primary font-bold mb-4">
            Everything you need
          </p>
          <h2 className="font-heading font-black text-3xl lg:text-5xl text-foreground tracking-tight max-w-2xl leading-tight">
            Learning, built around how you actually learn.
          </h2>
        </div>

        <div className="flex flex-col gap-24 lg:gap-36">
          <FeatureRow
            eyebrow="Content"
            headline="Rich modules, not walls of text."
            body="Every module combines written explanations, real images, and syntax-highlighted code so concepts stick, not just scroll past."
            bullets={[
              "Formatted text with clear structure",
              "Diagrams and images embedded inline",
              "Read-only code examples with syntax highlighting across multiple languages",
            ]}
            mockup={<ModuleMockup />}
          />

          <FeatureRow
            eyebrow="Quizzes"
            headline="Questions that teach, not just grade."
            body="After each module, a quiz shows you exactly what you got right, what you missed, and what you should have chosen, so every attempt makes you sharper."
            bullets={[
              "Multiple-choice with multi-select support",
              "Instant feedback: correct, incorrect, and missed answers highlighted",
              "Retry as many times as you need, no attempt limits",
            ]}
            mockup={<QuizMockup />}
            reverse
          />

          <FeatureRow
            eyebrow="Progress"
            headline="Always know where you stand."
            body="A live dashboard shows your enrolled courses, modules finished, and overall completion rate, so you can see momentum build in real time."
            bullets={[
              "Enrolled and completed course counts at a glance",
              "Total modules finished across all courses",
              "Completion rate updated instantly as you progress",
            ]}
            mockup={<ProgressMockup />}
          />

          <FeatureRow
            eyebrow="Challenges"
            headline="Write real code. Get instant feedback."
            body="Put your skills to the test with coding challenges that run your solution against real test cases, directly in the browser, across six languages."
            bullets={[
              "Python, JavaScript, Java, C, C++, and Go supported",
              "Solve realistic Rwandan problems designed to sharpen your thinking",
              "Instant verdict with per-test-case breakdown",
            ]}
            mockup={<ChallengeMockup />}
            reverse
          />
        </div>
      </div>
    </section>
  );
}

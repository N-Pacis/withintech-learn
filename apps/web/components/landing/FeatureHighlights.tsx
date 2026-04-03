// ─── Feature Highlights ───────────────────────────────────────────────────────
// Three alternating rows: rich content, smart quizzes, progress tracking

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// ─── Mock UI: Module content preview ─────────────────────────────────────────

function ModuleMockup() {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xl overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#F3F4F6] bg-[#FAFAFA]">
        <div className="w-2.5 h-2.5 rounded-full bg-[#FCA5A5]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#FDE68A]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#6EE7B7]" />
        <span className="ml-2 font-body text-xs text-[#9CA3AF]">Module 2 · Intro to APIs</span>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-1 px-4 py-3 border-b border-[#F3F4F6] overflow-hidden">
        {['Setup', 'APIs', 'Auth', 'Deploy', '✓ Quiz'].map((label, i) => (
          <div key={i} className="flex items-center gap-1">
            <div className={`shrink-0 flex items-center justify-center rounded-full text-[9px] font-heading font-bold w-5 h-5
              ${i === 1 ? 'bg-[#3D006B] text-white' : i === 0 ? 'bg-[#3D006B]/15 text-[#3D006B]' : 'bg-[#F3F4F6] text-[#9CA3AF]'}`}>
              {i === 0 ? '✓' : i + 1}
            </div>
            <span className={`font-body text-[9px] hidden sm:block ${i === 1 ? 'text-[#3D006B] font-semibold' : 'text-[#9CA3AF]'}`}>{label}</span>
            {i < 4 && <div className="w-4 h-px bg-[#E5E7EB] mx-0.5" />}
          </div>
        ))}
      </div>

      <div className="p-5 flex flex-col gap-4">
        {/* Text block */}
        <div>
          <p className="font-heading font-bold text-sm text-[#0F0F0F] mb-1.5">What is a REST API?</p>
          <div className="space-y-1.5">
            <div className="h-2 bg-[#F3F4F6] rounded w-full" />
            <div className="h-2 bg-[#F3F4F6] rounded w-5/6" />
            <div className="h-2 bg-[#F3F4F6] rounded w-4/6" />
          </div>
        </div>

        {/* Code block */}
        <div className="bg-[#0F172A] rounded-xl p-4 font-body text-[11px] leading-relaxed">
          <span className="text-[#7DD3FC]">fetch</span>
          <span className="text-white">(</span>
          <span className="text-[#86EFAC]">&apos;/api/courses&apos;</span>
          <span className="text-white">)</span>
          <br />
          <span className="text-[#94A3B8] pl-2">.then</span>
          <span className="text-white">(res =&gt; res.</span>
          <span className="text-[#7DD3FC]">json</span>
          <span className="text-white">())</span>
          <br />
          <span className="text-[#94A3B8] pl-2">.then</span>
          <span className="text-white">(data =&gt; </span>
          <span className="text-[#7DD3FC]">console</span>
          <span className="text-white">.</span>
          <span className="text-[#7DD3FC]">log</span>
          <span className="text-white">(data))</span>
        </div>

        {/* Image block placeholder */}
        <div className="rounded-xl overflow-hidden h-20 bg-gradient-to-br from-[#EDE9FE] to-[#DDD6FE] flex items-center justify-center">
          <span className="font-body text-xs text-[#7C3AED] opacity-60">diagram.png</span>
        </div>
      </div>
    </div>
  );
}

// ─── Mock UI: Quiz preview ────────────────────────────────────────────────────

function QuizMockup() {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xl overflow-hidden">
      <div className="px-5 pt-5 pb-4 border-b border-[#F3F4F6]">
        <div className="flex items-center justify-between mb-1">
          <span className="font-heading font-bold text-sm text-[#0F0F0F]">Module Quiz</span>
          <span className="font-body text-xs text-[#9CA3AF]">Pass: 70%</span>
        </div>
        <p className="font-body text-xs text-[#6B7280]">Which HTTP methods are idempotent?</p>
      </div>

      <div className="p-5 flex flex-col gap-2.5">
        {[
          { label: 'GET', state: 'correct' },
          { label: 'POST', state: 'wrong' },
          { label: 'PUT', state: 'correct' },
          { label: 'DELETE', state: 'missed' },
        ].map(({ label, state }) => (
          <div key={label} className={`flex items-center gap-3 rounded-xl px-4 py-3 border text-xs font-body
            ${state === 'correct' ? 'bg-green-50 border-green-200 text-green-700' :
              state === 'wrong'   ? 'bg-red-50 border-red-200 text-red-600' :
                                    'bg-blue-50 border-blue-200 border-dashed text-blue-600'}`}>
            <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border
              ${state === 'correct' ? 'bg-green-500 border-green-500 text-white' :
                state === 'wrong'   ? 'bg-red-400 border-red-400 text-white' :
                                      'border-blue-400 bg-white'}`}>
              {state === 'correct' && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
              {state === 'wrong'   && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
            </div>
            <span className="font-medium">{label}</span>
            <span className="ml-auto text-[10px] opacity-70">
              {state === 'correct' ? 'Correct ✓' : state === 'wrong' ? 'Incorrect' : 'Should have chosen'}
            </span>
          </div>
        ))}

        <div className="mt-2 pt-3 border-t border-[#F3F4F6] flex items-center justify-between">
          <span className="font-body text-xs text-[#6B7280]">Your score</span>
          <span className="font-heading font-bold text-base text-green-600">75% · Passed</span>
        </div>
      </div>
    </div>
  );
}

// ─── Mock UI: Progress stats ──────────────────────────────────────────────────

function ProgressMockup() {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[#F3F4F6]">
        <p className="font-heading font-bold text-sm text-[#0F0F0F]">Your Progress</p>
      </div>

      <div className="p-5 flex flex-col gap-4">
        {/* Stat row */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Enrolled', value: '4', color: 'text-[#3D006B]', bg: 'bg-[#3D006B]/8' },
            { label: 'Completed', value: '2', color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Modules done', value: '18', color: 'text-[#F97316]', bg: 'bg-orange-50' },
            { label: 'Certificates', value: '2', color: 'text-blue-600', bg: 'bg-blue-50' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`${bg} rounded-xl p-3`}>
              <p className={`font-heading font-black text-2xl ${color}`}>{value}</p>
              <p className="font-body text-xs text-[#6B7280] mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Completion bar */}
        <div>
          <div className="flex justify-between mb-1.5">
            <span className="font-body text-xs text-[#6B7280]">Completion rate</span>
            <span className="font-heading font-bold text-xs text-[#3D006B]">50%</span>
          </div>
          <div className="w-full h-2.5 bg-[#F3F4F6] rounded-full overflow-hidden">
            <div className="h-full w-1/2 bg-gradient-to-r from-[#3D006B] to-[#7C3AED] rounded-full" />
          </div>
          <p className="font-body text-[10px] text-[#9CA3AF] mt-1">2 of 4 courses completed</p>
        </div>

        {/* Course pill list */}
        <div className="flex flex-col gap-2">
          {[
            { title: 'REST APIs', done: true },
            { title: 'JavaScript Basics', done: true },
            { title: 'React Fundamentals', done: false },
            { title: 'Node.js & Express', done: false },
          ].map(({ title, done }) => (
            <div key={title} className="flex items-center gap-2.5">
              <div className={`w-4 h-4 rounded-full shrink-0 flex items-center justify-center
                ${done ? 'bg-green-500 text-white' : 'border-2 border-[#E5E7EB]'}`}>
                {done && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
              </div>
              <span className={`font-body text-xs ${done ? 'text-[#374151]' : 'text-[#9CA3AF]'}`}>{title}</span>
              {done && <span className="ml-auto font-body text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Done</span>}
            </div>
          ))}
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

function FeatureRow({ eyebrow, headline, body, bullets, mockup, reverse }: FeatureRowProps) {
  return (
    <div className={`flex flex-col gap-12 lg:gap-20 items-center ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}>
      {/* Copy */}
      <div className="lg:w-[45%] flex flex-col gap-6">
        <div>
          <span className="inline-block font-body text-[10px] tracking-widest uppercase text-[#F97316] border border-[#F97316]/40 px-3 py-1 rounded mb-4">
            {eyebrow}
          </span>
          <h3 className="font-heading font-black text-3xl lg:text-4xl text-[#0F0F0F] tracking-tight leading-tight">
            {headline}
          </h3>
        </div>
        <p className="font-body text-base text-[#6B7280] leading-relaxed">{body}</p>
        <ul className="flex flex-col gap-3">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-3">
              <span className="shrink-0 w-5 h-5 rounded-full bg-[#3D006B]/10 flex items-center justify-center text-[#3D006B] mt-0.5">
                <CheckIcon />
              </span>
              <span className="font-body text-sm text-[#374151]">{b}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Mockup */}
      <div className="lg:w-[55%] w-full">
        {mockup}
      </div>
    </div>
  );
}

// ─── Section export ───────────────────────────────────────────────────────────

export default function FeatureHighlights() {
  return (
    <section id="demo" className="bg-[#FAFAFA] py-20 lg:py-32 border-y border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* Section header */}
        <div className="mb-20 lg:mb-28">
          <p className="font-heading text-xs tracking-widest uppercase text-[#3D006B] font-bold mb-4">
            Everything you need
          </p>
          <h2 className="font-heading font-black text-3xl lg:text-5xl text-[#0F0F0F] tracking-tight max-w-2xl leading-tight">
            Learning, built around how you actually learn.
          </h2>
        </div>

        <div className="flex flex-col gap-24 lg:gap-36">
          <FeatureRow
            eyebrow="Content"
            headline="Rich modules, not walls of text."
            body="Every module combines written explanations, real images, and syntax-highlighted code so concepts stick, not just scroll past."
            bullets={[
              'Formatted text with clear structure',
              'Diagrams and images embedded inline',
              'Read-only code examples with syntax highlighting across multiple languages',
            ]}
            mockup={<ModuleMockup />}
          />

          <FeatureRow
            eyebrow="Quizzes"
            headline="Questions that teach, not just grade."
            body="After each module, a quiz shows you exactly what you got right, what you missed, and what you should have chosen, so every attempt makes you sharper."
            bullets={[
              'Multiple-choice with multi-select support',
              'Instant feedback: correct, incorrect, and missed answers highlighted',
              'Retry as many times as you need, no attempt limits',
            ]}
            mockup={<QuizMockup />}
            reverse
          />

          <FeatureRow
            eyebrow="Progress"
            headline="Always know where you stand."
            body="A live dashboard shows your enrolled courses, modules finished, and overall completion rate, so you can see momentum build in real time."
            bullets={[
              'Enrolled and completed course counts at a glance',
              'Total modules finished across all courses',
              'Completion rate updated instantly as you progress',
            ]}
            mockup={<ProgressMockup />}
          />
        </div>
      </div>
    </section>
  );
}

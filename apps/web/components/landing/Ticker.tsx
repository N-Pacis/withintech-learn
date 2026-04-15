"use client";

const WORDS = [
  "Courses",
  "Quizzes",
  "Certificates",
  "Self-paced",
  "Accessible",
  "Rwanda",
  "Modules",
  "Progress",
  "Learn",
  "Grow",
];

const repeated = [...WORDS, ...WORDS];

export default function Ticker() {
  return (
    <div className="overflow-hidden w-full border-t border-border py-4 bg-surface-shell">
      <div className="flex whitespace-nowrap animate-ticker">
        {repeated.map((word, i) => (
          <span
            key={i}
            className="font-body text-xs tracking-widest uppercase text-muted-contrast mx-8 flex-shrink-0"
          >
            {word}
            <span className="ml-8 text-border-strong">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

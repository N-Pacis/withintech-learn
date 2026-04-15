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
    <div className="overflow-hidden w-full border-t border-[#E5E7EB] dark:border-[#2d2d2d] py-4 bg-white dark:bg-[#0f0f0f]">
      <div className="flex whitespace-nowrap animate-ticker">
        {repeated.map((word, i) => (
          <span
            key={i}
            className="font-body text-xs tracking-widest uppercase text-[#9CA3AF] dark:text-[#4B5563] mx-8 flex-shrink-0"
          >
            {word}
            <span className="ml-8 text-[#D1D5DB]">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

"use client";

// ─── Stats Section ─────────────────────────────────────────────────────────────
// Animated count-up statistics fetched from /public/stats.
// Animation triggers once when the section enters the viewport (IntersectionObserver).
// Each counter uses easeOutExpo so it lands quickly and settles naturally.

import { useEffect, useRef, useState } from "react";
import { usePublicStats } from "@/hooks/queries/analytics";

// ─── Count-up hook ────────────────────────────────────────────────────────────

function useCountUp(target: number, active: boolean, duration = 2000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;

    let rafId: number;
    let start: number | null = null;

    function step(ts: number) {
      if (start === null) start = ts;
      const elapsed = ts - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo — fast start, smooth landing
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.round(eased * target));
      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    }

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [target, active, duration]);

  return count;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const UsersIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const BookOpenIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const AwardIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
  </svg>
);

const CodeIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

// ─── Stat config (icons, labels, colours) ────────────────────────────────────
// Values are injected at render time from the API response.

const STAT_CONFIG = [
  {
    key: "students" as const,
    icon: <UsersIcon />,
    label: "Students",
    description: "Learners actively growing their skills on the platform",
    iconBg: "bg-primary-soft",
    iconColor: "text-primary",
    valueColor: "text-primary",
  },
  {
    key: "courses" as const,
    icon: <BookOpenIcon />,
    label: "Courses",
    description: "Structured courses covering in-demand tech skills",
    iconBg: "bg-accent/12",
    iconColor: "text-accent",
    valueColor: "text-accent",
  },
  {
    key: "certificatesIssued" as const,
    icon: <AwardIcon />,
    label: "Certificates Issued",
    description: "Official certificates recognized by WithinTech Rwanda",
    iconBg: "bg-success-soft",
    iconColor: "text-success",
    valueColor: "text-success",
  },
  {
    key: "challengeSolvers" as const,
    icon: <CodeIcon />,
    label: "Challenge Solvers",
    description: "Students who sharpened their skills through coding challenges",
    iconBg: "bg-warning-soft",
    iconColor: "text-warning",
    valueColor: "text-warning",
  },
];

// ─── Stat card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  description: string;
  iconBg: string;
  iconColor: string;
  valueColor: string;
  active: boolean;
  delay: number;
}

function StatCard({
  icon,
  value,
  label,
  description,
  iconBg,
  iconColor,
  valueColor,
  active,
  delay,
}: StatCardProps) {
  const count = useCountUp(value, active, 2200);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [active, delay]);

  return (
    <div
      className={`
        relative flex flex-col gap-5 bg-surface-card rounded-2xl border border-border p-7
        transition-all duration-700 ease-out
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
        hover:shadow-lg hover:border-border-strong group
      `}
    >
      {/* Top: icon */}
      <div className="flex items-start">
        <div
          className={`${iconBg} ${iconColor} w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}
        >
          {icon}
        </div>
      </div>

      {/* Number */}
      <p className={`font-heading font-black text-5xl tracking-tight ${valueColor} leading-none`}>
        {count.toLocaleString()}
        <span className="text-3xl">+</span>
      </p>

      {/* Label + description */}
      <div className="flex flex-col gap-1">
        <p className="font-heading font-bold text-base text-foreground">
          {label}
        </p>
        <p className="font-body text-sm text-muted leading-relaxed">
          {description}
        </p>
      </div>

      {/* Bottom accent line that fills in on hover */}
      <div
        className={`absolute bottom-0 left-6 right-6 h-0.5 rounded-full ${iconBg} scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}
      />
    </div>
  );
}

// ─── Section export ───────────────────────────────────────────────────────────

export default function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const { data: stats } = usePublicStats();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="bg-surface border-y border-border py-20 lg:py-28">
      <div ref={ref} className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section header */}
        <div className="mb-14 lg:mb-16">
          <p className="font-heading text-xs tracking-widest uppercase text-primary font-bold mb-4">
            By the numbers
          </p>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <h2 className="font-heading font-black text-3xl lg:text-4xl text-foreground tracking-tight max-w-md">
              Trusted by a growing community.
            </h2>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STAT_CONFIG.map((config, i) => (
            <StatCard
              key={config.label}
              icon={config.icon}
              value={stats?.[config.key] ?? 0}
              label={config.label}
              description={config.description}
              iconBg={config.iconBg}
              iconColor={config.iconColor}
              valueColor={config.valueColor}
              active={active && !!stats}
              delay={i * 120}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

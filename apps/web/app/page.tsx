import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Ticker from "@/components/landing/Ticker";
import CertificateCard from "@/components/landing/CertificateCard";
import CoursesSection from "@/components/landing/CoursesSection";
import ChallengesSection from "@/components/landing/ChallengesSection";
import FeatureHighlights from "@/components/landing/FeatureHighlights";
import StatsSection from "@/components/landing/StatsSection";
import { Logo } from "@/components/ui";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="bg-surface-shell text-foreground">
      <Navbar />

      {/* ── 2. Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-surface-shell bg-dots">
        {/* Fade the dots out toward the bottom so the section blends cleanly */}
        <div
          className="absolute inset-x-0 bottom-0 h-40 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, transparent, var(--background))",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row lg:items-center gap-12 lg:gap-0 pt-20 lg:pt-28 pb-0">
            {/* Left: text */}
            <div className="lg:w-[55%] lg:pr-12 pb-20">
              <h1 className="font-heading font-black text-5xl sm:text-6xl lg:text-7xl text-foreground tracking-tight leading-[1.05] mb-6">
                <span className="block">Stay Ahead</span>
                <span className="block">in the AI Era.</span>
              </h1>

              <p className="font-body text-lg text-muted leading-relaxed mb-8 max-w-sm">
                Experience hands-on learning, quizzes, and verified
                certificates.
              </p>

              <Link
                href="/sign-in"
                className="font-body font-medium inline-flex items-center gap-2 bg-primary text-white px-7 py-3.5 rounded-md hover:bg-primary-dark transition-colors text-base"
              >
                Start Learning →
              </Link>

              <p className="font-body text-xs text-muted-contrast mt-4">
                Certificates recognized by WithinTech Rwanda
              </p>
            </div>

            {/* Right: dashboard mockup — bleeds toward the right edge */}
            <div className="lg:w-[52%] lg:-mr-12 self-end hidden lg:block">
              <div className="rounded-l-xl overflow-hidden shadow-xl ring-1 ring-primary-pale/40">
                <Image
                  src="/homepage/hero.jpg"
                  alt="Course dashboard preview"
                  width={1024}
                  height={681}
                  loading="lazy"
                  className="w-full h-auto block"
                />
              </div>
            </div>

            {/* Mobile-only image */}
            <div className="lg:hidden w-full pb-12">
              <div className="rounded-md overflow-hidden shadow-xl ring-1 ring-primary-pale/40">
                <Image
                  src="/homepage/hero.jpg"
                  alt="Course dashboard preview"
                  width={1024}
                  height={681}
                  loading="lazy"
                  className="w-full h-auto block"
                />
              </div>
            </div>
          </div>
        </div>

        <Ticker />
      </section>

      <CoursesSection />

      <StatsSection />

      <ChallengesSection />

      {/* ── 6. Certificate Moment ───────────────────────────────────────────── */}
      <FeatureHighlights />

      <section className="bg-primary py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
            {/* Left: copy */}
            <div className="lg:w-1/2">
              <span className="inline-block font-body text-[10px] tracking-widest uppercase text-accent border border-accent/40 px-3 py-1 rounded mb-8">
                Certified
              </span>
              <h2 className="font-heading font-black text-4xl lg:text-5xl text-white tracking-tight leading-tight mb-6">
                Your effort,
                <br />
                officially recognized.
              </h2>
              <p className="font-body text-lg text-primary-pale leading-relaxed max-w-md">
                Your name, your course, your date. A real document issued by
                WithinTech Rwanda.
              </p>
            </div>

            {/* Right: certificate card */}
            <div className="lg:w-1/2">
              <CertificateCard />
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-surface-shell py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <p className="font-heading text-xs tracking-widest uppercase text-primary font-bold mb-4">
            How it works
          </p>
          <h2 className="font-heading font-black text-3xl lg:text-4xl text-foreground tracking-tight mb-16">
            Three steps. That is all.
          </h2>

          {/* Desktop: horizontal with connectors */}
          <div className="hidden md:flex items-start">
            <div className="flex-1">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mb-6">
                <span className="font-heading text-white font-bold text-lg">
                  1
                </span>
              </div>
              <h3 className="font-heading font-bold text-xl text-foreground mb-2">
                Get access
              </h3>
              <p className="font-body text-base text-muted max-w-50">
                Sign in and find your courses ready to go.
              </p>
            </div>

            <div className="shrink-0 w-16 pt-6">
              <div className="border-t-2 border-dashed border-accent" />
            </div>

            <div className="flex-1">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mb-6">
                <span className="font-heading text-white font-bold text-lg">
                  2
                </span>
              </div>
              <h3 className="font-heading font-bold text-xl text-foreground mb-2">
                Study your modules
              </h3>
              <p className="font-body text-base text-muted max-w-50">
                Work at your own pace, on any device, anywhere.
              </p>
            </div>

            <div className="shrink-0 w-16 pt-6">
              <div className="border-t-2 border-dashed border-accent" />
            </div>

            <div className="flex-1">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mb-6">
                <span className="font-heading text-white font-bold text-lg">
                  3
                </span>
              </div>
              <h3 className="font-heading font-bold text-xl text-foreground mb-2">
                Earn your certificate
              </h3>
              <p className="font-body text-base text-muted max-w-50">
                Pass the quiz and download your certificate instantly.
              </p>
            </div>
          </div>

          {/* Mobile: vertical with left border accent */}
          <div className="md:hidden flex flex-col gap-0">
            {[
              {
                n: "1",
                title: "Get access",
                desc: "Sign in and find your courses ready to go.",
              },
              {
                n: "2",
                title: "Study your modules",
                desc: "Work at your own pace, on any device, anywhere.",
              },
              {
                n: "3",
                title: "Earn your certificate",
                desc: "Pass the quiz and download your certificate instantly.",
              },
            ].map(({ n, title, desc }) => (
              <div
                key={n}
                className="flex gap-6 border-l-2 border-primary pl-6 pb-10 last:pb-0"
              >
                <div className="shrink-0 -ml-6.25 w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                  <span className="font-heading text-white font-bold text-lg">
                    {n}
                  </span>
                </div>
                <div className="pt-1">
                  <h3 className="font-heading font-bold text-xl text-foreground mb-2">
                    {title}
                  </h3>
                  <p className="font-body text-base text-muted">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. Partners ─────────────────────────────────────────────────────── */}
      <section className="bg-surface-shell border-y border-border py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <p className="font-body text-xs text-muted-contrast uppercase tracking-widest text-center mb-10">
            Partners
          </p>
          <div className="flex flex-wrap items-center justify-center gap-12 lg:gap-20">
            {[
              { src: "/partners/partner-1.png", alt: "Partner 1" },
              { src: "/partners/partner-2.png", alt: "Partner 2" },
              { src: "/partners/partner-3.png", alt: "Partner 3" },
            ].map(({ src, alt }) => (
              <div key={alt} className="h-16 w-48 relative">
                <Image
                  src={src}
                  alt={alt}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. Final CTA ────────────────────────────────────────────────────── */}
      {/* ── 7. FAQ ──────────────────────────────────────────────────────────── */}
      <section
        id="faq"
        className="bg-surface border-y border-border py-20 lg:py-28"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <p className="font-heading text-xs tracking-widest uppercase text-primary font-bold mb-4">
            FAQ
          </p>
          <h2 className="font-heading font-black text-3xl lg:text-4xl text-foreground tracking-tight mb-14">
            Common questions, answered.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                q: "How do I get access to courses?",
                a: "Your courses are assigned to your account by WithinTech Rwanda. Sign in and they'll be waiting on your dashboard, no setup needed.",
              },
              {
                q: "Are the certificates official?",
                a: "Yes. Each certificate is issued by WithinTech Rwanda and includes your full name, the course title, and your completion date. You can download and share it anytime.",
              },
              {
                q: "Do I have to complete modules in order?",
                a: "Modules unlock as you progress through a course. This keeps the learning structured. Each module builds on the last, so the order matters.",
              },
              {
                q: "Can I retake quizzes?",
                a: "As many times as you need. There are no attempt limits. Every retry shows you exactly which answers were correct, incorrect, and which ones you missed, so you actually learn from the attempt.",
              },
              {
                q: "What device can I use?",
                a: "WithinTech Learn works on any device with a modern browser: laptop, tablet, or phone. No app to install.",
              },
            ].map(({ q, a }) => (
              <div
                key={q}
                className="bg-surface-card rounded-2xl border border-border p-6"
              >
                <p className="font-heading font-bold text-base text-foreground mb-3">
                  {q}
                </p>
                <p className="font-body text-sm text-muted leading-relaxed">
                  {a}
                </p>
              </div>
            ))}
          </div>

          <p className="font-body text-sm text-muted mt-10">
            Still have questions?{" "}
            <a
              href="mailto:learn@withintech.org"
              className="text-primary hover:underline font-medium"
            >
              Email us at learn@withintech.org
            </a>
          </p>
        </div>
      </section>

      {/* ── 9. Final CTA ────────────────────────────────────────────────────── */}
      <section className="bg-surface-shell border-t border-border py-24 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row lg:items-center gap-16">
            {/* Left: copy + buttons */}
            <div className="lg:w-1/2">
              <h2 className="font-heading font-black text-4xl lg:text-5xl text-foreground tracking-tight mb-10 max-w-lg">
                Ready to start learning?
              </h2>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/sign-in"
                  className="font-body font-medium bg-primary text-white px-7 py-3.5 rounded-md hover:bg-primary-dark transition-colors text-base"
                >
                  Start Learning
                </Link>
                <Link
                  href="/#how-it-works"
                  className="font-body font-medium text-primary border border-primary px-7 py-3.5 rounded-md hover:bg-primary-soft transition-colors text-base"
                >
                  Learn More
                </Link>
              </div>
            </div>

            {/* Right: illustration */}
            <div className="lg:w-1/2 flex justify-center lg:justify-end">
              <div className="rounded-xl overflow-hidden shadow-lg ring-1 ring-primary-pale/40 w-full max-w-md">
                <Image
                  src="/homepage/ready-to-start-learning.jpg"
                  alt="Start learning illustration"
                  width={1024}
                  height={681}
                  loading="lazy"
                  className="w-full h-auto block"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. Footer ────────────────────────────────────────────────────────── */}
      {/* ── 10. Footer ───────────────────────────────────────────────────────── */}
      <footer className="bg-surface-shell border-t border-border py-14">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div>
              <div className="mb-4 py-1">
                <Logo className="h-16" linked={false} />
              </div>
              <p className="font-body text-sm text-muted mb-4">
                Learn. Prove it. Move forward.
              </p>
              <p
                className="font-body text-xs text-muted-contrast"
                suppressHydrationWarning
              >
                © {new Date().getFullYear()} WithinTech
              </p>
            </div>

            <div>
              <p className="font-heading text-xs tracking-widest uppercase text-foreground font-bold mb-5">
                Quick Links
              </p>
              <ul className="flex flex-col gap-3">
                {[
                  { label: "Home", href: "/" },
                  { label: "Courses", href: "/courses" },
                  { label: "Challenges", href: "/challenges" },
                  { label: "Start Learning", href: "/sign-in" },
                  { label: "How It Works", href: "/#how-it-works" },
                  { label: "FAQ", href: "/#faq" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="font-body text-sm text-muted hover:text-primary transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="font-heading text-xs tracking-widest uppercase text-foreground font-bold mb-5">
                Legal
              </p>
              <ul className="flex flex-col gap-3">
                {[
                  { label: "Terms of Service", href: "/legal" },
                  { label: "Privacy Policy", href: "/legal#privacy" },
                  { label: "Acceptable Use", href: "/legal#acceptable-use" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="font-body text-sm text-muted hover:text-primary transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="font-heading text-xs tracking-widest uppercase text-foreground font-bold mb-5">
                About
              </p>
              <p className="font-body text-sm text-muted mb-3">
                A WithinTech Rwanda product
              </p>
              <a
                href="mailto:learn@withintech.org"
                className="font-body text-sm text-primary hover:underline"
              >
                learn@withintech.org
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

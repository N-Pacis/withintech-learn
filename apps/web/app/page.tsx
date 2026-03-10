import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Ticker from "@/components/landing/Ticker";
import CertificateCard from "@/components/landing/CertificateCard";
import { Logo } from "@/components/ui";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="bg-white text-[#0F0F0F]">
      <Navbar />

      {/* ── 2. Hero ─────────────────────────────────────────────────────────── */}
      <section
        className="overflow-hidden bg-white"
        style={{
          backgroundImage:
            "radial-gradient(circle, #d1d5db 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      >
        {/* Fade the dots out toward the bottom so the section blends cleanly */}
        <div
          className="absolute inset-x-0 bottom-0 h-40 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, transparent, white)",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row lg:items-center gap-12 lg:gap-0 pt-20 lg:pt-28 pb-0">

            {/* Left: text */}
            <div className="lg:w-[55%] lg:pr-12 pb-20">
              <h1 className="font-heading font-black text-5xl sm:text-6xl lg:text-7xl text-[#0F0F0F] tracking-tight leading-[1.05] mb-6">
                Learn at
                <br />
                your pace.
                <br />
                Earn what you
                <br />
                deserve.
              </h1>

              <p className="font-body text-lg text-[#6B7280] leading-relaxed mb-8 max-w-sm">
                Modules, quizzes, and real certificates. Study on your terms.
              </p>

              <Link
                href="/sign-in"
                className="font-body font-medium inline-flex items-center gap-2 bg-[#3D006B] text-white px-7 py-3.5 rounded-md hover:bg-[#2A004A] transition-colors text-base"
              >
                Start Learning →
              </Link>

              <p className="font-body text-xs text-[#9CA3AF] mt-4">
                Certificates recognized by WithinTech Rwanda
              </p>
            </div>

            {/* Right: dashboard mockup — bleeds toward the right edge */}
            <div className="lg:w-[52%] lg:-mr-12 self-end hidden lg:block">
              <div className="rounded-l-xl overflow-hidden shadow-xl ring-1 ring-purple-100">
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
              <div className="rounded-md overflow-hidden shadow-xl ring-1 ring-purple-100">
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

      {/* ── 3. Top Courses ──────────────────────────────────────────────────── */}
      <section id="courses" className="bg-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">

          {/* Header row */}
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="font-heading text-xs tracking-widest uppercase text-[#3D006B] font-bold mb-3">
                Courses
              </p>
              <h2 className="font-heading font-black text-3xl lg:text-4xl text-[#0F0F0F] tracking-tight">
                Start with what matters.
              </h2>
            </div>
            <Link
              href="/sign-up"
              className="hidden md:inline-flex font-body text-sm font-medium text-[#3D006B] items-center gap-1.5 hover:gap-3 transition-all"
            >
              All courses →
            </Link>
          </div>

          {/* Course grid: featured left + 2 stacked right */}
          <div className="flex flex-col lg:flex-row gap-4">

            {/* Featured course */}
            <div className="lg:w-[58%] border border-[#E5E7EB] rounded-md overflow-hidden group hover:border-[#3D006B]/30 transition-colors">
              <div className="overflow-hidden">
                <Image
                  src="https://placehold.co/720x380/3D006B/F3E8FF?text=Digital+Literacy"
                  alt="Digital Literacy Fundamentals"
                  width={720}
                  height={380}
                  loading="lazy"
                  className="w-full h-auto block transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
              <div className="p-8">
                <div className="flex items-center gap-2.5 mb-5">
                  <span className="font-body text-[10px] tracking-widest uppercase bg-[#F97316] text-white px-2.5 py-1 rounded">
                    Most Popular
                  </span>
                  <span className="font-body text-[10px] tracking-widest uppercase text-[#6B7280] border border-[#E5E7EB] px-2.5 py-1 rounded">
                    Beginner
                  </span>
                </div>
                <h3 className="font-heading font-bold text-2xl text-[#0F0F0F] mb-3 leading-snug">
                  Digital Literacy Fundamentals
                </h3>
                <div className="flex items-center gap-1 mb-7">
                  <span className="font-body text-sm text-[#6B7280]">10 modules</span>
                  <span className="text-[#D1D5DB] mx-2">·</span>
                  <span className="font-body text-sm text-[#6B7280]">Certificate included</span>
                </div>
                <Link
                  href="/sign-up"
                  className="font-body text-sm font-medium text-[#3D006B] inline-flex items-center gap-1.5 hover:gap-3 transition-all"
                >
                  View course →
                </Link>
              </div>
            </div>

            {/* Right: 2 smaller cards */}
            <div className="lg:w-[42%] flex flex-col gap-4">

              {/* Card 2 */}
              <div className="flex-1 border border-[#E5E7EB] rounded-md overflow-hidden group hover:border-[#3D006B]/30 transition-colors flex flex-col">
                <div className="overflow-hidden">
                  <Image
                    src="https://placehold.co/480x190/0F0F0F/F9FAFB?text=MS+Office"
                    alt="Microsoft Office Essentials"
                    width={480}
                    height={190}
                    loading="lazy"
                    className="w-full h-auto block transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <span className="font-body text-[10px] tracking-widest uppercase text-[#6B7280] border border-[#E5E7EB] px-2 py-0.5 rounded w-fit mb-4">
                    Beginner
                  </span>
                  <h3 className="font-heading font-bold text-lg text-[#0F0F0F] mb-2 leading-snug">
                    Microsoft Office Essentials
                  </h3>
                  <p className="font-body text-sm text-[#6B7280] mb-5">
                    7 modules · Certificate
                  </p>
                  <Link
                    href="/sign-up"
                    className="font-body text-sm font-medium text-[#3D006B] inline-flex items-center gap-1.5 hover:gap-3 transition-all mt-auto"
                  >
                    View course →
                  </Link>
                </div>
              </div>

              {/* Card 3 */}
              <div className="flex-1 border border-[#E5E7EB] rounded-md overflow-hidden group hover:border-[#3D006B]/30 transition-colors flex flex-col">
                <div className="overflow-hidden">
                  <Image
                    src="https://placehold.co/480x190/1F2937/F3F4F6?text=Online+Safety"
                    alt="Online Safety & Communication"
                    width={480}
                    height={190}
                    loading="lazy"
                    className="w-full h-auto block transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <span className="font-body text-[10px] tracking-widest uppercase text-[#6B7280] border border-[#E5E7EB] px-2 py-0.5 rounded w-fit mb-4">
                    Beginner
                  </span>
                  <h3 className="font-heading font-bold text-lg text-[#0F0F0F] mb-2 leading-snug">
                    Online Safety & Communication
                  </h3>
                  <p className="font-body text-sm text-[#6B7280] mb-5">
                    5 modules · Certificate
                  </p>
                  <Link
                    href="/sign-up"
                    className="font-body text-sm font-medium text-[#3D006B] inline-flex items-center gap-1.5 hover:gap-3 transition-all mt-auto"
                  >
                    View course →
                  </Link>
                </div>
              </div>

            </div>
          </div>

          {/* Mobile: "all courses" link */}
          <div className="mt-8 md:hidden">
            <Link
              href="/sign-up"
              className="font-body text-sm font-medium text-[#3D006B] inline-flex items-center gap-1.5"
            >
              All courses →
            </Link>
          </div>

        </div>
      </section>

      {/* ── 5. Certificate Moment ───────────────────────────────────────────── */}
      <section className="bg-[#3D006B] py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">

            {/* Left: copy */}
            <div className="lg:w-1/2">
              <span className="inline-block font-body text-[10px] tracking-widest uppercase text-[#F97316] border border-[#F97316]/40 px-3 py-1 rounded mb-8">
                Certified
              </span>
              <h2 className="font-heading font-black text-4xl lg:text-5xl text-white tracking-tight leading-tight mb-6">
                Your effort,
                <br />
                officially recognized.
              </h2>
              <p className="font-body text-lg text-[#C4B5D4] leading-relaxed max-w-md">
                Your name, your course, your date. A real document — issued
                by WithinTech Rwanda.
              </p>
            </div>

            {/* Right: certificate card */}
            <div className="lg:w-1/2">
              <CertificateCard />
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Steps — How It Works ─────────────────────────────────────────── */}
      <section id="how-it-works" className="bg-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <p className="font-heading text-xs tracking-widest uppercase text-[#3D006B] font-bold mb-4">
            How it works
          </p>
          <h2 className="font-heading font-black text-3xl lg:text-4xl text-[#0F0F0F] tracking-tight mb-16">
            Three steps. That is all.
          </h2>

          {/* Desktop: horizontal with connectors */}
          <div className="hidden md:flex items-start">
            <div className="flex-1">
              <div className="w-12 h-12 rounded-full bg-[#3D006B] flex items-center justify-center mb-6">
                <span className="font-heading text-white font-bold text-lg">1</span>
              </div>
              <h3 className="font-heading font-bold text-xl text-[#0F0F0F] mb-2">
                Get access
              </h3>
              <p className="font-body text-base text-[#6B7280] max-w-[200px]">
                Sign in and find your courses ready to go.
              </p>
            </div>

            <div className="flex-shrink-0 w-16 pt-6">
              <div className="border-t-2 border-dashed border-[#F97316]" />
            </div>

            <div className="flex-1">
              <div className="w-12 h-12 rounded-full bg-[#3D006B] flex items-center justify-center mb-6">
                <span className="font-heading text-white font-bold text-lg">2</span>
              </div>
              <h3 className="font-heading font-bold text-xl text-[#0F0F0F] mb-2">
                Study your modules
              </h3>
              <p className="font-body text-base text-[#6B7280] max-w-[200px]">
                Work at your own pace, on any device, anywhere.
              </p>
            </div>

            <div className="flex-shrink-0 w-16 pt-6">
              <div className="border-t-2 border-dashed border-[#F97316]" />
            </div>

            <div className="flex-1">
              <div className="w-12 h-12 rounded-full bg-[#3D006B] flex items-center justify-center mb-6">
                <span className="font-heading text-white font-bold text-lg">3</span>
              </div>
              <h3 className="font-heading font-bold text-xl text-[#0F0F0F] mb-2">
                Earn your certificate
              </h3>
              <p className="font-body text-base text-[#6B7280] max-w-[200px]">
                Pass the quiz and download your certificate instantly.
              </p>
            </div>
          </div>

          {/* Mobile: vertical with left border accent */}
          <div className="md:hidden flex flex-col gap-0">
            {[
              { n: "1", title: "Get access",            desc: "Sign in and find your courses ready to go." },
              { n: "2", title: "Study your modules",   desc: "Work at your own pace, on any device, anywhere." },
              { n: "3", title: "Earn your certificate",desc: "Pass the quiz and download your certificate instantly." },
            ].map(({ n, title, desc }) => (
              <div key={n} className="flex gap-6 border-l-2 border-[#3D006B] pl-6 pb-10 last:pb-0">
                <div className="flex-shrink-0 -ml-[25px] w-12 h-12 rounded-full bg-[#3D006B] flex items-center justify-center">
                  <span className="font-heading text-white font-bold text-lg">{n}</span>
                </div>
                <div className="pt-1">
                  <h3 className="font-heading font-bold text-xl text-[#0F0F0F] mb-2">{title}</h3>
                  <p className="font-body text-base text-[#6B7280]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. Final CTA ────────────────────────────────────────────────────── */}
      <section className="bg-white border-t border-[#E5E7EB] py-24 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row lg:items-center gap-16">

            {/* Left: copy + buttons */}
            <div className="lg:w-1/2">
              <h2 className="font-heading font-black text-4xl lg:text-5xl text-[#0F0F0F] tracking-tight mb-10 max-w-lg">
                Ready to start learning?
              </h2>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/sign-in"
                  className="font-body font-medium bg-[#3D006B] text-white px-7 py-3.5 rounded-md hover:bg-[#2A004A] transition-colors text-base"
                >
                  Start Learning
                </Link>
                <Link
                  href="#how-it-works"
                  className="font-body font-medium text-[#3D006B] border border-[#3D006B] px-7 py-3.5 rounded-md hover:bg-[#F3E8FF] transition-colors text-base"
                >
                  Learn More
                </Link>
              </div>
            </div>

            {/* Right: illustration */}
            <div className="lg:w-1/2 flex justify-center lg:justify-end">
              <div className="rounded-xl overflow-hidden shadow-lg ring-1 ring-purple-100 w-full max-w-md">
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

      {/* ── 8. Footer ────────────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-[#E5E7EB] py-14">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

            <div>
              <div className="mb-4">
                <Logo className="h-28" linked={false} />
              </div>
              <p className="font-body text-sm text-[#6B7280] mb-4">
                Learn. Prove it. Move forward.
              </p>
              <p className="font-body text-xs text-[#9CA3AF]" suppressHydrationWarning>© {new Date().getFullYear()} WithinTech</p>
            </div>

            <div>
              <p className="font-heading text-xs tracking-widest uppercase text-[#0F0F0F] font-bold mb-5">
                Quick Links
              </p>
              <ul className="flex flex-col gap-3">
                {[
                  { label: "Home", href: "/" },
                  { label: "Start Learning", href: "/sign-in" },
                  { label: "How It Works", href: "#how-it-works" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="font-body text-sm text-[#6B7280] hover:text-[#3D006B] transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="font-heading text-xs tracking-widest uppercase text-[#0F0F0F] font-bold mb-5">
                About
              </p>
              <p className="font-body text-sm text-[#6B7280] mb-3">
                A WithinTech Rwanda product
              </p>
              <a href="mailto:learn@withintech.rw" className="font-body text-sm text-[#3D006B] hover:underline">
                learn@withintech.rw
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

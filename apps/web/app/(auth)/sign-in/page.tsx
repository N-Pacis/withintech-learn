"use client";

import { FormEvent } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui";
import { Button, Input, FormField, PasswordInput } from "@/components/ui";

const features = [
  "Learn at your own pace, anytime",
  "Hands-on projects and quizzes",
  "Certificates to showcase your skills",
];

function SignInForm() {
  function handleSubmit(e: FormEvent) {
    e.preventDefault();
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left brand panel ─────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[42%] xl:w-[38%] flex-col bg-primary relative overflow-hidden">
        {/* Dot overlay */}
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        {/* Large blurred orbs */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white opacity-[0.05] blur-3xl" />
        <div className="absolute -bottom-15 -left-15 w-80 h-80 rounded-full bg-white opacity-[0.06] blur-3xl" />
        {/* Gradient fade at bottom */}
        <div className="absolute bottom-0 inset-x-0 h-40 bg-linear-to-t from-[#2A004A] to-transparent" />

        <div className="relative z-10 flex flex-col h-full px-10 py-10">
          <div className="flex-1 flex flex-col justify-center">
            <p className="font-heading font-black text-white text-4xl xl:text-5xl leading-tight tracking-tight mb-4">
              Learn at the
              <br />
              pace of
              <br />
              technology.
            </p>
            <p className="font-body text-white/60 text-sm leading-relaxed mb-10 max-w-xs">
              A platform built by WithinTech Rwanda to help you thrive in an
              AI-driven world.
            </p>

            <ul className="flex flex-col gap-3">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <span className="font-body text-sm text-white/80">{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="relative z-10 font-body text-xs text-white/30">
            © {new Date().getFullYear()} WithinTech Rwanda
          </p>
        </div>
      </div>

      {/* ── Right form panel ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-surface-shell px-6 py-12 relative">
        {/* Back link */}
        <Link
          href="/"
          className="absolute top-6 left-6 flex items-center gap-1.5 text-muted-contrast hover:text-primary transition-colors font-body text-sm"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        <div className="w-full max-w-sm">
          <div className="flex justify-center mb-10">
            <Logo className="h-20" linked={false} />
          </div>
          <h1 className="font-heading font-black text-2xl text-foreground mb-1">
            Welcome back
          </h1>
          <p className="font-body text-sm text-muted mb-7">
            Sign in to continue learning.
          </p>

          <p className="font-body text-sm text-warning bg-warning-soft px-4 py-2.5 rounded-lg mb-5">
            Sign-in is currently unavailable. Check back soon.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FormField label="Email" htmlFor="email" required>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                disabled
              />
            </FormField>

            <div>
              <label
                htmlFor="password"
                className="font-body text-sm font-medium text-foreground-soft block mb-1.5"
              >
                Password <span className="text-danger">*</span>
              </label>
              <PasswordInput id="password" placeholder="••••••••" disabled />
            </div>

            <Button type="submit" fullWidth disabled className="py-3 rounded-lg">
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return <SignInForm />;
}

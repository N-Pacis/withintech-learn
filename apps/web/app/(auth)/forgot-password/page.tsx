"use client";

import { useRef, useState, KeyboardEvent, ClipboardEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Logo,
  Button,
  Input,
  FormField,
  PasswordInput,
} from "@/components/ui";
import {
  useRequestPasswordReset,
  useVerifyResetOtp,
  useResetPassword,
} from "@/hooks/queries/auth";

type Step = "email" | "otp" | "password";

// ─── OTP boxes ────────────────────────────────────────────────────────────────

function OtpInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  function focus(i: number) {
    refs.current[i]?.focus();
  }

  function handleInput(i: number, char: string) {
    const digit = char.replace(/\D/, "");
    if (!digit) return;
    const next = [...value];
    next[i] = digit;
    onChange(next);
    if (i < 5) focus(i + 1);
  }

  function handleKeyDown(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (value[i]) {
        const next = [...value];
        next[i] = "";
        onChange(next);
      } else if (i > 0) {
        focus(i - 1);
      }
    } else if (e.key === "ArrowLeft" && i > 0) {
      focus(i - 1);
    } else if (e.key === "ArrowRight" && i < 5) {
      focus(i + 1);
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const digits = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6)
      .split("");
    const next = [...value];
    digits.forEach((d, i) => {
      next[i] = d;
    });
    onChange(next);
    const lastFilled = Math.min(digits.length, 5);
    focus(lastFilled);
  }

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ""}
          onChange={(e) => handleInput(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className="w-11 h-14 text-center font-heading font-black text-xl text-foreground rounded-xl border-2 border-border bg-surface-card outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 caret-transparent"
        />
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const { mutateAsync: requestReset, isPending: requestPending } =
    useRequestPasswordReset();
  const { mutateAsync: verifyOtp, isPending: verifyPending } =
    useVerifyResetOtp();
  const { mutateAsync: resetPassword, isPending: resetPending } =
    useResetPassword();

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await requestReset(email);
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter all 6 digits");
      return;
    }
    try {
      const data = await verifyOtp({ email, otp: code });
      setResetToken(data.resetToken);
      setStep("password");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid OTP");
      setOtp(Array(6).fill(""));
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      const data = await resetPassword({ resetToken, newPassword });
      router.push(data.user.role === "admin" ? "/admin" : "/learn");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-[42%] xl:w-[38%] flex-col bg-primary relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white opacity-[0.05] blur-3xl" />
        <div className="absolute -bottom-15 -left-15 w-80 h-80 rounded-full bg-white opacity-[0.06] blur-3xl" />
        <div className="absolute bottom-0 inset-x-0 h-40 bg-linear-to-t from-primary-dark to-transparent" />

        <div className="relative z-10 flex flex-col h-full px-10 py-10">
          <div className="flex-1 flex flex-col justify-center">
            <p className="font-heading font-black text-white text-4xl xl:text-5xl leading-tight tracking-tight mb-4">
              Regain access
              <br />
              and get back
              <br />
              to learning.
            </p>
            <p className="font-body text-white/60 text-sm leading-relaxed mb-10 max-w-xs">
              Recover your account in a few quick steps and continue right
              where you left off.
            </p>
          </div>

          <p className="relative z-10 font-body text-xs text-white/30">
            © {new Date().getFullYear()} WithinTech Rwanda
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center bg-surface-shell px-6 py-12 relative overflow-y-auto">
        <Link
          href="/sign-in"
          className="absolute top-6 left-6 z-10 flex items-center gap-2 text-muted-contrast hover:text-primary transition-colors font-body text-sm"
        >
          <svg
            width="18"
            height="18"
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
          Back to sign in
        </Link>

        <div className="w-full max-w-md">
          <div className="flex justify-center mb-10">
            <Logo className="h-20" linked={false} />
          </div>

          {/* ── Step 1: Email ── */}
          {step === "email" && (
            <>
              <h1 className="font-heading font-black text-2xl text-foreground mb-1">
                Forgot password?
              </h1>
              <p className="font-body text-sm text-muted mb-8">
                Enter your email and we&apos;ll send you a 6-digit code.
              </p>
              <form
                onSubmit={handleEmailSubmit}
                className="flex flex-col gap-5"
              >
                <FormField label="Email" htmlFor="email" required>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </FormField>
                {error && (
                  <p className="font-body text-sm text-danger bg-danger-soft px-4 py-2.5 rounded-lg">
                    {error}
                  </p>
                )}
                <Button
                  type="submit"
                  fullWidth
                  loading={requestPending}
                  className="py-3 rounded-lg"
                >
                  Send Code
                </Button>
              </form>
              <p className="font-body text-sm text-muted-contrast text-center mt-6">
                Remembered it?{" "}
                <Link
                  href="/sign-in"
                  className="text-primary font-medium hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </>
          )}

          {/* ── Step 2: OTP ── */}
          {step === "otp" && (
            <>
              <h1 className="font-heading font-black text-2xl text-foreground mb-1">
                Check your email
              </h1>
              <p className="font-body text-sm text-muted mb-2">
                We sent a 6-digit code to{" "}
                <span className="font-medium text-foreground">{email}</span>.
              </p>
              <p className="font-body text-xs text-muted-contrast mb-8">
                Don&apos;t see it? Check your spam folder.
              </p>

              <form onSubmit={handleOtpSubmit} className="flex flex-col gap-6">
                <OtpInput value={otp} onChange={setOtp} />

                {error && (
                  <p className="font-body text-sm text-danger bg-danger-soft px-4 py-2.5 rounded-lg text-center">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  fullWidth
                  loading={verifyPending}
                  className="py-3 rounded-lg"
                >
                  Verify Code
                </Button>

                <p className="font-body text-sm text-muted text-center">
                  Wrong email?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setStep("email");
                      setOtp(Array(6).fill(""));
                      setError("");
                    }}
                    className="text-primary font-medium hover:underline"
                  >
                    Go back
                  </button>
                </p>
              </form>
            </>
          )}

          {/* ── Step 3: New password ── */}
          {step === "password" && (
            <>
              <h1 className="font-heading font-black text-2xl text-foreground mb-1">
                Set new password
              </h1>
              <p className="font-body text-sm text-muted mb-8">
                Choose a strong password, at least 8 characters.
              </p>
              <form
                onSubmit={handlePasswordSubmit}
                className="flex flex-col gap-5"
              >
                <FormField label="New password" htmlFor="new-password" required>
                  <PasswordInput
                    id="new-password"
                    placeholder="Min. 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </FormField>
                <FormField
                  label="Confirm password"
                  htmlFor="confirm-password"
                  required
                >
                  <PasswordInput
                    id="confirm-password"
                    placeholder="Repeat your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </FormField>
                {error && (
                  <p className="font-body text-sm text-danger bg-danger-soft px-4 py-2.5 rounded-lg">
                    {error}
                  </p>
                )}
                <Button
                  type="submit"
                  fullWidth
                  loading={resetPending}
                  className="py-3 rounded-lg"
                >
                  Reset Password
                </Button>
                <p className="font-body text-sm text-muted text-center">
                  Need a different email?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setStep("email");
                      setOtp(Array(6).fill(""));
                      setResetToken("");
                      setNewPassword("");
                      setConfirmPassword("");
                      setError("");
                    }}
                    className="text-primary font-medium hover:underline"
                  >
                    Start over
                  </button>
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

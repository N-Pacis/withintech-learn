"use client";

import React, { useEffect, useLayoutEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GoogleLogin } from "@react-oauth/google";
import {
  Logo,
  Button,
  Input,
  FormField,
  PasswordInput,
  AuthLoader,
} from "@/components/ui";
import { useSignUp, useProfile, useGoogleAuth } from "@/hooks/queries/auth";
import { isAllowedEmail } from "@withintech-learn/shared";
import { getCachedProfile } from "@/lib/profile-cache";

function Req({ met, label }: { met: boolean; label: string }) {
  return (
    <li className="flex items-center gap-1.5">
      <span className={met ? "text-success" : "text-border-strong"}>
        {met ? (
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
          </svg>
        )}
      </span>
      <span
        className={`font-body text-xs ${met ? "text-success-dark" : "text-muted-contrast"}`}
      >
        {label}
      </span>
    </li>
  );
}

export default function SignUpPage() {
  const router = useRouter();
  const { mutateAsync: signUp } = useSignUp();
  const { mutateAsync: googleAuth, isPending: googlePending } = useGoogleAuth();
  const cachedProfile = getCachedProfile();
  const { data: profile, isFetching } = useProfile();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useLayoutEffect(() => {
    if (!profile && cachedProfile) {
      router.replace(cachedProfile.role === "admin" ? "/admin" : "/learn");
    }
  }, [cachedProfile, profile, router]);

  useEffect(() => {
    if (!profile || isFetching) return;
    router.replace(profile.role === "admin" ? "/admin" : "/learn");
  }, [profile, isFetching, router]);

  // Already logged in — show loader immediately; useEffect above will redirect
  if (cachedProfile) return <AuthLoader />;
  if (profile && !isFetching) return <AuthLoader />;

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = "Required";
    if (!form.lastName.trim()) errs.lastName = "Required";
    if (!form.email) errs.email = "Email is required";
    else if (!isAllowedEmail(form.email))
      errs.email = "Please use a personal or school email address.";
    if (form.password.length < 6) errs.password = "At least 6 characters";
    else if (!/\d/.test(form.password)) errs.password = "Must contain a number";
    if (form.confirmPassword !== form.password)
      errs.confirmPassword = "Passwords do not match";
    if (!agreedToTerms)
      errs.terms = "You must agree to the Terms of Service to continue";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    try {
      await signUp({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      });
      router.push(`/verify-email?email=${encodeURIComponent(form.email)}`);
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Something went wrong",
      );
      setIsSubmitting(false);
    }
  }

  async function handleGoogle(credential: string) {
    setServerError("");
    try {
      const data = await googleAuth(credential);
      router.push(data.user.role === "admin" ? "/admin" : "/learn");
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Google sign-in failed",
      );
    }
  }

  const hasMinLength = form.password.length >= 6;
  const hasNumber = /\d/.test(form.password);
  const passwordsMatch =
    form.confirmPassword !== "" && form.password === form.confirmPassword;

  return (
    <div className="min-h-screen flex">
      {/* ── Left brand panel ─────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[38%] xl:w-[34%] flex-col bg-primary relative overflow-hidden">
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
        <div className="absolute bottom-0 inset-x-0 h-40 bg-linear-to-t from-primary-dark to-transparent" />

        <div className="relative z-10 flex flex-col h-full px-10 py-10">
          <div className="flex-1 flex flex-col justify-center">
            <p className="font-heading font-black text-white text-4xl leading-tight tracking-tight mb-4">
              Your tech
              <br />
              journey starts
              <br />
              here.
            </p>
            <p className="font-body text-white/60 text-sm leading-relaxed max-w-xs">
              Join thousands of learners building real skills for the AI era, at
              your own pace.
            </p>
          </div>

          <p className="relative z-10 font-body text-xs text-white/30">
            © {new Date().getFullYear()} WithinTech Rwanda
          </p>
        </div>
      </div>

      {/* ── Right form panel ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-surface-shell px-6 py-12 relative overflow-y-auto">
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

        <div className="w-full max-w-md">
          <div className="flex justify-center mb-10">
            <Logo className="h-20" linked={false} />
          </div>
          <h1 className="font-heading font-black text-2xl text-foreground mb-1">
            Get Started
          </h1>
          <p className="font-body text-sm text-muted mb-6">
            Create your account to start learning.
          </p>

          <div
            className="flex justify-center mb-5"
            style={{
              opacity: googlePending ? 0.6 : 1,
              pointerEvents: googlePending ? "none" : "auto",
            }}
          >
            <GoogleLogin
              onSuccess={(res) => {
                if (res.credential) handleGoogle(res.credential);
              }}
              onError={() =>
                setServerError("Google sign-in failed. Please try again.")
              }
              width="448"
              theme="outline"
              size="large"
              text="signup_with"
              shape="rectangular"
            />
          </div>
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-surface-muted" />
            <span className="font-body text-xs text-border-strong">or</span>
            <div className="flex-1 h-px bg-surface-muted" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="First Name"
                htmlFor="firstName"
                required
                error={errors.firstName}
              >
                <Input
                  id="firstName"
                  placeholder="Jane"
                  value={form.firstName}
                  onChange={set("firstName")}
                  error={errors.firstName}
                />
              </FormField>
              <FormField
                label="Last Name"
                htmlFor="lastName"
                required
                error={errors.lastName}
              >
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={form.lastName}
                  onChange={set("lastName")}
                  error={errors.lastName}
                />
              </FormField>
            </div>

            <FormField
              label="Email"
              htmlFor="email"
              required
              error={errors.email}
            >
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={set("email")}
                error={errors.email}
              />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <FormField
                  label="Password"
                  htmlFor="password"
                  required
                  error={errors.password}
                >
                  <PasswordInput
                    id="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={set("password")}
                    error={errors.password}
                  />
                </FormField>
                {form.password && (
                  <ul className="flex flex-col gap-0.5 mt-1.5">
                    <Req met={hasMinLength} label="6+ characters" />
                    <Req met={hasNumber} label="Contains a number" />
                  </ul>
                )}
              </div>
              <div>
                <FormField
                  label="Confirm Password"
                  htmlFor="confirmPassword"
                  required
                  error={errors.confirmPassword}
                >
                  <PasswordInput
                    id="confirmPassword"
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={set("confirmPassword")}
                    error={errors.confirmPassword}
                  />
                </FormField>
                {form.confirmPassword && (
                  <p
                    className={`font-body text-xs flex items-center gap-1 mt-1.5 ${passwordsMatch ? "text-success-dark" : "text-danger"}`}
                  >
                    {passwordsMatch ? (
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    )}
                    {passwordsMatch ? "Passwords match" : "Do not match"}
                  </p>
                )}
              </div>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => {
                    setAgreedToTerms(e.target.checked);
                    if (errors.terms)
                      setErrors((prev) => ({ ...prev, terms: "" }));
                  }}
                  className="sr-only"
                />
                <div
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                    agreedToTerms
                      ? "bg-primary border-primary"
                      : errors.terms
                        ? "border-danger bg-surface-card"
                        : "border-border-strong bg-surface-card group-hover:border-primary"
                  }`}
                >
                  {agreedToTerms && (
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
                  )}
                </div>
              </div>
              <span className="font-body text-xs text-muted leading-relaxed">
                I agree to WithinTech Learn&apos;s{" "}
                <Link
                  href="/legal"
                  target="_blank"
                  className="text-primary hover:underline font-medium"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/legal#privacy"
                  target="_blank"
                  className="text-primary hover:underline font-medium"
                >
                  Privacy Policy
                </Link>
                , including the collection of my usage data and receiving
                course-related emails.
              </span>
            </label>
            {errors.terms && (
              <p className="font-body text-xs text-danger -mt-2 pl-7">
                {errors.terms}
              </p>
            )}

            {serverError && (
              <p className="font-body text-sm text-danger bg-danger-soft px-4 py-2.5 rounded-lg">
                {serverError}
              </p>
            )}

            <Button
              type="submit"
              fullWidth
              loading={isSubmitting}
              disabled={
                !form.firstName.trim() ||
                !form.lastName.trim() ||
                !form.email.trim() ||
                !form.password ||
                !form.confirmPassword ||
                !agreedToTerms
              }
              className="py-3 rounded-lg"
            >
              Get Started
            </Button>
          </form>

          <p className="font-body text-sm text-muted-contrast text-center mt-5">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="text-primary font-medium hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

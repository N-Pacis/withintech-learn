"use client";

import {
  FormEvent,
  useEffect,
  useLayoutEffect,
  useState,
  Suspense,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { GoogleLogin } from "@react-oauth/google";
import { Logo, AuthLoader } from "@/components/ui";
import { useLogin, useProfile, useGoogleAuth } from "@/hooks/queries/auth";
import { Button, Input, FormField, PasswordInput } from "@/components/ui";
import { getCachedProfile } from "@/lib/profile-cache";

// Redirect to `next` only if the user's role permits it; otherwise fall back to their home.
function resolveDestination(next: string | null, role: string): string {
  const home = role === "admin" ? "/admin" : "/learn";
  if (!next) return home;
  // Relative paths only — reject anything without a leading slash
  if (!next.startsWith("/")) return home;
  if (next.startsWith("/admin") && role !== "admin") return home;
  if (next.startsWith("/learn") && role === "admin") return home;
  return next;
}

// Validates and returns the docs URL an admin should land on after login.
// path comes from nginx via ?path= and is always a relative URI from the docs server.
function resolveDocsReturn(path: string | null): string {
  const fallback = "https://docs.learn.withintech.org";
  if (!path) return fallback;
  // Allow only safe relative paths — no protocol, no host, no CRLF
  if (!/^\/[A-Za-z0-9\-._~/?#[\]@!$&'()*+,;=%]*$/.test(path)) return fallback;
  return `https://docs.learn.withintech.org${path}`;
}

// Use window.location for external URLs, router for internal ones
function navigateTo(destination: string, router: ReturnType<typeof useRouter>): void {
  if (destination.startsWith("http")) {
    window.location.href = destination;
  } else {
    router.replace(destination);
  }
}

const features = [
  "Learn at your own pace, anytime",
  "Hands-on projects and quizzes",
  "Certificates to showcase your skills",
];

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const returnTo = searchParams.get("returnTo");
  const docsPath = searchParams.get("path");
  const cachedProfile = getCachedProfile();
  const { mutateAsync: login } = useLogin();
  const { mutateAsync: googleAuth, isPending: googlePending } = useGoogleAuth();
  // initialData seeds from localStorage — data is available synchronously if cached
  const { data: profile, isFetching } = useProfile();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function destination(role: string): string {
    if (returnTo === "docs" && role === "admin") return resolveDocsReturn(docsPath);
    return resolveDestination(next, role);
  }

  useLayoutEffect(() => {
    if (!profile && cachedProfile) {
      navigateTo(destination(cachedProfile.role), router);
    }
  }, [cachedProfile, profile, router, next, returnTo, docsPath]);

  useEffect(() => {
    if (!profile || isFetching) return;
    navigateTo(destination(profile.role), router);
  }, [profile, isFetching, router, next, returnTo, docsPath]);

  // Already logged in — show loader immediately; useEffect above will redirect
  if (cachedProfile) return <AuthLoader />;
  if (profile && !isFetching) return <AuthLoader />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const data = await login({ email, password });
      if ("requiresEmailVerification" in data) {
        router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
        return;
      }
      navigateTo(destination(data.user.role), router);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Invalid email or password",
      );
      setIsSubmitting(false);
    }
  }

  async function handleGoogle(credential: string) {
    setError("");
    try {
      const data = await googleAuth(credential);
      navigateTo(destination(data.user.role), router);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
    }
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
              onError={() => setError("Google sign-in failed. Please try again.")}
              width="384"
              theme="outline"
              size="large"
              text="signin_with"
              shape="rectangular"
            />
          </div>
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-surface-muted" />
            <span className="font-body text-xs text-border-strong">or</span>
            <div className="flex-1 h-px bg-surface-muted" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="font-body text-sm font-medium text-foreground-soft"
                >
                  Password <span className="text-danger">*</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="font-body text-xs text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <PasswordInput
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="font-body text-sm text-danger bg-danger-soft px-4 py-2.5 rounded-lg">
                {error}
              </p>
            )}

            <Button
              type="submit"
              fullWidth
              loading={isSubmitting}
              className="py-3 rounded-lg"
            >
              Sign In
            </Button>
          </form>

          <p className="font-body text-sm text-muted-contrast text-center mt-6">
            Don&apos;t have an account?{" "}
            <Link
              href="/sign-up"
              className="text-primary font-medium hover:underline"
            >
              Get Started
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<AuthLoader />}>
      <SignInForm />
    </Suspense>
  );
}

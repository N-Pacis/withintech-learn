"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui";
import {
  useValidateSetPasswordToken,
  useSetPassword,
} from "@/hooks/queries/auth";

function SetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    data: validation,
    isLoading: isValidating,
    error: validationError,
  } = useValidateSetPasswordToken(token);

  const { mutate: setPasswordMutation, isPending: isSettingPassword } =
    useSetPassword();

  // Password validation
  const passwordErrors: string[] = [];
  if (password.length > 0) {
    if (password.length < 8)
      passwordErrors.push("Password must be at least 8 characters");
    if (!/[A-Z]/.test(password))
      passwordErrors.push("Password must contain an uppercase letter");
    if (!/[a-z]/.test(password))
      passwordErrors.push("Password must contain a lowercase letter");
    if (!/\d/.test(password))
      passwordErrors.push("Password must contain a number");
  }

  const passwordsMatch =
    password === confirmPassword && password.length > 0 && confirmPassword.length > 0;

  const canSubmit =
    password.length >= 8 &&
    passwordErrors.length === 0 &&
    passwordsMatch &&
    !isSettingPassword;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !canSubmit) return;

    setPasswordMutation(
      { token, password },
      {
        onSuccess: () => {
          setIsSuccess(true);
          toast.success("Password set successfully! Redirecting...");
          setTimeout(() => {
            router.push("/learn/challenges");
          }, 2000);
        },
        onError: (err: Error) => {
          toast.error(err.message);
        },
      },
    );
  };

  // Loading state while validating token
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="font-body text-muted">Verifying your link...</p>
        </div>
      </div>
    );
  }

  // Error state - invalid or expired token
  if (validationError || !validation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-4">
        <div className="w-full max-w-md bg-surface-card rounded-2xl shadow-xl p-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="font-heading font-bold text-xl text-foreground mb-2">
              Link Expired or Invalid
            </h1>
            <p className="font-body text-muted mb-6">
              This password setup link has expired or is invalid. Please use the
              forgot password feature to set your password.
            </p>
            <Button onClick={() => router.push("/forgot-password")}>
              Go to Forgot Password
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-4">
        <div className="w-full max-w-md bg-surface-card rounded-2xl shadow-xl p-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="font-heading font-bold text-xl text-foreground mb-2">
              Password Set Successfully!
            </h1>
            <p className="font-body text-muted mb-2">
              Your password has been set and you&apos;re now logged in.
            </p>
            <p className="font-body text-sm text-muted">
              Redirecting to challenges...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div className="w-full max-w-md bg-surface-card rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-heading font-bold text-2xl text-foreground mb-2">
            Set Your Password
          </h1>
          <p className="font-body text-muted">
            Welcome, {validation.firstName}! Create a secure password to
            activate your account.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Password field */}
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-sm font-medium text-foreground">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-contrast" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-border bg-surface text-foreground font-body text-sm placeholder:text-muted-contrast focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-contrast hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {password.length > 0 && passwordErrors.length > 0 && (
              <ul className="flex flex-col gap-0.5">
                {passwordErrors.map((err, i) => (
                  <li
                    key={i}
                    className="font-body text-xs text-red-500 flex items-center gap-1"
                  >
                    <AlertCircle className="w-3 h-3" />
                    {err}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Confirm Password field */}
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-sm font-medium text-foreground">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-contrast" />
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-border bg-surface text-foreground font-body text-sm placeholder:text-muted-contrast focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-contrast hover:text-foreground transition-colors"
              >
                {showConfirm ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="font-body text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Passwords do not match
              </p>
            )}
            {passwordsMatch && (
              <p className="font-body text-xs text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Passwords match
              </p>
            )}
          </div>

          {/* Password requirements hint */}
          <div className="bg-surface-panel rounded-lg p-3 border border-border">
            <p className="font-body text-xs font-medium text-foreground-soft mb-2">
              Password requirements:
            </p>
            <ul className="flex flex-col gap-1">
              {[
                { label: "At least 8 characters", met: password.length >= 8 },
                {
                  label: "One uppercase letter",
                  met: /[A-Z]/.test(password),
                },
                {
                  label: "One lowercase letter",
                  met: /[a-z]/.test(password),
                },
                { label: "One number", met: /\d/.test(password) },
              ].map((req, i) => (
                <li
                  key={i}
                  className={`font-body text-xs flex items-center gap-1.5 ${
                    req.met ? "text-emerald-600" : "text-muted-contrast"
                  }`}
                >
                  <CheckCircle2 className={`w-3 h-3 ${req.met ? "opacity-100" : "opacity-40"}`} />
                  {req.label}
                </li>
              ))}
            </ul>
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={!canSubmit}
            loading={isSettingPassword}
            className="w-full"
          >
            Set Password & Continue
          </Button>
        </form>

        {/* Footer note */}
        <p className="font-body text-xs text-muted text-center mt-6">
          This link expires in 20 days. Need help?{" "}
          <a href="/forgot-password" className="text-primary hover:underline">
            Use forgot password
          </a>
        </p>
      </div>
    </div>
  );
}

// Loading fallback for Suspense
function SetPasswordLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="font-body text-muted">Loading...</p>
      </div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function SetPasswordPage() {
  return (
    <Suspense fallback={<SetPasswordLoading />}>
      <SetPasswordForm />
    </Suspense>
  );
}

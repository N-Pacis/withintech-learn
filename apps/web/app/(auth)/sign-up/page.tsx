'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Logo, Button, Input, FormField, Card, PasswordInput } from '@/components/ui';
import { useSignUp } from '@/hooks/queries/auth';
import { isDisposableEmail } from '@withintech-learn/shared';

function Req({ met, label }: { met: boolean; label: string }) {
  return (
    <li className="flex items-center gap-1.5">
      <span className={met ? 'text-green-500' : 'text-[#9CA3AF]'}>
        {met ? (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
          </svg>
        )}
      </span>
      <span className={`font-body text-xs ${met ? 'text-green-600' : 'text-[#9CA3AF]'}`}>{label}</span>
    </li>
  );
}

function PasswordRequirements({ password }: { password: string }) {
  const hasMinLength = password.length >= 6;
  const hasNumber = /\d/.test(password);

  return (
    <ul className="flex flex-col gap-1 mt-1">
      <Req met={hasMinLength} label="At least 6 characters" />
      <Req met={hasNumber} label="Contains a number" />
    </ul>
  );
}

function PasswordMatchHint({ password, confirm }: { password: string; confirm: string }) {
  if (!confirm) return null;
  const matches = password === confirm;
  return (
    <p className={`font-body text-xs flex items-center gap-1.5 mt-1 ${matches ? 'text-green-600' : 'text-red-500'}`}>
      {matches ? (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      )}
      {matches ? 'Passwords match' : 'Passwords do not match'}
    </p>
  );
}

export default function SignUpPage() {
  const router = useRouter();
  const { mutateAsync: signUp, isPending } = useSignUp();

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = 'First name is required';
    if (!form.lastName.trim()) errs.lastName = 'Last name is required';
    if (!form.email) errs.email = 'Email is required';
    else if (isDisposableEmail(form.email)) errs.email = 'Please use a permanent email address.';
    if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    else if (!/\d/.test(form.password)) errs.password = 'Password must contain at least one number';
    if (form.confirmPassword !== form.password) errs.confirmPassword = 'Passwords do not match';
    if (!agreedToTerms) errs.terms = 'You must agree to the Terms of Service to continue';
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError('');
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    try {
      await signUp({ firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password });
      router.push('/learn');
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Something went wrong');
    }
  }

  return (
    <div
      className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden py-8"
      style={{
        backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
        backgroundSize: '22px 22px',
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, transparent 40%, white 100%)' }}
      />

      <Link
        href="/"
        className="absolute top-6 left-6 z-10 flex items-center gap-2 text-[#6B7280] hover:text-[#3D006B] transition-colors font-body text-sm"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      <div className="relative z-10 w-full max-w-lg mx-4">
        <Card shadow="lg" className="px-8 py-10 ring-1 ring-[#E5E7EB] rounded-2xl">

          <div className="mb-6 py-2">
            <Logo className="h-16" linked={false} />
          </div>

          <h1 className="font-heading font-black text-2xl text-[#0F0F0F] mb-1">Get Started</h1>
          <p className="font-body text-sm text-[#6B7280] mb-8">Create your account to start learning.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="First Name" htmlFor="firstName" required error={errors.firstName}>
                <Input
                  id="firstName"
                  placeholder="Jane"
                  value={form.firstName}
                  onChange={set('firstName')}
                  error={errors.firstName}
                />
              </FormField>
              <FormField label="Last Name" htmlFor="lastName" required error={errors.lastName}>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={form.lastName}
                  onChange={set('lastName')}
                  error={errors.lastName}
                />
              </FormField>
            </div>

            <FormField label="Email" htmlFor="email" required error={errors.email}>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={set('email')}
                error={errors.email}
              />
            </FormField>

            <FormField label="Password" htmlFor="password" required error={errors.password}>
              <PasswordInput
                id="password"
                placeholder="••••••••"
                value={form.password}
                onChange={set('password')}
                error={errors.password}
              />
              <PasswordRequirements password={form.password} />
            </FormField>

            <FormField label="Confirm Password" htmlFor="confirmPassword" required error={errors.confirmPassword}>
              <PasswordInput
                id="confirmPassword"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={set('confirmPassword')}
                error={errors.confirmPassword}
              />
              <PasswordMatchHint password={form.password} confirm={form.confirmPassword} />
            </FormField>

            {/* Terms agreement */}
            <div className="flex flex-col gap-1">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative mt-0.5 flex-shrink-0">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedToTerms}
                    onChange={(e) => {
                      setAgreedToTerms(e.target.checked);
                      if (errors.terms) setErrors((prev) => ({ ...prev, terms: '' }));
                    }}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                    agreedToTerms
                      ? 'bg-[#3D006B] border-[#3D006B]'
                      : errors.terms
                      ? 'border-red-400 bg-white'
                      : 'border-[#D1D5DB] bg-white group-hover:border-[#3D006B]'
                  }`}>
                    {agreedToTerms && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="font-body text-xs text-[#6B7280] leading-relaxed">
                  I agree to WithinTech Learn&apos;s{' '}
                  <Link href="/legal" target="_blank" className="text-[#3D006B] hover:underline font-medium">
                    Terms of Service
                  </Link>
                  {' '}and{' '}
                  <Link href="/legal#privacy" target="_blank" className="text-[#3D006B] hover:underline font-medium">
                    Privacy Policy
                  </Link>
                  , including the collection of my usage data and receiving course-related emails.
                </span>
              </label>
              {errors.terms && (
                <p className="font-body text-xs text-red-500 pl-7">{errors.terms}</p>
              )}
            </div>

            {serverError && (
              <p className="font-body text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-lg">
                {serverError}
              </p>
            )}

            <Button
              type="submit"
              fullWidth
              loading={isPending}
              disabled={
                !form.firstName.trim() ||
                !form.lastName.trim() ||
                !form.email.trim() ||
                !form.password ||
                !form.confirmPassword ||
                !agreedToTerms
              }
              className="mt-1 py-3 rounded-lg"
            >
              Get Started
            </Button>
          </form>

          <p className="font-body text-sm text-[#6B7280] text-center mt-6">
            Already have an account?{' '}
            <Link href="/sign-in" className="text-[#3D006B] font-medium hover:underline">
              Sign In
            </Link>
          </p>

        </Card>
      </div>
    </div>
  );
}

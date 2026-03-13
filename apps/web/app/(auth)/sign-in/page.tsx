'use client';

import { FormEvent, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/ui';
import { useLogin } from '@/hooks/queries/auth';
import { Button, Input, FormField, Card, PasswordInput } from '@/components/ui';
import { useProfile } from '@/hooks/queries/auth';

export default function SignInPage() {
  const router = useRouter();
  const { mutateAsync: login, isPending } = useLogin();
  const { data: profile } = useProfile();

  useEffect(() => {
    if (!profile) return;
    router.replace(profile.role === 'admin' ? '/admin' : '/learn');
  }, [profile, router]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const data = await login({ email, password });
      router.push(data.user.role === 'admin' ? '/admin' : '/learn');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password');
    }
  }

  return (
    <div
      className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden"
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

      <div className="relative z-10 w-full max-w-md mx-4">
        <Card shadow="lg" className="px-8 py-10 ring-1 ring-[#E5E7EB] rounded-2xl">

          <div className="mb-6 py-2">
            <Logo className="h-16" linked={false} />
          </div>

          <h1 className="font-heading font-black text-2xl text-[#0F0F0F] mb-1">Welcome back</h1>
          <p className="font-body text-sm text-[#6B7280] mb-8">Sign in to continue learning.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
                <label htmlFor="password" className="font-body text-sm font-medium text-[#374151]">
                  Password <span className="text-red-500">*</span>
                </label>
                <Link href="/forgot-password" className="font-body text-xs text-[#3D006B] hover:underline">
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
              <p className="font-body text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-lg">
                {error}
              </p>
            )}

            <Button type="submit" fullWidth loading={isPending} className="mt-1 py-3 rounded-lg">
              Sign In
            </Button>
          </form>

          <p className="font-body text-sm text-[#6B7280] text-center mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/sign-up" className="text-[#3D006B] font-medium hover:underline">
              Get Started
            </Link>
          </p>

        </Card>
      </div>
    </div>
  );
}

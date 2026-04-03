'use client';

import { FormEvent, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GoogleLogin } from '@react-oauth/google';
import { Logo } from '@/components/ui';
import { useLogin, useGoogleAuth, useProfile } from '@/hooks/queries/auth';
import { Button, Input, FormField, PasswordInput } from '@/components/ui';

const features = [
  'Learn at your own pace, anytime',
  'Hands-on projects and quizzes',
  'Certificates to showcase your skills',
];

export default function SignInPage() {
  const router = useRouter();
  const { mutateAsync: login } = useLogin();
  const { mutateAsync: googleAuth, isPending: googlePending } = useGoogleAuth();
  const { data: profile } = useProfile();

  useEffect(() => {
    if (!profile) return;
    router.replace(profile.role === 'admin' ? '/admin' : '/learn');
  }, [profile, router]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const data = await login({ email, password });
      if ('requiresEmailVerification' in data) {
        router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
        return;
      }
      router.push(data.user.role === 'admin' ? '/admin' : '/learn');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password');
      setIsSubmitting(false);
    }
  }

  async function handleGoogle(credential: string) {
    setError('');
    try {
      const data = await googleAuth(credential);
      router.push(data.user.role === 'admin' ? '/admin' : '/learn');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed');
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Left brand panel ─────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[42%] xl:w-[38%] flex-col bg-[#3D006B] relative overflow-hidden">
        {/* Dot overlay */}
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        {/* Large blurred orbs */}
        <div className="absolute top-[-80px] right-[-80px] w-72 h-72 rounded-full bg-white opacity-[0.05] blur-3xl" />
        <div className="absolute bottom-[-60px] left-[-60px] w-80 h-80 rounded-full bg-white opacity-[0.06] blur-3xl" />
        {/* Gradient fade at bottom */}
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#2A004A] to-transparent" />

        <div className="relative z-10 flex flex-col h-full px-10 py-10">
          <div className="flex-1 flex flex-col justify-center">
            <p className="font-heading font-black text-white text-4xl xl:text-5xl leading-tight tracking-tight mb-4">
              Learn at the<br />pace of<br />technology.
            </p>
            <p className="font-body text-white/60 text-sm leading-relaxed mb-10 max-w-xs">
              A platform built by WithinTech Rwanda to help you thrive in an AI-driven world.
            </p>

            <ul className="flex flex-col gap-3">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
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
      <div className="flex-1 flex flex-col items-center justify-center bg-white px-6 py-12 relative">
        {/* Back link */}
        <Link
          href="/"
          className="absolute top-6 left-6 flex items-center gap-1.5 text-[#9CA3AF] hover:text-[#3D006B] transition-colors font-body text-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        <div className="w-full max-w-sm">
          <div className="flex justify-center mb-10">
            <Logo className="h-20" linked={false} />
          </div>
          <h1 className="font-heading font-black text-2xl text-[#0F0F0F] mb-1">Welcome back</h1>
          <p className="font-body text-sm text-[#6B7280] mb-7">Sign in to continue learning.</p>

          {/* Google — hidden until enabled */}
          {/* <div
            className="flex justify-center mb-5"
            style={{ opacity: googlePending ? 0.6 : 1, pointerEvents: googlePending ? 'none' : 'auto' }}
          >
            <GoogleLogin
              onSuccess={(res) => { if (res.credential) handleGoogle(res.credential); }}
              onError={() => setError('Google sign-in failed. Please try again.')}
              width="384"
              theme="outline"
              size="large"
              text="signin_with"
              shape="rectangular"
            />
          </div>
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-[#F3F4F6]" />
            <span className="font-body text-xs text-[#D1D5DB]">or</span>
            <div className="flex-1 h-px bg-[#F3F4F6]" />
          </div> */}

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

            <Button type="submit" fullWidth loading={isSubmitting} className="py-3 rounded-lg">
              Sign In
            </Button>
          </form>

          <p className="font-body text-sm text-[#9CA3AF] text-center mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/sign-up" className="text-[#3D006B] font-medium hover:underline">
              Get Started
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
}

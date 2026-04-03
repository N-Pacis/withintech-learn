'use client';

import { useRef, useState, KeyboardEvent, ClipboardEvent, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Logo, Button, Card } from '@/components/ui';
import { useVerifyEmail, useResendEmailVerification } from '@/hooks/queries/auth';
import { apiFetch } from '@/lib/api';

function OtpInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  function focus(i: number) {
    refs.current[i]?.focus();
  }

  function handleInput(i: number, char: string) {
    const digit = char.replace(/\D/, '');
    if (!digit) return;
    const next = [...value];
    next[i] = digit;
    onChange(next);
    if (i < 5) focus(i + 1);
  }

  function handleKeyDown(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      if (value[i]) {
        const next = [...value];
        next[i] = '';
        onChange(next);
      } else if (i > 0) {
        focus(i - 1);
      }
    } else if (e.key === 'ArrowLeft' && i > 0) {
      focus(i - 1);
    } else if (e.key === 'ArrowRight' && i < 5) {
      focus(i + 1);
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
    const next = [...value];
    digits.forEach((d, i) => { next[i] = d; });
    onChange(next);
    const lastFilled = Math.min(digits.length, 5);
    focus(lastFilled);
  }

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ''}
          onChange={(e) => handleInput(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className="w-11 h-14 text-center font-heading font-black text-xl text-[#0F0F0F] rounded-xl border-2 border-[#E5E7EB] bg-white outline-none transition-all focus:border-[#3D006B] focus:ring-4 focus:ring-[#3D006B]/10 caret-transparent"
        />
      ))}
    </div>
  );
}

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';

  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [error, setError] = useState('');
  const [resendSuccess, setResendSuccess] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const queryClient = useQueryClient();
  const { mutateAsync: verifyEmail, isPending: verifyPending } = useVerifyEmail();
  const { mutateAsync: resend, isPending: resendPending } = useResendEmailVerification();

  useEffect(() => {
    if (!email) router.replace('/sign-in');
  }, [email, router]);

  useEffect(() => {
    if (countdown <= 0) return;
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const code = otp.join('');
    if (code.length < 6) { setError('Please enter all 6 digits'); return; }
    try {
      await verifyEmail({ email, otp: code });
      await apiFetch('/auth/logout', { method: 'POST' });
      queryClient.clear();
      router.push('/sign-in');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code');
      setOtp(Array(6).fill(''));
    }
  }

  async function handleResend() {
    setError('');
    setResendSuccess(false);
    try {
      await resend(email);
      setResendSuccess(true);
      setOtp(Array(6).fill(''));
      setCountdown(60);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend code');
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
        href="/sign-in"
        className="absolute top-6 left-6 z-10 flex items-center gap-2 text-[#6B7280] hover:text-[#3D006B] transition-colors font-body text-sm"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
        </svg>
        Back to sign in
      </Link>

      <div className="relative z-10 w-full max-w-md mx-4">
        <Card shadow="lg" className="px-8 py-10 ring-1 ring-[#E5E7EB] rounded-2xl">

          <div className="mb-6 py-2">
            <Logo className="h-16" linked={false} />
          </div>

          <h1 className="font-heading font-black text-2xl text-[#0F0F0F] mb-1">Verify your email</h1>
          <p className="font-body text-sm text-[#6B7280] mb-2">
            We sent a 6-digit code to <span className="font-medium text-[#0F0F0F]">{email}</span>.
          </p>
          <p className="font-body text-xs text-[#9CA3AF] mb-8">Don&apos;t see it? Check your spam folder.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <OtpInput value={otp} onChange={setOtp} />

            {error && (
              <p className="font-body text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-lg text-center">{error}</p>
            )}

            {resendSuccess && (
              <p className="font-body text-sm text-green-600 bg-green-50 px-4 py-2.5 rounded-lg text-center">
                A new code has been sent to your email.
              </p>
            )}

            <Button type="submit" fullWidth loading={verifyPending} className="py-3 rounded-lg">
              Verify Email
            </Button>

            <p className="font-body text-sm text-[#6B7280] text-center">
              Didn&apos;t receive the code?{' '}
              {countdown > 0 ? (
                <span className="text-[#9CA3AF]">Resend in {countdown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendPending}
                  className="text-[#3D006B] font-medium hover:underline disabled:opacity-50"
                >
                  {resendPending ? 'Sending...' : 'Resend code'}
                </button>
              )}
            </p>
          </form>

        </Card>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}

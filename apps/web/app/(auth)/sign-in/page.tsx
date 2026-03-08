'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { setTokens } from '@/lib/auth';
import type { User } from '@/lib/auth';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await apiFetch<{ accessToken: string; refreshToken: string; user: User }>(
        '/auth/login',
        { method: 'POST', body: JSON.stringify({ email, password }) },
      );

      if (!res.success || !res.data) {
        setError(res.message ?? 'Invalid email or password');
        return;
      }

      setTokens(res.data.accessToken, res.data.refreshToken);

      if (res.data.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/learn');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
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
      {/* Radial fade */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, white 100%)',
        }}
      />

      {/* Back button */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-10 flex items-center gap-2 text-[#6B7280] hover:text-[#3D006B] transition-colors font-body text-sm"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5" />
          <path d="M12 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white rounded-2xl shadow-xl ring-1 ring-[#E5E7EB] px-8 py-10">

          {/* Logo */}
          <div className="flex items-baseline gap-0 mb-8">
            <span className="font-heading font-bold text-xl text-[#3D006B]">WithinTech</span>
            <span className="font-heading font-bold text-xl text-[#F97316]">Learn</span>
          </div>

          <h1 className="font-heading font-black text-2xl text-[#0F0F0F] mb-1">
            Welcome back
          </h1>
          <p className="font-body text-sm text-[#6B7280] mb-8">
            Sign in to continue learning.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="font-body text-sm font-medium text-[#0F0F0F]">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="font-body text-sm w-full px-4 py-3 rounded-lg border border-[#E5E7EB] bg-white text-[#0F0F0F] placeholder-[#9CA3AF] outline-none focus:border-[#3D006B] focus:ring-2 focus:ring-[#3D006B]/10 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="font-body text-sm font-medium text-[#0F0F0F]">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="font-body text-sm w-full px-4 py-3 rounded-lg border border-[#E5E7EB] bg-white text-[#0F0F0F] placeholder-[#9CA3AF] outline-none focus:border-[#3D006B] focus:ring-2 focus:ring-[#3D006B]/10 transition-all"
              />
            </div>

            {error && (
              <p className="font-body text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="font-body font-medium w-full bg-[#3D006B] text-white py-3 rounded-lg hover:bg-[#2A004A] disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-sm mt-1"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}

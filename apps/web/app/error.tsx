"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center mb-6">
        <AlertCircle size={24} className="text-red-500" />
      </div>
      <h1 className="font-heading font-black text-2xl text-foreground mb-2">
        Something went wrong
      </h1>
      <p className="font-body text-sm text-muted max-w-sm mb-8">
        An unexpected error occurred. Try again or go back to the homepage.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 font-body text-sm font-medium bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary-dark transition-colors"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-body text-sm font-medium bg-surface-card text-foreground-soft border border-border px-5 py-2.5 rounded-lg hover:bg-surface-subtle transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}

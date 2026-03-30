'use client';

import Link from 'next/link';
import { Button } from '@/components/ui';
import { ShowcaseForm } from '../components/ShowcaseForm';

export default function NewShowcasePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/learn/showcase">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to Showcase
          </Link>
        </Button>
        <h1 className="font-heading font-bold text-2xl text-[#0F0F0F]">Submit a Project</h1>
        <p className="font-body text-sm text-[#6B7280] mt-1">
          Share your work with the community. All submissions are reviewed before going public.
        </p>
      </div>

      <ShowcaseForm />
    </div>
  );
}

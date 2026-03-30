'use client';

import { useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import {
  usePublicShowcaseProjects,
  CHALLENGE_CATEGORIES,
  type ChallengeCategory,
} from '@/hooks/queries/showcase';
import { PageLoader, Pagination, Select, type SelectOption } from '@/components/ui';
import { ShowcaseCard } from './components/ShowcaseCard';
import { CategoryIcon } from '@/components/showcase/CategoryIcon';
import { cn } from '@/lib/utils';

const SORT_OPTIONS: SelectOption[] = [
  { value: 'newest',    label: 'Recently added' },
  { value: 'oldest',    label: 'Oldest first'   },
  { value: 'mostLiked', label: 'Most liked'      },
];

const LIMIT = 12;

export default function PublicShowcasePage() {
  const [category, setCategory] = useState<ChallengeCategory | ''>('');
  const [sort, setSort]         = useState<'newest' | 'oldest' | 'mostLiked'>('newest');
  const [search, setSearch]     = useState('');
  const debouncedSearch         = useDebounce(search, 300);
  const [page, setPage]         = useState(1);

  const { data, isLoading } = usePublicShowcaseProjects({
    page,
    limit: LIMIT,
    category: category || undefined,
    search: debouncedSearch || undefined,
    sort,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-3xl text-[#0F0F0F] mb-2">Student Showcase</h1>
        <p className="font-body text-[#6B7280]">Projects built by students to solve real-world challenges</p>
      </div>

      {/* Search + sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search projects, technologies, descriptions…"
            className="w-full pl-9 pr-3 py-2 text-sm font-body border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D006B]/20 focus:border-[#3D006B] text-[#0F0F0F] placeholder:text-[#9CA3AF]"
          />
        </div>
        <Select
          options={SORT_OPTIONS}
          value={sort}
          onChange={(v) => { setSort(v as typeof sort); setPage(1); }}
          className="w-48"
        />
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => { setCategory(''); setPage(1); }}
          className={cn(
            'text-xs font-body font-medium px-3 py-1.5 rounded-full border transition-colors',
            category === ''
              ? 'bg-[#3D006B] text-white border-[#3D006B]'
              : 'border-[#E5E7EB] text-[#6B7280] hover:border-[#3D006B] hover:text-[#3D006B]',
          )}
        >
          All
        </button>
        {CHALLENGE_CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => { setCategory(c === category ? '' : c); setPage(1); }}
            className={cn(
              'inline-flex items-center gap-1.5 text-xs font-body font-medium px-3 py-1.5 rounded-full border transition-colors',
              category === c
                ? 'bg-[#3D006B] text-white border-[#3D006B]'
                : 'border-[#E5E7EB] text-[#6B7280] hover:border-[#3D006B] hover:text-[#3D006B]',
            )}
          >
            <CategoryIcon category={c as ChallengeCategory} size={11} />
            {c}
          </button>
        ))}
      </div>

      {isLoading ? (
        <PageLoader type="cards" />
      ) : !data?.projects.length ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-14 h-14 rounded-full bg-[#F3E8FF] flex items-center justify-center mb-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3D006B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <h3 className="font-heading font-bold text-lg text-[#0F0F0F] mb-1">No projects found</h3>
          <p className="font-body text-sm text-[#6B7280]">
            {search || category ? 'Try different filters.' : 'No approved projects yet.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {data.projects.map((p) => (
              <ShowcaseCard key={p.id} project={p} />
            ))}
          </div>

          {data.total > LIMIT && (
            <Pagination
              page={page}
              totalPages={Math.ceil(data.total / LIMIT)}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}

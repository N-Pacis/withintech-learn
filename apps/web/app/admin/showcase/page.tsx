'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from 'sonner';
import {
  useAdminShowcaseProjects,
  useAdminDeleteShowcaseProject,
  CHALLENGE_CATEGORIES,
  type ShowcaseStatus,
  type ChallengeCategory,
  type ShowcaseProject,
} from '@/hooks/queries/showcase';
import { Button, Tabs, PageLoader, Pagination, Badge, Select, type Tab, type SelectOption } from '@/components/ui';
import { StatusBadge } from '@/components/showcase/StatusBadge';
import { CategoryIcon } from '@/components/showcase/CategoryIcon';
import { ProjectThumbnail } from '@/components/showcase/ProjectThumbnail';

type TabValue = 'all' | ShowcaseStatus;

const TABS: Tab[] = [
  { label: 'All',      value: 'all'      },
  { label: 'Pending',  value: 'PENDING'  },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Archived', value: 'ARCHIVED' },
];

const CATEGORY_OPTIONS: SelectOption[] = [
  { value: '', label: 'All categories' },
  ...CHALLENGE_CATEGORIES.map((c) => ({ value: c, label: c })),
];

const LIMIT = 20;

function ProjectRow({ project, onDelete, deleting }: { project: ShowcaseProject; onDelete: (id: string) => void; deleting: boolean }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-[#E5E7EB] hover:shadow-sm transition-shadow">
      <div className="w-16 h-12 rounded-lg overflow-hidden bg-[#F9FAFB] shrink-0">
        <ProjectThumbnail url={project.thumbnailUrl} title={project.title} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="font-body text-sm font-semibold text-[#0F0F0F] truncate">{project.title}</p>
          {project.featuredAt && (
            <Badge variant="orange" size="sm">Featured</Badge>
          )}
        </div>
        <p className="font-body text-xs text-[#9CA3AF]">
          {project.author.firstName} {project.author.lastName}
          {project.categories.length > 0 && (
            <span className="ml-1.5 inline-flex items-center gap-1">
              · <CategoryIcon category={project.categories[0].category} size={10} className="inline" />
              {project.categories[0].category}
              {project.categories.length > 1 && ` +${project.categories.length - 1}`}
            </span>
          )}
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <StatusBadge status={project.status} />
        <span className="font-body text-xs text-[#9CA3AF] flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          {project._count?.likes ?? 0}
        </span>
        <Button asChild variant="secondary" size="sm">
          <Link href={`/admin/showcase/${project.id}`}>
            {project.status === 'PENDING' ? 'Review' : 'View'}
          </Link>
        </Button>
        <Button variant="danger" size="sm" loading={deleting} onClick={() => onDelete(project.id)}>
          Delete
        </Button>
      </div>
    </div>
  );
}

export default function AdminShowcasePage() {
  const [tab, setTab]           = useState<TabValue>('PENDING');
  const [page, setPage]         = useState(1);
  const [search, setSearch]     = useState('');
  const debouncedSearch         = useDebounce(search, 300);
  const [category, setCategory] = useState<ChallengeCategory | ''>('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading } = useAdminShowcaseProjects({
    page,
    limit: LIMIT,
    status: tab === 'all' ? undefined : tab,
    category: category || undefined,
    search: debouncedSearch || undefined,
  });

  const { mutateAsync: del } = useAdminDeleteShowcaseProject();

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project permanently? All images will be removed.')) return;
    setDeletingId(id);
    try {
      await del(id);
      toast.success('Project deleted');
    } catch {
      toast.error('Failed to delete project');
    } finally {
      setDeletingId(null);
    }
  };

  const handleTabChange = (val: string) => {
    setTab(val as TabValue);
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="font-heading font-bold text-2xl text-[#0F0F0F]">Showcase</h1>
        <p className="font-body text-sm text-[#6B7280] mt-1">Review and moderate student project submissions</p>
      </div>

      <Tabs tabs={TABS} value={tab} onChange={handleTabChange} className="mb-4" />

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by title or author…"
            className="w-full pl-9 pr-3 py-2 text-sm font-body border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D006B]/20 focus:border-[#3D006B] text-[#0F0F0F] placeholder:text-[#9CA3AF]"
          />
        </div>
        <Select
          options={CATEGORY_OPTIONS}
          value={category}
          onChange={(v) => { setCategory(v as ChallengeCategory | ''); setPage(1); }}
          placeholder="All categories"
          className="w-52"
        />
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
            {tab === 'PENDING' ? 'No pending submissions to review.' : 'No projects match your filters.'}
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 mb-6">
            {data.projects.map((p) => (
              <ProjectRow
                key={p.id}
                project={p}
                onDelete={handleDelete}
                deleting={deletingId === p.id}
              />
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

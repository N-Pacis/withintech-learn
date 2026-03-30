'use client';

import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  useStudentShowcaseProjects,
  useArchiveShowcaseProject,
  type ShowcaseStatus,
} from '@/hooks/queries/showcase';
import { Button, Tabs, PageLoader, Pagination, type Tab } from '@/components/ui';
import { ShowcaseProjectCard } from './components/ShowcaseProjectCard';

type TabValue = 'all' | ShowcaseStatus;

const TABS: Tab[] = [
  { label: 'All',      value: 'all' },
  { label: 'Pending',  value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Archived', value: 'ARCHIVED' },
];

const LIMIT = 12;

export default function StudentShowcasePage() {
  const [tab, setTab]         = useState<TabValue>('all');
  const [page, setPage]       = useState(1);
  const [archivingId, setArchivingId] = useState<string | null>(null);

  const { data, isLoading } = useStudentShowcaseProjects({
    page,
    limit: LIMIT,
    status: tab === 'all' ? undefined : tab,
  });

  const { mutateAsync: archive } = useArchiveShowcaseProject();

  const handleArchive = async (id: string) => {
    if (!confirm('Archive this project? It will be hidden from the public gallery.')) return;
    setArchivingId(id);
    try {
      await archive(id);
      toast.success('Project archived');
    } catch {
      toast.error('Failed to archive project');
    } finally {
      setArchivingId(null);
    }
  };

  const handleTabChange = (val: string) => {
    setTab(val as TabValue);
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-bold text-2xl text-[#0F0F0F]">My Showcase</h1>
          <p className="font-body text-sm text-[#6B7280] mt-1">Share projects that address real-world challenges</p>
        </div>
        <Button asChild size="md">
          <Link href="/learn/showcase/new">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Project
          </Link>
        </Button>
      </div>

      <Tabs tabs={TABS} value={tab} onChange={handleTabChange} className="mb-6" />

      {isLoading ? (
        <PageLoader type="cards" />
      ) : !data?.projects.length ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-14 h-14 rounded-full bg-[#F3E8FF] flex items-center justify-center mb-5">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3D006B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <h3 className="font-heading font-bold text-lg text-[#0F0F0F] mb-2">
            {tab === 'all' ? 'No projects yet' : `No ${tab.toLowerCase()} projects`}
          </h3>
          {tab === 'all' && (
            <>
              <p className="font-body text-sm text-[#6B7280] mb-5 max-w-xs">Submit a project to share your work with the community.</p>
              <Button asChild size="md">
                <Link href="/learn/showcase/new">Submit your first project</Link>
              </Button>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
            {data.projects.map((p) => (
              <ShowcaseProjectCard
                key={p.id}
                project={p}
                onArchive={p.status !== 'ARCHIVED' ? handleArchive : undefined}
                archiving={archivingId === p.id}
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

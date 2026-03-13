'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useModule, useUpdateModule } from '@/hooks/queries/modules';
import { useCourse } from '@/hooks/queries/courses';
import { Button, Card, CardHeader, PageLoader, Input, Tabs, type Tab } from '@/components/ui';
import { ModuleBlocksEditor } from '@/components/admin/ModuleBlocksEditor';
import { QuizBuilder } from '@/components/admin/QuizBuilder';

type TabValue = 'content' | 'quiz';

const TABS: Tab<TabValue>[] = [
  { label: 'Content', value: 'content' },
  { label: 'Quiz', value: 'quiz' },
];

export default function ModuleDetailPage() {
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>();
  const { data: module, isLoading, error: loadError } = useModule(moduleId);
  const { data: course } = useCourse(courseId);
  const { mutateAsync: updateModule, isPending: savingTitle } = useUpdateModule(courseId);
  const isDraft = !course || course.status === 'draft';

  const [activeTab, setActiveTab] = useState<TabValue>('content');
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const [titleError, setTitleError] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (module && !editingTitle) setTitleValue(module.title);
  }, [module, editingTitle]);

  useEffect(() => {
    if (editingTitle) titleInputRef.current?.focus();
  }, [editingTitle]);

  async function handleSaveTitle() {
    if (!titleValue.trim()) { setTitleError('Title cannot be empty.'); return; }
    try {
      await updateModule({ id: moduleId, title: titleValue.trim() });
      setEditingTitle(false);
      setTitleError('');
    } catch (err) {
      setTitleError(err instanceof Error ? err.message : 'Failed to save.');
    }
  }

  if (isLoading) return <PageLoader type="detail" className="p-8 lg:p-12" />;
  if (loadError || !module) {
    return <div className="p-8"><p className="font-body text-sm text-red-500">Module not found.</p></div>;
  }

  return (
    <div className="p-4 sm:p-8 lg:p-12 max-w-3xl">

      {/* Back */}
      <Link
        href={`/admin/courses/${courseId}`}
        className="inline-flex items-center gap-2 font-body text-sm text-[#6B7280] hover:text-[#3D006B] transition-colors mb-8"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
        </svg>
        Back to course
      </Link>

      {/* Module header card */}
      <Card shadow="sm" className="mb-6">
        <CardHeader>
          <span className="font-body text-xs text-[#9CA3AF] uppercase tracking-wide block mb-1">
            Module {module.orderIndex}
          </span>

          {editingTitle ? (
            <div className="flex flex-col gap-2 mt-1">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <Input
                  ref={titleInputRef}
                  value={titleValue}
                  onChange={(e) => { setTitleValue(e.target.value); setTitleError(''); }}
                  maxLength={120}
                  className="w-full"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTitle();
                    if (e.key === 'Escape') { setEditingTitle(false); setTitleValue(module.title); }
                  }}
                />
                <div className="flex items-center gap-2 shrink-0">
                  <Button size="sm" loading={savingTitle} onClick={handleSaveTitle}>Save</Button>
                  <Button variant="ghost" size="sm" onClick={() => { setEditingTitle(false); setTitleValue(module.title); setTitleError(''); }}>
                    Cancel
                  </Button>
                </div>
              </div>
              {titleError && <p className="font-body text-xs text-red-500">{titleError}</p>}
            </div>
          ) : (
            <div className="flex items-center gap-3 group mt-1">
              <h1 className="font-heading font-black text-2xl text-[#0F0F0F] leading-tight flex-1">
                {module.title}
              </h1>
              <button
                onClick={() => setEditingTitle(true)}
                className="sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-[#F3E8FF] text-[#6B7280] hover:text-[#3D006B] shrink-0"
                title="Rename module"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs tabs={TABS} value={activeTab} onChange={setActiveTab} className="mb-6" />

      {/* Tab content */}
      {activeTab === 'content' && <ModuleBlocksEditor moduleId={moduleId} />}
      {activeTab === 'quiz' && (
        isDraft ? (
          <QuizBuilder moduleId={moduleId} />
        ) : (
          <div className="flex flex-col items-center text-center py-12 border-2 border-dashed border-[#E5E7EB] rounded-xl">
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mb-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h3 className="font-heading font-bold text-sm text-[#0F0F0F] mb-1">Quiz locked</h3>
            <p className="font-body text-xs text-[#9CA3AF] max-w-xs">
              This course is {course?.status}. Quizzes cannot be added or modified after a course is published.
            </p>
          </div>
        )
      )}

    </div>
  );
}

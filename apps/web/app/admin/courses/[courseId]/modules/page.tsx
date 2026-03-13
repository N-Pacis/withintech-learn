'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useCourse } from '@/hooks/queries/courses';
import { useModules, useDeleteModule, useReorderModules, type Module } from '@/hooks/queries/modules';
import { Button, Card, PageLoader, ReorderableList } from '@/components/ui';
import { cn } from '@/lib/utils';

function ModuleRow({
  mod,
  courseId,
  reordering,
  isDragging,
  isDragOver,
  onDelete,
}: {
  mod: Module;
  courseId: string;
  reordering: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  onDelete: (id: string) => void;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-4 border-b border-[#E5E7EB] last:border-0 transition-all group',
        isDragging && 'bg-[#F3E8FF]/30',
        isDragOver && 'bg-[#F3E8FF]/50 border-l-2 border-l-[#3D006B]',
        !isDragging && !isDragOver && 'hover:bg-[#FAFAFA]',
      )}
    >
      {/* Drag handle */}
      <span className={cn('shrink-0 text-[#D1D5DB] group-hover:text-[#9CA3AF] transition-colors', reordering ? 'cursor-wait' : 'cursor-grab active:cursor-grabbing')}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="9" cy="5" r="1.5" /><circle cx="15" cy="5" r="1.5" />
          <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
          <circle cx="9" cy="19" r="1.5" /><circle cx="15" cy="19" r="1.5" />
        </svg>
      </span>

      {/* Order badge */}
      <span className="w-6 h-6 rounded-full bg-[#F3E8FF] flex items-center justify-center shrink-0">
        <span className="font-heading font-bold text-xs text-[#3D006B]">{mod.orderIndex}</span>
      </span>

      {/* Title */}
      <Link
        href={`/admin/courses/${courseId}/modules/${mod.id}`}
        className="flex-1 font-body text-sm text-[#0F0F0F] truncate hover:text-[#3D006B] transition-colors"
      >
        {mod.title}
      </Link>

      {/* Actions */}
      <div className="flex items-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
        {confirming ? (
          <>
            <Button variant="danger" size="sm" onClick={() => { onDelete(mod.id); setConfirming(false); }}>Confirm</Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>Cancel</Button>
          </>
        ) : (
          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => setConfirming(true)}>
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}

export default function ModulesListPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { data: course, isLoading: courseLoading } = useCourse(courseId);
  const { data: modules = [], isLoading: modulesLoading } = useModules(courseId);
  const { mutate: deleteModule } = useDeleteModule(courseId);
  const { mutate: reorderModules, isPending: reordering } = useReorderModules(courseId);

  const isLoading = courseLoading || modulesLoading;
  const sortedModules = [...modules].sort((a, b) => a.orderIndex - b.orderIndex);

  if (isLoading) return <PageLoader type="list" className="p-4 sm:p-8 lg:p-12" />;

  return (
    <div className="p-4 sm:p-8 lg:p-12 max-w-3xl">

      {/* Back */}
      <Link href="/admin/courses" className="inline-flex items-center gap-2 font-body text-sm text-[#6B7280] hover:text-[#3D006B] transition-colors mb-8">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
        </svg>
        Back to courses
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div className="min-w-0">
          <p className="font-body text-xs text-[#9CA3AF] uppercase tracking-wide mb-1">Course</p>
          <h1 className="font-heading font-black text-3xl text-[#0F0F0F] leading-tight truncate">
            {course?.title ?? '…'}
          </h1>
        </div>
        <Button variant="ghost" size="sm" className="shrink-0 mt-1" asChild>
          <Link href={`/admin/courses/${courseId}`}>Edit course</Link>
        </Button>
      </div>

      {/* Modules */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-bold text-lg text-[#0F0F0F]">
            Modules
            {sortedModules.length > 0 && (
              <span className="text-[#9CA3AF] font-normal ml-2 text-base">({sortedModules.length})</span>
            )}
          </h2>
          <Button size="sm" asChild>
            <Link href={`/admin/courses/${courseId}/modules/new`}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Module
            </Link>
          </Button>
        </div>

        {sortedModules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-[#E5E7EB] rounded-xl text-center">
            <div className="w-12 h-12 rounded-full bg-[#F3E8FF] flex items-center justify-center mb-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3D006B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <p className="font-body text-sm text-[#6B7280] mb-3">No modules yet.</p>
            <Button size="sm" asChild>
              <Link href={`/admin/courses/${courseId}/modules/new`}>Add first module</Link>
            </Button>
          </div>
        ) : (
          <>
            <p className="font-body text-xs text-[#9CA3AF] flex items-center gap-1.5">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="9" cy="5" r="1.5" /><circle cx="15" cy="5" r="1.5" />
                <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
                <circle cx="9" cy="19" r="1.5" /><circle cx="15" cy="19" r="1.5" />
              </svg>
              Drag to reorder · Click a module to edit its content
            </p>
            <Card>
              <ReorderableList
                items={sortedModules}
                onReorder={(items) => reorderModules(items)}
                renderItem={(mod, { isDragging, isDragOver }) => (
                  <ModuleRow
                    mod={mod}
                    courseId={courseId}
                    reordering={reordering}
                    isDragging={isDragging}
                    isDragOver={isDragOver}
                    onDelete={(id) => deleteModule(id)}
                  />
                )}
              />
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

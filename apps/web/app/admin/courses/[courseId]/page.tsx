'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useCourse, useUpdateCourse, usePublishCourse, useUploadThumbnail } from '@/hooks/queries/courses';
import { useModules, useDeleteModule, useReorderModules, type Module } from '@/hooks/queries/modules';
import { Button, Badge, PageLoader, Card, CardHeader, CardBody, FormField, Input, Textarea, FileUpload } from '@/components/ui';
import { cn } from '@/lib/utils';

// ─── Draggable module list ────────────────────────────────────────────────────

function ModuleList({
  modules,
  courseId,
  onDelete,
  onReorder,
  reordering,
}: {
  modules: Module[];
  courseId: string;
  onDelete: (id: string) => void;
  onReorder: (items: { id: string; orderIndex: number }[]) => void;
  reordering: boolean;
}) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  function handleDrop(targetId: string) {
    if (!dragId || dragId === targetId) {
      setDragId(null);
      setDragOverId(null);
      return;
    }
    const drag = modules.find(m => m.id === dragId);
    const target = modules.find(m => m.id === targetId);
    if (!drag || !target) return;

    const items = modules.map(m => {
      if (m.id === dragId) return { id: m.id, orderIndex: target.orderIndex };
      if (m.id === targetId) return { id: m.id, orderIndex: drag.orderIndex };
      return { id: m.id, orderIndex: m.orderIndex };
    });
    onReorder(items);
    setDragId(null);
    setDragOverId(null);
  }

  return (
    <Card>
      {modules.map((mod) => {
        const isDragging = dragId === mod.id;
        const isOver = dragOverId === mod.id && dragId !== mod.id;
        const confirming = confirmingId === mod.id;

        return (
          <div
            key={mod.id}
            draggable
            onDragStart={() => setDragId(mod.id)}
            onDragEnd={() => { setDragId(null); setDragOverId(null); }}
            onDragOver={(e) => { e.preventDefault(); setDragOverId(mod.id); }}
            onDragLeave={() => setDragOverId(null)}
            onDrop={() => handleDrop(mod.id)}
            className={cn(
              'flex items-center gap-3 px-4 py-4 border-b border-[#E5E7EB] last:border-0 transition-all group',
              isDragging && 'opacity-40 bg-[#F3E8FF]/30',
              isOver && 'bg-[#F3E8FF]/50 border-l-2 border-l-[#3D006B]',
              !isDragging && !isOver && 'hover:bg-[#FAFAFA]',
            )}
          >
            {/* Drag handle */}
            <span
              className={cn(
                'shrink-0 text-[#D1D5DB] group-hover:text-[#9CA3AF] transition-colors',
                reordering ? 'cursor-wait' : 'cursor-grab active:cursor-grabbing',
              )}
            >
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
            <p className="flex-1 font-body text-sm text-[#0F0F0F] truncate">{mod.title}</p>

            {/* Actions */}
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/admin/courses/${courseId}/modules/${mod.id}`}>Edit</Link>
              </Button>
              {confirming ? (
                <div className="flex items-center gap-1.5">
                  <Button variant="danger" size="sm" onClick={() => { onDelete(mod.id); setConfirmingId(null); }}>
                    Confirm
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setConfirmingId(null)}>Cancel</Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => setConfirmingId(mod.id)}
                >
                  Delete
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { data: course, isLoading } = useCourse(courseId);
  const { data: modules = [], isLoading: modulesLoading } = useModules(courseId);
  const { mutateAsync: updateCourse, isPending: saving } = useUpdateCourse(courseId);
  const { mutate: togglePublish, isPending: publishing } = usePublishCourse();
  const { mutateAsync: uploadThumbnail, isPending: uploadingThumb } = useUploadThumbnail();
  const { mutate: deleteModule } = useDeleteModule(courseId);
  const { mutate: reorderModules, isPending: reordering } = useReorderModules(courseId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dirty, setDirty] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [publishError, setPublishError] = useState('');

  useEffect(() => {
    if (course) {
      setTitle(course.title);
      setDescription(course.description ?? '');
    }
  }, [course]);

  function handleFieldChange(field: 'title' | 'description', value: string) {
    if (field === 'title') setTitle(value);
    else setDescription(value);
    setDirty(true);
    setSaveError('');
  }

  async function handleSave() {
    if (!title.trim()) { setSaveError('Title cannot be empty.'); return; }
    setSaveError('');
    try {
      await updateCourse({ title: title.trim(), description: description.trim() || undefined });
      setDirty(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save.');
    }
  }

  async function handleThumbnailSelect(file: File) {
    try { await uploadThumbnail({ id: courseId, file }); } catch { /* non-fatal */ }
  }

  function handlePublish() {
    setPublishError('');
    togglePublish(
      { id: courseId, publish: !course!.isPublished },
      { onError: (err) => setPublishError(err instanceof Error ? err.message : 'Failed.') },
    );
  }

  if (isLoading) return <PageLoader type="detail" className="p-8 lg:p-12" />;
  if (!course) {
    return <div className="p-8"><p className="font-body text-sm text-red-500">Course not found.</p></div>;
  }

  const sortedModules = [...modules].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div className="p-8 lg:p-12 max-w-3xl">

      <Link href="/admin/courses" className="inline-flex items-center gap-2 font-body text-sm text-[#6B7280] hover:text-[#3D006B] transition-colors mb-8">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
        </svg>
        Back to courses
      </Link>

      {/* Page title */}
      <div className="flex items-center gap-3 mb-8">
        <h1 className="font-heading font-black text-3xl text-[#0F0F0F] leading-tight flex-1 min-w-0 truncate">
          {course.title}
        </h1>
        <Badge variant={course.isPublished ? 'success' : 'gray'} size="md" className="shrink-0">
          {course.isPublished ? 'Published' : 'Draft'}
        </Badge>
      </div>

      <div className="flex flex-col gap-5">

        {/* Details */}
        <Card shadow="sm">
          <CardHeader className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-base text-[#0F0F0F]">Details</h2>
            {dirty && <Button size="sm" loading={saving} onClick={handleSave}>Save changes</Button>}
          </CardHeader>
          <CardBody className="flex flex-col gap-5">
            <FormField label="Title" htmlFor="edit-title" required>
              <Input id="edit-title" value={title} onChange={(e) => handleFieldChange('title', e.target.value)} maxLength={120} />
            </FormField>
            <FormField label="Description" htmlFor="edit-desc">
              <Textarea
                id="edit-desc"
                value={description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                rows={3}
                maxLength={1000}
                placeholder="A short description of the course."
              />
              {description && (
                <p className="font-body text-xs text-[#9CA3AF] text-right mt-1">{description.length} / 1000</p>
              )}
            </FormField>
            {saveError && (
              <p className="font-body text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-lg">{saveError}</p>
            )}
          </CardBody>
        </Card>

        {/* Thumbnail */}
        <Card shadow="sm">
          <CardHeader>
            <div>
              <h2 className="font-heading font-bold text-base text-[#0F0F0F]">Thumbnail</h2>
              <p className="font-body text-xs text-[#9CA3AF] mt-0.5">
                {uploadingThumb ? 'Uploading…' : 'Click or drag to replace.'}
              </p>
            </div>
          </CardHeader>
          <CardBody>
            <FileUpload
              accept={['image/jpeg', 'image/png', 'image/webp']}
              maxSizeMb={5}
              currentUrl={course.thumbnailUrl}
              onFileSelect={handleThumbnailSelect}
              uploading={uploadingThumb}
            />
          </CardBody>
        </Card>

        {/* Publish */}
        <Card shadow="sm">
          <CardBody className="flex items-center justify-between gap-4">
            <div>
              <p className="font-heading font-bold text-sm text-[#0F0F0F]">
                {course.isPublished ? 'This course is live' : 'This course is a draft'}
              </p>
              <p className="font-body text-xs text-[#9CA3AF] mt-0.5">
                {course.isPublished
                  ? 'Students can enrol and access all modules.'
                  : 'Only admins can see this course. All modules must have content to publish.'}
              </p>
              {publishError && <p className="font-body text-xs text-red-500 mt-1">{publishError}</p>}
            </div>
            <Button
              variant={course.isPublished ? 'secondary' : 'primary'}
              size="sm"
              loading={publishing}
              onClick={handlePublish}
              className="shrink-0"
            >
              {course.isPublished ? 'Unpublish' : 'Publish'}
            </Button>
          </CardBody>
        </Card>

        {/* Modules */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-lg text-[#0F0F0F]">
              Modules
              {modules.length > 0 && (
                <span className="text-[#9CA3AF] font-normal ml-2 text-base">({modules.length})</span>
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

          {modulesLoading ? (
            <PageLoader type="list" count={3} />
          ) : sortedModules.length === 0 ? (
            <Card padding="md" className="text-center">
              <p className="font-body text-sm text-[#6B7280] mb-3">No modules yet.</p>
              <Button size="sm" asChild>
                <Link href={`/admin/courses/${courseId}/modules/new`}>Add first module</Link>
              </Button>
            </Card>
          ) : (
            <>
              <p className="font-body text-xs text-[#9CA3AF] mb-2 flex items-center gap-1.5">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="9" cy="5" r="1.5" /><circle cx="15" cy="5" r="1.5" />
                  <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
                  <circle cx="9" cy="19" r="1.5" /><circle cx="15" cy="19" r="1.5" />
                </svg>
                Drag to reorder
              </p>
              <ModuleList
                modules={sortedModules}
                courseId={courseId}
                onDelete={(id) => deleteModule(id)}
                onReorder={(items) => reorderModules(items)}
                reordering={reordering}
              />
            </>
          )}
        </div>

      </div>
    </div>
  );
}

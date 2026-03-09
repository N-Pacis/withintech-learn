'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useModule, useUpdateModule, useDeleteBlock, useReorderBlocks } from '@/hooks/queries/modules';
import { Button, Card, PageLoader, Input } from '@/components/ui';
import { cn } from '@/lib/utils';
import { BlockCard } from './_components/BlockCard';
import { AddTextBlockForm, AddImageBlockForm } from './_components/AddBlockForms';

export default function ModuleDetailPage() {
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>();
  const { data: module, isLoading, error: loadError } = useModule(moduleId);
  const { mutateAsync: updateModule, isPending: savingTitle } = useUpdateModule(courseId);
  const { mutate: deleteBlock } = useDeleteBlock(moduleId);
  const { mutate: reorderBlocks } = useReorderBlocks(moduleId);

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const [titleError, setTitleError] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);

  const [addingType, setAddingType] = useState<'text' | 'image' | null>(null);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [deletingBlockId, setDeletingBlockId] = useState<string | null>(null);

  // Drag state
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

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

  function handleDrop(targetId: string) {
    if (!dragId || dragId === targetId || !module) {
      setDragId(null); setDragOverId(null); return;
    }
    const drag = module.blocks.find(b => b.id === dragId);
    const target = module.blocks.find(b => b.id === targetId);
    if (!drag || !target) return;

    const items = module.blocks.map(b => {
      if (b.id === dragId) return { id: b.id, orderIndex: target.orderIndex };
      if (b.id === targetId) return { id: b.id, orderIndex: drag.orderIndex };
      return { id: b.id, orderIndex: b.orderIndex };
    });
    reorderBlocks(items);
    setDragId(null); setDragOverId(null);
  }

  if (isLoading) return <PageLoader type="content" className="p-8 lg:p-12" />;
  if (loadError || !module) {
    return <div className="p-8"><p className="font-body text-sm text-red-500">Module not found.</p></div>;
  }

  const sortedBlocks = [...module.blocks].sort((a, b) => a.orderIndex - b.orderIndex);
  const nextOrder = sortedBlocks.length + 1;

  return (
    <div className="p-8 lg:p-12 max-w-3xl">

      {/* Back */}
      <Link
        href={`/admin/courses/${courseId}/modules`}
        className="inline-flex items-center gap-2 font-body text-sm text-[#6B7280] hover:text-[#3D006B] transition-colors mb-8"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
        </svg>
        Back to modules
      </Link>

      {/* Module header */}
      <div className="mb-8">
        <span className="font-body text-xs text-[#9CA3AF] uppercase tracking-wide">Module {module.orderIndex}</span>

        {editingTitle ? (
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex items-center gap-2">
              <Input
                ref={titleInputRef}
                value={titleValue}
                onChange={(e) => { setTitleValue(e.target.value); setTitleError(''); }}
                maxLength={120}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTitle();
                  if (e.key === 'Escape') { setEditingTitle(false); setTitleValue(module.title); }
                }}
              />
              <Button size="sm" loading={savingTitle} onClick={handleSaveTitle}>Save</Button>
              <Button variant="ghost" size="sm" onClick={() => { setEditingTitle(false); setTitleValue(module.title); setTitleError(''); }}>
                Cancel
              </Button>
            </div>
            {titleError && <p className="font-body text-xs text-red-500">{titleError}</p>}
          </div>
        ) : (
          <div className="flex items-center gap-3 mt-2 group">
            <h1 className="font-heading font-black text-3xl text-[#0F0F0F] leading-tight flex-1">{module.title}</h1>
            <button
              onClick={() => setEditingTitle(true)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-[#F3E8FF] text-[#6B7280] hover:text-[#3D006B]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Content blocks */}
      <div className="flex flex-col gap-4">
        <h2 className="font-heading font-bold text-lg text-[#0F0F0F]">
          Content
          {sortedBlocks.length > 0 && (
            <span className="text-[#9CA3AF] font-normal ml-2 text-base">
              ({sortedBlocks.length} block{sortedBlocks.length !== 1 ? 's' : ''})
            </span>
          )}
        </h2>

        {sortedBlocks.length > 0 && (
          <>
            <p className="font-body text-xs text-[#9CA3AF] -mt-2 flex items-center gap-1.5">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="9" cy="5" r="1.5" /><circle cx="15" cy="5" r="1.5" />
                <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
                <circle cx="9" cy="19" r="1.5" /><circle cx="15" cy="19" r="1.5" />
              </svg>
              Drag to reorder
            </p>
            <Card>
              {sortedBlocks.map((block) => (
                <BlockCard
                  key={block.id}
                  block={block}
                  moduleId={moduleId}
                  isEditing={editingBlockId === block.id}
                  isDeleting={deletingBlockId === block.id}
                  isDragging={dragId === block.id}
                  isDragOver={dragOverId === block.id && dragId !== block.id}
                  onEdit={() => { setDeletingBlockId(null); setAddingType(null); setEditingBlockId(block.id); }}
                  onCancelEdit={() => setEditingBlockId(null)}
                  onDelete={() => { setEditingBlockId(null); setDeletingBlockId(block.id); }}
                  onConfirmDelete={() => { deleteBlock(block.id); setDeletingBlockId(null); }}
                  onCancelDelete={() => setDeletingBlockId(null)}
                  onDragStart={() => setDragId(block.id)}
                  onDragEnd={() => { setDragId(null); setDragOverId(null); }}
                  onDragOver={(e) => { e.preventDefault(); setDragOverId(block.id); }}
                  onDragLeave={() => setDragOverId(null)}
                  onDrop={() => handleDrop(block.id)}
                />
              ))}
            </Card>
          </>
        )}

        {sortedBlocks.length === 0 && !addingType && (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-[#E5E7EB] rounded-xl">
            <div className="w-12 h-12 rounded-full bg-[#F3E8FF] flex items-center justify-center mb-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3D006B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <p className="font-body text-sm text-[#6B7280] mb-1">No content blocks yet.</p>
            <p className="font-body text-xs text-[#9CA3AF]">Add text or image blocks below.</p>
          </div>
        )}

        {addingType === 'text' && (
          <AddTextBlockForm moduleId={moduleId} nextOrder={nextOrder} onDone={() => setAddingType(null)} />
        )}
        {addingType === 'image' && (
          <AddImageBlockForm moduleId={moduleId} nextOrder={nextOrder} onDone={() => setAddingType(null)} />
        )}

        {!addingType && (
          <div className={cn('flex items-center gap-3', sortedBlocks.length === 0 && 'justify-center')}>
            <Button variant="secondary" size="sm" onClick={() => { setEditingBlockId(null); setDeletingBlockId(null); setAddingType('text'); }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Text Block
            </Button>
            <Button variant="secondary" size="sm" onClick={() => { setEditingBlockId(null); setDeletingBlockId(null); setAddingType('image'); }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Image Block
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

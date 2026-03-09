'use client';

import { useState } from 'react';
import { useModule, useDeleteBlock, useReorderBlocks } from '@/hooks/queries/modules';
import { Button, Card, PageLoader, ReorderableList } from '@/components/ui';
import { cn } from '@/lib/utils';
import { BlockCard } from './BlockCard';
import { AddTextBlockForm, AddImageBlockForm, AddCodeBlockForm } from './AddBlockForms';

interface ModuleBlocksEditorProps {
  moduleId: string;
}

export function ModuleBlocksEditor({ moduleId }: ModuleBlocksEditorProps) {
  const { data: module, isLoading, error: loadError } = useModule(moduleId);
  const { mutate: deleteBlock } = useDeleteBlock(moduleId);
  const { mutate: reorderBlocks } = useReorderBlocks(moduleId);

  const [addingType, setAddingType] = useState<'text' | 'image' | 'code' | null>(null);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [deletingBlockId, setDeletingBlockId] = useState<string | null>(null);

  if (isLoading) return <PageLoader type="list" count={2} />;
  if (loadError || !module) {
    return <p className="font-body text-sm text-red-500">Failed to load module content.</p>;
  }

  const sortedBlocks = [...module.blocks].sort((a, b) => a.orderIndex - b.orderIndex);
  const nextOrder = sortedBlocks.length + 1;

  return (
    <div className="flex flex-col gap-4">
      {/* Block count header */}
      <div className="flex items-center gap-2">
        <h3 className="font-heading font-bold text-base text-[#0F0F0F]">
          Content Blocks
        </h3>
        {sortedBlocks.length > 0 && (
          <span className="font-body text-sm text-[#9CA3AF]">
            ({sortedBlocks.length})
          </span>
        )}
      </div>

      {/* Blocks list */}
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
            <ReorderableList
              items={sortedBlocks}
              onReorder={(items) => reorderBlocks(items)}
              renderItem={(block, { isDragging, isDragOver }) => (
                <BlockCard
                  block={block}
                  moduleId={moduleId}
                  isEditing={editingBlockId === block.id}
                  isDeleting={deletingBlockId === block.id}
                  isDragging={isDragging}
                  isDragOver={isDragOver}
                  onEdit={() => { setDeletingBlockId(null); setAddingType(null); setEditingBlockId(block.id); }}
                  onCancelEdit={() => setEditingBlockId(null)}
                  onDelete={() => { setEditingBlockId(null); setDeletingBlockId(block.id); }}
                  onConfirmDelete={() => { deleteBlock(block.id); setDeletingBlockId(null); }}
                  onCancelDelete={() => setDeletingBlockId(null)}
                />
              )}
            />
          </Card>
        </>
      )}

      {/* Empty state */}
      {sortedBlocks.length === 0 && !addingType && (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-[#E5E7EB] rounded-xl">
          <div className="w-12 h-12 rounded-full bg-[#F3E8FF] flex items-center justify-center mb-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3D006B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
          <p className="font-body text-sm text-[#6B7280] mb-1">No content blocks yet.</p>
          <p className="font-body text-xs text-[#9CA3AF]">Add text, image, or code blocks below.</p>
        </div>
      )}

      {/* Add block forms */}
      {addingType === 'text' && (
        <AddTextBlockForm moduleId={moduleId} nextOrder={nextOrder} onDone={() => setAddingType(null)} />
      )}
      {addingType === 'image' && (
        <AddImageBlockForm moduleId={moduleId} nextOrder={nextOrder} onDone={() => setAddingType(null)} />
      )}
      {addingType === 'code' && (
        <AddCodeBlockForm moduleId={moduleId} nextOrder={nextOrder} onDone={() => setAddingType(null)} />
      )}

      {/* Add buttons */}
      {!addingType && (
        <div className={cn('flex items-center gap-3 flex-wrap', sortedBlocks.length === 0 && 'justify-center')}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => { setEditingBlockId(null); setDeletingBlockId(null); setAddingType('text'); }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Text Block
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => { setEditingBlockId(null); setDeletingBlockId(null); setAddingType('image'); }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Image Block
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => { setEditingBlockId(null); setDeletingBlockId(null); setAddingType('code'); }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
            </svg>
            Add Code Block
          </Button>
        </div>
      )}
    </div>
  );
}

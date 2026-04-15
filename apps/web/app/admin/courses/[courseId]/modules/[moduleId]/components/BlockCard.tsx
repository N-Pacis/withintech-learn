'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useUpdateBlock, useUploadBlockImage, type Block } from '@/hooks/queries/modules';
import { Button, Badge, Textarea, FormField, Input, FileUpload, CodeEditor, CodeLanguage } from '@/components/ui';
import { cn } from '@/lib/utils';
const IMAGE_ACCEPT = ['image/jpeg', 'image/png', 'image/webp'];

// ─── Text block display ───────────────────────────────────────────────────────

function TextBlockView({ block }: { block: Block }) {
  return (
    <p className="font-body text-sm text-[#374151] dark:text-[#D1D5DB] leading-relaxed whitespace-pre-wrap line-clamp-4">
      {block.content}
    </p>
  );
}

// ─── Image block display ──────────────────────────────────────────────────────

function ImageBlockView({ block }: { block: Block }) {
  if (!block.url) {
    return (
      <div className="flex items-center gap-2 py-2">
        <div className="w-8 h-8 rounded bg-[#F3E8FF] dark:bg-[#2d1a4a] flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3D006B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
        <p className="font-body text-xs text-[#9CA3AF]">No image uploaded yet.</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-1.5">
      <div className="relative h-40 rounded-lg overflow-hidden bg-[#F3F4F6] dark:bg-[#252525]">
        <Image src={block.url} alt={block.caption ?? 'Block image'} fill className="object-cover" />
      </div>
      {block.caption && <p className="font-body text-xs text-[#9CA3AF]">{block.caption}</p>}
    </div>
  );
}

// ─── Inline text editor ───────────────────────────────────────────────────────

function EditTextBlock({ block, moduleId, onDone }: { block: Block; moduleId: string; onDone: () => void }) {
  const [content, setContent] = useState(block.content ?? '');
  const [error, setError] = useState('');
  const { mutateAsync: updateBlock, isPending } = useUpdateBlock(moduleId);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { ref.current?.focus(); }, []);

  async function handleSave() {
    if (!content.trim()) { setError('Content cannot be empty.'); return; }
    try {
      await updateBlock({ id: block.id, content: content.trim() });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save.');
    }
  }

  return (
    <div className="flex flex-col gap-3 pt-2">
      <Textarea ref={ref} value={content} onChange={(e) => { setContent(e.target.value); setError(''); }} rows={5} placeholder="Enter text content…" />
      {error && <p className="font-body text-xs text-red-500">{error}</p>}
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={onDone}>Cancel</Button>
        <Button size="sm" loading={isPending} disabled={!content.trim()} onClick={handleSave}>Save</Button>
      </div>
    </div>
  );
}

// ─── Inline image editor ──────────────────────────────────────────────────────

function EditImageBlock({ block, moduleId, onDone }: { block: Block; moduleId: string; onDone: () => void }) {
  const [caption, setCaption] = useState(block.caption ?? '');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const { mutateAsync: updateBlock } = useUpdateBlock(moduleId);
  const { mutateAsync: uploadImage } = useUploadBlockImage(moduleId);

  async function handleSave() {
    if (!file && caption === (block.caption ?? '')) { onDone(); return; }
    setPending(true);
    setError('');
    try {
      if (caption !== (block.caption ?? '')) await updateBlock({ id: block.id, caption: caption.trim() || undefined });
      if (file) await uploadImage({ blockId: block.id, file });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save.');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 pt-2">
      <FileUpload accept={IMAGE_ACCEPT} maxSizeMb={10} currentUrl={block.url} onFileSelect={setFile} uploading={pending} label="Click or drag to replace image" />
      <FormField label="Caption" htmlFor={`caption-${block.id}`}>
        <Input id={`caption-${block.id}`} value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Optional caption…" maxLength={200} />
      </FormField>
      {error && <p className="font-body text-xs text-red-500">{error}</p>}
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={onDone}>Cancel</Button>
        <Button size="sm" loading={pending} onClick={handleSave}>Save</Button>
      </div>
    </div>
  );
}

// ─── Code block display ───────────────────────────────────────────────────────

function CodeBlockView({ block }: { block: Block }) {
  return (
    <CodeEditor
      value={block.content ?? ''}
      language={(block.language ?? 'javascript') as CodeLanguage}
      onValueChange={() => {}}
      onLanguageChange={() => {}}
      readOnly
    />
  );
}

// ─── Inline code editor ───────────────────────────────────────────────────────

function EditCodeBlock({ block, moduleId, onDone }: { block: Block; moduleId: string; onDone: () => void }) {
  const [content, setContent] = useState(block.content ?? '');
  const [language, setLanguage] = useState<CodeLanguage>((block.language ?? 'javascript') as CodeLanguage);
  const [error, setError] = useState('');
  const { mutateAsync: updateBlock, isPending } = useUpdateBlock(moduleId);

  async function handleSave() {
    if (!content.trim()) { setError('Content cannot be empty.'); return; }
    try {
      await updateBlock({ id: block.id, content: content.trim(), language });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save.');
    }
  }

  return (
    <div className="flex flex-col gap-3 pt-2">
      <CodeEditor
        value={content}
        language={language}
        onValueChange={setContent}
        onLanguageChange={setLanguage}
      />
      {error && <p className="font-body text-xs text-red-500">{error}</p>}
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={onDone}>Cancel</Button>
        <Button size="sm" loading={isPending} disabled={!content.trim()} onClick={handleSave}>Save</Button>
      </div>
    </div>
  );
}

// ─── Block card ───────────────────────────────────────────────────────────────

export interface BlockCardProps {
  block: Block;
  moduleId: string;
  isEditing: boolean;
  isDeleting: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}

export function BlockCard({
  block, moduleId, isEditing, isDeleting, isDragging, isDragOver,
  onEdit, onCancelEdit, onDelete, onConfirmDelete, onCancelDelete,
}: BlockCardProps) {
  return (
    <div
      className={cn(
        'flex gap-3 p-4 border-b border-[#E5E7EB] dark:border-[#2d2d2d] last:border-0 transition-all group',
        isDragging && 'opacity-40 bg-[#F3E8FF]/30',
        isDragOver && 'bg-[#F3E8FF]/50 border-l-2 border-l-[#3D006B]',
        !isDragging && !isDragOver && 'hover:bg-[#FAFAFA] dark:hover:bg-[#252525]',
      )}
    >
      {/* Drag handle + order */}
      <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
        <span className="text-[#D1D5DB] group-hover:text-[#9CA3AF] transition-colors cursor-grab active:cursor-grabbing">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="9" cy="5" r="1.5" /><circle cx="15" cy="5" r="1.5" />
            <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
            <circle cx="9" cy="19" r="1.5" /><circle cx="15" cy="19" r="1.5" />
          </svg>
        </span>
        <span className="font-heading font-bold text-xs text-[#9CA3AF]">{block.orderIndex}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant={block.type === 'text' ? 'gray' : block.type === 'image' ? 'purple' : 'success'} size="sm">
            {block.type === 'text' ? 'Text' : block.type === 'image' ? 'Image' : 'Code'}
          </Badge>
          {!isEditing && !isDeleting && (
            <div className="ml-auto flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="sm" onClick={onEdit}>Edit</Button>
              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={onDelete}>
                Delete
              </Button>
            </div>
          )}
        </div>

        {isEditing ? (
          block.type === 'text'
            ? <EditTextBlock block={block} moduleId={moduleId} onDone={onCancelEdit} />
            : block.type === 'image'
              ? <EditImageBlock block={block} moduleId={moduleId} onDone={onCancelEdit} />
              : <EditCodeBlock block={block} moduleId={moduleId} onDone={onCancelEdit} />
        ) : isDeleting ? (
          <div className="flex items-center gap-2 py-1">
            <p className="font-body text-xs text-[#6B7280] dark:text-[#9CA3AF] flex-1">Delete this block?</p>
            <Button variant="danger" size="sm" onClick={onConfirmDelete}>Delete</Button>
            <Button variant="ghost" size="sm" onClick={onCancelDelete}>Cancel</Button>
          </div>
        ) : (
          block.type === 'text'
            ? <TextBlockView block={block} />
            : block.type === 'image'
              ? <ImageBlockView block={block} />
              : <CodeBlockView block={block} />
        )}
      </div>
    </div>
  );
}

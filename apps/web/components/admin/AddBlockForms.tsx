'use client';

import { useState, useEffect, useRef } from 'react';
import { useAddBlock, useUploadBlockImage } from '@/hooks/queries/modules';
import { Button, Badge, Card, CardBody, FormField, Input, Textarea, FileUpload, CodeEditor, CodeLanguage } from '@/components/ui';

const IMAGE_ACCEPT = ['image/jpeg', 'image/png', 'image/webp'];

interface AddFormProps {
  moduleId: string;
  nextOrder: number;
  onDone: () => void;
}

// ─── Add text block ───────────────────────────────────────────────────────────

export function AddTextBlockForm({ moduleId, nextOrder, onDone }: AddFormProps) {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const { mutateAsync: addBlock, isPending } = useAddBlock(moduleId);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { ref.current?.focus(); }, []);

  async function handleAdd() {
    if (!content.trim()) { setError('Content cannot be empty.'); return; }
    try {
      await addBlock({ type: 'text', content: content.trim(), orderIndex: nextOrder });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add block.');
    }
  }

  return (
    <Card shadow="sm" className="border-[#3D006B]/20">
      <CardBody className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Badge variant="gray" size="sm">Text</Badge>
          <span className="font-body text-xs text-[#9CA3AF]">Block {nextOrder}</span>
        </div>
        <Textarea
          ref={ref}
          value={content}
          onChange={(e) => { setContent(e.target.value); setError(''); }}
          rows={5}
          placeholder="Type your text content here…"
        />
        {error && <p className="font-body text-xs text-red-500">{error}</p>}
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={onDone}>Cancel</Button>
          <Button size="sm" loading={isPending} disabled={!content.trim()} onClick={handleAdd}>
            Add Text Block
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

// ─── Add image block ──────────────────────────────────────────────────────────

export function AddImageBlockForm({ moduleId, nextOrder, onDone }: AddFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const { mutateAsync: addBlock } = useAddBlock(moduleId);
  const { mutateAsync: uploadImage } = useUploadBlockImage(moduleId);

  async function handleAdd() {
    setError('');
    setPending(true);
    try {
      const block = await addBlock({
        type: 'image',
        caption: caption.trim() || undefined,
        orderIndex: nextOrder,
      });
      if (file) {
        await uploadImage({ blockId: block.id, file });
      }
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add block.');
    } finally {
      setPending(false);
    }
  }

  return (
    <Card shadow="sm" className="border-[#3D006B]/20">
      <CardBody className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Badge variant="purple" size="sm">Image</Badge>
          <span className="font-body text-xs text-[#9CA3AF]">Block {nextOrder}</span>
        </div>
        <FileUpload
          accept={IMAGE_ACCEPT}
          maxSizeMb={10}
          onFileSelect={setFile}
          uploading={pending}
        />
        <FormField label="Caption" htmlFor="new-img-caption">
          <Input
            id="new-img-caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Optional caption…"
            maxLength={200}
          />
        </FormField>
        {error && <p className="font-body text-xs text-red-500">{error}</p>}
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={onDone}>Cancel</Button>
          <Button size="sm" loading={pending} onClick={handleAdd}>
            Add Image Block
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

// ─── Add code block ───────────────────────────────────────────────────────────

export function AddCodeBlockForm({ moduleId, nextOrder, onDone }: AddFormProps) {
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState<CodeLanguage>('javascript');
  const [error, setError] = useState('');
  const { mutateAsync: addBlock, isPending } = useAddBlock(moduleId);

  async function handleAdd() {
    if (!content.trim()) { setError('Content cannot be empty.'); return; }
    try {
      await addBlock({ type: 'code', content: content.trim(), language, orderIndex: nextOrder });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add block.');
    }
  }

  return (
    <Card shadow="sm" className="border-[#3D006B]/20">
      <CardBody className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Badge variant="success" size="sm">Code</Badge>
          <span className="font-body text-xs text-[#9CA3AF]">Block {nextOrder}</span>
        </div>
        <CodeEditor
          value={content}
          language={language}
          onValueChange={(v) => { setContent(v); setError(''); }}
          onLanguageChange={setLanguage}
        />
        {error && <p className="font-body text-xs text-red-500">{error}</p>}
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={onDone}>Cancel</Button>
          <Button size="sm" loading={isPending} disabled={!content.trim()} onClick={handleAdd}>
            Add Code Block
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

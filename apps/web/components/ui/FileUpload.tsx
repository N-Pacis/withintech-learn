'use client';

import { useRef, useState, DragEvent, ChangeEvent } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  /** Array of accepted MIME types, e.g. ['image/jpeg', 'image/png'] or ['application/pdf'] */
  accept: string[];
  maxSizeMb?: number;
  onFileSelect: (file: File) => void;
  uploading?: boolean;
  /** Existing asset URL shown as preview (image types only) */
  currentUrl?: string | null;
  label?: string;
  className?: string;
}

export function FileUpload({
  accept,
  maxSizeMb = 10,
  onFileSelect,
  uploading,
  currentUrl,
  label,
  className,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState('');

  const isImageMode = accept.length > 0 && accept.every(t => t.startsWith('image/'));
  const displayUrl = preview ?? currentUrl ?? null;
  const typeLabel = accept.map(t => t.split('/')[1]?.toUpperCase() ?? t).join(', ');

  function validate(file: File): string | null {
    if (!accept.includes(file.type)) return `Only ${typeLabel} allowed.`;
    if (file.size > maxSizeMb * 1024 * 1024) return `File must be under ${maxSizeMb} MB.`;
    return null;
  }

  function handleFile(file: File) {
    const err = validate(file);
    if (err) { setFileError(err); return; }
    setFileError('');
    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
    onFileSelect(file);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  const hasPreviewImage = displayUrl && isImageMode;
  const hasSelectedNonImage = selectedFile && !isImageMode;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        disabled={uploading}
        className={cn(
          'relative w-full rounded-xl border-2 border-dashed transition-colors overflow-hidden',
          'flex items-center justify-center text-center',
          hasPreviewImage ? 'h-48' : 'h-36',
          dragOver
            ? 'border-[#3D006B] bg-[#F3E8FF]/50'
            : 'border-[#E5E7EB] hover:border-[#3D006B]/40 hover:bg-[#FAFAFA]',
          uploading && 'opacity-60 cursor-not-allowed',
        )}
      >
        {hasPreviewImage ? (
          <>
            <Image
              src={displayUrl}
              alt="Preview"
              fill
              className="object-cover"
              unoptimized={displayUrl.startsWith('blob:')}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="font-body text-sm text-white font-medium">
                {uploading ? 'Uploading…' : 'Click to change'}
              </span>
            </div>
          </>
        ) : hasSelectedNonImage ? (
          <div className="flex flex-col items-center gap-2 px-4 py-6">
            <div className="w-10 h-10 rounded-full bg-[#F3E8FF] flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3D006B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <div>
              <p className="font-body text-sm font-medium text-[#0F0F0F] truncate max-w-[240px]">{selectedFile.name}</p>
              <p className="font-body text-xs text-[#9CA3AF] mt-0.5">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB · Click to change
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 px-4 py-6">
            <div className="w-10 h-10 rounded-full bg-[#F3E8FF] flex items-center justify-center">
              {isImageMode ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3D006B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3D006B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              )}
            </div>
            <div>
              <p className="font-body text-sm font-medium text-[#3D006B]">
                {dragOver ? 'Drop here' : (label ?? 'Click or drag to upload')}
              </p>
              <p className="font-body text-xs text-[#9CA3AF] mt-0.5">{typeLabel} · max {maxSizeMb} MB</p>
            </div>
          </div>
        )}
      </button>

      {fileError && <p className="font-body text-xs text-red-500">{fileError}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={accept.join(',')}
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}

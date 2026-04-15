"use client";

import { useRef, useState, DragEvent, ChangeEvent } from "react";
import Image from "next/image";
import { FileText, ImageIcon, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [fileError, setFileError] = useState("");

  const isImageMode =
    accept.length > 0 && accept.every((t) => t.startsWith("image/"));
  const displayUrl = preview ?? currentUrl ?? null;
  const typeLabel = accept
    .map((t) => t.split("/")[1]?.toUpperCase() ?? t)
    .join(", ");

  function validate(file: File): string | null {
    if (!accept.includes(file.type)) return `Only ${typeLabel} allowed.`;
    if (file.size > maxSizeMb * 1024 * 1024)
      return `File must be under ${maxSizeMb} MB.`;
    return null;
  }

  function handleFile(file: File) {
    const err = validate(file);
    if (err) {
      setFileError(err);
      return;
    }
    setFileError("");
    setSelectedFile(file);
    if (file.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
    onFileSelect(file);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
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
    <div className={cn("flex flex-col gap-2", className)}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        disabled={uploading}
        className={cn(
          "relative w-full rounded-xl border-2 border-dashed transition-colors overflow-hidden",
          "flex items-center justify-center text-center",
          hasPreviewImage ? "h-48" : "h-36",
          dragOver
            ? "border-primary bg-primary-soft/50"
            : "border-border hover:border-primary/40 hover:bg-surface",
          uploading && "opacity-60 cursor-not-allowed",
        )}
      >
        {hasPreviewImage ? (
          <>
            <Image
              src={displayUrl}
              alt="Preview"
              fill
              className="object-cover"
              unoptimized={displayUrl.startsWith("blob:")}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="font-body text-sm text-white font-medium">
                {uploading ? "Uploading…" : "Click to change"}
              </span>
            </div>
          </>
        ) : hasSelectedNonImage ? (
          <div className="flex flex-col items-center gap-2 px-4 py-6">
            <div className="w-10 h-10 rounded-full bg-primary-soft flex items-center justify-center">
              <FileText size={18} className="text-primary" />
            </div>
            <div>
              <p className="font-body text-sm font-medium text-foreground truncate max-w-[240px]">
                {selectedFile.name}
              </p>
              <p className="font-body text-xs text-muted-contrast mt-0.5">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB · Click to
                change
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 px-4 py-6">
            <div className="w-10 h-10 rounded-full bg-primary-soft flex items-center justify-center">
              {isImageMode ? (
                <ImageIcon size={18} className="text-primary" />
              ) : (
                <Upload size={18} className="text-primary" />
              )}
            </div>
            <div>
              <p className="font-body text-sm font-medium text-primary">
                {dragOver ? "Drop here" : (label ?? "Click or drag to upload")}
              </p>
              <p className="font-body text-xs text-muted-contrast mt-0.5">
                {typeLabel} · max {maxSizeMb} MB
              </p>
            </div>
          </div>
        )}
      </button>

      {fileError && (
        <p className="font-body text-xs text-red-500">{fileError}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept.join(",")}
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}

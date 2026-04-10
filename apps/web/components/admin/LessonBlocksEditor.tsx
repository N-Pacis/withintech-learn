"use client";

import { useState } from "react";
import Image from "next/image";
import {
  useLesson,
  useAddLessonBlock,
  useUpdateLessonBlock,
  useDeleteLessonBlock,
  useUploadLessonBlockImage,
  type LessonBlock,
} from "@/hooks/queries/modules";
import { Button, Card, Input, PageLoader } from "@/components/ui";
import { CodeEditor, type CodeLanguage } from "@/components/ui/CodeEditor";
import { TiptapEditor } from "@/components/ui/TiptapEditor";
import { cn } from "@/lib/utils";
import {
  Trash2,
  Pencil,
  Check,
  GripVertical,
  Image as ImageIcon,
  Code2,
  Type,
} from "lucide-react";

interface LessonBlocksEditorProps {
  lessonId: string;
  isDraft?: boolean;
}

const IMAGE_ACCEPT = ["image/jpeg", "image/png", "image/webp"];

// ─── Inline block display ─────────────────────────────────────────────────────

function BlockDisplay({ block }: { block: LessonBlock }) {
  if (block.type === "text") {
    return (
      <div
        className="prose prose-sm max-w-none font-body text-sm text-[#374151]"
        dangerouslySetInnerHTML={{ __html: block.content ?? "" }}
      />
    );
  }
  if (block.type === "image") {
    return (
      <div className="flex flex-col gap-1">
        {block.url ? (
          <div className="relative w-full h-48 rounded-lg overflow-hidden bg-[#F3F4F6]">
            <Image
              src={block.url}
              alt={block.caption ?? ""}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        ) : (
          <div className="h-24 bg-[#F3F4F6] rounded-lg flex items-center justify-center text-[#9CA3AF] text-xs">
            No image uploaded
          </div>
        )}
        {block.caption && (
          <span className="font-body text-xs text-[#9CA3AF]">
            {block.caption}
          </span>
        )}
      </div>
    );
  }
  // code
  return (
    <div className="rounded-lg overflow-hidden border border-[#E5E7EB]">
      <div className="bg-[#F3F4F6] px-3 py-1 text-xs font-mono text-[#6B7280]">
        {block.language ?? "code"}
      </div>
      <pre className="p-3 text-xs font-mono text-[#374151] overflow-x-auto max-h-32">
        {block.content}
      </pre>
    </div>
  );
}

// ─── Main editor ──────────────────────────────────────────────────────────────

export function LessonBlocksEditor({
  lessonId,
  isDraft = true,
}: LessonBlocksEditorProps) {
  const { data: lesson, isLoading, error: loadError } = useLesson(lessonId);
  const { mutate: addBlock, isPending: addingBlock } =
    useAddLessonBlock(lessonId);
  const { mutate: deleteBlock } = useDeleteLessonBlock(lessonId);
  const { mutate: updateBlock } = useUpdateLessonBlock(lessonId);
  const { mutate: uploadImage } = useUploadLessonBlockImage(lessonId);

  const [addingType, setAddingType] = useState<
    "text" | "image" | "code" | null
  >(null);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [deletingBlockId, setDeletingBlockId] = useState<string | null>(null);

  // Add form state
  const [textContent, setTextContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageCaption, setImageCaption] = useState("");
  const [codeContent, setCodeContent] = useState("");
  const [codeLanguage, setCodeLanguage] = useState<CodeLanguage>("javascript");

  // Edit form state
  const [editContent, setEditContent] = useState("");
  const [editCaption, setEditCaption] = useState("");
  const [editLanguage, setEditLanguage] = useState<CodeLanguage>("javascript");

  if (isLoading) return <PageLoader type="list" count={2} />;
  if (loadError || !lesson) {
    return (
      <p className="font-body text-sm text-red-500">
        Failed to load lesson content.
      </p>
    );
  }

  const sortedBlocks = [...lesson.blocks].sort(
    (a, b) => a.orderIndex - b.orderIndex,
  );
  const nextOrder = sortedBlocks.length + 1;

  function resetAddForm() {
    setAddingType(null);
    setTextContent("");
    setImageFile(null);
    setImageCaption("");
    setCodeContent("");
    setCodeLanguage("javascript");
  }

  function handleAddText() {
    const stripped = textContent.replace(/<[^>]*>/g, "").trim();
    if (!stripped) return;
    addBlock(
      { type: "text", content: textContent, orderIndex: nextOrder },
      { onSuccess: resetAddForm },
    );
  }

  function handleAddImage() {
    addBlock(
      {
        type: "image",
        caption: imageCaption || undefined,
        orderIndex: nextOrder,
      },
      {
        onSuccess: (block) => {
          if (imageFile) {
            uploadImage({ blockId: block.id, file: imageFile });
          }
          resetAddForm();
        },
      },
    );
  }

  function handleAddCode() {
    if (!codeContent.trim()) return;
    addBlock(
      {
        type: "code",
        content: codeContent,
        language: codeLanguage,
        orderIndex: nextOrder,
      },
      { onSuccess: resetAddForm },
    );
  }

  function startEdit(block: LessonBlock) {
    setEditingBlockId(block.id);
    setEditContent(block.content ?? "");
    setEditCaption(block.caption ?? "");
    setEditLanguage((block.language ?? "javascript") as CodeLanguage);
    setDeletingBlockId(null);
    setAddingType(null);
  }

  function handleSaveEdit(block: LessonBlock) {
    if (block.type === "text") {
      updateBlock(
        { id: block.id, content: editContent },
        { onSuccess: () => setEditingBlockId(null) },
      );
    } else if (block.type === "image") {
      updateBlock(
        { id: block.id, caption: editCaption },
        { onSuccess: () => setEditingBlockId(null) },
      );
    } else {
      updateBlock(
        { id: block.id, content: editContent, language: editLanguage },
        { onSuccess: () => setEditingBlockId(null) },
      );
    }
  }

  return (
    <div className="flex flex-col gap-4">
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

      {/* Block list */}
      {sortedBlocks.map((block, i) => (
        <Card key={block.id} shadow="sm">
          <div className="flex items-start gap-3 p-4">
            <GripVertical size={16} className="text-[#D1D5DB] shrink-0 mt-1" />
            <span className="w-5 h-5 rounded-full bg-[#F3E8FF] text-[#3D006B] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
              {i + 1}
            </span>

            <div className="flex-1 min-w-0">
              {editingBlockId === block.id ? (
                <div className="flex flex-col gap-3">
                  {block.type === "text" && (
                    <TiptapEditor
                      content={editContent}
                      onChange={setEditContent}
                    />
                  )}
                  {block.type === "image" && (
                    <Input
                      value={editCaption}
                      onChange={(e) => setEditCaption(e.target.value)}
                      placeholder="Caption"
                    />
                  )}
                  {block.type === "code" && (
                    <CodeEditor
                      value={editContent}
                      language={editLanguage}
                      onValueChange={setEditContent}
                      onLanguageChange={setEditLanguage}
                    />
                  )}
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => handleSaveEdit(block)}>
                      <Check size={13} /> Save
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingBlockId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : deletingBlockId === block.id ? (
                <div className="flex items-center gap-2 py-1">
                  <p className="font-body text-xs text-[#6B7280] flex-1">
                    Delete this block?
                  </p>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="text-red-600! border-red-200! hover:bg-red-50!"
                    onClick={() => {
                      deleteBlock(block.id);
                      setDeletingBlockId(null);
                    }}
                  >
                    Delete
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeletingBlockId(null)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <BlockDisplay block={block} />
              )}
            </div>

            {/* Actions */}
            {editingBlockId !== block.id &&
              deletingBlockId !== block.id &&
              isDraft && (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => startEdit(block)}
                    className="p-1.5 rounded-lg hover:bg-[#F3E8FF] text-[#6B7280] hover:text-[#3D006B] transition-colors"
                    title="Edit"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => {
                      setEditingBlockId(null);
                      setDeletingBlockId(block.id);
                    }}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-[#6B7280] hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
          </div>
        </Card>
      ))}

      {/* Empty state */}
      {sortedBlocks.length === 0 && !addingType && (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-[#E5E7EB] rounded-xl">
          <p className="font-body text-sm text-[#6B7280] mb-1">
            No content blocks yet.
          </p>
          <p className="font-body text-xs text-[#9CA3AF]">
            Add text, image, or code blocks below.
          </p>
        </div>
      )}

      {/* Add forms */}
      {isDraft && addingType === "text" && (
        <Card>
          <div className="p-4 flex flex-col gap-3">
            <TiptapEditor content={textContent} onChange={setTextContent} />
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={handleAddText} loading={addingBlock}>
                Add
              </Button>
              <Button variant="ghost" size="sm" onClick={resetAddForm}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}
      {isDraft && addingType === "image" && (
        <Card>
          <div className="p-4 flex flex-col gap-3">
            <input
              type="file"
              accept={IMAGE_ACCEPT.join(",")}
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              className="font-body text-sm"
            />
            <Input
              value={imageCaption}
              onChange={(e) => setImageCaption(e.target.value)}
              placeholder="Caption (optional)"
            />
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={handleAddImage} loading={addingBlock}>
                Add
              </Button>
              <Button variant="ghost" size="sm" onClick={resetAddForm}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}
      {isDraft && addingType === "code" && (
        <Card>
          <div className="p-4 flex flex-col gap-3">
            <CodeEditor
              value={codeContent}
              language={codeLanguage}
              onValueChange={setCodeContent}
              onLanguageChange={setCodeLanguage}
            />
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={handleAddCode} loading={addingBlock}>
                Add
              </Button>
              <Button variant="ghost" size="sm" onClick={resetAddForm}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Add buttons */}
      {isDraft && !addingType && (
        <div
          className={cn(
            "flex items-center gap-3 flex-wrap",
            sortedBlocks.length === 0 && "justify-center",
          )}
        >
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setEditingBlockId(null);
              setDeletingBlockId(null);
              setAddingType("text");
            }}
          >
            <Type size={13} /> Add Text
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setEditingBlockId(null);
              setDeletingBlockId(null);
              setAddingType("image");
            }}
          >
            <ImageIcon size={13} /> Add Image
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setEditingBlockId(null);
              setDeletingBlockId(null);
              setAddingType("code");
            }}
          >
            <Code2 size={13} /> Add Code
          </Button>
        </div>
      )}
    </div>
  );
}

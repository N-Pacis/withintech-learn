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
  LayoutTemplate,
  Link,
  Unlink,
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
        className="prose prose-sm max-w-none font-body text-sm text-foreground-soft"
        dangerouslySetInnerHTML={{ __html: block.content ?? "" }}
      />
    );
  }
  if (block.type === "image") {
    return (
      <div className="flex flex-col gap-1">
        {block.url ? (
          <div className="relative w-full h-48 rounded-lg overflow-hidden bg-surface-muted">
            <Image
              src={block.url}
              alt={block.caption ?? ""}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        ) : (
          <div className="h-24 bg-surface-muted rounded-lg flex items-center justify-center text-muted-contrast text-xs">
            No image uploaded
          </div>
        )}
        {block.caption && (
          <span className="font-body text-xs text-muted-contrast">
            {block.caption}
          </span>
        )}
      </div>
    );
  }
  if (block.type === "playground") {
    const { html, css, js } = block.playgroundData ?? {};
    return (
      <div className="rounded-lg overflow-hidden border border-border">
        <div className="bg-surface-muted px-3 py-1.5 flex items-center gap-1.5">
          <LayoutTemplate size={12} className="text-primary" />
          <span className="text-xs font-mono text-muted font-semibold">
            Code Playground
          </span>
        </div>
        <div className="p-3 flex flex-col gap-1">
          {html && (
            <pre className="text-[10px] font-mono text-foreground-soft overflow-x-auto max-h-16 leading-relaxed">
              <span className="text-muted text-[9px] uppercase tracking-wider mr-1">
                HTML
              </span>
              {html.slice(0, 80)}
              {html.length > 80 ? "…" : ""}
            </pre>
          )}
          {css && (
            <pre className="text-[10px] font-mono text-foreground-soft overflow-x-auto max-h-10 leading-relaxed">
              <span className="text-muted text-[9px] uppercase tracking-wider mr-1">
                CSS
              </span>
              {css.slice(0, 60)}
              {css.length > 60 ? "…" : ""}
            </pre>
          )}
          {js && (
            <pre className="text-[10px] font-mono text-foreground-soft overflow-x-auto max-h-10 leading-relaxed">
              <span className="text-muted text-[9px] uppercase tracking-wider mr-1">
                JS
              </span>
              {js.slice(0, 60)}
              {js.length > 60 ? "…" : ""}
            </pre>
          )}
          {!html && !css && !js && (
            <span className="text-xs text-muted-contrast">
              Default starter code
            </span>
          )}
        </div>
      </div>
    );
  }
  // code
  return (
    <div className="rounded-lg overflow-hidden border border-border">
      <div className="bg-surface-muted px-3 py-1 text-xs font-mono text-muted">
        {block.language ?? "code"}
      </div>
      <pre className="p-3 text-xs font-mono text-foreground-soft overflow-x-auto max-h-32">
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
    "text" | "image" | "code" | "playground" | null
  >(null);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [deletingBlockId, setDeletingBlockId] = useState<string | null>(null);

  // NEW: State for block linking
  const [selectedBlockIds, setSelectedBlockIds] = useState<Set<string>>(
    new Set(),
  );
  const [isLinkingMode, setIsLinkingMode] = useState(false);

  // Add form state
  const [textContent, setTextContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageCaption, setImageCaption] = useState("");
  const [codeContent, setCodeContent] = useState("");
  const [codeLanguage, setCodeLanguage] = useState<CodeLanguage>("javascript");

  // Playground add state
  const [playgroundHtml, setPlaygroundHtml] = useState("");
  const [playgroundCss, setPlaygroundCss] = useState("");
  const [playgroundJs, setPlaygroundJs] = useState("");

  // Edit form state
  const [editContent, setEditContent] = useState("");
  const [editCaption, setEditCaption] = useState("");
  const [editLanguage, setEditLanguage] = useState<CodeLanguage>("javascript");
  const [editPlaygroundHtml, setEditPlaygroundHtml] = useState("");
  const [editPlaygroundCss, setEditPlaygroundCss] = useState("");
  const [editPlaygroundJs, setEditPlaygroundJs] = useState("");

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
    setPlaygroundHtml("");
    setPlaygroundCss("");
    setPlaygroundJs("");
  }

  function handleAddPlayground() {
    addBlock(
      {
        type: "playground",
        html: playgroundHtml || undefined,
        css: playgroundCss || undefined,
        js: playgroundJs || undefined,
        orderIndex: nextOrder,
      },
      { onSuccess: resetAddForm },
    );
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

    const previousBlock = sortedBlocks[sortedBlocks.length - 1];
    let linkedGroupId: string | undefined;

    // NEW: Auto-link consecutive code blocks
    if (previousBlock && previousBlock.type === "code") {
      if (!previousBlock.linkedGroupId) {
        linkedGroupId = crypto.randomUUID();
        // Update previous block with this group ID
        updateBlock({
          id: previousBlock.id,
          linkedGroupId,
        });
      } else {
        linkedGroupId = previousBlock.linkedGroupId;
      }
    }

    addBlock(
      {
        type: "code",
        content: codeContent,
        language: codeLanguage,
        orderIndex: nextOrder,
        ...(linkedGroupId ? { linkedGroupId } : {}),
      },
      { onSuccess: resetAddForm },
    );
  }

  function startEdit(block: LessonBlock) {
    setEditingBlockId(block.id);
    setEditContent(block.content ?? "");
    setEditCaption(block.caption ?? "");
    setEditLanguage((block.language ?? "javascript") as CodeLanguage);
    setEditPlaygroundHtml(block.playgroundData?.html ?? "");
    setEditPlaygroundCss(block.playgroundData?.css ?? "");
    setEditPlaygroundJs(block.playgroundData?.js ?? "");
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
    } else if (block.type === "playground") {
      updateBlock(
        {
          id: block.id,
          playgroundData: {
            html: editPlaygroundHtml || undefined,
            css: editPlaygroundCss || undefined,
            js: editPlaygroundJs || undefined,
          },
        },
        { onSuccess: () => setEditingBlockId(null) },
      );
    } else {
      updateBlock(
        { id: block.id, content: editContent, language: editLanguage },
        { onSuccess: () => setEditingBlockId(null) },
      );
    }
  }

  // NEW: Linking helper functions
  function toggleBlockSelection(blockId: string) {
    setSelectedBlockIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(blockId)) {
        newSet.delete(blockId);
      } else {
        newSet.add(blockId);
      }
      return newSet;
    });
  }

  function handleLinkSelected() {
    if (selectedBlockIds.size < 2) return;
    const newGroupId = crypto.randomUUID();

    // Update all selected blocks with the new group ID
    selectedBlockIds.forEach((blockId) => {
      updateBlock({ id: blockId, linkedGroupId: newGroupId });
    });

    // Reset linking mode
    setIsLinkingMode(false);
    setSelectedBlockIds(new Set());
  }

  function handleUnlink(blockId: string) {
    updateBlock({ id: blockId, linkedGroupId: null });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <h3 className="font-heading font-bold text-base text-foreground">
          Content Blocks
        </h3>
        {sortedBlocks.length > 0 && (
          <span className="font-body text-sm text-muted-contrast">
            ({sortedBlocks.length})
          </span>
        )}
      </div>

      {/* Block list */}
      {sortedBlocks.map((block, i) => {
        const isLinked = !!block.linkedGroupId;
        const isSelected = selectedBlockIds.has(block.id);
        return (
          <Card
            key={block.id}
            shadow="sm"
            className={cn(
              isLinked && "border-l-4 border-l-primary",
              isSelected && "ring-2 ring-primary/30",
            )}
          >
            <div className="flex items-start gap-3 p-4">
              {/* Checkbox for linking mode */}
              {isLinkingMode && block.type === "code" && (
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleBlockSelection(block.id)}
                  className="mt-1 mr-1"
                />
              )}
              <GripVertical
                size={16}
                className="text-border-strong shrink-0 mt-1"
              />
              <span className="w-5 h-5 rounded-full bg-primary-soft text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
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
                    {block.type === "playground" && (
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-col gap-1">
                          <label className="font-body text-xs font-semibold text-muted">
                            HTML
                          </label>
                          <textarea
                            value={editPlaygroundHtml}
                            onChange={(e) =>
                              setEditPlaygroundHtml(e.target.value)
                            }
                            rows={5}
                            className="w-full rounded-lg border border-border bg-surface-muted px-3 py-2 font-mono text-xs text-foreground resize-y focus:outline-none focus:ring-2 focus:ring-primary/30"
                            placeholder="<!DOCTYPE html>\n<html>...</html>"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="font-body text-xs font-semibold text-muted">
                            CSS
                          </label>
                          <textarea
                            value={editPlaygroundCss}
                            onChange={(e) =>
                              setEditPlaygroundCss(e.target.value)
                            }
                            rows={4}
                            className="w-full rounded-lg border border-border bg-surface-muted px-3 py-2 font-mono text-xs text-foreground resize-y focus:outline-none focus:ring-2 focus:ring-primary/30"
                            placeholder="body { ... }"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="font-body text-xs font-semibold text-muted">
                            JavaScript
                          </label>
                          <textarea
                            value={editPlaygroundJs}
                            onChange={(e) =>
                              setEditPlaygroundJs(e.target.value)
                            }
                            rows={4}
                            className="w-full rounded-lg border border-border bg-surface-muted px-3 py-2 font-mono text-xs text-foreground resize-y focus:outline-none focus:ring-2 focus:ring-primary/30"
                            placeholder="console.log('Hello!');"
                          />
                        </div>
                      </div>
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
                    <p className="font-body text-xs text-muted flex-1">
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
                    {/* NEW: Unlink button for linked code blocks */}
                    {block.type === "code" && block.linkedGroupId && (
                      <button
                        onClick={() => handleUnlink(block.id)}
                        className="p-1.5 rounded-lg hover:bg-primary-soft text-muted hover:text-primary transition-colors"
                        title="Unlink from group"
                      >
                        <Unlink size={13} />
                      </button>
                    )}
                    <button
                      onClick={() => startEdit(block)}
                      className="p-1.5 rounded-lg hover:bg-primary-soft text-muted hover:text-primary transition-colors"
                      title="Edit"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => {
                        setEditingBlockId(null);
                        setDeletingBlockId(block.id);
                      }}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-muted hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
            </div>
          </Card>
        );
      })}

      {/* Empty state */}
      {sortedBlocks.length === 0 && !addingType && (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border rounded-xl">
          <p className="font-body text-sm text-muted mb-1">
            No content blocks yet.
          </p>
          <p className="font-body text-xs text-muted-contrast">
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
      {isDraft && addingType === "playground" && (
        <Card>
          <div className="p-4 flex flex-col gap-3">
            <div className="flex items-center gap-1.5 mb-1">
              <LayoutTemplate size={14} className="text-primary" />
              <span className="font-body text-sm font-semibold text-foreground">
                Code Playground
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                <label className="font-body text-xs font-semibold text-muted">
                  HTML (optional)
                </label>
                <textarea
                  value={playgroundHtml}
                  onChange={(e) => setPlaygroundHtml(e.target.value)}
                  rows={5}
                  className="w-full rounded-lg border border-border bg-surface-muted px-3 py-2 font-mono text-xs text-foreground resize-y focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="<!DOCTYPE html>\n<html>...</html>"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-body text-xs font-semibold text-muted">
                  CSS (optional)
                </label>
                <textarea
                  value={playgroundCss}
                  onChange={(e) => setPlaygroundCss(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-border bg-surface-muted px-3 py-2 font-mono text-xs text-foreground resize-y focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="body { font-family: sans-serif; }"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-body text-xs font-semibold text-muted">
                  JavaScript (optional)
                </label>
                <textarea
                  value={playgroundJs}
                  onChange={(e) => setPlaygroundJs(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-border bg-surface-muted px-3 py-2 font-mono text-xs text-foreground resize-y focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="console.log('Hello!');"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleAddPlayground}
                loading={addingBlock}
              >
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
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setEditingBlockId(null);
              setDeletingBlockId(null);
              setAddingType("playground");
            }}
          >
            <LayoutTemplate size={13} /> Add Playground
          </Button>

          {/* NEW: Linking controls */}
          {!isLinkingMode ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setEditingBlockId(null);
                setDeletingBlockId(null);
                setIsLinkingMode(true);
              }}
            >
              <Link size={13} /> Link Blocks
            </Button>
          ) : (
            <>
              <Button
                size="sm"
                onClick={handleLinkSelected}
                disabled={selectedBlockIds.size < 2}
              >
                Link Selected ({selectedBlockIds.size})
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsLinkingMode(false);
                  setSelectedBlockIds(new Set());
                }}
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

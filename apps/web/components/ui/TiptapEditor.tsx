'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import {Table} from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Youtube from '@tiptap/extension-youtube';
import { Details } from '@tiptap/extension-details';
import { DetailsContent } from '@tiptap/extension-details-content';
import { DetailsSummary } from '@tiptap/extension-details-summary';
import { cn } from '@/lib/utils';
import React from 'react';

// ─── Shared extensions (editor + viewer) ─────────────────────────────────────

export const tiptapExtensions = [
  StarterKit.configure({
    code: false,
    codeBlock: false,
    heading: { levels: [1, 2, 3] },
  }),
  Underline,
  Link.configure({ openOnClick: false }),
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  Highlight,
  Table.configure({
    resizable: true,
  }),
  TableRow,
  TableHeader,
  TableCell,
  Youtube.configure({
    width: 640,
    height: 360,
  }),
  Details,
  DetailsSummary,
  DetailsContent,
];

// ─── Toolbar button ───────────────────────────────────────────────────────────

function ToolbarBtn({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      disabled={disabled}
      title={title}
      className={cn(
        'h-7 min-w-7 px-1.5 rounded flex items-center justify-center font-body text-xs transition-colors',
        active
          ? 'bg-[#3D006B] text-white'
          : 'text-[#374151] hover:bg-[#F3E8FF] hover:text-[#3D006B]',
        disabled && 'opacity-30 cursor-not-allowed',
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="w-px h-5 bg-[#E5E7EB] mx-0.5 shrink-0" />;
}

// ─── Toolbar components ───────────────────────────────────────────────────────

function LinkButton({ editor }: { editor: ReturnType<typeof useEditor> }) {
  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <ToolbarBtn title="Set link" active={editor.isActive('link')} onClick={setLink}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    </ToolbarBtn>
  );
}

function YoutubeButton({ editor }: { editor: ReturnType<typeof useEditor> }) {
  const addYoutubeVideo = () => {
    const url = window.prompt('YouTube URL');
    if (url) {
      editor.commands.setYoutubeVideo({ src: url });
    }
  };

  return (
    <ToolbarBtn title="YouTube" onClick={addYoutubeVideo}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" /><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
      </svg>
    </ToolbarBtn>
  );
}

function TableToolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  return (
    <div className="flex items-center gap-0.5">
      <ToolbarBtn title="Insert Table" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" />
        </svg>
      </ToolbarBtn>
      {editor.isActive('table') && (
        <>
          <ToolbarBtn title="Add Row Above" onClick={() => editor.chain().focus().addRowBefore().run()}>
            R+↑
          </ToolbarBtn>
          <ToolbarBtn title="Add Row Below" onClick={() => editor.chain().focus().addRowAfter().run()}>
            R+↓
          </ToolbarBtn>
          <ToolbarBtn title="Delete Row" onClick={() => editor.chain().focus().deleteRow().run()}>
            R-
          </ToolbarBtn>
          <ToolbarBtn title="Add Column Before" onClick={() => editor.chain().focus().addColumnBefore().run()}>
            C+←
          </ToolbarBtn>
          <ToolbarBtn title="Add Column After" onClick={() => editor.chain().focus().addColumnAfter().run()}>
            C+→
          </ToolbarBtn>
          <ToolbarBtn title="Delete Column" onClick={() => editor.chain().focus().deleteColumn().run()}>
            C-
          </ToolbarBtn>
          <ToolbarBtn title="Delete Table" onClick={() => editor.chain().focus().deleteTable().run()}>
            T-
          </ToolbarBtn>
        </>
      )}
    </div>
  );
}

// ─── Toolbar ──────────────────────────────────────────────────────────────────

function Toolbar({ editor }: { editor: ReturnType<typeof useEditor> | null }) {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-[#E5E7EB] bg-[#F9FAFB] rounded-t-lg">

      {/* Headings */}
      <ToolbarBtn title="Heading 1" active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
        H1
      </ToolbarBtn>
      <ToolbarBtn title="Heading 2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        H2
      </ToolbarBtn>
      <ToolbarBtn title="Heading 3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        H3
      </ToolbarBtn>

      <Divider />

      {/* Inline marks */}
      <ToolbarBtn title="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
        </svg>
      </ToolbarBtn>
      <ToolbarBtn title="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" /><line x1="15" y1="4" x2="9" y2="20" />
        </svg>
      </ToolbarBtn>
      <ToolbarBtn title="Underline" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" /><line x1="4" y1="21" x2="20" y2="21" />
        </svg>
      </ToolbarBtn>
      <ToolbarBtn title="Strikethrough" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12" /><path d="M16 6C16 6 14.5 4 12 4s-5 1.5-5 4c0 1.5.9 2.6 2 3.3" /><path d="M8 18c0 0 1.5 2 4 2s5-1.5 5-4c0-1.5-.9-2.6-2-3.3" />
        </svg>
      </ToolbarBtn>
      <ToolbarBtn title="Highlight" active={editor.isActive('highlight')} onClick={() => editor.chain().focus().toggleHighlight().run()}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 11-6 6v3h9l3-3" /><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4" />
        </svg>
      </ToolbarBtn>

      <Divider />

      {/* Alignment */}
      <ToolbarBtn title="Align left" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="21" y1="6" x2="3" y2="6" /><line x1="15" y1="12" x2="3" y2="12" /><line x1="17" y1="18" x2="3" y2="18" />
        </svg>
      </ToolbarBtn>
      <ToolbarBtn title="Align center" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="21" y1="6" x2="3" y2="6" /><line x1="17" y1="12" x2="7" y2="12" /><line x1="19" y1="18" x2="5" y2="18" />
        </svg>
      </ToolbarBtn>
      <ToolbarBtn title="Align right" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="12" x2="9" y2="12" /><line x1="21" y1="18" x2="7" y2="18" />
        </svg>
      </ToolbarBtn>

      <Divider />

      {/* Lists */}
      <ToolbarBtn title="Bullet list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="9" y1="6" x2="20" y2="6" /><line x1="9" y1="12" x2="20" y2="12" /><line x1="9" y1="18" x2="20" y2="18" /><circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none" /><circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none" /><circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      </ToolbarBtn>
      <ToolbarBtn title="Ordered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="10" y1="6" x2="21" y2="6" /><line x1="10" y1="12" x2="21" y2="12" /><line x1="10" y1="18" x2="21" y2="18" /><path d="M4 6h1v4" /><path d="M4 10h2" /><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
        </svg>
      </ToolbarBtn>
      <ToolbarBtn title="Blockquote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" /><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
        </svg>
      </ToolbarBtn>
      <ToolbarBtn title="Horizontal rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </ToolbarBtn>

      <Divider />

      {/* History */}
      <ToolbarBtn title="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
        </svg>
      </ToolbarBtn>
      <ToolbarBtn title="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 7v6h-6" /><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
        </svg>
      </ToolbarBtn>

      <Divider />

      {/* Advanced */}
      <LinkButton editor={editor} />
      <YoutubeButton editor={editor} />
      <ToolbarBtn title="Details" active={editor.isActive('details')} onClick={() => editor.chain().focus().setDetails().run()}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </ToolbarBtn>

      <Divider />

      <TableToolbar editor={editor} />
    </div>
  );
}

// ─── Editor ───────────────────────────────────────────────────────────────────

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

export function TiptapEditor({ content, onChange, placeholder = 'Start writing…', className }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      ...tiptapExtensions,
      Placeholder.configure({ placeholder }),
    ],
    content,
    immediatelyRender: false,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className={cn('border border-[#E5E7EB] rounded-lg overflow-hidden focus-within:border-[#3D006B] focus-within:ring-2 focus-within:ring-[#3D006B]/10 transition-all', className)}>
      <style>{`
        .tiptap-editor .tiptap, .tiptap-viewer .tiptap {
          table {
            border-collapse: collapse;
            table-layout: fixed;
            width: 100%;
            margin: 0;
            overflow: hidden;

            td, th {
              min-width: 1em;
              border: 2px solid #ced4da;
              padding: 3px 5px;
              vertical-align: top;
              box-sizing: border-box;
              position: relative;

              > * {
                margin-bottom: 0;
              }
            }

            th {
              font-weight: bold;
              text-align: left;
              background-color: #f1f3f5;
            }

            .selectedCell:after {
              z-index: 2;
              position: absolute;
              content: "";
              left: 0; right: 0; top: 0; bottom: 0;
              background: rgba(200, 200, 255, 0.4);
              pointer-events: none;
            }

            .column-resize-handle {
              position: absolute;
              right: -2px;
              top: 0;
              bottom: -2px;
              width: 4px;
              background-color: #adf;
              pointer-events: none;
            }

            p {
              margin: 0;
            }
          }

          details {
            border: 1px solid #ced4da;
            border-radius: 4px;
            padding: 0.5rem;
            margin: 1rem 0;

            summary {
              font-weight: bold;
              cursor: pointer;
            }

            div[data-type="detailsContent"] {
              margin-top: 0.5rem;
            }
          }

          iframe {
            max-width: 100%;
          }

          div[data-youtube-video] {
            width: 100%;
            max-width: 100%;
            margin: 1rem 0;
            overflow: hidden;
            border-radius: 0.75rem;
          }

          div[data-youtube-video] iframe {
            display: block;
            width: 100%;
            max-width: 100%;
            aspect-ratio: 16 / 9;
            height: auto;
            border: 0;
          }

          details {
            border: 1px solid #ced4da;
            border-radius: 4px;
            padding: 0.5rem;
            margin: 1rem 0;

            summary {
              font-weight: bold;
              cursor: pointer;
            }

            div[data-type="detailsContent"] {
              margin-top: 0.5rem;
            }
          }
        }
      `}</style>
      <Toolbar editor={editor} />
      <EditorContent
        editor={editor}
        className="tiptap-editor"
      />
    </div>
  );
}

// ─── Read-only viewer ─────────────────────────────────────────────────────────

interface TiptapViewerProps {
  content: string;
  className?: string;
}

export function TiptapViewer({ content, className }: TiptapViewerProps) {
  const editor = useEditor({
    extensions: tiptapExtensions,
    content,
    editable: false,
    immediatelyRender: false,
  });

  return (
    <div className={className}>
      <style>{`
        .tiptap-editor .tiptap, .tiptap-viewer .tiptap {
          table {
            border-collapse: collapse;
            table-layout: fixed;
            width: 100%;
            margin: 0;
            overflow: hidden;

            td, th {
              min-width: 1em;
              border: 2px solid #ced4da;
              padding: 3px 5px;
              vertical-align: top;
              box-sizing: border-box;
              position: relative;

              > * {
                margin-bottom: 0;
              }
            }

            th {
              font-weight: bold;
              text-align: left;
              background-color: #f1f3f5;
            }

            .selectedCell:after {
              z-index: 2;
              position: absolute;
              content: "";
              left: 0; right: 0; top: 0; bottom: 0;
              background: rgba(200, 200, 255, 0.4);
              pointer-events: none;
            }

            .column-resize-handle {
              position: absolute;
              right: -2px;
              top: 0;
              bottom: -2px;
              width: 4px;
              background-color: #adf;
              pointer-events: none;
            }

            p {
              margin: 0;
            }
          }

          details {
            border: 1px solid #ced4da;
            border-radius: 4px;
            padding: 0.5rem;
            margin: 1rem 0;

            summary {
              font-weight: bold;
              cursor: pointer;
            }

            div[data-type="detailsContent"] {
              margin-top: 0.5rem;
            }
          }

          iframe {
            max-width: 100%;
          }

          div[data-youtube-video] {
            width: 100%;
            max-width: 100%;
            margin: 1rem 0;
            overflow: hidden;
            border-radius: 0.75rem;
          }

          div[data-youtube-video] iframe {
            display: block;
            width: 100%;
            max-width: 100%;
            aspect-ratio: 16 / 9;
            height: auto;
            border: 0;
          }

          details {
            border: 1px solid #ced4da;
            border-radius: 4px;
            padding: 0.5rem;
            margin: 1rem 0;

            summary {
              font-weight: bold;
              cursor: pointer;
            }

            div[data-type="detailsContent"] {
              margin-top: 0.5rem;
            }
          }
        }
      `}</style>
      <EditorContent
        editor={editor}
        className="tiptap-viewer"
      />
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { PreviewModal } from "./PreviewModal";
import { Search } from "lucide-react";

interface LinkedBlock {
  language: string;
  content: string;
  blockId: string;
}

interface PreviewButtonProps {
  blockId: string;
  language: string;
  content: string;
  linkedBlocks: LinkedBlock[];
}

export function CodeBlockPreviewButton({
  blockId,
  language,
  content,
  linkedBlocks,
}: PreviewButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Collect all code for preview
  const previewCode = useMemo(() => {
    // Find HTML (current block or linked)
    const htmlBlock =
      language === "html"
        ? { content, language }
        : linkedBlocks.find((b) => b.language === "html");

    // Find CSS and JS from linked blocks
    const cssBlock = linkedBlocks.find((b) => b.language === "css");
    const jsBlock = linkedBlocks.find((b) => b.language === "javascript");

    // Fallback for missing HTML
    let finalHtml = htmlBlock?.content || "";
    let finalCss = cssBlock?.content || "";
    let finalJs = jsBlock?.content || "";

    if (!htmlBlock && (cssBlock || jsBlock)) {
      // Auto-wrap CSS/JS in minimal HTML template
      finalHtml = `<!DOCTYPE html>
<html>
<head><style>${finalCss}</style></head>
<body>
  <div id="app"></div>
  <script>${finalJs}</script>
</body>
</html>`;
      finalCss = "";
      finalJs = "";
    }

    return { html: finalHtml, css: finalCss, js: finalJs };
  }, [language, content, linkedBlocks]);

  // Only show button if there's HTML content available
  if (!previewCode.html) return null;

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="mt-3 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition text-sm font-medium flex items-center justify-center gap-2"
      >
        <Search size={16} />
        Try Yourself
      </button>

      {isModalOpen && (
        <PreviewModal
          html={previewCode.html}
          css={previewCode.css}
          js={previewCode.js}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}

"use client";

import {
  SandpackProvider,
  SandpackPreview,
  SandpackConsole,
  SandpackCodeEditor,
  useSandpack,
} from "@codesandbox/sandpack-react";
import { useEffect, useMemo, useState } from "react";
import { Terminal, X, Code2, Eye, Columns2 } from "lucide-react";

interface PreviewModalProps {
  html: string;
  css: string;
  js: string;
  onClose: () => void;
}

type Tab = "split" | "code" | "preview";

function SandpackActiveFileSync({ activeFile }: { activeFile: string }) {
  const {
    sandpack: { activeFile: currentActiveFile, setActiveFile },
  } = useSandpack();
  useEffect(() => {
    if (currentActiveFile !== activeFile) {
      setActiveFile(activeFile);
    }
  }, [activeFile, currentActiveFile, setActiveFile]);
  return null;
}

export function PreviewModal({ html, css, js, onClose }: PreviewModalProps) {
  const hasJS = !!js && js.trim().length > 0;
  const [showConsole, setShowConsole] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("split");
  const [activeFile, setActiveFile] = useState("/index.html");

  const sandpackKey = useMemo(
    () => btoa(encodeURIComponent(html + css + js)).slice(0, 32),
    [html, css, js],
  );

  const files = useMemo(
    () => ({
      "/index.html": `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  ${html}
  <script src="/index.js"></script>
</body>
</html>`,
      "/styles.css": css,
      "/index.js": js,
    }),
    [html, css, js],
  );

  const fileTabs = [
    { id: "/index.html", label: "HTML" },
    { id: "/styles.css", label: "CSS" },
    { id: "/index.js", label: "JS" },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          {/* File tabs (only show when code is visible) */}
          <div className="flex items-center gap-1">
            {(activeTab === "split" || activeTab === "code") &&
              fileTabs.map((file) => (
                <button
                  key={file.id}
                  onClick={() => setActiveFile(file.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    activeFile === file.id
                      ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-gray-600"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  {file.label}
                </button>
              ))}
          </div>

          {/* View toggle + actions */}
          <div className="flex items-center gap-2">
            {/* View mode tabs */}
            <div className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-lg p-0.5">
              <button
                onClick={() => setActiveTab("split")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeTab === "split"
                    ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                <Columns2 size={14} /> Split
              </button>
              <button
                onClick={() => setActiveTab("code")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeTab === "code"
                    ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                <Code2 size={14} /> Code
              </button>
              <button
                onClick={() => setActiveTab("preview")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeTab === "preview"
                    ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                <Eye size={14} /> Preview
              </button>
            </div>

            {hasJS && (
              <button
                onClick={() => setShowConsole((v) => !v)}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  showConsole
                    ? "bg-primary text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                <Terminal size={14} /> Console
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Sandpack Editor + Preview */}
        <div className="flex-1 relative min-h-0">
          <SandpackProvider
            key={sandpackKey}
            template="vanilla"
            files={files}
            options={{
              activeFile,
              visibleFiles: ["/index.html", "/styles.css", "/index.js"],
              recompileMode: "delayed",
              recompileDelay: 600,
              autorun: true,
            }}
          >
            <SandpackActiveFileSync activeFile={activeFile} />
            <div className="absolute inset-0 flex flex-col min-h-0">
              {/* Editor + Preview split */}
              <div className="flex-1 flex min-h-0">
                {/* Code Editor */}
                {(activeTab === "split" || activeTab === "code") && (
                  <div
                    className={`${
                      activeTab === "split" ? "w-1/2" : "w-full"
                    } h-full min-h-0 overflow-auto border-r border-gray-200 dark:border-gray-700`}
                  >
                    <SandpackCodeEditor
                      showTabs={false}
                      showLineNumbers
                      showInlineErrors
                      wrapContent
                      style={{ height: "100%", overflow: "auto" }}
                    />
                  </div>
                )}

                {/* Preview */}
                {(activeTab === "split" || activeTab === "preview") && (
                  <div
                    className={`${
                      activeTab === "split" ? "w-1/2" : "w-full"
                    } h-full min-h-0 bg-white flex flex-col`}
                  >
                    <div className="flex-1 relative min-h-0">
                      <SandpackPreview
                        showNavigator={false}
                        showOpenInCodeSandbox={false}
                        style={{ height: "100%" }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Console */}
              {showConsole && hasJS && (
                <div className="h-32 border-t border-gray-200 dark:border-gray-700">
                  <SandpackConsole style={{ height: "100%" }} showSyntaxError />
                </div>
              )}
            </div>
          </SandpackProvider>
        </div>

        {/* Footer note */}
        <div className="p-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 text-center">
          ✏️ Edit the code above - changes are temporary and reset when you
          close
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackConsole,
  useSandpack,
} from "@codesandbox/sandpack-react";
import { ChevronDown, ChevronUp, RotateCcw, Play, Terminal } from "lucide-react";

const DEFAULT_HTML = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <h1>Hello, World!</h1>
    <p>Edit the code and click Run to see your changes.</p>
    <script src="index.js"></script>
  </body>
</html>`;

const DEFAULT_CSS = `body {
  font-family: sans-serif;
  padding: 20px;
}
h1 {
  color: royalblue;
}`;

const DEFAULT_JS = `console.log("Welcome student!");`;

interface CodePlaygroundProps {
  initialHTML?: string;
  initialCSS?: string;
  initialJS?: string;
  defaultExpanded?: boolean;
}

type ActiveTab = "html" | "css" | "js";

function RunButton() {
  const { dispatch } = useSandpack();
  return (
    <button
      onClick={() => dispatch({ type: "refresh" })}
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary text-white font-body text-xs font-semibold hover:bg-primary/90 transition-colors"
    >
      <Play size={11} /> Run
    </button>
  );
}

function ResetButton({ onReset }: { onReset: () => void }) {
  return (
    <button
      onClick={onReset}
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-border bg-surface-card font-body text-xs text-muted-contrast hover:bg-surface-muted transition-colors"
    >
      <RotateCcw size={11} /> Reset
    </button>
  );
}

export default function CodePlayground({
  initialHTML,
  initialCSS,
  initialJS,
  defaultExpanded = false,
}: CodePlaygroundProps) {
  const html = initialHTML ?? DEFAULT_HTML;
  const css = initialCSS ?? DEFAULT_CSS;
  const js = initialJS ?? DEFAULT_JS;

  const [activeTab, setActiveTab] = useState<ActiveTab>("html");
  const [showConsole, setShowConsole] = useState(false);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [sandpackKey, setSandpackKey] = useState(0);

  const editorHeight = isExpanded ? "480px" : "260px";
  const consoleHeight = "120px";

  const tabFile: Record<ActiveTab, string> = {
    html: "/index.html",
    css: "/styles.css",
    js: "/index.js",
  };

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-[#1e1e2e] shadow-md">
      <SandpackProvider
        key={sandpackKey}
        template="vanilla"
        files={{
          "/index.html": { code: html, active: activeTab === "html" },
          "/styles.css": { code: css, active: activeTab === "css" },
          "/index.js": { code: js, active: activeTab === "js" },
        }}
        options={{
          activeFile: tabFile[activeTab],
          visibleFiles: ["/index.html", "/styles.css", "/index.js"],
          recompileMode: "delayed",
          recompileDelay: 800,
        }}
        theme="dark"
      >
        {/* ─── Toolbar ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-[#181825]">
          {/* Tabs */}
          <div className="flex items-center gap-1">
            {(["html", "css", "js"] as ActiveTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-md font-mono text-xs font-semibold transition-colors ${
                  activeTab === tab
                    ? "bg-primary text-white"
                    : "text-white/50 hover:text-white/80 hover:bg-white/5"
                }`}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowConsole((v) => !v)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md border font-body text-xs transition-colors ${
                showConsole
                  ? "border-primary/60 bg-primary/10 text-primary"
                  : "border-white/10 text-white/50 hover:text-white/80 hover:bg-white/5"
              }`}
            >
              <Terminal size={11} /> Console
            </button>
            <ResetButton onReset={() => setSandpackKey((k) => k + 1)} />
            <RunButton />
          </div>
        </div>

        {/* ─── Editor + Preview ─────────────────────────────────────────── */}
        <SandpackLayout style={{ border: "none", borderRadius: 0 }}>
          <SandpackCodeEditor
            showTabs={false}
            showLineNumbers
            showInlineErrors
            wrapContent
            style={{ height: editorHeight, minWidth: 0, flex: 1 }}
          />
          <div
            style={{ flex: 1, display: "flex", flexDirection: "column" }}
          >
            <SandpackPreview
              showNavigator={false}
              showOpenInCodeSandbox={false}
              style={{ height: editorHeight, flex: 1 }}
            />
            {showConsole && (
              <SandpackConsole
                style={{ height: consoleHeight, borderTop: "1px solid rgba(255,255,255,0.08)" }}
                showSyntaxError
              />
            )}
          </div>
        </SandpackLayout>

        {/* ─── Expand / Collapse footer ─────────────────────────────────── */}
        <div className="flex justify-center py-1.5 border-t border-white/10 bg-[#181825]">
          <button
            onClick={() => setIsExpanded((v) => !v)}
            className="inline-flex items-center gap-1 font-body text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronUp size={13} /> Collapse
              </>
            ) : (
              <>
                <ChevronDown size={13} /> Expand
              </>
            )}
          </button>
        </div>
      </SandpackProvider>
    </div>
  );
}

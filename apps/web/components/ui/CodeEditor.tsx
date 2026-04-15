"use client";

import { useCallback } from "react";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { markdown } from "@codemirror/lang-markdown";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { rust } from "@codemirror/lang-rust";
import { xml } from "@codemirror/lang-xml";
import { yaml } from "@codemirror/lang-yaml";
import { StreamLanguage } from "@codemirror/language";
import { shell } from "@codemirror/legacy-modes/mode/shell";

export type CodeLanguage =
  | "html"
  | "css"
  | "javascript"
  | "typescript"
  | "python"
  | "markdown"
  | "text"
  | "bash"
  | "cpp"
  | "csharp"
  | "rust"
  | "java"
  | "xml"
  | "yaml";

const LANGUAGES: { value: CodeLanguage; label: string }[] = [
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "markdown", label: "Markdown" },
  { value: "text", label: "Text" },
  { value: "bash", label: "Bash" },
  { value: "cpp", label: "C/C++" },
  { value: "csharp", label: "C#" },
  { value: "rust", label: "Rust" },
  { value: "java", label: "Java" },
  { value: "xml", label: "XML" },
  { value: "yaml", label: "YAML" },
];

function getExtension(lang: CodeLanguage) {
  switch (lang) {
    case "html":
      return [html()];
    case "css":
      return [css()];
    case "javascript":
      return [javascript()];
    case "typescript":
      return [javascript({ typescript: true })];
    case "python":
      return [python()];
    case "markdown":
      return [markdown()];
    case "text":
      return [];
    case "bash":
      return [StreamLanguage.define(shell)];
    case "cpp":
      return [cpp()];
    case "csharp":
      return [cpp()]; // @codemirror/lang-cpp often handles C# as well or use cpp for it
    case "rust":
      return [rust()];
    case "java":
      return [java()];
    case "xml":
      return [xml()];
    case "yaml":
      return [yaml()];
    default:
      return [];
  }
}

interface CodeEditorProps {
  value: string;
  language: CodeLanguage;
  onValueChange: (v: string) => void;
  onLanguageChange: (l: CodeLanguage) => void;
  readOnly?: boolean;
}

export function CodeEditor({
  value,
  language,
  onValueChange,
  onLanguageChange,
  readOnly = false,
}: CodeEditorProps) {
  const handleChange = useCallback(
    (v: string) => onValueChange(v),
    [onValueChange],
  );

  return (
    <div className="rounded-lg overflow-hidden border border-border bg-editor">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-editor-panel border-b border-editor-border">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#FF5F57]" />
          <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
          <span className="w-3 h-3 rounded-full bg-[#28C840]" />
        </div>
        {readOnly ? (
          <span className="font-mono text-xs text-muted-contrast">
            {LANGUAGES.find((l) => l.value === language)?.label ?? language}
          </span>
        ) : (
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as CodeLanguage)}
            className="bg-[#3a3a3a] text-[#E5E7EB] font-mono text-xs rounded px-2 py-0.5 border border-[#555] focus:outline-none focus:border-primary cursor-pointer"
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Editor */}
      <CodeMirror
        value={value}
        extensions={[
          ...getExtension(language),
          ...(readOnly ? [EditorView.lineWrapping] : []),
        ]}
        onChange={handleChange}
        readOnly={readOnly}
        theme="dark"
        basicSetup={{
          lineNumbers: true,
          foldGutter: false,
          dropCursor: false,
          allowMultipleSelections: false,
          indentOnInput: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          highlightActiveLine: !readOnly,
          highlightSelectionMatches: !readOnly,
        }}
        style={{ fontSize: "13px", maxHeight: "400px" }}
      />
    </div>
  );
}

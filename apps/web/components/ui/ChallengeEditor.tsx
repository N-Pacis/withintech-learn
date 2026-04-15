"use client";

import { useCallback } from "react";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import type { ChallengeLanguage } from "@/hooks/queries/challenges";

function getExtension(lang: ChallengeLanguage) {
  switch (lang) {
    case "python":
      return [python()];
    case "java":
      return [java()];
    case "javascript":
      return [javascript()];
    case "c":
      return [cpp()]; // cpp extension handles C syntax
    case "cpp":
      return [cpp()];
    case "go":
      return []; // Go CM extension not installed; plain text
    default:
      return [];
  }
}

// Blocks copy, cut, and paste in the editor (academic integrity measure)
const noCopyPaste = EditorView.domEventHandlers({
  paste(event) {
    event.preventDefault();
    return true;
  },
  copy(event) {
    event.preventDefault();
    return true;
  },
  cut(event) {
    event.preventDefault();
    return true;
  },
});

interface ChallengeEditorProps {
  value: string;
  language: ChallengeLanguage;
  onValueChange: (v: string) => void;
  /** When set, renders a plain language label in the header instead of a dropdown */
  readOnly?: boolean;
}

export function ChallengeEditor({
  value,
  language,
  onValueChange,
  readOnly = false,
}: ChallengeEditorProps) {
  const handleChange = useCallback(
    (v: string) => onValueChange(v),
    [onValueChange],
  );

  return (
    <div className="flex flex-col h-full overflow-hidden bg-editor">
      <CodeMirror
        value={value}
        extensions={[
          ...getExtension(language),
          ...(readOnly ? [] : [noCopyPaste]),
        ]}
        onChange={handleChange}
        readOnly={readOnly}
        theme="dark"
        basicSetup={{
          lineNumbers: true,
          foldGutter: false,
          dropCursor: true,
          allowMultipleSelections: false,
          indentOnInput: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          highlightActiveLine: !readOnly,
          highlightSelectionMatches: !readOnly,
        }}
        style={{ fontSize: "13px", height: "100%", overflow: "auto" }}
        height="100%"
      />
    </div>
  );
}

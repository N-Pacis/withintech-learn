'use client';

import { useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';

export type CodeLanguage = 'html' | 'css' | 'javascript' | 'python';

const LANGUAGES: { value: CodeLanguage; label: string }[] = [
  { value: 'html',       label: 'HTML'       },
  { value: 'css',        label: 'CSS'        },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python',     label: 'Python'     },
];

function getExtension(lang: CodeLanguage) {
  switch (lang) {
    case 'html':       return [html()];
    case 'css':        return [css()];
    case 'javascript': return [javascript()];
    case 'python':     return [python()];
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
  const handleChange = useCallback((v: string) => onValueChange(v), [onValueChange]);

  return (
    <div className="rounded-lg overflow-hidden border border-[#E5E7EB] bg-[#1e1e1e]">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#2d2d2d] border-b border-[#3a3a3a]">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#FF5F57]" />
          <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
          <span className="w-3 h-3 rounded-full bg-[#28C840]" />
        </div>
        {readOnly ? (
          <span className="font-mono text-xs text-[#9CA3AF]">
            {LANGUAGES.find(l => l.value === language)?.label ?? language}
          </span>
        ) : (
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as CodeLanguage)}
            className="bg-[#3a3a3a] text-[#E5E7EB] font-mono text-xs rounded px-2 py-0.5 border border-[#555] focus:outline-none focus:border-[#3D006B] cursor-pointer"
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        )}
      </div>

      {/* Editor */}
      <CodeMirror
        value={value}
        extensions={getExtension(language)}
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
        style={{ fontSize: '13px', maxHeight: '400px' }}
      />
    </div>
  );
}

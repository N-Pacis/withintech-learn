'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Eye, EyeOff, Save, ChevronDown, CheckCircle2, Play, FlaskConical, Send, Pencil } from 'lucide-react';
import {
  useAdminChallenge,
  useUpdateChallenge,
  usePublishChallenge,
  useUnpublishChallenge,
  useAddTestCase,
  useDeleteTestCase,
  useRunAdminChallenge,
  type ChallengeLanguage,
  type StarterCode,
  type ChallengeTestCase,
  type SubmissionResult,
  type FunctionParam,
  type ParamType,
} from '@/hooks/queries/challenges';
import { Button, Badge, FormField, PageLoader, TiptapEditor, TiptapViewer, Textarea } from '@/components/ui';
import { ChallengeEditor } from '@/components/ui/ChallengeEditor';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { CHALLENGE_LANGUAGES, DEFAULT_STARTER_CODE, normalizeVisibleChallengeCode } from '@/lib/challenges';
import { ProblemPanel } from '@/app/learn/challenges/[slug]/components/ProblemPanel';
import { SubmissionResults } from '@/app/learn/challenges/[slug]/components/SubmissionResults';

// ─── Helpers for structured test case input ───────────────────────────────────

const PARAM_TYPES_LIST: ParamType[] = [
  'int', 'float', 'double', 'char', 'string',
  'int[]', 'float[]', 'double[]', 'char[]', 'string[]',
  'int[][]', 'float[][]', 'double[][]', 'char[][]', 'string[][]',
];

function paramInputPlaceholder(type: ParamType): string {
  if (type.endsWith('[][]')) return 'e.g. 1,2;3,4 (rows separated by ;)';
  if (type.endsWith('[]'))   return type.startsWith('string') ? 'one per line' : 'e.g. 1, 2, 3';
  if (type === 'char')       return 'e.g. a';
  if (type === 'string')     return 'e.g. hello world';
  return 'e.g. 42';
}

function parseParamValue(type: ParamType, raw: string): unknown {
  if (type.endsWith('[][]')) {
    return raw.split(';').map(row =>
      row.split(',').map(v => {
        const t = type.slice(0, -4) as ParamType;
        return parseScalar(t, v.trim());
      }),
    );
  }
  if (type.endsWith('[]')) {
    const et = type.slice(0, -2) as ParamType;
    if (et === 'string') return raw.split('\n').map(v => v.trimEnd());
    return raw.split(',').map(v => parseScalar(et, v.trim()));
  }
  return parseScalar(type, raw.trim());
}

function parseScalar(type: ParamType, v: string): unknown {
  if (type === 'int')    return parseInt(v) || 0;
  if (type === 'float' || type === 'double') return parseFloat(v) || 0;
  if (type === 'char')   return v[0] ?? '';
  return v;
}

function formatParamForDisplay(type: ParamType, value: unknown): string {
  if (value === null || value === undefined) return '(empty)';
  if (Array.isArray(value)) return JSON.stringify(value);
  return String(value);
}

function prettyInput(input: string, params: FunctionParam[] | null): React.ReactNode {
  if (!params || params.length === 0 || !input) {
    return <pre className="font-mono text-xs bg-[#F3F4F6] rounded-lg px-3 py-2.5 whitespace-pre-wrap break-all">{input || '(empty)'}</pre>;
  }
  try {
    const values = JSON.parse(input) as unknown[];
    return (
      <div className="flex flex-col gap-1.5">
        {params.map((p, i) => (
          <div key={p.name} className="flex items-start gap-2">
            <span className="font-mono text-[11px] text-[#9CA3AF] shrink-0 pt-0.5">{p.name} =</span>
            <pre className="font-mono text-xs bg-[#F3F4F6] rounded px-2 py-0.5 whitespace-pre-wrap break-all flex-1">
              {formatParamForDisplay(p.type, values[i])}
            </pre>
          </div>
        ))}
      </div>
    );
  } catch {
    return <pre className="font-mono text-xs bg-[#F3F4F6] rounded-lg px-3 py-2.5 whitespace-pre-wrap break-all">{input}</pre>;
  }
}

// ─── Test case row ────────────────────────────────────────────────────────────

function TestCaseRow({
  tc,
  functionParams,
  onDelete,
  deleting,
}: {
  tc:             ChallengeTestCase;
  functionParams: FunctionParam[] | null;
  onDelete:       (id: string) => void;
  deleting:       boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center gap-3 px-4 py-3 bg-[#F9FAFB] hover:bg-[#F3F4F6] transition-colors text-left"
        onClick={() => setExpanded(v => !v)}
      >
        <span className="font-body text-xs font-medium text-[#374151] flex-1">
          Test #{tc.orderIndex + 1}
        </span>
        {tc.isHidden
          ? <span className="flex items-center gap-1 font-body text-[11px] text-[#9CA3AF]"><EyeOff size={11} />Hidden</span>
          : <span className="flex items-center gap-1 font-body text-[11px] text-green-600"><Eye size={11} />Visible</span>}
        <button
          onClick={e => { e.stopPropagation(); onDelete(tc.id); }}
          disabled={deleting}
          className="p-1 rounded-lg hover:bg-red-50 text-[#C4B5FD] hover:text-red-500 transition-colors disabled:opacity-40 ml-1"
          title="Delete test case"
        >
          <Trash2 size={13} />
        </button>
        <ChevronDown
          size={14}
          className={cn('text-[#9CA3AF] transition-transform duration-200 shrink-0', expanded ? 'rotate-180' : '')}
        />
      </button>

      {expanded && (
        <div className="p-4 grid gap-3 bg-white">
          <div>
            <span className="font-body text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wider block mb-1.5">Input</span>
            {prettyInput(tc.input, functionParams)}
          </div>
          <div>
            <span className="font-body text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wider block mb-1">Expected Output</span>
            <pre className="font-mono text-xs bg-[#F3F4F6] rounded-lg px-3 py-2.5 whitespace-pre-wrap break-all leading-relaxed text-[#374151]">{tc.expectedOutput}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Add test case form ───────────────────────────────────────────────────────

function AddTestCaseForm({
  challengeId,
  nextIndex,
  functionParams,
}: {
  challengeId:    string;
  nextIndex:      number;
  functionParams: FunctionParam[] | null;
}) {
  const addMutation = useAddTestCase(challengeId);
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [rawInput, setRawInput]       = useState('');   // fallback when no params
  const [expected, setExpected]       = useState('');
  const [isHidden, setIsHidden]       = useState(true);
  const [open, setOpen]               = useState(false);
  const [error, setError]             = useState('');

  const hasParams = functionParams && functionParams.length > 0;

  const buildInput = (): string => {
    if (!hasParams) return rawInput;
    const values = functionParams.map(p => parseParamValue(p.type, paramValues[p.name] ?? ''));
    return JSON.stringify(values);
  };

  const handleAdd = async () => {
    if (!expected.trim()) { setError('Expected output is required.'); return; }
    setError('');
    const res = await addMutation.mutateAsync({
      input:          buildInput(),
      expectedOutput: expected,
      isHidden,
      orderIndex:     nextIndex,
    });
    if (res.success) {
      toast.success('Test case added');
      setParamValues({}); setRawInput(''); setExpected(''); setOpen(false);
    } else {
      toast.error(res.message ?? 'Failed to add test case');
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-[#E5E7EB] rounded-xl font-body text-sm text-[#9CA3AF] hover:border-[#3D006B]/40 hover:text-[#3D006B] transition-colors"
      >
        <Plus size={15} /> Add Test Case
      </button>
    );
  }

  return (
    <div className="border-2 border-[#3D006B]/30 rounded-xl p-5 bg-[#F9F5FF] flex flex-col gap-4">
      <h3 className="font-heading font-semibold text-sm text-[#3D006B]">New Test Case #{nextIndex + 1}</h3>

      {hasParams ? (
        <div className="flex flex-col gap-3">
          <p className="font-body text-xs text-[#6B7280]">Enter a value for each parameter:</p>
          {functionParams.map(p => (
            <FormField
              key={p.name}
              label={p.name}
              hint={`type: ${p.type}`}
            >
              {p.type.endsWith('[]') ? (
                <Textarea
                  value={paramValues[p.name] ?? ''}
                  onChange={e => setParamValues(v => ({ ...v, [p.name]: e.target.value }))}
                  rows={p.type.endsWith('[][]') ? 3 : 2}
                  placeholder={paramInputPlaceholder(p.type)}
                  className="font-mono text-xs"
                />
              ) : (
                <input
                  value={paramValues[p.name] ?? ''}
                  onChange={e => setParamValues(v => ({ ...v, [p.name]: e.target.value }))}
                  placeholder={paramInputPlaceholder(p.type)}
                  className="w-full font-mono text-xs border border-[#E5E7EB] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3D006B]/30 focus:border-[#3D006B] bg-white"
                />
              )}
            </FormField>
          ))}
        </div>
      ) : (
        <FormField label="Input" hint="Raw stdin input. Leave empty if the problem takes no input.">
          <Textarea
            value={rawInput}
            onChange={e => setRawInput(e.target.value)}
            rows={3}
            placeholder="e.g.&#10;5&#10;1 2 3 4 5&#10;9"
            className="font-mono text-xs"
          />
        </FormField>
      )}

      <FormField label="Expected Output" required error={error}>
        <Textarea
          value={expected}
          onChange={e => { setExpected(e.target.value); setError(''); }}
          rows={2}
          placeholder={hasParams ? 'e.g. 0 (the return value your solution should produce)' : 'e.g. 1 3'}
          className="font-mono text-xs"
        />
      </FormField>

      <label className="flex items-center gap-2.5 cursor-pointer w-fit">
        <input
          type="checkbox"
          checked={isHidden}
          onChange={e => setIsHidden(e.target.checked)}
          className="w-4 h-4 rounded border-[#E5E7EB] accent-[#3D006B]"
        />
        <span className="font-body text-sm text-[#374151]">
          Hidden from students
          <span className="text-[#9CA3AF] ml-1 text-xs">(recommended for most test cases)</span>
        </span>
      </label>

      <div className="flex gap-2 justify-end pt-1">
        <Button variant="secondary" size="sm" onClick={() => { setOpen(false); setError(''); }}>Cancel</Button>
        <Button variant="primary" size="sm" loading={addMutation.isPending} onClick={handleAdd}>
          Add Test Case
        </Button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Tab = 'details' | 'tests' | 'sandbox';

export default function EditChallengePage() {
  const { challengeId }                      = useParams<{ challengeId: string }>();
  const { data: challenge, isLoading }       = useAdminChallenge(challengeId);
  const updateMutation                       = useUpdateChallenge(challengeId);
  const publishMutation                      = usePublishChallenge();
  const unpublishMutation                    = useUnpublishChallenge();
  const deleteTestCaseMutation               = useDeleteTestCase(challengeId);
  const runChallengeMutation                 = useRunAdminChallenge(challengeId);

  const [activeTab, setActiveTab]           = useState<Tab>('details');
  const [mobileSandboxPanel, setMobileSandboxPanel] = useState<'problem' | 'code'>('problem');
  const [sandboxLang, setSandboxLang]       = useState<ChallengeLanguage>('python');
  const [sandboxCode, setSandboxCode]       = useState<StarterCode>(DEFAULT_STARTER_CODE);
  const [description, setDescription]      = useState('');
  const [initialized, setInitialized]      = useState(false);
  const [detailsSaved, setDetailsSaved]    = useState(false);
  const [sandboxResult, setSandboxResult]  = useState<SubmissionResult | null>(null);
  const [isEditingProblem, setIsEditingProblem] = useState(false);

  useEffect(() => {
    if (challenge && !initialized) {
      setDescription(challenge.description);
      const starter = challenge.starterCode as Partial<StarterCode>;
      setSandboxCode({
        python: normalizeVisibleChallengeCode('python', starter.python),
        java: normalizeVisibleChallengeCode('java', starter.java),
        javascript: normalizeVisibleChallengeCode('javascript', starter.javascript),
        c: normalizeVisibleChallengeCode('c', starter.c),
        cpp: normalizeVisibleChallengeCode('cpp', starter.cpp),
        go: normalizeVisibleChallengeCode('go', starter.go),
      });
      setInitialized(true);
    }
  }, [challenge, initialized]);

  const hasDescriptionText = (html: string) => html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();

  if (isLoading) return <div className="p-6 max-w-4xl mx-auto"><PageLoader type="form" /></div>;

  if (!challenge) {
    return (
      <div className="p-6 text-center">
        <p className="font-body text-sm text-[#9CA3AF]">Challenge not found.</p>
        <Link href="/admin/challenges">
          <Button variant="secondary" size="sm" className="mt-3">Back</Button>
        </Link>
      </div>
    );
  }

  const handleSaveDetails = async () => {
    const res = await updateMutation.mutateAsync({ description });
    if (res.success) {
      toast.success('Problem saved');
      setDetailsSaved(true);
      setIsEditingProblem(false);
      setTimeout(() => setDetailsSaved(false), 2000);
    }
    else toast.error(res.message ?? 'Failed to save');
  };

  const handleTogglePublish = async () => {
    if (challenge.status === 'published') {
      const res = await unpublishMutation.mutateAsync(challengeId);
      if (res.success) toast.success('Challenge unpublished');
      else toast.error(res.message ?? 'Failed');
    } else {
      const res = await publishMutation.mutateAsync(challengeId);
      if (res.success) toast.success('Challenge published — students can now see it!');
      else toast.error(res.message ?? 'Failed');
    }
  };

  const handleDeleteTestCase = async (tcId: string) => {
    const res = await deleteTestCaseMutation.mutateAsync(tcId);
    if (res.success) toast.success('Test case deleted');
    else toast.error(res.message ?? 'Failed to delete');
  };

  const handleRunSandbox = async () => {
    const code = sandboxCode[sandboxLang];
    if (!code.trim()) {
      toast.error('Write some code before running the sandbox.');
      return;
    }

    const toastId = toast.loading('Running the challenge sandbox…');
    try {
      const res = await runChallengeMutation.mutateAsync({ language: sandboxLang, code });
      toast.dismiss(toastId);

      if (!res.data) {
        toast.error(res.message ?? 'Sandbox run failed.');
        return;
      }

      setSandboxResult(res.data);
      if (res.data.status === 'accepted') {
        toast.success(`Accepted — ${res.data.testsPassed}/${res.data.totalTests} tests passed`);
      } else if (res.data.status === 'compile_error') {
        toast.error('Compile error — check the generated starter and expected solution flow.');
      } else {
        toast.error(`${res.data.testsPassed}/${res.data.totalTests} tests passed.`);
      }
    } catch {
      toast.dismiss(toastId);
      toast.error('Something went wrong while running the sandbox.');
    }
  };

  const nextIndex = challenge.testCases?.length ?? 0;
  const visibleTestCases = challenge.testCases
    .filter(tc => !tc.isHidden)
    .map(tc => ({
      id: tc.id,
      input: tc.input,
      expectedOutput: tc.expectedOutput,
      orderIndex: tc.orderIndex,
    }));
  const hiddenCount = challenge.testCases.length - visibleTestCases.length;

  const tabItems: { id: Tab; label: string; badge?: string | number }[] = [
    { id: 'details', label: 'Problem' },
    { id: 'tests',   label: 'Test Cases', badge: challenge.testCases?.length ?? 0 },
    { id: 'sandbox', label: 'Sandbox' },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <Link href="/admin/challenges" className="text-[#9CA3AF] hover:text-[#3D006B] mt-1 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-heading font-black text-2xl text-[#0F0F0F] truncate">{challenge.title}</h1>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <Badge variant={challenge.status === 'published' ? 'purple' : 'gray'} size="sm">
              {challenge.status}
            </Badge>
            <span className="font-body text-xs text-[#9CA3AF]">·</span>
            <span className="font-body text-xs text-[#9CA3AF]">
              {challenge._count.submissions} submission{challenge._count.submissions !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <Button
          variant={challenge.status === 'published' ? 'secondary' : 'primary'}
          size="sm"
          loading={publishMutation.isPending || unpublishMutation.isPending}
          onClick={handleTogglePublish}
          className="shrink-0"
        >
          {challenge.status === 'published' ? <><EyeOff size={14} className="mr-1.5" />Unpublish</> : <><Eye size={14} className="mr-1.5" />Publish</>}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-[#E5E7EB] mb-6 overflow-x-auto">
        {tabItems.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-5 py-2.5 font-body text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'text-[#3D006B] border-b-2 border-[#3D006B] -mb-px'
                : 'text-[#6B7280] hover:text-[#3D006B]',
            )}
          >
            {tab.label}
            {tab.badge !== undefined && (
              <span className={cn(
                'text-[10px] font-mono px-1.5 py-0.5 rounded-full',
                activeTab === tab.id ? 'bg-[#3D006B] text-white' : 'bg-[#F3F4F6] text-[#6B7280]',
              )}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Function signature card (shown on all tabs) ─────────────────────── */}
      {challenge.functionParams && challenge.functionParams.length > 0 && (
        <div className="bg-[#1e1e1e] rounded-xl p-4 mb-2">
          <p className="font-mono text-[10px] text-[#9CA3AF] mb-1.5 uppercase tracking-wider">Function signature</p>
          <p className="font-mono text-xs text-[#C8E6C9]">
            def solution({challenge.functionParams.map((p: FunctionParam) => `${p.name}: ${p.type}`).join(', ')})
            {challenge.returnType ? ` → ${challenge.returnType}` : ''}:
          </p>
        </div>
      )}

      {/* ── Details tab ─────────────────────────────────────────────────────── */}
      {activeTab === 'details' && (
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-heading font-semibold text-lg text-[#0F0F0F]">Problem</h2>
              <p className="font-body text-sm text-[#6B7280] mt-1">
                Review the current problem statement, then edit only when you need to.
              </p>
            </div>

            {!isEditingProblem && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsEditingProblem(true)}
              >
                <Pencil size={14} className="mr-1.5" />
                Edit Problem
              </Button>
            )}
          </div>

          {isEditingProblem ? (
            <>
              <FormField
                label="Problem"
                hint="Write the full problem statement, constraints, and I/O format. Rich text, tables, links, and headings are supported. Images are disabled for now."
                required
              >
                <TiptapEditor
                  content={description}
                  onChange={(html) => setDescription(html)}
                  placeholder="Write a Rwanda-themed challenge, like optimizing stops on a Kigali moto route, and use tables for examples if needed."
                  className="bg-white"
                />
              </FormField>
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => {
                    setDescription(challenge.description);
                    setIsEditingProblem(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  loading={updateMutation.isPending}
                  onClick={() => {
                    if (!hasDescriptionText(description)) {
                      toast.error('Problem statement is required.');
                      return;
                    }
                    handleSaveDetails();
                  }}
                >
                  {detailsSaved
                    ? <><CheckCircle2 size={14} className="mr-1.5" />Saved</>
                    : <><Save size={14} className="mr-1.5" />Save Problem</>}
                </Button>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-[#E5E7EB] bg-[#FCFCFD] p-5">
              <TiptapViewer content={challenge.description} className="tiptap-viewer text-[#0F0F0F]" />
            </div>
          )}
        </div>
      )}

      {/* ── Sandbox tab ─────────────────────────────────────────────────────── */}
      {activeTab === 'sandbox' && (
        <div className="flex flex-col gap-4">
          <div className="bg-[#F9F5FF] border border-[#E9D5FF] rounded-xl p-4 flex items-start gap-3">
            <FlaskConical size={18} className="text-[#3D006B] mt-0.5 shrink-0" />
            <div className="font-body text-sm text-[#6B7280] leading-relaxed">
              This sandbox mirrors the student workspace, but hidden test failures stay visible here so you can debug the challenge before publishing.
              {hiddenCount > 0 && <span className="block mt-1 text-xs text-[#9CA3AF]">{hiddenCount} hidden test case{hiddenCount !== 1 ? 's are' : ' is'} included in runs.</span>}
            </div>
          </div>

          <div className="flex flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white" style={{ height: '72vh' }}>
            <div className="flex items-center gap-3 px-4 py-2.5 border-b border-[#E5E7EB] bg-white shrink-0">
              <span className="font-heading font-semibold text-sm text-[#0F0F0F] flex-1 truncate">
                {challenge.title}
              </span>

              <Button
                variant="primary"
                size="sm"
                loading={runChallengeMutation.isPending}
                onClick={handleRunSandbox}
                disabled={challenge.testCases.length === 0}
                className="shrink-0"
              >
                <Send size={13} className="mr-1" />
                Run Sandbox
              </Button>
            </div>

            {/* Mobile panel toggle */}
            <div className="md:hidden flex shrink-0 border-b border-[#E5E7EB] bg-white">
              {(['problem', 'code'] as const).map(panel => (
                <button
                  key={panel}
                  onClick={() => setMobileSandboxPanel(panel)}
                  className={cn(
                    'flex-1 py-2 font-body text-xs font-medium capitalize transition-colors',
                    mobileSandboxPanel === panel
                      ? 'text-[#3D006B] border-b-2 border-[#3D006B]'
                      : 'text-[#6B7280]',
                  )}
                >
                  {panel === 'problem' ? 'Problem' : 'Code'}
                </button>
              ))}
            </div>

            <div className="flex-1 flex overflow-hidden min-h-0">
              <div className={cn(
                'flex flex-col overflow-hidden bg-white border-r border-[#E5E7EB]',
                'md:flex md:w-[42%] md:min-w-[280px]',
                mobileSandboxPanel === 'problem' ? 'flex flex-1' : 'hidden',
              )}>
                <div className="flex-1 overflow-y-auto">
                  <ProblemPanel
                    title={challenge.title}
                    description={challenge.description}
                    difficulty={challenge.difficulty}
                    visibleTestCases={visibleTestCases}
                    functionParams={challenge.functionParams}
                  />
                </div>
              </div>

              <div className={cn(
                'flex flex-col overflow-hidden min-w-0',
                'md:flex md:flex-1',
                mobileSandboxPanel === 'code' ? 'flex flex-1' : 'hidden',
              )}>
                <div className="flex items-center gap-1 px-3 py-2 bg-[#1e1e1e] border-b border-[#3a3a3a] shrink-0 overflow-x-auto">
                  {CHALLENGE_LANGUAGES.map(l => (
                    <button
                      key={l.value}
                      onClick={() => setSandboxLang(l.value)}
                      className={cn(
                        'px-3 py-1 rounded font-mono text-xs font-medium whitespace-nowrap transition-colors',
                        sandboxLang === l.value
                          ? 'bg-[#3D006B] text-white'
                          : 'text-[#9CA3AF] hover:text-white hover:bg-[#3a3a3a]',
                      )}
                    >
                      {l.label}
                    </button>
                  ))}
                  <div className="ml-auto pl-2 shrink-0">
                    <span className="font-mono text-[10px] text-[#555] select-none hidden sm:block">
                      Generated main entrypoint
                    </span>
                  </div>
                </div>

                <div className="flex-1 overflow-hidden min-h-0">
                  <ChallengeEditor
                    value={sandboxCode[sandboxLang]}
                    language={sandboxLang}
                    onValueChange={v => setSandboxCode(prev => ({ ...prev, [sandboxLang]: v }))}
                    readOnly={false}
                  />
                </div>

                <div className="shrink-0 border-t border-[#E5E7EB] bg-white flex flex-col" style={{ maxHeight: '45%' }}>
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#E5E7EB]">
                    <div className="font-body text-xs font-medium text-[#3D006B]">Results</div>
                    {challenge.testCases.length === 0 && (
                      <div className="font-body text-[11px] text-amber-700">Add test cases to run the sandbox.</div>
                    )}
                  </div>
                  <div className="overflow-y-auto flex-1 min-h-0">
                    {sandboxResult ? (
                      <SubmissionResults result={sandboxResult} />
                    ) : (
                      <div className="p-5">
                        <p className="font-body text-xs text-[#9CA3AF] mb-3">
                          Use this sandbox to check the generated starter, visible examples, and hidden-case behavior before students open the challenge.
                        </p>
                        <div className="flex items-center gap-2 text-[#6B7280] font-body text-xs">
                          <Play size={12} />
                          Run the sandbox to execute all current test cases.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Test Cases tab ───────────────────────────────────────────────────── */}
      {activeTab === 'tests' && (
        <div className="flex flex-col gap-4">
          {/* Guidance */}
          <div className="bg-[#F9F5FF] border border-[#E9D5FF] rounded-xl p-4 font-body text-sm text-[#6B7280] leading-relaxed">
            <strong className="text-[#3D006B] font-semibold">Tips:</strong> Add at least one visible example (students see it) and several hidden test cases that cover edge cases. Publishing requires at least one test case.
          </div>

          {/* Require publishing to have test cases */}
          {challenge.testCases?.length === 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 font-body text-xs text-amber-700 flex items-center gap-2">
              <EyeOff size={14} /> Add at least one test case before publishing.
            </div>
          )}

          {challenge.testCases?.map(tc => (
            <TestCaseRow
              key={tc.id}
              tc={tc}
              functionParams={challenge.functionParams}
              onDelete={handleDeleteTestCase}
              deleting={deleteTestCaseMutation.isPending}
            />
          ))}

          <AddTestCaseForm
            challengeId={challengeId}
            nextIndex={nextIndex}
            functionParams={challenge.functionParams}
          />
        </div>
      )}
    </div>
  );
}

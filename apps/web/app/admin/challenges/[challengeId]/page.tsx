'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Eye, EyeOff, Save, ChevronDown, CheckCircle2 } from 'lucide-react';
import {
  useAdminChallenge,
  useUpdateChallenge,
  usePublishChallenge,
  useUnpublishChallenge,
  useAddTestCase,
  useDeleteTestCase,
  type ChallengeLanguage,
  type StarterCode,
  type ChallengeTestCase,
} from '@/hooks/queries/challenges';
import { Button, Badge, FormField, PageLoader, TiptapEditor, Textarea } from '@/components/ui';
import { ChallengeEditor } from '@/components/ui/ChallengeEditor';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ─── Constants ────────────────────────────────────────────────────────────────

const LANGUAGES: { value: ChallengeLanguage; label: string }[] = [
  { value: 'python',     label: 'Python 3'   },
  { value: 'java',       label: 'Java'       },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'c',          label: 'C'          },
  { value: 'cpp',        label: 'C++'        },
  { value: 'go',         label: 'Go'         },
];

// ─── Test case row ────────────────────────────────────────────────────────────

function TestCaseRow({
  tc,
  onDelete,
  deleting,
}: {
  tc:       ChallengeTestCase;
  onDelete: (id: string) => void;
  deleting: boolean;
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
            <span className="font-body text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wider block mb-1">Input</span>
            <pre className="font-mono text-xs bg-[#F3F4F6] rounded-lg px-3 py-2.5 whitespace-pre-wrap break-all leading-relaxed text-[#374151]">{tc.input || '(empty)'}</pre>
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

function AddTestCaseForm({ challengeId, nextIndex }: { challengeId: string; nextIndex: number }) {
  const addMutation                 = useAddTestCase(challengeId);
  const [input, setInput]           = useState('');
  const [expected, setExpected]     = useState('');
  const [isHidden, setIsHidden]     = useState(true);
  const [open, setOpen]             = useState(false);
  const [error, setError]           = useState('');

  const handleAdd = async () => {
    if (!expected.trim()) { setError('Expected output is required.'); return; }
    setError('');
    const res = await addMutation.mutateAsync({
      input,
      expectedOutput: expected,
      isHidden,
      orderIndex: nextIndex,
    });
    if (res.success) {
      toast.success('Test case added');
      setInput(''); setExpected(''); setOpen(false);
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

      <FormField label="Input" hint="What goes into stdin. Leave empty if the problem takes no input.">
        <Textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          rows={3}
          placeholder="e.g.&#10;5&#10;1 2 3 4 5&#10;9"
          className="font-mono text-xs"
        />
      </FormField>

      <FormField label="Expected Output" required error={error}>
        <Textarea
          value={expected}
          onChange={e => { setExpected(e.target.value); setError(''); }}
          rows={2}
          placeholder="e.g. 1 3"
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

type Tab = 'details' | 'starter' | 'tests';

export default function EditChallengePage() {
  const { challengeId }                      = useParams<{ challengeId: string }>();
  const { data: challenge, isLoading }       = useAdminChallenge(challengeId);
  const updateMutation                       = useUpdateChallenge(challengeId);
  const publishMutation                      = usePublishChallenge();
  const unpublishMutation                    = useUnpublishChallenge();
  const deleteTestCaseMutation               = useDeleteTestCase(challengeId);

  const [activeTab, setActiveTab]           = useState<Tab>('details');
  const [starterLang, setStarterLang]       = useState<ChallengeLanguage>('python');
  const [starterCode, setStarterCode]       = useState<StarterCode>({ python: '', java: '', javascript: '', c: '', cpp: '', go: '' });
  const [description, setDescription]      = useState('');
  const [initialized, setInitialized]      = useState(false);
  const [detailsSaved, setDetailsSaved]    = useState(false);
  const [starterSaved, setStarterSaved]    = useState(false);

  useEffect(() => {
    if (challenge && !initialized) {
      setDescription(challenge.description);
      setStarterCode(challenge.starterCode as StarterCode);
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
    if (res.success) { toast.success('Details saved'); setDetailsSaved(true); setTimeout(() => setDetailsSaved(false), 2000); }
    else toast.error(res.message ?? 'Failed to save');
  };

  const handleSaveStarterCode = async () => {
    const res = await updateMutation.mutateAsync({ starterCode });
    if (res.success) { toast.success('Starter code saved'); setStarterSaved(true); setTimeout(() => setStarterSaved(false), 2000); }
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

  const nextIndex = challenge.testCases?.length ?? 0;

  const tabItems: { id: Tab; label: string; badge?: string | number }[] = [
    { id: 'details', label: 'Problem' },
    { id: 'starter', label: 'Starter Code' },
    { id: 'tests',   label: 'Test Cases', badge: challenge.testCases?.length ?? 0 },
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
      <div className="flex gap-0 border-b border-[#E5E7EB] mb-6">
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

      {/* ── Details tab ─────────────────────────────────────────────────────── */}
      {activeTab === 'details' && (
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 flex flex-col gap-5">
          <FormField
            label="Description"
            hint="Describe the problem, constraints, and I/O format. Rich text, tables, links, and headings are supported. Images are disabled for now."
            required
          >
            <TiptapEditor
              content={description}
              onChange={(html) => setDescription(html)}
              placeholder="Write a Rwanda-themed challenge, like optimizing stops on a Kigali moto route, and use tables for examples if needed."
              className="bg-white"
            />
          </FormField>
          <div className="flex justify-end">
            <Button
              variant="primary"
              size="md"
              loading={updateMutation.isPending}
              onClick={() => {
                if (!hasDescriptionText(description)) {
                  toast.error('Description is required.');
                  return;
                }
                handleSaveDetails();
              }}
            >
              {detailsSaved
                ? <><CheckCircle2 size={14} className="mr-1.5" />Saved</>
                : <><Save size={14} className="mr-1.5" />Save Details</>}
            </Button>
          </div>
        </div>
      )}

      {/* ── Starter Code tab ────────────────────────────────────────────────── */}
      {activeTab === 'starter' && (
        <div className="flex flex-col gap-4">
          <p className="font-body text-sm text-[#6B7280]">
            Pre-fill each language with the starter code students will see when they open the challenge.
          </p>

          {/* Language pills */}
          <div className="flex gap-2 flex-wrap">
            {LANGUAGES.map(l => (
              <button
                key={l.value}
                onClick={() => setStarterLang(l.value)}
                className={cn(
                  'px-3 py-1.5 rounded-full font-mono text-xs font-medium transition-all',
                  starterLang === l.value
                    ? 'bg-[#3D006B] text-white'
                    : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]',
                )}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Editor */}
          <div className="rounded-xl overflow-hidden border border-[#E5E7EB]" style={{ height: 420 }}>
            <ChallengeEditor
              value={starterCode[starterLang]}
              language={starterLang}
              onValueChange={v => setStarterCode(prev => ({ ...prev, [starterLang]: v }))}
              readOnly={false}
            />
          </div>

          <div className="flex justify-end">
            <Button
              variant="primary"
              size="md"
              loading={updateMutation.isPending}
              onClick={handleSaveStarterCode}
            >
              {starterSaved
                ? <><CheckCircle2 size={14} className="mr-1.5" />Saved</>
                : <><Save size={14} className="mr-1.5" />Save Starter Code</>}
            </Button>
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
              onDelete={handleDeleteTestCase}
              deleting={deleteTestCaseMutation.isPending}
            />
          ))}

          <AddTestCaseForm challengeId={challengeId} nextIndex={nextIndex} />
        </div>
      )}
    </div>
  );
}

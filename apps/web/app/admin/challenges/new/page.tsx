'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useCreateChallenge, type Difficulty } from '@/hooks/queries/challenges';
import { Button, FormField, Input, TiptapEditor } from '@/components/ui';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string; desc: string; color: string }[] = [
  { value: 'easy',   label: 'Easy',   desc: 'Straightforward, single concept',  color: 'border-green-300 text-green-700 bg-green-50 data-[active=true]:ring-green-300' },
  { value: 'medium', label: 'Medium', desc: 'Requires some algorithmic thinking', color: 'border-amber-300 text-amber-700 bg-amber-50 data-[active=true]:ring-amber-300' },
  { value: 'hard',   label: 'Hard',   desc: 'Complex algorithms or data structures', color: 'border-red-300 text-red-700 bg-red-50 data-[active=true]:ring-red-300' },
];

export default function NewChallengePage() {
  const router         = useRouter();
  const createMutation = useCreateChallenge();

  const [title, setTitle]           = useState('');
  const [description, setDesc]      = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [timeLimit, setTimeLimit]   = useState(5);
  const [errors, setErrors]         = useState<{ title?: string; description?: string }>({});

  const hasDescriptionText = (html: string) => html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();

  const validate = () => {
    const e: typeof errors = {};
    if (!title.trim())       e.title       = 'Title is required.';
    if (!hasDescriptionText(description)) e.description = 'Description is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const res = await createMutation.mutateAsync({ title: title.trim(), description, difficulty, timeLimit });
    if (res.success && res.data) {
      toast.success('Challenge created — add starter code and test cases next.');
      router.push(`/admin/challenges/${(res.data as { id: string }).id}`);
    } else {
      toast.error(res.message ?? 'Failed to create challenge');
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/challenges"
          className="text-[#9CA3AF] hover:text-[#3D006B] transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="font-heading font-black text-2xl text-[#0F0F0F]">New Challenge</h1>
          <p className="font-body text-sm text-[#6B7280] mt-0.5">Fill in the basics — you'll add test cases next.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Title */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 flex flex-col gap-5">
          <FormField label="Title" required error={errors.title}>
            <Input
              value={title}
              onChange={e => { setTitle(e.target.value); setErrors(v => ({ ...v, title: undefined })); }}
              placeholder="e.g. Kigali Bus Fare Split"
              autoFocus
            />
          </FormField>

          <FormField
            label="Description"
            required
            hint="Describe the problem clearly. Rich text, tables, links, and headings are supported. Images are disabled for now."
            error={errors.description}
          >
            <TiptapEditor
              content={description}
              onChange={(html) => { setDesc(html); setErrors(v => ({ ...v, description: undefined })); }}
              placeholder="Write a Rwanda-themed challenge, like planning parcel deliveries across Kigali neighborhoods, and use tables for examples if needed."
              className="bg-white"
            />
          </FormField>
        </div>

        {/* Difficulty */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
          <FormField label="Difficulty" required>
            <div className="grid grid-cols-3 gap-3 mt-1">
              {DIFFICULTY_OPTIONS.map(o => (
                <button
                  key={o.value}
                  type="button"
                  data-active={difficulty === o.value}
                  onClick={() => setDifficulty(o.value)}
                  className={cn(
                    'flex flex-col items-start gap-1 p-3 rounded-xl border-2 text-left transition-all',
                    difficulty === o.value
                      ? `${o.color} ring-2 ring-offset-1`
                      : 'border-[#E5E7EB] text-[#6B7280] hover:border-[#D1D5DB]',
                  )}
                >
                  <span className="font-body text-sm font-medium">{o.label}</span>
                  <span className="font-body text-[11px] leading-snug opacity-80">{o.desc}</span>
                </button>
              ))}
            </div>
          </FormField>
        </div>

        {/* Time limit */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
          <FormField
            label="Time Limit"
            hint={`Maximum CPU time per test case. ${timeLimit}s is recommended for most problems.`}
          >
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={15}
                value={timeLimit}
                onChange={e => setTimeLimit(Number(e.target.value))}
                className="flex-1 accent-[#3D006B]"
              />
              <div className="font-mono text-sm font-medium text-[#3D006B] w-12 text-center bg-[#F3E8FF] rounded-lg py-1">
                {timeLimit}s
              </div>
            </div>
          </FormField>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-1">
          <Link href="/admin/challenges">
            <Button variant="ghost" size="md" type="button">Cancel</Button>
          </Link>
          <Button variant="primary" size="md" type="submit" loading={createMutation.isPending}>
            Create & Continue
          </Button>
        </div>
      </form>
    </div>
  );
}

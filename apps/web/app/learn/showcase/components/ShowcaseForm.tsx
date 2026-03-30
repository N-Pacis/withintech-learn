'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  Button,
  Input,
  Textarea,
  FormField,
  FileUpload,
  Stepper,
  type StepperStep,
} from '@/components/ui';
import {
  CHALLENGE_CATEGORIES,
  type ChallengeCategory,
} from '@/hooks/queries/showcase';
import {
  useCreateShowcaseProject,
  useUploadShowcaseThumbnail,
  useAddShowcaseImage,
} from '@/hooks/queries/showcase';
import { CategoryIcon } from '@/components/showcase/CategoryIcon';
import { cn } from '@/lib/utils';
import { TagInput } from './TagInput';

const AI_SUGGESTIONS = [
  'ChatGPT', 'Claude', 'Gemini', 'GitHub Copilot', 'Cursor', 'Midjourney',
  'Stable Diffusion', 'Whisper', 'LangChain', 'Hugging Face',
];

const FORM_STEPS: StepperStep[] = [
  { id: 'info',  label: 'Project Info' },
  { id: 'tech',  label: 'Tech & Media' },
];

interface FormState {
  title: string;
  description: string;
  problemStatement: string;
  categories: ChallengeCategory[];
  githubUrl: string;
  demoUrl: string;
  aiUsageDescription: string;
  techTags: string[];
  aiTools: string[];
}

const EMPTY_FORM: FormState = {
  title: '',
  description: '',
  problemStatement: '',
  categories: [],
  githubUrl: '',
  demoUrl: '',
  aiUsageDescription: '',
  techTags: [],
  aiTools: [],
};

export function ShowcaseForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);

  const { mutateAsync: create, isPending: creating } = useCreateShowcaseProject();
  const { mutateAsync: uploadThumb, isPending: uploadingThumb } = useUploadShowcaseThumbnail();
  const { mutateAsync: addImage } = useAddShowcaseImage();

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const toggleCategory = (c: ChallengeCategory) => {
    setForm((f) => {
      const has = f.categories.includes(c);
      if (has) return { ...f, categories: f.categories.filter((x) => x !== c) };
      if (f.categories.length >= 5) return f; // max 5
      return { ...f, categories: [...f.categories, c] };
    });
  };

  const validateStep0 = () => {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!form.title.trim())            errs.title = 'Title is required';
    if (!form.problemStatement.trim()) errs.problemStatement = 'Problem statement is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 0 && !validateStep0()) return;
    setStep((s) => Math.min(s + 1, FORM_STEPS.length - 1));
  };

  const handleSubmit = async () => {
    if (!validateStep0()) { setStep(0); return; }

    const created = await create({
      title:               form.title.trim(),
      description:         form.description.trim() || undefined,
      problemStatement:    form.problemStatement.trim(),
      categories:          form.categories,
      githubUrl:           form.githubUrl.trim() || undefined,
      demoUrl:             form.demoUrl.trim() || undefined,
      aiUsageDescription:  form.aiUsageDescription.trim() || undefined,
      techTags:            form.techTags,
      aiTools:             form.aiTools,
    });

    if (thumbnailFile) {
      try {
        await uploadThumb({ id: created.id, file: thumbnailFile });
      } catch {
        toast.warning('Project saved, but thumbnail upload failed.');
      }
    }

    let failedImages = 0;
    for (const file of galleryFiles) {
      try {
        await addImage({ id: created.id, file });
      } catch {
        failedImages++;
      }
    }

    if (failedImages > 0) {
      toast.warning(`${failedImages} image(s) failed to upload.`);
    }

    toast.success('Project submitted for review!');
    router.push('/learn/showcase');
  };

  const isSubmitting = creating || uploadingThumb;

  return (
    <div className="max-w-2xl mx-auto">
      <Stepper
        steps={FORM_STEPS}
        currentStep={step}
        onStepClick={(i) => { if (i < step) setStep(i); }}
        className="mb-8"
      />

      {/* ── Step 0: Project Info ─────────────────────────────── */}
      {step === 0 && (
        <div className="flex flex-col gap-5">
          <FormField label="Project Title" required error={errors.title}>
            <Input
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. AgriSense — Smart irrigation for small farms"
              error={errors.title}
            />
          </FormField>

          <FormField label="Description" hint="What does your project do? (optional)">
            <Textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Describe your project and what it does…"
              rows={3}
            />
          </FormField>

          <FormField
            label="Problem Statement"
            required
            hint="What real problem does this project solve?"
            error={errors.problemStatement}
          >
            <Textarea
              value={form.problemStatement}
              onChange={(e) => set('problemStatement', e.target.value)}
              placeholder="Describe the specific problem you're addressing and who it affects…"
              rows={4}
            />
          </FormField>

          <FormField
            label="Challenge Categories"
            hint="Select up to 5 categories (optional)"
          >
            <div className="flex flex-wrap gap-2 mt-1">
              {CHALLENGE_CATEGORIES.map((c) => {
                const selected = form.categories.includes(c as ChallengeCategory);
                const atMax = !selected && form.categories.length >= 5;
                return (
                  <button
                    key={c}
                    type="button"
                    disabled={atMax}
                    onClick={() => toggleCategory(c as ChallengeCategory)}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-body font-medium transition-colors',
                      selected
                        ? 'bg-[#3D006B] text-white border-[#3D006B]'
                        : atMax
                          ? 'border-[#E5E7EB] text-[#D1D5DB] cursor-not-allowed'
                          : 'border-[#E5E7EB] text-[#6B7280] hover:border-[#3D006B] hover:text-[#3D006B]',
                    )}
                  >
                    <CategoryIcon category={c as ChallengeCategory} size={12} />
                    {c}
                  </button>
                );
              })}
            </div>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="GitHub URL" hint="Optional">
              <Input
                value={form.githubUrl}
                onChange={(e) => set('githubUrl', e.target.value)}
                placeholder="https://github.com/…"
              />
            </FormField>
            <FormField label="Demo URL" hint="Optional">
              <Input
                value={form.demoUrl}
                onChange={(e) => set('demoUrl', e.target.value)}
                placeholder="https://…"
              />
            </FormField>
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={handleNext} size="md">
              Next: Tech & Media
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-1.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 1: Tech & Media ─────────────────────────────── */}
      {step === 1 && (
        <div className="flex flex-col gap-5">
          <FormField label="Technologies Used" hint="Press Enter or comma to add a tag">
            <TagInput
              value={form.techTags}
              onChange={(tags) => set('techTags', tags)}
              placeholder="e.g. React, Python, TensorFlow…"
            />
          </FormField>

          <FormField label="AI Tools Used" hint="Which AI tools helped you build this? (optional)">
            <TagInput
              value={form.aiTools}
              onChange={(tags) => set('aiTools', tags)}
              placeholder="e.g. ChatGPT, GitHub Copilot…"
              suggestions={AI_SUGGESTIONS}
            />
          </FormField>

          <FormField label="How AI Helped" hint="Describe how you used AI in this project (optional)">
            <Textarea
              value={form.aiUsageDescription}
              onChange={(e) => set('aiUsageDescription', e.target.value)}
              placeholder="e.g. Used Claude to help write the data processing pipeline and debug edge cases…"
              rows={3}
            />
          </FormField>

          <FormField label="Thumbnail" hint="Main image for your project card (optional)">
            <FileUpload
              accept={['image/jpeg', 'image/png', 'image/webp']}
              maxSizeMb={5}
              onFileSelect={(file) => setThumbnailFile(file)}
              uploading={uploadingThumb}
            />
          </FormField>

          <FormField label="Gallery Images" hint="Add up to 10 images (optional)">
            <GalleryFileInput
              files={galleryFiles}
              onChange={setGalleryFiles}
              max={10}
            />
          </FormField>

          <div className="flex items-center justify-between pt-2">
            <Button variant="secondary" onClick={() => setStep(0)} size="md">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back
            </Button>
            <Button onClick={handleSubmit} loading={isSubmitting} size="md">
              Submit Project
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Simple multi-file picker ──────────────────────────────────────────────────

function GalleryFileInput({ files, onChange, max }: { files: File[]; onChange: (f: File[]) => void; max: number }) {
  const addFiles = (selected: FileList | null) => {
    if (!selected) return;
    const next = [...files, ...Array.from(selected)].slice(0, max);
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-2">
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((f, i) => (
            <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-[#E5E7EB] bg-[#F9FAFB] group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={URL.createObjectURL(f)} alt={f.name} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => onChange(files.filter((_, j) => j !== i))}
                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {files.length < max && (
        <label className="flex items-center gap-2 w-fit cursor-pointer border border-dashed border-[#D1D5DB] rounded-lg px-4 py-2.5 text-sm font-body text-[#6B7280] hover:border-[#3D006B] hover:text-[#3D006B] transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Add images ({files.length}/{max})
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="sr-only"
            onChange={(e) => addFiles(e.target.files)}
          />
        </label>
      )}
    </div>
  );
}

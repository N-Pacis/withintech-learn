'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCreateCourse, useUploadThumbnail } from '@/hooks/queries/courses';
import { Button, FormField, Input, Textarea, Card, CardHeader, CardBody, CardFooter, FileUpload } from '@/components/ui';

function toSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

type Step = 'idle' | 'creating' | 'uploading' | 'done';

export default function NewCoursePage() {
  const router = useRouter();
  const { mutateAsync: createCourse } = useCreateCourse();
  const { mutateAsync: uploadThumbnail } = useUploadThumbnail();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [step, setStep] = useState<Step>('idle');
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => { titleRef.current?.focus(); }, []);

  const slug = toSlug(title);
  const isPending = step === 'creating' || step === 'uploading';

  const stepLabel: Record<Step, string> = {
    idle:      'Create Course',
    creating:  'Creating…',
    uploading: 'Uploading thumbnail…',
    done:      'Done',
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title is required.');
      titleRef.current?.focus();
      return;
    }

    try {
      setStep('creating');
      const course = await createCourse({
        title: title.trim(),
        description: description.trim() || undefined,
      });

      if (thumbnailFile) {
        setStep('uploading');
        try {
          await uploadThumbnail({ id: course.id, file: thumbnailFile });
        } catch {
          // Thumbnail failure is non-fatal — continue to course detail
        }
      }

      setStep('done');
      router.push(`/admin/courses/${course.id}/modules/new`);
    } catch (err) {
      setStep('idle');
      setError(err instanceof Error ? err.message : 'Failed to create course.');
    }
  }

  return (
    <div className="p-8 lg:p-12 max-w-2xl">

      <Link
        href="/admin/courses"
        className="inline-flex items-center gap-2 font-body text-sm text-[#6B7280] hover:text-[#3D006B] transition-colors mb-8"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
        </svg>
        Back to courses
      </Link>

      <div className="mb-8">
        <h1 className="font-heading font-black text-3xl text-[#0F0F0F]">Create a course</h1>
        <p className="font-body text-sm text-[#6B7280] mt-1">
          Fill in the basics. You can add modules after.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        {/* Details */}
        <Card shadow="sm">
          <CardHeader>
            <h2 className="font-heading font-bold text-base text-[#0F0F0F]">Course details</h2>
          </CardHeader>
          <CardBody className="flex flex-col gap-6">

            <FormField label="Title" htmlFor="title" required hint="The public name of your course.">
              <Input
                id="title"
                ref={titleRef}
                placeholder="e.g. Digital Literacy Fundamentals"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={120}
              />
            </FormField>

            {title && (
              <div className="flex items-center gap-2 -mt-3 px-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                <span className="font-body text-xs text-[#9CA3AF]">
                  Slug: <span className="text-[#6B7280] font-medium">{slug}</span>
                </span>
              </div>
            )}

            <FormField label="Description" htmlFor="description" hint="A short summary shown to students.">
              <Textarea
                id="description"
                placeholder="What will students learn in this course?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                maxLength={1000}
              />
              {description && (
                <p className="font-body text-xs text-[#9CA3AF] text-right mt-1">{description.length} / 1000</p>
              )}
            </FormField>

          </CardBody>
        </Card>

        {/* Thumbnail */}
        <Card shadow="sm">
          <CardHeader>
            <div>
              <h2 className="font-heading font-bold text-base text-[#0F0F0F]">Thumbnail</h2>
              <p className="font-body text-xs text-[#9CA3AF] mt-0.5">Optional. You can add or change this later.</p>
            </div>
          </CardHeader>
          <CardBody>
            <FileUpload
              accept={['image/jpeg', 'image/png', 'image/webp']}
              maxSizeMb={5}
              onFileSelect={setThumbnailFile}
              uploading={step === 'uploading'}
            />
            {thumbnailFile && (
              <p className="font-body text-xs text-[#6B7280] mt-2 flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {thumbnailFile.name} · {(thumbnailFile.size / 1024 / 1024).toFixed(1)} MB
              </p>
            )}
          </CardBody>
        </Card>

        {error && (
          <p className="font-body text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-lg">{error}</p>
        )}

        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" size="md" type="button" asChild>
            <Link href="/admin/courses">Cancel</Link>
          </Button>
          <Button type="submit" size="md" loading={isPending} disabled={!title.trim() || isPending}>
            {stepLabel[step]}
          </Button>
        </div>

      </form>
    </div>
  );
}

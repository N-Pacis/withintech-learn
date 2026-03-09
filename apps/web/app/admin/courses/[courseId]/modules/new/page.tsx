'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useModules, useAddModule } from '@/hooks/queries/modules';
import { Button, FormField, Input, Card, CardHeader, CardBody, CardFooter, PageLoader } from '@/components/ui';

export default function NewModulePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();

  const { data: modules, isLoading: modulesLoading } = useModules(courseId);
  const { mutateAsync: addModule, isPending } = useAddModule(courseId);

  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!modulesLoading) titleRef.current?.focus();
  }, [modulesLoading]);

  // Auto-assign next position
  const nextOrder = (modules?.length ?? 0) + 1;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title is required.');
      titleRef.current?.focus();
      return;
    }

    try {
      const module = await addModule({ title: title.trim(), orderIndex: nextOrder });
      router.push(`/admin/courses/${courseId}/modules/${module.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create module.');
    }
  }

  return (
    <div className="p-8 lg:p-12 max-w-2xl">

      {/* Back */}
      <Link
        href={`/admin/courses/${courseId}`}
        className="inline-flex items-center gap-2 font-body text-sm text-[#6B7280] hover:text-[#3D006B] transition-colors mb-8"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
        </svg>
        Back to course
      </Link>

      <div className="mb-8">
        <h1 className="font-heading font-black text-3xl text-[#0F0F0F]">Add a module</h1>
        <p className="font-body text-sm text-[#6B7280] mt-1">
          Modules are the individual lessons inside a course.
        </p>
      </div>

      {modulesLoading ? (
        <PageLoader type="form" />
      ) : (
        <form onSubmit={handleSubmit}>
          <Card shadow="sm">
            <CardHeader>
              <h2 className="font-heading font-bold text-base text-[#0F0F0F]">Module details</h2>
            </CardHeader>

            <CardBody className="flex flex-col gap-6">
              <FormField
                label="Title"
                htmlFor="title"
                required
                hint="Give this module a clear, descriptive name."
              >
                <Input
                  id="title"
                  ref={titleRef}
                  placeholder="e.g. Introduction to the Internet"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={120}
                />
              </FormField>

              {/* Position indicator */}
              <div className="flex items-center gap-3 px-4 py-3 bg-[#F3E8FF]/50 rounded-lg border border-[#E5E7EB]">
                <div className="w-7 h-7 rounded-full bg-[#3D006B] flex items-center justify-center shrink-0">
                  <span className="font-heading font-bold text-xs text-white">{nextOrder}</span>
                </div>
                <p className="font-body text-sm text-[#6B7280]">
                  This will be <span className="text-[#0F0F0F] font-medium">module {nextOrder}</span>
                  {modules && modules.length > 0
                    ? `, after "${modules[modules.length - 1].title}"`
                    : ' — the first module in this course'}
                  .
                </p>
              </div>

              {error && (
                <p className="font-body text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-lg">
                  {error}
                </p>
              )}
            </CardBody>

            <CardFooter className="flex items-center justify-end gap-3">
              <Button variant="ghost" size="md" type="button" asChild>
                <Link href={`/admin/courses/${courseId}`}>Cancel</Link>
              </Button>
              <Button type="submit" size="md" loading={isPending} disabled={!title.trim()}>
                Add Module
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}
    </div>
  );
}

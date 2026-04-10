'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useLesson, useUpdateLesson } from '@/hooks/queries/modules';
import { useCourse } from '@/hooks/queries/courses';
import { Button, Card, CardHeader, PageLoader, Input, Tabs, type Tab } from '@/components/ui';
import { LessonBlocksEditor } from '@/components/admin/LessonBlocksEditor';
import { QuizBuilder } from '@/components/admin/QuizBuilder';

type TabValue = 'content' | 'quiz';

const TABS: Tab<TabValue>[] = [
  { label: 'Content', value: 'content' },
  { label: 'Quiz', value: 'quiz' },
];

export default function LessonDetailPage() {
  const { courseId, moduleId, lessonId } = useParams<{
    courseId: string;
    moduleId: string;
    lessonId: string;
  }>();
  const { data: lesson, isLoading, error: loadError } = useLesson(lessonId);
  const { data: course } = useCourse(courseId);
  const { mutateAsync: updateLesson, isPending: savingTitle } = useUpdateLesson(moduleId);
  const isDraft = !course || course.status === 'draft';

  const [activeTab, setActiveTab] = useState<TabValue>('content');
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const [titleError, setTitleError] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingTitle) titleInputRef.current?.focus();
  }, [editingTitle]);

  async function handleSaveTitle() {
    if (!titleValue.trim()) {
      setTitleError('Title cannot be empty.');
      return;
    }
    try {
      await updateLesson({ id: lessonId, title: titleValue.trim() });
      setEditingTitle(false);
      setTitleError('');
    } catch (err) {
      setTitleError(err instanceof Error ? err.message : 'Failed to save.');
    }
  }

  if (isLoading) return <PageLoader type="detail" className="p-8 lg:p-12" />;
  if (loadError || !lesson) {
    return (
      <div className="p-8">
        <p className="font-body text-sm text-red-500">Lesson not found.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 lg:p-12 max-w-3xl">
      {/* Back */}
      <Link
        href={`/admin/courses/${courseId}/modules/${moduleId}`}
        className="inline-flex items-center gap-2 font-body text-sm text-[#6B7280] hover:text-[#3D006B] transition-colors mb-8"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5" />
          <path d="M12 19l-7-7 7-7" />
        </svg>
        Back to module
      </Link>

      {/* Lesson header card */}
      <Card shadow="sm" className="mb-6">
        <CardHeader>
          <span className="font-body text-xs text-[#9CA3AF] uppercase tracking-wide block mb-1">
            Lesson {lesson.orderIndex}
          </span>

          {editingTitle ? (
            <div className="flex flex-col gap-2 mt-1">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <Input
                  ref={titleInputRef}
                  value={titleValue}
                  onChange={(e) => {
                    setTitleValue(e.target.value);
                    setTitleError('');
                  }}
                  maxLength={120}
                  className="w-full"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTitle();
                    if (e.key === 'Escape') {
                      setEditingTitle(false);
                      setTitleValue(lesson.title);
                    }
                  }}
                />
                <div className="flex items-center gap-2 shrink-0">
                  <Button size="sm" loading={savingTitle} onClick={handleSaveTitle}>
                    Save
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingTitle(false);
                      setTitleValue(lesson.title);
                      setTitleError('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
              {titleError && (
                <p className="font-body text-xs text-red-500">{titleError}</p>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 group mt-1">
              <h1 className="font-heading font-black text-2xl text-[#0F0F0F] leading-tight flex-1">
                {lesson.title}
              </h1>
              {isDraft && (
                <button
                  onClick={() => {
                    setEditingTitle(true);
                    setTitleValue(lesson.title);
                    setTitleError('');
                  }}
                  className="sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-[#F3E8FF] text-[#6B7280] hover:text-[#3D006B] shrink-0"
                  title="Rename lesson"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs tabs={TABS} value={activeTab} onChange={setActiveTab} className="mb-6" />

      {/* Tab content */}
      {activeTab === 'content' && (
        <LessonBlocksEditor lessonId={lessonId} isDraft={isDraft} />
      )}
      {activeTab === 'quiz' &&
        (isDraft ? (
          <QuizBuilder lessonId={lessonId} />
        ) : (
          <QuizBuilder lessonId={lessonId} readOnly />
        ))}
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronRight,
  Pencil,
  Check,
  X,
  BookOpen,
} from "lucide-react";
import {
  useLessons,
  useAddLesson,
  useUpdateLesson,
  useDeleteLesson,
} from "@/hooks/queries/modules";
import { Button, Card, CardBody, Input } from "@/components/ui";
import Link from "next/link";

interface LessonEditorProps {
  moduleId: string;
  courseId: string;
  isDraft: boolean;
}

export function LessonEditor({
  moduleId,
  courseId,
  isDraft,
}: LessonEditorProps) {
  const { data: lessons = [], isLoading } = useLessons(moduleId);
  const { mutate: addLesson, isPending: adding } = useAddLesson(moduleId);
  const { mutate: updateLesson, isPending: updating } =
    useUpdateLesson(moduleId);
  const { mutate: deleteLesson } = useDeleteLesson(moduleId);

  const [newTitle, setNewTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId) editInputRef.current?.focus();
  }, [editingId]);

  function handleAdd() {
    if (!newTitle.trim()) return;
    addLesson(
      { title: newTitle.trim(), orderIndex: lessons.length + 1 },
      { onSuccess: () => setNewTitle("") },
    );
  }

  function handleSaveEdit(id: string) {
    if (!editTitle.trim()) return;
    updateLesson(
      { id, title: editTitle.trim() },
      { onSuccess: () => setEditingId(null) },
    );
  }

  function handleDelete(id: string) {
    deleteLesson(id, { onSuccess: () => setConfirmDeleteId(null) });
  }

  if (isLoading) {
    return (
      <Card>
        <CardBody className="py-12 text-center">
          <p className="font-body text-sm text-muted-contrast">
            Loading lessons...
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Add lesson form */}
      {isDraft && (
        <Card>
          <CardBody className="flex items-center gap-3">
            <Input
              placeholder="New lesson title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className="flex-1"
            />
            <Button
              size="sm"
              onClick={handleAdd}
              loading={adding}
              disabled={!newTitle.trim()}
              className="flex items-center gap-1.5 shrink-0"
            >
              <Plus size={14} /> Add
            </Button>
          </CardBody>
        </Card>
      )}

      {/* Empty state */}
      {lessons.length === 0 && (
        <Card>
          <CardBody className="py-12 text-center">
            <BookOpen size={32} className="mx-auto mb-3 text-border-strong" />
            <p className="font-body text-sm text-muted-contrast">
              No lessons yet. Add your first lesson above.
            </p>
          </CardBody>
        </Card>
      )}

      {/* Lesson list */}
      {lessons.map((lesson, i) => (
        <Card key={lesson.id} shadow="sm">
          <CardBody className="flex items-center gap-3 py-3">
            {/* Grip handle (decorative) */}
            <GripVertical size={16} className="text-border-strong shrink-0" />

            {/* Order badge */}
            <span className="w-6 h-6 rounded-full bg-primary-soft text-primary text-xs font-bold flex items-center justify-center shrink-0">
              {i + 1}
            </span>

            {/* Title or edit input */}
            {editingId === lesson.id ? (
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Input
                  ref={editInputRef}
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveEdit(lesson.id);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  className="flex-1"
                  maxLength={120}
                />
                <button
                  onClick={() => handleSaveEdit(lesson.id)}
                  disabled={updating}
                  className="p-1.5 rounded-lg hover:bg-green-50 text-green-600"
                  title="Save"
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="p-1.5 rounded-lg hover:bg-surface-muted text-muted"
                  title="Cancel"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <span className="font-body text-sm text-foreground-soft truncate flex-1 min-w-0">
                {lesson.title}
              </span>
            )}

            {/* Quiz badge */}
            {lesson.hasQuiz && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 shrink-0">
                Quiz
              </span>
            )}

            {/* Actions */}
            {editingId !== lesson.id && isDraft && (
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => {
                    setEditingId(lesson.id);
                    setEditTitle(lesson.title);
                  }}
                  className="p-1.5 rounded-lg hover:bg-primary-soft text-muted hover:text-primary transition-colors"
                  title="Rename"
                >
                  <Pencil size={13} />
                </button>
                {confirmDeleteId === lesson.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDelete(lesson.id)}
                      className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      title="Confirm delete"
                    >
                      <Check size={13} />
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="p-1.5 rounded-lg hover:bg-surface-muted text-muted transition-colors"
                      title="Cancel"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(lesson.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-muted hover:text-red-600 transition-colors"
                    title="Delete lesson"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            )}

            {/* Navigate to lesson detail */}
            <Link
              href={`/admin/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}`}
              className="p-1.5 rounded-lg hover:bg-primary-soft text-muted hover:text-primary transition-colors shrink-0"
              title="Edit lesson content"
            >
              <ChevronRight size={16} />
            </Link>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  useCourse,
  useUpdateCourse,
  useArchiveCourse,
  useUploadThumbnail,
} from "@/hooks/queries/courses";
import {
  Button,
  Badge,
  PageLoader,
  Card,
  CardHeader,
  CardBody,
  FormField,
  Input,
  Textarea,
  FileUpload,
} from "@/components/ui";

export default function EditCoursePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { data: course, isLoading } = useCourse(courseId);
  const { mutateAsync: updateCourse, isPending: saving } =
    useUpdateCourse(courseId);
  const { mutate: archive, isPending: archiving } = useArchiveCourse();
  const { mutateAsync: uploadThumbnail, isPending: uploadingThumb } =
    useUploadThumbnail();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [publishError, setPublishError] = useState("");
  const [saved, setSaved] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);

  const [prevCourse, setPrevCourse] = useState(course);
  if (course && course !== prevCourse) {
    setPrevCourse(course);
    setTitle(course.title);
    setDescription(course.description ?? "");
  }

  function handleFieldChange(field: "title" | "description", value: string) {
    if (field === "title") setTitle(value);
    else setDescription(value);
    setDirty(true);
    setSaveError("");
  }

  async function handleSave() {
    if (!title.trim()) {
      setSaveError("Title cannot be empty.");
      return;
    }
    setSaveError("");
    setSaved(false);
    try {
      await updateCourse({
        title: title.trim(),
        description: description.trim() || undefined,
      });
      setDirty(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save.");
    }
  }

  async function handleThumbnailSelect(file: File) {
    try {
      await uploadThumbnail({ id: courseId, file });
    } catch {
      /* non-fatal */
    }
  }

  if (isLoading) return <PageLoader type="detail" className="p-8 lg:p-12" />;
  if (!course) {
    return (
      <div className="p-8">
        <p className="font-body text-sm text-red-500">Course not found.</p>
      </div>
    );
  }

  const isDraft = course.status === "draft";
  const isPublished = course.status === "published";
  const isArchived = course.status === "archived";

  // Non-draft courses show a read-only locked view
  if (!isDraft) {
    return (
      <div className="p-8 lg:p-12 max-w-2xl">
        <Link
          href={`/admin/courses/${courseId}`}
          className="inline-flex items-center gap-2 font-body text-sm text-muted hover:text-primary transition-colors mb-8"
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
          Back to course
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <h1 className="font-heading font-black text-3xl text-foreground leading-tight flex-1 min-w-0 truncate">
            {course.title}
          </h1>
          <Badge
            variant={isArchived ? "warning" : "success"}
            size="md"
            className="shrink-0"
          >
            {isArchived ? "Archived" : "Published"}
          </Badge>
        </div>

        <Card shadow="sm">
          <CardBody className="flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#FEF3C7] flex items-center justify-center shrink-0">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#92400E"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div>
                <p className="font-heading font-bold text-sm text-foreground mb-0.5">
                  {isArchived
                    ? "This course is archived"
                    : "This course is published"}
                </p>
                <p className="font-body text-xs text-muted">
                  {isArchived
                    ? "Archived courses cannot be edited or restored. This is a permanent state."
                    : "Published courses cannot be edited. Archive the course to retire it."}
                </p>
              </div>
            </div>

            {isPublished && (
              <div className="border-t border-border-subtle pt-4">
                {publishError && (
                  <p className="font-body text-xs text-red-500 mb-3">
                    {publishError}
                  </p>
                )}
                {confirmArchive ? (
                  <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-lg">
                    <p className="font-body text-sm text-red-700 flex-1">
                      Archive this course? This cannot be undone.
                    </p>
                    <Button
                      variant="danger"
                      size="sm"
                      loading={archiving}
                      onClick={() => {
                        archive(courseId, {
                          onError: (err) =>
                            setPublishError(
                              err instanceof Error ? err.message : "Failed.",
                            ),
                        });
                        setConfirmArchive(false);
                      }}
                    >
                      Archive
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmArchive(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setConfirmArchive(true)}
                  >
                    Archive Course
                  </Button>
                )}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-12 max-w-2xl">
      <Link
        href={`/admin/courses/${courseId}`}
        className="inline-flex items-center gap-2 font-body text-sm text-muted hover:text-primary transition-colors mb-8"
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
        Back to course
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <h1 className="font-heading font-black text-3xl text-foreground leading-tight flex-1 min-w-0 truncate">
          Edit Course
        </h1>
        <Badge variant="gray" size="md" className="shrink-0">
          Draft
        </Badge>
      </div>

      <div className="flex flex-col gap-5">
        {/* Details */}
        <Card shadow="sm">
          <CardHeader>
            <h2 className="font-heading font-bold text-base text-foreground">
              Details
            </h2>
          </CardHeader>
          <CardBody className="flex flex-col gap-5">
            <FormField label="Title" htmlFor="edit-title" required>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => handleFieldChange("title", e.target.value)}
                maxLength={120}
              />
            </FormField>
            <FormField label="Description" htmlFor="edit-desc">
              <Textarea
                id="edit-desc"
                value={description}
                onChange={(e) =>
                  handleFieldChange("description", e.target.value)
                }
                rows={3}
                maxLength={1000}
                placeholder="A short description of the course."
              />
              {description && (
                <p className="font-body text-xs text-muted-contrast text-right mt-1">
                  {description.length} / 1000
                </p>
              )}
            </FormField>
            {saveError && (
              <p className="font-body text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-lg">
                {saveError}
              </p>
            )}
            <div className="flex items-center gap-3 pt-1">
              <Button loading={saving} onClick={handleSave} disabled={!dirty}>
                Save Changes
              </Button>
              {saved && !dirty && (
                <span className="font-body text-sm text-green-600 flex items-center gap-1.5">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Saved
                </span>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Thumbnail */}
        <Card shadow="sm">
          <CardHeader>
            <div>
              <h2 className="font-heading font-bold text-base text-foreground">
                Thumbnail
              </h2>
              <p className="font-body text-xs text-muted-contrast mt-0.5">
                {uploadingThumb ? "Uploading…" : "Click or drag to replace."}
              </p>
            </div>
          </CardHeader>
          <CardBody>
            <FileUpload
              accept={["image/jpeg", "image/png", "image/webp"]}
              maxSizeMb={5}
              currentUrl={course.thumbnailUrl}
              onFileSelect={handleThumbnailSelect}
              uploading={uploadingThumb}
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

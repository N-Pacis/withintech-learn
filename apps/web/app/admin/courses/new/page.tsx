"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  useCreateCourse,
  useUploadThumbnail,
  type CourseAccessType,
} from "@/hooks/queries/courses";
import {
  Button,
  FormField,
  Input,
  Textarea,
  Card,
  CardHeader,
  CardBody,
  FileUpload,
} from "@/components/ui";
import { cn } from "@/lib/utils";

type Step = "idle" | "creating" | "uploading" | "done";

const ACCESS_OPTIONS: { value: CourseAccessType; label: string; description: string }[] = [
  { value: "FREE", label: "Free", description: "Anyone can enroll at no cost" },
  { value: "PAID_COURSE", label: "Paid Course", description: "Students pay to access content" },
  { value: "PAID_CERTIFICATE", label: "Paid Certificate", description: "Content is free; certificate requires payment" },
];

export default function NewCoursePage() {
  const router = useRouter();
  const { mutateAsync: createCourse } = useCreateCourse();
  const { mutateAsync: uploadThumbnail } = useUploadThumbnail();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [accessType, setAccessType] = useState<CourseAccessType>("FREE");
  const [price, setPrice] = useState("");
  const [certificatePrice, setCertificatePrice] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [step, setStep] = useState<Step>("idle");
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const isPending = step === "creating" || step === "uploading";

  const stepLabel: Record<Step, string> = {
    idle: "Create Course",
    creating: "Creating…",
    uploading: "Uploading thumbnail…",
    done: "Done",
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required.");
      titleRef.current?.focus();
      return;
    }

    if (accessType === "PAID_COURSE" && (!price || Number(price) < 100)) {
      setError("Course price must be at least RWF 100.");
      return;
    }
    if (accessType === "PAID_CERTIFICATE" && (!certificatePrice || Number(certificatePrice) < 100)) {
      setError("Certificate price must be at least RWF 100.");
      return;
    }

    try {
      setStep("creating");
      const course = await createCourse({
        title: title.trim(),
        description: description.trim() || undefined,
        accessType,
        price: accessType === "PAID_COURSE" ? Number(price) : undefined,
        certificatePrice: accessType === "PAID_CERTIFICATE" ? Number(certificatePrice) : undefined,
      });

      if (thumbnailFile) {
        setStep("uploading");
        try {
          await uploadThumbnail({ id: course.id, file: thumbnailFile });
        } catch {
          // Thumbnail failure is non-fatal
        }
      }

      setStep("done");
      router.push(`/admin/courses/${course.id}/modules/new`);
    } catch (err) {
      setStep("idle");
      setError(err instanceof Error ? err.message : "Failed to create course.");
    }
  }

  return (
    <div className="p-8 lg:p-12 max-w-2xl">
      <Link
        href="/admin/courses"
        className="inline-flex items-center gap-2 font-body text-sm text-muted hover:text-primary transition-colors mb-8"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5" />
          <path d="M12 19l-7-7 7-7" />
        </svg>
        Back to courses
      </Link>

      <div className="mb-8">
        <h1 className="font-heading font-black text-3xl text-foreground">Create a course</h1>
        <p className="font-body text-sm text-muted mt-1">Fill in the basics. You can add modules after.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Details */}
        <Card shadow="sm">
          <CardHeader>
            <h2 className="font-heading font-bold text-base text-foreground">Course details</h2>
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
                <p className="font-body text-xs text-muted-contrast text-right mt-1">{description.length} / 1000</p>
              )}
            </FormField>
          </CardBody>
        </Card>

        {/* Pricing */}
        <Card shadow="sm">
          <CardHeader>
            <div>
              <h2 className="font-heading font-bold text-base text-foreground">Pricing</h2>
              <p className="font-body text-xs text-muted-contrast mt-0.5">All payments are processed in RWF via XentriPay.</p>
            </div>
          </CardHeader>
          <CardBody className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-3">
              {ACCESS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setAccessType(opt.value)}
                  className={cn(
                    "text-left p-4 rounded-xl border-2 transition-all",
                    accessType === opt.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0",
                      accessType === opt.value ? "border-primary" : "border-border"
                    )}>
                      {accessType === opt.value && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                    <div>
                      <p className="font-body font-semibold text-sm text-foreground">{opt.label}</p>
                      <p className="font-body text-xs text-muted">{opt.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {accessType === "PAID_COURSE" && (
              <FormField label="Course Price (RWF)" htmlFor="price" required hint="Amount students pay to access all course content.">
                <Input
                  id="price"
                  type="number"
                  min="100"
                  step="1"
                  placeholder="e.g. 5000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </FormField>
            )}

            {accessType === "PAID_CERTIFICATE" && (
              <FormField label="Certificate Price (RWF)" htmlFor="certPrice" required hint="Amount students pay to receive their certificate after completing the course.">
                <Input
                  id="certPrice"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="e.g. 2000"
                  value={certificatePrice}
                  onChange={(e) => setCertificatePrice(e.target.value)}
                />
              </FormField>
            )}
          </CardBody>
        </Card>

        {/* Thumbnail */}
        <Card shadow="sm">
          <CardHeader>
            <div>
              <h2 className="font-heading font-bold text-base text-foreground">Thumbnail</h2>
              <p className="font-body text-xs text-muted-contrast mt-0.5">Optional. You can add or change this later.</p>
            </div>
          </CardHeader>
          <CardBody>
            <FileUpload
              accept={["image/jpeg", "image/png", "image/webp"]}
              maxSizeMb={5}
              onFileSelect={setThumbnailFile}
              uploading={step === "uploading"}
            />
            {thumbnailFile && (
              <p className="font-body text-xs text-muted mt-2 flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {thumbnailFile.name} · {(thumbnailFile.size / 1024 / 1024).toFixed(1)} MB
              </p>
            )}
          </CardBody>
        </Card>

        {error && (
          <p className="font-body text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-4 py-2.5 rounded-lg">{error}</p>
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

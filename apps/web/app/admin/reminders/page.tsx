"use client";

import { useState, useRef } from "react";
import {
  Upload,
  Send,
  CheckCircle2,
  XCircle,
  SkipForward,
  Bell,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui";
import {
  useSendReminders,
  SendRemindersResult,
  ReminderRow,
} from "@/hooks/queries/reminders";
import { cn } from "@/lib/utils";

export default function RemindersPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [result, setResult] = useState<SendRemindersResult | null>(null);
  const { mutate: sendReminders, isPending } = useSendReminders();

  const noPlaceholders =
    body.trim().length > 0 &&
    !body.includes("[First Name]") &&
    !body.includes("[Last Name]") &&
    !body.includes("[Email]");

  function handleFile(file: File) {
    const allowed = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];
    if (
      !allowed.includes(file.type) &&
      !file.name.match(/\.(xlsx|xls|csv)$/i)
    ) {
      toast.error("Only .xlsx, .xls, or .csv files are allowed");
      return;
    }
    setSelectedFile(file);
    setResult(null);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function handleSend() {
    if (!selectedFile || !subject.trim() || !body.trim()) return;
    sendReminders(
      { subject, body, file: selectedFile },
      {
        onSuccess: (data) => {
          setResult(data);
          if (data.sent > 0)
            toast.success(
              `${data.sent} reminder${data.sent !== 1 ? "s" : ""} sent successfully`,
            );
          if (data.failed > 0)
            toast.error(
              `${data.failed} reminder${data.failed !== 1 ? "s" : ""} failed to send`,
            );
        },
        onError: (err: Error) => toast.error(err.message),
      },
    );
  }

  const statusIcon = (s: ReminderRow["status"]) => {
    if (s === "sent")
      return <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />;
    if (s === "skipped")
      return <SkipForward size={14} className="text-amber-500 shrink-0" />;
    return <XCircle size={14} className="text-red-500 shrink-0" />;
  };

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center">
          <Bell size={20} className="text-primary" />
        </div>
        <div>
          <h1 className="font-heading font-bold text-xl text-foreground">
            Send Reminders
          </h1>
          <p className="font-body text-sm text-muted">
            Send custom reminder emails to existing students
          </p>
        </div>
      </div>

      <div className="bg-surface-card rounded-2xl border border-border p-6">
        {/* Instructions */}
        <div className="bg-surface-panel border border-border rounded-xl px-4 py-3 mb-6">
          <p className="font-body text-xs font-semibold text-foreground-soft uppercase tracking-wide mb-1.5">
            File format
          </p>
          <p className="font-body text-xs text-muted leading-relaxed">
            Upload an <strong className="text-foreground">.xlsx</strong>,{" "}
            <strong className="text-foreground">.xls</strong>, or{" "}
            <strong className="text-foreground">.csv</strong> file.
            <br />
            The first
            row must be column headers.
            <br />
            Required columns:{" "}
            <strong className="text-foreground">First Name</strong>,{" "}
            <strong className="text-foreground">Last Name</strong>,{" "}
            <strong className="text-foreground">Email</strong>. Max 500 rows per
            upload.
          </p>
        </div>

        {!result && (
          <>
            {/* Subject field */}
            <div className="mb-4">
              <label className="font-body text-sm font-medium text-foreground-soft mb-1.5 block">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Important update from WithinTech Learn"
                disabled={isPending}
                className={cn(
                  "w-full rounded-xl border border-border bg-surface-panel px-3.5 py-2.5 font-body text-sm text-foreground placeholder:text-muted-soft",
                  "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-colors",
                  isPending && "opacity-60 cursor-not-allowed",
                )}
              />
            </div>

            {/* Body field */}
            <div className="mb-4">
              <label className="font-body text-sm font-medium text-foreground-soft mb-1.5 block">
                Message Body
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={6}
                placeholder="Write your message here..."
                disabled={isPending}
                className={cn(
                  "w-full rounded-xl border border-border bg-surface-panel px-3.5 py-2.5 font-body text-sm text-foreground placeholder:text-muted-soft resize-y",
                  "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-colors",
                  isPending && "opacity-60 cursor-not-allowed",
                )}
              />
              <p className="font-body text-xs text-muted-soft mt-1.5">
                Available placeholders:{" "}
                <code className="bg-surface-panel px-1 py-0.5 rounded text-foreground-soft">[First Name]</code>{" "}
                <code className="bg-surface-panel px-1 py-0.5 rounded text-foreground-soft">[Last Name]</code>{" "}
                <code className="bg-surface-panel px-1 py-0.5 rounded text-foreground-soft">[Email]</code>
              </p>
              {noPlaceholders && (
                <p className="font-body text-xs text-amber-600 dark:text-amber-400 mt-1.5">
                  No placeholders detected — the same message will be sent to everyone.
                </p>
              )}
            </div>

            {/* Upload area */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              disabled={isPending}
              className={cn(
                "w-full rounded-xl border-2 border-dashed transition-colors px-4 py-10 flex flex-col items-center gap-3 text-center",
                dragOver
                  ? "border-primary bg-primary-soft"
                  : "border-border hover:border-primary/40 hover:bg-surface-panel",
                isPending && "opacity-60 cursor-not-allowed",
              )}
            >
              <div className="w-12 h-12 rounded-full bg-primary-soft flex items-center justify-center">
                <Upload size={22} className="text-primary" />
              </div>
              {selectedFile ? (
                <>
                  <p className="font-body text-sm font-medium text-foreground">
                    {selectedFile.name}
                  </p>
                  <p className="font-body text-xs text-muted-soft">
                    {(selectedFile.size / 1024).toFixed(1)} KB · Click to
                    change
                  </p>
                </>
              ) : (
                <>
                  <p className="font-body text-sm font-medium text-primary">
                    {dragOver ? "Drop here" : "Click or drag to upload"}
                  </p>
                  <p className="font-body text-xs text-muted-soft">
                    .xlsx · .xls · .csv · max 10 MB
                  </p>
                </>
              )}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
                e.target.value = "";
              }}
              className="hidden"
            />

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <Button
                variant="primary"
                size="md"
                className="flex-1"
                onClick={handleSend}
                disabled={
                  !selectedFile ||
                  !subject.trim() ||
                  !body.trim() ||
                  isPending
                }
                loading={isPending}
              >
                <Send size={14} className="mr-1.5" />
                Send Reminders
              </Button>
            </div>
          </>
        )}

        {/* Results */}
        {result && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-center">
                <p className="font-heading font-black text-xl text-emerald-700">
                  {result.sent}
                </p>
                <p className="font-body text-xs text-emerald-600 mt-0.5">
                  Sent
                </p>
              </div>
              <div className="rounded-xl border border-warning/20 bg-warning-soft px-3 py-3 text-center">
                <p className="font-heading font-black text-xl text-warning-dark">
                  {result.skipped}
                </p>
                <p className="font-body text-xs text-warning mt-0.5">
                  Skipped
                </p>
              </div>
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-center">
                <p className="font-heading font-black text-xl text-red-600">
                  {result.failed}
                </p>
                <p className="font-body text-xs text-red-500 mt-0.5">Failed</p>
              </div>
            </div>

            {(result.skipped > 0 || result.failed > 0) && (
              <div className="border border-border rounded-xl overflow-hidden">
                <div className="bg-surface-panel px-4 py-2.5 border-b border-border">
                  <p className="font-body text-xs font-semibold text-foreground-soft uppercase tracking-wide">
                    Details
                  </p>
                </div>
                <div className="divide-y divide-border-subtle max-h-64 overflow-y-auto">
                  {result.rows
                    .filter((r) => r.status !== "sent")
                    .map((r) => (
                      <div
                        key={r.rowIndex}
                        className="flex items-start gap-2.5 px-4 py-2.5"
                      >
                        {statusIcon(r.status)}
                        <div className="min-w-0 flex-1">
                          <p className="font-body text-xs font-medium text-foreground truncate">
                            {r.firstName} {r.lastName}{" "}
                            <span className="text-muted-soft font-normal">
                              · {r.email}
                            </span>
                          </p>
                          {r.reason && (
                            <p className="font-body text-xs text-muted-soft mt-0.5">
                              {r.reason}
                            </p>
                          )}
                        </div>
                        <span
                          className={cn(
                            "font-body text-xs font-medium shrink-0 capitalize",
                            r.status === "skipped"
                              ? "text-amber-500"
                              : "text-red-500",
                          )}
                        >
                          {r.status}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                setResult(null);
                setSelectedFile(null);
                setSubject("");
                setBody("");
              }}
            >
              Send More Reminders
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

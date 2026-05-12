"use client";

import { useState, useEffect, useRef } from "react";
import {
  Download,
  FileText,
  Sheet,
  Upload,
  CheckCircle2,
  XCircle,
  SkipForward,
} from "lucide-react";
import { toast } from "sonner";
import {
  Badge,
  PageLoader,
  Table,
  Select,
  Button,
  SortDropdown,
} from "@/components/ui";
import type { SortOption } from "@/components/ui";
import type { Column, CellValue } from "@/components/ui";
import {
  useStudents,
  useSetUserActive,
  useVerifyUserEmail,
  fetchStudentsExport,
  useImportStudents,
  AdminUser,
  UsersParams,
  ImportStudentsResult,
} from "@/hooks/queries/users";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(date: string | null): CellValue {
  if (!date)
    return <span className="font-body text-sm text-border-strong">—</span>;
  return (
    <span className="font-body text-sm text-muted">
      {new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })}
    </span>
  );
}

function fmtDate(d: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ─── Sort options ─────────────────────────────────────────────────────────────

type StudentSortValue =
  | "score_desc"
  | "score_asc"
  | "joined_desc"
  | "joined_asc";

const STUDENT_SORT_OPTIONS: SortOption<StudentSortValue>[] = [
  { value: "score_desc", label: "Score: Highest first" },
  { value: "score_asc", label: "Score: Lowest first" },
  { value: "joined_desc", label: "Joined: Newest first" },
  { value: "joined_asc", label: "Joined: Oldest first" },
];

function parseSortOption(s: StudentSortValue): {
  sortBy: "createdAt" | "score";
  sortOrder: "asc" | "desc";
} {
  const [field, dir] = s.split("_") as ["score" | "joined", "asc" | "desc"];
  return { sortBy: field === "score" ? "score" : "createdAt", sortOrder: dir };
}

// ─── Export column definitions ────────────────────────────────────────────────

const EXPORT_COLS = [
  {
    key: "firstName",
    label: "First Name",
    getValue: (u: AdminUser) => u.firstName,
  },
  {
    key: "lastName",
    label: "Last Name",
    getValue: (u: AdminUser) => u.lastName,
  },
  { key: "email", label: "Email", getValue: (u: AdminUser) => u.email },
  {
    key: "institution",
    label: "Institution",
    getValue: (u: AdminUser) => u.institution || "—",
  },
  {
    key: "score",
    label: "Points",
    getValue: (u: AdminUser) => `${Math.round(u.score)} pts`,
  },
  {
    key: "isActive",
    label: "Status",
    getValue: (u: AdminUser) => (u.isActive ? "Active" : "Inactive"),
  },
  {
    key: "emailVerified",
    label: "Email Verified",
    getValue: (u: AdminUser) => (u.emailVerified ? "Verified" : "Unverified"),
  },
  {
    key: "createdAt",
    label: "Joined",
    getValue: (u: AdminUser) => fmtDate(u.createdAt),
  },
];

// ─── Table columns ────────────────────────────────────────────────────────────

const columns: Column[] = [
  { key: "user", header: "Student" },
  { key: "institution", header: "Institution" },
  { key: "score", header: "Points" },
  { key: "status", header: "Status" },
  { key: "emailVerified", header: "Email" },
  { key: "joined", header: "Joined" },
  { key: "actions", header: "" },
];

// ─── Import modal ─────────────────────────────────────────────────────────────

interface ImportModalProps {
  onClose: () => void;
}

function ImportModal({ onClose }: ImportModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult] = useState<ImportStudentsResult | null>(null);
  const { mutate: importStudents, isPending } = useImportStudents();

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

  function handleImport() {
    if (!selectedFile) return;
    importStudents(selectedFile, {
      onSuccess: (data) => {
        setResult(data);
        if (data.created > 0)
          toast.success(
            `${data.created} student${data.created !== 1 ? "s" : ""} imported successfully`,
          );
        if (data.failed > 0)
          toast.error(
            `${data.failed} row${data.failed !== 1 ? "s" : ""} failed to import`,
          );
      },
      onError: (err: Error) => toast.error(err.message),
    });
  }

  const statusIcon = (s: ImportStudentsResult["rows"][0]["status"]) => {
    if (s === "created")
      return <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />;
    if (s === "skipped")
      return <SkipForward size={14} className="text-amber-500 shrink-0" />;
    return <XCircle size={14} className="text-red-500 shrink-0" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={!isPending ? onClose : undefined}
      />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-bold text-lg text-foreground">
            Import Students
          </h2>
          <button
            onClick={onClose}
            disabled={isPending}
            className="p-1.5 rounded-lg text-muted-contrast hover:text-foreground hover:bg-surface-muted transition-colors disabled:opacity-40"
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
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-surface-panel border border-border rounded-xl px-4 py-3">
          <p className="font-body text-xs font-semibold text-foreground-soft uppercase tracking-wide mb-1.5">
            File format
          </p>
          <p className="font-body text-xs text-muted leading-relaxed">
            Upload an <strong className="text-foreground">.xlsx</strong>,{" "}
            <strong className="text-foreground">.xls</strong>, or{" "}
            <strong className="text-foreground">.csv</strong> file. The first
            row must be column headers. Required columns:{" "}
            <strong className="text-foreground">First Name</strong>,{" "}
            <strong className="text-foreground">Last Name</strong>,{" "}
            <strong className="text-foreground">Email</strong>. Max 500 rows per
            import.
          </p>
        </div>

        {/* Drop zone */}
        {!result && (
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
              "w-full rounded-xl border-2 border-dashed transition-colors px-4 py-8 flex flex-col items-center gap-2 text-center",
              dragOver
                ? "border-primary bg-primary-soft/50"
                : "border-border hover:border-primary/40 hover:bg-surface",
              isPending && "opacity-60 cursor-not-allowed",
            )}
          >
            <div className="w-10 h-10 rounded-full bg-primary-soft flex items-center justify-center">
              <Upload size={18} className="text-primary" />
            </div>
            {selectedFile ? (
              <>
                <p className="font-body text-sm font-medium text-foreground">
                  {selectedFile.name}
                </p>
                <p className="font-body text-xs text-muted-contrast">
                  {(selectedFile.size / 1024).toFixed(1)} KB · Click to change
                </p>
              </>
            ) : (
              <>
                <p className="font-body text-sm font-medium text-primary">
                  {dragOver ? "Drop here" : "Click or drag to upload"}
                </p>
                <p className="font-body text-xs text-muted-contrast">
                  .xlsx · .xls · .csv · max 10 MB
                </p>
              </>
            )}
          </button>
        )}

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

        {/* Result summary */}
        {result && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-center">
                <p className="font-heading font-black text-xl text-emerald-700">
                  {result.created}
                </p>
                <p className="font-body text-xs text-emerald-600 mt-0.5">
                  Created
                </p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-center">
                <p className="font-heading font-black text-xl text-amber-600">
                  {result.skipped}
                </p>
                <p className="font-body text-xs text-amber-500 mt-0.5">
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
                    Row details
                  </p>
                </div>
                <div className="divide-y divide-border-subtle max-h-52 overflow-y-auto">
                  {result.rows
                    .filter((r) => r.status !== "created")
                    .map((r) => (
                      <div
                        key={r.rowIndex}
                        className="flex items-start gap-2.5 px-4 py-2.5"
                      >
                        {statusIcon(r.status)}
                        <div className="min-w-0 flex-1">
                          <p className="font-body text-xs font-medium text-foreground truncate">
                            {r.firstName} {r.lastName}{" "}
                            <span className="text-muted-contrast font-normal">
                              · {r.email}
                            </span>
                          </p>
                          {r.reason && (
                            <p className="font-body text-xs text-muted-contrast mt-0.5">
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
              }}
            >
              Import Another File
            </Button>
          </div>
        )}

        {/* Actions */}
        {!result && (
          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="md"
              className="flex-1"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              className="flex-1"
              onClick={handleImport}
              disabled={!selectedFile || isPending}
              loading={isPending}
            >
              <Upload size={14} className="mr-1.5" />
              Import
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Export modal ─────────────────────────────────────────────────────────────

interface ExportModalProps {
  onClose: () => void;
  onExport: (format: "pdf" | "excel", cols: string[]) => void;
  isExporting: boolean;
  activeSearch: string;
  activeStatus: string;
}

function ExportModal({
  onClose,
  onExport,
  isExporting,
  activeSearch,
  activeStatus,
}: ExportModalProps) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(EXPORT_COLS.map((c) => c.key)),
  );

  const allSelected = selected.size === EXPORT_COLS.length;
  const hasFilters = !!activeSearch || !!activeStatus;

  function toggle(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-surface-card rounded-2xl shadow-xl w-full max-w-sm p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading font-bold text-lg text-foreground">
            Export Students
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-contrast hover:text-foreground hover:bg-surface-muted transition-colors"
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
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-5">
          {/* Active filters */}
          {hasFilters && (
            <div className="bg-primary-soft rounded-lg px-4 py-3 flex flex-col gap-1.5">
              <p className="font-body text-xs font-semibold text-primary">
                Active filters will be applied
              </p>
              <div className="flex flex-wrap gap-1.5">
                {activeSearch && (
                  <Badge variant="purple" size="sm">
                    Search: &quot;{activeSearch}&quot;
                  </Badge>
                )}
                {activeStatus && (
                  <Badge variant="purple" size="sm">
                    Status: {activeStatus}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Column selection */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="font-body text-sm font-medium text-foreground">
                Columns
              </p>
              <button
                onClick={() =>
                  setSelected(
                    allSelected
                      ? new Set()
                      : new Set(EXPORT_COLS.map((c) => c.key)),
                  )
                }
                className="font-body text-xs text-primary hover:text-[#6B21A8] transition-colors"
              >
                {allSelected ? "Deselect all" : "Select all"}
              </button>
            </div>
            <div className="flex flex-col gap-2.5">
              {EXPORT_COLS.map((col) => (
                <label
                  key={col.key}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selected.has(col.key)}
                    onChange={() => toggle(col.key)}
                    className="w-4 h-4 rounded border-border-strong accent-primary cursor-pointer shrink-0"
                  />
                  <span className="font-body text-sm text-foreground-soft">
                    {col.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-1">
            {selected.size === 0 && (
              <p className="font-body text-xs text-muted-contrast text-center">
                Select at least one column to export
              </p>
            )}
            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="md"
                className="flex-1"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                variant="secondary"
                size="md"
                disabled={selected.size === 0}
                loading={isExporting}
                onClick={() => onExport("excel", [...selected])}
              >
                <Sheet size={14} className="mr-1.5 text-[#16A34A]" />
                Excel
              </Button>
              <Button
                variant="primary"
                size="md"
                disabled={selected.size === 0}
                loading={isExporting}
                onClick={() => onExport("pdf", [...selected])}
              >
                <FileText size={14} className="mr-1.5" />
                PDF
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StudentsPage() {
  const [rawSearch, setRawSearch] = useState("");
  const [status, setStatus] = useState<UsersParams["status"]>("");
  const [sort, setSort] = useState<StudentSortValue>("score_desc");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(rawSearch.trim(), 350);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, sort]);

  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const PAGE_SIZE = 10;

  const { sortBy, sortOrder } = parseSortOption(sort);
  const params: UsersParams = {
    search: debouncedSearch || undefined,
    status: status || undefined,
    sortBy,
    sortOrder,
    page,
    limit: PAGE_SIZE,
  };

  const { data: studentsPage, isLoading, error } = useStudents(params);
  const students = studentsPage?.users;
  const { mutate: setActive } = useSetUserActive();
  const { mutate: verifyEmail } = useVerifyUserEmail();

  async function handleExport(format: "pdf" | "excel", selectedKeys: string[]) {
    setExporting(true);
    try {
      const users = await fetchStudentsExport({
        search: debouncedSearch || undefined,
        status: status || undefined,
        sortBy,
        sortOrder,
      });

      const activeCols = EXPORT_COLS.filter((c) =>
        selectedKeys.includes(c.key),
      );
      const headers = activeCols.map((c) => c.label);
      const rows = users.map((u) => activeCols.map((c) => c.getValue(u)));
      const exportDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      if (format === "excel") {
        const { utils, writeFile } = await import("xlsx");
        const ws = utils.aoa_to_sheet([
          [process.env.NEXT_PUBLIC_BRAND_NAME || "WithinTech Learn"],
          [`Students Export - ${exportDate}`],
          [
            `Data extracted from ${process.env.NEXT_PUBLIC_BRAND_NAME || "WithinTech Learn"} platform on ${exportDate}`,
          ],
          [],
          headers,
          ...rows,
        ]);
        ws["!merges"] = [
          { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } },
          { s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } },
          { s: { r: 2, c: 0 }, e: { r: 2, c: headers.length - 1 } },
        ];
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, "Students");
        writeFile(wb, "students.xlsx");
      } else {
        const { default: jsPDF } = await import("jspdf");
        const { default: autoTable } = await import("jspdf-autotable");
        const doc = new jsPDF({ orientation: "landscape" });

        let logoBase64 = "";
        try {
          const logoResponse = await fetch("/logo.png");
          if (logoResponse.ok) {
            const logoBlob = await logoResponse.blob();
            logoBase64 = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(logoBlob);
            });
          }
        } catch (logoError) {
          console.warn("Logo load failed, continuing without logo:", logoError);
        }

        // Load icons from public folder
        async function loadIcon(path: string): Promise<string> {
          try {
            const response = await fetch(path);
            if (!response.ok) return "";
            const blob = await response.blob();
            return new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(blob);
            });
          } catch {
            return "";
          }
        }

        const [
          facebookIcon,
          instagramIcon,
          linkedinIcon,
          twitterIcon,
          whatsappIcon,
          globeIcon,
          mailIcon,
          phoneIcon,
        ] = await Promise.all([
          loadIcon("/icons/facebook.png"),
          loadIcon("/icons/instagram.png"),
          loadIcon("/icons/linkedin.png"),
          loadIcon("/icons/twitter.png"),
          loadIcon("/icons/whatsapp.png"),
          loadIcon("/icons/globe.png"),
          loadIcon("/icons/mail.png"),
          loadIcon("/icons/phone.png"),
        ]);

        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const marginBottom = 40;

        function addHeader(pageNumber: number) {
          doc.setPage(pageNumber);
          if (logoBase64) {
            doc.addImage(logoBase64, "PNG", 14, 10, 20, 20);
          }

          // Brand name on left
          doc.setFont("helvetica", "bold");
          doc.setFontSize(16);
          doc.setTextColor(61, 0, 107);
          doc.text(
            process.env.NEXT_PUBLIC_BRAND_NAME || "WithinTech Learn",
            38,
            20,
          );

          // File title on right with larger size
          const titleText = "Students Export";
          doc.setFont("helvetica", "bold");
          doc.setFontSize(20);
          doc.setTextColor(61, 0, 107);
          const titleWidth = doc.getTextWidth(titleText);
          doc.text(titleText, pageWidth - 14 - titleWidth, 22);

          if (pageNumber === 1) {
            doc.setFontSize(9);
            doc.setTextColor(107, 114, 128);
            const filterStr = [
              debouncedSearch && `Search: "${debouncedSearch}"`,
              status && `Status: ${status}`,
            ]
              .filter(Boolean)
              .join("  ·  ");
            doc.text(
              `Exported ${exportDate}  ·  ${users.length} records${filterStr ? `  ·  ${filterStr}` : ""}`,
              14,
              38,
            );
          }
        }

        function addFooter(pageNumber: number) {
          doc.setPage(pageNumber);

          const footerY = pageHeight - 35;
          const footerHeight = 35;

          // Purple background
          doc.setFillColor(61, 0, 107);
          doc.rect(0, footerY, pageWidth, footerHeight, "F");

          // Contact info and social icons in white
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(255, 255, 255);

          const iconSize = 4;
          const spacing = 10;
          let currentX = pageWidth - 14;
          const baseY = pageHeight - 17;

          // Helper to draw icon + text from left to right
          function drawItem(icon: string, text: string, format: "PNG") {
            const textWidth = doc.getTextWidth(text);
            const itemWidth = icon ? iconSize + 2 + textWidth : textWidth;
            currentX -= itemWidth;

            if (icon) {
              doc.addImage(
                icon,
                format,
                currentX,
                baseY - 3,
                iconSize,
                iconSize,
              );
            }
            doc.text(text, currentX + (icon ? iconSize + 2 : 0), baseY);
            return itemWidth;
          }

          // 6. WhatsApp icon with phone number (no country code)
          const phoneShort = (
            process.env.NEXT_PUBLIC_SUPPORT_PHONE || "+250 781 375 199"
          ).replace(/^\+\d{2}\s*/, "");
          drawItem(whatsappIcon, phoneShort, "PNG");
          currentX -= spacing;

          // 5. Social icons (facebook, instagram, twitter, linkedin) + handle
          const socialHandle =
            process.env.NEXT_PUBLIC_SOCIAL_HANDLE || "@WithinTechRwanda";
          const handleWidth = doc.getTextWidth(socialHandle);
          currentX -= handleWidth;
          doc.text(socialHandle, currentX, baseY);
          currentX -= 2;

          // Draw social icons from right to left
          const socialIcons = [
            { icon: linkedinIcon, name: "linkedin" },
            { icon: twitterIcon, name: "twitter" },
            { icon: instagramIcon, name: "instagram" },
            { icon: facebookIcon, name: "facebook" },
          ];

          for (const { icon } of socialIcons) {
            if (icon) {
              currentX -= iconSize + 2;
              doc.addImage(
                icon,
                "PNG",
                currentX,
                baseY - 3,
                iconSize,
                iconSize,
              );
            }
          }
          currentX -= spacing;

          // 4. Small whitespace separator
          currentX -= 5;

          // 3. Phone with phone icon
          const phoneText =
            process.env.NEXT_PUBLIC_SUPPORT_PHONE || "+250 781 375 199";
          drawItem(phoneIcon, phoneText, "PNG");
          currentX -= spacing;

          // 2. Email with mail icon
          const emailText =
            process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "info@learn.withintech.rw";
          drawItem(mailIcon, emailText, "PNG");
          currentX -= spacing;

          // 1. Website with globe icon
          const websiteText =
            process.env.NEXT_PUBLIC_SUPPORT_WEBSITE || "learn.withintech.org";
          drawItem(globeIcon, websiteText, "PNG");
        }

        let pageCount = 1;

        autoTable(doc, {
          startY: 44,
          head: [headers],
          body: rows,
          styles: { fontSize: 9, cellPadding: 4 },
          headStyles: {
            fillColor: [61, 0, 107],
            textColor: 255,
            fontStyle: "bold",
          },
          alternateRowStyles: { fillColor: [249, 250, 251] },
          margin: { top: 44, bottom: marginBottom },
          didDrawPage: (data: { pageNumber: number }) => {
            pageCount = data.pageNumber;
          },
        });

        for (let i = 1; i <= pageCount; i++) {
          addHeader(i);
          addFooter(i);
        }

        doc.save("students.pdf");
      }

      setExportOpen(false);
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  function buildRow(u: AdminUser): Record<string, CellValue> {
    return {
      id: u.id,
      user: (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="font-heading font-bold text-xs text-primary">
              {u.firstName[0]?.toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-body text-sm font-medium text-foreground">
              {u.firstName} {u.lastName}
            </p>
            <p className="font-body text-xs text-muted-contrast">{u.email}</p>
          </div>
        </div>
      ),
      institution: (
        <span className="font-body text-sm text-muted">
          {u.institution || "Not Specified"}
        </span>
      ),
      score: (
        <span className="font-body text-sm font-medium text-foreground tabular-nums">
          {Math.round(u.score)}
          <span className="font-body font-normal text-xs text-muted-contrast">
            {" "}
            pts
          </span>
        </span>
      ),
      status: (
        <Badge variant={u.isActive ? "success" : "warning"}>
          {u.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
      emailVerified: (
        <Badge variant={u.emailVerified ? "success" : "warning"}>
          {u.emailVerified ? "Verified" : "Unverified"}
        </Badge>
      ),
      joined: formatDate(u.createdAt),
      actions: (
        <div className="flex items-center gap-2">
          {!u.emailVerified && (
            <Button
              variant="secondary"
              onClick={() => verifyEmail(u.id)}
              className="text-xs py-1.5 px-3"
            >
              Verify Email
            </Button>
          )}
          <Button
            variant={u.isActive ? "danger" : "secondary"}
            onClick={() => setActive({ userId: u.id, isActive: !u.isActive })}
            className="text-xs py-1.5 px-3"
          >
            {u.isActive ? "Deactivate" : "Activate"}
          </Button>
        </div>
      ),
    };
  }

  return (
    <>
      {exportOpen && (
        <ExportModal
          onClose={() => setExportOpen(false)}
          onExport={handleExport}
          isExporting={exporting}
          activeSearch={debouncedSearch}
          activeStatus={status ?? ""}
        />
      )}

      {importOpen && <ImportModal onClose={() => setImportOpen(false)} />}

      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="font-heading font-black text-2xl text-foreground">
              Students
            </h1>
            <p className="font-body text-sm text-muted mt-1">
              Manage student accounts.
            </p>
          </div>
          <div className="flex gap-2">
            {/* Import button hidden - importing users is internal only
            <Button
              variant="secondary"
              size="md"
              onClick={() => setImportOpen(true)}
            >
              <Upload size={14} className="mr-1.5" />
              Import
            </Button>
            */}
            <Button
              variant="secondary"
              size="md"
              onClick={() => setExportOpen(true)}
            >
              <Download size={14} className="mr-1.5" />
              Export
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 min-w-0">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-contrast pointer-events-none">
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
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search by name or email…"
              value={rawSearch}
              onChange={(e) => setRawSearch(e.target.value)}
              className={cn(
                "font-body text-sm w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-surface-card text-foreground",
                "placeholder:text-muted-contrast outline-none transition-all",
                "focus:border-primary focus:ring-2 focus:ring-primary/10",
              )}
            />
          </div>
          <Select
            options={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
            value={status || null}
            onChange={(v) => setStatus(v as UsersParams["status"])}
            placeholder="All Statuses"
            isClearable
          />
          <SortDropdown
            options={STUDENT_SORT_OPTIONS}
            value={sort}
            onChange={setSort}
          />
        </div>

        {isLoading && <PageLoader type="list" />}

        {error && (
          <p className="font-body text-sm text-red-500 bg-red-50 px-4 py-3 rounded-lg">
            Failed to load students. Please try again.
          </p>
        )}

        {!isLoading && !error && students?.length === 0 && (
          <div className="text-center py-16">
            <p className="font-body text-muted">No students found.</p>
          </div>
        )}

        {students && students.length > 0 && (
          <Table
            columns={columns}
            rows={students.map(buildRow)}
            rowKey={(row) => row.id as string}
            page={page}
            totalPages={Math.ceil((studentsPage?.total ?? 0) / PAGE_SIZE)}
            onPageChange={setPage}
          />
        )}
      </div>
    </>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Pencil, Trash2, Globe, Archive, Code2 } from "lucide-react";
import {
  useAdminChallenges,
  useDeleteChallenge,
  usePublishChallenge,
  useUnpublishChallenge,
  type AdminChallenge,
  type ChallengeStatus,
  type Difficulty,
} from "@/hooks/queries/challenges";
import {
  Button,
  Badge,
  Select,
  Tabs,
  Pagination,
  type Tab,
} from "@/components/ui";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── Badges ───────────────────────────────────────────────────────────────────

const DIFFICULTY_BADGE: Record<
  Difficulty,
  { variant: "success" | "warning" | "danger"; label: string }
> = {
  easy: { variant: "success", label: "Easy" },
  medium: { variant: "warning", label: "Medium" },
  hard: { variant: "danger", label: "Hard" },
};

const STATUS_BADGE: Record<
  ChallengeStatus,
  { variant: "gray" | "purple"; label: string }
> = {
  draft: { variant: "gray", label: "Draft" },
  published: { variant: "purple", label: "Published" },
};

type StatusTabValue = ChallengeStatus;

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="bg-surface-card rounded-xl border border-border overflow-hidden animate-pulse">
      <div className="bg-surface-panel border-b border-border px-4 py-3 flex gap-8">
        {[40, 20, 15, 10].map((w, i) => (
          <div
            key={i}
            className="h-3 bg-fill-muted rounded"
            style={{ width: `${w}%` }}
          />
        ))}
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-4 py-4 border-b border-border-subtle last:border-0"
        >
          <div className="h-4 bg-fill-muted rounded flex-1" />
          <div className="h-5 w-14 bg-fill-muted rounded-full" />
          <div className="h-5 w-16 bg-fill-muted rounded-full" />
          <div className="h-4 w-8 bg-fill-muted rounded" />
          <div className="flex gap-2 ml-auto">
            {[1, 2, 3].map((j) => (
              <div key={j} className="w-7 h-7 bg-fill-muted rounded-lg" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="bg-surface-card rounded-xl border border-border py-20 flex flex-col items-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-primary-soft flex items-center justify-center">
        <Code2 size={28} className="text-primary" />
      </div>
      <div className="text-center">
        <p className="font-heading font-bold text-base text-foreground">
          No challenges yet
        </p>
        <p className="font-body text-sm text-muted mt-1">
          Create your first coding challenge to get started.
        </p>
      </div>
      <Link href="/admin/challenges/new">
        <Button variant="primary" size="md">
          <Plus size={15} className="mr-1.5" /> New Challenge
        </Button>
      </Link>
    </div>
  );
}

// ─── Delete confirm modal ─────────────────────────────────────────────────────

function ConfirmDeleteModal({
  title,
  onConfirm,
  onCancel,
  loading,
}: {
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-surface-card rounded-2xl shadow-xl max-w-sm w-full p-6">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center shrink-0">
            <Trash2 size={18} className="text-red-600 dark:text-red-300" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-lg text-foreground mb-1">
              Delete challenge?
            </h2>
            <p className="font-body text-sm text-muted leading-relaxed">
              <span className="font-medium text-foreground">{title}</span> and
              all its test cases will be permanently removed. This cannot be
              undone.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            size="md"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="md"
            loading={loading}
            onClick={onConfirm}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

function useStatusTabCounts() {
  const draft = useAdminChallenges({ page: 1, limit: 1, status: "draft" });
  const published = useAdminChallenges({
    page: 1,
    limit: 1,
    status: "published",
  });

  return {
    draft: draft.data?.total,
    published: published.data?.total,
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminChallengesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [difficulty, setDiff] = useState<Difficulty | undefined>();
  const [statusTab, setStatusTab] = useState<StatusTabValue>("draft");
  const [deleting, setDeleting] = useState<AdminChallenge | null>(null);

  const counts = useStatusTabCounts();
  const { data, isLoading } = useAdminChallenges({
    page,
    limit: 20,
    difficulty,
    status: statusTab,
  });
  const deleteMutation = useDeleteChallenge();
  const publishMutation = usePublishChallenge();
  const unpublishMutation = useUnpublishChallenge();

  const tabs: Tab<StatusTabValue>[] = [
    { label: "Draft", value: "draft", count: counts.draft },
    { label: "Published", value: "published", count: counts.published },
  ];

  const handleDelete = async () => {
    if (!deleting) return;
    const res = await deleteMutation.mutateAsync(deleting.id);
    if (res.success) {
      toast.success("Challenge deleted");
      setDeleting(null);
    } else toast.error(res.message ?? "Failed to delete");
  };

  const handleTogglePublish = async (c: AdminChallenge) => {
    if (c.status === "published") {
      const res = await unpublishMutation.mutateAsync(c.id);
      if (res.success) toast.success("Challenge unpublished");
      else toast.error(res.message ?? "Failed");
    } else {
      const res = await publishMutation.mutateAsync(c.id);
      if (res.success) toast.success("Challenge published");
      else toast.error(res.message ?? "Failed");
    }
  };

  const totalPages = data ? Math.ceil(data.total / 20) : 1;

  return (
    <>
      {deleting && (
        <ConfirmDeleteModal
          title={deleting.title}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
          loading={deleteMutation.isPending}
        />
      )}

      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-6">
          <div className="min-w-0">
            <h1 className="font-heading font-black text-2xl text-foreground">
              Challenges
            </h1>
            <p className="font-body text-sm text-muted mt-0.5">
              {data
                ? `${data.total} challenge${data.total !== 1 ? "s" : ""}`
                : "Manage coding challenges for students"}
            </p>
          </div>
          <Link href="/admin/challenges/new" className="shrink-0">
            <Button variant="primary" size="md">
              <Plus size={15} className="mr-1.5" />
              <span className="hidden sm:inline">New Challenge</span>
              <span className="sm:hidden">New</span>
            </Button>
          </Link>
        </div>

        {/* Status tabs */}
        <Tabs
          tabs={tabs}
          value={statusTab}
          onChange={(v) => {
            setStatusTab(v);
            setPage(1);
          }}
          className="mb-5"
        />

        {/* Filters */}
        <div className="flex gap-3 mb-5 flex-wrap">
          <Select
            options={[
              { value: "easy", label: "Easy" },
              { value: "medium", label: "Medium" },
              { value: "hard", label: "Hard" },
            ]}
            value={difficulty ?? null}
            onChange={(v) => {
              setDiff((v as Difficulty) || undefined);
              setPage(1);
            }}
            placeholder="All Difficulties"
            isClearable
            className="w-[190px]"
          />
        </div>

        {/* Table */}
        {isLoading ? (
          <TableSkeleton />
        ) : !data || data.challenges.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="bg-surface-card rounded-xl border border-border overflow-x-auto">
              <table className="w-full min-w-[480px]">
                <thead>
                  <tr className="bg-surface-panel border-b border-border">
                    <th className="text-left px-4 py-3 font-body font-semibold text-xs text-muted uppercase tracking-wider w-10">
                      #
                    </th>
                    <th className="text-left px-4 py-3 font-body font-semibold text-xs text-muted uppercase tracking-wider">
                      Title
                    </th>
                    <th className="text-left px-4 py-3 font-body font-semibold text-xs text-muted uppercase tracking-wider">
                      Difficulty
                    </th>
                    <th className="text-left px-4 py-3 font-body font-semibold text-xs text-muted uppercase tracking-wider">
                      Status
                    </th>
                    <th className="hidden sm:table-cell text-left px-4 py-3 font-body font-semibold text-xs text-muted uppercase tracking-wider w-16">
                      Tests
                    </th>
                    <th className="hidden sm:table-cell text-left px-4 py-3 font-body font-semibold text-xs text-muted uppercase tracking-wider w-20">
                      Attempts
                    </th>
                    <th className="w-28" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle divide-border">
                  {data.challenges.map((c) => {
                    const diff = DIFFICULTY_BADGE[c.difficulty];
                    const stat = STATUS_BADGE[c.status];
                    return (
                      <tr
                        key={c.id}
                        onClick={() => router.push(`/admin/challenges/${c.id}`)}
                        className="hover:bg-surface-subtle transition-colors group cursor-pointer"
                      >
                        <td className="px-4 py-3.5 font-mono text-xs text-muted-contrast">
                          {c.number}
                        </td>
                        <td className="px-4 py-3.5 font-body text-sm text-foreground font-medium max-w-[160px] sm:max-w-none truncate">
                          {c.title}
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge variant={diff.variant} size="sm">
                            {diff.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge variant={stat.variant} size="sm">
                            {stat.label}
                          </Badge>
                        </td>
                        <td className="hidden sm:table-cell px-4 py-3.5 font-body text-sm text-muted">
                          {c._count.testCases}
                        </td>
                        <td className="hidden sm:table-cell px-4 py-3.5 font-body text-sm text-muted">
                          {c._count.submissions}
                        </td>
                        <td
                          className="px-4 py-3.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <button
                              title={
                                c.status === "published"
                                  ? "Unpublish"
                                  : "Publish"
                              }
                              onClick={() => handleTogglePublish(c)}
                              disabled={
                                publishMutation.isPending ||
                                unpublishMutation.isPending
                              }
                              className="p-1.5 rounded-lg hover:bg-primary-soft hover:bg-primary-soft text-muted-contrast hover:text-primary transition-colors disabled:opacity-40"
                            >
                              {c.status === "published" ? (
                                <Archive size={15} />
                              ) : (
                                <Globe size={15} />
                              )}
                            </button>
                            <Link href={`/admin/challenges/${c.id}`}>
                              <span className="p-1.5 rounded-lg hover:bg-primary-soft hover:bg-primary-soft text-muted-contrast hover:text-primary transition-colors flex items-center">
                                <Pencil size={15} />
                              </span>
                            </Link>
                            <button
                              onClick={() => setDeleting(c)}
                              disabled={c.status === "published"}
                              title={
                                c.status === "published"
                                  ? "Unpublish before deleting"
                                  : "Delete"
                              }
                              className={cn(
                                "p-1.5 rounded-lg text-muted-contrast transition-colors",
                                c.status === "published"
                                  ? "opacity-20 cursor-not-allowed"
                                  : "hover:bg-red-50 hover:text-red-500",
                              )}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </>
  );
}

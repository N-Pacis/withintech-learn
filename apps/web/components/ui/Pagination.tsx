import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function getPageNumbers(
  page: number,
  totalPages: number,
): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (page <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis", totalPages];
  }

  if (page >= totalPages - 3) {
    return [
      1,
      "ellipsis",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [1, "ellipsis", page - 1, page, page + 1, "ellipsis", totalPages];
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const safePage = Math.min(Math.max(page, 1), totalPages);
  const pages = getPageNumbers(safePage, totalPages);

  function goToPage(nextPage: number) {
    const clamped = Math.min(Math.max(nextPage, 1), totalPages);
    if (clamped !== safePage) onPageChange(clamped);
  }

  return (
    <div className="flex items-center justify-between mt-6">
      <p className="font-body text-sm text-muted">
        Page <span className="font-medium text-foreground">{safePage}</span> of{" "}
        <span className="font-medium text-foreground">{totalPages}</span>
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => goToPage(safePage - 1)}
          disabled={safePage === 1}
          className={cn(
            "w-8 h-8 flex items-center justify-center rounded-lg transition-colors",
            "text-muted hover:bg-primary-soft hover:text-primary",
            "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-muted",
          )}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>

        {pages.map((p, i) =>
          p === "ellipsis" ? (
            <span
              key={`ellipsis-${i}`}
              className="w-8 h-8 flex items-center justify-center text-muted-contrast"
            >
              <MoreHorizontal size={14} />
            </span>
          ) : (
            <button
              key={p}
              onClick={() => goToPage(p)}
              className={cn(
                "w-8 h-8 flex items-center justify-center rounded-lg font-body text-sm transition-colors",
                p === safePage
                  ? "bg-primary text-white font-medium"
                  : "text-foreground-soft hover:bg-primary-soft hover:text-primary",
              )}
            >
              {p}
            </button>
          ),
        )}

        <button
          onClick={() => goToPage(safePage + 1)}
          disabled={safePage === totalPages}
          className={cn(
            "w-8 h-8 flex items-center justify-center rounded-lg transition-colors",
            "text-muted hover:bg-primary-soft hover:text-primary",
            "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-muted",
          )}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

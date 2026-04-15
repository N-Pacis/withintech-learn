import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function getPageNumbers(page: number, totalPages: number): (number | 'ellipsis')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (page <= 4) {
    return [1, 2, 3, 4, 5, 'ellipsis', totalPages];
  }

  if (page >= totalPages - 3) {
    return [1, 'ellipsis', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, 'ellipsis', page - 1, page, page + 1, 'ellipsis', totalPages];
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(page, totalPages);

  return (
    <div className="flex items-center justify-between mt-6">
      <p className="font-body text-sm text-[#6B7280] dark:text-[#9CA3AF]">
        Page <span className="font-medium text-[#0F0F0F] dark:text-[#F9FAFB]">{page}</span> of{' '}
        <span className="font-medium text-[#0F0F0F] dark:text-[#F9FAFB]">{totalPages}</span>
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className={cn(
            'w-8 h-8 flex items-center justify-center rounded-lg transition-colors',
            'text-[#6B7280] hover:bg-[#F3E8FF] hover:text-[#3D006B]',
            'dark:text-[#9CA3AF] dark:hover:bg-[#2d1a4a] dark:hover:text-[#C084FC]',
            'disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#6B7280]',
          )}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>

        {pages.map((p, i) =>
          p === 'ellipsis' ? (
            <span
              key={`ellipsis-${i}`}
              className="w-8 h-8 flex items-center justify-center text-[#9CA3AF]"
            >
              <MoreHorizontal size={14} />
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={cn(
                'w-8 h-8 flex items-center justify-center rounded-lg font-body text-sm transition-colors',
                p === page
                  ? 'bg-[#3D006B] text-white font-medium'
                  : 'text-[#374151] hover:bg-[#F3E8FF] hover:text-[#3D006B] dark:text-[#D1D5DB] dark:hover:bg-[#2d1a4a] dark:hover:text-[#C084FC]',
              )}
            >
              {p}
            </button>
          ),
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className={cn(
            'w-8 h-8 flex items-center justify-center rounded-lg transition-colors',
            'text-[#6B7280] hover:bg-[#F3E8FF] hover:text-[#3D006B]',
            'dark:text-[#9CA3AF] dark:hover:bg-[#2d1a4a] dark:hover:text-[#C084FC]',
            'disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#6B7280]',
          )}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

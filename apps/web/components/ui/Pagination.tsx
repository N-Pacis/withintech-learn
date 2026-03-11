import { Button } from './Button';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-8">
      <p className="font-body text-sm text-[#6B7280]">
        Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </Button>
        <span className="font-body text-sm text-[#6B7280] px-2">{page} / {totalPages}</span>
        <Button variant="secondary" size="sm" disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}

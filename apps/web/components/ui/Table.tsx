import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  className?: string;
}

export function Table<T>({ columns, rows, rowKey, className }: TableProps<T>) {
  return (
    <div className={cn('bg-white rounded-xl ring-1 ring-[#E5E7EB] overflow-hidden shadow-sm', className)}>
      <div className="overflow-x-auto">
      <table className="w-full min-w-[600px]">
        <thead>
          <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'px-6 py-3 text-left font-body text-xs font-semibold text-[#6B7280] uppercase tracking-wider',
                  col.className,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)} className="border-b border-[#F3F4F6] hover:bg-[#FAFAFA] transition-colors last:border-0">
              {columns.map((col) => (
                <td key={col.key} className={cn('px-6 py-4', col.className)}>
                  {col.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

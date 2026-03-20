'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Pagination } from './Pagination';

export type CellValue = string | number | null | React.ReactElement;

export interface Column {
  key: string;
  header: string;
}

interface TableProps {
  columns: Column[];
  rows: Record<string, CellValue>[];
  rowKey: (row: Record<string, CellValue>) => string;
  pageSize?: number;
  className?: string;
}

export function Table({ columns, rows, rowKey, pageSize = 10, className }: TableProps) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(rows.length / pageSize);
  const start = (page - 1) * pageSize;
  const paginatedRows = rows.slice(start, start + pageSize);

  return (
    <div>
      <div className={cn('bg-white rounded-xl ring-1 ring-[#E5E7EB] overflow-hidden shadow-sm', className)}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-6 py-3 text-left font-body text-xs font-semibold text-[#6B7280] uppercase tracking-wider"
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedRows.map((row) => (
                <tr key={rowKey(row)} className="border-b border-[#F3F4F6] hover:bg-[#FAFAFA] transition-colors last:border-0">
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-4">
                      {row[col.key] ?? null}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination page={page} totalPages={totalPages} onPageChange={(p) => { setPage(p); }} />
    </div>
  );
}

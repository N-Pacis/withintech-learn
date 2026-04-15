"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Pagination } from "./Pagination";

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
  // Server-side pagination — when all three are provided, client-side slicing is disabled
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function Table({
  columns,
  rows,
  rowKey,
  pageSize = 10,
  className,
  page: externalPage,
  totalPages: externalTotalPages,
  onPageChange: externalOnPageChange,
}: TableProps) {
  const [internalPage, setInternalPage] = useState(1);

  const isServerPaginated =
    externalPage !== undefined &&
    externalTotalPages !== undefined &&
    externalOnPageChange !== undefined;

  const page = isServerPaginated ? externalPage : internalPage;
  const totalPages = isServerPaginated
    ? externalTotalPages
    : Math.ceil(rows.length / pageSize);
  const visibleRows = isServerPaginated
    ? rows
    : rows.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (isServerPaginated) return;
    if (totalPages === 0) {
      if (internalPage !== 1) setInternalPage(1);
      return;
    }
    if (internalPage > totalPages) {
      setInternalPage(totalPages);
    }
  }, [internalPage, isServerPaginated, totalPages]);

  function handlePageChange(p: number) {
    if (isServerPaginated) {
      externalOnPageChange(p);
    } else {
      setInternalPage(p);
    }
  }

  return (
    <div>
      <div
        className={cn(
          "bg-surface-card rounded-xl ring-1 ring-border overflow-hidden shadow-sm",
          className,
        )}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-150">
            <thead>
              <tr className="border-b border-border bg-surface-panel">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-6 py-3 text-left font-body text-xs font-semibold text-muted uppercase tracking-wider"
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => (
                <tr
                  key={rowKey(row)}
                  className="border-b border-border-subtle hover:bg-surface transition-colors last:border-0"
                >
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
      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

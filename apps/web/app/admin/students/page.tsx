'use client';

import { useState, useEffect } from 'react';
import { Download, FileText, Sheet } from 'lucide-react';
import { toast } from 'sonner';
import { Badge, PageLoader, Table, Select, Button } from '@/components/ui';
import type { Column, CellValue } from '@/components/ui';
import { useStudents, useSetUserActive, useVerifyUserEmail, fetchStudentsExport, AdminUser, UsersParams } from '@/hooks/queries/users';
import { cn } from '@/lib/utils';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

function formatDate(date: string | null): CellValue {
  if (!date) return <span className="font-body text-sm text-[#D1D5DB]">—</span>;
  return (
    <span className="font-body text-sm text-[#6B7280]">
      {new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
    </span>
  );
}

function fmtDate(d: string | null) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ─── Export column definitions ────────────────────────────────────────────────

const EXPORT_COLS = [
  { key: 'firstName',     label: 'First Name',     getValue: (u: AdminUser) => u.firstName },
  { key: 'lastName',      label: 'Last Name',      getValue: (u: AdminUser) => u.lastName },
  { key: 'email',         label: 'Email',          getValue: (u: AdminUser) => u.email },
  { key: 'isActive',      label: 'Status',         getValue: (u: AdminUser) => u.isActive ? 'Active' : 'Inactive' },
  { key: 'emailVerified', label: 'Email Verified', getValue: (u: AdminUser) => u.emailVerified ? 'Verified' : 'Unverified' },
  { key: 'createdAt',     label: 'Joined',         getValue: (u: AdminUser) => fmtDate(u.createdAt) },
  { key: 'lastLoggedIn',  label: 'Last Login',     getValue: (u: AdminUser) => fmtDate(u.lastLoggedIn) },
];

// ─── Table columns ────────────────────────────────────────────────────────────

const columns: Column[] = [
  { key: 'user',          header: 'Student'    },
  { key: 'status',        header: 'Status'     },
  { key: 'emailVerified', header: 'Email'      },
  { key: 'lastLoggedIn',  header: 'Last login' },
  { key: 'joined',        header: 'Joined'     },
  { key: 'actions',       header: ''           },
];

// ─── Export modal ─────────────────────────────────────────────────────────────

interface ExportModalProps {
  onClose:      () => void;
  onExport:     (format: 'pdf' | 'excel', cols: string[]) => void;
  isExporting:  boolean;
  activeSearch: string;
  activeStatus: string;
}

function ExportModal({ onClose, onExport, isExporting, activeSearch, activeStatus }: ExportModalProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(EXPORT_COLS.map(c => c.key)));

  const allSelected = selected.size === EXPORT_COLS.length;
  const hasFilters  = !!activeSearch || !!activeStatus;

  function toggle(key: string) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading font-bold text-lg text-[#0F0F0F]">Export Students</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#0F0F0F] hover:bg-[#F3F4F6] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-5">

          {/* Active filters */}
          {hasFilters && (
            <div className="bg-[#F3E8FF] rounded-lg px-4 py-3 flex flex-col gap-1.5">
              <p className="font-body text-xs font-semibold text-[#3D006B]">Active filters will be applied</p>
              <div className="flex flex-wrap gap-1.5">
                {activeSearch && <Badge variant="purple" size="sm">Search: "{activeSearch}"</Badge>}
                {activeStatus && <Badge variant="purple" size="sm">Status: {activeStatus}</Badge>}
              </div>
            </div>
          )}

          {/* Column selection */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="font-body text-sm font-medium text-[#0F0F0F]">Columns</p>
              <button
                onClick={() => setSelected(allSelected ? new Set() : new Set(EXPORT_COLS.map(c => c.key)))}
                className="font-body text-xs text-[#3D006B] hover:text-[#6B21A8] transition-colors"
              >
                {allSelected ? 'Deselect all' : 'Select all'}
              </button>
            </div>
            <div className="flex flex-col gap-2.5">
              {EXPORT_COLS.map(col => (
                <label key={col.key} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selected.has(col.key)}
                    onChange={() => toggle(col.key)}
                    className="w-4 h-4 rounded border-[#D1D5DB] accent-[#3D006B] cursor-pointer shrink-0"
                  />
                  <span className="font-body text-sm text-[#374151]">{col.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-1">
            {selected.size === 0 && (
              <p className="font-body text-xs text-[#9CA3AF] text-center">Select at least one column to export</p>
            )}
            <div className="flex gap-3">
              <Button variant="secondary" size="md" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="secondary"
                size="md"
                disabled={selected.size === 0}
                loading={isExporting}
                onClick={() => onExport('excel', [...selected])}
              >
                <Sheet size={14} className="mr-1.5 text-[#16A34A]" />
                Excel
              </Button>
              <Button
                variant="primary"
                size="md"
                disabled={selected.size === 0}
                loading={isExporting}
                onClick={() => onExport('pdf', [...selected])}
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
  const [rawSearch, setRawSearch] = useState('');
  const [status, setStatus]       = useState<UsersParams['status']>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const debouncedSearch = useDebounce(rawSearch.trim(), 350);

  const [exportOpen, setExportOpen]   = useState(false);
  const [exporting, setExporting]     = useState(false);

  const params: UsersParams = {
    search: debouncedSearch || undefined,
    status: status || undefined,
    sortOrder,
  };

  const { data: studentsPage, isLoading, error } = useStudents(params);
  const students = studentsPage?.users;
  const { mutate: setActive }  = useSetUserActive();
  const { mutate: verifyEmail } = useVerifyUserEmail();

  async function handleExport(format: 'pdf' | 'excel', selectedKeys: string[]) {
    setExporting(true);
    try {
      const users = await fetchStudentsExport({
        search:    debouncedSearch || undefined,
        status:    status || undefined,
        sortOrder,
      });

      const activeCols = EXPORT_COLS.filter(c => selectedKeys.includes(c.key));
      const headers    = activeCols.map(c => c.label);
      const rows       = users.map(u => activeCols.map(c => c.getValue(u)));

      if (format === 'excel') {
        const { utils, writeFile } = await import('xlsx');
        const ws = utils.aoa_to_sheet([headers, ...rows]);
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, 'Students');
        writeFile(wb, 'students.xlsx');
      } else {
        const { default: jsPDF }    = await import('jspdf');
        const { default: autoTable } = await import('jspdf-autotable');
        const doc = new jsPDF({ orientation: 'landscape' });
        doc.setFont('helvetica');
        doc.setFontSize(14);
        doc.text('Students', 14, 16);
        doc.setFontSize(9);
        doc.setTextColor(120);
        const filterStr = [
          debouncedSearch && `Search: "${debouncedSearch}"`,
          status && `Status: ${status}`,
        ].filter(Boolean).join('  ·  ');
        doc.text(
          `Exported ${new Date().toLocaleDateString()}  ·  ${users.length} records${filterStr ? `  ·  ${filterStr}` : ''}`,
          14, 22,
        );
        autoTable(doc, {
          startY: 28,
          head: [headers],
          body: rows,
          styles: { fontSize: 9, cellPadding: 4 },
          headStyles: { fillColor: [61, 0, 107], textColor: 255, fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [249, 250, 251] },
        });
        doc.save('students.pdf');
      }

      setExportOpen(false);
    } catch {
      toast.error('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  }

  function buildRow(u: AdminUser): Record<string, CellValue> {
    return {
      id: u.id,
      user: (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#3D006B]/10 flex items-center justify-center shrink-0">
            <span className="font-heading font-bold text-xs text-[#3D006B]">
              {u.firstName[0]?.toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-body text-sm font-medium text-[#0F0F0F]">{u.firstName} {u.lastName}</p>
            <p className="font-body text-xs text-[#9CA3AF]">{u.email}</p>
          </div>
        </div>
      ),
      status:        <Badge variant={u.isActive ? 'success' : 'warning'}>{u.isActive ? 'Active' : 'Inactive'}</Badge>,
      emailVerified: <Badge variant={u.emailVerified ? 'success' : 'warning'}>{u.emailVerified ? 'Verified' : 'Unverified'}</Badge>,
      lastLoggedIn:  formatDate(u.lastLoggedIn),
      joined:        formatDate(u.createdAt),
      actions: (
        <div className="flex items-center gap-2">
          {!u.emailVerified && (
            <button
              onClick={() => verifyEmail(u.id)}
              className="font-body text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors text-emerald-700 border-emerald-200 hover:bg-emerald-50"
            >
              Verify Email
            </button>
          )}
          <button
            onClick={() => setActive({ userId: u.id, isActive: !u.isActive })}
            className={cn(
              'font-body text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors',
              u.isActive
                ? 'text-red-600 border-red-200 hover:bg-red-50'
                : 'text-[#3D006B] border-[#3D006B]/20 hover:bg-[#3D006B]/5',
            )}
          >
            {u.isActive ? 'Deactivate' : 'Activate'}
          </button>
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
          activeStatus={status ?? ''}
        />
      )}

      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="font-heading font-black text-2xl text-[#0F0F0F]">Students</h1>
            <p className="font-body text-sm text-[#6B7280] mt-1">Manage student accounts.</p>
          </div>
          <Button variant="secondary" size="md" onClick={() => setExportOpen(true)}>
            <Download size={14} className="mr-1.5" />
            Export
          </Button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 min-w-0">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search by name or email…"
              value={rawSearch}
              onChange={(e) => setRawSearch(e.target.value)}
              className={cn(
                'font-body text-sm w-full pl-9 pr-4 py-2 rounded-lg border border-[#E5E7EB] bg-white text-[#0F0F0F]',
                'placeholder-[#9CA3AF] outline-none transition-all',
                'focus:border-[#3D006B] focus:ring-2 focus:ring-[#3D006B]/10',
              )}
            />
          </div>
          <Select
            options={[
              { value: 'active',   label: 'Active'   },
              { value: 'inactive', label: 'Inactive' },
            ]}
            value={status || null}
            onChange={(v) => setStatus(v as UsersParams['status'])}
            placeholder="All Statuses"
            isClearable
          />
          <button
            onClick={() => setSortOrder((s) => (s === 'desc' ? 'asc' : 'desc'))}
            className={cn(
              'font-body text-sm text-[#374151] bg-white border border-[#E5E7EB] rounded-lg',
              'px-3 py-2 outline-none cursor-pointer transition-colors flex items-center gap-1.5',
              'hover:border-[#3D006B]/40',
            )}
          >
            Joined
            <span className="flex flex-col gap-px">
              <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor" className={sortOrder === 'asc' ? 'text-[#3D006B]' : 'text-[#D1D5DB]'}>
                <path d="M4 0L8 8H0L4 0Z" />
              </svg>
              <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor" className={sortOrder === 'desc' ? 'text-[#3D006B]' : 'text-[#D1D5DB]'}>
                <path d="M4 8L0 0H8L4 8Z" />
              </svg>
            </span>
          </button>
        </div>

        {isLoading && <PageLoader type="list" />}

        {error && (
          <p className="font-body text-sm text-red-500 bg-red-50 px-4 py-3 rounded-lg">
            Failed to load students. Please try again.
          </p>
        )}

        {!isLoading && !error && students?.length === 0 && (
          <div className="text-center py-16">
            <p className="font-body text-[#6B7280]">No students found.</p>
          </div>
        )}

        {students && students.length > 0 && (
          <Table
            columns={columns}
            rows={students.map(buildRow)}
            rowKey={(row) => row.id as string}
          />
        )}
      </div>
    </>
  );
}

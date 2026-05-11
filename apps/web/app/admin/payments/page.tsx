"use client";

import { useState } from "react";
import {
  useAdminPayments,
  type PaymentStatus,
  type PaymentType,
  type AdminPayment,
} from "@/hooks/queries/payments";
import { Badge, PageLoader, Select, Table } from "@/components/ui";
import type { Column, CellValue, SelectOption } from "@/components/ui";

const LIMIT = 20;

const STATUS_OPTIONS: SelectOption[] = [
  { value: "PENDING", label: "Pending" },
  { value: "PAID", label: "Paid" },
  { value: "FAILED", label: "Failed" },
  { value: "EXPIRED", label: "Expired" },
];

const TYPE_OPTIONS: SelectOption[] = [
  { value: "COURSE_ACCESS", label: "Course Access" },
  { value: "CERTIFICATE", label: "Certificate" },
];

const COLUMNS: Column[] = [
  { key: "date", header: "Date" },
  { key: "student", header: "Student" },
  { key: "course", header: "Course" },
  { key: "type", header: "Type" },
  { key: "amount", header: "Amount (RWF)" },
  { key: "provider", header: "Provider" },
  { key: "status", header: "Status" },
  { key: "paidAt", header: "Paid At" },
];

function statusBadge(status: PaymentStatus): React.ReactElement {
  const map: Record<PaymentStatus, { variant: "success" | "warning" | "danger" | "gray"; label: string }> = {
    PAID: { variant: "success", label: "Paid" },
    PENDING: { variant: "warning", label: "Pending" },
    FAILED: { variant: "danger", label: "Failed" },
    EXPIRED: { variant: "gray", label: "Expired" },
  };
  const { variant, label } = map[status];
  return <Badge variant={variant}>{label}</Badge>;
}

function toRow(p: AdminPayment): Record<string, CellValue> {
  return {
    id: p.id,
    date: new Date(p.createdAt).toLocaleDateString("en-RW", { day: "2-digit", month: "short", year: "numeric" }),
    student: (
      <div>
        <p className="font-body text-sm text-foreground font-medium">{p.user.firstName} {p.user.lastName}</p>
        <p className="font-body text-xs text-muted">{p.user.email}</p>
      </div>
    ),
    course: p.course.title,
    type: p.type === "COURSE_ACCESS" ? "Course" : "Certificate",
    amount: `RWF ${p.amount.toLocaleString()}`,
    provider: p.paymentProvider ?? "—",
    status: statusBadge(p.status),
    paidAt: p.paidAt
      ? new Date(p.paidAt).toLocaleDateString("en-RW", { day: "2-digit", month: "short", year: "numeric" })
      : "—",
  };
}

export default function AdminPaymentsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<PaymentStatus | undefined>();
  const [type, setType] = useState<PaymentType | undefined>();

  const { data, isLoading } = useAdminPayments({ page, limit: LIMIT, status, type });
  const totalPages = data ? Math.ceil(data.total / LIMIT) : 0;
  const rows = data?.payments.map(toRow) ?? [];

  return (
    <div className="p-6 lg:p-10 flex flex-col gap-6">
      <div>
        <h1 className="font-heading font-black text-2xl text-foreground">Payments</h1>
        <p className="font-body text-sm text-muted mt-1">
          All payment records for compliance and dispute resolution.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="w-44">
          <Select
            options={STATUS_OPTIONS}
            value={status ?? null}
            onChange={(v) => { setStatus(v as PaymentStatus | undefined); setPage(1); }}
            placeholder="All statuses"
            isClearable
          />
        </div>
        <div className="w-44">
          <Select
            options={TYPE_OPTIONS}
            value={type ?? null}
            onChange={(v) => { setType(v as PaymentType | undefined); setPage(1); }}
            placeholder="All types"
            isClearable
          />
        </div>
        {data && (
          <span className="font-body text-sm text-muted ml-auto">
            {data.total} record{data.total !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {isLoading ? (
        <PageLoader type="list" />
      ) : (
        <Table
          columns={COLUMNS}
          rows={rows}
          rowKey={(r) => String(r.id)}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button, Badge, PageLoader, Table, Select } from "@/components/ui";
import type { Column, CellValue } from "@/components/ui";
import {
  useAdmins,
  useSetUserActive,
  AdminUser,
  UsersParams,
} from "@/hooks/queries/users";
import AddAdminModal from "./components/AddAdminModal";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useDebounce } from "@/hooks/useDebounce";

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

const columns: Column[] = [
  { key: "user", header: "Admin" },
  { key: "status", header: "Status" },
  { key: "lastLoggedIn", header: "Last login" },
  { key: "joined", header: "Joined" },
  { key: "actions", header: "" },
];

export default function AdminsPage() {
  const [showModal, setShowModal] = useState(false);
  const [rawSearch, setRawSearch] = useState("");
  const [status, setStatus] = useState<UsersParams["status"]>("");
  const debouncedSearch = useDebounce(rawSearch.trim(), 350);

  const params: UsersParams = {
    search: debouncedSearch || undefined,
    status: status || undefined,
  };

  const { user: currentUser } = useAuth();
  const { data: adminsPage, isLoading, error } = useAdmins(params);
  const admins = adminsPage?.users;
  const { mutate: setActive } = useSetUserActive();

  function buildRow(u: AdminUser): Record<string, CellValue> {
    const isSelf = u.id === currentUser?.id;
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
      status: (
        <Badge variant={u.isActive ? "success" : "warning"}>
          {u.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
      lastLoggedIn: formatDate(u.lastLoggedIn),
      joined: formatDate(u.createdAt),
      actions: (
        <Button
          variant={u.isActive ? "danger" : "secondary"}
          onClick={() => setActive({ userId: u.id, isActive: !u.isActive })}
          className="text-xs py-1.5 px-3"
          disabled={isSelf && u.isActive}
          title={
            isSelf && u.isActive
              ? "You cannot deactivate your own account"
              : undefined
          }
        >
          {u.isActive ? "Deactivate" : "Activate"}
        </Button>
      ),
    };
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-heading font-black text-2xl text-foreground">
            Admins
          </h1>
          <p className="font-body text-sm text-muted mt-1">
            Manage admin accounts.
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          Add Admin
        </Button>
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
      </div>

      {isLoading && <PageLoader type="list" />}

      {error && (
        <p className="font-body text-sm text-red-500 bg-red-50 px-4 py-3 rounded-lg">
          Failed to load admins. Please try again.
        </p>
      )}

      {!isLoading && !error && admins?.length === 0 && (
        <div className="text-center py-16">
          <p className="font-body text-muted">No admins found.</p>
        </div>
      )}

      {admins && admins.length > 0 && (
        <Table
          columns={columns}
          rows={admins.map(buildRow)}
          rowKey={(row) => row.id as string}
        />
      )}

      {showModal && <AddAdminModal onClose={() => setShowModal(false)} />}
    </div>
  );
}

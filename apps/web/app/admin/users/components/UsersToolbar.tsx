"use client";

import { UsersParams } from "@/hooks/queries/users";
import { Select } from "@/components/ui";
import { cn } from "@/lib/utils";

interface UsersToolbarProps {
  params: UsersParams;
  onChange: (next: Partial<UsersParams>) => void;
}

const roleOptions = [
  { value: "student", label: "Student" },
  { value: "admin", label: "Admin" },
];

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export default function UsersToolbar({ params, onChange }: UsersToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search */}
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
          value={params.search ?? ""}
          onChange={(e) => onChange({ search: e.target.value })}
          className={cn(
            "font-body text-sm w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-white text-foreground",
            "placeholder:text-muted-contrast outline-none transition-all",
            "focus:border-primary focus:ring-2 focus:ring-primary/10",
          )}
        />
      </div>

      <Select
        options={roleOptions}
        value={params.role || null}
        onChange={(v) => onChange({ role: v as UsersParams["role"] })}
        placeholder="All Roles"
        isClearable
      />

      <Select
        options={statusOptions}
        value={params.status || null}
        onChange={(v) => onChange({ status: v as UsersParams["status"] })}
        placeholder="All Statuses"
        isClearable
      />
    </div>
  );
}

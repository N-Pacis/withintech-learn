"use client";

import { useState, useCallback } from "react";
import { PageLoader } from "@/components/ui";
import { useUsers, useSetUserActive, UsersParams } from "@/hooks/queries/users";
import UserRow from "./components/UserRow";
import UsersToolbar from "./components/UsersToolbar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useDebounce } from "@/hooks/useDebounce";

export default function UsersPage() {
  const [rawSearch, setRawSearch] = useState("");
  const [role, setRole] = useState<UsersParams["role"]>("");
  const [status, setStatus] = useState<UsersParams["status"]>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const debouncedSearch = useDebounce(rawSearch.trim(), 350);

  const params: UsersParams = {
    search: debouncedSearch || undefined,
    role: role || undefined,
    status: status || undefined,
    sortOrder,
  };

  const { user: currentUser } = useAuth();
  const { data: usersPage, isLoading, error } = useUsers(params);
  const users = usersPage?.users;
  const { mutateAsync: setActive } = useSetUserActive();

  const handleToggle = useCallback(
    async (userId: string, isActive: boolean) => {
      await setActive({ userId, isActive });
    },
    [setActive],
  );

  function handleToolbarChange(next: Partial<UsersParams>) {
    if ("search" in next) setRawSearch(next.search ?? "");
    if ("role" in next) setRole(next.role);
    if ("status" in next) setStatus(next.status);
  }

  const toolbarParams: UsersParams = {
    search: rawSearch,
    role,
    status,
    sortOrder,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading font-black text-2xl text-foreground">
          Users
        </h1>
        <p className="font-body text-sm text-muted mt-1">
          Manage student accounts and access.
        </p>
      </div>

      {/* Toolbar */}
      <div className="mb-6">
        <UsersToolbar params={toolbarParams} onChange={handleToolbarChange} />
      </div>

      {isLoading && <PageLoader type="list" />}

      {error && (
        <p className="font-body text-sm text-red-500 bg-red-50 px-4 py-3 rounded-lg">
          Failed to load users. Please try again.
        </p>
      )}

      {!isLoading && !error && users && users.length === 0 && (
        <div className="text-center py-16">
          <p className="font-body text-muted">No users found.</p>
        </div>
      )}

      {users && users.length > 0 && (
        <div className="bg-white rounded-xl ring-1 ring-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-border bg-surface-panel">
                  <th className="px-6 py-3 text-left font-body text-xs font-semibold text-muted uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left font-body text-xs font-semibold text-muted uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left font-body text-xs font-semibold text-muted uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left font-body text-xs font-semibold text-muted uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() =>
                        setSortOrder((s) => (s === "desc" ? "asc" : "desc"))
                      }
                      className={cn(
                        "flex items-center gap-1.5 font-body text-xs font-semibold uppercase tracking-wider transition-colors",
                        "text-muted hover:text-primary",
                      )}
                    >
                      Joined
                      <span className="flex flex-col gap-px">
                        <svg
                          width="8"
                          height="8"
                          viewBox="0 0 8 8"
                          fill="currentColor"
                          className={
                            sortOrder === "asc"
                              ? "text-primary"
                              : "text-border-strong"
                          }
                        >
                          <path d="M4 0L8 8H0L4 0Z" />
                        </svg>
                        <svg
                          width="8"
                          height="8"
                          viewBox="0 0 8 8"
                          fill="currentColor"
                          className={
                            sortOrder === "desc"
                              ? "text-primary"
                              : "text-border-strong"
                          }
                        >
                          <path d="M4 8L0 0H8L4 8Z" />
                        </svg>
                      </span>
                    </button>
                  </th>
                  <th className="px-6 py-3 text-right font-body text-xs font-semibold text-muted uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    currentUserId={currentUser?.id}
                    onToggle={handleToggle}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

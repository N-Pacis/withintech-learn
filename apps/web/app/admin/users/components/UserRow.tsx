"use client";

import { useState } from "react";
import { Badge, Button } from "@/components/ui";
import { AdminUser } from "@/hooks/queries/users";

interface UserRowProps {
  user: AdminUser;
  currentUserId?: string;
  onToggle: (userId: string, isActive: boolean) => Promise<void>;
}

export default function UserRow({
  user,
  currentUserId,
  onToggle,
}: UserRowProps) {
  const [loading, setLoading] = useState(false);
  const isSelf = user.id === currentUserId;

  async function handleToggle() {
    setLoading(true);
    try {
      await onToggle(user.id, !user.isActive);
    } finally {
      setLoading(false);
    }
  }

  return (
    <tr className="border-b border-border-subtle hover:bg-surface transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="font-heading font-bold text-xs text-primary">
              {user.firstName[0]?.toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-body text-sm font-medium text-foreground">
              {user.firstName} {user.lastName}
            </p>
            <p className="font-body text-xs text-muted-contrast">
              {user.email}
            </p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <Badge variant={user.role === "admin" ? "purple" : "gray"}>
          {user.role}
        </Badge>
      </td>
      <td className="px-6 py-4">
        <Badge variant={user.isActive ? "success" : "warning"}>
          {user.isActive ? "Active" : "Inactive"}
        </Badge>
      </td>
      <td className="px-6 py-4 font-body text-sm text-muted">
        {user.lastLoggedIn ? (
          new Date(user.lastLoggedIn).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        ) : (
          <span className="text-border-strong">—</span>
        )}
      </td>
      <td className="px-6 py-4 font-body text-sm text-muted">
        {new Date(user.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </td>
      <td className="px-6 py-4 text-right">
        <Button
          variant={user.isActive ? "danger" : "secondary"}
          loading={loading}
          onClick={handleToggle}
          className="text-xs py-1.5 px-3"
          disabled={isSelf && user.isActive}
          title={
            isSelf && user.isActive
              ? "You cannot deactivate your own account"
              : undefined
          }
        >
          {user.isActive ? "Deactivate" : "Activate"}
        </Button>
      </td>
    </tr>
  );
}

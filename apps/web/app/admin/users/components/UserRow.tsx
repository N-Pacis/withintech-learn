'use client';

import { useState } from 'react';
import { Badge, Button } from '@/components/ui';
import { AdminUser } from '@/hooks/queries/users';

interface UserRowProps {
  user: AdminUser;
  onToggle: (userId: string, isActive: boolean) => Promise<void>;
}

export default function UserRow({ user, onToggle }: UserRowProps) {
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    try {
      await onToggle(user.id, !user.isActive);
    } finally {
      setLoading(false);
    }
  }

  return (
    <tr className="border-b border-[#F3F4F6] hover:bg-[#FAFAFA] transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#3D006B]/10 flex items-center justify-center flex-shrink-0">
            <span className="font-heading font-bold text-xs text-[#3D006B]">
              {user.firstName[0]?.toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-body text-sm font-medium text-[#0F0F0F]">
              {user.firstName} {user.lastName}
            </p>
            <p className="font-body text-xs text-[#9CA3AF]">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <Badge variant={user.role === 'admin' ? 'purple' : 'gray'}>
          {user.role}
        </Badge>
      </td>
      <td className="px-6 py-4">
        <Badge variant={user.isActive ? 'success' : 'warning'}>
          {user.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </td>
      <td className="px-6 py-4 font-body text-sm text-[#6B7280]">
        {user.lastLoggedIn
          ? new Date(user.lastLoggedIn).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
          : <span className="text-[#D1D5DB]">—</span>}
      </td>
      <td className="px-6 py-4 font-body text-sm text-[#6B7280]">
        {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
      </td>
      <td className="px-6 py-4 text-right">
        <Button
          variant={user.isActive ? 'danger' : 'secondary'}
          loading={loading}
          onClick={handleToggle}
          className="text-xs py-1.5 px-3"
        >
          {user.isActive ? 'Deactivate' : 'Activate'}
        </Button>
      </td>
    </tr>
  );
}

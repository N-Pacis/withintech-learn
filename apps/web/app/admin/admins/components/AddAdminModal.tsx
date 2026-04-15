"use client";

import { useState } from "react";
import { Button, Input, FormField } from "@/components/ui";
import { useCreateAdmin } from "@/hooks/queries/users";
import { toast } from "sonner";

interface AddAdminModalProps {
  onClose: () => void;
}

export default function AddAdminModal({ onClose }: AddAdminModalProps) {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "" });
  const { mutateAsync: createAdmin, isPending } = useCreateAdmin();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await createAdmin(form);
    toast.success("Admin account created");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-surface-card rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading font-bold text-lg text-foreground">
            Add Admin
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-contrast hover:text-foreground hover:text-foreground hover:bg-surface-muted hover:bg-surface-subtle transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex gap-3">
            <FormField label="First name" className="flex-1">
              <Input
                placeholder="Jane"
                value={form.firstName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, firstName: e.target.value }))
                }
                required
              />
            </FormField>
            <FormField label="Last name" className="flex-1">
              <Input
                placeholder="Doe"
                value={form.lastName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, lastName: e.target.value }))
                }
                required
              />
            </FormField>
          </div>
          <FormField label="Email address">
            <Input
              type="email"
              placeholder="jane@example.com"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              required
            />
          </FormField>
          <p className="font-body text-xs text-muted-contrast">
            A temporary password will be auto-generated. The invited user will
            receive an email with instructions to set their password and log in.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={isPending}>
              Create Admin
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export interface InvitationRow {
  rowIndex: number;
  firstName: string;
  lastName: string;
  email: string;
  status: "sent" | "skipped" | "failed";
  reason?: string;
}

export interface SendInvitationsResult {
  sent: number;
  skipped: number;
  failed: number;
  rows: InvitationRow[];
}

export function useSendInvitations() {
  return useMutation({
    mutationFn: async (file: File): Promise<SendInvitationsResult> => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await apiFetch<SendInvitationsResult>(
        "/admin/invitations/send",
        {
          method: "POST",
          body: formData,
        },
      );
      if (!res.success || !res.data)
        throw new Error(res.message ?? "Failed to send invitations");
      return res.data;
    },
  });
}

import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export interface ReminderRow {
  rowIndex: number;
  firstName: string;
  lastName: string;
  email: string;
  status: "sent" | "skipped" | "failed";
  reason?: string;
}

export interface SendRemindersResult {
  sent: number;
  skipped: number;
  failed: number;
  rows: ReminderRow[];
}

export interface SendRemindersInput {
  subject: string;
  body: string;
  file: File;
}

export function useSendReminders() {
  return useMutation({
    mutationFn: async (input: SendRemindersInput): Promise<SendRemindersResult> => {
      const formData = new FormData();
      formData.append("file", input.file);
      formData.append("subject", input.subject);
      formData.append("body", input.body);

      const res = await apiFetch<SendRemindersResult>(
        "/admin/reminders/send",
        {
          method: "POST",
          body: formData,
        },
      );
      if (!res.success || !res.data)
        throw new Error(res.message ?? "Failed to send reminders");
      return res.data;
    },
  });
}

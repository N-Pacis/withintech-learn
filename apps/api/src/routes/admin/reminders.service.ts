import { prisma } from "../../db/prisma";
import { sendEmail } from "../../services/email.service";
import { reminderEmailTemplate } from "../../templates/reminder-email";

export interface ReminderRow {
  firstName: string;
  lastName: string;
  email: string;
}

export interface SendRemindersResult {
  sent: number;
  skipped: number;
  failed: number;
  rows: {
    rowIndex: number;
    firstName: string;
    lastName: string;
    email: string;
    status: "sent" | "skipped" | "failed";
    reason?: string;
  }[];
}

export const sendReminders = async (
  rows: ReminderRow[],
  subject: string,
  bodyTemplate: string,
  sentById: string,
): Promise<SendRemindersResult> => {
  const result: SendRemindersResult = {
    sent: 0,
    skipped: 0,
    failed: 0,
    rows: [],
  };

  for (let i = 0; i < rows.length; i++) {
    const { firstName, lastName, email } = rows[i];
    const rowIndex = i + 1;

    const normalizedEmail = email.trim().toLowerCase();

    // Validate required fields
    if (!firstName?.trim() || !lastName?.trim() || !normalizedEmail) {
      result.failed++;
      result.rows.push({
        rowIndex,
        firstName,
        lastName,
        email,
        status: "failed",
        reason: "Missing required fields",
      });
      continue;
    }

    // Check if email is valid format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      result.failed++;
      result.rows.push({
        rowIndex,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: normalizedEmail,
        status: "failed",
        reason: "Invalid email format",
      });
      continue;
    }

    // CRITICAL DIFFERENCE: Check if user EXISTS (not if they don't exist)
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, firstName: true, lastName: true },
    });

    if (!existing) {
      result.skipped++;
      result.rows.push({
        rowIndex,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: normalizedEmail,
        status: "skipped",
        reason: "User not registered - invite them instead",
      });
      continue;
    }

    // Substitute placeholders
    const personalizedBody = bodyTemplate
      .replace(/\[First Name\]/gi, firstName.trim())
      .replace(/\[Last Name\]/gi, lastName.trim())
      .replace(/\[Email\]/gi, normalizedEmail);

    // Send reminder email
    try {
      await sendEmail({
        to: normalizedEmail,
        subject: subject,
        html: reminderEmailTemplate({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          body: personalizedBody,
        }),
      });

      result.sent++;
      result.rows.push({
        rowIndex,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: normalizedEmail,
        status: "sent",
      });
    } catch (error) {
      result.failed++;
      result.rows.push({
        rowIndex,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: normalizedEmail,
        status: "failed",
        reason: "Failed to send email",
      });
    }
  }

  void sentById; // Future: activity logging

  return result;
};

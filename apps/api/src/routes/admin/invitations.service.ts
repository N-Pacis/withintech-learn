import { prisma } from "../../db/prisma";
import { sendEmail } from "../../services/email.service";
import { invitationEmailTemplate } from "../../templates/invitation-email";

export interface InvitationRow {
  firstName: string;
  lastName: string;
  email: string;
}

export interface SendInvitationsResult {
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

export const sendInvitations = async (
  rows: InvitationRow[],
  sentById: string,
): Promise<SendInvitationsResult> => {
  const result: SendInvitationsResult = {
    sent: 0,
    skipped: 0,
    failed: 0,
    rows: [],
  };

  const webUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://learn.withintech.org";
  const signupUrl = `${webUrl}/sign-up`;

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

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      result.skipped++;
      result.rows.push({
        rowIndex,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: normalizedEmail,
        status: "skipped",
        reason: "User already registered",
      });
      continue;
    }

    // Send invitation email
    try {
      await sendEmail({
        to: normalizedEmail,
        subject: "You're invited to join WithinTech Learn",
        html: invitationEmailTemplate({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          signupUrl,
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

  // Log activity (optional - can be extended to track invitations)
  void sentById;

  return result;
};

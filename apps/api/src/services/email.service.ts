import nodemailer from 'nodemailer';
import { paymentReceiptEmailTemplate } from '../templates/payment-receipt-email';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT ?? '587', 10),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = ({ to, subject, html }: SendEmailOptions): Promise<void> =>
  transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, html }).then(() => undefined);

export const sendReceiptEmail = ({
  firstName,
  lastName,
  email,
  courseTitle,
  courseSlug,
  userId,
  type,
  amount,
  refid,
  paidAt,
}: {
  firstName: string;
  lastName: string;
  email: string;
  courseTitle: string;
  courseSlug: string;
  userId: string;
  type: "COURSE_ACCESS" | "CERTIFICATE";
  amount: number;
  refid: string;
  paidAt: Date;
}): Promise<void> => {
  const appUrl = process.env.APP_URL ?? "https://learn.withintech.org";
  const courseUrl =
    type === "COURSE_ACCESS"
      ? `${appUrl}/learn/courses/${courseSlug}`
      : `${appUrl}/certificates/${userId}/${courseSlug}`;

  return sendEmail({
    to: email,
    subject: `Payment Receipt — ${courseTitle}`,
    html: paymentReceiptEmailTemplate({
      firstName,
      lastName,
      email,
      courseTitle,
      type,
      amount,
      refid,
      paidAt,
      courseUrl,
    }),
  });
};

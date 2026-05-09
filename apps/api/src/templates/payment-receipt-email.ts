interface PaymentReceiptEmailOptions {
  firstName: string;
  lastName: string;
  email: string;
  courseTitle: string;
  type: "COURSE_ACCESS" | "CERTIFICATE";
  amount: number;
  refid: string;
  paidAt: Date;
  courseUrl: string;
}

export const paymentReceiptEmailTemplate = ({
  firstName,
  lastName,
  courseTitle,
  type,
  amount,
  refid,
  paidAt,
  courseUrl,
}: PaymentReceiptEmailOptions): string => {
  const itemLabel = type === "COURSE_ACCESS" ? "Course Access" : "Certificate";
  const formattedDate = paidAt.toLocaleDateString("en-RW", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const ctaLabel = type === "COURSE_ACCESS" ? "Start Learning" : "View Certificate";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Payment Receipt — WithinTech Learn</title>
</head>
<body style="margin:0;padding:0;background:#F3F4F6;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F3F4F6;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #E5E7EB;">

          <!-- Header -->
          <tr>
            <td style="background:#3D006B;padding:28px 32px;">
              <p style="margin:0;font-size:20px;font-weight:800;color:#ffffff;letter-spacing:-0.3px;">WithinTech Learn</p>
              <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.65);">Payment Receipt</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 20px;font-size:15px;font-weight:700;color:#0F0F0F;">Hi ${firstName} ${lastName},</p>

              <p style="margin:0 0 20px;font-size:14px;color:#6B7280;line-height:1.7;">
                Your payment was successful. Here is your receipt.
              </p>

              <!-- Receipt table -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;border:1px solid #E5E7EB;border-radius:8px;overflow:hidden;">
                <tr style="background:#F9FAFB;">
                  <td colspan="2" style="padding:12px 16px;font-size:11px;font-weight:700;color:#6B7280;letter-spacing:0.8px;text-transform:uppercase;border-bottom:1px solid #E5E7EB;">
                    Order Details
                  </td>
                </tr>
                <tr style="border-bottom:1px solid #F3F4F6;">
                  <td style="padding:12px 16px;font-size:13px;color:#6B7280;">Item</td>
                  <td style="padding:12px 16px;font-size:13px;color:#0F0F0F;font-weight:600;text-align:right;">${itemLabel}</td>
                </tr>
                <tr style="border-bottom:1px solid #F3F4F6;">
                  <td style="padding:12px 16px;font-size:13px;color:#6B7280;">Course</td>
                  <td style="padding:12px 16px;font-size:13px;color:#0F0F0F;font-weight:600;text-align:right;">${courseTitle}</td>
                </tr>
                <tr style="border-bottom:1px solid #F3F4F6;">
                  <td style="padding:12px 16px;font-size:13px;color:#6B7280;">Date</td>
                  <td style="padding:12px 16px;font-size:13px;color:#0F0F0F;text-align:right;">${formattedDate}</td>
                </tr>
                <tr style="border-bottom:1px solid #F3F4F6;">
                  <td style="padding:12px 16px;font-size:13px;color:#6B7280;">Reference</td>
                  <td style="padding:12px 16px;font-size:13px;color:#0F0F0F;font-family:monospace;text-align:right;">${refid}</td>
                </tr>
                <tr style="background:#F9FAFB;">
                  <td style="padding:14px 16px;font-size:14px;font-weight:700;color:#0F0F0F;">Total Paid</td>
                  <td style="padding:14px 16px;font-size:16px;font-weight:800;color:#3D006B;text-align:right;">RWF ${amount.toLocaleString()}</td>
                </tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <a href="${courseUrl}"
                       style="display:inline-block;background:#3D006B;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:16px 40px;border-radius:8px;letter-spacing:0.2px;">
                      ${ctaLabel}
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;font-size:13px;color:#6B7280;line-height:1.6;">
                Keep this email as proof of purchase. If you have any questions, reply to this email or contact our support team.
              </p>

              <p style="margin:20px 0 0;font-size:13px;color:#374151;font-weight:600;">Team WithinTech</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="border-top:1px solid #F3F4F6;padding:16px 32px;">
              <p style="margin:0;font-size:11px;color:#9CA3AF;">© WithinTech Learn · learn.withintech.org</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
};

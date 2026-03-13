interface OtpEmailOptions {
  firstName: string;
  otp: string;
  purposeLabel: string;
}

export const otpEmailTemplate = ({ firstName, otp, purposeLabel }: OtpEmailOptions): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${purposeLabel}</title>
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
              <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.65);">${purposeLabel}</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 8px;font-size:15px;color:#374151;">Hi ${firstName},</p>
              <p style="margin:0 0 28px;font-size:14px;color:#6B7280;line-height:1.6;">
                Use the code below to complete your ${purposeLabel.toLowerCase()}. It expires in <strong style="color:#0F0F0F;">10 minutes</strong>.
              </p>

              <!-- OTP box -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:12px;padding:24px 0;">
                    <p style="margin:0;font-size:40px;font-weight:800;letter-spacing:16px;color:#3D006B;font-family:monospace;">${otp}</p>
                  </td>
                </tr>
              </table>

              <p style="margin:28px 0 0;font-size:12px;color:#9CA3AF;line-height:1.6;">
                If you did not request this, you can safely ignore this email. Do not share this code with anyone.
              </p>
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

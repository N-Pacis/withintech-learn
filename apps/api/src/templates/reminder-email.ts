interface ReminderEmailOptions {
  firstName: string;
  lastName: string;
  body: string; // Already substituted
}

export const reminderEmailTemplate = ({
  firstName,
  lastName,
  body,
}: ReminderEmailOptions): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reminder from WithinTech Learn</title>
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
              <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.65);">Important Reminder</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 8px;font-size:15px;color:#374151;">Hi ${firstName} ${lastName},</p>
              
              <!-- Dynamic Content (admin's body with placeholders substituted) -->
              <div style="margin:24px 0;font-size:14px;color:#374151;line-height:1.6;white-space:pre-line;">
                ${body.replace(/\n/g, '<br/>')}
              </div>

              <p style="margin:28px 0 0;font-size:12px;color:#9CA3AF;line-height:1.6;">
                If you have any questions, please reply to this email or contact support.
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

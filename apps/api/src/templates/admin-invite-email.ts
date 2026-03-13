interface AdminInviteEmailOptions {
  firstName: string;
  invitedByFullName: string;
}

export const adminInviteEmailTemplate = ({ firstName, invitedByFullName }: AdminInviteEmailOptions): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You've been invited to WithinTech Learn</title>
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
              <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.65);">Admin Invitation</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 8px;font-size:15px;color:#374151;">Hi ${firstName},</p>
              <p style="margin:0 0 24px;font-size:14px;color:#6B7280;line-height:1.6;">
                <strong style="color:#0F0F0F;">${invitedByFullName}</strong> has invited you to join
                <strong style="color:#0F0F0F;">WithinTech Learn</strong> as an administrator.
                Your account has been created and is ready to use.
              </p>

              <!-- Steps box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 14px;font-size:13px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.5px;">Getting started</p>
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:5px 0;">
                          <span style="display:inline-block;width:22px;height:22px;background:#3D006B;border-radius:50%;text-align:center;line-height:22px;font-size:11px;font-weight:700;color:#fff;margin-right:10px;">1</span>
                          <span style="font-size:14px;color:#374151;">Click the button below to go to the login page</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:5px 0;">
                          <span style="display:inline-block;width:22px;height:22px;background:#3D006B;border-radius:50%;text-align:center;line-height:22px;font-size:11px;font-weight:700;color:#fff;margin-right:10px;">2</span>
                          <span style="font-size:14px;color:#374151;">Click <strong style="color:#0F0F0F;">Forgot password</strong> on the login page</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:5px 0;">
                          <span style="display:inline-block;width:22px;height:22px;background:#3D006B;border-radius:50%;text-align:center;line-height:22px;font-size:11px;font-weight:700;color:#fff;margin-right:10px;">3</span>
                          <span style="font-size:14px;color:#374151;">Reset and choose your password</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:5px 0;">
                          <span style="display:inline-block;width:22px;height:22px;background:#3D006B;border-radius:50%;text-align:center;line-height:22px;font-size:11px;font-weight:700;color:#fff;margin-right:10px;">4</span>
                          <span style="font-size:14px;color:#374151;">Log in with your email and new password</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://learn.withintech.org/forgot-password"
                       style="display:inline-block;background:#3D006B;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:8px;">
                      Set Up My Account
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:28px 0 0;font-size:12px;color:#9CA3AF;line-height:1.6;">
                If you were not expecting this invitation or believe this was sent in error, you can safely ignore this email.
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

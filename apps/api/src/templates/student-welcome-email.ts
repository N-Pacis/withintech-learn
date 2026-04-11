interface StudentWelcomeEmailOptions {
  firstName: string;
  lastName: string;
  magicLoginUrl: string;
}

export const studentWelcomeEmailTemplate = ({
  firstName,
  lastName,
  magicLoginUrl,
}: StudentWelcomeEmailOptions): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You're invited to WithinTech Learn</title>
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
              <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.65);">Weekly Challenges Beta — You're Invited</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 20px;font-size:15px;font-weight:700;color:#0F0F0F;">Hi ${firstName} ${lastName},</p>

              <p style="margin:0 0 16px;font-size:14px;color:#6B7280;line-height:1.7;">
                Greetings from <strong style="color:#0F0F0F;">WithinTech</strong>!
              </p>

              <p style="margin:0 0 16px;font-size:14px;color:#6B7280;line-height:1.7;">
                You've been personally invited to join the <strong style="color:#0F0F0F;">WithinTech Learn Platform</strong> and take part in our
                <strong style="color:#0F0F0F;">Weekly Challenges Beta</strong> where developers compete on exciting challenges,
                sharpen their skills, and win prizes every week.
              </p>

              <p style="margin:0 0 16px;font-size:14px;color:#6B7280;line-height:1.7;">
                This is your chance to step in, stand out, and prove what you can do.
              </p>

              <p style="margin:0 0 8px;font-size:14px;color:#6B7280;line-height:1.7;">
                Click the button below to get started and activate your account.
              </p>

              <p style="margin:0 0 28px;font-size:14px;color:#6B7280;line-height:1.7;">
                Don't hesitate — this is your moment.<br />
                Let's see what you've got.<br />
                <strong style="color:#0F0F0F;">Welcome to the challenge.</strong>
              </p>

              <!-- CTA button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <a href="${magicLoginUrl}"
                       style="display:inline-block;background:#3D006B;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:16px 40px;border-radius:8px;letter-spacing:0.2px;">
                      Let's Get Started
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:13px;color:#374151;font-weight:600;">Team WithinTech</p>

              <p style="margin:20px 0 0;font-size:11px;color:#9CA3AF;line-height:1.6;">
                This link is valid for 7 days. If you were not expecting this invitation, you can safely ignore this email.
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

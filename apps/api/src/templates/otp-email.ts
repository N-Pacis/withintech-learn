interface OtpEmailOptions {
  firstName: string;
  otp: string;
  purposeLabel: string;
}

export const otpEmailTemplate = ({ firstName, otp, purposeLabel }: OtpEmailOptions): string => `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #333;">
  <h2 style="margin-bottom: 16px;">${purposeLabel}</h2>
  <p>Hi ${firstName},</p>
  <p>Use the code below to complete your ${purposeLabel.toLowerCase()}. It expires in 10 minutes.</p>
  <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 24px 0;">${otp}</p>
  <p style="color: #666; font-size: 13px;">If you did not request this, you can safely ignore this email.</p>
</body>
</html>
`;

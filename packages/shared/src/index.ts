// ─── Allowed email domains (allowlist) ───────────────────────────────────────
// Only Gmail, Hotmail/Outlook/Live, Yahoo, and .edu addresses are accepted.

const ALLOWED_DOMAINS = new Set([
  // Gmail
  'gmail.com',
  // Microsoft (Hotmail / Outlook / Live)
  'hotmail.com', 'hotmail.co.uk', 'hotmail.fr', 'hotmail.de', 'hotmail.es',
  'hotmail.it', 'hotmail.com.br', 'hotmail.com.ar',
  'outlook.com', 'outlook.co.uk', 'outlook.es', 'outlook.fr', 'outlook.de',
  'outlook.it', 'outlook.com.br', 'outlook.com.ar',
  'live.com', 'live.co.uk', 'live.fr', 'live.de', 'live.it',
  // Yahoo
  'yahoo.com', 'yahoo.co.uk', 'yahoo.fr', 'yahoo.de', 'yahoo.es',
  'yahoo.it', 'yahoo.com.br', 'yahoo.com.ar', 'yahoo.co.jp',
]);

/**
 * Returns true when the email's domain is in the allowlist or is a .edu address.
 * Safe to call from both browser and Node — no I/O required.
 */
export function isAllowedEmail(email: string): boolean {
  const at = email.lastIndexOf('@');
  if (at === -1) return false;
  const domain = email.slice(at + 1).toLowerCase().trim();
  if (domain.endsWith('.edu')) return true;
  return ALLOWED_DOMAINS.has(domain);
}

/** @deprecated Use isAllowedEmail instead */
export function isDisposableEmail(email: string): boolean {
  return !isAllowedEmail(email);
}

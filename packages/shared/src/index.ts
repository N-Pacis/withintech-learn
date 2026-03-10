// ─── Disposable / temporary email blocklist ──────────────────────────────────
// Extend this set as new providers are discovered.
export const DISPOSABLE_EMAIL_DOMAINS = new Set([
  // ── Well-known services ────────────────────────────────────────────────────
  'mailinator.com', 'maildrop.cc', 'guerrillamail.com', 'guerrillamail.net',
  'guerrillamail.org', 'guerrillamail.biz', 'guerrillamail.de', 'guerrillamail.info',
  'guerrillamailblock.com', 'grr.la', 'sharklasers.com', 'spam4.me',
  'yopmail.com', 'yopmail.fr', 'cool.fr.nf', 'jetable.fr.nf', 'nospam.ze.tc',
  'nomail.xl.cx', 'mega.zik.dj', 'speed.1s.fr', 'courriel.fr.nf', 'moncourrier.fr.nf',
  'monemail.fr.nf', 'monmail.fr.nf',
  'tempmail.com', 'temp-mail.org', 'temp-mail.ru', 'tempinbox.com', 'tmpmail.net',
  'tmpmail.org', 'tmpeml.com', 'tempail.com', 'tempemail.net', 'tempemail.co',
  'throwawaymail.com', 'throwam.com', 'throwam.net',
  'trashmail.com', 'trashmail.at', 'trashmail.io', 'trashmail.me', 'trashmail.net',
  'trashmail.org', 'trashmailer.com', 'trashcanmail.com',
  '10minutemail.com', '10minutemail.net', '10minutemail.org', '10minutemail.co.za',
  '10minemail.com', '10mail.org',
  'dispostable.com', 'discard.email',
  'fakeinbox.com', 'fakeinbox.net', 'fakeinbox.org',
  'mailnull.com', 'spamgourmet.com', 'spamgourmet.net', 'spamgourmet.org',
  'spaml.de', 'spaml.com', 'spamfree24.org', 'antispam.de',
  'spammotel.com', 'spamhereplease.com', 'spamthisplease.com',
  'emailondeck.com', 'tempr.email',
  'getonemail.com', 'mailexpire.com', 'mailmetrash.com', 'maileater.com',
  'mail-filter.com', 'despam.it', 'mailnew.com',
  'mt2009.com', 'filzmail.com',
  'mailnesia.com', 'mailismagic.com',
  'spamfree.eu', 'spamgob.com',
  'yopmailplus.com', 'ypmail.webd.pl',
  // ── Guerrilla / one-click providers ───────────────────────────────────────
  'getnada.com', 'dispostable.com', 'spoofmail.de',
  'mailboxy.fun', 'boximail.com',
  'crazymailing.com',
  // ── 10-min / self-destructing ─────────────────────────────────────────────
  '20minutemail.com', '20minutemail.it',
  'minutemailbox.com', 'tempsky.com',
  'tempinbox.net', 'tempinbox.org',
  'onewaymail.com', 'owlpic.com',
  'throwam.com',
  // ── Burner / anonymous ────────────────────────────────────────────────────
  'burnermail.io', 'anonbox.net', 'anonymbox.com',
  'spoofmail.de', 'mailin8r.com',
  'mailseal.de', 'mailscrap.com',
  'instantemailaddress.com',
  // ── Moakt / inboxbear ─────────────────────────────────────────────────────
  'moakt.com', 'moakt.co', 'moakt.cc', 'moakt.ws',
  'inboxbear.com',
  // ── Nada / Temp variants ──────────────────────────────────────────────────
  'nada.email', 'nada.ltd',
  'tempmailo.com', 'tempmailis.com',
  'emltmp.com', 'emlpro.com',
  // ── Generator services ────────────────────────────────────────────────────
  'mailgen.biz', 'spamex.com', 'spaml.com',
  'objectmail.com', 'reallymymail.com',
  'sogetthis.com', 'suremail.info',
  // ── Common alt-TLD variants ───────────────────────────────────────────────
  'tempmail.de', 'tempmail.fr', 'tempmail.eu', 'tempmail.us',
  'jetable.com', 'jetable.net', 'jetable.org', 'jetable.fr',
  'trashmail.fr', 'trashmail.at', 'trashmail.be',
  // ── Misc known disposable ─────────────────────────────────────────────────
  'mailnull.com', 'spamfree24.de', 'spamfree24.eu', 'spamfree24.info',
  'spamfree24.net', 'spamfree24.org',
  'wegwerfmail.de', 'wegwerfmail.net', 'wegwerfmail.org',
  'killmail.com', 'killmail.net',
  'kurzepost.de', 'objectmail.com',
  'einrot.com', 'einrot.de',
  'meltmail.com', 'binkmail.com',
  'mailscrap.com', 'amilegit.com',
  'amiriindustries.com', 'anonmail.top',
  'spamwc.de', 'spamwc.ga', 'spamwc.gq', 'spamwc.ml', 'spamwc.net',
  'haltospam.com', 'trashdevil.com', 'trashdevil.de',
  'kasmail.com', 'kaspop.com',
  'liveradio.tk', 'ligsb.com',
  'yuurok.com', 'my10minutemail.com',
  'spamgob.com', 'spaminator.de',
  'get2mail.fr', 'mail-temporaire.fr',
  'filzmail.com', 'no-spam.ws',
  'nobulk.com', 'noclickemail.com',
  'nomail.pw', 'nonspam.eu', 'nonspammer.de',
  'notmailinator.com',
  'veryrealemail.com',
  'tempymail.com', 'tempvault.com',
  'spamfree.eu',
  'ieh-mail.de', 'der-kombi.de',
  'wegwerfadresse.de',
  'mailnew.com', 'mailim.de',
  'dob.jp', 'dodgeit.com',
  'hmamail.com',
]);

/**
 * Returns true when the email's domain is on the disposable blocklist.
 * Safe to call from both browser and Node — no I/O required.
 */
export function isDisposableEmail(email: string): boolean {
  const at = email.lastIndexOf('@');
  if (at === -1) return false;
  const domain = email.slice(at + 1).toLowerCase().trim();
  return DISPOSABLE_EMAIL_DOMAINS.has(domain);
}

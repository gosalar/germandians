/** Plausibility only, not verification of ownership or WhatsApp registration. */
export function toWhatsAppNumber(value: string | undefined): string {
  const digits = (value ?? '').replace(/\D/g, '');
  return /^[1-9]\d{9,14}$/.test(digits) ? digits : '';
}

/**
 * An invitation on WhatsApp's own domains: a chat.whatsapp.com group or community link, or a
 * whatsapp.com/channel/ link. Anything else gives '' and the community page shows no join link.
 */
export function toWhatsAppCommunityUrl(value: string | undefined): string {
  try {
    const url = new URL((value ?? '').trim());
    const secure = url.protocol === 'https:' && !url.username && !url.password;
    const invite = url.hostname === 'chat.whatsapp.com' && url.pathname.length > 1;
    const channel = ['whatsapp.com', 'www.whatsapp.com'].includes(url.hostname) && /^\/channel\/[^/]+/.test(url.pathname);
    return secure && (invite || channel) ? url.href : '';
  } catch {
    return '';
  }
}

/**
 * The web app URL of a deployed Google Apps Script, which writes an enquiry into its Google Sheet
 * (see README, "Google Sheets"): https://script.google.com/macros/s/<id>/exec, or
 * /a/macros/<domain>/s/<id>/exec for a Google Workspace account. Anything else gives '' and the form
 * opens an email draft. That includes the editor's /dev test URL, which only its owner can open, and
 * the spreadsheet's own address.
 */
export function toFormEndpoint(value: string | undefined): string {
  try {
    const url = new URL((value ?? '').trim());
    const secure = url.protocol === 'https:' && !url.username && !url.password && !url.port;
    const webApp = url.hostname === 'script.google.com'
      && /^\/(?:a\/macros\/[^/]+|macros)\/s\/[\w-]+\/exec$/.test(url.pathname)
      && !url.search && !url.hash;
    return secure && webApp ? url.href : '';
  } catch {
    return '';
  }
}

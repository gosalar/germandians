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

/** Public HTTPS endpoint implementing the acknowledgement contract in README. */
export function toFormEndpoint(value: string | undefined): string {
  try {
    const url = new URL((value ?? '').trim());
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : '';
  } catch {
    return '';
  }
}

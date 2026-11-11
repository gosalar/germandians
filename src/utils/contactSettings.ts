/** Plausibility only, not verification of ownership or WhatsApp registration. */
export function toWhatsAppNumber(value: string | undefined): string {
  const digits = (value ?? '').replace(/\D/g, '');
  return /^[1-9]\d{9,14}$/.test(digits) ? digits : '';
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

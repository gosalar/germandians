import { CONTACT } from '@/utils/constants';
import { siteConfig } from '@/utils/siteConfig';

export interface ProfileReviewRequest {
  name: string;
  email: string;
  whatsapp: string;
}

export type SubmitResult = 'sent' | 'error' | 'mailto';

/**
 * Sends a profile review request. With a form endpoint configured it POSTs
 * JSON; without one it opens the visitor's email app with the details filled in.
 */
export async function submitProfileReview(request: ProfileReviewRequest): Promise<SubmitResult> {
  if (!siteConfig.formEndpoint) {
    const body = [
      `Name: ${request.name}`,
      `Email: ${request.email}`,
      `WhatsApp: ${request.whatsapp}`,
      'Consent to be contacted: yes',
      '',
      'I would like a profile review.',
    ].join('\n');
    window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent('Profile review request')}&body=${encodeURIComponent(body)}`;
    return 'mailto';
  }

  try {
    const response = await fetch(siteConfig.formEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        ...request,
        consent: true,
        consentAt: new Date().toISOString(),
        source: 'germandians-website',
      }),
    });
    return response.ok ? 'sent' : 'error';
  } catch {
    return 'error';
  }
}

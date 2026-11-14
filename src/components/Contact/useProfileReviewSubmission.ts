import { useRef, useState } from 'react';

import { submitProfileReview, type ProfileReviewRequest } from '@/services/profileReview';
import { siteConfig } from '@/utils/siteConfig';

type SubmissionStatus = 'idle' | 'sending' | 'sent' | 'error' | 'timeout' | 'mailto';

export interface ProfileReviewValues {
  name: string;
  email: string;
  wa: string;
  /** "Teach me German": an interest noted with the profile review, not a lessons enquiry. */
  german: boolean;
  consent: boolean;
}

/** Status, receipt and the details locked while a profile review is in flight or already received. */
export function useProfileReviewSubmission(snapshot?: string) {
  const [status, setStatus] = useState<SubmissionStatus>('idle');
  const [receivedDate, setReceivedDate] = useState('');
  const inFlight = useRef(false);
  const [submittedRequest, setSubmittedRequest] = useState<ProfileReviewRequest | null>(null);

  // Editing after a failed or mailto submit puts the form back to its ready state.
  const onValuesChange = () => setStatus((current) => (current === 'error' || current === 'timeout' || current === 'mailto' ? 'idle' : current));

  const submit = async (values: ProfileReviewValues) => {
    if (inFlight.current || status === 'sent') return;
    inFlight.current = true;
    const request = {
      name: values.name.trim(),
      ...(values.email.trim() ? { email: values.email.trim() } : {}),
      whatsapp: values.wa.trim(),
      ...(snapshot ? { snapshot } : {}),
      ...(values.german ? { germanLessons: true as const } : {}),
    };
    setSubmittedRequest(request);
    if (siteConfig.formEndpoint) setStatus('sending');
    try {
      const result = await submitProfileReview(request);
      if (result === 'sent') setReceivedDate(new Date().toLocaleDateString('de-DE', { timeZone: 'Asia/Kolkata' }));
      setStatus(result);
    } finally {
      inFlight.current = false;
    }
  };

  const clearSubmission = () => {
    setReceivedDate('');
    setSubmittedRequest(null);
    setStatus('idle');
  };

  const locked = status === 'sending' || status === 'sent';
  const canSubmit = status === 'idle' || status === 'error' || status === 'timeout' || status === 'mailto';
  const displayedSnapshot = locked ? submittedRequest?.snapshot : snapshot;

  return {
    status,
    receivedDate,
    submittedRequest,
    onValuesChange,
    submit,
    clearSubmission,
    locked,
    canSubmit,
    displayedSnapshot,
  };
}

import { useRef, useState } from 'react';

import type { SubmitResult } from '@/services/enquiry';
import { submitGermanLessons, type GermanLessonsRequest } from '@/services/germanLessons';
import { siteConfig } from '@/utils/siteConfig';

type SubmissionStatus = 'idle' | 'sending' | SubmitResult;

export interface GermanLessonsValues {
  name: string;
  wa: string;
  email: string;
  language: string;
  purpose: string;
  experience: string;
  consent: boolean;
}

/** Status and the details locked while a German lessons enquiry is in flight or already received. */
export function useGermanLessonsSubmission() {
  const [status, setStatus] = useState<SubmissionStatus>('idle');
  const inFlight = useRef(false);
  const [submittedRequest, setSubmittedRequest] = useState<GermanLessonsRequest | null>(null);

  // Editing after a failed or mailto submit puts the form back to its ready state.
  const onValuesChange = () =>
    setStatus((current) => (current === 'error' || current === 'timeout' || current === 'mailto' ? 'idle' : current));

  const submit = async (values: GermanLessonsValues) => {
    if (inFlight.current || status === 'sent') return;
    inFlight.current = true;
    const optional = (key: 'email' | 'purpose' | 'experience') =>
      values[key].trim() ? { [key]: values[key].trim() } : {};
    const request: GermanLessonsRequest = {
      name: values.name.trim(),
      ...optional('email'),
      whatsapp: values.wa.trim(),
      language: values.language.trim(),
      ...optional('purpose'),
      ...optional('experience'),
    };
    setSubmittedRequest(request);
    if (siteConfig.formEndpoint) setStatus('sending');
    try {
      setStatus(await submitGermanLessons(request));
    } finally {
      inFlight.current = false;
    }
  };

  const clearSubmission = () => {
    setSubmittedRequest(null);
    setStatus('idle');
  };

  const locked = status === 'sending' || status === 'sent';
  const canSubmit = status === 'idle' || status === 'error' || status === 'timeout' || status === 'mailto';

  return { status, submittedRequest, onValuesChange, submit, clearSubmission, locked, canSubmit };
}

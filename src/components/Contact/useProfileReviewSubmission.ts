import { useRef, useState } from 'react';

import { submitProfileReview, type EnquirySummary, type ProfileReviewRequest } from '@/services/profileReview';
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

/**
 * Status, receipt and the details locked while a profile review is in flight or already received.
 * A page's summary is attached only while the visitor has its box ticked; the box starts unticked,
 * and unticks again when the summary empties, so a later summary needs a fresh tick.
 */
export function useProfileReviewSubmission(summary?: EnquirySummary) {
  const [status, setStatus] = useState<SubmissionStatus>('idle');
  const [receivedDate, setReceivedDate] = useState('');
  const inFlight = useRef(false);
  const [submittedRequest, setSubmittedRequest] = useState<ProfileReviewRequest | null>(null);

  const currentSummary = summary && summary.lines.length > 0 ? summary : undefined;
  const [summaryTicked, setSummaryTicked] = useState(false);
  const [hadSummary, setHadSummary] = useState(Boolean(currentSummary));
  if (hadSummary !== Boolean(currentSummary)) {
    setHadSummary(Boolean(currentSummary));
    if (!currentSummary) setSummaryTicked(false);
  }

  // Editing after a failed or mailto submit puts the form back to its ready state.
  const onValuesChange = () => setStatus((current) => (current === 'error' || current === 'timeout' || current === 'mailto' ? 'idle' : current));

  const setSummaryIncluded = (included: boolean) => {
    setSummaryTicked(included);
    onValuesChange();
  };

  const attachedSummary = summaryTicked ? currentSummary : undefined;

  const submit = async (values: ProfileReviewValues) => {
    if (inFlight.current || status === 'sent') return;
    inFlight.current = true;
    const request: ProfileReviewRequest = {
      name: values.name.trim(),
      ...(values.email.trim() ? { email: values.email.trim() } : {}),
      whatsapp: values.wa.trim(),
      ...(attachedSummary ? { summary: { source: attachedSummary.source, lines: [...attachedSummary.lines] } } : {}),
      ...(values.german ? { germanLessons: true as const } : {}),
    };
    setSubmittedRequest(request);
    if (siteConfig.profileReviewEndpoint) setStatus('sending');
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
    setSummaryTicked(false);
    setStatus('idle');
  };

  const locked = status === 'sending' || status === 'sent';
  const canSubmit = status === 'idle' || status === 'error' || status === 'timeout' || status === 'mailto';
  // While sending or after receipt, the block shows what was sent, or nothing if no summary was attached.
  const displayedSummary = locked ? submittedRequest?.summary : currentSummary;
  const summaryIncluded = locked ? Boolean(submittedRequest?.summary) : Boolean(attachedSummary);

  return {
    status,
    receivedDate,
    submittedRequest,
    onValuesChange,
    submit,
    clearSubmission,
    locked,
    canSubmit,
    displayedSummary,
    summaryIncluded,
    setSummaryIncluded,
  };
}

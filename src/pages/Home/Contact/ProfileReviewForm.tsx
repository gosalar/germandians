import { Button, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router';

import { usePageChromeActions } from '@/contexts/PageChrome/usePageChrome';
import { buildEmailDraft, buildEmailDraftUrl, submitProfileReview, type ProfileReviewRequest } from '@/services/profileReview';
import { CONTACT, ROUTES, SECTIONS } from '@/utils/constants';
import { siteConfig } from '@/utils/siteConfig';

import styles from './styles.module.scss';

type Status = 'idle' | 'sending' | 'sent' | 'error' | 'timeout' | 'mailto';

interface FormValues {
  name: string;
  email: string;
  wa: string;
  consent: boolean;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INITIAL_VALUES: FormValues = { name: '', email: '', wa: '', consent: false };

const VALIDATE = {
  name: (value: string) => (value.trim() ? null : 'Please enter your name.'),
  email: (value: string) => (!value.trim() || EMAIL_PATTERN.test(value.trim()) ? null : 'Please enter a valid email address.'),
  // Leading zeros are a trunk or international prefix ("098…", "0091…"), not part of the number.
  wa: (value: string) =>
    /^[1-9]\d{9,14}$/.test(value.replace(/\D/g, '').replace(/^0+/, '')) ? null : 'Please enter your WhatsApp number with 10–15 digits, including the country code.',
  consent: (value: boolean) => (value ? null : 'Please tick the box so we can contact you.'),
};

function FieldLabel({ number, children }: { number: number; children: ReactNode }) {
  return (
    <>
      <span className={styles.fieldNumber}>{number}</span>
      <span>{children}</span>
    </>
  );
}

/** "Antrag auf Erstberatung": the profile review request, styled as a German form. */
export default function ProfileReviewForm({ snapshot }: { snapshot?: string }) {
  const { formRef } = usePageChromeActions();
  const [status, setStatus] = useState<Status>('idle');
  const [receivedDate, setReceivedDate] = useState('');
  const inFlight = useRef(false);
  const [submittedRequest, setSubmittedRequest] = useState<ProfileReviewRequest | null>(null);

  const form = useForm<FormValues>({
    mode: 'controlled',
    initialValues: INITIAL_VALUES,
    validate: VALIDATE,
    // Editing after a failed or mailto submit puts the form back to its ready state.
    onValuesChange: () => setStatus((s) => (s === 'error' || s === 'timeout' || s === 'mailto' ? 'idle' : s)),
  });

  const handleSubmit = async (values: FormValues) => {
    if (inFlight.current || status === 'sent') return;
    inFlight.current = true;
    const request = {
      name: values.name.trim(),
      ...(values.email.trim() ? { email: values.email.trim() } : {}),
      whatsapp: values.wa.trim(),
      ...(snapshot ? { snapshot } : {}),
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

  const reset = () => {
    form.reset();
    setReceivedDate('');
    setSubmittedRequest(null);
    setStatus('idle');
  };

  const locked = status === 'sending' || status === 'sent';
  const canSubmit = status === 'idle' || status === 'error' || status === 'timeout' || status === 'mailto';
  const displayedSnapshot = locked ? submittedRequest?.snapshot : snapshot;
  const { error: consentError, ...consentProps } = form.getInputProps('consent', { type: 'checkbox' });

  return (
    <form
      id={SECTIONS.contactForm}
      ref={formRef}
      onSubmit={(event) => form.onSubmit(handleSubmit, (errors) => {
        const first = (['name', 'email', 'wa', 'consent'] as const).find((key) => errors[key]);
        // Wait for the error descriptions to render before moving screen-reader focus.
        requestAnimationFrame(() => {
          const input = document.getElementById(`f-${first}`);
          input?.focus({ preventScroll: true });
          input?.scrollIntoView({ block: 'center', behavior: 'instant' });
        });
      })(event)}
      noValidate
      aria-busy={status === 'sending'}
      className={styles.form}
    >
      <div className={styles.formHead}>
        <div className={styles.formTitles}>
          <div className={styles.formTitle}>Antrag auf Erstberatung</div>
          <div className={styles.formSubtitle}>Application for a first consultation</div>
        </div>
      </div>
      <div className={styles.formRule} />
      <div className={styles.formIntro}>Relax, this is the shortest German form you will ever fill in.</div>
      {displayedSnapshot ? (
        <div className={styles.snapshot} data-testid="form-snapshot">
          <span className={styles.snapshotLabel}>Attached from your grade check</span>
          <span className={styles.snapshotValue}>{displayedSnapshot}</span>
        </div>
      ) : null}

      <TextInput
        id="f-name"
        type="text"
        autoComplete="name"
        placeholder="e.g. Priya Sharma"
        disabled={locked}
        label={<FieldLabel number={1}>Name</FieldLabel>}
        {...form.getInputProps('name')}
      />
      <TextInput
        id="f-email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        disabled={locked}
        label={<FieldLabel number={2}>Email (optional)</FieldLabel>}
        {...form.getInputProps('email')}
      />
      <TextInput
        id="f-wa"
        type="tel"
        autoComplete="tel"
        placeholder="+91 98765 43210"
        disabled={locked}
        label={<FieldLabel number={3}>WhatsApp number</FieldLabel>}
        classNames={{ input: styles.phoneInput }}
        {...form.getInputProps('wa')}
      />

      <div className={styles.hint}>
        <div className={styles.hintTitle}>What happens next</div>
        <div>Once we receive your enquiry, an admin replies on WhatsApp, at the number above.</div>
        <div>We use your name to address you and your WhatsApp number to reply. Email is optional.</div>
        <div>The review looks at your academic record, APS and language evidence against programme requirements.</div>
        {!siteConfig.formEndpoint ? (
          <div>This opens your email app. Nothing is sent until you press send there. You can also email {CONTACT.email} directly.</div>
        ) : null}
      </div>

      <div className={styles.field}>
        <label htmlFor="f-consent" className={styles.consent}>
          <input
            id="f-consent"
            type="checkbox"
            disabled={locked}
            aria-invalid={!!consentError}
            aria-describedby={consentError ? 'f-consent-error' : undefined}
            className={styles.checkbox}
            {...consentProps}
          />
          <span>
            {`I agree that Germandians can use my name, WhatsApp number${displayedSnapshot ? ', any email address I provide and the attached grade-check summary' : ' and any email address I provide'} to contact me about my profile review. Details are in the `}
            <Link to={ROUTES.privacy} target="_blank" rel="noopener" className={styles.privacyLink}>
              privacy note
            </Link>
            .
          </span>
        </label>
        {consentError ? <div id="f-consent-error" className={styles.fieldError}>{consentError}</div> : null}
      </div>

      {canSubmit ? (
        <Button type="submit" variant="navy" size="submit" className={styles.submit}>
          {siteConfig.formEndpoint ? 'Request my profile review' : 'Open email draft'}
        </Button>
      ) : null}
      {status === 'sending' ? (
        <Button type="button" disabled variant="navy" size="submit" className={styles.submit}>
          Sending…
        </Button>
      ) : null}
      <div role="status" aria-live="polite" aria-atomic="true" className={styles.statusRegion}>
        {status === 'sending' ? <span className={styles.statusMessage}>Sending your enquiry…</span> : null}
        {status === 'error' || status === 'timeout' ? (
          <div className={styles.errorMessage}>
            {status === 'timeout' ? 'We could not confirm receipt within 15 seconds.' : 'We could not confirm receipt.'} Your details are still here. You can try again, or email <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>. A reply may have been lost, so mention your earlier attempt if you contact us again.
          </div>
        ) : null}
        {status === 'mailto' ? (
          <div className={styles.statusMessage}>Your email draft is ready. Nothing has been sent by this page. Press send in your email app.</div>
        ) : null}
        {status === 'sent' ? (
          <div className={styles.sent}>
            <div className={styles.sentMessage}>Received. An admin will message you on WhatsApp.</div>
            <button type="button" onClick={reset} className={styles.sendAnother}>
              Send another
            </button>
          </div>
        ) : null}
      </div>
      {status === 'mailto' && submittedRequest ? (
        <div className={styles.draftFallback}>
          <span>No email app? Copy these details and send them to <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>.</span>
          <label htmlFor="email-draft">Email details</label>
          <textarea id="email-draft" readOnly value={buildEmailDraft(submittedRequest)} className={styles.draftText} />
          <a href={buildEmailDraftUrl(submittedRequest)}>Open the draft again</a>
        </div>
      ) : null}

      <div aria-hidden="true" className={styles.stamp} data-visible={status === 'sent'}>
        <div className={styles.stampTitle}>EINGEGANGEN</div>
        <div className={styles.stampDate}>Received, {receivedDate}</div>
      </div>
    </form>
  );
}

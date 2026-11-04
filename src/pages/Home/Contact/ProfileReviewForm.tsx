import { Button, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState, type ReactNode } from 'react';
import { Link } from 'react-router';

import { usePageChromeActions } from '@/contexts/PageChrome/usePageChrome';
import { submitProfileReview } from '@/services/profileReview';
import { CONTACT, ROUTES, SECTIONS } from '@/utils/constants';
import { siteConfig } from '@/utils/siteConfig';

import styles from './styles.module.scss';

type Status = 'idle' | 'sending' | 'sent' | 'error' | 'mailto';

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
  email: (value: string) => (EMAIL_PATTERN.test(value.trim()) ? null : 'Please enter a valid email address.'),
  wa: (value: string) =>
    value.replace(/\D/g, '').length >= 10 ? null : 'Please enter your WhatsApp number with at least 10 digits.',
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
export default function ProfileReviewForm() {
  const { formRef } = usePageChromeActions();
  const [status, setStatus] = useState<Status>('idle');
  const [receivedDate, setReceivedDate] = useState('');

  const form = useForm<FormValues>({
    mode: 'controlled',
    initialValues: INITIAL_VALUES,
    validate: VALIDATE,
    // Editing after a failed or mailto submit puts the form back to its ready state.
    onValuesChange: () => setStatus((s) => (s === 'error' || s === 'mailto' ? 'idle' : s)),
  });

  const handleSubmit = async (values: FormValues) => {
    if (status === 'sending') return;
    const request = { name: values.name.trim(), email: values.email.trim(), whatsapp: values.wa.trim() };
    if (siteConfig.formEndpoint) setStatus('sending');
    const result = await submitProfileReview(request);
    if (result === 'sent') setReceivedDate(new Date().toLocaleDateString('de-DE'));
    setStatus(result);
  };

  const reset = () => {
    form.reset();
    setReceivedDate('');
    setStatus('idle');
  };

  const locked = status === 'sending' || status === 'sent';
  const canSubmit = status === 'idle' || status === 'error' || status === 'mailto';
  const { error: consentError, ...consentProps } = form.getInputProps('consent', { type: 'checkbox' });

  return (
    <form
      id={SECTIONS.contactForm}
      ref={formRef}
      onSubmit={form.onSubmit(handleSubmit)}
      noValidate
      className={styles.form}
    >
      <div className={styles.formHead}>
        <div className={styles.formTitles}>
          <div className={styles.formTitle}>Antrag auf Erstberatung</div>
          <div className={styles.formSubtitle}>Application for a first consultation</div>
        </div>
        <div className={styles.formRef}>
          <div className={styles.formRefStrong}>Formular GD-26</div>
          <div>Seite 1 von 1</div>
        </div>
      </div>
      <div className={styles.formRule} />
      <div className={styles.formIntro}>Relax, this is the shortest German form you will ever fill in.</div>

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
        label={<FieldLabel number={2}>Email</FieldLabel>}
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
        <div className={styles.hintTitle}>Hinweis: what happens next</div>
        <div>One of our six admins replies on WhatsApp, at the number above.</div>
        <div>The review covers your degree, CGPA and backlogs, your APS and IELTS status, and which universities fit.</div>
      </div>

      <div className={styles.field}>
        <label htmlFor="f-consent" className={styles.consent}>
          <input
            id="f-consent"
            type="checkbox"
            disabled={locked}
            aria-invalid={!!consentError}
            className={styles.checkbox}
            {...consentProps}
          />
          <span>
            I agree that Germandians can use my name, email and WhatsApp number to contact me about my profile review.
            Details are in the{' '}
            <Link to={ROUTES.privacy} target="_blank" rel="noopener" className={styles.privacyLink}>
              privacy note
            </Link>
            .
          </span>
        </label>
        {consentError ? <div className={styles.fieldError}>{consentError}</div> : null}
      </div>

      {canSubmit ? (
        <Button type="submit" variant="navy" size="submit" className={styles.submit}>
          Request my profile review
        </Button>
      ) : null}
      {status === 'sending' ? (
        <Button type="button" disabled variant="navy" size="submit" className={styles.submit}>
          Sending…
        </Button>
      ) : null}
      {status === 'error' ? (
        <div role="alert" className={styles.errorMessage}>
          That didn't go through. Please try again, or email {CONTACT.email}.
        </div>
      ) : null}
      {status === 'mailto' ? (
        <div role="status" className={styles.statusMessage}>
          Your email app should open with these details filled in. Press send there and we'll reply on WhatsApp.
        </div>
      ) : null}
      {status === 'sent' ? (
        <div role="status" className={styles.sent}>
          <div className={styles.sentMessage}>Received. An admin will message you on WhatsApp.</div>
          <button type="button" onClick={reset} className={styles.sendAnother}>
            Send another
          </button>
        </div>
      ) : null}

      <div aria-hidden="true" className={styles.stamp} data-visible={status === 'sent'}>
        <div className={styles.stampTitle}>EINGEGANGEN</div>
        <div className={styles.stampDate}>Received, {receivedDate}</div>
      </div>
    </form>
  );
}

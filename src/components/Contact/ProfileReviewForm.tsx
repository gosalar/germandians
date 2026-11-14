import { Button, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { type ReactNode } from 'react';
import { Link } from 'react-router';

import { usePageChromeActions } from '@/contexts/PageChrome/usePageChrome';
import { buildEmailDraft, buildEmailDraftUrl } from '@/services/profileReview';
import { GERMAN_LESSONS, ROUTES, SECTIONS } from '@/utils/constants';
import { siteConfig } from '@/utils/siteConfig';

import {
  FORM_COPY,
  consentSentence,
  draftFallbackPrompt,
  emailAppHint,
  receiptFailure,
  stampReceived,
} from './data';
import styles from './styles.module.scss';
import { useProfileReviewSubmission, type ProfileReviewValues } from './useProfileReviewSubmission';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INITIAL_VALUES: ProfileReviewValues = { name: '', email: '', wa: '', german: false, consent: false };

const VALIDATE = {
  name: (value: string) => (value.trim() ? null : FORM_COPY.nameError),
  email: (value: string) => (!value.trim() || EMAIL_PATTERN.test(value.trim()) ? null : FORM_COPY.emailError),
  // Leading zeros are a trunk or international prefix ("098…", "0091…"), not part of the number.
  wa: (value: string) =>
    /^[1-9]\d{9,14}$/.test(value.replace(/\D/g, '').replace(/^0+/, '')) ? null : FORM_COPY.whatsappError,
  consent: (value: boolean) => (value ? null : FORM_COPY.consentError),
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
  const {
    status,
    receivedDate,
    submittedRequest,
    onValuesChange,
    submit,
    clearSubmission,
    locked,
    canSubmit,
    displayedSnapshot,
  } = useProfileReviewSubmission(snapshot);

  const form = useForm<ProfileReviewValues>({
    mode: 'controlled',
    initialValues: INITIAL_VALUES,
    validate: VALIDATE,
    onValuesChange,
  });

  const reset = () => {
    form.reset();
    clearSubmission();
  };

  const { error: consentError, ...consentProps } = form.getInputProps('consent', { type: 'checkbox' });
  const wantsGerman = Boolean(form.values.german);

  return (
    <form
      id={SECTIONS.contactForm}
      ref={formRef}
      onSubmit={(event) => form.onSubmit(submit, (errors) => {
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
          <div className={styles.formTitle}>{FORM_COPY.title}</div>
          <div className={styles.formSubtitle}>{FORM_COPY.subtitle}</div>
        </div>
      </div>
      <div className={styles.formRule} />
      <div className={styles.formIntro}>{FORM_COPY.intro}</div>
      {displayedSnapshot ? (
        <div className={styles.snapshot} data-testid="form-snapshot">
          <span className={styles.snapshotLabel}>{FORM_COPY.snapshotLabel}</span>
          <span className={styles.snapshotValue}>{displayedSnapshot}</span>
        </div>
      ) : null}

      <TextInput
        id="f-name"
        type="text"
        autoComplete="name"
        placeholder={FORM_COPY.namePlaceholder}
        disabled={locked}
        label={<FieldLabel number={1}>{FORM_COPY.nameLabel}</FieldLabel>}
        {...form.getInputProps('name')}
      />
      <TextInput
        id="f-email"
        type="email"
        autoComplete="email"
        placeholder={FORM_COPY.emailPlaceholder}
        disabled={locked}
        label={<FieldLabel number={2}>{FORM_COPY.emailLabel}</FieldLabel>}
        {...form.getInputProps('email')}
      />
      <TextInput
        id="f-wa"
        type="tel"
        autoComplete="tel"
        placeholder={FORM_COPY.whatsappPlaceholder}
        disabled={locked}
        label={<FieldLabel number={3}>{FORM_COPY.whatsappLabel}</FieldLabel>}
        classNames={{ input: styles.phoneInput }}
        {...form.getInputProps('wa')}
      />

      {/* An interest in German lessons travels with the review; the lessons enquiry has its own form. */}
      <div className={styles.interest}>
        <label htmlFor="f-german" className={styles.interestChoice}>
          <input
            id="f-german"
            type="checkbox"
            disabled={locked}
            className={styles.checkbox}
            {...form.getInputProps('german', { type: 'checkbox' })}
          />
          <span className={styles.interestLabel}>{GERMAN_LESSONS.interest.label}</span>
        </label>
        <Link
          to={`${ROUTES.learnGerman}#${SECTIONS.germanLessonsForm}`}
          target="_blank"
          rel="noopener"
          aria-label={GERMAN_LESSONS.interest.moreLabel}
          className={styles.interestMore}
        >
          {GERMAN_LESSONS.interest.more}
          <span aria-hidden="true"> →</span>
        </Link>
        <p className={styles.interestTerms}>
          {GERMAN_LESSONS.charges} {GERMAN_LESSONS.certificate}
        </p>
      </div>

      <div className={styles.hint}>
        <div className={styles.hintTitle}>{FORM_COPY.hintTitle}</div>
        <div>{FORM_COPY.hintReply}</div>
        <div>{FORM_COPY.hintUse}</div>
        <div>{FORM_COPY.hintReview}</div>
        {!siteConfig.formEndpoint ? (
          <div>{emailAppHint()}</div>
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
            {consentSentence(Boolean(displayedSnapshot), wantsGerman)}
          </span>
        </label>
        {consentError ? <div id="f-consent-error" className={styles.fieldError}>{consentError}</div> : null}
      </div>

      {canSubmit ? (
        <Button type="submit" variant="navy" size="submit" className={styles.submit}>
          {siteConfig.formEndpoint ? FORM_COPY.submit : FORM_COPY.openDraft}
        </Button>
      ) : null}
      {status === 'sending' ? (
        <Button type="button" disabled variant="navy" size="submit" className={styles.submit}>
          {FORM_COPY.sendingButton}
        </Button>
      ) : null}
      <div role="status" aria-live="polite" aria-atomic="true" className={styles.statusRegion}>
        {status === 'sending' ? <span className={styles.statusMessage}>{FORM_COPY.sendingStatus}</span> : null}
        {status === 'error' || status === 'timeout' ? (
          <div className={styles.errorMessage}>
            {receiptFailure(status === 'timeout')}
          </div>
        ) : null}
        {status === 'mailto' ? (
          <div className={styles.statusMessage}>{FORM_COPY.mailtoStatus}</div>
        ) : null}
        {status === 'sent' ? (
          <div className={styles.sent}>
            <div className={styles.sentMessage}>{FORM_COPY.received}</div>
            <button type="button" onClick={reset} className={styles.sendAnother}>
              {FORM_COPY.sendAnother}
            </button>
          </div>
        ) : null}
      </div>
      {status === 'mailto' && submittedRequest ? (
        <div className={styles.draftFallback}>
          <span>{draftFallbackPrompt()}</span>
          <label htmlFor="email-draft">{FORM_COPY.draftLabel}</label>
          <textarea id="email-draft" readOnly value={buildEmailDraft(submittedRequest)} className={styles.draftText} />
          <a href={buildEmailDraftUrl(submittedRequest)}>{FORM_COPY.openDraftAgain}</a>
        </div>
      ) : null}

      <div aria-hidden="true" className={styles.stamp} data-visible={status === 'sent'}>
        <div className={styles.stampTitle}>{FORM_COPY.stampTitle}</div>
        <div className={styles.stampDate}>{stampReceived(receivedDate)}</div>
      </div>
    </form>
  );
}

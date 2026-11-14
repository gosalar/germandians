import { Button, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { buildGermanLessonsDraft, buildGermanLessonsDraftUrl } from '@/services/germanLessons';
import { CONTACT, GERMAN_LESSONS, ROUTES, SECTIONS } from '@/utils/constants';
import { siteConfig } from '@/utils/siteConfig';

import { ASK, LESSONS_FORM, NOTICE } from './data';
import styles from './styles.module.scss';
import { useGermanLessonsSubmission, type GermanLessonsValues } from './useGermanLessonsSubmission';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FIELD_ORDER = ['name', 'wa', 'email', 'language', 'consent'] as const;

const INITIAL_VALUES: GermanLessonsValues = {
  name: '',
  wa: '',
  email: '',
  language: '',
  purpose: '',
  experience: '',
  consent: false,
};

const VALIDATE = {
  name: (value: string) => (value.trim() ? null : LESSONS_FORM.nameError),
  // Leading zeros are a trunk or international prefix ("098…", "0091…"), not part of the number.
  wa: (value: string) =>
    /^[1-9]\d{9,14}$/.test(value.replace(/\D/g, '').replace(/^0+/, '')) ? null : LESSONS_FORM.whatsappError,
  email: (value: string) => (!value.trim() || EMAIL_PATTERN.test(value.trim()) ? null : LESSONS_FORM.emailError),
  language: (value: string) => (value.trim() ? null : LESSONS_FORM.languageError),
  consent: (value: boolean) => (value ? null : LESSONS_FORM.consentError),
};

const emailLink = <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>;

function FieldLabel({ number, children }: { number: number; children: ReactNode }) {
  return (
    <>
      <span className={styles.fieldNumber}>{number}</span>
      <span>{children}</span>
    </>
  );
}

/**
 * "Anfrage zum Deutschunterricht": the German lessons enquiry, separate from the profile review. It
 * sends the same way (the form endpoint, or an email draft), marked as a German lessons enquiry.
 */
export default function GermanLessonsForm() {
  const { status, submittedRequest, onValuesChange, submit, clearSubmission, locked, canSubmit } =
    useGermanLessonsSubmission();

  const form = useForm<GermanLessonsValues>({
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

  const field = (
    key: 'name' | 'wa' | 'email' | 'language' | 'purpose' | 'experience',
    number: number,
    label: string,
    placeholder: string,
    extra: { type?: string; autoComplete?: string } = {},
  ) => (
    <TextInput
      id={`g-${key}`}
      type={extra.type ?? 'text'}
      autoComplete={extra.autoComplete ?? 'off'}
      placeholder={placeholder}
      disabled={locked}
      label={<FieldLabel number={number}>{label}</FieldLabel>}
      {...form.getInputProps(key)}
    />
  );

  return (
    <form
      id={SECTIONS.germanLessonsForm}
      onSubmit={(event) =>
        form.onSubmit(submit, (errors) => {
          const first = FIELD_ORDER.find((key) => errors[key]);
          // Wait for the error descriptions to render before moving screen-reader focus.
          requestAnimationFrame(() => {
            const input = document.getElementById(`g-${first}`);
            input?.focus({ preventScroll: true });
            input?.scrollIntoView({ block: 'center', behavior: 'instant' });
          });
        })(event)
      }
      noValidate
      aria-busy={status === 'sending'}
      aria-labelledby="german-lessons-form-title"
      className={styles.card}
    >
      <div className={styles.cardHead}>
        <p id="german-lessons-form-title" lang="de" className={styles.cardTitle}>
          {LESSONS_FORM.title}
        </p>
        <p className={styles.cardSubtitle}>{LESSONS_FORM.subtitle}</p>
      </div>
      <div aria-hidden="true" className={styles.cardRule} />
      <p className={styles.formIntro}>{LESSONS_FORM.intro}</p>

      {field('name', 1, LESSONS_FORM.nameLabel, LESSONS_FORM.namePlaceholder, { autoComplete: 'name' })}
      {field('wa', 2, LESSONS_FORM.whatsappLabel, LESSONS_FORM.whatsappPlaceholder, { type: 'tel', autoComplete: 'tel' })}
      {field('email', 3, LESSONS_FORM.emailLabel, LESSONS_FORM.emailPlaceholder, { type: 'email', autoComplete: 'email' })}
      {field('language', 4, LESSONS_FORM.languageLabel, LESSONS_FORM.languagePlaceholder)}
      {field('purpose', 5, LESSONS_FORM.purposeLabel, LESSONS_FORM.purposePlaceholder)}
      {field('experience', 6, LESSONS_FORM.experienceLabel, LESSONS_FORM.experiencePlaceholder)}

      <div className={styles.notice}>
        <h3 className={styles.noticeTitle}>
          <span lang="de">{NOTICE.german}</span> <span className={styles.noticeEnglish}>{NOTICE.english}</span>
        </h3>
        <ul className={styles.noticeList}>
          <li>
            <span aria-hidden="true" className={styles.noticeBullet} />
            <strong>{GERMAN_LESSONS.charges}</strong>
          </li>
          <li>
            <span aria-hidden="true" className={styles.noticeBullet} />
            <strong>{GERMAN_LESSONS.certificate}</strong>
          </li>
          <li>
            <span aria-hidden="true" className={styles.noticeBullet} />
            <span>{ASK.separate}</span>
          </li>
          {!siteConfig.formEndpoint ? (
            <li>
              <span aria-hidden="true" className={styles.noticeBullet} />
              <span>
                {LESSONS_FORM.emailAppHint} {emailLink}.
              </span>
            </li>
          ) : null}
        </ul>
      </div>

      <div className={styles.consentField}>
        <label htmlFor="g-consent" className={styles.consent}>
          <input
            id="g-consent"
            type="checkbox"
            disabled={locked}
            aria-invalid={!!consentError}
            aria-describedby={consentError ? 'g-consent-error' : undefined}
            className={styles.checkbox}
            {...consentProps}
          />
          <span>
            {LESSONS_FORM.consent}{' '}
            <Link to={ROUTES.privacy} target="_blank" rel="noopener" className={styles.privacyLink}>
              {LESSONS_FORM.privacyLink}
            </Link>
            .
          </span>
        </label>
        {consentError ? (
          <div id="g-consent-error" className={styles.fieldError}>
            {consentError}
          </div>
        ) : null}
      </div>

      {canSubmit ? (
        <Button type="submit" variant="navy" size="submit" className={styles.actionButton}>
          {siteConfig.formEndpoint ? LESSONS_FORM.submit : LESSONS_FORM.openDraft}
        </Button>
      ) : null}
      {status === 'sending' ? (
        <Button type="button" disabled variant="navy" size="submit" className={styles.actionButton}>
          {LESSONS_FORM.sendingButton}
        </Button>
      ) : null}
      <div role="status" aria-live="polite" aria-atomic="true" className={styles.statusRegion}>
        {status === 'sending' ? <span className={styles.statusMessage}>{LESSONS_FORM.sendingStatus}</span> : null}
        {status === 'error' || status === 'timeout' ? (
          <div className={styles.errorMessage}>
            {status === 'timeout' ? LESSONS_FORM.timeout : LESSONS_FORM.failure} {LESSONS_FORM.failureNext} {emailLink}.
          </div>
        ) : null}
        {status === 'mailto' ? <div className={styles.statusMessage}>{LESSONS_FORM.mailtoStatus}</div> : null}
        {status === 'sent' ? (
          <div className={styles.sent}>
            <div className={styles.sentMessage}>{LESSONS_FORM.received}</div>
            <button type="button" onClick={reset} className={styles.sendAnother}>
              {LESSONS_FORM.sendAnother}
            </button>
          </div>
        ) : null}
      </div>
      {status === 'mailto' && submittedRequest ? (
        <div className={styles.draftFallback}>
          <span>
            {LESSONS_FORM.draftPrompt} {emailLink}.
          </span>
          <label htmlFor="german-lessons-draft">{LESSONS_FORM.draftLabel}</label>
          <textarea
            id="german-lessons-draft"
            readOnly
            value={buildGermanLessonsDraft(submittedRequest)}
            className={styles.draftText}
          />
          <a href={buildGermanLessonsDraftUrl(submittedRequest)}>{LESSONS_FORM.openDraftAgain}</a>
        </div>
      ) : null}
    </form>
  );
}

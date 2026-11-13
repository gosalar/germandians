import { Link } from 'react-router';

import { CONTACT, ROUTES } from '@/utils/constants';

import styles from './styles.module.scss';

export const CONTACT_COPY = {
  screenLabel: 'Contact',
  title: 'Get your profile reviewed',
  body: 'Send us your details for a profile review. Once we receive them, an admin will reply on WhatsApp. Or reach us directly:',
  instagram: 'Instagram',
  emailLabel: 'Email',
} as const;

export const FORM_COPY = {
  title: 'Antrag auf Erstberatung',
  subtitle: 'Application for a first consultation',
  intro: 'Relax, this is the shortest German form you will ever fill in.',
  snapshotLabel: 'Attached from your grade check',
  nameLabel: 'Name',
  namePlaceholder: 'e.g. Priya Sharma',
  emailLabel: 'Email (optional)',
  emailPlaceholder: 'you@example.com',
  whatsappLabel: 'WhatsApp number',
  whatsappPlaceholder: '+91 98765 43210',
  hintTitle: 'What happens next',
  hintReply: 'Once we receive your enquiry, an admin replies on WhatsApp, at the number above.',
  hintUse: 'We use your name to address you and your WhatsApp number to reply. Email is optional.',
  hintReview: 'The review looks at your academic record, APS and language evidence against programme requirements.',
  submit: 'Request my profile review',
  openDraft: 'Open email draft',
  sendingButton: 'Sending…',
  sendingStatus: 'Sending your enquiry…',
  mailtoStatus: 'Your email draft is ready. Nothing has been sent by this page. Press send in your email app.',
  received: 'Received. An admin will message you on WhatsApp.',
  sendAnother: 'Send another',
  draftLabel: 'Email details',
  openDraftAgain: 'Open the draft again',
  stampTitle: 'EINGEGANGEN',
  nameError: 'Please enter your name.',
  emailError: 'Please enter a valid email address.',
  whatsappError: 'Please enter your WhatsApp number with 10–15 digits, including the country code.',
  consentError: 'Please tick the box so we can contact you.',
} as const;

export function emailAppHint() {
  return <>This opens your email app. Nothing is sent until you press send there. You can also email {CONTACT.email} directly.</>;
}

export function consentSentence(includesSummary: boolean) {
  return (
    <>
      {`I agree that Germandians can use my name, WhatsApp number${includesSummary ? ', any email address I provide and the attached grade-check summary' : ' and any email address I provide'} to contact me about my profile review. Details are in the `}
      <Link to={ROUTES.privacy} target="_blank" rel="noopener" className={styles.privacyLink}>
        privacy note
      </Link>
      .
    </>
  );
}

export function receiptFailure(timedOut: boolean) {
  return (
    <>
      {timedOut ? 'We could not confirm receipt within 15 seconds.' : 'We could not confirm receipt.'} Your details are still here. You can try again, or email <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>. A reply may have been lost, so mention your earlier attempt if you contact us again.
    </>
  );
}

export function draftFallbackPrompt() {
  return <>No email app? Copy these details and send them to <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>.</>;
}

export function stampReceived(receivedDate: string) {
  return <>Received, {receivedDate}</>;
}

import type { ReactNode } from 'react';
import { Link } from 'react-router';

import ContentContainer from '@/components/ContentContainer';
import MinimalNav from '@/components/MinimalNav';
import PageHeader from '@/components/PageHeader';
import { CONTACT, ROUTES, SECTIONS } from '@/utils/constants';
import { privacyConfig as privacy, siteConfig } from '@/utils/siteConfig';

import styles from './styles.module.scss';

/** Details the team still has to fill in before launch. */
function Placeholder({ value, children }: { value: string; children: ReactNode }) {
  if (value) return value;
  return <mark className={styles.placeholder}>{children}</mark>;
}

const emailLink = (
  <a href={`mailto:${CONTACT.email}`} className={styles.email}>
    {CONTACT.email}
  </a>
);

export default function Privacy() {
  const showNames = privacy.names || privacy.showPlaceholders;
  const showAddress = privacy.address || privacy.showPlaceholders;
  const showRetention = privacy.retention || privacy.showPlaceholders;
  const showAuthority = privacy.authority || privacy.showPlaceholders;
  const emailForm = !siteConfig.formEndpoint;
  // Kept as elements so the sentences below can stay on short lines without
  // splitting a space into its own text node. That shift moves the highlight.
  const names = <Placeholder value={privacy.names}>[registered business name]</Placeholder>;
  const retention = <Placeholder value={privacy.retention}>[confirmed enquiry retention period]</Placeholder>;
  const authority = (
    <Placeholder value={privacy.authority}>[relevant data protection authority]</Placeholder>
  );

  return (
    <>
      <MinimalNav back={{ to: ROUTES.home, label: 'Back to the site' }} />

      <main id="main-content" tabIndex={-1} className={styles.main}>
        <ContentContainer width="prose">
        <article className={styles.article}>
          <PageHeader
            variant="regular"
            title="Privacy note"
            introduction="This page explains what happens to the details you send us through this website or contact us with."
            meta={<p className={styles.updated}>Last updated 11 November 2026</p>}
          />

          <section className={styles.section}>
            <h2 className={styles.heading}>Who is responsible</h2>
            {showNames || showAddress ? (
              <p className={styles.text}>
                {showNames ? (
                  <>Germandians is operated by {names}{showAddress ? ', ' : ''}</>
                ) : (
                  'Postal address: '
                )}
                {showAddress ? <Placeholder value={privacy.address}>[business postal address]</Placeholder> : null}.
              </p>
            ) : null}
            <p className={styles.plain}>Email: {emailLink}</p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>What we collect</h2>
            <p className={styles.text}>
              When you send an enquiry, we receive your name, WhatsApp number, any email address you choose to provide,
              the time of your message or submission, and your consent to be contacted.
            </p>
            <p className={styles.text}>
              If you use the grade check, the form includes the marks and profile answers you entered, plus the
              conversion when valid. Unanswered questions are omitted. Using the checker alone sends no profile
              details to us; the summary is shared only when you submit the form or send the email draft.
            </p>
            <p className={styles.text}>
              If you message us on WhatsApp, Instagram or by email, we receive whatever you send there, such as your
              transcripts or test scores.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>What we use it for</h2>
            <p className={styles.text}>
              We use your details only to reply to you and to carry out your profile review. We don't sell them, use
              them for advertising or add you to a mailing list.
            </p>
            <p className={styles.text}>
              The legal basis is your consent, which you give with the checkbox on the form (Art. 6(1)(a) GDPR), and
              the steps you ask us to take before we might work together (Art. 6(1)(b) GDPR).
            </p>
            <p className={styles.text}>We don't use tracking or advertising cookies on this site.</p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>Who else handles it</h2>
            <ul className={styles.list}>
              {emailForm ? (
                <li>
                  <span className={styles.bullet} data-color="green" />
                  <span>The form opens an email draft addressed to us. Nothing is sent until you press send in your email app. Your email provider and our Gmail service then handle the message.</span>
                </li>
              ) : privacy.formService || privacy.showPlaceholders ? (
                <li>
                  <span className={styles.bullet} data-color="green" />
                  <span>
                    <Placeholder value={privacy.formService}>[form service]</Placeholder> receives the form on our
                    behalf.
                  </span>
                </li>
              ) : null}
              {privacy.hostingProvider || privacy.showPlaceholders ? (
                <li>
                  <span className={styles.bullet} data-color="orange" />
                  <span>
                    <Placeholder value={privacy.hostingProvider}>[hosting provider]</Placeholder> hosts this site and keeps short technical logs, such as
                    IP addresses and access times, to keep it running.
                  </span>
                </li>
              ) : null}
              <li>
                <span className={styles.bullet} data-color="red" />
                <span>
                  Google provides our email (Gmail). Meta runs WhatsApp and Instagram, which we use when you message us
                  there.
                </span>
              </li>
            </ul>
            <p className={styles.text}>The Germandians team receives your enquiry to review it and reply on WhatsApp.</p>
            <p className={styles.text}>Some of these services may process data outside the EU, including in the USA.</p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>How long we keep it</h2>
            <p className={styles.text}>
              {showRetention ? (
                <>
                  If we don't end up working together, we delete your details within {retention}{' '}
                  of your last message. If we do, we keep them for as long as we're helping you, plus any period the law
                  requires.
                </>
              ) : (
                "We keep the details you send us for as long as we're helping you, plus any period the law requires."
              )}
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>Your rights</h2>
            <p className={styles.text}>
              You can ask us to show you, correct or delete the details we hold about you, to limit how we use them, or
              to send them to you in a portable format. You can also object to how we use them.
            </p>
            <p className={styles.text}>
              You can ask for deletion or withdraw your consent at any time by emailing {emailLink}. This doesn't affect anything we did with your
              details before you withdrew it.
            </p>
            <p className={styles.text}>
              You can also complain to a data protection authority{showAuthority ? (
                <>, for example{' '}{authority}</>
              ) : null}.
            </p>
          </section>

          <div className={styles.footer}>
            <span>Questions about this note: {emailLink}</span>
            <Link to={{ pathname: ROUTES.home, hash: SECTIONS.contactForm }} className={styles.backToForm}>
              Back to the form
            </Link>
          </div>
        </article>
        </ContentContainer>
      </main>
    </>
  );
}

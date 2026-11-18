import { Button } from '@mantine/core';
import type { ReactNode } from 'react';
import { Link } from 'react-router';

import ContentContainer from '@/components/ContentContainer';
import HomeSectionLink from '@/components/HomeSectionLink';
import PageHeader from '@/components/PageHeader';
import SourceNote from '@/components/SourceNote';
import type { ExternalCost } from '@/utils/applicationFacts';
import { SECTIONS } from '@/utils/constants';

import {
  BLOCKED_ACCOUNT_SECTION,
  COSTS_SECTION,
  COSTS_TABLE_LABELS,
  FEE_SECTION,
  HELP_SECTION,
  NEXT_STEPS_COPY,
  PAGE_COPY,
  PRIVACY_SECTION,
  SECTION_NAV,
  type PlainNote,
  type SourcedNote,
} from './data';
import styles from './styles.module.scss';

function SectionFrame({
  id,
  title,
  lead,
  children,
}: {
  id: string;
  title: string;
  lead?: string;
  children: ReactNode;
}) {
  const titleId = `${id}-title`;
  return (
    <section id={id} aria-labelledby={titleId} className={styles.section}>
      <div className={styles.sectionHead}>
        <div className={styles.sectionTitleRow}>
          <span aria-hidden="true" className={styles.sectionNumber} />
          <h2 id={titleId} className={styles.sectionTitle}>
            {title}
          </h2>
        </div>
        {lead ? <p className={styles.sectionLead}>{lead}</p> : null}
      </div>
      <div className={styles.sectionBody}>{children}</div>
    </section>
  );
}

function SourcedNotes({ notes }: { notes: readonly SourcedNote[] }) {
  return (
    <div className={styles.notesGrid}>
      {notes.map((note) => (
        <div key={note.heading ?? note.text} className={styles.noteCard}>
          {note.heading ? <h3 className={styles.noteHeading}>{note.heading}</h3> : null}
          <p className={styles.noteText}>{note.text}</p>
          <p className={styles.noteSource}>
            <SourceNote source={note.source} />
          </p>
        </div>
      ))}
    </div>
  );
}

function OfficialCostsTable({
  groups,
  labelledBy,
}: {
  groups: readonly { group: string; items: ExternalCost[] }[];
  labelledBy: string;
}) {
  return (
    <table className={styles.costs} aria-labelledby={labelledBy}>
      <thead className={styles.costsHead}>
        <tr>
          <th scope="col">{COSTS_TABLE_LABELS.item}</th>
          <th scope="col">{COSTS_TABLE_LABELS.amount}</th>
          <th scope="col">{COSTS_TABLE_LABELS.detail}</th>
        </tr>
      </thead>
      {groups.map(({ group, items }) => (
        <tbody key={group} className={styles.costGroup}>
          <tr className={styles.costGroupRow}>
            <th scope="rowgroup" colSpan={3} className={styles.costGroupName}>
              {group}
            </th>
          </tr>
          {items.map((item) => (
            <tr key={item.label} className={styles.costRow}>
              <th scope="row" className={styles.costName}>
                {item.label}
              </th>
              <td className={styles.costAmount} data-empty={item.amount ? undefined : true}>
                {item.amount ?? COSTS_TABLE_LABELS.noAmount}
              </td>
              <td className={styles.costDetail}>
                {item.detail}
                {item.source ? <SourceNote source={item.source} /> : null}
              </td>
            </tr>
          ))}
        </tbody>
      ))}
    </table>
  );
}

function NoteColumn({
  title,
  items,
  kind,
}: {
  title: string;
  items: readonly PlainNote[];
  kind?: 'limits';
}) {
  return (
    <div className={styles.columnCard} data-kind={kind}>
      <h3 className={styles.columnTitle}>{title}</h3>
      <ul className={styles.itemList}>
        {items.map((item) => (
          <li key={item.heading} className={styles.itemEntry}>
            <h4 className={styles.noteHeading}>{item.heading}</h4>
            <p className={styles.noteText}>{item.text}</p>
            {item.quote ? <blockquote className={styles.quoteCallout}>{item.quote}</blockquote> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Parents() {
  const { officialFigure } = BLOCKED_ACCOUNT_SECTION;

  return (
    <main id="main-content" tabIndex={-1} className={styles.page}>
      <section id={SECTIONS.top} className={styles.opening}>
        <ContentContainer width="wide">
          <div className={styles.openingGrid}>
            <PageHeader
              variant="regular"
              title={PAGE_COPY.title}
              introduction={PAGE_COPY.introduction}
              meta={
                <div className={styles.openingMeta}>
                  <p>{PAGE_COPY.metaNote}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    className={styles.printHide}
                    onClick={() => window.print()}
                  >
                    {PAGE_COPY.printAction}
                  </Button>
                </div>
              }
            />
            <nav aria-label={PAGE_COPY.contentsLabel} className={`${styles.guideNav} ${styles.printHide}`}>
              <p>{PAGE_COPY.contentsLabel}</p>
              <ol>
                {SECTION_NAV.map((item) => (
                  <li key={item.href}>
                    <a href={item.href}>{item.label}</a>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </ContentContainer>
      </section>

      <div className={styles.content}>
        <ContentContainer width="wide">
          <div className={styles.sections}>
            <SectionFrame
              id={COSTS_SECTION.id}
              title={COSTS_SECTION.title}
              lead={COSTS_SECTION.lead}
            >
              <SourcedNotes notes={COSTS_SECTION.notes} />
              <OfficialCostsTable
                groups={COSTS_SECTION.groups}
                labelledBy={`${COSTS_SECTION.id}-title`}
              />
              <ul className={styles.linkRow}>
                <li>
                  <Link to={COSTS_SECTION.guideLink.to}>{COSTS_SECTION.guideLink.label}</Link>
                </li>
              </ul>
            </SectionFrame>

            <SectionFrame
              id={BLOCKED_ACCOUNT_SECTION.id}
              title={BLOCKED_ACCOUNT_SECTION.title}
              lead={BLOCKED_ACCOUNT_SECTION.lead}
            >
              <div className={styles.figureCallout} data-testid="blocked-account-figure">
                <div className={styles.figureHead}>
                  <p className={styles.figureLabel}>{officialFigure.label}</p>
                  <p className={styles.figureAmount}>{officialFigure.amount}</p>
                </div>
                <p className={styles.figureDetail}>{officialFigure.detail}</p>
                <p className={styles.noteSource}>
                  <SourceNote source={officialFigure.source} />
                </p>
              </div>
              <SourcedNotes notes={BLOCKED_ACCOUNT_SECTION.notes} />
              <ul className={styles.linkRow}>
                {BLOCKED_ACCOUNT_SECTION.guideLinks.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </SectionFrame>

            <SectionFrame
              id={HELP_SECTION.id}
              title={HELP_SECTION.title}
              lead={HELP_SECTION.lead}
            >
              <div className={styles.proseStack}>
                <p>{HELP_SECTION.community}</p>
              </div>

              <div className={styles.capacityRow}>
                {HELP_SECTION.capacity.map((card) => (
                  <div key={card.label} className={styles.capacityCard}>
                    <p className={styles.capacityLabel}>{card.label}</p>
                    <p className={styles.capacityFigure}>{card.figure}</p>
                    <p className={styles.capacityDetail}>{card.detail}</p>
                  </div>
                ))}
              </div>

              <div className={styles.splitColumns}>
                <NoteColumn title={HELP_SECTION.helpsTitle} items={HELP_SECTION.helps} />
                <NoteColumn title={HELP_SECTION.doesNotTitle} items={HELP_SECTION.doesNot} kind="limits" />
              </div>

              <div className={styles.lessonsBox}>
                <h3 className={styles.noteHeading}>{HELP_SECTION.germanLessons.heading}</h3>
                <p className={styles.noteText}>{HELP_SECTION.germanLessons.text}</p>
              </div>

              <ul className={styles.linkRow}>
                {HELP_SECTION.homeLinks.map((link) => (
                  <li key={link.href}>
                    <HomeSectionLink href={link.href}>{link.label}</HomeSectionLink>
                  </li>
                ))}
                <li>
                  <Link to={HELP_SECTION.germanLessons.link.to}>
                    {HELP_SECTION.germanLessons.link.label}
                  </Link>
                </li>
              </ul>
            </SectionFrame>

            <SectionFrame id={FEE_SECTION.id} title={FEE_SECTION.title}>
              <div className={styles.feeBanner} data-testid="parents-fee-banner">
                <p className={styles.feePromise}>{FEE_SECTION.promise}</p>
                <dl className={styles.feeSummary}>
                  {FEE_SECTION.summaryRows.map((row) => (
                    <div key={row.label} className={styles.feeCell}>
                      <dt>{row.label}</dt>
                      <dd>{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className={styles.proseStack}>
                {FEE_SECTION.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              <ul className={styles.linkRow}>
                {FEE_SECTION.homeLinks.map((link) => (
                  <li key={link.href}>
                    <HomeSectionLink href={link.href}>{link.label}</HomeSectionLink>
                  </li>
                ))}
              </ul>
            </SectionFrame>

            <SectionFrame
              id={PRIVACY_SECTION.id}
              title={PRIVACY_SECTION.title}
              lead={PRIVACY_SECTION.lead}
            >
              {PRIVACY_SECTION.operator ? (
                <div className={styles.proseStack}>
                  <p>{PRIVACY_SECTION.operator}</p>
                </div>
              ) : null}

              <div className={styles.notesGrid}>
                {PRIVACY_SECTION.points.map((point) => (
                  <div key={point.heading} className={styles.noteCard}>
                    <h3 className={styles.noteHeading}>{point.heading}</h3>
                    <p className={styles.noteText}>{point.text}</p>
                  </div>
                ))}
              </div>

              <div className={styles.proseStack}>
                <p>
                  {PRIVACY_SECTION.rights.beforeEmail}
                  <a href={PRIVACY_SECTION.rights.emailHref} className={styles.emailLink}>
                    {PRIVACY_SECTION.rights.email}
                  </a>
                  {PRIVACY_SECTION.rights.afterEmail}
                </p>
              </div>

              <ul className={styles.linkRow}>
                <li>
                  <Link to={PRIVACY_SECTION.privacyLink.to}>{PRIVACY_SECTION.privacyLink.label}</Link>
                </li>
              </ul>
            </SectionFrame>
          </div>

          <section
            aria-labelledby="parents-next-steps-title"
            className={`${styles.nextSteps} ${styles.printHide}`}
          >
            <div>
              <h2 id="parents-next-steps-title">{NEXT_STEPS_COPY.title}</h2>
              <p>{NEXT_STEPS_COPY.body}</p>
            </div>
            <div className={styles.nextActions}>
              <Button
                component={HomeSectionLink}
                href={NEXT_STEPS_COPY.profileReview.href}
                variant="navy"
                size="lg"
              >
                {NEXT_STEPS_COPY.profileReview.label}
              </Button>
              <Button component={Link} to={NEXT_STEPS_COPY.requirements.to} variant="ring" size="lg">
                {NEXT_STEPS_COPY.requirements.label}
              </Button>
              <Button component={Link} to={NEXT_STEPS_COPY.gradeCheck.to} variant="outline" size="lg">
                {NEXT_STEPS_COPY.gradeCheck.label}
              </Button>
            </div>
          </section>
        </ContentContainer>
      </div>
    </main>
  );
}

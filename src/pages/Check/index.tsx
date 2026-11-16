import { Button, TextInput } from '@mantine/core';
import { type ReactNode } from 'react';
import { Link } from 'react-router';

import Contact from '@/components/Contact';
import ContentContainer from '@/components/ContentContainer';
import PageHeader from '@/components/PageHeader';
import SourceNote from '@/components/SourceNote';
import { useVisitAnswers, useVisitAnswersActions } from '@/contexts/VisitAnswers/useVisitAnswers';
import { useSettleHashScroll } from '@/hooks/useSettleHashScroll';
import { SOURCES } from '@/utils/applicationFacts';
import { FEE_PROMISE, ROUTES, SECTIONS, hashLink } from '@/utils/constants';

import { CHECK_COPY, REQUIREMENTS_LINK_COPY, SCALE_PRESETS } from './data';
import { buildCheckDiagnosis } from './logic';
import styles from './styles.module.scss';

const ERROR_ID = 'check-input-error';

function StepNumber({ number, children }: { number: number; children: ReactNode }) {
  return (
    <>
      <span className={styles.stepNumber}>{number}</span>
      <span>{children}</span>
    </>
  );
}

export default function Check() {
  useSettleHashScroll();
  // The marks live in the visit state, so they survive moving to another page and back.
  const { marks } = useVisitAnswers();
  const { setMarks } = useVisitAnswersActions();

  const activePreset = SCALE_PRESETS.find(
    (preset) => preset.max === marks.max.trim() && preset.min === marks.min.trim(),
  )?.id;
  const diagnosis = buildCheckDiagnosis(marks);
  const hasError = Boolean(diagnosis.errorText);

  const applyPreset = (preset: (typeof SCALE_PRESETS)[number]) => {
    setMarks({ max: preset.max, min: preset.min });
  };

  const updateNumberField = (field: 'score' | 'max' | 'min', value: string) => {
    setMarks({ [field]: value });
  };

  return (
    <main id="main-content" tabIndex={-1}>
      <section id={SECTIONS.top} className={styles.section}>
        <ContentContainer width="wide">
          <PageHeader
            title={CHECK_COPY.title}
            introduction={CHECK_COPY.lede}
            variant="compact"
            leading={(
              <div className={styles.badges}>
                {CHECK_COPY.badges.map((badge, index) => (
                  <span key={badge} className={styles.badge} data-tone={index === 0 ? 'green' : undefined}>{badge}</span>
                ))}
              </div>
            )}
          />

          <div className={styles.workbench}>
            <div className={styles.panel}>
              <div className={styles.panelHead}>
                <h2 className={styles.panelTitle}>{CHECK_COPY.marksTitle}</h2>
              </div>

              <div className={styles.presets} role="group" aria-label={CHECK_COPY.presetsLabel}>
                {SCALE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    aria-pressed={activePreset === preset.id}
                    className={styles.presetButton}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className={styles.scoreBlock}>
                <div className={styles.scoreFields}>
                  <TextInput
                    id="check-score"
                    type="text"
                    inputMode="decimal"
                    value={marks.score}
                    onChange={(event) => updateNumberField('score', event.currentTarget.value)}
                    error={Boolean(diagnosis.invalidFields.score)}
                    attributes={
                      hasError && diagnosis.invalidFields.score ? { input: { 'aria-describedby': ERROR_ID } } : undefined
                    }
                    label={<StepNumber number={1}>{CHECK_COPY.scoreFieldLabel}</StepNumber>}
                  />
                  <TextInput
                    id="check-max"
                    type="text"
                    inputMode="decimal"
                    value={marks.max}
                    onChange={(event) => updateNumberField('max', event.currentTarget.value)}
                    error={Boolean(diagnosis.invalidFields.max)}
                    attributes={
                      hasError && diagnosis.invalidFields.max ? { input: { 'aria-describedby': ERROR_ID } } : undefined
                    }
                    label={<StepNumber number={2}>{CHECK_COPY.maxFieldLabel}</StepNumber>}
                  />
                  <TextInput
                    id="check-min"
                    type="text"
                    inputMode="decimal"
                    value={marks.min}
                    onChange={(event) => updateNumberField('min', event.currentTarget.value)}
                    error={Boolean(diagnosis.invalidFields.min)}
                    attributes={
                      hasError && diagnosis.invalidFields.min ? { input: { 'aria-describedby': ERROR_ID } } : undefined
                    }
                    label={<StepNumber number={3}>{CHECK_COPY.minFieldLabel}</StepNumber>}
                  />
                </div>

                <div id={ERROR_ID} role="status" aria-live="polite" className={styles.inputError}>
                  {diagnosis.errorText ?? ''}
                </div>
              </div>

              {/* On phones and narrow tablets, show the calculated grade right below the score inputs. */}
              <div aria-hidden="true" className={styles.mobileScoreBar}>
                <div className={styles.mobileScoreLeft}>
                  <span className={styles.mobileScoreLabel}>{CHECK_COPY.mobileGradeLabel}</span>
                  <span className={styles.mobileScoreValue}>{diagnosis.gradeFormatted ?? CHECK_COPY.emptyGrade}</span>
                </div>
                <span className={styles.mobileScoreClass}>{diagnosis.classification}</span>
              </div>

              <p className={styles.passNote}>
                <strong>{CHECK_COPY.exampleLead}</strong>{CHECK_COPY.exampleBeforeFirst}<strong>{CHECK_COPY.exampleFirst}</strong>{CHECK_COPY.exampleBetween}<strong>{CHECK_COPY.exampleSecond}</strong>{CHECK_COPY.exampleAfter}
              </p>
            </div>

            <div className={styles.result}>
              <div className={styles.resultStickyHead}>
                <div
                  aria-live="polite"
                  aria-atomic="true"
                  data-testid="check-live-region"
                  className={styles.liveSummary}
                >
                  <div className={styles.scoreDisplay}>
                    <div className={styles.scoreLabel}>{CHECK_COPY.resultGradeLabel}</div>
                    <div className={styles.scoreValue} data-testid="german-grade-value">
                      {diagnosis.gradeFormatted ?? CHECK_COPY.emptyGrade}
                    </div>
                  </div>
                  <div className={styles.scoreHeadlineCol}>
                    <div className={styles.scoreClass}>{diagnosis.classification}</div>
                    <h2 className={styles.diagnosisTitle} data-testid="check-headline">
                      {diagnosis.headline}
                    </h2>
                  </div>
                </div>
              </div>

              <div className={styles.formulaMeta}>
                <div className={styles.scoreFormula}>{diagnosis.formulaText}</div>
                <div className={styles.scaleHint}>{diagnosis.scaleNote}</div>
                <p className={styles.formulaSource} data-testid="check-formula-source">
                  {CHECK_COPY.formulaSource}
                  <SourceNote source={SOURCES.gradeFormula} />
                </p>
              </div>

              <div className={styles.diagnosisCard}>
                <p className={styles.explanation}>{CHECK_COPY.explanation}</p>

                <div className={styles.requirementsLink} data-testid="check-requirements-link">
                  <h3 className={styles.diagnosisKicker}>{REQUIREMENTS_LINK_COPY.heading}</h3>
                  <p className={styles.explanation}>{REQUIREMENTS_LINK_COPY.body}</p>
                  <Button component={Link} to={ROUTES.requirements} variant="navy" size="lg" className={styles.requirementsButton}>
                    {REQUIREMENTS_LINK_COPY.label}
                  </Button>
                </div>

                <div className={styles.diagnosisActions}>
                  <Button
                    component="a"
                    href={hashLink(SECTIONS.contactForm)}
                    variant="yellow"
                    size="lg"
                    data-testid="check-cta"
                  >
                    {CHECK_COPY.ctaLabel}
                  </Button>
                  <div className={styles.zeroFeeCallout}>
                    <span className={styles.zeroFeeText}>{FEE_PROMISE}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ContentContainer>
      </section>

      <Contact summary={diagnosis.summary} />
    </main>
  );
}

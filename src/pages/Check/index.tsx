import { Button, TextInput } from '@mantine/core';
import { useState, type ReactNode } from 'react';

import Contact from '@/components/Contact';
import ContentContainer from '@/components/ContentContainer';
import DmatNote from '@/components/DmatNote';
import PageHeader from '@/components/PageHeader';
import SourceNote from '@/components/SourceNote';
import { useSettleHashScroll } from '@/hooks/useSettleHashScroll';
import { DMAT, SOURCES } from '@/utils/applicationFacts';
import { FEE_PROMISE, SECTIONS, hashLink } from '@/utils/constants';
import { INTAKE_READINESS, siteConfig } from '@/utils/siteConfig';

import {
  APS_OPTIONS,
  APS_SOURCE,
  BACKLOG_OPTIONS,
  BACKLOG_QUESTIONS,
  CHECK_COPY,
  DEFAULT_CHECK_INPUTS,
  DEGREE_OPTIONS,
  DMAT_CHECK_COPY,
  DMAT_FIELDS,
  PROGRAMME_SOURCES,
  REQUIREMENTS,
  SCALE_PRESETS,
  type CheckInputs,
} from './data';
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
  const [inputs, setInputs] = useState<CheckInputs>(DEFAULT_CHECK_INPUTS);

  const activePreset = SCALE_PRESETS.find(
    (preset) => preset.max === inputs.max.trim() && preset.min === inputs.min.trim(),
  )?.id;
  const diagnosis = buildCheckDiagnosis(inputs);
  const hasError = Boolean(diagnosis.errorText);

  const applyPreset = (preset: (typeof SCALE_PRESETS)[number]) => {
    setInputs((prev) => ({ ...prev, max: preset.max, min: preset.min }));
  };

  const updateNumberField = (field: 'score' | 'max' | 'min', value: string) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
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
            <div className={styles.inputsColumn}>
              <div className={styles.panel}>
                <div className={styles.panelHead}>
                  <span className={styles.panelStep}>{CHECK_COPY.stepOne}</span>
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
                      value={inputs.score}
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
                      value={inputs.max}
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
                      value={inputs.min}
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

              <div className={styles.panel}>
                <div className={styles.panelHead}>
                  <span className={styles.panelStep}>{CHECK_COPY.stepTwo}</span>
                  <h2 className={styles.panelTitle}>{CHECK_COPY.profileTitle}</h2>
                </div>
                <p className={styles.profileNote}>{CHECK_COPY.profileNote}</p>

                {BACKLOG_QUESTIONS.map(({ field, label, group }) => (
                  <div key={field} className={styles.toggleGroup}>
                    <div className={styles.toggleLabel}>{label}</div>
                    <div className={styles.pills} role="group" aria-label={group}>
                      {BACKLOG_OPTIONS.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setInputs((prev) => ({ ...prev, [field]: prev[field] === option ? null : option }))}
                          aria-pressed={inputs[field] === option}
                          className={styles.pill}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <div className={styles.toggleGroup}>
                  <div className={styles.toggleLabel}>{CHECK_COPY.degreeLabel}</div>
                  <div className={styles.pills} role="group" aria-label={CHECK_COPY.degreeGroupLabel}>
                    {DEGREE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setInputs((prev) => ({ ...prev, degree: prev.degree === option.value ? null : option.value }))}
                        aria-pressed={inputs.degree === option.value}
                        className={styles.pill}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.toggleGroup}>
                  <div className={styles.toggleLabel}>{CHECK_COPY.apsLabel}</div>
                  <div className={styles.pills} role="group" aria-label={CHECK_COPY.apsLabel}>
                    {APS_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setInputs((prev) => ({ ...prev, aps: prev.aps === option.value ? null : option.value }))}
                        aria-pressed={inputs.aps === option.value}
                        className={styles.pill}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={styles.toggleGroup}>
                  <div className={styles.toggleLabel}>{DMAT_CHECK_COPY.label}</div>
                  <p className={styles.profileNote}>{DMAT.fields}</p>
                  <SourceNote source={SOURCES.dmat} />
                  <div className={styles.pills} role="group" aria-label={CHECK_COPY.dmatGroupLabel}>
                    {DMAT_FIELDS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setInputs((prev) => ({ ...prev, dmatField: prev.dmatField === option ? null : option }))}
                        aria-pressed={inputs.dmatField === option}
                        className={styles.pill}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
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
              </div>

              <div className={styles.diagnosisCard}>
                <h3 className={styles.diagnosisKicker}>{CHECK_COPY.resultTitle}</h3>
                <p className={styles.explanation}>{CHECK_COPY.explanation}</p>
                <ul className={styles.diagnosisList} data-testid="requirements-list">
                  {REQUIREMENTS.map((requirement) => (
                    <li key={requirement.title}>
                      <span aria-hidden="true" className={styles.diagnosisBullet} />
                      <div><strong className={styles.diagnosisBulletTitle}>{requirement.title}: </strong>{requirement.body}</div>
                    </li>
                  ))}
                </ul>

                {diagnosis.bullets.length > 0 ? (
                  <ul className={styles.diagnosisList}>
                    {diagnosis.bullets.map((bullet) => (
                      <li key={bullet.title}>
                        <span aria-hidden="true" className={styles.diagnosisBullet} />
                        <div>
                          <strong className={styles.diagnosisBulletTitle}>{bullet.title}: </strong>
                          <span>{bullet.body}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : null}

                <div data-testid="dmat-guidance">
                  <h3 className={styles.diagnosisKicker}>{DMAT_CHECK_COPY.heading}</h3>
                  <p className={styles.explanation} aria-live="polite">
                    {diagnosis.dmat.text}
                  </p>
                  {diagnosis.dmat.detail === 'none' ? (
                    <SourceNote source={SOURCES.dmat} />
                  ) : (
                    <p className={styles.explanation}>
                      {/* The affected fields are listed beside the question, so they are not repeated here. */}
                      <DmatNote detail={diagnosis.dmat.detail === 'full'} fields={false} />
                    </p>
                  )}
                </div>
                <h3 className={styles.diagnosisKicker}>{siteConfig.intake} {CHECK_COPY.readinessLabel}</h3>
                <p className={styles.explanation}>{INTAKE_READINESS}</p>
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

              <div className={styles.sources}>
                <span>{CHECK_COPY.sourceLabel}</span>
                {PROGRAMME_SOURCES.map((source) => (
                  <a key={source.url} href={source.url} target="_blank" rel="noopener">{source.label}</a>
                ))}
                <a href={APS_SOURCE.url} target="_blank" rel="noopener">{APS_SOURCE.label}</a>
                <span>{CHECK_COPY.reviewedLabel} {CHECK_COPY.reviewed}</span>
              </div>
            </div>
          </div>
        </ContentContainer>
      </section>

      <Contact snapshot={diagnosis.snapshot} />
    </main>
  );
}

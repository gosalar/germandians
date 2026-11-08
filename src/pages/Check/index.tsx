import { Button, TextInput } from '@mantine/core';
import { useState, type ReactNode } from 'react';

import { useSettleHashScroll } from '@/hooks/useSettleHashScroll';
import Contact from '@/pages/Home/Contact';
import { SECTIONS, hashLink } from '@/utils/constants';
import { siteConfig } from '@/utils/siteConfig';

import {
  APS_OPTIONS,
  BACKLOG_OPTIONS,
  DEFAULT_CHECK_INPUTS,
  DEGREE_OPTIONS,
  SCALE_PRESETS,
  buildCheckDiagnosis,
  type CheckInputs,
} from './data';
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
    setInputs((prev) => {
      const currentScore = Number(prev.score.trim().replace(',', '.'));
      const keepScore =
        prev.max.trim() === preset.max &&
        Number.isFinite(currentScore) &&
        currentScore >= Number(preset.min) &&
        currentScore <= Number(preset.max);
      return {
        ...prev,
        max: preset.max,
        min: preset.min,
        score: keepScore ? prev.score : preset.exampleScore,
      };
    });
  };

  const updateNumberField = (field: 'score' | 'max' | 'min', value: string) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <main id={SECTIONS.top}>
      <section className={styles.section}>
        <div className={styles.container}>
          <header className={styles.head}>
            <div className={styles.badges}>
              <span className={styles.badge} data-tone="green">
                No login or email needed
              </span>
              <span className={styles.badge}>KMK-recommended Bavarian formula</span>
              <span className={styles.badge}>{siteConfig.intake} intake</span>
            </div>
            <h1 className={styles.title}>Check your German grade and public university fit</h1>
            <p className={styles.lede}>
              Convert your marks with the KMK-recommended Modified Bavarian Formula, add the three profile details a
              calculator misses, and see how German public universities read your application.
            </p>
          </header>

          <div className={styles.workbench}>
            <div className={styles.inputsColumn}>
              <div className={styles.panel}>
                <div className={styles.panelHead}>
                  <span className={styles.panelStep}>Step 1</span>
                  <h2 className={styles.panelTitle}>Your marks (Modified Bavarian formula)</h2>
                </div>

                <div className={styles.presets} role="group" aria-label="Indian grading scale presets">
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
                      label={<StepNumber number={1}>Your score</StepNumber>}
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
                      label={<StepNumber number={2}>Max possible</StepNumber>}
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
                      label={<StepNumber number={3}>Min passing</StepNumber>}
                    />
                  </div>

                  <div id={ERROR_ID} role="status" aria-live="polite" className={styles.inputError}>
                    {diagnosis.errorText ?? ''}
                  </div>
                </div>

                {/* On phones and narrow tablets, show the calculated grade right below the score inputs. */}
                <div aria-hidden="true" className={styles.mobileScoreBar}>
                  <div className={styles.mobileScoreLeft}>
                    <span className={styles.mobileScoreLabel}>German grade</span>
                    <span className={styles.mobileScoreValue}>{diagnosis.gradeFormatted ?? '—'}</span>
                  </div>
                  <span className={styles.mobileScoreClass}>{diagnosis.classification}</span>
                </div>

                <p className={styles.passNote}>
                  <strong>Check your transcript’s pass mark:</strong> A 7.4 CGPA converts to <strong>2.3</strong> when
                  the minimum passing grade is 4.0, but <strong>2.5</strong> when the minimum passing grade is 5.0.
                  Never enter 0.
                </p>
              </div>

              <div className={styles.panel}>
                <div className={styles.panelHead}>
                  <span className={styles.panelStep}>Step 2</span>
                  <h2 className={styles.panelTitle}>Three things the formula doesn’t show</h2>
                </div>

                <div className={styles.toggleGroup}>
                  <div className={styles.toggleLabel}>Backlogs (cleared or active)</div>
                  <div className={styles.pills} role="group" aria-label="Backlogs">
                    {BACKLOG_OPTIONS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setInputs((prev) => ({ ...prev, backlogs: option }))}
                        aria-pressed={inputs.backlogs === option}
                        className={styles.pill}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.toggleGroup}>
                  <div className={styles.toggleLabel}>Bachelor’s degree duration</div>
                  <div className={styles.pills} role="group" aria-label="Bachelor's degree duration">
                    {DEGREE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setInputs((prev) => ({ ...prev, degree: option.value }))}
                        aria-pressed={inputs.degree === option.value}
                        className={styles.pill}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.toggleGroup}>
                  <div className={styles.toggleLabel}>APS status for {siteConfig.intake}</div>
                  <div className={styles.pills} role="group" aria-label="APS status">
                    {APS_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setInputs((prev) => ({ ...prev, aps: option.value }))}
                        aria-pressed={inputs.aps === option.value}
                        className={styles.pill}
                      >
                        {option.label}
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
                    <div className={styles.scoreLabel}>Your German grade</div>
                    <div className={styles.scoreValue} data-testid="german-grade-value">
                      {diagnosis.gradeFormatted ?? '—'}
                    </div>
                  </div>
                  <div className={styles.scoreHeadlineCol}>
                    <div className={styles.scoreClass}>{diagnosis.classification}</div>
                    <h2 className={styles.diagnosisTitle} data-testid="band-headline">
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
                <div className={styles.diagnosisKicker}>
                  What this means for your application (€0 service fee until you’re admitted)
                </div>

                {diagnosis.proofText ? (
                  <p className={styles.proofBox} data-testid="band-proof">
                    {diagnosis.proofText}
                  </p>
                ) : null}

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

                {diagnosis.ctaLabel ? (
                  <div className={styles.diagnosisActions}>
                    <Button
                      component="a"
                      href={hashLink(SECTIONS.contactForm)}
                      variant="yellow"
                      size="lg"
                      data-testid="band-cta"
                    >
                      {diagnosis.ctaLabel}
                    </Button>
                    <div className={styles.zeroFeeCallout}>
                      <span className={styles.zeroFeeAmount}>€0</span>
                      <span className={styles.zeroFeeText}>service fee until you’re admitted</span>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className={styles.tiers}>
                {diagnosis.tiers.map((tier) => (
                  <div key={tier.id} className={styles.tierCard} data-testid={tier.id}>
                    <span className={styles.tierBadge} data-tone={tier.tone}>
                      {tier.badge}
                    </span>
                    <h3 className={styles.tierName}>{tier.name}</h3>
                    <div className={styles.tierExamples}>{tier.examples}</div>
                    <p className={styles.tierDesc}>{tier.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Contact snapshot={diagnosis.snapshot} />
    </main>
  );
}

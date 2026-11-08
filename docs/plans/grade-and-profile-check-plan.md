# German Grade & Public University Fit Check (`/check`) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the standalone, prerendered `/check` page ("German Grade & Public University Fit Check") with an official Modified Bavarian Formula calculator, Indian grading-scale presets, three profile toggles (backlogs, bachelor's duration, APS status), a three-tier German public university fit diagnosis with tailored "sell-up" guidance, and an embedded `ProfileReviewForm` that automatically attaches the student's calculated snapshot.

**Architecture:** `/check` is registered inside `src/routes/site-layout.tsx` and prerendered via `react-router.config.ts` so it shares `PageChromeProvider`, `SiteHeader`, `SiteFooter`, and `MobileActionBar` with the home page. Pure calculation and diagnostic copy logic live in `src/pages/Check/data.ts`, the page UI and SCSS module live in `src/pages/Check/`, and `Contact` / `ProfileReviewForm` / `submitProfileReview` gain an optional `snapshot?: string` prop so the visitor's calculated profile is displayed inside the form and included in both `POST` and `mailto:` submissions.

**Tech Stack:** React 19.3, React Router 8.5 (`@react-router/dev` framework mode with static prerendering), Vite 8, TypeScript 6 (strict), Mantine 9 (`@mantine/core`, `@mantine/form`), SCSS Modules (`src/utils/styles/_tokens.scss`, `_mixins.scss`), Playwright 1.64 (`tests/ux/` and `tests/visual/`).

**Spec:** `docs/plans/grade-and-profile-check.md`

## Global Constraints

- **No `!important` in any SCSS file.** Mantine styles sit in `@layer mantine` (`src/themes/mantine-styles.ts`) and global element defaults sit in `:where()` (`src/utils/styles/global.scss`), so unlayered SCSS module classes always win.
- **No DOM style manipulation from event handlers.** Use CSS `:hover`, `:focus`, `:focus-visible`, and `data-*` or `aria-*` attributes.
- **Strictly reuse existing tokens, mixins, and Mantine components.** Use `@use '@/utils/styles/tokens' as t;` and `@use '@/utils/styles/mixins' as m;`, Mantine `<TextInput>`, `<Button>`, and `<Badge>` from `src/themes/`, and the numbered field label pattern from `ProfileReviewForm.tsx`.
- **Zero new runtime dependencies.**
- **Prerendering and hydration must stay clean.** Do not read `window`, `document`, `matchMedia`, or `new Date()` during render. Zero console errors or hydration warnings.
- **Visual test suite (`npm run test:visual`) and UX test suite (`npm run test:ux`) must pass.** Because adding `Grade check` to `SiteHeader` and `SiteFooter` intentionally updates the shared header and footer on `/`, mirror that exact link addition in `tests/visual/reference/Germandians v4.dc.html`.
- **Never mention AI, Claude, or agents in any file or commit message, and never include `Co-Authored-By` lines.**

## Review Focus

1. **Decimal comma in score inputs (e.g. `"7,4"`):** Indian and European keyboards or copy-pasted grades sometimes use a comma instead of a dot (`7,4`). `parseScoreInput` in `src/pages/Check/data.ts` normalizes `,` to `.` before parsing so `"7,4"` calculates `2.3` instead of `NaN`.
2. **Zero or inverted pass mark (`min <= 0` or `min >= max`):** Entering `0` as the minimum passing grade (the most common student error) or a `min >= max` must be rejected by `calculateGermanGrade` (`returns null`) with a clear inline explanation rather than dividing by zero or producing a false `1.7` grade.
3. **Score outside `[min, max]` (`score < min` or `score > max`):** A score below the minimum passing grade or above the maximum possible grade must return `null` from `calculateGermanGrade`, hide the tier badges' active verdict, and omit the broken grade from the form `snapshot` (falling back to the selected toggles only or `undefined` until valid).
4. **In-page `#contact-form` and `#top` links while on `/check`:** Clicking `"Get my profile reviewed"` in `SiteHeader`, the CTA inside the `/check` result card, or `"Back to top"` in `SiteFooter` while on `/check` must scroll within `/check` (where the student's snapshot is attached to the embedded form) rather than navigating away to `/` and losing their calculator state.
5. **Desktop nav width at `1100px` (`$bp-nav`) with 7 links:** Adding `Grade check` to `SiteHeader` increases the desktop nav from 6 to 7 links; reducing `.links` gap from `18px` to `15px` (and `.full` gap from `22px` to `18px`) keeps all 7 links and the CTA on a single line at `1100px` without wrapping or overflowing.

---

### Task 1: Pure Bavarian Formula & Diagnostic Engine (`src/pages/Check/data.ts`)

**Files:**
- Create: `src/pages/Check/data.ts`

**Interfaces:**
- Consumes: `siteConfig` from `@/utils/siteConfig`
- Produces:
  - `ScalePreset`, `SCALE_PRESETS`
  - `BacklogOption`, `BACKLOG_OPTIONS`, `DegreeOption`, `DEGREE_OPTIONS`, `ApsOption`, `APS_OPTIONS`
  - `CheckInputs`, `DEFAULT_CHECK_INPUTS`
  - `TierStatusTone` (`'good' | 'mid' | 'tough'`), `UniversityTierResult`
  - `CheckDiagnosis` (`{ grade: number | null; gradeFormatted: string | null; classification: string; formulaText: string; errorText: string | null; tiers: UniversityTierResult[]; headline: string; bullets: { title: string; body: string }[]; snapshot: string }`)
  - `parseScoreInput(raw: string): number`
  - `calculateGermanGrade(score: number, max: number, min: number): number | null`
  - `buildCheckDiagnosis(inputs: CheckInputs): CheckDiagnosis`

- [ ] **Step 1: Create `src/pages/Check/data.ts` with pure calculation, presets, tier mapping, and diagnosis builder**

```ts
import { siteConfig } from '@/utils/siteConfig';

export interface ScalePreset {
  id: string;
  label: string;
  max: string;
  min: string;
  exampleScore: string;
}

export const SCALE_PRESETS: readonly ScalePreset[] = [
  { id: 'cgpa-4', label: 'CGPA / 10 (Pass 4.0)', max: '10', min: '4', exampleScore: '7.4' },
  { id: 'cgpa-5', label: 'CGPA / 10 (Pass 5.0)', max: '10', min: '5', exampleScore: '7.4' },
  { id: 'pct-40', label: 'Percentage % (Pass 40)', max: '100', min: '40', exampleScore: '72' },
] as const;

export const BACKLOG_OPTIONS = ['0 backlogs', '1–5 backlogs', '6+ backlogs'] as const;
export type BacklogOption = (typeof BACKLOG_OPTIONS)[number];

export const DEGREE_OPTIONS = [
  { value: '4-year (240 ECTS)', label: '4-year (B.Tech / B.E.)' },
  { value: '3-year (180 ECTS)', label: '3-year (B.Sc / B.Com / BCA)' },
] as const;
export type DegreeOption = (typeof DEGREE_OPTIONS)[number]['value'];

export const APS_OPTIONS = [
  { value: 'APS ready', label: 'Have APS' },
  { value: 'No APS yet', label: 'Not started yet' },
] as const;
export type ApsOption = (typeof APS_OPTIONS)[number]['value'];

export interface CheckInputs {
  score: string;
  max: string;
  min: string;
  backlogs: BacklogOption;
  degree: DegreeOption;
  aps: ApsOption;
}

export const DEFAULT_CHECK_INPUTS: CheckInputs = {
  score: '7.4',
  max: '10',
  min: '4',
  backlogs: '0 backlogs',
  degree: '4-year (240 ECTS)',
  aps: 'No APS yet',
};

export type TierStatusTone = 'good' | 'mid' | 'tough';

export interface UniversityTierResult {
  id: string;
  name: string;
  examples: string;
  badge: string;
  tone: TierStatusTone;
  description: string;
}

export interface CheckDiagnosis {
  grade: number | null;
  gradeFormatted: string | null;
  classification: string;
  formulaText: string;
  errorText: string | null;
  tiers: UniversityTierResult[];
  headline: string;
  bullets: { title: string; body: string }[];
  snapshot: string;
}

/** Parses a numeric string, accepting either "." or "," as the decimal separator. */
export function parseScoreInput(raw: string): number {
  const normalized = raw.trim().replace(',', '.');
  if (!normalized) return Number.NaN;
  return Number(normalized);
}

/**
 * Official KMK Modified Bavarian Formula:
 * German grade = 1 + 3 * (Nmax - Nd) / (Nmax - Nmin)
 * Returns null when inputs are non-finite, min <= 0, min >= max, or score is outside [min, max].
 */
export function calculateGermanGrade(score: number, max: number, min: number): number | null {
  if (!Number.isFinite(score) || !Number.isFinite(max) || !Number.isFinite(min)) return null;
  if (min <= 0 || max <= min || score < min || score > max) return null;
  const raw = 1 + (3 * (max - score)) / (max - min);
  // Truncate/round to 1 decimal place inside [1.0, 4.0].
  const rounded = Math.round(raw * 10) / 10;
  return Math.max(1.0, Math.min(4.0, rounded));
}

function classifyGermanGrade(grade: number): string {
  if (grade <= 1.5) return 'Sehr gut (Very good)';
  if (grade <= 2.5) return 'Gut (Good)';
  if (grade <= 3.5) return 'Befriedigend (Satisfactory)';
  return 'Ausreichend (Sufficient pass)';
}

function validateInputs(score: number, max: number, min: number): string | null {
  if (!Number.isFinite(score) || !Number.isFinite(max) || !Number.isFinite(min)) {
    return 'Enter your score, the maximum possible score, and your university’s minimum passing score.';
  }
  if (min <= 0) {
    return 'Minimum passing score must be greater than 0 (typically 4.0 or 5.0 for CGPA, or 35–40 for percentage).';
  }
  if (max <= min) {
    return 'Maximum possible score must be greater than the minimum passing score.';
  }
  if (score < min || score > max) {
    return `Enter a score between ${min} (minimum passing) and ${max} (maximum possible).`;
  }
  return null;
}

export function buildCheckDiagnosis(inputs: CheckInputs): CheckDiagnosis {
  const score = parseScoreInput(inputs.score);
  const max = parseScoreInput(inputs.max);
  const min = parseScoreInput(inputs.min);
  const errorText = validateInputs(score, max, min);
  const grade = errorText ? null : calculateGermanGrade(score, max, min);
  const gradeFormatted = grade !== null ? grade.toFixed(1) : null;

  const classification =
    grade !== null ? `German grade · ${classifyGermanGrade(grade)}` : 'Enter valid marks to see your German grade';

  const formulaText =
    grade !== null
      ? `Modified Bavarian Formula: 1 + 3 × (${max} − ${score}) / (${max} − ${min}) = ${gradeFormatted}`
      : 'Formula: 1 + 3 × (Max − Your score) / (Max − Min passing)';

  const tier1: UniversityTierResult = {
    id: 'tier-1',
    name: 'Tier 1 · Strict NC Public TUs',
    examples: 'e.g. TU Munich, RWTH Aachen, KIT, TU Berlin',
    badge: grade === null ? 'Enter marks' : grade <= 1.9 ? 'Competitive' : grade <= 2.5 ? 'Reach / Selective' : 'Low Odds',
    tone: grade === null ? 'mid' : grade <= 1.9 ? 'good' : grade <= 2.5 ? 'mid' : 'tough',
    description:
      'Seat-capped programmes ranked heavily by grade. Worth 1–2 applications where your bachelor’s ECTS subject credits match the course table in full.',
  };

  const tier2: UniversityTierResult = {
    id: 'tier-2',
    name: 'Tier 2 · Aptitude & SOP-Scored Public TUs',
    examples: 'e.g. TU Darmstadt, FAU Erlangen, TU Dresden, Passau',
    badge: grade === null ? 'Enter marks' : grade <= 1.9 ? 'Strong Fit' : grade <= 2.5 ? 'Primary Target' : 'Selective Fit',
    tone: grade === null ? 'mid' : grade <= 2.5 ? 'good' : 'mid',
    description:
      'Selection rubrics weigh ECTS credit match, your SOP, and relevant projects alongside your grade. Often the highest-value public target zone.',
  };

  const tier3: UniversityTierResult = {
    id: 'tier-3',
    name: 'Tier 3 · Non-NC Public TUs & HAWs',
    examples: 'e.g. TU Dortmund, OVGU Magdeburg, TU Chemnitz, FH Aachen',
    badge: grade === null ? 'Enter marks' : grade <= 2.5 ? 'Strong Fit' : 'Primary Target',
    tone: 'good',
    description:
      'Open admission (zulassungsfrei) once you clear the published grade bar (often 2.5–3.0) and satisfy the required prior subject credits.',
  };

  let headline: string;
  let gradeBullet: { title: string; body: string };

  if (grade === null) {
    headline = 'Enter your marks above to see how German public universities read your profile.';
    gradeBullet = {
      title: 'Why the pass mark matters',
      body: 'German universities and uni-assist convert your marks using the official pass threshold on your transcript. Once entered, we show which public university tiers fit you best.',
    };
  } else if (grade <= 1.9 && inputs.backlogs === '0 backlogs') {
    headline = `A ${gradeFormatted} German grade puts Tier 1 and Tier 2 public universities in reach—don't lose it to an ECTS mismatch or template SOP.`;
    gradeBullet = {
      title: 'Why strong grades still get rejected',
      body: 'In the Winter 2025 cycle, an applicant with a 7.8 CGPA and 0 backlogs was rejected at the same technical university that admitted our 7.1 CGPA student. A mentor checks every course’s ECTS subject prerequisites against your syllabus and writes your SOP by hand with you over several weeks.',
    };
  } else if (grade <= 2.5) {
    headline = `A ${gradeFormatted} German grade with ${inputs.backlogs} is realistic for Tier 2 and Tier 3 public universities—when your shortlist and SOP do the heavy lifting.`;
    gradeBullet = {
      title: `How we approach ${inputs.backlogs}`,
      body: 'Many consultancies see backlogs or a mid-range CGPA and steer you into commission-paying private colleges. In Winter 2025, our student with a 7.1 CGPA (2.4 German grade) and 16 backlogs was admitted to a German technical university. We target aptitude-scored and non-NC public courses and write your SOP by hand with you.',
    };
  } else {
    headline = `With a ${gradeFormatted} German grade, blind applications to 2.5-cutoff courses will fail—your shortlist decides everything.`;
    gradeBullet = {
      title: 'Where we focus your applications',
      body: `Courses with a strict 2.5 cut-off will reject a ${gradeFormatted} automatically, while commission agents often push expensive degree mills. We filter for open-admission (non-NC) public TUs and HAWs where your subject credits qualify, plus vetted accredited options if needed—with €0 service fee until you're admitted.`,
    };
  }

  const degreeBullet =
    inputs.degree === '3-year (180 ECTS)'
      ? {
          title: '3-year (180 ECTS) degree check',
          body: "Many German Master's ask for 210–240 ECTS. In your profile review, we filter specifically for public programmes that accept 180 ECTS directly or let you complete 30 ECTS via bridge modules during your Master's.",
        }
      : {
          title: '240-ECTS module matching',
          body: "Your 4-year degree clears the total credit requirement, so our mentor checks your individual subject buckets (mathematics, core engineering, computing, or business credits) against each university's admission ordinance.",
        };

  const apsBullet =
    inputs.aps === 'No APS yet'
      ? {
          title: `${siteConfig.intake} APS & timeline plan`,
          body: `Because APS verification takes weeks, we start your APS document checklist in Month 1 (and check whether the APS India dMAT rule applies to your degree field) so paperwork doesn't block your ${siteConfig.intake} applications.`,
        }
      : {
          title: 'APS ready—straight to shortlisting',
          body: 'With your APS already sorted, we can move straight into matching your transcript credits to a university shortlist and drafting your SOP with you.',
        };

  const snapshot =
    gradeFormatted !== null
      ? `German grade ${gradeFormatted} (${score} / ${max}, pass ${min}) · ${inputs.backlogs} · ${inputs.degree} · ${inputs.aps}`
      : `${inputs.backlogs} · ${inputs.degree} · ${inputs.aps}`;

  return {
    grade,
    gradeFormatted,
    classification,
    formulaText,
    errorText,
    tiers: [tier1, tier2, tier3],
    headline,
    bullets: [gradeBullet, degreeBullet, apsBullet],
    snapshot,
  };
}
```

- [ ] **Step 2: Run TypeScript check to verify `src/pages/Check/data.ts` compiles cleanly**

Run: `npm run typecheck`
Expected: PASS with zero errors.

---

### Task 2: Attach Profile Snapshot in `submitProfileReview`, `ProfileReviewForm`, and `Contact`

**Files:**
- Modify: `src/services/profileReview.ts`
- Modify: `src/pages/Home/Contact/ProfileReviewForm.tsx`
- Modify: `src/pages/Home/Contact/index.tsx`
- Modify: `src/pages/Home/Contact/styles.module.scss`

**Interfaces:**
- Consumes: `ProfileReviewRequest`
- Produces:
  - `ProfileReviewRequest` with optional `snapshot?: string`
  - `ProfileReviewForm({ snapshot }: { snapshot?: string })`
  - `Contact({ snapshot }: { snapshot?: string })`

- [ ] **Step 1: Update `src/services/profileReview.ts` to include optional `snapshot` in `mailto:` and `POST` payloads**

```ts
import { CONTACT } from '@/utils/constants';
import { siteConfig } from '@/utils/siteConfig';

export interface ProfileReviewRequest {
  name: string;
  email: string;
  whatsapp: string;
  snapshot?: string;
}

export type SubmitResult = 'sent' | 'error' | 'mailto';

/**
 * Sends a profile review request. With a form endpoint configured it POSTs
 * JSON; without one it opens the visitor's email app with the details filled in.
 */
export async function submitProfileReview(request: ProfileReviewRequest): Promise<SubmitResult> {
  if (!siteConfig.formEndpoint) {
    const body = [
      `Name: ${request.name}`,
      `Email: ${request.email}`,
      `WhatsApp: ${request.whatsapp}`,
      ...(request.snapshot ? [`Profile check: ${request.snapshot}`] : []),
      'Consent to be contacted: yes',
      '',
      'I would like a profile review.',
    ].join('\n');
    window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent('Profile review request')}&body=${encodeURIComponent(body)}`;
    return 'mailto';
  }

  try {
    const response = await fetch(siteConfig.formEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        ...request,
        consent: true,
        consentAt: new Date().toISOString(),
        source: 'germandians-website',
      }),
    });
    return response.ok ? 'sent' : 'error';
  } catch {
    return 'error';
  }
}
```

- [ ] **Step 2: Update `src/pages/Home/Contact/ProfileReviewForm.tsx` and `src/pages/Home/Contact/index.tsx` to accept and display `snapshot?: string`**

In `src/pages/Home/Contact/ProfileReviewForm.tsx`:
- Update signature to `export default function ProfileReviewForm({ snapshot }: { snapshot?: string })`
- Include `...(snapshot ? { snapshot } : {})` in `handleSubmit` when constructing `request`
- Render the `.snapshot` summary box right below `.formIntro` when `snapshot` is truthy:

```tsx
      <div className={styles.formIntro}>Relax, this is the shortest German form you will ever fill in.</div>
      {snapshot ? (
        <div className={styles.snapshot} data-testid="form-snapshot">
          <span className={styles.snapshotLabel}>Attached from your grade check</span>
          <span className={styles.snapshotValue}>{snapshot}</span>
        </div>
      ) : null}
```

In `src/pages/Home/Contact/index.tsx`:
- Update signature to `export default function Contact({ snapshot }: { snapshot?: string })` and pass `<ProfileReviewForm snapshot={snapshot} />`.

In `src/pages/Home/Contact/styles.module.scss`, add `.snapshot`, `.snapshotLabel`, and `.snapshotValue` after `.formIntro`:

```scss
.snapshot {
  background: t.$sand;
  border: 1.5px dashed t.$navy;
  border-radius: 6px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.snapshotLabel {
  @include m.label-font(700, 14px);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: t.$green;
}

.snapshotValue {
  font-size: 15px;
  font-weight: 700;
  line-height: 1.4;
  color: t.$navy;
}
```

- [ ] **Step 3: Run `npm run typecheck` and `npm run lint`**

Run: `npm run typecheck && npm run lint`
Expected: PASS with zero errors (home page renders `<Contact />` with `snapshot` undefined, so home page DOM and styles are 100% unchanged).

---

### Task 3: Build the `/check` Page Component & Styles (`src/pages/Check/`)

**Files:**
- Create: `src/pages/Check/index.tsx`
- Create: `src/pages/Check/styles.module.scss`

**Interfaces:**
- Consumes:
  - `SCALE_PRESETS`, `BACKLOG_OPTIONS`, `DEGREE_OPTIONS`, `APS_OPTIONS`, `DEFAULT_CHECK_INPUTS`, `buildCheckDiagnosis` from `./data`
  - `Contact` from `@/pages/Home/Contact`
  - `useSettleHashScroll` from `@/hooks/useSettleHashScroll`
  - `SECTIONS`, `hashLink` from `@/utils/constants`
  - `siteConfig` from `@/utils/siteConfig`
- Produces:
  - Default export `Check()` page component in `src/pages/Check/index.tsx`

- [ ] **Step 1: Create `src/pages/Check/index.tsx`**

```tsx
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
  const [activePreset, setActivePreset] = useState<string>(SCALE_PRESETS[0].id);

  const diagnosis = buildCheckDiagnosis(inputs);

  const applyPreset = (preset: (typeof SCALE_PRESETS)[number]) => {
    setActivePreset(preset.id);
    setInputs((prev) => ({
      ...prev,
      max: preset.max,
      min: preset.min,
      score: preset.exampleScore,
    }));
  };

  const updateNumberField = (field: 'score' | 'max' | 'min', value: string) => {
    setActivePreset('');
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
              <span className={styles.badge}>Official KMK Bavarian Formula</span>
              <span className={styles.badge}>{siteConfig.intake} intake</span>
            </div>
            <h1 className={styles.title}>Check your German grade and public university fit</h1>
            <p className={styles.lede}>
              Convert your marks with the official Modified Bavarian Formula, add the three profile details a calculator
              misses, and see how German public universities read your application.
            </p>
          </header>

          <div className={styles.workbench}>
            <div className={styles.inputsGrid}>
              <div className={styles.panel}>
                <div className={styles.panelHead}>
                  <span className={styles.panelStep}>Step 1</span>
                  <h2 className={styles.panelTitle}>Your marks (Modified Bavarian Formula)</h2>
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

                <div className={styles.scoreFields}>
                  <TextInput
                    id="check-score"
                    type="text"
                    inputMode="decimal"
                    value={inputs.score}
                    onChange={(event) => updateNumberField('score', event.currentTarget.value)}
                    label={<StepNumber number={1}>Your score</StepNumber>}
                  />
                  <TextInput
                    id="check-max"
                    type="text"
                    inputMode="decimal"
                    value={inputs.max}
                    onChange={(event) => updateNumberField('max', event.currentTarget.value)}
                    label={<StepNumber number={2}>Max possible</StepNumber>}
                  />
                  <TextInput
                    id="check-min"
                    type="text"
                    inputMode="decimal"
                    value={inputs.min}
                    onChange={(event) => updateNumberField('min', event.currentTarget.value)}
                    label={<StepNumber number={3}>Min passing</StepNumber>}
                  />
                </div>

                {diagnosis.errorText ? (
                  <div role="alert" className={styles.inputError}>
                    {diagnosis.errorText}
                  </div>
                ) : null}

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

            <div aria-live="polite" className={styles.result}>
              <div className={styles.scoreBar}>
                <div className={styles.scoreDisplay}>
                  <div className={styles.scoreLabel}>Your German grade</div>
                  <div className={styles.scoreValue} data-testid="german-grade-value">
                    {diagnosis.gradeFormatted ?? '—'}
                  </div>
                </div>
                <div className={styles.scoreMeta}>
                  <div className={styles.scoreClass}>{diagnosis.classification}</div>
                  <div className={styles.scoreFormula}>{diagnosis.formulaText}</div>
                  <div className={styles.scaleHint}>
                    German scale: 1.0 is the highest possible grade and 4.0 is the minimum passing grade.
                  </div>
                </div>
              </div>

              <div className={styles.tiers}>
                {diagnosis.tiers.map((tier) => (
                  <div key={tier.id} className={styles.tierCard}>
                    <span className={styles.tierBadge} data-tone={tier.tone}>
                      {tier.badge}
                    </span>
                    <h3 className={styles.tierName}>{tier.name}</h3>
                    <div className={styles.tierExamples}>{tier.examples}</div>
                    <p className={styles.tierDesc}>{tier.description}</p>
                  </div>
                ))}
              </div>

              <div className={styles.diagnosisCard}>
                <div className={styles.diagnosisKicker}>
                  What this means for your application (€0 service fee until you’re admitted)
                </div>
                <h3 className={styles.diagnosisTitle}>{diagnosis.headline}</h3>
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
                <div className={styles.diagnosisActions}>
                  <Button component="a" href={hashLink(SECTIONS.contactForm)} variant="yellow" size="lg">
                    Get my profile reviewed with these numbers
                  </Button>
                  <span className={styles.diagnosisNote}>
                    Your calculated grade and answers above are attached to the form below automatically.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Contact snapshot={diagnosis.snapshot} />
    </main>
  );
}
```

- [ ] **Step 2: Create `src/pages/Check/styles.module.scss` using only `_tokens.scss` and `_mixins.scss`**

```scss
@use '@/utils/styles/tokens' as t;
@use '@/utils/styles/mixins' as m;

.section {
  @include m.section-padding;

  @include m.below(t.$bp-mobile) {
    padding-top: 48px;
    padding-bottom: 56px;
  }
}

.container {
  @include m.container;
}

.head {
  display: flex;
  flex-direction: column;
  gap: 18px;
  max-width: 880px;
}

.badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.badge {
  @include m.label-font(700, 15px);
  padding: 5px 12px;
  border-radius: 6px;
  background: t.$sand;
  color: t.$navy;
  border: 1px solid t.$hairline;

  &[data-tone='green'] {
    background: #e1f0e4;
    color: #17692f;
    border-color: #badfc4;
  }
}

.title {
  @include m.display-heading;
}

.lede {
  @include m.body-copy;
  color: t.$ink-soft;
  max-width: 64ch;
}

.workbench {
  margin-top: clamp(36px, 5vw, 56px);
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.inputsGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 420px), 1fr));
  gap: 24px;
  align-items: stretch;
}

.panel {
  background: t.$white;
  border-radius: 20px;
  padding: clamp(20px, 3vw, 32px);
  box-shadow:
    inset 0 0 0 1.5px t.$navy,
    0 20px 48px -32px rgba(16, 24, 46, 0.28);
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

.panelHead {
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-bottom: 2px solid t.$navy;
  padding-bottom: 14px;
}

.panelStep {
  @include m.label-font(700, 15px);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: t.$red;
}

.panelTitle {
  margin: 0;
  font-family: t.$font-display;
  font-weight: 900;
  font-stretch: 84%;
  font-size: clamp(24px, 2.4vw, 32px);
  line-height: 1.05;
  color: t.$navy;
}

.presets {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.presetButton {
  background: t.$paper;
  color: t.$navy;
  border: 1.5px solid t.$hairline;
  border-radius: 8px;
  padding: 8px 12px;
  min-height: 40px;
  @include m.label-font(700, 15px);
  cursor: pointer;
  transition:
    background var(--motion-duration, 0.2s),
    color var(--motion-duration, 0.2s),
    border-color var(--motion-duration, 0.2s);

  &:hover {
    border-color: t.$navy;
  }

  &[aria-pressed='true'] {
    background: t.$navy;
    color: t.$yellow;
    border-color: t.$navy;
  }
}

.scoreFields {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;

  @include m.below(t.$bp-short-labels) {
    grid-template-columns: 1fr;
  }
}

.stepNumber {
  flex: none;
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  background: t.$navy;
  color: t.$form;
  font-weight: 700;
  font-size: 14px;
}

.inputError {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: t.$red;
}

.passNote {
  margin: auto 0 0;
  background: t.$note;
  border-radius: 8px;
  padding: 12px 14px;
  font-size: 15px;
  line-height: 1.5;
  color: t.$ink-strong;
}

.toggleGroup {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.toggleLabel {
  font-size: 16px;
  font-weight: 700;
  color: t.$navy;
}

.pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pill {
  flex: 1 1 auto;
  min-height: 46px;
  padding: 8px 12px;
  border-radius: 10px;
  border: 1.5px solid t.$navy;
  background: t.$paper;
  color: t.$navy;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  text-align: center;
  transition:
    background var(--motion-duration, 0.2s),
    color var(--motion-duration, 0.2s);

  &:hover {
    background: t.$sand;
  }

  &[aria-pressed='true'] {
    background: t.$navy;
    color: t.$yellow;
  }
}

// Result & Diagnosis
.result {
  background: t.$navy;
  color: t.$white;
  border-radius: 24px;
  padding: clamp(20px, 4vw, 44px);
  display: flex;
  flex-direction: column;
  gap: 28px;
  box-shadow: 0 28px 64px -32px rgba(16, 24, 46, 0.5);
}

.scoreBar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 20px 40px;
  padding-bottom: 24px;
  border-bottom: 1.5px solid t.$navy-line;
}

.scoreDisplay {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.scoreLabel {
  @include m.label-font(700, 16px);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: t.$mist;
}

.scoreValue {
  font-family: t.$font-display;
  font-weight: 900;
  font-size: clamp(64px, 9vw, 108px);
  line-height: 0.9;
  letter-spacing: -0.04em;
  color: t.$yellow;
}

.scoreMeta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.scoreClass {
  font-family: t.$font-display;
  font-weight: 800;
  font-size: clamp(22px, 2.4vw, 30px);
  line-height: 1.15;
  color: t.$white;
}

.scoreFormula {
  @include m.label-font(600, 17px);
  color: t.$mist-light;
}

.scaleHint {
  font-size: 15px;
  color: t.$mist;
}

.tiers {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
  gap: 16px;
}

.tierCard {
  background: t.$navy-raised;
  border: 1.5px solid t.$navy-line;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.tierBadge {
  align-self: flex-start;
  @include m.label-font(700, 14px);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 3px 10px;
  border-radius: 6px;

  &[data-tone='good'] {
    background: #e1f0e4;
    color: #17692f;
  }

  &[data-tone='mid'] {
    background: #fdeedb;
    color: #8f4700;
  }

  &[data-tone='tough'] {
    background: #fbe4e1;
    color: #a8221a;
  }
}

.tierName {
  margin: 4px 0 0;
  font-family: t.$font-display;
  font-weight: 800;
  font-size: 21px;
  line-height: 1.15;
  color: t.$white;
}

.tierExamples {
  @include m.label-font(700, 15px);
  color: t.$yellow;
}

.tierDesc {
  margin: 0;
  font-size: 16px;
  line-height: 1.5;
  color: t.$mist-soft;
}

.diagnosisCard {
  background: t.$paper;
  color: t.$navy;
  border-radius: 18px;
  padding: clamp(20px, 3vw, 32px);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.diagnosisKicker {
  @include m.label-font(700, 15px);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: t.$green;
}

.diagnosisTitle {
  margin: 0;
  font-family: t.$font-display;
  font-weight: 900;
  font-stretch: 84%;
  font-size: clamp(24px, 2.6vw, 34px);
  line-height: 1.08;
  color: t.$navy;
  text-wrap: balance;
}

.diagnosisList {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 14px;

  > li {
    display: flex;
    gap: 14px;
    align-items: flex-start;
    font-size: 17px;
    line-height: 1.55;
    color: t.$ink;
  }
}

.diagnosisBullet {
  @include m.square-bullet(12px, 3px, 7px);
  background: t.$orange;
}

.diagnosisBulletTitle {
  color: t.$navy;
  font-weight: 700;
}

.diagnosisActions {
  margin-top: 4px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 20px;
}

.diagnosisNote {
  font-size: 15px;
  font-weight: 600;
  color: t.$ink-muted;
}
```

- [ ] **Step 3: Run `npm run typecheck` and `npm run lint`**

Run: `npm run typecheck && npm run lint`
Expected: PASS with zero errors.

---

### Task 4: Wire Route, Prerendering, Navigation Links, and Visual Reference

**Files:**
- Create: `src/routes/check.tsx`
- Modify: `src/routes.ts`
- Modify: `react-router.config.ts`
- Modify: `src/utils/constants.ts`
- Modify: `src/components/HomeSectionLink/index.tsx`
- Modify: `src/components/SiteHeader/index.tsx`
- Modify: `src/components/SiteHeader/styles.module.scss`
- Modify: `src/components/SiteFooter/index.tsx`
- Modify: `tests/visual/reference/Germandians v4.dc.html`

**Interfaces:**
- Consumes: `Check` from `@/pages/Check`, `ROUTES` from `@/utils/constants`
- Produces:
  - Prerendered `/check` route (`build/client/check/index.html`)
  - `Grade check` link in `SiteHeader` and `SiteFooter`

- [ ] **Step 1: Create `src/routes/check.tsx` and register `/check` in `src/routes.ts` and `react-router.config.ts`**

Create `src/routes/check.tsx`:

```tsx
import type { Route } from './+types/check';

export const meta: Route.MetaFunction = () => [
  { title: 'German grade & profile check | Germandians' },
  {
    name: 'description',
    content:
      'Convert your CGPA or percentage to the German grading scale with the Modified Bavarian Formula and check how German public universities read your profile.',
  },
];

export { default } from '@/pages/Check';
```

Update `src/routes.ts`:

```ts
import process from 'node:process';
import { index, layout, route, type RouteConfig } from '@react-router/dev/routes';

export default [
  layout('routes/site-layout.tsx', [
    index('routes/home.tsx'),
    route('check', 'routes/check.tsx'),
    ...(process.argv.includes('dev') ? [route('_theme', 'routes/theme.tsx')] : []),
  ]),
  route('privacy', 'routes/privacy.tsx'),
  route('*', 'routes/not-found.tsx'),
] satisfies RouteConfig;
```

Update `react-router.config.ts` line 6:

```ts
const pages = ['/', '/check', '/privacy'];
```

- [ ] **Step 2: Update `src/utils/constants.ts`, `src/components/HomeSectionLink/index.tsx`, `src/components/SiteHeader/`, and `src/components/SiteFooter/index.tsx`**

In `src/utils/constants.ts`:

```ts
export const ROUTES = {
  home: '/',
  check: '/check',
  privacy: '/privacy',
} as const;
```

And update `NAV_LINKS` in `src/utils/constants.ts`:

```ts
export const NAV_LINKS = [
  { href: hashLink(SECTIONS.community), label: 'Why us' },
  { href: hashLink(SECTIONS.fees), label: 'Fees' },
  { href: hashLink(SECTIONS.journey), label: 'Journey' },
  { href: hashLink(SECTIONS.universities), label: 'Public vs private' },
  { href: ROUTES.check, label: 'Grade check' },
  { href: hashLink(SECTIONS.faq), label: 'FAQ' },
  { href: hashLink(SECTIONS.contact), label: 'Contact' },
] as const;
```

In `src/components/HomeSectionLink/index.tsx`, support route links (`/check`) and keep `#top`, `#contact`, and `#contact-form` in-page when on `/check` (since `/check` has its own `#top` and embedded `#contact` / `#contact-form`):

```tsx
import type { ComponentProps } from 'react';
import { Link, useLocation } from 'react-router';

import { ROUTES, SECTIONS, hashLink } from '@/utils/constants';

type Props = ComponentProps<'a'> & { href: string };

const SHARED_HASHES = new Set<string>([
  hashLink(SECTIONS.top),
  hashLink(SECTIONS.contact),
  hashLink(SECTIONS.contactForm),
]);

/** Preserve native fragment scrolling when the target section is on the current page, and route otherwise. */
export default function HomeSectionLink({ href, ...props }: Props) {
  const { pathname } = useLocation();
  if (href.startsWith('/')) {
    return <Link to={href} {...props} />;
  }
  const hasSectionOnPage = pathname === ROUTES.home || (pathname === ROUTES.check && SHARED_HASHES.has(href));
  if (href.startsWith('#') && !hasSectionOnPage) {
    return <Link to={{ pathname: ROUTES.home, hash: href }} {...props} />;
  }
  return <a href={href} {...props} />;
}
```

In `src/components/SiteHeader/index.tsx`, use `link.href` instead of `hashLink(link.id)`:

```tsx
          <div className={styles.links}>
            {NAV_LINKS.map((link) => (
              <HomeSectionLink key={link.href} href={link.href} className={styles.link}>
                {link.label}
              </HomeSectionLink>
            ))}
          </div>
```
and in the mobile menu:
```tsx
          {NAV_LINKS.map((link) => (
            <HomeSectionLink key={link.href} href={link.href} onClick={closeMenu} className={styles.menuLink}>
              {link.label}
            </HomeSectionLink>
          ))}
```

In `src/components/SiteHeader/styles.module.scss`, tighten `.full` and `.links` gaps slightly so 7 links + CTA fit comfortably at `1100px`:
- `.full`: change `gap: 22px;` to `gap: 18px;`
- `.links`: change `gap: 18px;` to `gap: 15px;`

In `src/components/SiteFooter/index.tsx`, add `<Link to={ROUTES.check} className={styles.link}>Grade check</Link>` before `Privacy`:

```tsx
              <Link to={ROUTES.check} className={styles.link}>
                Grade check
              </Link>
              <Link to={ROUTES.privacy} className={styles.link}>
                Privacy
              </Link>
```

- [ ] **Step 3: Mirror the nav and footer `Grade check` link in `tests/visual/reference/Germandians v4.dc.html`**

In `tests/visual/reference/Germandians v4.dc.html`:
- In the desktop `<nav>` links container, update `gap:22px` to `gap:18px`, `gap:18px` to `gap:15px`, and insert `<a href="/check" class="nav-link" style="white-space:nowrap;text-decoration:none;padding:6px 0">Grade check</a>` after `Public vs private`.
- In the mobile menu `#mobile-menu`, insert `<a href="/check" onClick="{{ closeMenu }}" style="display:flex;align-items:center;min-height:56px;border-bottom:1px solid #e2ddd0;text-decoration:none;font-family:'Archivo',sans-serif;font-weight:800;font-size:24px">Grade check</a>` after `Public vs private`.
- In `<footer>`, insert `<a href="/check" class="foot-link" style="color:#e3e6ee;text-decoration:none">Grade check</a>` before `Privacy`.

- [ ] **Step 4: Run `npm run typecheck`, `npm run lint`, and `npm run build`**

Run: `npm run typecheck && npm run lint && npm run build`
Expected: PASS, generating `build/client/check/index.html` alongside `build/client/index.html` and `build/client/privacy/index.html`.

---

### Task 5: End-to-End UX & Visual Regression Tests (`tests/ux/interactions.spec.ts` & `tests/visual/`)

**Files:**
- Modify: `tests/ux/interactions.spec.ts`

**Interfaces:**
- Consumes: `/check` page, `German grade` display (`data-testid="german-grade-value"`), `form-snapshot` (`data-testid="form-snapshot"`)
- Produces: Automated Playwright checks covering the calculator math, comma decimals, invalid-min-passing error handling, profile toggles, attached form snapshot, and in-page `#contact-form` anchor behavior.

- [ ] **Step 1: Add `/check` behavioral tests to `tests/ux/interactions.spec.ts`**

Append to `tests/ux/interactions.spec.ts`:

```ts
test('grade check calculates Bavarian grade, handles presets/toggles, and attaches snapshot to the form', async ({ page }) => {
  await page.goto('/check');
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });

  const gradeValue = page.getByTestId('german-grade-value');
  const snapshot = page.getByTestId('form-snapshot');

  // Default: 7.4 / 10 with pass 4.0 -> 2.3
  await expect(gradeValue).toHaveText('2.3');
  await expect(snapshot).toContainText('German grade 2.3 (7.4 / 10, pass 4) · 0 backlogs · 4-year (240 ECTS) · No APS yet');

  // Switch preset to Pass 5.0 -> 7.4 / 10 with pass 5.0 -> 2.6
  await page.getByRole('button', { name: 'CGPA / 10 (Pass 5.0)', exact: true }).click();
  await expect(gradeValue).toHaveText('2.6');

  // Comma decimal input ("8,0" with pass 4.0 -> 2.0)
  await page.getByRole('button', { name: 'CGPA / 10 (Pass 4.0)', exact: true }).click();
  await page.locator('#check-score').fill('8,0');
  await expect(gradeValue).toHaveText('2.0');

  // Invalid min passing = 0 shows alert and clears numeric grade
  await page.locator('#check-min').fill('0');
  await expect(gradeValue).toHaveText('—');
  await expect(page.getByRole('alert')).toContainText('Minimum passing score must be greater than 0');

  // Restore valid min passing and toggle 6+ backlogs & 3-year degree
  await page.locator('#check-min').fill('4');
  await page.getByRole('button', { name: '6+ backlogs', exact: true }).click();
  await page.getByRole('button', { name: '3-year (B.Sc / B.Com / BCA)', exact: true }).click();
  await expect(snapshot).toContainText('German grade 2.0 (8 / 10, pass 4) · 6+ backlogs · 3-year (180 ECTS) · No APS yet');
});
```

- [ ] **Step 2: Run both Playwright suites (`npm run test:ux` and `npm run test:visual`)**

Run: `npm run test:ux && npm run test:visual`
Expected: All UX tests pass and all 37 visual tests pass.

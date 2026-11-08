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

export type GradeBand = 'Top' | 'Strong' | 'Mid' | 'Low' | 'Very low';

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

export interface InvalidFields {
  score?: boolean;
  max?: boolean;
  min?: boolean;
}

export interface CheckDiagnosis {
  grade: number | null;
  gradeFormatted: string | null;
  band: GradeBand | null;
  classification: string;
  formulaText: string;
  scaleNote: string;
  errorText: string | null;
  invalidFields: InvalidFields;
  tiers: UniversityTierResult[];
  headline: string;
  proofText: string | null;
  bullets: { title: string; body: string }[];
  ctaLabel: string | null;
  snapshot: string;
}

/** Parses a numeric string, accepting either "." or "," as the decimal separator. */
export function parseScoreInput(raw: string): number {
  const normalized = raw.trim().replace(',', '.');
  if (!normalized) return Number.NaN;
  return Number(normalized);
}

/**
 * KMK-recommended Modified Bavarian Formula:
 * German grade = 1 + 3 * (Nmax - Nd) / (Nmax - Nmin)
 * Truncates to one decimal place (float-safe). Returns null when inputs are out of range.
 */
export function calculateGermanGrade(score: number, max: number, min: number): number | null {
  if (!Number.isFinite(score) || !Number.isFinite(max) || !Number.isFinite(min)) return null;
  if (min <= 0 || max <= min || score < min || score > max) return null;
  const raw = 1 + (3 * (max - score)) / (max - min);
  const truncated = Math.floor(raw * 10 + 1e-9) / 10;
  return Math.max(1.0, Math.min(4.0, truncated));
}

export function getGradeBand(grade: number): GradeBand {
  if (grade <= 1.5) return 'Top';
  if (grade <= 2.0) return 'Strong';
  if (grade <= 2.5) return 'Mid';
  if (grade <= 3.0) return 'Low';
  return 'Very low';
}

function classifyGermanGrade(grade: number): string {
  if (grade <= 1.5) return 'Sehr gut (Very good)';
  if (grade <= 2.5) return 'Gut (Good)';
  if (grade <= 3.5) return 'Befriedigend (Satisfactory)';
  return 'Ausreichend (Sufficient pass)';
}

function validateInputs(score: number, max: number, min: number): { errorText: string | null; invalidFields: InvalidFields } {
  const invalidFields: InvalidFields = {};
  if (!Number.isFinite(score)) invalidFields.score = true;
  if (!Number.isFinite(max)) invalidFields.max = true;
  if (!Number.isFinite(min)) invalidFields.min = true;

  if (invalidFields.score || invalidFields.max || invalidFields.min) {
    return {
      errorText: 'Enter your score, the maximum possible score, and your university’s minimum passing score.',
      invalidFields,
    };
  }
  if (min <= 0) {
    return {
      errorText: 'Minimum passing score must be greater than 0 (typically 4.0 or 5.0 for CGPA, or 35–40 for percentage).',
      invalidFields: { min: true },
    };
  }
  if (max <= min) {
    return {
      errorText: 'Maximum possible score must be greater than the minimum passing score.',
      invalidFields: { max: true, min: true },
    };
  }
  if (score < min || score > max) {
    return {
      errorText: `Enter a score between ${min} (minimum passing) and ${max} (maximum possible).`,
      invalidFields: { score: true },
    };
  }
  return { errorText: null, invalidFields: {} };
}

const TIER_BADGES: Record<GradeBand, { t1: [string, TierStatusTone]; t2: [string, TierStatusTone]; t3: [string, TierStatusTone] }> = {
  Top: {
    t1: ['Competitive', 'good'],
    t2: ['Strong fit', 'good'],
    t3: ['Strong fit', 'good'],
  },
  Strong: {
    t1: ['Realistic reach', 'good'],
    t2: ['Strong fit', 'good'],
    t3: ['Strong fit', 'good'],
  },
  Mid: {
    t1: ['Selective', 'mid'],
    t2: ['Primary target', 'good'],
    t3: ['Strong fit', 'good'],
  },
  Low: {
    t1: ['Low odds', 'tough'],
    t2: ['Selective', 'mid'],
    t3: ['Primary target', 'good'],
  },
  'Very low': {
    t1: ['Not a fit this intake', 'tough'],
    t2: ['Low odds', 'tough'],
    t3: ['Check subject credits', 'mid'],
  },
};

export function buildCheckDiagnosis(inputs: CheckInputs): CheckDiagnosis {
  const score = parseScoreInput(inputs.score);
  const max = parseScoreInput(inputs.max);
  const min = parseScoreInput(inputs.min);
  const { errorText, invalidFields } = validateInputs(score, max, min);
  const grade = errorText ? null : calculateGermanGrade(score, max, min);
  const gradeFormatted = grade !== null ? grade.toFixed(1) : null;
  const band = grade !== null ? getGradeBand(grade) : null;

  const classification =
    grade !== null ? `German grade · ${classifyGermanGrade(grade)}` : 'Enter valid marks to see your German grade';

  const formulaText =
    grade !== null
      ? `Modified Bavarian formula: 1 + 3 × (${max} − ${score}) / (${max} − ${min}) = ${gradeFormatted}`
      : 'Formula: 1 + 3 × (Max − Your score) / (Max − Min passing)';

  const scaleNote =
    'German scale: 1.0 is best and 4.0 is the minimum pass. Universities may round or weight modules slightly differently; we check your transcript against each programme’s own rule.';

  const badges = band ? TIER_BADGES[band] : null;

  const tier1: UniversityTierResult = {
    id: 'tier-1',
    name: 'Tier 1 · Strict NC public TUs',
    examples: 'e.g. TU Munich, RWTH Aachen, KIT, TU Berlin',
    badge: badges ? badges.t1[0] : 'Enter marks',
    tone: badges ? badges.t1[1] : 'mid',
    description:
      'Seat-capped programmes ranked heavily by grade. Worth 1–2 applications where your bachelor’s ECTS subject credits match the course table in full.',
  };

  const tier2: UniversityTierResult = {
    id: 'tier-2',
    name: 'Tier 2 · Aptitude & SOP-scored public universities',
    examples: 'e.g. TU Darmstadt, FAU Erlangen, TU Dresden, Passau',
    badge: badges ? badges.t2[0] : 'Enter marks',
    tone: badges ? badges.t2[1] : 'mid',
    description:
      'Selection rubrics weigh ECTS credit match, your SOP, and relevant projects alongside your grade. Often the highest-value public target zone.',
  };

  const tier3: UniversityTierResult = {
    id: 'tier-3',
    name: 'Tier 3 · Non-NC public TUs & HAWs',
    examples: 'e.g. TU Dortmund, OVGU Magdeburg, TU Chemnitz, FH Aachen',
    badge: badges ? badges.t3[0] : 'Enter marks',
    tone: badges ? badges.t3[1] : 'mid',
    description:
      'Open admission (zulassungsfrei) once you clear the published grade bar (often 2.5–3.0) and satisfy the required prior subject credits.',
  };

  let headline: string;
  let proofText: string | null;
  let baseBulletBody: string;
  let ctaLabel: string | null;

  switch (band) {
    case 'Top':
      headline = `A ${gradeFormatted} puts Germany’s most competitive public programmes within reach. At this level your grade isn’t what decides it.`;
      proofText =
        'In the Winter 2025 cycle, an applicant with a 7.8 CGPA and 0 backlogs was rejected with a standard, non-personalised SOP at the same German technical university that admitted our 7.1 CGPA student. A strong grade still needs matched ECTS and an SOP written for that course.';
      baseBulletBody =
        'We check every course’s ECTS table against your syllabus, shortlist 1–2 competitive Tier 1 programmes alongside a strong Tier 2 core, and write your SOP by hand with you over several weeks.';
      ctaLabel = 'Plan my shortlist for top programmes';
      break;
    case 'Strong':
      headline = `A ${gradeFormatted} keeps Tier 1 programmes realistic, with aptitude-scored universities as your safe core.`;
      proofText =
        'In the Winter 2025 cycle, an applicant with a 7.8 CGPA and 0 backlogs was rejected with a standard, non-personalised SOP at the same German technical university that admitted our 7.1 CGPA student. How your credits and SOP are presented decides the outcome.';
      baseBulletBody =
        'We pair realistic Tier 1 applications with aptitude-scored Tier 2 universities as your safe core, checking every ECTS requirement against your transcript and writing your SOP by hand with you.';
      ctaLabel = 'Build my shortlist';
      break;
    case 'Mid':
      headline = `A ${gradeFormatted} is realistic for aptitude-scored and non-NC public universities when your shortlist and SOP do the heavy lifting.`;
      proofText =
        'In the Winter 2025 cycle, our student with a 7.1 CGPA (2.4 German grade) and 16 backlogs was admitted to a German technical university while a 7.8 CGPA applicant with 0 backlogs and a standard SOP was rejected.';
      baseBulletBody =
        'Many consultancies see a mid-range grade and steer you into private colleges that pay them commission. We target aptitude-scored and non-NC public courses and write your SOP by hand with you over several weeks.';
      ctaLabel = 'See where my profile gets in';
      break;
    case 'Low':
      headline = `A ${gradeFormatted} still opens German public universities. Strict 2.5 cut-offs are out, so the shortlist matters more than anything.`;
      proofText = `In the review we’ll tell you honestly whether this route is realistic for ${siteConfig.intake} before any work starts.`;
      baseBulletBody =
        'Most consultancies push private colleges here because they earn commission on them. We filter for public programmes without strict grade cut-offs whose subject credits you meet, and write your SOP by hand with you.';
      ctaLabel = 'Find the public programmes that accept me';
      break;
    case 'Very low':
      headline = `With a ${gradeFormatted}, the route is narrower but real: open-admission public programmes whose subject requirements you meet.`;
      proofText = `In the review we check your transcript against them and tell you plainly whether ${siteConfig.intake} is realistic, or what to fix first.`;
      baseBulletBody =
        'We check your subject credits against open-admission public programmes, and tell you plainly before any work starts whether a realistic shortlist exists for this intake.';
      ctaLabel = 'Check if my route is realistic';
      break;
    default:
      headline = 'Enter your marks above to see how German public universities read your profile.';
      proofText = null;
      baseBulletBody =
        'German universities and uni-assist convert your marks using the pass threshold on your transcript. Once entered, we show which public university tiers fit you best.';
      ctaLabel = null;
      break;
  }

  let backlogSuffix = '';
  if (band && inputs.backlogs === '1–5 backlogs') {
    backlogSuffix =
      ' Your 1–5 backlogs are explained once and plainly in the SOP rather than hidden behind vague excuses.';
  } else if (band && inputs.backlogs === '6+ backlogs') {
    if (band === 'Top' || band === 'Strong') {
      backlogSuffix = ` Even with 6+ backlogs, your ${gradeFormatted} grade still carries you—we state the reason for the hard semester once, plainly, and link what followed to the course.`;
    } else if (band === 'Mid') {
      backlogSuffix =
        ' With 6+ backlogs, the SOP does the heavy lifting: we state the reason for the hard semesters once, plainly, and connect your project work directly to the course.';
    } else {
      backlogSuffix =
        ' Because you also have 6+ backlogs, we check that all of them are cleared on your final transcript and address them plainly in the SOP.';
    }
  }

  const gradeBullet = {
    title: band ? 'Shortlist and SOP' : 'Why the pass mark matters',
    body: `${baseBulletBody}${backlogSuffix}`,
  };

  const degreeBullet =
    inputs.degree === '3-year (180 ECTS)'
      ? {
          title: '3-year (180 ECTS) degree check',
          body:
            band === 'Top' || band === 'Strong'
              ? `Some competitive programmes need 210–240 ECTS even with a ${gradeFormatted} grade. Our shortlist filters for public programmes that accept 180 ECTS directly or offer 30 ECTS in bridge modules.`
              : "Many German Master's ask for 210–240 ECTS. In your profile review, we filter specifically for public programmes that accept 180 ECTS directly or let you complete 30 ECTS via bridge modules during your Master's.",
        }
      : {
          title: '240-ECTS module matching',
          body: "Your 4-year degree clears the total credit requirement, so our mentor checks your individual subject buckets (mathematics, core engineering, computing, or business credits) against each university's admission ordinance.",
        };

  const apsBullet =
    inputs.aps === 'No APS yet'
      ? {
          title: `${siteConfig.intake} APS & timeline plan`,
          body: `Because APS verification takes weeks, we start your APS document checklist in Month 1 so paperwork doesn't delay your ${siteConfig.intake} applications.`,
        }
      : {
          title: 'APS ready—straight to shortlisting',
          body: 'With your APS already sorted, we move straight into matching your transcript credits to a university shortlist and drafting your SOP with you.',
        };

  const snapshot =
    band && gradeFormatted !== null
      ? `Band: ${band} · German grade ${gradeFormatted} (${score} / ${max}, pass ${min}) · ${inputs.backlogs} · ${inputs.degree} · ${inputs.aps}`
      : `${inputs.backlogs} · ${inputs.degree} · ${inputs.aps}`;

  return {
    grade,
    gradeFormatted,
    band,
    classification,
    formulaText,
    scaleNote,
    errorText,
    invalidFields,
    tiers: [tier1, tier2, tier3],
    headline,
    proofText,
    bullets: [gradeBullet, degreeBullet, apsBullet],
    ctaLabel,
    snapshot,
  };
}

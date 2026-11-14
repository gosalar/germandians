import { APPLICANT_CONTROL, COMMUNITY, ORIGIN_STORY, STUDENTS_PER_MENTOR, TRACK_RECORD } from '@/utils/constants';

import { ANIMALS, type Animal } from './animals';

/** Words this page owns. Shared facts are imported where they are shown, never retyped here. */
export const ABOUT_COPY = {
  title: 'About us',
  greeting: { de: 'Hallo, wir sind Germandians!', en: 'Hello, we’re Germandians!' },
  introduction:
    'Germandians is a student-led consultancy for Indian students who want to study in Germany. Our mentors are Indian students at German universities, living in Germany now. Each of them went through these steps themselves.',
  storyTitle: 'How we got here',
  teamTitle: 'Meet the team',
  teamLede: 'Pick a portrait to open their Steckbrief: German for a short profile.',
  meaningTitle: 'What that means for you',
  nextTitle: 'Where to next',
  nextBody: 'Start with a profile review, or see the community where Germandians began.',
  communityAction: 'See the community',
  gradeCheckAction: 'Try the grade check',
} as const;

/** Stickers under the introduction. Each one reads a shared fact. */
export const HERO_STICKERS = [
  { id: 'student-led', strong: 'Student-led', text: 'from day one' },
  { id: 'audience', strong: COMMUNITY.size, text: COMMUNITY.label },
  { id: 'track-record', strong: TRACK_RECORD.figure, text: TRACK_RECORD.short },
] as const;

/** The company's story in three steps, from the shared origin and track-record sentences. */
export const MILESTONES = [
  { id: 'start', when: { de: 'Am Anfang', en: 'At the start' }, title: 'A page that answered questions', text: ORIGIN_STORY },
  { id: 'unpaid', when: { de: 'Zwei Jahre lang', en: 'For two years' }, title: 'Guidance before any fee', text: TRACK_RECORD.sentence },
  {
    id: 'today',
    when: { de: 'Heute', en: 'Today' },
    // A non-breaking hyphen keeps "student-led" on one line.
    title: 'A student‑led consultancy',
    text: 'Paid mentoring that starts with a profile review, from mentors who went through each step themselves.',
  },
] as const;

/** A German term with its English meaning. The German is marked `lang="de"` wherever it is shown. */
type Bilingual = { readonly de: string; readonly en: string };

/**
 * The steps every mentor went through themselves, in the order they come, styled as a German form.
 * Only steps the owners have confirmed belong here. Long German words carry a soft hyphen (\u00AD) so
 * they break cleanly on phones; browsers do not all ship German hyphenation.
 */
export const EXPERIENCE_RECORD = {
  title: { de: 'Erfahrungs\u00ADnachweis', en: 'Record of experience' },
  stepColumn: { de: 'Schritt', en: 'Step' },
  doneColumn: { de: 'Erledigt', en: 'Done' },
  steps: [
    { id: 'aps', de: 'APS-Verfahren', en: 'APS procedure' },
    { id: 'applications', de: 'Hochschul\u00ADbewerbungen', en: 'University applications' },
    { id: 'blocked-account', de: 'Sperrkonto', en: 'Blocked account' },
    { id: 'visa', de: 'Visum', en: 'Visa' },
    { id: 'anmeldung', de: 'Anmeldung', en: 'City registration' },
  ],
  stamp: { de: 'Selbst erledigt', en: 'Done ourselves' },
} as const satisfies {
  title: Bilingual;
  stepColumn: Bilingual;
  doneColumn: Bilingual;
  steps: readonly (Bilingual & { readonly id: string })[];
  stamp: Bilingual;
};

/** What the mentors' experience means for an applicant. A summary, not the home page's mentor section. */
export const MEANING_POINTS = [
  {
    title: 'Someone who has done it',
    text: 'Your mentor went through every step in the record above and is studying in Germany now.',
  },
  {
    title: 'Time for your application',
    text: `Each mentor works with up to ${STUDENTS_PER_MENTOR.word} students at a time.`,
  },
  {
    title: 'Your application stays yours',
    text: APPLICANT_CONTROL,
  },
] as const;

/** Labels on the profile sheet. German first, as on a German form, with the English beside it. */
export const PROFILE_LABELS = {
  sheet: { de: 'Steckbrief', en: 'Profile' },
  role: { de: 'Rolle', en: 'Role' },
  university: { de: 'Hochschule', en: 'University' },
  degree: { de: 'Studiengang', en: 'Degree' },
  city: { de: 'Wohnort', en: 'Lives in' },
  background: { de: 'Hintergrund', en: 'Background' },
  experience: { de: 'Erfahrung', en: 'Experience' },
  personal: { de: 'Persönliches', en: 'Personal note' },
  steps: { de: 'Selbst erledigt', en: 'Done themselves' },
  standIn: { de: 'Platzhalter', en: 'Stand-in portrait' },
  open: 'Open the profile of',
  close: { de: 'Schließen', en: 'Close' },
} as const;

type Photo = {
  readonly kind: 'photo';
  /** A Vite import from `src/assets/images/team/<id>.jpg`, so the deployment base path applies. */
  readonly src: string;
  /** Names the person, for example "Portrait of <name>". */
  readonly alt: string;
  readonly width: number;
  readonly height: number;
  /** Focal point for the crop, as CSS `object-position`, for example '50% 30%'. Centred when absent. */
  readonly position?: string;
};

/** A drawn animal standing in for a photo that hasn't arrived. */
type AnimalPortrait = { readonly kind: 'animal'; readonly animal: Animal };

/**
 * One member of the team, exactly as the owners approved it. Every value comes from the person or the
 * owners: never write a name, role, university, biography, photo or detail that they have not supplied.
 */
export type TeamProfile = {
  /** Stable key and anchor (`team-<id>`): lowercase letters, digits and hyphens. Never the person's name. */
  readonly id: string;
  readonly name: string;
  /** Role or contribution, in a few words. */
  readonly role: string;
  /** Short approved biography: two or three sentences. */
  readonly bio: string;
  readonly portrait: Photo | AnimalPortrait;
  readonly university?: string;
  readonly degree?: string;
  /** Where they live now. */
  readonly city?: string;
  readonly background?: string;
  /** Experience relevant to helping applicants. */
  readonly experience?: string;
  /** A short personal detail. */
  readonly personal?: string;
  /** External links. They open in a new tab. */
  readonly links?: readonly { readonly label: string; readonly href: string }[];
  /**
   * A stand-in card, shown until the owners supply this person's profile. It holds only what the page
   * already says of every mentor (`ABOUT_COPY.introduction`) and a drawn animal. The build warns while
   * one is left.
   */
  readonly standIn?: true;
};

/** Optional details in the order the profile sheet shows them. */
export const PROFILE_DETAILS = ['university', 'degree', 'city', 'background', 'experience', 'personal'] as const;

/** A stand-in profile. It names no one and says only what the page already says of every mentor. */
const standIn = (position: number, animal: Animal): TeamProfile => ({
  id: `member-${position}`,
  name: `Team member ${position}`,
  role: 'Mentor',
  bio: 'An Indian student at a German university, living in Germany now, who went through every step on our record of experience.',
  portrait: { kind: 'animal', animal },
  university: 'A German university',
  city: 'Germany',
  standIn: true,
});

/** How a portrait is described: a photo names the person; a stand-in names its animal. */
export const portraitLabel = (profile: TeamProfile) =>
  profile.portrait.kind === 'photo'
    ? profile.portrait.alt
    : `${PROFILE_LABELS.standIn.en}: a ${ANIMALS[profile.portrait.animal].en}`;

/**
 * The team, in the order the owners want them shown. The owners chose to show stand-ins while the site is
 * in development; replace each `standIn(n, animal)` line with that person's approved profile and photo.
 * With an empty list the page renders no team section at all.
 */
export const TEAM: readonly TeamProfile[] = [
  standIn(1, 'peacock'),
  standIn(2, 'stork'),
  standIn(3, 'tiger'),
  standIn(4, 'hedgehog'),
  standIn(5, 'elephant'),
  standIn(6, 'owl'),
];

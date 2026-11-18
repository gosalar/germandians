import { SOURCES } from '@/utils/applicationFacts';
import { NO_LOGIN_NEEDED } from '@/utils/constants';
import type { CsvCopy } from '@/utils/creditMatch';
import { REQUIREMENT_TOPIC_TITLES, requirementsHref } from '@/utils/requirements/topics';

export const CREDIT_MATCH_COPY = {
  title: 'Credit matching',
  german: {
    word: 'Modulabgleich',
    meaning: 'module and credit comparison',
  },
  lede: 'Copy the subject areas and required credits from a programme’s admission page, then map the courses and credits printed on your transcript. Use the worksheet to prepare for the university’s own assessment.',
  badges: [NO_LOGIN_NEEDED, 'Saved in this browser only', 'CSV and print worksheet'],

  rules: {
    heading: 'How this worksheet sums mapped credits',
    items: [
      'Copy required credits as the programme states them on its admission page. Enter your own course credits as printed on your transcript. Do not convert Indian credits or years of study to ECTS, and do not use a credit multiplier.',
      'Map each course to one or more required subject areas. Leave the credit share blank to count all of a course’s credits in one area, or to split its credits evenly across two or more selected areas. Type a share when you want a custom split.',
      'Each area’s mapped total is the sum of the course shares assigned to it. If a course has invalid credits or its assigned shares add up to more than its transcript credits, correct the entries before those shares are counted.',
    ],
  },

  toolbar: {
    downloadCsv: 'Download CSV',
    printWorksheet: 'Print worksheet',
    clearEntries: 'Clear my entries',
    clearConfirmPrompt: 'Clear all entries?',
    clearConfirmYes: 'Yes, clear',
    clearConfirmCancel: 'Cancel',
    storageNote: 'Entries stay in this browser on this device and are never sent anywhere.',
    storageUnavailable:
      'Browser storage is unavailable in this window. Your entries stay on screen until you reload or close the tab, and you can still download the CSV or print.',
    clearedAnnouncement: 'Cleared all entries from this browser.',
    clearFailedAnnouncement: 'Cleared this worksheet on screen. Saved browser data could not be cleared.',
    downloadedAnnouncement: (filename: string) => `Downloaded ${filename}.`,
  },

  context: {
    heading: '1. Programme details (optional)',
    description: 'Included at the top of your printed worksheet and in the CSV file.',
    universityLabel: 'University (optional)',
    universityPlaceholder: 'e.g. RWTH Aachen',
    programmeLabel: 'Master’s programme (optional)',
    programmePlaceholder: 'e.g. Informatics',
    programmeUrlLabel: 'Admission or curriculum page link (optional)',
    programmeUrlPlaceholder: 'https://…',
  },

  areas: {
    heading: '2. Programme’s required subject areas',
    description:
      'Copy each required subject area and its required credits from the programme’s admission page or curriculum form.',
    addLegend: 'Add a required subject area',
    nameLabel: 'Subject area',
    namePlaceholder: 'e.g. Mathematics',
    requiredCreditsLabel: 'Required credits',
    requiredCreditsPlaceholder: 'e.g. 26',
    addButton: 'Add subject area',
    listLabel: 'Entered required subject areas',
    editNameLabel: (index: number) => `Subject area ${index} name`,
    editCreditsLabel: (name: string) => `Required credits for ${name || 'subject area'}`,
    unnamed: (index: number) => `Unnamed subject area ${index}`,
    removeButton: 'Remove',
    removeAriaLabel: (name: string) => `Remove subject area: ${name || 'unnamed subject area'}`,
    empty: 'No subject areas added yet. Add the subject areas your programme asks for above.',
    errors: {
      missingName: 'Enter a subject area name.',
      invalidCredits: 'Enter required credits above 0 using digits, such as 24 or 7.5.',
    },
  },

  courses: {
    heading: '3. Your completed courses',
    description:
      'Enter each completed course with the credits printed on your transcript and an optional module-description link or syllabus reference, then select the subject areas it maps to.',
    addLegend: 'Add a completed course',
    titleLabel: 'Course title',
    titlePlaceholder: 'e.g. Linear Algebra',
    creditsLabel: 'Transcript credits',
    creditsPlaceholder: 'e.g. 4',
    moduleRefLabel: 'Module description link or reference (optional)',
    moduleRefPlaceholder: 'Link or reference',
    draftAreasLegend: 'Map to required subject areas (optional now; you can also map below)',
    noAreasHint: 'Add required subject areas in step 2 to map courses to them.',
    addButton: 'Add course',
    listLabel: 'Entered completed courses',
    editTitleLabel: (index: number) => `Course ${index} title`,
    editCreditsLabel: (title: string) => `Transcript credits for ${title || 'course'}`,
    editModuleRefLabel: (title: string) =>
      `Module description link or reference for ${title || 'course'}`,
    mappingLegend: (title: string) => `Map ${title || 'this course'} to required subject areas`,
    shareLabel: (areaName: string) => `Credit share in ${areaName}`,
    sharePlaceholder: (autoCredits: string) => `Auto (${autoCredits})`,
    mappedSummary: (mapped: string, transcript: string) =>
      `Mapped across selected areas: ${mapped} of ${transcript} transcript credits.`,
    unmappedSummary: 'No transcript credits mapped.',
    exceedsWarning: (allocated: string, transcript: string) =>
      `Assigned shares total ${allocated} credits, which is above this course’s ${transcript} transcript credits.`,
    invalidShareWarning:
      'Enter a credit share from 0 to 10,000 with up to six decimal places, or leave it blank for an automatic split.',
    removeButton: 'Remove',
    removeAriaLabel: (title: string) => `Remove course: ${title || 'unnamed course'}`,
    empty: 'No courses added yet. Add completed courses from your transcript above.',
    errors: {
      missingTitle: 'Enter the course title as shown on your transcript.',
      invalidCredits: 'Enter transcript credits above 0 using digits, such as 4 or 3.5.',
    },
  },

  summary: {
    heading: 'Worksheet summary',
    disclaimer:
      'Personal credit-matching worksheet (Modulabgleich) prepared by the student on Germandians. The totals use your transcript’s credit units. The university assesses your application.',
    contextLabels: {
      university: 'University',
      programme: 'Programme',
      programmeUrl: 'Programme page',
    },
    totalsLine: (areasCount: number, coursesCount: number, mappedCredits: string, transcriptCredits: string) =>
      `${areasCount} subject ${areasCount === 1 ? 'area' : 'areas'} · ${coursesCount} ${coursesCount === 1 ? 'course' : 'courses'} · ${mappedCredits} of ${transcriptCredits} transcript credits mapped`,
    tableColumns: {
      area: 'Subject area',
      required: 'Required credits (programme)',
      mapped: 'Mapped credits (transcript)',
      courses: 'Mapped courses and module references',
    },
    mobileLabels: {
      required: 'Required:',
      mapped: 'Mapped:',
    },
    emptyTable: 'Add required subject areas in step 2 to build the area-by-area table.',
    noMappedCourses: 'Unmapped (0 mapped credits)',
    courseShareBadge: (mapped: string, total: string | null, isPartialOrSplit: boolean) =>
      isPartialOrSplit && total ? `${mapped} of ${total} credits` : `${mapped} credits`,
    moduleRefPrefix: 'Module reference:',
    unmappedAreas: {
      heading: 'Unmapped subject areas',
      lead: 'Areas with 0 mapped credits.',
      emptyNoAreas: 'Add required subject areas above to list any unmapped areas here.',
      none: 'None. Every listed subject area has mapped credits.',
      itemCredits: (required: string) => `${required} required credits`,
    },
    unmappedCourses: {
      heading: 'Unmapped courses',
      lead: 'Courses with no credits counted towards a required subject area.',
      emptyNoCourses: 'Add courses from your transcript above to list any unmapped courses here.',
      none: 'Every listed course contributes credits to at least one subject area.',
      needsCorrection: 'Correct this course’s credits or shares to include it in the totals.',
      itemCredits: (credits: string) => `${credits} transcript credits`,
    },
  },

  sourcesSection: {
    heading: 'University curriculum forms and official guidance',
    ects: {
      heading: 'What ECTS credits are',
      body: 'ECTS (the European Credit Transfer and Accumulation System) is the European credit system, used to make studies and courses easier to compare. ECTS credits measure what a course sets out to teach and the work it takes.',
      source: SOURCES.ects,
    },
    examples: [
      {
        id: 'rwth',
        heading: 'Example: RWTH Aachen, Software Systems Engineering',
        body: 'The admission page lists required courses in four areas, each with its ECTS credits, and asks applicants to upload a module descriptions document with a cover page that maps their courses to the required ones. The page says each application is checked course by course, looking at the courses’ contents and not only their titles and credit points, and that the examination board decides.',
        source: SOURCES.rwthSse,
      },
      {
        id: 'tum',
        heading: 'Example: TUM, Informatics',
        body: 'Applicants upload their curriculum (module descriptions, course catalogue or syllabus), which the programme page calls very important for checking the academic qualification, and an Analysis of the Curriculum form.',
        source: SOURCES.tumInformatics,
      },
    ],
    guideLink: {
      heading: 'More on subject match and credits',
      body: 'Read how subject requirements fit alongside degree recognition, grades, language certificates, APS and application documents.',
      label: `Read ${REQUIREMENT_TOPIC_TITLES['subject-credits']} in the requirements guide`,
      href: requirementsHref('subject-credits'),
    },
  },
} as const;

export const CREDIT_MATCH_CSV_COPY: CsvCopy = {
  worksheetHeading: ['Worksheet', 'Modulabgleich (module and credit comparison)'],
  noteHeading: 'Note',
  noteBody:
    'Personal worksheet prepared by the student on Germandians. The totals use your transcript’s credit units. The university assesses your application.',
  universityHeading: 'University',
  programmeHeading: 'Programme',
  programmeUrlHeading: 'Programme page',
  areaTableHeaders: [
    'Subject area',
    'Required credits (programme)',
    'Mapped credits (transcript)',
    'Mapped courses',
  ],
  courseTableHeaders: [
    'Course title',
    'Transcript credits',
    'Mapped subject area',
    'Mapped credits in area',
    'Module reference',
  ],
  unmappedAreaCell: 'Unmapped (0 mapped credits)',
  unmappedCourseArea: 'Unmapped',
  needsCorrection: 'Credits or shares need correction',
  mappedCourseItem: (title: string, credits: string) => `${title} (${credits})`,
};

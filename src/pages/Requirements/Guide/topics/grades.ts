import { SOURCES } from '@/utils/applicationFacts';
import { ROUTES } from '@/utils/constants';
import { GRADE_COPY } from '@/utils/gradeConversion';
import { REQUIREMENT_TOPIC_TITLES } from '@/utils/requirements/topics';

import type { StandardTopic } from '../types';

/** What the guide says about backlogs; the common questions read it too. */
export const BACKLOGS =
  `A backlog is an exam you failed and still have to clear, or cleared on a later attempt. If you still have exams to clear, your degree is not finished yet: see ${REQUIREMENT_TOPIC_TITLES.degree} for applying before completion. If you cleared backlogs, read what each programme’s rules say about grades and repeated exams.`;

export const grades = {
  kind: 'standard',
  id: 'grades',
  title: REQUIREMENT_TOPIC_TITLES.grades,
  german: { word: 'Noten', meaning: 'grades' },
  summary: GRADE_COPY.meaning,
  need: 'Everyone. Universities set their own admission criteria, and these can include grades.',
  steps: [
    'Find your university’s grading scale: the best possible mark and the minimum mark for the award of the degree.',
    'Use the minimum for passing the whole degree, not the pass mark for a single course.',
    'Convert your overall mark with the grade check to see it on the German scale.',
    'Read your programme’s admission page and regulations for any minimum grade, ranking or selection test, and for how it converts grades.',
  ],
  // Step 3's tool, in view without opening "More detail".
  link: { label: 'Open the grade check', to: ROUTES.check },
  sources: [SOURCES.gradeConversion, SOURCES.india, SOURCES.masters],
  detail: [
    {
      heading: 'What a conversion is for',
      body: `German grades run from 1.0, the best, to 4.0, the lowest pass. The Modified Bavarian formula (modifizierte bayerische Formel) places a mark on that scale using the best mark and the lowest pass mark of the original grading scale. ${GRADE_COPY.formulaSource} The formula’s result is cut to one decimal place, not rounded.`,
      source: SOURCES.gradeFormula,
      link: { label: 'Convert your marks with the grade check', to: ROUTES.check },
    },
    {
      heading: 'What a conversion cannot tell you',
      body: 'A conversion is a first estimate. Example: TUM says the results of its own grade converter are for reference only and not binding, that official conversions are governed by the regulations of each degree programme, and that grading systems may differ substantially from country to country.',
      source: SOURCES.gradeConversion,
    },
    {
      heading: 'Which numbers to use',
      body: `uni-assist (explained under ${REQUIREMENT_TOPIC_TITLES.applying}) asks applicants who studied in India for their university’s grading system: the best mark and the minimum needed for the award of the degree. It does not accept the minimum for passing a single course, and notes that many Indian universities set the two separately. The grading system is often in your academic regulations, your graduation requirements or on the back of your transcript.`,
      source: SOURCES.india,
    },
    {
      heading: 'Minimum grades, ranking and selection',
      body: 'uni-assist lists grades among the criteria universities may set, and each programme says how it uses them. Example: TUM’s Informatics master’s uses a two-stage aptitude assessment, in which an admission committee decides whether an application is admitted, rejected or invited to a written test.',
      source: SOURCES.tumInformatics,
    },
    {
      heading: 'NC and open admission',
      body: 'NC (numerus clausus) means a programme has restricted admission. Open admission does not mean there are no academic requirements. Example: RWTH Aachen lists its Software Systems Engineering master’s as open admission, and the same page sets formal and subject requirements that an application must meet; applications that do not meet the formal requirements are rejected.',
      source: SOURCES.rwthSse,
    },
    {
      heading: 'Backlogs',
      body: BACKLOGS,
    },
  ],
} satisfies StandardTopic;

import { SOURCES } from '@/utils/applicationFacts';
import { REQUIREMENT_TOPIC_TITLES } from '@/utils/requirements/topics';

import { DEGREE_LENGTH_CREDITS } from '../../NextSteps/data';
import type { StandardTopic } from '../types';

export const subjectCredits = {
  kind: 'standard',
  id: 'subject-credits',
  title: REQUIREMENT_TOPIC_TITLES['subject-credits'],
  german: { word: 'Leistungspunkte', meaning: 'credit points' },
  summary: `Each programme publishes the subjects and credits it expects in its admission rules. Compare them with your transcripts and module descriptions. ${DEGREE_LENGTH_CREDITS}`,
  need: 'Everyone. A master’s generally needs a bachelor’s in a related subject, and the programme decides whether your courses match its requirements.',
  steps: [
    'Open the programme’s admission page and find its subject requirements, often a list of subject areas or courses with credits.',
    'Gather your transcripts and the module descriptions (syllabus) for each course you studied.',
    'Match each required subject to one or more of your courses by content, not only by title and credits.',
    'Check total credits and subject credits separately against the programme’s rules.',
    'Fill in any form the programme provides for this, such as RWTH Aachen’s cover page or TUM’s Analysis of the Curriculum.',
  ],
  sources: [SOURCES.masters, SOURCES.rwthSse, SOURCES.tumInformatics],
  detail: [
    {
      heading: 'What ECTS credits are',
      body: 'ECTS (the European Credit Transfer and Accumulation System) is the European credit system, used to make studies and courses easier to compare. ECTS credits measure what a course sets out to teach and the work it takes. Programme pages often state their subject requirements in ECTS credits, as the RWTH Aachen example below does.',
      source: SOURCES.ects,
    },
    {
      heading: 'Degree length and credits',
      body: `${DEGREE_LENGTH_CREDITS} Do not work out ECTS from your years of study; read how the programme states its credit requirement.`,
    },
    {
      heading: 'Example: RWTH Aachen, Software Systems Engineering',
      body: 'The admission page lists required courses in four areas, each with its ECTS credits. Mathematics, for example, is Calculus (8), Discrete structures (6), Linear algebra (6) and Introduction to applied stochastics (6). The page says each application is checked course by course, looking at the courses’ contents and not only their titles and credit points; a small margin exists if a few courses are not matched, and the examination board decides. Applicants upload a module descriptions document with a cover page that maps their courses to the required ones.',
      source: SOURCES.rwthSse,
    },
    {
      heading: 'Example: TUM, Informatics',
      body: 'The programme page says a bachelor’s in Informatics or Computer Science equivalent to the B.Sc. Informatics taught at TUM is eligible, and that other programmes do not qualify. Applicants upload their curriculum (module descriptions, course catalogue or syllabus), which the page calls very important for checking the academic qualification, and an Analysis of the Curriculum form.',
      source: SOURCES.tumInformatics,
    },
    {
      heading: 'Where to look on a programme’s page',
      body: 'Look for a section on admission or qualification requirements: RWTH Aachen heads its section “Special admission requirements” and TUM “Qualification Requirements and Assessment Process”. Some programmes describe their rules on the page and point to the official regulations; RWTH Aachen, for example, says its requirements are defined in the programme’s examination regulations, which are in German, and describes them in English on the page.',
      source: SOURCES.rwthSse,
    },
  ],
} satisfies StandardTopic;

import { DMAT, SOURCES } from '@/utils/applicationFacts';
import { REQUIREMENT_TOPIC_TITLES } from '@/utils/requirements/topics';

import type { StandardTopic } from '../types';

export const deadlines = {
  kind: 'standard',
  id: 'deadlines',
  title: REQUIREMENT_TOPIC_TITLES.deadlines,
  german: { word: 'Fristen', meaning: 'deadlines' },
  summary:
    'Each programme publishes its own intakes, application window and document deadlines, and they can differ by your nationality and where your certificates are from.',
  need: 'Everyone. Many programmes start only in the winter semester, so check which intakes your programme offers before you plan around one.',
  steps: [
    'On each programme’s page, find the semester or semesters it starts in.',
    'Note the application window and the deadline for your applicant group, such as applicants from outside the EU.',
    'Note any separate deadlines for documents, test results and enrolment.',
    'If the programme uses uni-assist or a VPD (both explained under How to apply), plan that step so it is done before the university’s deadline.',
    'Write each date down with the link to the page it came from, and check that page again before you apply.',
  ],
  sources: [
    SOURCES.masters,
    SOURCES.tumInformatics,
    SOURCES.rwthSse,
    SOURCES.apsFaqs,
    SOURCES.tumAps,
    SOURCES.visaChecklist,
    SOURCES.daadEnrolling,
  ],
  detail: [
    {
      heading: 'Winter and summer semester',
      body: 'At most universities, the winter semester runs from 1 October to 31 March and the summer semester from 1 April to 30 September. Universities of applied sciences (Fachhochschulen) often start and end their semesters a month earlier.',
      source: SOURCES.semesters,
    },
    {
      heading: 'Where dates are published',
      body: 'A programme’s dates are on its own admission or application page. uni-assist says official information on applying to the universities it works with is only on the universities’ websites, that master’s deadlines are often earlier than bachelor’s deadlines, and that deadlines can depend on the course, your nationality and the country your certificates are from. If you apply through uni-assist, it advises applying as early as possible, ideally at least eight weeks before the end of the application deadline.',
      source: SOURCES.masters,
    },
    {
      heading: 'Example: a programme with two intakes',
      body: 'TUM’s MSc Informatics starts in the summer or winter semester. Its application period is 1 February to 31 May for the winter semester and 1 October to 30 November for the summer semester, and TUM recommends that applicants who need a visa apply between 1 February and 31 March for the winter semester, or during October for the summer semester. The page says missing application documents cannot be submitted after the official deadline.',
      source: SOURCES.tumInformatics,
    },
    {
      heading: 'Example: a programme with one intake',
      body: 'RWTH Aachen’s Software Systems Engineering master’s starts each winter semester. For applicants from outside the EU and EEA starting in the first semester, the deadline is 1 March, and the page calls it strict. Where the programme asks for a GRE result, it cannot be handed in after that deadline.',
      source: SOURCES.rwthSse,
    },
    {
      heading: 'Example: what can run side by side',
      body: `This example shows order, not timing. Choosing programmes comes first, because their pages decide everything else. After that, several things can run at once: a language test, collecting transcripts and translations, and the APS procedure where it applies. APS (Akademische Prüfstelle, the Academic Evaluation Center) verifies academic documents issued by Indian institutions. ${DMAT.about} ${DMAT.sequenceParts.order}`,
      source: SOURCES.dmat,
    },
    {
      heading: 'Example: what waits for what',
      body: 'Some steps need an earlier one. At TUM, for example, applicants whose bachelor’s is from India upload their APS certificate to uni-assist with their other documents after applying online for the VPD, and the VPD then goes with their application to TUM. The visa application needs your admission letter, and enrolling at the university needs your passport with the visa or residence permit.',
      source: SOURCES.tumAps,
    },
  ],
} satisfies StandardTopic;

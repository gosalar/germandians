import { APS, DMAT, SOURCES, UNI_ASSIST, type OfficialSource } from '@/utils/applicationFacts';
import type { RequirementTopicId } from '@/utils/requirements/topics';

import { VPD_ABOUT } from '../Guide/topics/applying';
import { DEGREE_RECOGNITION } from '../Guide/topics/degree';
import { BACKLOGS } from '../Guide/topics/grades';

export const COMMON_QUESTIONS_COPY = {
  heading: 'Common questions',
} as const;

/** One question and a short answer that ends with a link to its topic. */
export interface CommonQuestion {
  question: string;
  /** Plain text that opens with a direct answer. The component adds the topic links after it. */
  answer: string;
  /** The topic the answer links to, and a second one when the answer names it. */
  topics: readonly [RequirementTopicId] | readonly [RequirementTopicId, RequirementTopicId];
  /** The official pages, when the answer states a rule. */
  sources?: readonly OfficialSource[];
}

/**
 * Each answer is a short version of its topics, built from sentences the topics already state (read from
 * the topic where a whole sentence fits). An answer never says anything its topics do not.
 */
export const COMMON_QUESTIONS: readonly CommonQuestion[] = [
  {
    question: 'Is a three-year bachelor’s degree enough?',
    answer:
      'The number of years does not decide it on its own. Look up your exact degree title in anabin, Germany’s database of foreign qualifications: it records a classification for each degree, with its length as one part of the description. Then read each programme’s own rule for the degree and credits it asks for.',
    topics: ['degree', 'subject-credits'],
    sources: [SOURCES.anabinDegrees],
  },
  {
    question: 'Can I apply before I finish my bachelor’s?',
    answer:
      'Some universities accept applications before the degree is complete. Each programme sets when you must prove you have finished, so check whether each programme accepts applications before completion and when it wants proof that you have finished.',
    topics: ['degree'],
    sources: [SOURCES.masters],
  },
  {
    question: 'Can I apply with backlogs?',
    answer: `It depends on whether you still have exams to clear, and on each programme’s rules. ${BACKLOGS}`,
    topics: ['grades', 'degree'],
  },
  {
    question: 'Can I apply with lower grades?',
    answer:
      'Universities set their own admission criteria, and these can include grades. Read your programme’s admission page and regulations for any minimum grade, ranking or selection test. A converted grade does not tell you whether you meet a programme’s requirements.',
    topics: ['grades'],
    sources: [SOURCES.masters],
  },
  {
    question: 'Can I apply while my language test result is pending?',
    answer:
      'That depends on the programme. On its page, look for a separate deadline for test results and documents, and check whether anything can be sent after the application deadline. Example: TUM’s MSc Informatics page says missing application documents cannot be submitted after the official deadline.',
    topics: ['deadlines', 'language'],
    sources: [SOURCES.tumInformatics],
  },
  {
    question: 'Can I use a medium-of-instruction letter instead of a language test?',
    answer:
      'Whether a programme accepts it in place of a test is that programme’s rule, so look for it in the language section of its admission rules. For the visa, the German Missions’ visa FAQs say not to submit exemption letters or medium-of-instruction certificates.',
    topics: ['language'],
    sources: [SOURCES.visa],
  },
  {
    question: 'What is APS, and do I need it?',
    answer: `${APS.about} ${APS.need} ${APS.programmes} APS does not decide on admission or on visas; universities and the German Missions do.`,
    topics: ['aps-dmat'],
    sources: [SOURCES.apsFaqs],
  },
  {
    question: 'Do I need dMAT?',
    answer: `${DMAT.about} ${DMAT.summary} If your degree is in one of the ${DMAT.fieldsName} and no exemption applies, you register for dMAT separately with g.a.s.t.`,
    topics: ['aps-dmat'],
    sources: [SOURCES.dmat],
  },
  {
    question: 'Is my degree recognised in Germany?',
    // The degree topic's summary with its anabin sentence first, so the answer opens with where to look.
    answer: `${DEGREE_RECOGNITION.lookup} ${DEGREE_RECOGNITION.rule} ${DEGREE_RECOGNITION.criteria}`,
    topics: ['degree'],
    sources: [SOURCES.anabin, SOURCES.masters],
  },
  {
    question: 'Do I need the GRE, GMAT or another test?',
    answer:
      'Not every programme asks for one, so check whether each programme asks for a test such as the GRE or GMAT, or holds an admission test or interview. Example: TUM’s MSc Informatics asks applicants with a degree from India for a GRE General Test result or, alternatively, an Indian GATE scorecard.',
    topics: ['applying'],
    sources: [SOURCES.tumInformatics],
  },
  {
    question: 'Do I apply through uni-assist or directly to the university?',
    answer: `The university decides which route each programme and applicant group uses, so follow the route your programme’s page names. It may be the university’s own portal, uni-assist, or a VPD from uni-assist followed by your own application to the university. ${UNI_ASSIST.about} ${VPD_ABOUT}`,
    topics: ['applying'],
    sources: [SOURCES.uniAssistUniversities],
  },
  {
    question: 'What if I missed a deadline, or I’m not sure of it?',
    answer:
      'A programme’s dates are on its own admission or application page, and they can differ by your nationality and where your certificates are from. Some are strict: RWTH Aachen’s Software Systems Engineering page, for example, calls its deadline strict. If you missed one, check which intakes the programme offers before you plan around the next: many programmes start only in the winter semester.',
    topics: ['deadlines'],
    sources: [SOURCES.rwthSse],
  },
];

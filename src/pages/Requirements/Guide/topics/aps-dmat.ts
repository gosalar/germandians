import { APS, DMAT, DMAT_LABELS, SOURCES } from '@/utils/applicationFacts';
import { REQUIREMENT_TOPIC_TITLES } from '@/utils/requirements/topics';

import { STEP_COPY } from '../../NextSteps/data';
import { TOPIC_CARD_COPY } from '../data';
import type { StandardTopic } from '../types';

const { earlierApplications } = DMAT;

/**
 * APS first, then the dMAT facts the site already holds, in the order `DmatNote` shows the full rule.
 * The three APS status entries read the next-steps slip's wording, so the guide and the slip say the same thing.
 */
export const apsDmat = {
  kind: 'standard',
  id: 'aps-dmat',
  title: REQUIREMENT_TOPIC_TITLES['aps-dmat'],
  german: { word: 'Prüfstelle', meaning: 'verification office' },
  // Each name explained where it first appears: what dMAT is comes from `SOURCES.dmat`, in "Where to check".
  summary: `${APS.about} ${DMAT.about}`,
  // APS first, from "What APS is" and "Who needs APS" below; then the dMAT rule in one line, which says why it sits with APS.
  need: `${APS.need} ${APS.programmes} ${DMAT.summary}`,
  steps: [
    `Check the dMAT rules under ${TOPIC_CARD_COPY.moreDetail}: if your degree is in one of the ${DMAT.fieldsName} and no exemption applies, register for dMAT separately with g.a.s.t.`,
    // The slip's "Not started" step, so the guide and the slip start APS the same way.
    STEP_COPY['aps-not-started'].text,
    'Register online on the APS India website and pay the APS fee.',
    'Send copies of the documents on the checklist for your procedure by courier, with the signed application form; never send originals.',
    'Check your status in the APS online student portal. The certificate arrives as a PDF by email: send it unchanged to universities, uni-assist (explained under How to apply) and the German Missions, without renaming, editing or merging it.',
  ],
  sources: [SOURCES.apsQuiz, SOURCES.aps, SOURCES.apsFaqs, SOURCES.tumAps, SOURCES.dmat, SOURCES.test],
  detail: [
    {
      heading: 'What APS is',
      body: 'APS India (Academic Evaluation Center, part of the German Embassy in New Delhi) verifies academic documents and qualifications issued by Indian institutions, and its certificate is generally required for the German student visa.',
      source: SOURCES.apsFaqs,
    },
    {
      heading: 'Who needs APS',
      body: 'What counts is where your documents were issued, not your nationality: APS checks documents from Indian institutions. APS India lists cases where you may not need it, such as a degree not issued by an Indian institution. APS does not decide on admission or on visas; universities and the German Missions do.',
      source: SOURCES.apsFaqs,
    },
    { heading: 'If you have not started APS', body: STEP_COPY['aps-not-started'].text, source: STEP_COPY['aps-not-started'].source },
    { heading: 'If you have applied and are waiting', body: STEP_COPY['aps-applied'].text, source: STEP_COPY['aps-applied'].source },
    { heading: 'If you have your APS certificate', body: STEP_COPY['aps-certificate'].text, source: STEP_COPY['aps-certificate'].source },
    { heading: DMAT_LABELS.fields, body: DMAT.fields, source: SOURCES.dmat },
    { heading: DMAT_LABELS.exemptions, body: DMAT.exemptionsLead, list: DMAT.exemptions, source: SOURCES.dmat },
    // The two slip steps for earlier applications both end on new applications: said once here.
    {
      heading: DMAT_LABELS.transition,
      body: `${earlierApplications.completed} ${earlierApplications.transition} ${earlierApplications.newApplications}`,
      source: SOURCES.dmat,
    },
    { heading: DMAT_LABELS.sequence, body: DMAT.sequence, source: SOURCES.dmat },
    // The fee is stated on the APS dMAT page, not on the g.a.s.t. schedule, so it sits with the dMAT rules.
    { heading: DMAT_LABELS.fee, body: DMAT.feeNote, source: SOURCES.dmat },
    {
      heading: DMAT_LABELS.windows,
      body: '',
      table: {
        columns: ['Test date', 'Register by', 'Results'],
        rows: DMAT.windows.map((window) => [window.test, window.deadline, window.results]),
      },
      source: SOURCES.test,
    },
  ],
} satisfies StandardTopic;

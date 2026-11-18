import { SOURCES, UNI_ASSIST } from '@/utils/applicationFacts';
import { ROUTES } from '@/utils/constants';
import { REQUIREMENT_TOPIC_TITLES } from '@/utils/requirements/topics';

import type { StandardTopic } from '../types';

/** The VPD in one plain sentence, from "The VPD route" below. The common questions read it too. */
export const VPD_ABOUT = 'A VPD is a certificate from uni-assist that says how it evaluates your documents and rates your grade on the German scale.';

export const applying = {
  kind: 'standard',
  id: 'applying',
  title: REQUIREMENT_TOPIC_TITLES.applying,
  german: { word: 'Bewerbung', meaning: 'application' },
  // uni-assist and the VPD are explained where they first appear; "More detail" says more about each.
  summary: `You apply straight to the university, through uni-assist, or with a VPD from uni-assist followed by your own university application. ${UNI_ASSIST.about} ${VPD_ABOUT} Each programme says which route it uses.`,
  need: 'Everyone applying for a master’s place. The university decides which route each programme and applicant group uses, so follow the route your programme names.',
  steps: [
    'Open each programme’s admission or application page and find how it asks you to apply.',
    'Note whether it uses its own online portal, uni-assist, or a VPD before its own application.',
    'Look your university up in uni-assist’s list of universities, then confirm the route on the university’s own website.',
    'If the programme needs a VPD, request it in My assist, uni-assist’s online account, then apply to the university with it before the university’s deadline.',
    'Check whether the programme asks for a test such as the GRE or GMAT, or holds an admission test or interview.',
  ],
  sources: [
    SOURCES.masters,
    UNI_ASSIST.source,
    SOURCES.uniAssistUniversities,
    SOURCES.vpd,
    SOURCES.tumAdmissionProcedures,
  ],
  detail: [
    {
      heading: 'Application plan',
      body: 'Keep the programmes, dates and documents you find in one place.',
      link: { label: 'Open the application plan', to: ROUTES.applicationPlan },
    },
    {
      heading: 'Applying directly',
      body: 'Some programmes take applications in the university’s own online portal. Example: RWTH Aachen’s Software Systems Engineering master’s asks you to apply through RWTHonline, its application portal. Its page does not mention uni-assist or a VPD.',
      source: SOURCES.rwthSse,
    },
    {
      heading: 'Applying through uni-assist',
      body: 'uni-assist processes applications for many German universities. You apply in My assist, its online account. uni-assist does not handle every application to the universities it works with: each university decides which programmes and applicant groups go through it, and official information on applying is only on the universities’ own websites.',
      source: SOURCES.uniAssistUniversities,
    },
    {
      heading: 'The VPD route',
      body: 'A VPD (Vorprüfungsdokumentation, preliminary review documentation) is a certificate from uni-assist stating which certificates you submitted, how uni-assist evaluates them and how it rates your grade in the German grading system. Requesting it is not an application to the university. Once you have it, you apply directly to the university and upload the VPD with your other application documents before the university’s deadline. A VPD is valid for one year from its date of issue.',
      source: SOURCES.vpd,
    },
    {
      heading: 'Example: one programme’s route and tests',
      body: 'TUM’s MSc Informatics says applicants whose bachelor’s is not from Germany must get a VPD from uni-assist in addition to the TUM application, and that a VPD application alone does not count as applying to TUM. The same page asks applicants with a degree from India for a GRE General Test result or, alternatively, an Indian GATE scorecard, and describes a two-stage aptitude assessment that includes a written test.',
      source: SOURCES.tumInformatics,
    },
    {
      heading: 'Example: a GMAT requirement',
      body: 'TUM’s Master in Management in Munich asks applicants with a bachelor’s degree from India to submit a GMAT result. Not every programme asks for it, so read each programme’s own page.',
      source: SOURCES.tumManagement,
    },
    {
      heading: 'Interviews and admission tests',
      body: 'Some programmes go beyond documents. Example: at TUM, the written documents in a master’s application are scored with a points system, and the procedure can include an interview or test. Which grades count and how they are weighted depends on the programme, and TUM points to each programme’s academic and examination regulations for the details.',
      source: SOURCES.tumAdmissionProcedures,
    },
  ],
} satisfies StandardTopic;

import { SOURCES, UNI_ASSIST } from '@/utils/applicationFacts';
import { ROUTES } from '@/utils/constants';
import { REQUIREMENT_TOPIC_TITLES } from '@/utils/requirements/topics';

import type { StandardTopic } from '../types';

export const documents = {
  kind: 'standard',
  id: 'documents',
  title: REQUIREMENT_TOPIC_TITLES.documents,
  german: { word: 'Unterlagen', meaning: 'documents' },
  summary:
    'The papers each part of your application asks for. The university, APS (the German Embassy’s check of Indian academic documents) and the German Missions each publish their own list: follow each body’s list for what you send it, and expect that any of them may ask for more.',
  need: 'Everyone sends documents, but which ones depends on the university and the programme. Work from each programme’s own list, not a general one.',
  steps: [
    'Open each programme’s application page on the university’s website and copy its document list, with any rules on format, translation or certified copies.',
    `If a programme takes applications through uni-assist (explained under ${REQUIREMENT_TOPIC_TITLES.applying}), read uni-assist’s pages on certificates and translations and its notes for India.`,
    'For APS, follow the APS India checklist for graduates: copies only, sent by courier, never originals.',
    'For the visa, follow the German Missions’ student visa checklist, linked below.',
  ],
  sources: [
    UNI_ASSIST.source,
    SOURCES.uniAssistFaqs,
    SOURCES.uniAssistCertificates,
    SOURCES.india,
    SOURCES.aps,
    SOURCES.visaChecklist,
  ],
  detail: [
    {
      heading: 'German words on forms',
      body: 'Look up German words you may see on forms, transcripts and university portals.',
      link: { label: 'Open the German words glossary', to: ROUTES.germanWords },
    },
    {
      heading: 'Degree and mark sheets',
      body: 'Your degree certificate and your mark sheets for every semester show what you studied and your results. uni-assist asks for every certificate in full, with no pages left out, and for an official document on your university’s grading system, such as the examination regulations, if your transcript does not show it. It uses the grading system to calculate your grade.',
      source: SOURCES.uniAssistCertificates,
    },
    {
      heading: 'Translations and official documents',
      body: 'uni-assist asks for certificates in their original language with a translation into German or English, unless they are also issued in German or English. A translation must come from a sworn or court-admissible translator, or from a department of the issuing institution that is authorised to issue translations. It counts a certificate as official when it carries the institution’s signature and stamp, a note that it was issued automatically, or a verification code. A university may set further rules, so check its own page too.',
      source: SOURCES.uniAssistCertificates,
    },
    {
      heading: 'CV, motivation letter and references',
      body: 'uni-assist says the documents needed depend on the university and course. Some ask for a CV with no gaps, a letter of motivation explaining why you are applying, letters of recommendation from your professors, or proof of internships; portfolios are usually asked for in art or architecture. Put the university and programme in bold at the top of a motivation letter so it reaches the right application.',
      source: SOURCES.uniAssistOtherDocuments,
    },
    {
      heading: 'SOP planner',
      body: 'If a programme asks for a motivation letter or Statement of Purpose, you can structure your notes in your own words in the SOP planner.',
      link: { label: 'Open the SOP planner', to: ROUTES.sopPlanner },
    },
    {
      heading: 'For APS',
      body: 'APS has its own list for graduates: the printed and signed application form, the fee receipt, copies of your Aadhaar card and passport, Class X and XII mark sheets and certificates, mark sheets for all semesters, your degree or provisional certificate, a dMAT certificate where that test applies to you, and a signed Student Authorisation Letter. A language certificate is not mandatory for APS. Send copies by courier, never originals, with a notarised English translation of anything not in English.',
      source: SOURCES.aps,
    },
    {
      heading: 'For the visa',
      body: 'The student visa list is separate again. Among other things, the German Missions’ checklist asks for your passport, previous degree and mark sheets, a recognised language certificate, the APS certificate where it applies, an admission letter, a motivation letter, a CV, proof of how you will pay for your living costs, and health insurance valid from your arrival date. Read the checklist itself for what each item must show.',
      source: SOURCES.visaChecklist,
    },
  ],
} satisfies StandardTopic;

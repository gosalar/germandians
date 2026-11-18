import { SOURCES } from '@/utils/applicationFacts';
import { ARRIVAL_SUPPORT, ROUTES, SECTIONS } from '@/utils/constants';
import { REQUIREMENT_TOPIC_TITLES } from '@/utils/requirements/topics';

import type { StandardTopic } from '../types';

export const visaEnrolment = {
  kind: 'standard',
  id: 'visa-enrolment',
  title: REQUIREMENT_TOPIC_TITLES['visa-enrolment'],
  german: { word: 'Visum', meaning: 'visa' },
  summary:
    'With your admission letter you apply to the German Missions in India for a student visa, then enrol at your university. The German Missions and the university each set their own requirements.',
  need: 'Anyone travelling from India for a master’s. The German Missions ask anyone staying in Germany for more than 90 days to apply for a national visa, and every admitted student enrols at their university.',
  steps: [
    'Read the German Missions’ checklist for studies: it lists the documents the visa needs.',
    'Start the application in the Consular Service Portal, which asks you some questions first and gives you a link to book an appointment at the end.',
    'Arrange health insurance that is valid from your intended date of arrival in Germany.',
    'If your admission comes with conditions, check that they are written in your admission letter.',
    'Find your university’s enrolment page and note its documents and deadline.',
  ],
  sources: [
    SOURCES.visaChecklist,
    SOURCES.visaFee,
    SOURCES.daadEnrolling,
    SOURCES.daadHealthInsurance,
  ],
  detail: [
    {
      heading: 'The visa instructions',
      body: 'The German Missions in India publish a checklist for each visa category; for a master’s, use the one for studies. It asks for, among other things, your admission letter for a full-time, in-person degree programme at a German university, proof that you can finance your stay, and a certificate of health insurance. It has its own rules on language evidence and on the APS certificate, separate from your university’s. The German Missions may ask for more documents, and handing in every document does not guarantee a visa.',
      source: SOURCES.visaChecklist,
    },
    {
      heading: 'Conditions in your admission letter',
      body: 'An admission can come with conditions you still have to meet, such as proof of knowledge of the study language. The visa checklist asks for any such conditions to be noted in the admission letter.',
      source: SOURCES.visaChecklist,
    },
    {
      heading: 'Health insurance',
      body: 'Health insurance comes up twice. For the visa, the checklist asks for a certificate of compulsory health insurance (gesetzliche oder private Krankenversicherung: statutory or private health insurance) valid from your intended date of arrival in Germany. When you enrol, the university asks for proof of health insurance. The DAAD explains the two types of insurance.',
      source: SOURCES.daadHealthInsurance,
    },
    {
      heading: 'Enrolling at the university',
      body: 'Enrolling (Immatrikulation) is what makes you a student. You can enrol as soon as you receive your admission letter, and you must do it before the deadline your university sets: if you are too late or documents are missing, you cannot enrol. The usual documents are your passport with visa or residence permit, your admission letter and proof of health insurance, and the university’s International Office tells you exactly what you need.',
      source: SOURCES.daadEnrolling,
    },
    {
      heading: 'Example: a document needed to enrol',
      body: 'TUM’s MSc Informatics says that to enrol you must provide proof that you have completed your bachelor’s degree, among other documents. Without it by the enrolment deadline, you cannot enrol for that semester.',
      source: SOURCES.tumInformatics,
    },
    {
      heading: 'Budget planner',
      body: 'Compare your own monthly spending with the official blocked-account reference rate in the budget planner.',
      link: { label: 'Open the budget planner', to: ROUTES.budget },
    },
    {
      heading: 'Housing help',
      body: ARRIVAL_SUPPORT.availability,
      link: { label: 'Read about housing help', to: `${ROUTES.home}#${SECTIONS.housing}` },
    },
    {
      heading: 'Arrival checklist',
      body: 'Once you arrive, the arrival checklist takes you through registering your address, the tax ID, enrolment, a bank account and the residence permit.',
      link: { label: 'Arrival checklist', to: ROUTES.arrival },
    },
  ],
} satisfies StandardTopic;

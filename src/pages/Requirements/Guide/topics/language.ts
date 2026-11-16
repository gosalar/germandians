import { GERMAN_MISSIONS, SOURCES } from '@/utils/applicationFacts';
import { GERMAN_LESSONS, ROUTES } from '@/utils/constants';
import { REQUIREMENT_TOPIC_TITLES } from '@/utils/requirements/topics';

import type { StandardTopic } from '../types';

export const language = {
  kind: 'standard',
  id: 'language',
  title: REQUIREMENT_TOPIC_TITLES.language,
  german: { word: 'Sprachnachweis', meaning: 'proof of language' },
  summary:
    'Proof that you can study in the programme’s language. Each programme sets the certificates, levels and scores it accepts, and the visa has its own rule.',
  need: 'Programmes taught in German ask for German; programmes taught in English ask for English, and some also ask for German. The student visa asks for language proof separately from your admission.',
  steps: [
    'Find the language section in each programme’s admission rules on the university’s website and note the certificates, levels and minimum scores it names.',
    'If you hope to use a medium-of-instruction letter (one showing that your degree was taught in English) or an exemption, find where that programme’s rules say it is accepted before you rely on it.',
    // The first place the page names the German Missions, so it says who they are.
    `Plan for a recognised certificate for the visa as well. The visa is decided by ${GERMAN_MISSIONS.about}, and they do not accept exemption or medium-of-instruction letters.`,
    'Read the German Missions’ student visa checklist, linked below, for the certificates and level the visa asks for.',
  ],
  sources: [SOURCES.uniAssistLanguage, SOURCES.visaChecklist, SOURCES.visa, SOURCES.visaFee, SOURCES.apsFaqs],
  detail: [
    {
      heading: 'What the university asks for',
      body: `Each university decides which certificates it accepts and what level or minimum score it needs, and this can differ between programmes. For German, uni-assist (explained under ${REQUIREMENT_TOPIC_TITLES.applying}) says all universities accept the DSH, TestDaF, Goethe-Institut certificates and the DSD (Deutsches Sprachdiplom, a German language diploma), though the level needed still varies. For English, universities set their own minimum IELTS or TOEFL scores.`,
      source: SOURCES.uniAssistLanguage,
    },
    {
      heading: 'Medium-of-instruction letters',
      body: 'A medium-of-instruction letter shows that your degree was taught in English. uni-assist lists three ways to show this: your degree certificate or transcript saying so, written confirmation from your university, or a link to your university’s web page that says so. Whether a programme accepts it in place of a test is that programme’s rule, so look for it in the language section of its admission rules.',
      source: SOURCES.uniAssistLanguage,
    },
    {
      heading: 'Language for the visa',
      body: 'The German Missions’ student visa checklist asks for a recognised certificate in the language you will study in: Goethe-Institut / Max Mueller Bhavan, ÖSD or telc for German, and IELTS or another certificate the checklist accepts for English. For starting a master’s straight away, the checklist says the level needed is generally C1, whether the programme is in German or English. It does not recognise Duolingo, Pearson PTE or TOEFL home edition tests for applications in India.',
      source: SOURCES.visaChecklist,
    },
    {
      heading: 'A different level in the APS leaflet',
      body: 'The APS graduate leaflet gives a different level: it says that for the visa, without a preparatory course, at least B2 in the language of instruction is required as a rule. Because the two differ, confirm the level you need with the German Missions.',
      source: SOURCES.aps,
    },
    {
      heading: 'Letters the German Missions do not accept',
      body: 'The German Missions’ visa FAQs say not to submit exemption letters or medium-of-instruction certificates. A university’s confirmation counts only if the university tested your language skills itself and confirms this for your case; otherwise a recognised English certificate is required. A letter a programme accepts for admission may not be enough for the visa.',
      source: SOURCES.visa,
    },
    {
      heading: 'Language and APS',
      body: 'APS India, the German Embassy’s office that checks Indian academic documents, does not require a particular German or English level. If you send a language certificate with your APS documents, APS may check that it is genuine. APS does not decide on admission or on visas.',
      source: SOURCES.apsFaqs,
    },
    {
      heading: 'German lessons',
      body: `${GERMAN_LESSONS.offer} ${GERMAN_LESSONS.charges} ${GERMAN_LESSONS.certificate}`,
      link: { label: 'About German lessons', to: ROUTES.learnGerman },
    },
  ],
} satisfies StandardTopic;

import { SOURCES } from '@/utils/applicationFacts';
import { REQUIREMENT_TOPIC_TITLES } from '@/utils/requirements/topics';

import type { StandardTopic } from '../types';

/** The recognition rule in parts: the summary reads them in this order, the common question opens with `lookup`. */
export const DEGREE_RECOGNITION = {
  rule: 'Your bachelor’s generally needs to come from a recognised university and be equivalent to a German bachelor’s.',
  lookup: 'You can look this up in anabin, Germany’s database of foreign qualifications.',
  criteria: 'Each university still applies its own admission criteria.',
} as const;

export const degree = {
  kind: 'standard',
  id: 'degree',
  title: REQUIREMENT_TOPIC_TITLES.degree,
  german: { word: 'Abschluss', meaning: 'degree' },
  summary: `${DEGREE_RECOGNITION.rule} ${DEGREE_RECOGNITION.lookup} ${DEGREE_RECOGNITION.criteria}`,
  need: 'Everyone applying with a bachelor’s from outside Germany, including students who have not finished yet: some universities accept applications before the degree is complete.',
  steps: [
    'Open anabin. It is in German.',
    'Under Institutionen (institutions), choose Indien (India) and find your university or college. Note its status: H+ means it is treated as a university in Germany, H- means it is not, and H+/- means it depends on the course, so check your own degree in the next step.',
    'Under Hochschulabschlüsse (university degrees), find your exact degree title and read its classification.',
    'If you have not finished your degree, check whether each programme accepts applications before completion and when it wants proof that you have finished.',
    'Then read the entry rules on your programme’s admission page. A recognised degree does not by itself meet them.',
  ],
  sources: [SOURCES.anabin, SOURCES.masters],
  detail: [
    {
      heading: 'What anabin is',
      body: 'anabin is a database for evaluating foreign qualifications, kept by the Central Office for Foreign Education (ZAB) of the KMK, the conference of Germany’s state education ministers. The name stands for Anerkennung und Bewertung ausländischer Bildungsnachweise (recognition and evaluation of foreign educational qualifications). It gives the universities and authorities that decide on recognition a basis for their decisions. The database is in German, and it states that its contents do not claim to be complete.',
      source: SOURCES.anabinAbout,
    },
    {
      heading: 'Institution status: H+, H+/- and H-',
      body: 'H+ means the institution is recognised as a university in its own country and is treated as a higher education institution in Germany. H- means recognition or accreditation in its home country is missing, or it cannot be classed as a university in Germany. H+/- means anabin cannot say for the whole institution, for example when some of its courses are at university level and others are not; then the individual degree has to be checked. If your degree is not listed under your institution, that does not necessarily mean the institution does not award it: anabin says these lists are not complete.',
      source: SOURCES.anabinInstitutions,
    },
    {
      heading: 'Degree classification',
      body: 'Each degree entry under Hochschulabschlüsse describes the degree, including its exact title and length, and says how it fits into the German system. Gleichwertig (equivalent) means no substantial differences from the German qualification were found. Entspricht (corresponds) means the degree can be formally matched to a German degree, without a statement on equivalence. Bedingt vergleichbar (conditionally comparable) means there are formal differences from the German qualification.',
      source: SOURCES.anabinDegrees,
    },
    {
      heading: 'Three-year, four-year and integrated degrees',
      body: 'anabin records a classification for each degree, with its length as one part of the description, so look up your exact degree title rather than going by the number of years. Then read the programme’s own rule. Example: RWTH Aachen’s Software Systems Engineering master’s asks for a first degree in computer science or a closely related field, awarded by an internationally recognised university-level institution.',
      source: SOURCES.rwthSse,
    },
    {
      heading: 'If you have not finished yet',
      body: `uni-assist (explained under ${REQUIREMENT_TOPIC_TITLES.applying}) notes that some universities let you apply before you complete your first degree. Each programme sets when you must prove you have finished. Example: TUM’s Informatics master’s requires your graduation documents by the enrolment deadline and states that there are no exceptions.`,
      source: SOURCES.tumInformatics,
    },
    {
      heading: 'Provisional certificates through uni-assist',
      body: 'For applications through uni-assist, a provisional degree certificate is accepted only if a university or autonomous college issued it, and only for 12 months after you complete your studies. If your university has not issued the degree certificate after a year, uni-assist asks for an official letter from the university giving the expected date of issue.',
      source: SOURCES.india,
    },
  ],
} satisfies StandardTopic;

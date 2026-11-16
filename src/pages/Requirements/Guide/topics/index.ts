import { REQUIREMENT_TOPIC_IDS, type RequirementTopicId } from '@/utils/requirements/topics';

import type { Topic } from '../types';
import { apsDmat } from './aps-dmat';
import { applying } from './applying';
import { costs } from './costs';
import { deadlines } from './deadlines';
import { degree } from './degree';
import { documents } from './documents';
import { grades } from './grades';
import { language } from './language';
import { subjectCredits } from './subject-credits';
import { visaEnrolment } from './visa-enrolment';

/** Every topic by id. A missing topic, or a file whose id does not match its key, is a type error. */
export const TOPIC_BY_ID: { readonly [Id in RequirementTopicId]: Topic & { id: Id } } = {
  degree,
  'subject-credits': subjectCredits,
  grades,
  language,
  'aps-dmat': apsDmat,
  documents,
  applying,
  deadlines,
  costs,
  'visa-enrolment': visaEnrolment,
};

/** The ten topics in reading order (`REQUIREMENT_TOPIC_IDS`). A topic's number is its index plus one. */
export const TOPICS: readonly Topic[] = REQUIREMENT_TOPIC_IDS.map((id) => TOPIC_BY_ID[id]);

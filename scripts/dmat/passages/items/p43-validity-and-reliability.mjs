// Mock 4, passage 43. Area: social sciences. Subject: measurement reliability, validity and error. Text only.
import { fixed, p } from '../lib.mjs';

// Question 2: digital thermometer checked four times in a 40.0 °C water bath.
const bathTrue = 40.0;
const readings2 = [41.8, 41.8, 41.7, 41.8];
const spread2 = Math.max(...readings2) - Math.min(...readings2);
const meanOffset2 = readings2.reduce((a, b) => a + b, 0) / readings2.length - bathTrue;
if (!(spread2 < 0.2 && meanOffset2 > 1.5)) {
  throw new Error('question 2 needs tight clustering with a clear positive offset');
}

// Question 3, 4, 6 distinct scenario numbers.
const monthsAhead3 = 12;
const shortQuiz4 = 5;
const longQuiz4 = 35;
const apprentices6 = 60;
const assessors6 = 2;
const p43Nums = [bathTrue, monthsAhead3, shortQuiz4, longQuiz4, apprentices6, assessors6];
if (new Set(p43Nums).size !== p43Nums.length) {
  throw new Error('scenario constants in p43 must all be distinct');
}

export default {
  id: 'p43',
  set: 'mock',
  mock: 4,
  area: 'social sciences',
  title: 'Measurement Reliability and Validity',
  facts: [
    { claim: 'Measurement (observational) error is the difference between a measured value and the true value, comprising random error (unpredictable chance fluctuations that vary in direction across readings) and systematic error (a consistent bias pushing repeated readings in the same direction, such as faulty calibration).', source: 'https://en.wikipedia.org/wiki/Observational_error', read: '2026-11-18' },
    { claim: 'Reliability is the overall consistency or repeatability of a measure under unchanged conditions, assessed through test–retest reliability (across two occasions), parallel-forms reliability (across equivalent versions of a test), and inter-rater reliability (agreement among independent raters).', source: 'https://en.wikipedia.org/wiki/Reliability_(statistics)', read: '2026-11-18' },
    { claim: 'Validity is the degree to which an instrument measures what it claims to measure rather than something else; a reliable measure is not necessarily valid (an offset scale is reliable yet invalid), whereas an unreliable measure cannot be valid.', source: 'https://en.wikipedia.org/wiki/Validity_(statistics)', read: '2026-11-18' },
    { claim: 'Construct validity concerns how well a set of observable indicators represents an abstract theoretical concept (construct) that is not directly measurable.', source: 'https://en.wikipedia.org/wiki/Construct_validity', read: '2026-11-18' },
    { claim: 'Criterion validity evaluates how closely scores on a measure relate to an external standard or outcome (the criterion), split into concurrent validity (assessed at the same time) and predictive validity (forecasting a future outcome).', source: 'https://en.wikipedia.org/wiki/Criterion_validity', read: '2026-11-18' },
  ],
  blocks: [
    p(
      'Whether researchers weigh a chemical sample or test verbal reasoning, every measurement tries to capture an underlying value or attribute.',
      'In practice, single readings depart from the true value because of two distinct kinds of measurement error.',
      'Random error consists of unpredictable chance fluctuations from one occasion, item or observer to the next — a momentary lapse of attention, a lucky guess on one multiple-choice item, or slight timing noise.',
      'Because random errors push readings up and down without a fixed direction, they tend to cancel out when many items or repeated readings are averaged.',
      'Systematic error, or bias, pushes measurements consistently in the same direction every time, like a weighing scale whose zero mark is offset by fifty grams, or an arithmetic test written in needlessly dense prose that penalises second-language readers every time they sit it.',
    ),
    p(
      'Reliability is the consistency of a measurement when the attribute being measured has not changed.',
      'Researchers check it in several ways.',
      'Test–retest reliability asks whether giving the same instrument to the same people on two occasions yields close scores.',
      'Parallel-forms reliability asks whether two equivalent versions of a test produce matching results.',
      'Inter-rater reliability asks whether independent observers scoring the same performance agree with one another.',
      'Random error is the main enemy of reliability: the larger the random noise, the more scores jump around from trial to trial.',
    ),
    p(
      'Validity, by contrast, asks whether an instrument actually measures what it claims to measure rather than something else.',
      'In the social sciences many targets — such as working memory, job satisfaction or civic trust — are constructs, abstract theoretical concepts that cannot be seen directly.',
      'Construct validity concerns how faithfully the chosen tasks or questions reflect that target construct rather than an irrelevant skill such as reading speed.',
      'Criterion validity checks how closely scores match an external benchmark, called the criterion: it is concurrent validity when the measure and the criterion are recorded at the same time, and predictive validity when today\'s score is checked against an outcome measured later.',
    ),
    p(
      'Reliability and validity are linked in one direction only.',
      'A measure can be highly reliable without being valid: systematic error leaves repeated readings tightly clustered around the wrong value or the wrong trait.',
      'Yet a measure that has no reliability cannot be valid: if scores are swamped by random error and agree neither across occasions nor across raters, they cannot accurately track the intended attribute either.',
    ),
  ],
  questions: [
    {
      type: 'R', level: 1,
      stem: 'According to the text, how are the reliability and the validity of a measurement related?',
      options: [
        { text: 'Any measurement that yields consistent scores across repeated trials is automatically valid for the trait its authors named.', why: 'The fourth paragraph notes that systematic error produces consistent readings around the wrong value or trait, giving reliability without validity.' },
        { text: 'A measurement can be valid for its target attribute even when random error prevents it from showing any consistency across trials.', why: 'The fourth paragraph states the opposite: a measure swamped by random error with no reliability cannot be valid.' },
        { text: 'A measurement can be reliable without being valid, whereas a measurement with no reliability cannot be valid.', correct: true, why: 'This states the one-way relationship explained in the fourth paragraph.' },
        { text: 'Reliability and validity are two names for the same property, both reduced equally by random error and unaffected by bias.', why: 'Reliability concerns consistency (hurt by random error), whereas validity concerns measuring the intended target (hurt by systematic bias too).' },
      ],
      explanation: 'The fourth paragraph explains the asymmetry: systematic error can leave a measure highly reliable yet invalid, whereas a completely unreliable measure dominated by random noise cannot validly track its target.',
    },
    {
      type: 'C', level: 1,
      stem: `A laboratory water bath is held at an exact true temperature of ${fixed(bathTrue, 1)} °C. Checked four times in succession, a digital probe displays ${readings2.map((r) => `${fixed(r, 1)} °C`).join(', ')}. In the terms of the text, what does this probe show?`,
      options: [
        { text: 'High reliability and low validity, caused mainly by systematic error.', correct: true, why: `The four readings cluster within ${fixed(spread2, 1)} °C of one another, yet sit consistently about ${fixed(meanOffset2, 1)} °C above the true ${fixed(bathTrue, 1)} °C.` },
        { text: 'Low reliability and high validity, caused mainly by random error.', why: `Readings varying by at most ${fixed(spread2, 1)} °C are very consistent, while missing ${fixed(bathTrue, 1)} °C in the same direction every time compromises validity.` },
        { text: 'Low reliability and low validity, caused mainly by random error.', why: 'Random error scatters readings above and below the target; here all four readings sit tightly together nearly two degrees too high.' },
        { text: 'High reliability and high validity, with neither random nor systematic error.', why: `Consistently reading around ${fixed(readings2[0], 1)} °C when the bath is ${fixed(bathTrue, 1)} °C is a clear systematic offset.` },
      ],
      explanation: `The four readings (${readings2.map((r) => `${fixed(r, 1)} °C`).join(', ')}) barely vary from check to check, which shows high reliability and little random error. However, every reading is roughly ${fixed(meanOffset2, 1)} °C above the true ${fixed(bathTrue, 1)} °C, a systematic calibration error that lowers validity.`,
    },
    {
      type: 'C', level: 2,
      stem: `A music conservatory gives every applicant a short sight-reading audition at entry and then checks, ${monthsAhead3} months later, how closely those entry scores correspond to students' end-of-year orchestral ensemble marks. Which property of the sight-reading audition is being evaluated?`,
      options: [
        { text: 'Test–retest reliability across two administrations of the same sight-reading sheet.', why: 'Applicants do not repeat the sight-reading audition; their entry score is compared against a different external outcome a year later.' },
        { text: 'Parallel-forms reliability between two equivalent sight-reading sheets.', why: 'Ensemble marks over a year of rehearsals are an external performance criterion, not an equivalent form of the brief entry audition.' },
        { text: 'Concurrent criterion validity against an external benchmark recorded at the same time.', why: `Concurrent validity compares measures taken at the same time, whereas the ensemble marks are collected ${monthsAhead3} months after the audition.` },
        { text: 'Predictive criterion validity against an external outcome recorded later.', correct: true, why: `End-of-year ensemble performance acts as the external criterion, measured ${monthsAhead3} months after the entry audition.` },
      ],
      explanation: `The third paragraph defines criterion validity as comparing a measure against an external benchmark, and calls it predictive validity when today's score is checked against an outcome measured later — here, orchestral ensemble marks ${monthsAhead3} months after the audition.`,
    },
    {
      type: 'D', level: 2,
      stem: `To measure pure arithmetic skill among pupils studying in a second language, a school lengthens a ${shortQuiz4}-item test to ${longQuiz4} items, keeping the same convoluted legalistic wording on every item. Following the text, what is the expected effect of lengthening the test in this way?`,
      options: [
        { text: 'Both random error and the systematic bias from wording shrink, giving the test high reliability and high construct validity for arithmetic.', why: 'Repeating the same convoluted wording across more items does not cancel out the systematic disadvantage to second-language readers.' },
        { text: 'Random error shrinks so reliability improves, while the systematic bias from wording remains so construct validity for pure arithmetic stays impaired.', correct: true, why: 'Averaging across 35 items smooths out lucky guesses and slips, whereas every item still blends reading fluency into the arithmetic score.' },
        { text: 'Random error grows with the number of items so reliability falls, while construct validity for pure arithmetic improves.', why: 'Adding equivalent items reduces the effect of isolated chance slips on the total percentage score rather than magnifying it.' },
        { text: 'Reliability stays unchanged because only systematic error affects consistency, while predictive validity disappears.', why: 'Random error is what governs consistency across items, so expanding from 5 to 35 items directly raises reliability.' },
      ],
      explanation: `Across ${longQuiz4} items rather than ${shortQuiz4}, lucky guesses and momentary slips average out more, lowering random error and raising reliability. Because every item retains the convoluted prose, the systematic language bias persists: scores consistently reflect second-language reading comprehension alongside arithmetic, impairing construct validity.`,
    },
    {
      type: 'S', level: 2,
      stem: 'Which statement about measurement error is supported by the text?',
      options: [
        { text: 'Averaging many repeated readings eliminates systematic calibration bias just as effectively as it reduces random fluctuations.', why: 'Because systematic error pushes every reading in the same direction, averaging repeated readings preserves that directional offset.' },
        { text: 'High inter-rater reliability between two independent judges shows that their checklist has strong construct validity for the intended trait.', why: 'Two judges can agree closely on an irrelevant indicator (reliability without construct validity), as the fourth paragraph explains.' },
        { text: 'Systematic error causes scores on the same unchanged attribute to scatter widely in opposite directions from one trial to the next.', why: 'Scattering in opposite directions from trial to trial is the mark of random error, not systematic error.' },
        { text: 'Averaging across repeated readings reduces the impact of random error, whereas repeating a systematically biased procedure reproduces the same directional offset.', correct: true, why: 'Random fluctuations vary in sign and cancel out when averaged; systematic bias pushes every trial the same way.' },
      ],
      explanation: 'The first paragraph contrasts the two error types: random fluctuations have no fixed direction and cancel out when averaged across trials or items, whereas systematic error pushes every reading in the same direction, so mere repetition reproduces the offset.',
    },
    {
      type: 'T', level: 3,
      stem: `A technical college wants to assess practical fault-finding skill in ${apprentices6} heating apprentices. At present, ${assessors6} tutors hold unstructured chats with each apprentice, using no shared mark scheme, and ask mainly for the years in which nineteenth-century thermodynamics laws were published; the ${assessors6} tutors often award very different marks to the same apprentice. Which redesign addresses both the reliability flaw and the construct-validity flaw in this assessment?`,
      options: [
        { text: 'Keep the unstructured chats about nineteenth-century publication dates, and have each apprentice return a week later for a second unstructured chat on the same topic.', why: 'A second unscripted chat on historical dates neither standardises marking between tutors nor measures practical fault-finding.' },
        { text: 'Give every apprentice the same set of live boiler faults to diagnose and repair, and have both tutors score performance independently against an explicit step-by-step rubric.', correct: true, why: 'Hands-on fault diagnosis aligns the task with the target construct, while identical tasks and an explicit rubric raise inter-rater reliability.' },
        { text: 'Replace the unstructured chats with a written multiple-choice paper on nineteenth-century publication dates, marked by a computer key so both tutors award identical scores.', why: 'Computer marking fixes inter-rater reliability, but memorising historical dates still lacks construct validity for practical fault-finding.' },
        { text: 'Have every apprentice diagnose a live boiler fault, while allowing each tutor to judge overall impression without shared criteria or agreed checklists.', why: 'Live fault diagnosis improves task relevance, but unguided holistic impressions leave severe inter-rater inconsistency, limiting validity.' },
      ],
      explanation: `The current assessment has two separate defects: asking for historical dates measures memory of history rather than the construct of practical fault-finding (poor construct validity), and unscripted marking without shared criteria produces wide disagreement between the ${assessors6} tutors (low inter-rater reliability). Only standardised live fault-finding tasks scored with an explicit shared rubric address both defects together.`,
    },
  ],
};

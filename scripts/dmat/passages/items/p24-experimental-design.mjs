// Mock 2, passage 24. Area: social sciences. Subject: experimental design, blinding and internal validity. Text only.
import { p, whole } from '../lib.mjs';

// Question 2: proof-reading experiment.
const volunteers2 = 80;
if (!Number.isInteger(volunteers2 / 2)) throw new Error('question 2 needs an even number of volunteers');

// Question 3: single-clinic trial.
const clinicPatients = 120;
const weeks3 = 6;

// Question 6: differential attrition in a 10-week language trial.
const enrolled6 = 200;
const perGroup6 = enrolled6 / 2;
const weeks6 = 10;
const dropDrill = 42;
const dropControl = 3;
const finishDrill = perGroup6 - dropDrill;
const finishControl = perGroup6 - dropControl;
if (!Number.isInteger(perGroup6) || !(dropDrill > 5 * dropControl) || !(finishDrill < finishControl)) {
  throw new Error('question 6 needs a sharp drop-out imbalance between equal starting groups');
}
const allNums = [volunteers2, clinicPatients, weeks3, enrolled6, perGroup6, weeks6, dropDrill, dropControl, finishDrill, finishControl];
if (new Set(allNums).size !== allNums.length) {
  throw new Error('numbers across scenarios in p24 must all differ');
}

export default {
  id: 'p24',
  set: 'mock',
  mock: 2,
  area: 'social sciences',
  title: 'Experimental Design and Internal Validity',
  facts: [
    { claim: 'In an experiment, the researcher manipulates the independent (explanatory) variable and measures changes in the dependent (response) variable; the experimental group receives the manipulation being tested while the control group is treated identically except without that manipulation.', source: 'https://openstax.org/books/psychology-2e/pages/2-3-analyzing-findings', read: '2026-11-18' },
    { claim: 'Random assignment gives every participant an equal chance of entering each group, spreading pre-existing participant differences across the groups by chance.', source: 'https://openstax.org/books/psychology-2e/pages/2-3-analyzing-findings', read: '2026-11-18' },
    { claim: 'A control group may receive a placebo — an inactive look-alike treatment that cannot directly change the response variable — to match the psychological effect of being treated; random sampling selects participants from a population whereas random assignment places chosen participants into treatment groups.', source: 'https://openstax.org/books/introductory-statistics-2e/pages/1-4-experimental-design-and-ethics', read: '2026-11-18' },
    { claim: 'The placebo effect occurs when participants\' expectations influence their experience; in a single-blind study participants do not know their group while researchers do, whereas in a double-blind study both participants and the researchers interacting with them are blind to group assignments, controlling for experimenter bias as well.', source: 'https://openstax.org/books/psychology-2e/pages/2-3-analyzing-findings', read: '2026-11-18' },
    { claim: 'Internal validity means that experimental results properly test the causal hypothesis within the study rather than reflecting unintended flaws or artefacts, whereas external validity concerns whether results generalise beyond the study\'s specific setting and participants.', source: 'https://plato.stanford.edu/entries/scientific-reproducibility/', read: '2026-11-18' },
    { claim: 'Threats to internal validity include confounding variables, selection bias at assignment, experimenter bias, and differential attrition (experimental mortality) when participants drop out unevenly across groups.', source: 'https://en.wikipedia.org/wiki/Internal_validity', read: '2026-11-18' },
  ],
  blocks: [
    p(
      'An observational study watches people as they already live and records what goes with what; an experiment intervenes.',
      'In an experiment, researchers deliberately vary one factor, the independent variable (also called the explanatory variable), and measure what happens to an outcome, the dependent variable (the response variable).',
      'In a basic two-group design, the experimental group receives the active treatment being tested, while the control group is handled in the same way in every other respect except that it does not receive that active treatment.',
      'Without a control group, a change over time could come from practice, normal recovery or outside events rather than from the treatment.',
    ),
    p(
      'Who enters each group matters just as much.',
      'If participants choose their own group, or a clinician steers keener people into the experimental group, the groups differ from the start, a flaw called selection bias.',
      'Random assignment prevents this by using a chance procedure, such as drawing lots or a random-number generator, to place each participant into a group.',
      'In large enough groups, chance spreads pre-existing differences in age, baseline skill or motivation roughly evenly between them.',
      'Random assignment is distinct from random sampling: random sampling draws participants by chance from a wider population so the sample represents that population, whereas random assignment divides whichever participants are already in the study between the groups.',
    ),
    p(
      'Even balanced groups can diverge if people know what they are getting.',
      'When participants improve or behave differently simply because they expect a treatment to have an effect, researchers speak of the placebo effect.',
      'To match expectations across groups, the control group is often given a placebo, an inactive look-alike such as a plain starch tablet, under blinding (also called masking).',
      'In a single-blind experiment, participants do not know whether they are in the experimental or the control group, while the researchers dealing with them do.',
      'Yet researchers have expectations too: experimenter bias arises when staff unintentionally give subtle encouragement or score borderline cases more generously in one group.',
      'In a double-blind experiment, neither the participants nor the staff who deal with them or rate their outcomes know each participant\'s group until measurement is finished.',
    ),
    p(
      'Together, a control group, random assignment and blinding protect internal validity: the degree to which differences in the dependent variable within the study can be attributed to the independent variable rather than to confounders, outside factors that vary alongside the treatment.',
      'High internal validity is not the same as external validity, which asks how far the result generalises to other people and everyday settings outside the trial.',
      'Nor does random assignment settle internal validity once and for all: if groups are tested under unequal conditions, or if differential attrition occurs because participants drop out of one group far more often or for different reasons than the other, the groups that finish are no longer comparable.',
    ),
  ],
  questions: [
    {
      type: 'R', level: 1,
      stem: 'According to the text, how does a double-blind experiment differ from a single-blind experiment?',
      options: [
        { text: 'It uses two separate control groups instead of one, so that one control group receives a placebo and the other receives nothing at all.', why: 'The distinction between single-blind and double-blind concerns who knows the group assignments, not the number of control groups.' },
        { text: 'Neither the participants nor the staff who interact with them or rate their outcomes know which group each participant belongs to.', correct: true, why: 'This matches the third paragraph: single-blind hides group membership from participants alone, whereas double-blind hides it from those researchers too.' },
        { text: 'It combines random sampling from the wider population with random assignment of the chosen participants into the experimental and control groups.', why: 'Random sampling and random assignment concern how people enter the study and the groups, not who knows the group labels afterwards.' },
        { text: 'It withholds the hypothesis of the study from participants until the end, while allowing the staff scoring outcomes to see the group list.', why: 'Allowing the staff who score outcomes to see the group list leaves experimenter bias open and describes at most a single-blind arrangement.' },
      ],
      explanation: 'The third paragraph defines a single-blind study as one in which participants do not know their group while the researchers dealing with them do, and a double-blind study as one in which both the participants and the staff interacting with them or scoring their outcomes are kept unaware of group membership.',
    },
    {
      type: 'C', level: 1,
      stem: `To test whether background music affects proof-reading, a researcher assigns ${volunteers2} volunteers by lot either to a quiet room or to an identical room playing soft instrumental music, asks everyone to proof-read the same page, and counts how many spelling mistakes each volunteer misses. What is the dependent variable?`,
      options: [
        { text: 'Whether a volunteer proof-reads the page in the quiet room or in the room playing instrumental music.', why: 'That is the factor the researcher deliberately varies between the two groups, which makes it the independent variable.' },
        { text: 'The chance procedure used to place each volunteer into one of the two rooms before the task begins.', why: 'That procedure is random assignment, a design step used to balance the groups rather than a measured outcome.' },
        { text: 'The number of spelling mistakes a volunteer misses while proof-reading the page.', correct: true, why: 'This is the outcome measured by the researcher to see what effect the room condition had.' },
        { text: 'Each volunteer\'s prior proof-reading skill and reading speed before entering the study.', why: 'Those are pre-existing participant traits that random assignment aims to spread across the groups, not the outcome measured after the task.' },
      ],
      explanation: 'The first paragraph defines the independent variable as the factor the researcher deliberately varies (here, music versus quiet) and the dependent variable as the outcome measured in response to it (here, the count of missed spelling mistakes).',
    },
    {
      type: 'C', level: 2,
      stem: `A researcher recruits ${clinicPatients} volunteers attending one specialist sports clinic and assigns them by computer-drawn lot either to a new knee-exercise programme or to the clinic's standard stretching routine. After ${weeks3} weeks, physiotherapists who do not know any patient's group measure knee flexion. Following the text, what is the main strength and the main limitation of this study?`,
      options: [
        { text: `It supports a strong causal comparison among the ${clinicPatients} clinic volunteers, but its convenience sample from one clinic limits how confidently the result generalises to wider patient populations.`, correct: true, why: 'Random assignment and blinded measurement protect internal validity inside the study, while recruiting from a single clinic limits external validity.' },
        { text: 'It supports confident generalisation to knee patients across the country, but lacks internal validity because the volunteers were not drawn by random sampling.', why: 'This swaps random sampling and random assignment: recruiting at one clinic limits generalisation, whereas random assignment supports internal validity.' },
        { text: 'It eliminates the placebo effect in both groups, because keeping the physiotherapists unaware of group membership makes the study double-blind.', why: 'Patients exercising or stretching can tell what routine they are doing, so participants are not blinded even though the assessors are.' },
        { text: 'It suffers from selection bias between the two routines, because patients who attend a specialist sports clinic tend to be keener than average patients.', why: 'High keenness across the whole clinic affects external validity; random assignment spreads that keenness across both routines within the trial.' },
      ],
      explanation: 'The second and fourth paragraphs separate random assignment from random sampling and internal validity from external validity. Assigning the clinic volunteers by lot and blinding the assessors gives strong internal validity for comparing the two routines in those patients, while recruiting from a single specialist clinic rather than sampling a wider population limits external validity.',
    },
    {
      type: 'D', level: 2,
      stem: 'In a trial of a tablet intended to ease joint stiffness, participants receive identical-looking active or starch tablets without knowing which they have been given, while the clinicians who interview patients and rate their stiffness at the end have the group list on their clipboards. According to the text, what risk remains?',
      options: [
        { text: 'Selection bias at baseline, because knowing the group list while rating stiffness changes which patients entered the active group at the start.', why: 'Baseline group membership was fixed before treatment began; unblinded end-of-trial ratings occur later and cannot retroactively alter assignment.' },
        { text: 'Complete loss of the control group\'s baseline, because a starch tablet only controls for normal recovery over time when the clinicians are blinded.', why: 'Time and normal recovery still pass in both groups; what unblinded clinicians introduce is biased interaction or scoring, not the disappearance of time.' },
        { text: 'Participants in the starch-tablet group cannot experience a placebo effect once clinicians know which capsules contain only starch.', why: 'Participants remain unaware of their group, so their own expectations stay intact unless the clinicians\' behaviour gives the group away or skews ratings.' },
        { text: 'Experimenter bias, because clinicians who know the group list may unintentionally prompt patients differently or score borderline stiffness in line with their expectations.', correct: true, why: 'The study is only single-blind; the third paragraph notes that unblinded staff can skew outcomes through subtle cues or subjective scoring.' },
      ],
      explanation: 'Because participants are unaware of their tablet while the examining clinicians hold the group list, the trial is single-blind rather than double-blind. As the third paragraph explains, clinicians\' expectations can then produce experimenter bias through subtle cues during interviews or more generous scoring of borderline cases.',
    },
    {
      type: 'S', level: 2,
      stem: 'Which statement about internal validity is supported by the text?',
      options: [
        { text: 'Once participants have been placed into groups by random assignment, internal validity is secure regardless of what happens during the rest of the trial.', why: 'The fourth paragraph explicitly states that unequal testing conditions or differential drop-out after assignment can still undermine internal validity.' },
        { text: 'Increasing internal validity through tight laboratory controls automatically ensures that the findings apply to everyday settings outside the laboratory.', why: 'Applying findings to everyday settings is external validity, which the fourth paragraph distinguishes from internal validity.' },
        { text: 'A randomised experiment can still lose internal validity if an unintended factor varies between the groups or drop-out removes different kinds of participants from each group.', correct: true, why: 'Post-assignment confounders and differential attrition break the comparability that random assignment created at the start.' },
        { text: 'Drawing a large random sample from a national register gives a study high internal validity even when participants choose for themselves whether to take the treatment.', why: 'Letting participants choose the treatment creates selection bias; random sampling from a register addresses population representation, not group comparability.' },
      ],
      explanation: 'The fourth paragraph defines internal validity as confidence that the independent variable, rather than confounders, caused the observed difference within the study, and warns that unequal testing conditions or differential attrition after random assignment can still destroy group comparability.',
    },
    {
      type: 'T', level: 3,
      stem: `To test an intensive vocabulary course, researchers assign ${enrolled6} adult learners by lot into two groups of ${perGroup6}: an experimental group given tough daily drills for ${weeks6} weeks and a control group given light weekly reading. Over the ${weeks6} weeks, ${dropDrill} of the least persistent learners quit the drill group, leaving ${finishDrill}, whereas only ${dropControl} quit the control group, leaving ${finishControl}. On the week-${weeks6} vocabulary test, the ${finishDrill} drill finishers have a much higher average score than the ${finishControl} control finishers. Why cannot the researchers safely attribute that gap to the drills?`,
      options: [
        { text: `Because ${perGroup6} learners per group is too small for random assignment to work at the start, so the drill group must already have held stronger learners on day one.`, why: `The flaw described is not a chance imbalance on day one, but the selective loss of ${dropDrill} less persistent learners from one group during the ${weeks6} weeks.` },
        { text: `Because differential attrition stripped ${dropDrill} less persistent learners from the drill group while almost everyone finished the control task, leaving two finisher groups that differed in persistence apart from the drills.`, correct: true, why: 'Selective drop-out removed weaker, less persistent participants mainly from the drill group, inflating its finishers\' average even if the drills added nothing.' },
        { text: 'Because the learners were not drawn as a random sample of all adult learners in the country, which prevents any causal comparison between the two groups inside the trial.', why: 'Lack of random sampling limits external generalisation to all adults, whereas the question asks why the causal comparison inside this trial breaks down.' },
        { text: 'Because learners in the light-reading control group experienced a placebo boost from taking part, which pushed the control average artificially close to the drill average.', why: 'A boost in the control group would shrink the gap rather than produce a falsely high advantage for the drill finishers.' },
      ],
      explanation: `Random assignment balanced the two groups of ${perGroup6} at the start, but ${dropDrill} less persistent learners left the demanding drill group against only ${dropControl} in the control group. As the fourth paragraph explains, such differential attrition makes the remaining groups (${finishDrill} keen finishers versus ${finishControl} mixed finishers) systematically different, confounding the effect of the drills with baseline persistence.`,
    },
  ],
};

// Full mock, passage 7. Area: social sciences. Subject: sampling methods and bias. Text only.
import { p, whole } from '../lib.mjs';

// Question 2: a systematic sample.
const register = 12000;
const step = 40;
const drawn = register / step;
if (!Number.isInteger(drawn)) throw new Error('question 2 needs a whole number of students');

// Question 3: schools and teachers.
const schools = 30;
const chosenSchools = 6;
const teachersDrawn = 120;
const perSchool = teachersDrawn / schools;
if (!Number.isInteger(perSchool)) throw new Error('question 3 needs a whole number per school');

// Question 4: a postal survey.
const posted = 2000;
const returned = 450;

// Question 5: the same voluntary survey, larger.
const small = 400;
const large = 4000;

// Question 6: a small group to compare.
const students = 10000;
const finalShare = 0.08;
const interviews = 200;
const expectedFinal = interviews * finalShare;
const perGroup = interviews / 2;
if (expectedFinal >= perGroup / 2) throw new Error('question 6: a simple random sample must give clearly too few final-year students');

export default {
  id: 'p07',
  set: 'mock',
  area: 'social sciences',
  title: 'Sampling Methods and Bias',
  facts: [
    { claim: 'A population is the whole group being studied; a sample is a subset of it.', source: 'https://openstax.org/books/introductory-statistics-2e/pages/1-1-definitions-of-statistics-probability-and-key-terms', read: '2026-11-16' },
    { claim: 'The sampling frame is the list from which the sample is drawn; members missing from it cannot be sampled.', source: 'https://en.wikipedia.org/wiki/Sampling_frame', read: '2026-11-16' },
    { claim: 'Simple random sample: each member has an equal chance of being chosen, and any group of n is equally likely.', source: 'https://openstax.org/books/introductory-statistics-2e/pages/1-2-data-sampling-and-variation-in-data-and-sampling', read: '2026-11-16' },
    { claim: 'Systematic sample: a random starting point, then every nth member of a list.', source: 'https://openstax.org/books/introductory-statistics-2e/pages/1-2-data-sampling-and-variation-in-data-and-sampling', read: '2026-11-16' },
    { claim: 'Stratified sample: divide the population into strata and take a (proportionate) random sample from each.', source: 'https://openstax.org/books/introductory-statistics-2e/pages/1-2-data-sampling-and-variation-in-data-and-sampling', read: '2026-11-16' },
    { claim: 'Cluster sample: divide into clusters, choose some clusters at random, include all members of the chosen clusters.', source: 'https://openstax.org/books/introductory-statistics-2e/pages/1-2-data-sampling-and-variation-in-data-and-sampling', read: '2026-11-16' },
    { claim: 'Convenience sampling uses results that are readily available and may be very biased; self-selected responses are often unreliable.', source: 'https://openstax.org/books/introductory-statistics-2e/pages/1-2-data-sampling-and-variation-in-data-and-sampling', read: '2026-11-16' },
    { claim: 'Sampling bias: some members of the population are less likely to be included than others; self-selection makes a sample non-representative.', source: 'https://en.wikipedia.org/wiki/Sampling_bias', read: '2026-11-16' },
    { claim: 'Non-response (participation) bias: those who respond can differ systematically from those who do not.', source: 'https://en.wikipedia.org/wiki/Participation_bias', read: '2026-11-16' },
    { claim: 'A larger sample gives a smaller sampling error, but a biased method can still give an unrepresentative sample.', source: 'https://openstax.org/books/introductory-statistics-2e/pages/1-2-data-sampling-and-variation-in-data-and-sampling', read: '2026-11-16' },
  ],
  blocks: [
    p(
      'Researchers who want to know what a large group thinks or does rarely ask everyone.',
      'The population is the whole group they want to learn about, for example all students at one university.',
      'A sample is the part of it they actually study.',
      'They usually draw it from a sampling frame, a list of the members of the population such as the register of enrolled students.',
      'A sample is useful only if it is representative: it should resemble the population in the ways that matter for the question.',
    ),
    p(
      'Four methods choose the sample by chance.',
      'In a simple random sample every member of the frame has the same chance of being chosen, and so does every possible group of the chosen size.',
      'A systematic sample starts at a randomly chosen place in the list and then takes every k-th member after it.',
      'A stratified sample first divides the population into groups that share a feature, called strata, such as the year of study, and then draws a random sample from every stratum, usually in proportion to its size; so every stratum is sure to be represented.',
      'A cluster sample divides the population into groups, called clusters, such as the halls of residence; it chooses some of the clusters at random and then includes every member of the chosen clusters.',
    ),
    p(
      'A convenience sample consists of whoever is easy to reach, such as the people who pass a stand in the main hall one morning.',
      'In a voluntary response sample the researcher invites everyone to take part, for example through a link on a website, and the sample consists of those who choose to.',
      'Neither method gives the members of the population a known chance of being chosen.',
    ),
    p(
      'Bias is a systematic difference between what a method\'s samples show and the population, one that would not average out if the sampling were repeated many times in the same way.',
      'Sampling bias arises when some members of the population are less likely to be chosen than others, in a way the researcher does not know or allow for.',
      'One cause is a frame that leaves people out: a sample drawn from a list of landline numbers cannot include anyone without a landline.',
      'A well-chosen sample can still end up biased.',
      'Non-response bias arises when some of the people chosen do not take part and differ from those who do in ways that matter for the question.',
      'Self-selection, as in a voluntary response sample, has a similar effect from the start: people with strong views on the topic are more likely to join.',
    ),
    p(
      'Even an unbiased sample differs from the population by chance; another random sample would give a slightly different result.',
      'This sampling error becomes smaller as the sample grows, even in a biased survey.',
      'Bias does not: a biased method gives a biased result however large the sample is, and a larger sample only makes the wrong answer look more precise.',
    ),
  ],
  questions: [
    {
      type: 'R', level: 1,
      stem: 'According to the text, what is a sampling frame?',
      options: [
        { text: 'The list of members of the population from which the sample is drawn.', correct: true, why: 'This is the definition in the first paragraph, with the register of students as its example.' },
        { text: 'The part of the population that is actually studied.', why: 'That is the sample.' },
        { text: 'The whole group the researchers want to learn about.', why: 'That is the population.' },
        { text: 'The groups into which a stratified sample divides the population.', why: 'Those are the strata.' },
      ],
      explanation: 'The first paragraph defines the sampling frame as a list of the members of the population, such as a register of enrolled students, from which the sample is drawn.',
    },
    {
      type: 'C', level: 2,
      stem: `A university lists its ${whole(register)} students by matriculation number. A researcher draws a number from 1 to ${step} by lot, takes the student in that place in the list, and then every ${step}th student after it, ${drawn} students in all. What kind of sample is this?`,
      options: [
        { text: 'A simple random sample.', why: `Each student does have the same 1-in-${step} chance, but not every group of ${drawn} is possible: two students who stand next to each other in the list can never both be chosen.` },
        { text: 'A cluster sample.', why: 'No groups are chosen and taken whole; single students are taken at fixed intervals.' },
        { text: 'A stratified sample.', why: 'The list is not divided into strata with a random sample drawn from each.' },
        { text: 'A systematic sample.', correct: true, why: `A random starting place, then every ${step}th member of the list.` },
      ],
      explanation: `The second paragraph describes a systematic sample: start at a randomly chosen place in the list and take every k-th member after it. Here k is ${step}.`,
    },
    {
      type: 'C', level: 2,
      stem: `A researcher wants to survey the teachers at a town's ${schools} primary schools. Which of these plans produces a cluster sample?`,
      options: [
        { text: `The ${schools} schools are numbered and ${chosenSchools} numbers are drawn by lot. Every teacher at those ${chosenSchools} schools is interviewed.`, correct: true, why: 'Schools are the clusters: some are chosen at random, and everyone in them is included.' },
        { text: `The teachers of all ${schools} schools are put on one list, and ${teachersDrawn} names are drawn by lot from it.`, why: 'Single teachers are drawn from one list: a simple random sample.' },
        { text: `At each of the ${schools} schools, ${perSchool} teachers are drawn by lot from that school's staff list.`, why: 'Every school is represented and a random sample is drawn within each: the schools act as strata, so this is a stratified sample.' },
        { text: `The researcher visits the ${chosenSchools} schools nearest to the office and interviews every teacher there.`, why: 'Whole schools are taken, but they are chosen because they are easy to reach, not at random: a convenience sample.' },
      ],
      explanation: 'The second paragraph: a cluster sample chooses some of the clusters at random and includes every member of the chosen ones. Only the first plan does both. The fourth takes whole schools too, but chooses them for convenience; the third draws from every school, which makes the schools strata.',
    },
    {
      type: 'C', level: 2,
      stem: `A city council draws ${whole(posted)} residents at random from its complete register of residents and posts each of them a questionnaire about the opening hours of the city library. Only a small share of the city's residents use the library regularly, but of the ${whole(returned)} who send the questionnaire back, most are regular library users. Which problem does this survey show, in the terms of the text?`,
      options: [
        { text: 'The sampling frame leaves out part of the population.', why: 'The register is complete, so every resident could be drawn.' },
        { text: 'It is a convenience sample.', why: 'The residents were drawn at random, not picked because they were easy to reach.' },
        { text: 'Non-response bias: those who answered differ from those who did not.', correct: true, why: 'The sample was well chosen, but regular library users were more likely to reply, and they are the people most affected by the question.' },
        { text: 'Only sampling error, which a larger number of replies would remove.', why: `With more questionnaires posted, library users would still reply more often than others. That difference is bias, which a larger sample does not remove.` },
      ],
      explanation: `The fourth paragraph says a well-chosen sample can still end up biased when the people who do not take part differ from those who do. Here the random draw from a complete register was sound, but the ${whole(returned)} who replied were mostly library users, a group with a particular interest in the topic.`,
    },
    {
      type: 'D', level: 2,
      stem: `A researcher posts a survey link on a sports club's website and receives ${whole(small)} answers. The researcher then repeats the survey in exactly the same way, with the same link on the same website, and this time receives ${whole(large)} answers. Compared with the first survey, what does the second have?`,
      options: [
        { text: 'Less sampling error and less bias.', why: 'Bias does not shrink with sample size; the same self-selected visitors of the same website answer.' },
        { text: 'The same sampling error, but less bias.', why: 'Both parts are the wrong way round: sampling error shrinks as the sample grows, and the bias of the method stays.' },
        { text: 'The same sampling error and the same bias.', why: 'Sampling error shrinks as the sample grows, as the last paragraph says.' },
        { text: 'Less sampling error, but the same bias.', correct: true, why: 'More answers reduce chance variation; the method, and so its bias, is unchanged.' },
      ],
      explanation: 'The last paragraph: sampling error becomes smaller as the sample grows, but a biased method gives a biased result however large the sample is. Both surveys are voluntary response samples from the visitors of one sports club\'s website, so the bias stays.',
    },
    {
      type: 'T', level: 3,
      stem: `A researcher wants to compare first-year with final-year students on how many hours they work alongside their studies; the study is only about these two years. Of the university's ${whole(students)} students, ${Math.round(finalShare * 100)}% are in their final year. The budget allows ${interviews} interviews, and the register lists every student's year of study. Which plan suits this aim best?`,
      options: [
        { text: `A simple random sample of ${interviews} students drawn from the whole register.`, why: `It is unbiased, but it would contain only about ${whole(expectedFinal)} final-year students, too few to compare with confidence.` },
        { text: `Interviewers stand at the library entrance during the exam period and question the first ${perGroup} first-year and the first ${perGroup} final-year students who pass.`, why: `It gives ${perGroup} per group, but it is a convenience sample: students in the library during exams may work fewer hours than others.` },
        { text: `An email invites all ${whole(students)} students to answer online, and the first ${perGroup} replies from each of the two years are used.`, why: `It gives ${perGroup} per group, but it is a voluntary response sample: students with time to answer quickly may differ from the rest.` },
        { text: `The register is divided by year of study, and ${perGroup} students are drawn at random from the first year and ${perGroup} from the final year.`, correct: true, why: `Each group is a random sample of its own year, so each group's result is unbiased for that year, and ${perGroup} per year makes the small final-year group large enough to compare.` },
      ],
      explanation: `The aim needs two things: enough final-year students to compare, and no bias. A simple random sample of ${interviews} would give about ${interviews} × ${Math.round(finalShare * 100)}% = ${whole(expectedFinal)} final-year students. Stratifying by year and drawing ${perGroup} at random from each year meets both needs; the other two plans reach ${perGroup} per group only by giving up random selection.`,
    },
  ],
};

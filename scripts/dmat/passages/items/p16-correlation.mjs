// Practice set, social sciences. Subject: correlation, causation and confounding. Text only.
import { fixed, p } from '../lib.mjs';

// Question 2: four correlation coefficients; the strongest is the one furthest from 0, whatever its sign.
const rs = [0.62, -0.85, 0.05, 0.4];
const strongest = rs.reduce((a, b) => (Math.abs(b) > Math.abs(a) ? b : a));
if (rs.filter((r) => Math.abs(r) === Math.abs(strongest)).length !== 1) throw new Error('question 2 needs one strongest value');
if (strongest > 0) throw new Error('question 2 is meant to test the sign: the strongest must be negative');
const r2 = (r) => (r < 0 ? `−${fixed(-r, 2)}` : fixed(r, 2));

// Question 6: a study of a reading app.
const pupils = 400;

export default {
  id: 'p16',
  set: 'practice',
  area: 'social sciences',
  title: 'Correlation and Causation',
  facts: [
    { claim: 'The correlation coefficient r lies between −1 and +1; its sign gives the direction; values near ±1 mean a stronger linear relationship.', source: 'https://openstax.org/books/introductory-statistics-2e/pages/12-3-the-regression-equation', read: '2026-11-16' },
    { claim: 'r = 0 implies no linear dependency; the coefficient measures only linear correlation and ignores other kinds of relationship; r has no units and is unchanged by changes of scale.', source: 'https://en.wikipedia.org/wiki/Pearson_correlation_coefficient', read: '2026-11-16' },
    { claim: 'Correlation does not imply causation; possible explanations include reverse causation, a common cause (confounding variable) and coincidence.', source: 'https://en.wikipedia.org/wiki/Correlation_does_not_imply_causation', read: '2026-11-16' },
    { claim: 'A confounder is associated with the exposure and affects the outcome; failing to control for it produces a spurious association.', source: 'https://en.wikipedia.org/wiki/Confounding', read: '2026-11-16' },
    { claim: 'Random assignment spreads known and unknown confounders across the groups by chance, so they are not linked to the assignment.', source: 'https://en.wikipedia.org/wiki/Confounding', read: '2026-11-16' },
  ],
  blocks: [
    p(
      'Social scientists often ask whether two variables go together: whether people who sleep more earn higher marks, or whether towns with more parks have fewer hospital visits.',
      'Two variables are correlated if high values of one tend to come with high values of the other (a positive correlation) or with low values of the other (a negative correlation).',
    ),
    p(
      'The strength of a straight-line relationship is measured by the correlation coefficient r, which always lies between −1 and +1.',
      'Its sign gives the direction.',
      'Its distance from 0 gives the strength: values near +1 or −1 mean the points of a scatter plot lie close to a straight line, values near 0 that there is no straight-line (linear) trend.',
      'So r = −0.9 shows a stronger relationship than r = +0.5.',
      'The coefficient has no units, and it does not change if a variable is measured in different units, such as centimetres instead of metres.',
      'It measures only straight-line relationships: two variables can be closely linked along a curve and still have an r close to 0.',
    ),
    p(
      'A correlation, however strong, does not show that one variable causes the other.',
      'Three other explanations are especially common.',
      'The first is chance: in a small sample, two unrelated variables can appear to move together.',
      'The second is reverse causation: the effect may run the other way, from the supposed effect to the supposed cause.',
      'The third is confounding: a third variable, called a confounder, influences both, so that the two move together without either affecting the other.',
      'Suppose, for example, that in a seaside town the daily sales of ice cream and the daily number of swimmers rise and fall together: neither causes the other, because warm, sunny weather raises both.',
    ),
    p(
      'Researchers deal with confounders in two ways.',
      'In an observational study they record possible confounders and compare like with like, such as days with similar weather; but a confounder nobody thought of, or could measure, remains a risk.',
      'In a randomised experiment, the researchers themselves decide by chance who receives a treatment and who does not.',
      'Chance then spreads every possible confounder, known or unknown, evenly over the groups on average, so a clear difference between the groups at the end can be put down to the treatment.',
      'That is why randomised experiments are the strongest evidence of cause and effect, although for many questions an experiment would be impossible or unethical, and researchers must rely on careful observational studies.',
    ),
  ],
  questions: [
    {
      type: 'R', level: 1,
      stem: 'According to the text, what does a correlation coefficient of r = −0.9 between two variables show?',
      options: [
        { text: 'A weak relationship, because a value below 0 means the variables hardly move together.', why: 'The sign gives the direction, not the strength. −0.9 is far from 0, so the relationship is strong.' },
        { text: 'A strong relationship: high values of one tend to come with low values of the other.', correct: true, why: 'The size, 0.9, is close to 1, and the minus sign means a negative correlation.' },
        { text: 'That a rise in one variable causes the other variable to fall.', why: 'A correlation alone does not show cause and effect, as the third paragraph says.' },
        { text: 'That the two variables are not related to each other in any way.', why: 'That would be suggested by an r close to 0, and even then only for straight-line relationships.' },
      ],
      explanation: 'The second paragraph: the sign of r gives the direction and its distance from 0 gives the strength. −0.9 is a strong negative correlation: high values of one variable tend to come with low values of the other.',
    },
    {
      type: 'C', level: 1,
      stem: 'Four studies report these correlation coefficients. Which shows the strongest straight-line relationship?',
      options: rs.map((r) => ({
        text: `r = ${r2(r)}`,
        ...(r === strongest ? { correct: true } : {}),
        why: r === strongest
          ? `Its distance from 0, ${fixed(Math.abs(r), 2)}, is the largest; the minus sign only gives the direction.`
          : `Its distance from 0 is ${fixed(Math.abs(r), 2)}, less than the ${fixed(Math.abs(strongest), 2)} of r = ${r2(strongest)}.`,
      })),
      explanation: `The strength is the distance from 0, whatever the sign. ${r2(strongest)} is ${fixed(Math.abs(strongest), 2)} from 0, more than any of the others, so it shows the strongest relationship, a negative one.`,
    },
    {
      type: 'C', level: 2,
      stem: 'Across the cities of one country, the number of bookshops is strongly correlated with the number of dentists. Which explanation in the text fits best?',
      options: [
        { text: 'Bookshops cause dentists to open practices nearby.', why: 'Nothing about bookshops would bring dentists; the text warns against reading a correlation as cause.' },
        { text: 'Reverse causation: dentists cause bookshops to open.', why: 'Nothing about dentists would bring bookshops either.' },
        { text: 'Chance in a small sample.', why: 'The correlation is strong and covers all the cities of a country, which makes chance an unlikely explanation.' },
        { text: 'Confounding: larger cities have more of both.', correct: true, why: 'The number of inhabitants raises both counts without either affecting the other.' },
      ],
      explanation: 'The third paragraph describes confounding: a third variable influences both. A city with more inhabitants has more customers for bookshops and more patients for dentists, so the two counts rise together.',
    },
    {
      type: 'C', level: 3,
      stem: 'At one school, pupils who attend extra maths lessons have lower average maths marks than pupils who do not. A parent concludes that the extra lessons make pupils worse at maths. Which explanation from the text is most likely?',
      options: [
        { text: 'Confounding by the size of the classes.', why: 'Nothing in the situation links class size to both attending the lessons and the marks; it is not the obvious alternative.' },
        { text: 'Reverse causation: low marks lead pupils to attend the extra lessons.', correct: true, why: 'Pupils who are struggling are the ones most likely to be sent to extra lessons, so the marks influence attendance.' },
        { text: 'Chance, because marks vary from test to test.', why: 'Chance is possible, but there is an obvious other explanation, and the question asks which is most likely.' },
        { text: 'The parent is right, because the correlation is negative.', why: 'The sign of a correlation says nothing about which variable causes which.' },
      ],
      explanation: 'The third paragraph: in reverse causation the effect runs from the supposed effect to the supposed cause. Here low marks are likely to be the reason pupils attend extra lessons, not the result. The parent reads the arrow from lessons to marks; the more likely arrow runs from marks to lessons.',
    },
    {
      type: 'S', level: 2,
      stem: 'Which statement about the correlation coefficient r is true according to the text?',
      options: [
        { text: 'r can be close to 0 even when two variables are closely linked.', correct: true, why: 'r measures only straight-line relationships; a close link along a curve can give an r near 0.' },
        { text: 'r = +1 shows that one variable causes the other.', why: 'Even a perfect correlation does not show cause and effect.' },
        { text: 'r changes if heights are measured in centimetres instead of metres.', why: 'The text says r does not change when a variable is measured in different units.' },
        { text: 'r = −0.8 shows a weaker relationship than r = +0.5.', why: 'The strength is the distance from 0: 0.8 is further from 0 than 0.5.' },
      ],
      explanation: 'The second paragraph: r measures only straight-line relationships, so two variables closely linked along a curve can still have an r close to 0.',
    },
    {
      type: 'T', level: 3,
      stem: `A school wants to know whether a reading app improves reading scores, and ${pupils} pupils take part. Which study would allow the school to conclude that the app itself causes any improvement?`,
      options: [
        { text: 'Compare the end-of-year reading scores of pupils who chose to use the app with those of pupils who chose not to.', why: 'Pupils who choose the app may already read more or have more help at home: a confounder.' },
        { text: 'Measure, among the pupils who use the app, whether those who use it more hours have higher scores.', why: 'A correlation among users can still come from confounding or from reverse causation: keen readers may simply use it more.' },
        { text: 'Measure the scores of volunteers before and after a term of using the app.', why: 'Scores rise over a term anyway, and volunteers may differ from other pupils; there is no group without the app to compare with.' },
        { text: 'Decide by lot which pupils use the app for a term, and compare their scores with those of the other pupils at the end.', correct: true, why: 'Random assignment spreads confounders evenly over the two groups, so a clear difference can be put down to the app.' },
      ],
      explanation: 'The last paragraph: in a randomised experiment, chance decides who gets the treatment, which spreads every confounder, known or unknown, evenly over the groups on average. Only the study that assigns the app by lot does that; the others let the pupils, or their keenness, decide.',
    },
  ],
};

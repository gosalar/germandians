// Full mock, passage 1. Area: mathematics. Subject: conditional probability with tree diagrams.
import { fixed, numericOptions, p } from '../lib.mjs';

// ---------- the numbers behind Figure 1 and the questions ----------
const van = 0.7;
const bike = 1 - van;
const lateGivenVan = 0.1;
const lateGivenBike = 0.6;

const vanLate = van * lateGivenVan;
const vanOnTime = van * (1 - lateGivenVan);
const bikeLate = bike * lateGivenBike;
const bikeOnTime = bike * (1 - lateGivenBike);
const late = vanLate + bikeLate;
const bikeGivenLate = bikeLate / late;
if (Math.abs(vanLate - bikeLate) < 1e-9) throw new Error('the two late paths must differ, or question 4 can be answered by "one of two"');
const onFigure = [van, bike, lateGivenVan, 1 - lateGivenVan, lateGivenBike, 1 - lateGivenBike].map((x) => fixed(x, 1));
if (new Set(onFigure).size !== onFigure.length) throw new Error('every number on Figure 1 must be different');

// Question 6: a depot where the two late paths are equal although lateness depends on the carrier.
const other = { van: 0.8, bike: 0.2, lateGivenVan: 0.1, lateGivenBike: 0.4 };
if (Math.abs(other.van * other.lateGivenVan - other.bike * other.lateGivenBike) > 1e-9) throw new Error('the counter-example needs equal late paths');

// Question 5: the bike couriers improve.
const lateGivenBikeAfter = 0.2;
const lateAfter = vanLate + bike * lateGivenBikeAfter;

// Question 7: six batteries, three charged and three flat, two taken without putting the first back.
const charged = 3;
const flat = 3;
const total = charged + flat;
const bothCharged = (charged / total) * ((charged - 1) / (total - 1));
const bothFlat = (flat / total) * ((flat - 1) / (total - 1));
const sameKind = bothCharged + bothFlat;
const sameKindIfPutBack = (charged / total) ** 2 + (flat / total) ** 2;
if ([charged / total, flat / total].some((share) => Math.abs(share - sameKind) < 1e-9)) throw new Error('question 7: the answer must not equal a share that can be read off the question');

/// ---------- Figure 1 ----------
// A branch that goes up has its probability above the line; one that goes down has it below,
// so no label sits between two branches.
const branch = (x1, y1, x2, y2, label) => {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/><text class="prob" x="${mx}" y="${y2 < y1 ? my - 9 : my + 21}" text-anchor="middle">${label}</text>`;
};
const figure1 = `<svg viewBox="0 0 440 300" role="img" aria-labelledby="p01-fig1-alt">
  <g class="branches">
    ${branch(68, 150, 178, 80, fixed(van, 1))}
    ${branch(68, 150, 178, 220, fixed(bike, 1))}
    ${branch(236, 80, 350, 36, fixed(lateGivenVan, 1))}
    ${branch(236, 80, 350, 124, fixed(1 - lateGivenVan, 1))}
    ${branch(236, 220, 350, 176, fixed(lateGivenBike, 1))}
    ${branch(236, 220, 350, 264, fixed(1 - lateGivenBike, 1))}
  </g>
  <g class="nodes">
    <text x="34" y="156" text-anchor="middle">Parcel</text>
    <text x="207" y="86" text-anchor="middle">Van</text>
    <text x="207" y="226" text-anchor="middle">Bike</text>
    <text x="358" y="42">Late</text>
    <text x="358" y="130">On time</text>
    <text x="358" y="182">Late</text>
    <text x="358" y="270">On time</text>
  </g>
</svg>`;

export default {
  id: 'p01',
  set: 'mock',
  area: 'mathematics',
  title: 'Probability Trees',
  // Every rule the passage states, with where it was checked.
  facts: [
    { claim: 'A probability is a number from 0 to 1; 0 means the event never happens, 1 that it always happens.', source: 'https://openstax.org/books/introductory-statistics-2e/pages/3-1-terminology', read: '2026-11-16' },
    { claim: 'The conditional probability of A given B is written P(A | B).', source: 'https://openstax.org/books/introductory-statistics-2e/pages/3-1-terminology', read: '2026-11-16' },
    { claim: 'Multiplication rule: P(A and B) = P(B) × P(A | B), which can be written P(A | B) = P(A and B) ÷ P(B).', source: 'https://openstax.org/books/introductory-statistics-2e/pages/3-3-two-basic-rules-of-probability', read: '2026-11-16' },
    { claim: 'For events that cannot happen together, P(A or B) = P(A) + P(B). Different paths of a tree cannot happen together.', source: 'https://openstax.org/books/introductory-statistics-2e/pages/3-3-two-basic-rules-of-probability', read: '2026-11-16' },
    { claim: 'A and B are independent if P(B | A) = P(B): knowing that one occurred does not affect the chance of the other.', source: 'https://openstax.org/books/introductory-statistics-2e/pages/3-2-independent-and-mutually-exclusive-events', read: '2026-11-16' },
    { claim: 'In a tree labelled with probabilities, the probability at the end of a path is the product of the probabilities on its branches; without replacement the second-stage probabilities depend on the first draw.', source: 'https://openstax.org/books/introductory-statistics-2e/pages/3-5-tree-and-venn-diagrams', read: '2026-11-16' },
    { claim: 'A complement: P(A) + P(not A) = 1, so the branches leaving one point add up to 1.', source: 'https://openstax.org/books/introductory-statistics-2e/pages/3-1-terminology', read: '2026-11-16' },
  ],
  blocks: [
    p(
      'A probability is a number from 0 to 1 that says how likely an event is: 0 means it never happens, 1 means it always happens.',
      'Many situations unfold in stages.',
      'A parcel, for example, is first handed to a carrier and then arrives late or on time.',
      'A probability tree draws such a situation from left to right, with one set of branches for each stage and a probability written on every branch.',
      'A path is one route through the tree from the start to an end, taking one branch at each stage.',
      'Exactly one of the branches that leave a point is taken, so their probabilities add up to 1.',
      'The probabilities at a later stage may depend on what happened before: if a first choice changes what is left, the branches after it change too.',
    ),
    p(
      'The branches of the second stage carry conditional probabilities.',
      'A conditional probability is the probability of one event given that another event is known to happen or to have happened.',
      'The probability of B given A is written P(B | A).',
      `In Figure 1, the ${fixed(lateGivenVan, 1)} on the "Late" branch after "Van" is P(late | van): of the parcels that go by van, one in ten arrives late.`,
    ),
    {
      type: 'figure',
      id: 'p01-fig1',
      caption: 'Figure 1. A probability tree for the parcels of one depot. Each parcel is carried by van or by bike, and then arrives late or on time.',
      alt: `A tree with two stages. First stage: van ${fixed(van, 1)}, bike ${fixed(bike, 1)}. After van: late ${fixed(lateGivenVan, 1)}, on time ${fixed(1 - lateGivenVan, 1)}. After bike: late ${fixed(lateGivenBike, 1)}, on time ${fixed(1 - lateGivenBike, 1)}.`,
      svg: figure1,
    },
    p(
      'Two rules turn the tree into answers.',
      'First, multiply along a path: the probability that A and B both happen is',
    ),
    { type: 'formula', text: 'P(A and B) = P(A) × P(B | A)' },
    p(
      'Second, add across paths: when an event can be reached by more than one path, its probability is the sum of the probabilities of those paths.',
    ),
    p(
      'A tree also lets you turn a condition around.',
      'In general, P(A | B) is not the same as P(B | A).',
      'To find P(A | B), divide the probability of the path on which both A and B happen by the total probability of B, which the second rule gives:',
    ),
    { type: 'formula', text: 'P(A | B) = P(A and B) ÷ P(B)' },
    p(
      'Two events are called independent if knowing that one has happened does not change the probability of the other, so that P(B | A) = P(B).',
      'If the probability of B depends on whether A has happened, the events are dependent.',
    ),
  ],
  questions: [
    {
      type: 'R', level: 1,
      stem: 'Which statement about the probabilities in a probability tree is correct?',
      options: [
        { text: 'The probabilities on the branches that leave the same point add up to 1.', correct: true, why: 'Exactly one of those branches is taken, as the first paragraph says.' },
        { text: 'The probabilities on all the branches of the tree add up to 1.', why: `Each branching point has its own set of branches adding up to 1. Figure 1 has three such points, so all its branches add up to 3.` },
        { text: 'The probabilities along one path add up to 1.', why: `Along a path the probabilities are multiplied, not added. On the path "van, late" they are ${fixed(van, 1)} and ${fixed(lateGivenVan, 1)}.` },
        { text: 'Every path through the tree has the same probability.', why: `The four paths in Figure 1 have the probabilities ${fixed(vanLate)}, ${fixed(vanOnTime)}, ${fixed(bikeLate)} and ${fixed(bikeOnTime)}.` },
      ],
      explanation: 'The first paragraph states it: exactly one of the branches that leave a point is taken, so their probabilities add up to 1.',
    },
    {
      type: 'F', level: 1,
      stem: 'According to Figure 1, what is the probability that a parcel is carried by van and arrives on time?',
      options: numericOptions(
        { value: vanOnTime, why: `Multiply along the path: ${fixed(van, 1)} × ${fixed(1 - lateGivenVan, 1)}.` },
        [
          { value: vanLate, why: 'This is the path "van, late", not "van, on time".' },
          { value: bikeOnTime, why: 'This is the path "bike, on time".' },
          { value: 1 - lateGivenVan, why: 'This is P(on time | van) alone. It leaves out the probability that the parcel goes by van at all.' },
        ],
      ),
      explanation: `Follow the path "van, on time" and multiply: ${fixed(van, 1)} × ${fixed(1 - lateGivenVan, 1)} = ${fixed(vanOnTime)}.`,
    },
    {
      type: 'A', level: 2,
      stem: 'What is the probability that a parcel from this depot arrives late?',
      options: numericOptions(
        { value: late, why: `Two paths end in "late": ${fixed(vanLate)} + ${fixed(bikeLate)}.` },
        [
          { value: vanLate, why: 'This is only one of the two paths that end in "late".' },
          { value: (lateGivenVan + lateGivenBike) / 2, why: `This is the average of ${fixed(lateGivenVan, 1)} and ${fixed(lateGivenBike, 1)}. It ignores that the van carries more parcels than the bike.` },
          { value: lateGivenVan + lateGivenBike, why: `This adds the two conditional probabilities ${fixed(lateGivenVan, 1)} and ${fixed(lateGivenBike, 1)} without first multiplying along each path.` },
        ],
      ),
      explanation: `Multiply along each path that ends in "late", then add: ${fixed(van, 1)} × ${fixed(lateGivenVan, 1)} + ${fixed(bike, 1)} × ${fixed(lateGivenBike, 1)} = ${fixed(vanLate)} + ${fixed(bikeLate)} = ${fixed(late)}.`,
    },
    {
      type: 'T', level: 3,
      stem: 'A parcel from this depot has arrived late. What is the probability that it was carried by bike?',
      options: numericOptions(
        { value: bikeGivenLate, why: `P(bike | late) = P(bike and late) ÷ P(late) = ${fixed(bikeLate)} ÷ ${fixed(late)}.` },
        [
          { value: bikeLate, why: 'This is the probability that a parcel goes by bike and is late. It has not been divided by the probability of being late.' },
          { value: bike, why: 'This is the share of all parcels that go by bike. It ignores what is known: this parcel is late.' },
          { value: lateGivenBike, why: 'This is P(late | bike), the condition the wrong way round.' },
        ],
      ),
      explanation: `Turn the condition around: P(bike | late) = P(bike and late) ÷ P(late) = ${fixed(bikeLate)} ÷ ${fixed(late)} = ${fixed(bikeGivenLate)}. The bike carries ${fixed(bike, 1)} of all parcels but ${fixed(bikeGivenLate)} of the late ones.`,
    },
    {
      type: 'D', level: 2,
      stem: `The depot trains its bike couriers, and the probability that a bike parcel arrives late falls from ${fixed(lateGivenBike, 1)} to ${fixed(lateGivenBikeAfter, 1)}. The shares carried by van and by bike and the figures for the van stay the same. What happens to the probability that a parcel arrives late?`,
      options: [
        { text: `It falls by ${fixed(late - lateAfter)}.`, correct: true, why: `The path "bike, late" falls from ${fixed(bikeLate)} to ${fixed(bike * lateGivenBikeAfter)}; the path "van, late" stays at ${fixed(vanLate)}.` },
        { text: `It falls by ${fixed(bikeLate)}.`, why: `That would remove the whole path "bike, late". The path only shrinks, from ${fixed(bikeLate)} to ${fixed(bike * lateGivenBikeAfter)}.` },
        { text: `It falls by ${fixed(lateGivenBike - lateGivenBikeAfter, 1)}.`, why: `${fixed(lateGivenBike - lateGivenBikeAfter, 1)} is the change on the bike branch. Only ${fixed(bike, 1)} of the parcels go by bike, so the effect on all parcels is ${fixed(bike, 1)} × ${fixed(lateGivenBike - lateGivenBikeAfter, 1)}.` },
        { text: 'It falls to a third of what it was.', why: `Only the path "bike, late" falls to a third. The total goes from ${fixed(late)} to ${fixed(lateAfter)}.` },
      ],
      explanation: `Before: ${fixed(vanLate)} + ${fixed(bikeLate)} = ${fixed(late)}. After: ${fixed(vanLate)} + ${fixed(bike, 1)} × ${fixed(lateGivenBikeAfter, 1)} = ${fixed(lateAfter)}. The probability falls by ${fixed(late - lateAfter)}.`,
    },
    {
      type: 'C', level: 3,
      stem: 'Another depot has a tree like Figure 1 with different numbers. In which case must "carried by bike" and "arrives late" be independent events?',
      options: [
        { text: 'When van and bike each carry half of the parcels.', why: 'The shares in the first stage say nothing about whether lateness depends on the carrier.' },
        { text: 'When the two paths that end in "late" have the same probability.', why: `Take a depot where the van carries ${fixed(other.van, 1)} of the parcels with P(late | van) = ${fixed(other.lateGivenVan, 1)}, and the bike ${fixed(other.bike, 1)} with P(late | bike) = ${fixed(other.lateGivenBike, 1)}. Both paths are ${fixed(other.van * other.lateGivenVan)}, yet a bike parcel is four times as likely to be late as a van parcel.` },
        { text: 'When P(late | van) and P(late | bike) are equal.', correct: true, why: 'Then a parcel is equally likely to be late whichever carrier has it, so P(late | bike) = P(late).' },
        { text: 'When P(late | van) and P(late | bike) add up to 1.', why: 'The values 0.1 and 0.9 add up to 1, but lateness then clearly depends on the carrier.' },
      ],
      explanation: 'Independent means that knowing the carrier does not change the probability of being late: P(late | bike) = P(late). P(late) = P(van) × P(late | van) + P(bike) × P(late | bike) is a weighted average of the two "late" branches, so it equals P(late | bike) only when both branches carry the same probability.',
    },
    {
      type: 'T', level: 3,
      stem: `A box holds ${total} batteries: ${charged} are charged and ${flat} are flat. Two batteries are taken out at random, one after the other, and the first is not put back. What is the probability that both are of the same kind?`,
      options: numericOptions(
        { value: sameKind, why: `Both charged: ${charged}/${total} × ${charged - 1}/${total - 1} = ${fixed(bothCharged)}. Both flat: ${flat}/${total} × ${flat - 1}/${total - 1} = ${fixed(bothFlat)}. Add the two paths.` },
        [
          { value: bothCharged, why: 'This is only one of the two paths, "charged, charged". The path "flat, flat" has the same probability and also counts.' },
          { value: sameKindIfPutBack, why: `This treats the second battery as if the first had been put back: (${charged}/${total})² + (${flat}/${total})².` },
          { value: 1 - sameKind, why: 'This is the probability that the two batteries are of different kinds.' },
        ],
      ),
      explanation: `Draw a tree with two stages. After the first battery is taken, ${total - 1} are left, so the second-stage probabilities change. Both charged: ${charged}/${total} × ${charged - 1}/${total - 1} = ${fixed(bothCharged)}. Both flat: ${flat}/${total} × ${flat - 1}/${total - 1} = ${fixed(bothFlat)}. Together: ${fixed(sameKind)}.`,
    },
  ],
};

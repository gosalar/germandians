// Practice set, mathematics. Subject: arithmetic and geometric sequences.
import { numericOptions, p, whole } from '../lib.mjs';

// A small count in words, so "multiplying by 2 three times" does not read as "2 3 times".
const count = (n) => ['zero', 'one', 'two', 'three', 'four', 'five', 'six'][n] ?? `${n}`;

// ---------- Table 1: the first four terms of four sequences ----------
const arith = (a1, d) => (n) => a1 + (n - 1) * d;
const geom = (a1, r) => (n) => a1 * r ** (n - 1);
const A = { a1: 3, d: 4 };
const B = { a1: 5, r: 2 };
const D = { a1: 96, r: 1 / 2 };
const seqA = arith(A.a1, A.d);
const seqB = geom(B.a1, B.r);
const seqD = geom(D.a1, D.r);
const seqC = [2, 4, 8, 14]; // differences 2, 4, 6: neither kind
const first = (f) => [1, 2, 3, 4].map(f);
const rows = [['A', first(seqA)], ['B', first(seqB)], ['C', seqC], ['D', first(seqD)]];
const inTable = rows.flatMap(([, xs]) => xs);
if (new Set(inTable).size !== inTable.length) throw new Error('every number in Table 1 must be different');
const isArith = (xs) => new Set(xs.slice(1).map((x, i) => x - xs[i])).size === 1;
const isGeom = (xs) => new Set(xs.slice(1).map((x, i) => x / xs[i])).size === 1;
const kinds = rows.map(([, xs]) => (isArith(xs) ? 'arithmetic' : isGeom(xs) ? 'geometric' : 'neither'));
if (kinds.join() !== 'arithmetic,geometric,neither,geometric') throw new Error('Table 1 does not hold the kinds the questions need');

// Question 3: the 20th term of A.
const n3 = 20;
// Question 4: the sum of the first 10 terms of A.
const n4 = 10;
const sumA = (n) => (n * (seqA(1) + seqA(n))) / 2;
let check = 0; for (let k = 1; k <= n4; k++) check += seqA(k);
if (check !== sumA(n4)) throw new Error('the sum formula disagrees with adding the terms');
// Question 5: later term of B against an earlier one.
const [early5, late5] = [9, 12];
const factor5 = seqB(late5) / seqB(early5);
if (factor5 === late5 - early5 || factor5 === late5 / early5) throw new Error('question 5 needs a factor no shortcut gives');

// Question 6: two pay offers over 8 weeks.
const weeks = 8;
const X = { a1: 200, d: 20 };
const Y = { a1: 10, r: 2 };
const payX = arith(X.a1, X.d);
const payY = geom(Y.a1, Y.r);
const totalX = (weeks * (payX(1) + payX(weeks))) / 2;
const totalY = (Y.a1 * (1 - Y.r ** weeks)) / (1 - Y.r);
// Weeks in which offer Y pays less than offer X; they must be the first ones, as the explanation says.
const yBehind = Array.from({ length: weeks }, (_, k) => k + 1).filter((k) => payY(k) < payX(k));
if (yBehind.some((k, i) => k !== i + 1)) throw new Error('question 6: Y must trail X only in the first weeks');
let sx = 0; let sy = 0; for (let k = 1; k <= weeks; k++) { sx += payX(k); sy += payY(k); }
if (sx !== totalX || sy !== totalY) throw new Error('question 6 sums disagree');
const ySumOneShort = (Y.a1 * (1 - Y.r ** (weeks - 1))) / (1 - Y.r);
const yWithArithFormula = (weeks * (payY(1) + payY(weeks))) / 2;
const lastWeeks = payY(weeks) - payX(weeks);
if (!(totalY > totalX)) throw new Error('question 6 is written for offer Y paying more');

const euro = (v) => `€${whole(v)}`;

export default {
  id: 'p10',
  set: 'practice',
  area: 'mathematics',
  title: 'Arithmetic and Geometric Sequences',
  facts: [
    { claim: 'In an arithmetic sequence consecutive terms differ by a constant, the common difference d; a_n = a_1 + (n − 1)d.', source: 'https://openstax.org/books/college-algebra-2e/pages/9-2-arithmetic-sequences', read: '2026-11-16' },
    { claim: 'In a geometric sequence the ratio of any term to the previous one is constant, the common ratio r; a_n = a_1 r^(n − 1).', source: 'https://openstax.org/books/college-algebra-2e/pages/9-3-geometric-sequences', read: '2026-11-16' },
    { claim: 'Sum of the first n terms of an arithmetic series: S_n = n(a_1 + a_n)/2.', source: 'https://openstax.org/books/college-algebra-2e/pages/9-4-series-and-their-notations', read: '2026-11-16' },
    { claim: 'Sum of the first n terms of a geometric series: S_n = a_1(1 − r^n)/(1 − r), r ≠ 1.', source: 'https://openstax.org/books/college-algebra-2e/pages/9-4-series-and-their-notations', read: '2026-11-16' },
  ],
  blocks: [
    p(
      'A sequence is a list of numbers in a fixed order.',
      'Its members are called terms, and a₁, a₂, a₃ and so on stand for the first, second and third term; aₙ is the term in place n.',
      'Two kinds of sequence follow a simple rule and appear wherever something grows or shrinks step by step.',
    ),
    p(
      'In an arithmetic sequence, each term is the previous one plus a fixed number d, the common difference.',
      'The sequence 10, 13, 16, 19 has d = 3; a sequence that falls has a negative d.',
      'To reach term n from the first term, d is added n − 1 times:',
    ),
    { type: 'formula', text: 'aₙ = a₁ + (n − 1) × d' },
    p(
      'To add the first n terms, write the sum forwards and backwards and add the two lines.',
      'Each of the n columns then adds up to a₁ + aₙ: the first column pairs the first term with the last, the second column the second term with the second-to-last, and so on.',
      'So twice the sum is n × (a₁ + aₙ), and the sum Sₙ is n × (a₁ + aₙ) ÷ 2.',
    ),
    p(
      'In a geometric sequence, each term is the previous one multiplied by a fixed number r, the common ratio.',
      'The sequence 2, 6, 18, 54 has r = 3.',
      'If r lies between 0 and 1, the terms shrink in size, each a fixed fraction of the one before.',
      'To reach term n, the first term is multiplied by r a total of n − 1 times:',
    ),
    { type: 'formula', text: 'aₙ = a₁ × r^(n − 1)' },
    p('For r other than 1, the sum of the first n terms is'),
    { type: 'formula', text: 'Sₙ = a₁ × (1 − rⁿ) ÷ (1 − r)' },
    p(
      'The difference between the two kinds matters in practice.',
      'An arithmetic sequence grows by the same amount at every step.',
      'A geometric sequence with a positive first term and r greater than 1 grows by the same factor, so its steps get larger and larger; however slowly it starts, it overtakes any arithmetic sequence in the end.',
      'Table 1 lists the first four terms of four sequences.',
    ),
    {
      type: 'table',
      caption: 'Table 1. The first four terms of four sequences.',
      head: ['Sequence', 'a₁', 'a₂', 'a₃', 'a₄'],
      rows: rows.map(([name, xs]) => [name, ...xs.map((x) => whole(x))]),
    },
  ],
  questions: [
    {
      type: 'R', level: 1,
      stem: 'According to the text, what stays the same from one term to the next in a geometric sequence?',
      options: [
        { text: 'The difference between consecutive terms.', why: 'That stays the same in an arithmetic sequence.' },
        { text: 'The sum of consecutive terms.', why: 'In 2, 6, 18, 54 the sums of neighbours are 8, 24 and 72.' },
        { text: 'The size of each step.', why: 'With r greater than 1 the steps get larger and larger, as the text says.' },
        { text: 'The ratio of each term to the one before.', correct: true, why: 'Each term is the previous one multiplied by the common ratio r.' },
      ],
      explanation: 'The fourth paragraph: in a geometric sequence each term is the previous one multiplied by a fixed number r, so the ratio of each term to the one before is r.',
    },
    {
      type: 'C', level: 2,
      stem: 'Which sequence in Table 1 is neither arithmetic nor geometric?',
      options: rows.map(([name, xs], i) => ({
        text: `Sequence ${name}.`,
        ...(kinds[i] === 'neither' ? { correct: true } : {}),
        why: kinds[i] === 'arithmetic'
          ? `It adds ${A.d} at every step: arithmetic.`
          : kinds[i] === 'geometric'
            ? `It is multiplied by ${xs[1] / xs[0] < 1 ? `1/${xs[0] / xs[1]}` : xs[1] / xs[0]} at every step: geometric, ${xs[1] < xs[0] ? 'shrinking' : 'growing'}.`
            : `The differences are ${xs.slice(1).map((x, k) => x - xs[k]).join(', ')}, not the same, and the ratios are not the same either.`,
      })),
      explanation: `Sequence C goes ${seqC.join(', ')}. Its differences are ${seqC.slice(1).map((x, k) => x - seqC[k]).join(', ')}, so it is not arithmetic; ${seqC[1]} ÷ ${seqC[0]} = ${seqC[1] / seqC[0]} but ${seqC[3]} ÷ ${seqC[2]} = ${seqC[3] / seqC[2]}, so it is not geometric. D shrinks, but by the same factor each time, which makes it geometric.`,
    },
    {
      type: 'A', level: 2,
      stem: `What is the ${n3}th term of sequence A in Table 1?`,
      options: numericOptions(
        { value: seqA(n3), why: `${A.a1} + (${n3} − 1) × ${A.d}.` },
        [
          { value: A.a1 + n3 * A.d, why: `This adds d ${n3} times. From the first to the ${n3}th term it is added ${n3 - 1} times.` },
          { value: n3 * A.d, why: `This is ${n3} × ${A.d}, which leaves out the first term.` },
          { value: (n3 - 1) * A.d, why: `This is how much is added, (${n3} − 1) × ${A.d}, without the first term ${A.a1}.` },
        ],
        whole,
      ),
      explanation: `Sequence A starts at ${A.a1} and adds ${A.d} each time. aₙ = a₁ + (n − 1) × d = ${A.a1} + ${n3 - 1} × ${A.d} = ${seqA(n3)}.`,
    },
    {
      type: 'A', level: 2,
      stem: `What is the sum of the first ${n4} terms of sequence A in Table 1?`,
      options: numericOptions(
        { value: sumA(n4), why: `${n4} × (${seqA(1)} + ${seqA(n4)}) ÷ 2.` },
        [
          { value: (n4 * (seqA(1) + A.a1 + n4 * A.d)) / 2, why: `This uses ${A.a1 + n4 * A.d} as the ${n4}th term; it is ${seqA(n4)}.` },
          { value: (A.d * n4 * (n4 + 1)) / 2, why: `This takes term k to be k × ${A.d}, so it adds ${A.d} + ${2 * A.d} + … + ${n4 * A.d}. Term k is ${A.a1} + (k − 1) × ${A.d}.` },
          { value: (A.d * n4 * (n4 - 1)) / 2, why: `This adds only the differences, 0 + ${A.d} + … + ${(n4 - 1) * A.d}, and leaves out the first term ${A.a1}, which every term contains.` },
        ],
        whole,
      ),
      explanation: `The ${n4}th term is ${A.a1} + ${n4 - 1} × ${A.d} = ${seqA(n4)}. Sₙ = n × (a₁ + aₙ) ÷ 2 = ${n4} × (${seqA(1)} + ${seqA(n4)}) ÷ 2 = ${sumA(n4)}.`,
    },
    {
      type: 'D', level: 2,
      stem: `In sequence B of Table 1, how many times as large is the ${late5}th term as the ${early5}th term?`,
      options: numericOptions(
        { value: factor5, why: `From the ${early5}th to the ${late5}th term the sequence is multiplied by ${B.r} three times: ${B.r}³.` },
        [
          { value: late5 - early5, why: `This is the number of steps, ${late5} − ${early5}. Each step multiplies by ${B.r}.` },
          { value: (late5 - early5) * B.r, why: `This multiplies ${late5 - early5} steps by ${B.r}. Multiplying by ${B.r} ${count(late5 - early5)} times gives ${B.r} to the power ${late5 - early5}, not ${B.r} × ${late5 - early5}.` },
          { value: B.r ** (late5 - early5 + 1), why: `This multiplies by ${B.r} ${count(late5 - early5 + 1)} times, one step too many: from place ${early5} to place ${late5} there are ${late5 - early5} steps.` },
        ],
        whole,
      ),
      explanation: `Each step multiplies by r = ${B.r}. From place ${early5} to place ${late5} there are ${late5 - early5} steps, so the factor is ${B.r}^${late5 - early5} = ${factor5}. The formula agrees: a${late5} ÷ a${early5} = r^(${late5 - 1}) ÷ r^(${early5 - 1}) = r^${late5 - early5}.`,
    },
    {
      type: 'T', level: 3,
      stem: `A summer job lasts ${weeks} weeks. Offer X pays ${euro(X.a1)} in the first week and ${euro(X.d)} more each week than the week before. Offer Y pays ${euro(Y.a1)} in the first week and twice as much each week as the week before. Which offer pays more over the ${weeks} weeks, and by how much?`,
      options: [
        { text: `Offer X, by ${euro(totalX - ySumOneShort)}.`, why: `This adds up only ${weeks - 1} weeks of offer Y: ${euro(ySumOneShort)}. Over ${weeks} weeks it pays ${euro(totalY)}.` },
        { text: `Offer Y, by ${euro(lastWeeks)}.`, why: `This compares only the last week: ${euro(payY(weeks))} against ${euro(payX(weeks))}. The question asks about the whole ${weeks} weeks.` },
        { text: `Offer Y, by ${euro(yWithArithFormula - totalX)}.`, why: `This uses the arithmetic sum formula for offer Y, which is geometric: (${euro(payY(1))} + ${euro(payY(weeks))}) × ${weeks} ÷ 2.` },
        { text: `Offer Y, by ${euro(totalY - totalX)}.`, correct: true, why: `${euro(totalY)} against ${euro(totalX)}.` },
      ],
      explanation: `Offer X is arithmetic: the last week pays ${X.a1} + ${weeks - 1} × ${X.d} = ${euro(payX(weeks))}, so the total is ${weeks} × (${X.a1} + ${payX(weeks)}) ÷ 2 = ${euro(totalX)}. Offer Y is geometric with r = ${Y.r}: ${Y.a1} × (1 − ${Y.r}^${weeks}) ÷ (1 − ${Y.r}) = ${Y.a1} × ${Y.r ** weeks - 1} = ${euro(totalY)}. Offer Y pays ${euro(totalY - totalX)} more, although it pays less than X in each of the first ${['one', 'two', 'three', 'four', 'five', 'six', 'seven'][yBehind.length - 1]} weeks.`,
    },
    {
      type: 'S', level: 2,
      stem: 'A geometric sequence has a positive first term and a common ratio greater than 0 and less than 1. Which statement is true for every such sequence?',
      options: [
        { text: 'Each term is smaller than the one before.', correct: true, why: 'Multiplying a positive number by a number between 0 and 1 makes it smaller, as sequence D shows.' },
        { text: 'The differences between consecutive terms are all equal.', why: `In sequence D the terms fall by ${first(seqD).slice(1).map((x, k) => first(seqD)[k] - x).join(', ').replace(/, (?=[^,]*$)/, ' and ')}: the steps are not equal.` },
        { text: 'After enough terms, the terms become negative.', why: 'Multiplying a positive number by a positive ratio always gives a positive number.' },
        { text: 'The sum of the first n terms grows beyond any number if n is large enough.', why: `rⁿ shrinks towards 0, so the sum a₁ × (1 − rⁿ) ÷ (1 − r) stays below a₁ ÷ (1 − r); for sequence D that is ${whole(D.a1 / (1 - D.r))}.` },
      ],
      explanation: 'Each term is the one before multiplied by r. With a positive first term and r between 0 and 1, every term is positive and smaller than the term before; the text says the terms shrink, each a fixed fraction of the one before.',
    },
  ],
};

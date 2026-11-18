// Mock 4, passage 41. Area: economics. Subject: the Lorenz curve and the Gini coefficient.
import { fixed, graph, numericOptions, p } from '../lib.mjs';

// ---------- Figure 1: piecewise-linear Lorenz curve ----------
const knots = [
  [0, 0],
  [40, 20],
  [80, 60],
  [100, 100],
];
const interiorCoords = knots.slice(1, -1).flat();
if (new Set(interiorCoords).size !== interiorCoords.length) {
  throw new Error('interior knot coordinates on Figure 1 must all differ');
}
for (let i = 1; i < knots.length; i++) {
  const prevSlope = i > 1 ? (knots[i - 1][1] - knots[i - 2][1]) / (knots[i - 1][0] - knots[i - 2][0]) : 0;
  const curSlope = (knots[i][1] - knots[i - 1][1]) / (knots[i][0] - knots[i - 1][0]);
  if (!(curSlope > prevSlope)) throw new Error('Lorenz curve slopes must strictly increase');
}

/** Area under a piecewise-linear Lorenz curve when coordinates are given in percent (0..100). */
function areaUnderLorenz(pts) {
  let area = 0;
  for (let i = 1; i < pts.length; i++) {
    const width = (pts[i][0] - pts[i - 1][0]) / 100;
    const avgHeight = (pts[i - 1][1] + pts[i][1]) / 200;
    area += width * avgHeight;
  }
  return area;
}

const areaB = areaUnderLorenz(knots);
const areaA = 0.5 - areaB;
const giniFig = areaA / 0.5;
if (Math.abs(areaA - areaB) < 1e-9) {
  throw new Error('area A and area B must differ so confusing them does not give the right Gini');
}

// Question 2: share of total income received by the highest-earning 20% of households in Figure 1.
const top20Share = 100 - knots[2][1];
const bottom80Cum = knots[2][1];
const topGroupWidth = 100 - knots[2][0];
const topStartPct = knots[2][0];
if (new Set([top20Share, bottom80Cum, topGroupWidth, topStartPct]).size !== 4) {
  throw new Error('question 2 options must all be distinct');
}

// Question 3: Country K quintile shares and vertical gap below the line of equality at 60%.
const kShares = [5, 9, 14, 24, 48];
if (kShares.reduce((a, b) => a + b, 0) !== 100 || new Set(kShares).size !== 5) {
  throw new Error('Country K quintile shares must be distinct and add up to 100');
}
const kCum60 = kShares[0] + kShares[1] + kShares[2];
const kGap60 = 60 - kCum60;
const kOnlyThird = kShares[2];
const kWrongSub = 60 - kOnlyThird;

// Question 4: uniform 15% income rise.
const payRisePct = 15;

// Question 5: comparing two countries whose Lorenz curves do not cross.
const giniM = 0.25;
const giniN = 0.42;
if (!(giniM < giniN && giniM !== giniFig && giniN !== giniFig)) {
  throw new Error('question 5 Gini values must be ordered and distinct from Figure 1');
}

// Question 6: Gini coefficient of Figure 1 and common slips.
const giniAsB = areaB;
const giniFourA = 4 * areaA;
const giniTwoB = 2 * areaB;

// Question 7: two four-quarter regions whose Lorenz curves cross yet enclose equal areas.
const regU = [10, 15, 25, 50];
const regV = [6, 22, 23, 49];
const toKnots4 = (qs) => {
  let c = 0;
  return [[0, 0], ...qs.map((s, i) => [(i + 1) * 25, (c += s)])];
};
const knotsU = toKnots4(regU);
const knotsV = toKnots4(regV);
const giniU = 1 - 2 * areaUnderLorenz(knotsU);
const giniV = 1 - 2 * areaUnderLorenz(knotsV);
if (
  knotsU.at(-1)[1] !== 100 ||
  knotsV.at(-1)[1] !== 100 ||
  Math.abs(giniU - giniV) > 1e-9 ||
  !(knotsU[1][1] > knotsV[1][1] && knotsU[2][1] < knotsV[2][1])
) {
  throw new Error('question 7 needs crossing Lorenz curves with identical Gini coefficients');
}

const pct = (v) => `${Math.round(v)}%`;
const pts = (v) => `${Math.round(v)} percentage points`;

const figure1 = graph({
  id: 'p41-fig1',
  w: 460,
  h: 320,
  left: 68,
  x: { min: 0, max: 100, grid: 10, label: 20, title: 'Cumulative % of households', format: pct },
  y: { min: 0, max: 100, grid: 10, label: 20, title: 'Cumulative % of income', format: pct },
  body: ({ px, py }) => `
  <line class="curve curve-3" x1="${px(0)}" y1="${py(0)}" x2="${px(100)}" y2="${py(100)}"/>
  <polyline class="curve" points="${knots.map(([x, y]) => `${px(x)},${py(y)}`).join(' ')}"/>
  ${knots.map(([x, y]) => `<circle class="dot" cx="${px(x)}" cy="${py(y)}" r="3.5"/>`).join('')}
  <text class="label-3" x="${px(46)}" y="${py(56)}" text-anchor="end">Line of equality</text>
  <text class="label-1" x="${px(66)}" y="${py(36)}" text-anchor="start">Lorenz curve</text>`,
});

export default {
  id: 'p41',
  set: 'mock',
  mock: 4,
  area: 'economics',
  title: 'The Lorenz Curve and the Gini Coefficient',
  facts: [
    { claim: 'To measure income inequality, households are ranked from lowest to highest income and often divided into equal groups such as quintiles (fifths, each 20% of households) to compare each group\'s share of total income.', source: 'https://openstax.org/books/principles-economics-3e/pages/15-4-income-inequality-measurement-and-causes', read: '2026-11-18' },
    { claim: 'A Lorenz curve plots the cumulative share of total income on the vertical axis against the cumulative share of households (ordered from lowest to highest income) on the horizontal axis; the 45-degree diagonal represents perfect equality, and the further the Lorenz curve bows below that line, the greater the inequality.', source: 'https://openstax.org/books/principles-economics-3e/pages/15-4-income-inequality-measurement-and-causes', read: '2026-11-18' },
    { claim: 'Under complete equality every bottom N% of households receives N% of total income (the line y = x); under complete inequality one household receives all income and everyone else receives zero.', source: 'https://en.wikipedia.org/wiki/Lorenz_curve', read: '2026-11-18' },
    { claim: 'With axes scaled from 0 to 1, if A is the area between the line of equality and the Lorenz curve and B is the area beneath the Lorenz curve, then A + B = 0.5 and the Gini coefficient is G = A ÷ (A + B) = 2A = 1 − 2B, ranging from 0 (complete equality) to 1 (complete inequality).', source: 'https://en.wikipedia.org/wiki/Gini_coefficient', read: '2026-11-18' },
    { claim: 'The Gini coefficient is normalised for scale (multiplying all incomes by the same positive constant leaves income shares and G unchanged), measures dispersion rather than average income, and can take the same value for two different distributions whose Lorenz curves cross.', source: 'https://en.wikipedia.org/wiki/Gini_coefficient', read: '2026-11-18' },
  ],
  blocks: [
    p(
      'Average income tells how much an economy earns per household, not how that total is shared.',
      'To picture the distribution of income, economists rank all households from lowest to highest income and often group them into equal slices, such as quarters (25% each) or quintiles (five groups of 20% each).',
      'Adding each group\'s share of total income from the bottom upwards gives the cumulative income share.',
    ),
    p(
      'A Lorenz curve plots the cumulative percentage of total income on the vertical axis against the cumulative percentage of households on the horizontal axis.',
      'It always starts at (0%, 0%) and ends at (100%, 100%).',
      'If every household had the exact same income, the lowest-earning x% of households would always receive x% of total income, tracing the straight 45-degree diagonal called the line of equality.',
      'When incomes differ, lower-income groups receive smaller shares than higher-income groups, so the Lorenz curve bows below the line of equality and grows steeper from left to right.',
      'The further it sags below the diagonal, the more unequal the distribution.',
    ),
    p(
      'To summarise the diagram in one number, write both axes as proportions from 0 to 1 instead of percentages, so the whole square has area 1 and the triangle beneath the line of equality has area 0.5.',
      'Let A be the area between the line of equality and the Lorenz curve, and let B be the area beneath the Lorenz curve.',
      'Since A + B = 0.5, the Gini coefficient G is defined as',
    ),
    { type: 'formula', text: 'G = A ÷ (A + B) = 2A = 1 − 2B' },
    p(
      'When everyone earns the same, A = 0 and G = 0.',
      'At the opposite extreme, in a large population where a single household receives all income and every other household receives nothing, B shrinks towards 0 and G approaches 1.',
      'When a Lorenz curve is drawn with straight segments between group boundaries, B is the sum of the areas under those segments, where a strip of width w rising from height h₁ to h₂ has area',
    ),
    { type: 'formula', text: 'strip area = w × (h₁ + h₂) ÷ 2' },
    p(
      'Because both axes measure shares of totals, multiplying every household\'s income by the same positive factor leaves the Lorenz curve and G unchanged, and neither tells how high average income is.',
      'Moreover, two distributions whose Lorenz curves cross can enclose the same total area A and therefore share the same Gini coefficient.',
      'Figure 1 shows the piecewise-linear Lorenz curve of one region.',
    ),
    {
      type: 'figure',
      id: 'p41-fig1',
      caption: 'Figure 1. Line of equality and piecewise-linear Lorenz curve for households in one region.',
      alt: `A graph of cumulative percentage of income from 0% to 100% against cumulative percentage of households from 0% to 100%, with grid lines every 10%. A dashed line of equality runs straight from (0%, 0%) to (100%, 100%). A solid Lorenz curve connects the marked points (0%, 0%), (40%, 20%), (80%, 60%) and (100%, 100%).`,
      svg: figure1,
    },
  ],
  questions: [
    {
      type: 'R', level: 1,
      stem: 'According to the text, what do a Gini coefficient of 0 and a Gini coefficient approaching 1 represent?',
      options: [
        { text: '0 means every household has zero income; values near 1 mean every household earns the average.', why: 'G measures how total income is shared, not the level of income; equal incomes give G = 0, not a value near 1.' },
        { text: '0 means one household receives all income; values near 1 mean every household receives the same income.', why: 'This reverses the scale: complete equality gives A = 0 and G = 0, while extreme concentration approaches 1.' },
        { text: '0 means the Lorenz curve lies along the bottom axis; values near 1 mean it lies on the 45-degree line.', why: 'Lying on the 45-degree line makes A = 0, which gives G = 0 rather than a value near 1.' },
        { text: '0 means complete equality of incomes; values near 1 mean one household receives almost all income.', correct: true, why: 'When all incomes are equal, A = 0 so G = 0; when one household in a large population holds all income, B approaches 0 so G approaches 1.' },
      ],
      explanation: 'The fourth paragraph states that when every household earns the same income, A = 0 and G = 0 (complete equality), whereas in a large population where one household receives all income and others receive zero, B shrinks towards 0 and G approaches 1.',
    },
    {
      type: 'F', level: 1,
      stem: 'According to Figure 1, what percentage of the region\'s total income is received by the highest-earning 20% of households?',
      options: numericOptions(
        { value: top20Share, why: `At 80% of households cumulative income is ${bottom80Cum}%, leaving 100% − ${bottom80Cum}% = ${top20Share}% for the top 20%.` },
        [
          { value: topGroupWidth, why: `${topGroupWidth}% is that group's share of households (from 80% to 100%), or what it would earn under complete equality.` },
          { value: bottom80Cum, why: `${bottom80Cum}% is the cumulative income received by the bottom 80% of households, before subtracting from 100%.` },
          { value: topStartPct, why: `${topStartPct}% is the horizontal coordinate where the top 20% begins, not an income share.` },
        ],
        pct,
      ),
      explanation: `The Lorenz curve passes through (${topStartPct}%, ${bottom80Cum}%), meaning the lowest-earning ${topStartPct}% of households together receive ${bottom80Cum}% of total income. The remaining 20% of households at the top receive the rest: 100% − ${bottom80Cum}% = ${top20Share}%.`,
    },
    {
      type: 'A', level: 2,
      stem: `In Country K, households are ranked from lowest to highest income and split into five equal quintiles of 20% each. Their individual shares of total income are ${kShares.map(pct).join(', ')}. At 60% of households on the horizontal axis, by how many percentage points does Country K's Lorenz curve lie below the line of equality?`,
      options: numericOptions(
        { value: kGap60, why: `The first three quintiles earn ${kShares[0]}% + ${kShares[1]}% + ${kShares[2]}% = ${kCum60}%, which is 60 − ${kCum60} = ${kGap60} percentage points below 60%.` },
        [
          { value: kOnlyThird, why: `This is only the third quintile's own share (${kOnlyThird}%), neither cumulative nor subtracted from 60%.` },
          { value: kCum60, why: `This is the cumulative income share (${kCum60}%) of the bottom 60% of households, before subtracting from the 60% on the line of equality.` },
          { value: kWrongSub, why: `This subtracts only the third quintile's share (${kOnlyThird}%) from 60%, leaving out the first two quintiles.` },
        ],
        pts,
      ),
      explanation: `At 60% of households (the first three quintiles together), the cumulative share of income on the Lorenz curve is ${kShares[0]}% + ${kShares[1]}% + ${kShares[2]}% = ${kCum60}%. On the line of equality, 60% of households corresponds to 60% of income, so the vertical gap between them is 60 − ${kCum60} = ${kGap60} percentage points.`,
    },
    {
      type: 'D', level: 2,
      stem: `Every household in an economy receives an exact ${payRisePct}% rise in income, while the number of households stays the same. What happens to the economy's Lorenz curve and Gini coefficient?`,
      options: [
        { text: 'Neither the Lorenz curve nor the Gini coefficient changes.', correct: true, why: `Multiplying every income by ${fixed(1 + payRisePct / 100, 2)} multiplies total income by the same factor, leaving every household's percentage share unchanged.` },
        { text: `The Lorenz curve shifts closer to the line of equality, and the Gini coefficient falls by ${payRisePct}%.`, why: 'Higher incomes in equal proportion do not narrow the relative ratios between poorer and richer households.' },
        { text: 'The Lorenz curve bows further below the line of equality, because higher earners gain more euros than lower earners.', why: 'Higher earners gain more euros, but total income grows by the same proportion, so every group\'s percentage share of total income stays identical.' },
        { text: `The Lorenz curve stays in place, while the Gini coefficient rises by a factor of ${fixed(1 + payRisePct / 100, 2)}.`, why: 'G is calculated entirely from the areas on the Lorenz diagram; if the curve does not move, G cannot change.' },
      ],
      explanation: `The fifth paragraph states that multiplying every household's income by the same positive factor (${fixed(1 + payRisePct / 100, 2)} for a ${payRisePct}% rise) leaves every group's share of total income unchanged. Consequently, the Lorenz curve stays in exactly the same place and G does not change.`,
    },
    {
      type: 'S', level: 2,
      stem: `Country M has a Gini coefficient of ${fixed(giniM, 2)} and Country N has a Gini coefficient of ${fixed(giniN, 2)}, and their two Lorenz curves do not cross. Which statement must be true?`,
      options: [
        { text: 'Average household income is higher in Country M than in Country N.', why: 'The fifth paragraph notes that neither the Lorenz curve nor G tells how high average income is.' },
        { text: 'The lowest-earning 20% of households receive more money per household in Country M than in Country N.', why: 'A larger percentage share of a much smaller national income can still amount to less money per household.' },
        { text: 'Total national income is larger in Country N than in Country M.', why: 'A higher Gini coefficient reflects greater inequality of shares, not a larger total income.' },
        { text: 'Country M\'s Lorenz curve lies closer to the line of equality than Country N\'s.', correct: true, why: `With non-crossing curves, the lower Gini (${fixed(giniM, 2)} versus ${fixed(giniN, 2)}) means a smaller area A between the curve and the diagonal.` },
      ],
      explanation: `Because G = 2A and the two curves do not cross, Country M's smaller Gini coefficient (${fixed(giniM, 2)} < ${fixed(giniN, 2)}) means its Lorenz curve encloses a smaller area A and lies closer to the line of equality. Nothing follows about which country has higher average or total income.`,
    },
    {
      type: 'T', level: 3,
      stem: 'What is the Gini coefficient G of the income distribution shown by the piecewise-linear Lorenz curve in Figure 1?',
      options: numericOptions(
        { value: giniFig, why: `B = 0.4 × (0 + 0.2) ÷ 2 + 0.4 × (0.2 + 0.6) ÷ 2 + 0.2 × (0.6 + 1.0) ÷ 2 = 0.04 + 0.16 + 0.16 = ${fixed(areaB, 2)}, so G = 1 − 2B = ${fixed(giniFig, 2)}.` },
        [
          { value: giniAsB, why: `This is B (${fixed(areaB, 2)}), the area beneath the Lorenz curve, rather than G = 1 − 2B.` },
          { value: giniFourA, why: `This doubles G (or omits the ÷ 2 in each strip's area): A is ${fixed(areaA, 2)}, so G = 2A = ${fixed(giniFig, 2)}, not 4A.` },
          { value: giniTwoB, why: `This divides B by A + B (giving 2B = ${fixed(giniTwoB, 2)}) instead of dividing A by A + B.` },
        ],
      ),
      explanation: `Write the knot coordinates in Figure 1 as proportions: (0, 0), (0.4, 0.2), (0.8, 0.6) and (1, 1). Using strip area = w × (h₁ + h₂) ÷ 2 across the three strips gives B = 0.4 × 0.1 + 0.4 × 0.4 + 0.2 × 0.8 = 0.04 + 0.16 + 0.16 = ${fixed(areaB, 2)}. Then G = 1 − 2B = 1 − ${fixed(2 * areaB, 2)} = ${fixed(giniFig, 2)} (equivalently, A = 0.5 − ${fixed(areaB, 2)} = ${fixed(areaA, 2)} and G = 2A = ${fixed(giniFig, 2)}).`,
    },
    {
      type: 'C', level: 3,
      stem: `Households in Region U and Region V are each split from lowest to highest income into four equal quarters of 25% each, with straight Lorenz segments between quarter boundaries. In Region U the four quarters receive ${regU.map(pct).join(', ')} of total income; in Region V they receive ${regV.map(pct).join(', ')}. Comparing the two regions, what is true of their Lorenz curves and Gini coefficients?`,
      options: [
        { text: 'Their Lorenz curves do not cross, and Region U has the lower Gini coefficient.', why: `At 25% of households U is higher (${knotsU[1][1]}% > ${knotsV[1][1]}%), whereas at 50% V is higher (${knotsV[2][1]}% > ${knotsU[2][1]}%), so the curves cross.` },
        { text: 'Their Lorenz curves cross, and Region V has the lower Gini coefficient.', why: `Both curves have the same sum of cumulative heights at 25%, 50% and 75% (${knotsU[1][1] + knotsU[2][1] + knotsU[3][1]}%), giving the exact same area B and Gini (${fixed(giniU, 3)}).` },
        { text: 'Their Lorenz curves cross, and the two regions have the exact same Gini coefficient.', correct: true, why: `Cumulative shares are (10%, 25%, 50%, 100%) in U and (6%, 28%, 51%, 100%) in V: U starts higher, V overtakes it, and both give B = 0.3375 and G = ${fixed(giniU, 3)}.` },
        { text: 'Their Lorenz curves coincide everywhere, so the two regions have the exact same Gini coefficient.', why: `At 25% of households U is at ${knotsU[1][1]}% while V is at ${knotsV[1][1]}%, so the curves are different even though their areas match.` },
      ],
      explanation: `Work out the cumulative income shares at 25%, 50%, 75% and 100% of households. Region U: 10%, 25%, 50%, 100%. Region V: 6%, 28%, 51%, 100%. At 25% U lies above V (10% > 6%), while at 50% and 75% V lies above U (28% > 25% and 51% > 50%), so the two Lorenz curves cross. Across four equal strips of width 0.25, each interior height enters two adjacent strips, so B = 0.25 × (h₁ + h₂ + h₃) + 0.125. In U, 0.10 + 0.25 + 0.50 = 0.85; in V, 0.06 + 0.28 + 0.51 = 0.85. Both give B = 0.3375 and G = 1 − 2B = ${fixed(giniU, 3)}.`,
    },
  ],
};

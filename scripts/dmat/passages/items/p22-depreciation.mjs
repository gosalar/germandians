// Full mock 2, passage 5. Area: business administration. Subject: straight-line and declining-balance depreciation.
import { graph, numericOptions, p, whole } from '../lib.mjs';

// ---------- Depreciation schedule builders: every schedule and answer is computed in code ----------
function straightLineBookValues(cost, salvage, life) {
  const annual = (cost - salvage) / life;
  return Array.from({ length: life + 1 }, (_, yr) => cost - annual * yr);
}

function ddbSchedule(cost, salvage, life) {
  const rate = 2 / life;
  const bookValues = [cost];
  const expenses = [];
  let bv = cost;
  for (let yr = 1; yr <= life; yr++) {
    const uncapped = bv * rate;
    const exp = Math.max(0, Math.min(uncapped, bv - salvage));
    bv -= exp;
    expenses.push(exp);
    bookValues.push(bv);
  }
  return { rate, bookValues, expenses };
}

// ---------- Figure 1: machine costing €80,000, residual value €16,000, useful life 4 years ----------
const fig = { cost: 80000, salvage: 16000, life: 4 };
const slBV = straightLineBookValues(fig.cost, fig.salvage, fig.life);
const ddb = ddbSchedule(fig.cost, fig.salvage, fig.life);
const ddbBV = ddb.bookValues;

// Interior book values (Years 1..3) across both curves must all be distinct and hit exact €4,000 grid lines.
const interiorPoints = [...slBV.slice(1, -1), ...ddbBV.slice(1, -1)];
if (new Set(interiorPoints).size !== interiorPoints.length) {
  throw new Error('Figure 1 interior book values across the two curves must all be distinct');
}
if ([...slBV, ...ddbBV].some((v) => v % 4000 !== 0)) {
  throw new Error('every Figure 1 point must sit on an exact €4,000 grid line');
}
if (!(ddb.expenses[2] > 0 && ddb.expenses[2] < ddbBV[2] * ddb.rate && ddb.expenses[3] === 0)) {
  throw new Error('Figure 1 DDB schedule should hit the residual floor in Year 3');
}

// Question 2: Year 2 book-value gap in Figure 1.
const gapYr2 = slBV[2] - ddbBV[2];
const gapYr3 = slBV[3] - ddbBV[3];
if (new Set([gapYr2, gapYr3, ddbBV[2], slBV[2]]).size !== 4) {
  throw new Error('question 2 options must be distinct');
}

// Question 3: bakery oven under straight-line depreciation.
const q3 = { cost: 39000, salvage: 3000, life: 6, year: 4 };
const q3Annual = (q3.cost - q3.salvage) / q3.life;
const q3Accum = q3Annual * q3.year;
const q3BookValue = q3.cost - q3Accum;
const q3FromBase = (q3.cost - q3.salvage) - q3Accum;
const q3OneYearOnly = q3.cost - q3Annual;
if (q3Annual === q3.salvage) throw new Error('avoid annual depreciation equalling salvage value');

// Question 4: forklift Year 2 expense under double-declining-balance.
const q4 = { cost: 45000, salvage: 5000, life: 5 };
const q4Ddb = ddbSchedule(q4.cost, q4.salvage, q4.life);
const q4Yr2Exp = q4Ddb.expenses[1];
const q4Yr2ClosingBV = q4Ddb.bookValues[2];
const q4Yr1Exp = q4Ddb.expenses[0];
const q4TwoYearAccum = q4Ddb.expenses[0] + q4Ddb.expenses[1];

// Question 6: lathe hitting residual-value floor in Year 3 under double-declining-balance.
const q6 = { cost: 36000, salvage: 5200, life: 4 };
const q6Ddb = ddbSchedule(q6.cost, q6.salvage, q6.life);
const q6Yr3Exp = q6Ddb.expenses[2]; // capped at opening BV − salvage
const q6OpenYr3 = q6Ddb.bookValues[2];
const q6UncappedYr3 = q6OpenYr3 * q6Ddb.rate;
const q6HalfAboveFloor = (q6OpenYr3 - q6.salvage) * q6Ddb.rate;
const q6FourthHalving = q6UncappedYr3 * q6Ddb.rate;
if (!(q6Yr3Exp < q6UncappedYr3 && q6Yr3Exp > 0)) {
  throw new Error('question 6 must be capped at the residual floor in Year 3');
}

const euro = (v) => `€${whole(v)}`;

const polyPoints = (ys, px, py) => ys.map((v, yr) => `${px(yr)},${py(v)}`).join(' ');
const dots = (ys, px, py) => ys.map((v, yr) => `<circle class="dot" cx="${px(yr)}" cy="${py(v)}" r="3.5"/>`).join('');

const figure1 = graph({
  id: 'p22-fig1',
  w: 480,
  h: 320,
  left: 74,
  right: 24,
  x: { min: 0, max: fig.life, grid: 1, label: 1, title: 'End of year' },
  y: { min: 0, max: fig.cost, grid: 4000, label: 16000, title: 'Book value in euros', format: whole },
  body: ({ px, py }) => `
  <line class="curve curve-3" x1="${px(0)}" y1="${py(fig.salvage)}" x2="${px(fig.life)}" y2="${py(fig.salvage)}"/>
  <polyline class="curve" points="${polyPoints(slBV, px, py)}"/>
  <polyline class="curve curve-2" points="${polyPoints(ddbBV, px, py)}"/>
  ${dots(slBV, px, py)}
  ${dots(ddbBV, px, py)}
  <text class="label-1" x="${px(2.15)}" y="${py(50000)}">Straight-line</text>
  <text class="label-2" x="${px(0.08)}" y="${py(22000)}">Double-declining</text>
  <text class="label-3" x="${px(0.08)}" y="${py(fig.salvage) + 19}">Residual value</text>`,
});

export default {
  id: 'p22',
  set: 'mock',
  mock: 2,
  area: 'business administration',
  title: 'Depreciation and Book Value',
  facts: [
    { claim: 'Depreciation allocates the cost of a tangible long-term asset over its useful life; residual (salvage) value is its estimated value at the end of its useful life, and depreciable base is cost minus residual value.', source: 'https://openstax.org/books/principles-financial-accounting/pages/11-key-terms', read: '2026-11-18' },
    { claim: 'Book value equals historical cost minus accumulated depreciation, where accumulated depreciation is the total depreciation recorded to date.', source: 'https://openstax.org/books/principles-financial-accounting/pages/11-3-explain-and-apply-depreciation-methods-to-allocate-capitalized-costs', read: '2026-11-18' },
    { claim: 'Straight-line depreciation charges an equal annual expense of (cost − residual value) ÷ useful life in every year of useful life.', source: 'https://openstax.org/books/principles-financial-accounting/pages/11-3-explain-and-apply-depreciation-methods-to-allocate-capitalized-costs', read: '2026-11-18' },
    { claim: 'Double-declining-balance applies rate 2 ÷ useful life to the opening book value of each year (without subtracting residual value first), and stops once book value reaches residual value so an asset is never depreciated below its residual value.', source: 'https://openstax.org/books/principles-financial-accounting/pages/11-3-explain-and-apply-depreciation-methods-to-allocate-capitalized-costs', read: '2026-11-18' },
  ],
  blocks: [
    p(
      'When a firm buys a long-lived asset such as a machine or a delivery van, it does not record the whole purchase cost C as an expense in the year of purchase.',
      'Instead, accounting depreciation spreads that cost across the asset’s useful life of n years, the period over which the firm expects to use it.',
      'Depreciation allocates historical cost across accounting periods; it is not an annual cash payment and does not track day-to-day resale prices.',
    ),
    p(
      'At the end of the n years, the firm expects to sell or scrap the asset for an estimated residual value (also called salvage value), S.',
      'The total cost to be written off over the asset’s life is its depreciable base, C − S.',
      'At any date, accumulated depreciation is the sum of all depreciation expenses recorded for the asset so far, and the asset’s book value (carrying value) is',
    ),
    { type: 'formula', text: 'book value = C − accumulated depreciation' },
    p(
      'Two common methods allocate the same total C − S on different schedules.',
      'The straight-line method records an equal expense in every year of useful life:',
    ),
    { type: 'formula', text: 'annual straight-line expense = (C − S) ÷ n' },
    p(
      'The declining-balance method is an accelerated method: it multiplies the asset’s opening book value at the start of each year by a fixed annual rate r.',
      'In the double-declining-balance version, r = 2 ÷ n, twice the straight-line rate of 1 ÷ n:',
    ),
    { type: 'formula', text: 'year-t expense = r × opening book value of year t (not below book value S)' },
    p(
      'Notice that S is not subtracted before multiplying by r.',
      'Instead, S serves as a floor: book value may never be reduced below S.',
      'In whichever year r × opening book value would push closing book value below S, that year’s expense is capped at opening book value − S, and any remaining years record €0.',
      `Figure 1 compares both methods for a machine with C = ${euro(fig.cost)}, S = ${euro(fig.salvage)} and n = ${fig.life} years.`,
    ),
    {
      type: 'figure',
      id: 'p22-fig1',
      caption: `Figure 1. End-of-year book value of a machine (${euro(fig.cost)} cost, ${euro(fig.salvage)} residual value, ${fig.life}-year useful life).`,
      alt: `Book value in euros from 0 to ${whole(fig.cost)} (grid every €4,000, labelled every €16,000) at the end of years 0 to ${fig.life}. Straight-line falls linearly through ${slBV.map((v, i) => `${euro(v)} at year ${i}`).join(', ')}. Double-declining-balance passes through ${ddbBV.map((v, i) => `${euro(v)} at year ${i}`).join(', ')}. A dashed horizontal line marks residual value at ${euro(fig.salvage)}.`,
      svg: figure1,
    },
  ],
  questions: [
    {
      type: 'R', level: 1,
      stem: 'According to the text, how is the residual value S treated under the declining-balance method?',
      options: [
        { text: 'It is subtracted from the purchase cost C before applying the rate r in Year 1.', why: 'Subtracting S upfront belongs to the straight-line formula; declining-balance multiplies the full opening book value by r.' },
        { text: 'It is not subtracted at the start, and instead acts as a floor below which book value cannot fall.', correct: true, why: 'The last paragraph states that S is not subtracted before multiplying by r, and instead caps depreciation once book value reaches S.' },
        { text: 'It is added to accumulated depreciation in the final year of useful life.', why: 'Total accumulated depreciation over the life equals C − S, leaving S as the closing book value.' },
        { text: 'It is divided by n and subtracted in equal instalments after multiplying by r.', why: 'Declining-balance applies r to opening book value without deducting S ÷ n.' },
      ],
      explanation: 'Under declining-balance, each year’s expense starts from r × opening book value without subtracting S upfront, and S serves as the lower limit below which book value is never reduced.',
    },
    {
      type: 'F', level: 1,
      stem: 'According to Figure 1, by how much does the machine’s book value at the end of Year 2 under the straight-line method exceed its book value at the end of Year 2 under the double-declining-balance method?',
      options: numericOptions(
        { value: gapYr2, why: `At Year 2, straight-line is ${euro(slBV[2])} and double-declining-balance is ${euro(ddbBV[2])}: ${euro(slBV[2])} − ${euro(ddbBV[2])} = ${euro(gapYr2)}.` },
        [
          { value: gapYr3, why: `This is the gap at the end of Year 3 (${euro(slBV[3])} − ${euro(ddbBV[3])}), not Year 2.` },
          { value: ddbBV[2], why: `This is the Year 2 book value on the double-declining-balance curve alone (${euro(ddbBV[2])}), not the difference between the two curves.` },
          { value: slBV[2], why: `This is the Year 2 book value on the straight-line line alone (${euro(slBV[2])}), without subtracting ${euro(ddbBV[2])}.` },
        ],
        euro,
      ),
      explanation: `At the end of Year 2 in Figure 1, the straight-line point sits on the ${euro(slBV[2])} grid line and the double-declining-balance point sits one €4,000 grid step above €16,000 at ${euro(ddbBV[2])}. Their difference is ${euro(slBV[2])} − ${euro(ddbBV[2])} = ${euro(gapYr2)}.`,
    },
    {
      type: 'A', level: 2,
      stem: `A bakery buys an oven for ${euro(q3.cost)} with an estimated useful life of ${q3.life} years and a residual value of ${euro(q3.salvage)}. Using the straight-line method, what is the oven’s book value at the end of Year ${q3.year}?`,
      options: numericOptions(
        { value: q3BookValue, why: `Annual expense is (${euro(q3.cost)} − ${euro(q3.salvage)}) ÷ ${q3.life} = ${euro(q3Annual)}; after ${q3.year} years book value is ${euro(q3.cost)} − ${q3.year} × ${euro(q3Annual)} = ${euro(q3BookValue)}.` },
        [
          { value: q3FromBase, why: `This subtracts ${euro(q3Accum)} from the depreciable base (${euro(q3.cost - q3.salvage)}) instead of from the purchase cost ${euro(q3.cost)}.` },
          { value: q3Accum, why: `This is the accumulated depreciation after ${q3.year} years (${q3.year} × ${euro(q3Annual)}), not the remaining book value.` },
          { value: q3OneYearOnly, why: `This subtracts only one year of depreciation (${euro(q3Annual)}) instead of ${q3.year} years.` },
        ],
        euro,
      ),
      explanation: `Annual straight-line expense = (${whole(q3.cost)} − ${whole(q3.salvage)}) ÷ ${q3.life} = ${euro(q3Annual)}. Over ${q3.year} years accumulated depreciation is ${q3.year} × ${whole(q3Annual)} = ${euro(q3Accum)}, leaving book value = ${euro(q3.cost)} − ${euro(q3Accum)} = ${euro(q3BookValue)}.`,
    },
    {
      type: 'A', level: 2,
      stem: `A warehouse buys a forklift for ${euro(q4.cost)} with an estimated useful life of ${q4.life} years and a residual value of ${euro(q4.salvage)}. Under the double-declining-balance method, what is the depreciation expense for Year 2 alone?`,
      options: numericOptions(
        { value: q4Yr2Exp, why: `Rate r = 2 ÷ ${q4.life} = 40%. Year 1 expense is 40% × ${euro(q4.cost)} = ${euro(q4Yr1Exp)}, leaving ${euro(q4.cost - q4Yr1Exp)}, and 40% × ${euro(q4.cost - q4Yr1Exp)} = ${euro(q4Yr2Exp)}.` },
        [
          { value: q4Yr2ClosingBV, why: `This is the closing book value at the end of Year 2 (${euro(q4.cost - q4Yr1Exp)} − ${euro(q4Yr2Exp)}), not Year 2’s depreciation expense.` },
          { value: q4Yr1Exp, why: `This applies 40% to the original cost ${euro(q4.cost)} a second time instead of to Year 2’s opening book value of ${euro(q4.cost - q4Yr1Exp)}.` },
          { value: q4TwoYearAccum, why: `This sums Year 1 and Year 2 expenses (${euro(q4Yr1Exp)} + ${euro(q4Yr2Exp)}), giving accumulated depreciation rather than Year 2 alone.` },
        ],
        euro,
      ),
      explanation: `With n = ${q4.life} years, the double-declining-balance rate is r = 2 ÷ ${q4.life} = 40%. Year 1 expense is 40% × ${euro(q4.cost)} = ${euro(q4Yr1Exp)}, so Year 2 opens at ${euro(q4.cost - q4Yr1Exp)}. Year 2 expense is 40% × ${euro(q4.cost - q4Yr1Exp)} = ${euro(q4Yr2Exp)}, leaving ${euro(q4Yr2ClosingBV)}, which is well above the ${euro(q4.salvage)} floor.`,
    },
    {
      type: 'D', level: 2,
      stem: 'Before putting a new van into service, a firm raises its estimate of the van’s residual value S (while S remains below half of the purchase cost C) and keeps C and the 5-year useful life unchanged. How does this higher residual value affect the Year 1 depreciation expense under straight-line and under double-declining-balance?',
      options: [
        { text: 'Straight-line Year 1 expense falls; double-declining-balance Year 1 expense stays the same.', correct: true, why: 'Higher S reduces (C − S) ÷ 5, whereas Year 1 double-declining-balance is 40% × C and leaves 60% × C > S, so the floor is not hit.' },
        { text: 'Both Year 1 expenses fall by the same euro amount.', why: 'Double-declining-balance multiplies the full cost C by 40% in Year 1 without subtracting S.' },
        { text: 'Straight-line Year 1 expense rises; double-declining-balance Year 1 expense stays the same.', why: 'Because S is subtracted in (C − S) ÷ 5, raising S lowers the straight-line expense rather than raising it.' },
        { text: 'Both Year 1 expenses stay the same, because residual value affects only the final year.', why: 'Straight-line deducts S before dividing by 5, so a change in S changes every year’s straight-line expense.' },
      ],
      explanation: 'Under straight-line, annual expense is (C − S) ÷ 5, so increasing S decreases Year 1 expense. Under 5-year double-declining-balance (r = 40%), Year 1 expense is 40% × C, leaving a book value of 60% × C; since S < 50% × C, the floor does not bind in Year 1 and Year 1 expense is unchanged.',
    },
    {
      type: 'T', level: 3,
      stem: `A workshop buys a lathe for ${euro(q6.cost)} with an estimated useful life of ${q6.life} years and a residual value of ${euro(q6.salvage)}. Under the double-declining-balance method, what is the depreciation expense recorded in Year 3?`,
      options: numericOptions(
        { value: q6Yr3Exp, why: `Book value goes ${euro(q6.cost)} → ${euro(q6Ddb.bookValues[1])} → ${euro(q6OpenYr3)}. Since 50% × ${euro(q6OpenYr3)} = ${euro(q6UncappedYr3)} would breach the ${euro(q6.salvage)} floor, Year 3 is capped at ${euro(q6OpenYr3)} − ${euro(q6.salvage)} = ${euro(q6Yr3Exp)}.` },
        [
          { value: q6HalfAboveFloor, why: `This takes 50% of (${euro(q6OpenYr3)} − ${euro(q6.salvage)}) instead of depreciating down to the ${euro(q6.salvage)} floor.` },
          { value: q6FourthHalving, why: `This halves one time too many (${euro(q6UncappedYr3)} × 50%), and also ignores the ${euro(q6.salvage)} residual-value floor.` },
          { value: q6UncappedYr3, why: `This computes 50% × ${euro(q6OpenYr3)} = ${euro(q6UncappedYr3)}, which would reduce book value to ${euro(q6OpenYr3 - q6UncappedYr3)}, below the ${euro(q6.salvage)} floor.` },
        ],
        euro,
      ),
      explanation: `With n = ${q6.life}, r = 2 ÷ ${q6.life} = 50%. Year 1 reduces book value from ${euro(q6.cost)} to ${euro(q6Ddb.bookValues[1])}; Year 2 reduces it by 50% to ${euro(q6OpenYr3)}. In Year 3, 50% × ${euro(q6OpenYr3)} = ${euro(q6UncappedYr3)} would leave ${euro(q6OpenYr3 - q6UncappedYr3)}, below S = ${euro(q6.salvage)}, so Year 3 expense is capped at ${euro(q6OpenYr3)} − ${euro(q6.salvage)} = ${euro(q6Yr3Exp)}.`,
    },
    {
      type: 'S', level: 3,
      stem: 'An asset with purchase cost C, residual value S (where 0 < S < C) and useful life n (at least 3 years) is depreciated down to book value S by the end of Year n (under double-declining-balance, the final year’s expense is whatever brings book value down to S). Comparing straight-line and double-declining-balance across all n years, which statement is always true?',
      options: [
        { text: 'Double-declining-balance records a larger total depreciation than straight-line, and is higher in Year 1.', why: 'Both methods start at C and finish at book value S, so total depreciation across all n years equals C − S under both.' },
        { text: 'Both methods record the same total depreciation C − S, with double-declining-balance higher in every year.', why: 'Since both sum to C − S over n years and double-declining-balance is higher in Year 1, it must be lower in at least one later year.' },
        { text: 'Double-declining-balance gives a higher book value at the end of Year 1, and reaches S by Year n.', why: 'Larger Year 1 depreciation means lower, not higher, closing book value at the end of Year 1, as Figure 1 illustrates.' },
        { text: 'Both methods record the same total depreciation C − S, with double-declining-balance higher in Year 1 and lower in at least one later year.', correct: true, why: 'Both reduce book value from C to S (total C − S); in Year 1, (2 ÷ n) × C (capped at C − S if needed) exceeds (C − S) ÷ n since n ≥ 3, forcing at least one later year to be lower.' },
      ],
      explanation: 'Because both schedules start at book value C and end at book value S, their total depreciation over the n years is identical: C − S. In Year 1, (2 ÷ n) × C > C ÷ n > (C − S) ÷ n (and C − S > (C − S) ÷ n for n ≥ 3 even if the floor binds in Year 1), so double-declining-balance is always larger in Year 1 and therefore smaller in at least one later year.',
    },
  ],
};

// Full mock, passage 5. Area: business administration. Subject: break-even analysis.
import { graph, numericOptions, p, whole } from '../lib.mjs';

// ---------- the firm in Figure 1 ----------
const fixedCosts = 6000; // euros per month
const price = 25;
const variable = 10;
const margin = price - variable;
const breakEven = fixedCosts / margin;
const revenue = (q, pr = price) => pr * q;
const totalCost = (q, f = fixedCosts, v = variable) => f + v * q;
const profit = (q, pr = price, f = fixedCosts, v = variable) => (pr - v) * q - f;
if (!Number.isInteger(breakEven)) throw new Error('the break-even point must be a whole number of units');
const maxUnits = 1000;

// Question 3: misreadings of the graph.
const revenueMeetsFixed = fixedCosts / price; // where the revenue line crosses the fixed-cost line
const fixedOverVariable = fixedCosts / variable;
if ([revenueMeetsFixed, fixedOverVariable].includes(breakEven)) throw new Error('question 3: wrong readings must differ from the answer');

// Question 4: profit at a given output.
const q4 = 700;

// Question 5: the rent rises, at another firm with its own numbers, so the options say nothing about Figure 1.
const f5 = { fixed: 9000, price: 50, variable: 30, rise: 1200 };
const m5 = f5.price - f5.variable;
const be5 = f5.fixed / m5;
const be5After = (f5.fixed + f5.rise) / m5;
if (be5 === breakEven || m5 === margin) throw new Error('question 5 must not share numbers with Figure 1');

// Question 6: a lower price and a target profit (not the profit of question 4, which would hand it over).
const newPrice = 20;
const target = 3000;
const unitsForTarget = (fixedCosts + target) / (newPrice - variable);
if (target === profit(q4)) throw new Error('question 6 must not state the answer to question 4');

// Question 7: doubling the price does not halve the break-even point.
const breakEvenDoubled = fixedCosts / (2 * price - variable);
if (breakEvenDoubled === breakEven / 2) throw new Error('question 7 needs the counter-example to work');

const euro = (v) => `€${whole(v)}`;
const units = (v) => `${whole(v)} units`;

const figure1 = graph({
  id: 'p05-fig1',
  w: 480,
  left: 76,
  x: { min: 0, max: maxUnits, grid: 100, label: 200, title: 'Units sold per month', format: whole },
  y: { min: 0, max: 25000, grid: 2500, label: 5000, title: 'Euros per month', format: (v) => whole(v) },
  body: ({ px, py }) => `
  <line class="curve curve-3" x1="${px(0)}" y1="${py(fixedCosts)}" x2="${px(maxUnits)}" y2="${py(fixedCosts)}"/>
  <line class="curve curve-2" x1="${px(0)}" y1="${py(totalCost(0))}" x2="${px(maxUnits)}" y2="${py(totalCost(maxUnits))}"/>
  <line class="curve" x1="${px(0)}" y1="${py(0)}" x2="${px(maxUnits)}" y2="${py(revenue(maxUnits))}"/>
  <text class="label-1" x="${px(560)}" y="${py(revenue(640))}" text-anchor="end">Revenue</text>
  <text class="label-2" x="${px(maxUnits)}" y="${py(totalCost(maxUnits)) - 12}" text-anchor="end">Total cost</text>
  <text class="label-3" x="${px(maxUnits)}" y="${py(fixedCosts) + 22}" text-anchor="end">Fixed costs</text>`,
});

export default {
  id: 'p05',
  set: 'mock',
  area: 'business administration',
  title: 'Break-Even Analysis',
  facts: [
    { claim: 'Fixed costs stay constant in total within the relevant range of output; examples are rent and insurance.', source: 'https://openstax.org/books/principles-managerial-accounting/pages/2-2-identify-and-apply-basic-cost-behavior-patterns', read: '2026-11-16' },
    { claim: 'Variable costs change in total in direct proportion to activity and stay the same per unit; raw materials are an example.', source: 'https://openstax.org/books/principles-managerial-accounting/pages/2-2-identify-and-apply-basic-cost-behavior-patterns', read: '2026-11-16' },
    { claim: 'Total cost = fixed cost + variable cost per unit × units (Y = a + bx).', source: 'https://openstax.org/books/principles-managerial-accounting/pages/2-3-estimate-a-variable-and-fixed-cost-equation-and-predict-future-costs', read: '2026-11-16' },
    { claim: 'Contribution margin per unit = selling price per unit − variable cost per unit; it first covers fixed costs and what remains is profit.', source: 'https://openstax.org/books/principles-managerial-accounting/pages/3-1-explain-contribution-margin-and-calculate-contribution-margin-per-unit-contribution-margin-ratio-and-total-contribution-margin', read: '2026-11-16' },
    { claim: 'At the break-even point total revenue equals total cost, so profit is zero; break-even units = fixed costs ÷ contribution margin per unit.', source: 'https://openstax.org/books/principles-managerial-accounting/pages/3-2-calculate-a-break-even-point-in-units-and-dollars', read: '2026-11-16' },
    { claim: 'Units needed for a target (pre-tax) profit = (fixed costs + target profit) ÷ contribution margin per unit.', source: 'https://openstax.org/books/principles-managerial-accounting/pages/3-2-calculate-a-break-even-point-in-units-and-dollars', read: '2026-11-16' },
  ],
  blocks: [
    p(
      'Before a firm launches a product, it wants to know how many units it must sell to avoid a loss.',
      'Break-even analysis answers this by sorting the costs into two kinds.',
    ),
    p(
      'Fixed costs stay the same in total however many units are made, at least within the range of output the firm plans for.',
      'Rent and insurance are examples.',
      'Variable costs rise in proportion to output: for example, each unit needs the same amount of material, so the variable cost per unit stays the same.',
      'With F for the fixed costs, v for the variable cost per unit and q for the number of units, the total cost is',
    ),
    { type: 'formula', text: 'total cost = F + v × q' },
    p(
      'If each unit sells at the price p, revenue is p × q.',
      'The difference p − v is called the contribution margin per unit.',
      'Each unit sold contributes this amount, first towards covering the fixed costs and, once they are covered, towards profit:',
    ),
    { type: 'formula', text: 'profit = (p − v) × q − F' },
    p(
      'The break-even point is the number of units at which revenue equals total cost, so that profit is zero.',
      'Setting the profit to zero gives',
    ),
    { type: 'formula', text: 'break-even quantity = F ÷ (p − v)' },
    p(
      'Below this quantity the firm makes a loss; every unit beyond it adds the contribution margin to profit.',
      'The same reasoning tells the firm how many units it needs for a profit it aims at: the contribution margins must then cover the fixed costs and that profit together.',
    ),
    p(
      'Figure 1 shows the monthly figures for one product.',
      'The revenue line starts at zero.',
      'The total cost line starts at the fixed costs, because they arise even if nothing is sold, and climbs more gently than the revenue line.',
      'The break-even point is where the two lines cross; to its right the gap between them is the profit.',
      'The analysis assumes that every unit made is sold and that the price and the variable cost per unit do not change with the number sold.',
    ),
    {
      type: 'figure',
      id: 'p05-fig1',
      caption: 'Figure 1. Revenue and costs of one product per month.',
      alt: `Three straight lines, euros per month against units sold per month from 0 to ${whole(maxUnits)}. Fixed costs: a horizontal line at ${euro(fixedCosts)}. Total cost: from ${euro(totalCost(0))} at 0 units to ${euro(totalCost(maxUnits))} at ${whole(maxUnits)} units. Revenue: from €0 at 0 units to ${euro(revenue(maxUnits))} at ${whole(maxUnits)} units. Revenue and total cost cross at ${whole(breakEven)} units and ${euro(revenue(breakEven))}. The grid has a line every 100 units and every €2,500.`,
      svg: figure1,
    },
  ],
  questions: [
    {
      type: 'C', level: 1,
      stem: 'A bakery sells bread. Which of its costs is a variable cost?',
      options: [
        { text: 'The rent for the shop, paid every month.', why: 'The rent is the same whether the bakery sells many loaves or few: a fixed cost.' },
        { text: 'The insurance for the building, paid once a year.', why: 'The premium does not depend on the number of loaves: a fixed cost.' },
        { text: 'The lease for the oven, paid every month.', why: 'The lease is owed whether or not the oven is used: a fixed cost.' },
        { text: 'The flour, of which every loaf needs the same amount.', correct: true, why: 'Twice as many loaves need twice as much flour, so this cost rises in proportion to output.' },
      ],
      explanation: 'A variable cost rises in proportion to the number of units made. Only the flour does: every loaf needs the same amount. Rent, insurance and the oven lease stay the same however many loaves are sold, so they are fixed costs.',
    },
    {
      type: 'R', level: 1,
      stem: 'According to the text, what is the contribution margin per unit?',
      options: [
        { text: 'The price minus the total cost per unit.', why: 'The total cost per unit includes a share of the fixed costs. The contribution margin subtracts only the variable cost.' },
        { text: 'The revenue minus the fixed costs.', why: 'This leaves the variable costs in and is not a figure per unit.' },
        { text: 'The price minus the variable cost per unit.', correct: true, why: 'This is p − v, as the third paragraph defines it.' },
        { text: 'The fixed costs divided by the number of units.', why: 'This is the fixed cost per unit, which changes with the number of units.' },
      ],
      explanation: 'The third paragraph defines the contribution margin per unit as p − v: the price minus the variable cost per unit. Each unit sold contributes this amount towards the fixed costs and then towards profit.',
    },
    {
      type: 'F', level: 1,
      stem: 'According to Figure 1, how many units must the firm sell per month to break even?',
      options: numericOptions(
        { value: breakEven, why: `The revenue line crosses the total cost line at ${whole(breakEven)} units, where both are ${euro(revenue(breakEven))}.` },
        [
          { value: revenueMeetsFixed, why: `Here the revenue line crosses the fixed-cost line. Revenue then covers the fixed costs but not the variable costs, so the firm still makes a loss.` },
          { value: fixedOverVariable, why: `At ${whole(fixedOverVariable)} units revenue is ${euro(revenue(fixedOverVariable))} and total cost ${euro(totalCost(fixedOverVariable))}, so the firm is already making a profit.` },
          { value: revenue(breakEven), why: `${whole(revenue(breakEven))} is the height of the crossing point in euros, not a number of units.` },
        ],
        units,
      ),
      explanation: `The break-even point is where the revenue line and the total cost line cross: at ${whole(breakEven)} units, with ${euro(revenue(breakEven))} on both. The formula agrees: ${whole(fixedCosts)} ÷ (${price} − ${variable}) = ${whole(breakEven)}.`,
    },
    {
      type: 'A', level: 2,
      stem: `What profit does the firm in Figure 1 make in a month in which it sells ${whole(q4)} units?`,
      options: numericOptions(
        { value: profit(q4), why: `(${price} − ${variable}) × ${whole(q4)} − ${whole(fixedCosts)}.` },
        [
          { value: (q4 - breakEven) * variable, why: `This multiplies the ${whole(q4 - breakEven)} units beyond the break-even point by the variable cost. Each of them adds the contribution margin, ${euro(margin)}.` },
          { value: (q4 - breakEven) * price, why: `This multiplies the ${whole(q4 - breakEven)} units beyond the break-even point by the price. Each of them adds only the contribution margin, ${euro(margin)}.` },
          { value: margin * q4, why: 'This is the total contribution margin. The fixed costs still have to be subtracted.' },
        ],
        euro,
      ),
      explanation: `Profit = (p − v) × q − F = ${margin} × ${whole(q4)} − ${whole(fixedCosts)} = ${whole(margin * q4)} − ${whole(fixedCosts)} = ${euro(profit(q4))}. Check: revenue ${euro(revenue(q4))} minus total cost ${euro(totalCost(q4))}.`,
    },
    {
      type: 'D', level: 2,
      stem: `Another firm sells a product at ${euro(f5.price)} with a variable cost of ${euro(f5.variable)} per unit and fixed costs of ${euro(f5.fixed)} a month. Its rent rises by ${euro(f5.rise)} a month; price and variable cost per unit stay the same. What happens to its break-even quantity?`,
      options: [
        { text: `It rises by ${whole(f5.rise / m5)} units.`, correct: true, why: `${whole(f5.rise)} ÷ ${m5} more units are needed to cover the extra rent.` },
        { text: `It rises by ${whole(f5.rise / f5.price)} units.`, why: `This divides ${euro(f5.rise)} by the price. Each extra unit covers only its contribution margin, ${euro(m5)}, of the extra rent.` },
        { text: `It rises by ${whole(f5.rise / f5.variable)} units.`, why: `This divides by the variable cost per unit. The extra rent is covered by the contribution margin, ${euro(m5)} per unit.` },
        { text: 'It stays the same.', why: 'Rent is a fixed cost, and the break-even quantity is F ÷ (p − v), so it rises with the fixed costs.' },
      ],
      explanation: `Rent is a fixed cost. The fixed costs rise from ${euro(f5.fixed)} to ${euro(f5.fixed + f5.rise)}, so the break-even quantity rises from ${whole(f5.fixed)} ÷ ${m5} = ${whole(be5)} to ${whole(f5.fixed + f5.rise)} ÷ ${m5} = ${whole(be5After)} units: ${whole(be5After - be5)} more.`,
    },
    {
      type: 'T', level: 3,
      stem: `The firm in Figure 1 cuts its price to ${euro(newPrice)} per unit. Fixed costs and variable cost per unit stay the same. How many units must it now sell per month to make a profit of ${euro(target)}?`,
      options: numericOptions(
        { value: unitsForTarget, why: `(${whole(fixedCosts)} + ${whole(target)}) ÷ (${newPrice} − ${variable}).` },
        [
          { value: target / (newPrice - variable), why: `This covers the target profit but forgets the fixed costs of ${euro(fixedCosts)}.` },
          { value: (fixedCosts + target) / newPrice, why: `This divides by the new price. Each unit contributes only the price minus the variable cost, ${euro(newPrice - variable)}.` },
          { value: fixedCosts / (newPrice - variable), why: 'This is the new break-even quantity, where profit is zero.' },
        ],
        units,
      ),
      explanation: `At the new price the contribution margin is ${newPrice} − ${variable} = ${euro(newPrice - variable)} per unit. The contributions must cover the fixed costs and the profit together: (${whole(fixedCosts)} + ${whole(target)}) ÷ ${newPrice - variable} = ${whole(unitsForTarget)} units.`,
    },
    {
      type: 'S', level: 2,
      stem: 'For a product whose price is above its variable cost per unit, which statement is always true in the model of the text?',
      options: [
        { text: 'Each unit sold beyond the break-even point raises profit by the contribution margin per unit.', correct: true, why: 'Profit = (p − v) × q − F, so each extra unit adds p − v.' },
        { text: 'At the break-even point, revenue equals the fixed costs.', why: 'At the break-even point revenue equals total cost, which includes the variable costs; the two are the same only if the variable cost is zero.' },
        { text: 'Doubling the price halves the break-even quantity.', why: `The contribution margin more than doubles, because v stays the same. In Figure 1, a price of ${euro(2 * price)} gives a break-even quantity of ${whole(breakEvenDoubled)}, not ${whole(breakEven / 2)}.` },
        { text: 'A higher variable cost per unit lowers the break-even quantity.', why: 'A higher v makes p − v smaller, so more units are needed: the break-even quantity rises.' },
      ],
      explanation: 'In the formula profit = (p − v) × q − F, each extra unit adds p − v. Beyond the break-even point the fixed costs are already covered, so this addition is profit.',
    },
  ],
};

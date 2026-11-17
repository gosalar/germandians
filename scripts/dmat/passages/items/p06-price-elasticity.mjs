// Full mock, passage 6. Area: economics. Subject: price elasticity of demand (midpoint method).
import { fixed, numericOptions, p, signed, whole } from '../lib.mjs';

// ---------- Table 1: a cinema's ticket sales at four prices ----------
const prices = [6, 10, 14, 18];
const tickets = [1100, 900, 600, 200];
const tableNumbers = [...prices, ...tickets];
if (new Set(tableNumbers).size !== tableNumbers.length) throw new Error('every number in Table 1 must be different');
const revenues = prices.map((pr, i) => pr * tickets[i]);
if (new Set(revenues).size !== revenues.length) throw new Error('the revenues must differ, or question 3 has two answers');

const midpointChange = (from, to) => (to - from) / ((from + to) / 2);
const simpleChange = (from, to) => (to - from) / from;
const elasticity = (i, j) => midpointChange(tickets[i], tickets[j]) / midpointChange(prices[i], prices[j]);

// The revenue rule must hold between every pair of neighbouring rows (it does exactly with the midpoint method).
for (let i = 0; i + 1 < prices.length; i++) {
  const e = Math.abs(elasticity(i, i + 1));
  const up = revenues[i + 1] > revenues[i];
  if (e === 1 || up !== e < 1) throw new Error(`rows ${i} and ${i + 1} break the revenue rule`);
}

// Question 2: from €10 to €14.
const [i2, j2] = [1, 2];
const e2 = elasticity(i2, j2);
const e2upsideDown = midpointChange(prices[i2], prices[j2]) / midpointChange(tickets[i2], tickets[j2]);
const e2simple = simpleChange(tickets[i2], tickets[j2]) / simpleChange(prices[i2], prices[j2]);
const e2units = (tickets[j2] - tickets[i2]) / (prices[j2] - prices[i2]);
const e2mixed = midpointChange(tickets[i2], tickets[j2]) / simpleChange(prices[i2], prices[j2]);
if (Math.abs(e2upsideDown - e2simple) > 1e-9) throw new Error('question 2: one wrong option is meant to cover both slips');

// Question 3: the price with the highest revenue.
const best = revenues.indexOf(Math.max(...revenues));

// Question 6: a museum. Elasticity and the price change are given; find the new quantity.
const m = { p1: 9, p2: 11, q1: 1150, e: -1.5 };
const priceChange6 = midpointChange(m.p1, m.p2);
const qChange6 = m.e * priceChange6; // midpoint share
const q2 = (m.q1 * (1 + qChange6 / 2)) / (1 - qChange6 / 2);
if (!Number.isInteger(Math.round(q2 * 1e6) / 1e6)) throw new Error('question 6 needs a whole number of tickets');
const q2fromStart = m.q1 * (1 + qChange6);
const q2samePercent = m.q1 * (1 - priceChange6);
const q2sameRevenue = (m.p1 * m.q1) / m.p2;
if (Math.abs(midpointChange(m.q1, q2) / priceChange6 - m.e) > 1e-9) throw new Error('question 6: the answer does not give the stated elasticity');

const euro = (v) => `€${v}`;
const demo = [20, 25]; // the example of why the base matters, kept apart from the table
const pct = (x) => `${Math.round(Math.abs(x) * 1000) / 10}%`;

export default {
  id: 'p06',
  set: 'mock',
  area: 'economics',
  title: 'Price Elasticity of Demand',
  facts: [
    { claim: 'Price elasticity of demand = percentage change in quantity demanded ÷ percentage change in price.', source: 'https://openstax.org/books/principles-economics-3e/pages/5-1-price-elasticity-of-demand-and-price-elasticity-of-supply', read: '2026-11-16' },
    { claim: 'Midpoint method: percentage change = (new − old) ÷ ((new + old) ÷ 2) × 100; it gives the same elasticity whether the price rises or falls.', source: 'https://openstax.org/books/principles-economics-3e/pages/5-1-price-elasticity-of-demand-and-price-elasticity-of-supply', read: '2026-11-16' },
    { claim: 'Demand is elastic if the absolute value of the elasticity is greater than 1, inelastic if less than 1, unit elastic if equal to 1.', source: 'https://openstax.org/books/principles-economics-3e/pages/5-1-price-elasticity-of-demand-and-price-elasticity-of-supply', read: '2026-11-16' },
    { claim: 'Elasticity of demand is ordinarily negative, because price and quantity demanded move in opposite directions; it is often reported as an absolute value.', source: 'https://en.wikipedia.org/wiki/Price_elasticity_of_demand', read: '2026-11-16' },
    { claim: 'If demand is elastic, a price rise lowers total revenue; if inelastic, a price rise raises total revenue; if unit elastic, total revenue does not change.', source: 'https://openstax.org/books/principles-economics-3e/pages/5-3-elasticity-and-pricing', read: '2026-11-16' },
    { claim: 'Demand is more elastic when close substitutes exist, less elastic for necessities, and more elastic over a longer time.', source: 'https://en.wikipedia.org/wiki/Price_elasticity_of_demand', read: '2026-11-16' },
  ],
  blocks: [
    p(
      'When the price of a good rises, people usually buy less of it.',
      'How much less is measured by the price elasticity of demand: the percentage change in the quantity demanded divided by the percentage change in the price.',
    ),
    { type: 'formula', text: 'elasticity = % change in quantity ÷ % change in price' },
    p(
      'A percentage change depends on the value it is measured from.',
      `A rise from ${demo[0]} to ${demo[1]} is ${pct(simpleChange(demo[0], demo[1]))} of ${demo[0]}, but a fall from ${demo[1]} to ${demo[0]} is only ${pct(simpleChange(demo[1], demo[0]))} of ${demo[1]}.`,
      'To get the same answer in both directions, this passage uses the midpoint method, which measures every change against the average of the old and the new value:',
    ),
    { type: 'formula', text: '% change = (new − old) ÷ ((new + old) ÷ 2) × 100' },
    p(
      'Because price and quantity normally move in opposite directions, the elasticity of demand is normally negative.',
      'What matters for most purposes is its size, ignoring the sign.',
      'Demand is called elastic if that size is greater than 1: the quantity changes by a larger percentage than the price.',
      'It is inelastic if the size is less than 1, and unit elastic if it is exactly 1.',
    ),
    p(
      'Elasticity tells a seller what a price change does to revenue, the price times the quantity sold.',
      'If demand is elastic, a price rise lowers revenue, because the lost sales outweigh the higher price.',
      'If demand is inelastic, a price rise raises revenue.',
      'If demand is unit elastic, revenue stays the same.',
      'With the midpoint method these rules hold exactly.',
    ),
    p(
      'Several things make demand more elastic.',
      'An important one is the number of close substitutes: if buyers can easily switch to something similar, they react strongly to a price rise.',
      'Demand for necessities, which people keep buying even when the price rises, tends to be inelastic.',
      'Time matters too: buyers react more to a price change over months than over days, because they have longer to find alternatives.',
    ),
    p('Table 1 shows how many tickets a small cinema sold per week at four different prices.'),
    {
      type: 'table',
      caption: 'Table 1. Ticket price and tickets sold per week at one cinema.',
      head: ['Price per ticket', 'Tickets sold per week'],
      rows: prices.map((pr, i) => [euro(pr), whole(tickets[i])]),
    },
  ],
  questions: [
    {
      type: 'R', level: 1,
      stem: 'According to the text, when is demand called elastic?',
      options: [
        { text: 'When the quantity demanded falls as the price rises.', why: 'That is true of almost all demand, elastic or not. The text uses the size of the elasticity to tell them apart.' },
        { text: 'When revenue rises after a price rise.', why: 'That happens when demand is inelastic.' },
        { text: 'When the elasticity, ignoring its sign, is less than 1.', why: 'That is the definition of inelastic demand.' },
        { text: 'When the elasticity, ignoring its sign, is greater than 1.', correct: true, why: 'Then the quantity changes by a larger percentage than the price, as the third paragraph says.' },
      ],
      explanation: 'The third paragraph defines elastic demand: the elasticity, ignoring its sign, is greater than 1, so the quantity changes by a larger percentage than the price.',
    },
    {
      type: 'A', level: 2,
      stem: `Using the midpoint method, what is the price elasticity of demand in Table 1 when the price rises from ${euro(prices[i2])} to ${euro(prices[j2])}?`,
      options: numericOptions(
        { value: e2, why: `Quantity: −${whole(tickets[i2] - tickets[j2])} ÷ ${whole((tickets[i2] + tickets[j2]) / 2)} = −${pct(midpointChange(tickets[i2], tickets[j2]))}. Price: ${prices[j2] - prices[i2]} ÷ ${(prices[i2] + prices[j2]) / 2} = ${pct(midpointChange(prices[i2], prices[j2]))}. Then −${pct(midpointChange(tickets[i2], tickets[j2]))} ÷ ${pct(midpointChange(prices[i2], prices[j2]))} = ${signed(e2)}.` },
        [
          { value: e2units, why: `This divides the change in tickets, −${whole(tickets[i2] - tickets[j2])}, by the change in price, ${prices[j2] - prices[i2]}. Elasticity compares percentage changes.` },
          { value: e2mixed, why: `This measures the quantity change against the average but the price change against the old price, ${euro(prices[i2])}. The midpoint method uses the average for both.` },
          { value: e2upsideDown, why: `This divides the price change by the quantity change, the formula upside down: ${pct(midpointChange(prices[i2], prices[j2]))} ÷ −${pct(midpointChange(tickets[i2], tickets[j2]))}. Measuring both changes from the old values instead, −${pct(simpleChange(tickets[i2], tickets[j2]))} ÷ ${pct(simpleChange(prices[i2], prices[j2]))}, happens to give the same wrong number.` },
        ],
        (v) => signed(v),
      ),
      explanation: `Quantity: from ${whole(tickets[i2])} to ${whole(tickets[j2])}, a change of −${whole(tickets[i2] - tickets[j2])} against an average of ${whole((tickets[i2] + tickets[j2]) / 2)}, which is −${pct(midpointChange(tickets[i2], tickets[j2]))}. Price: from ${euro(prices[i2])} to ${euro(prices[j2])}, a change of ${prices[j2] - prices[i2]} against an average of ${(prices[i2] + prices[j2]) / 2}, which is +${pct(midpointChange(prices[i2], prices[j2]))}. Elasticity = −${pct(midpointChange(tickets[i2], tickets[j2]))} ÷ ${pct(midpointChange(prices[i2], prices[j2]))} = ${signed(e2)}.`,
    },
    {
      type: 'F', level: 2,
      stem: 'At which price in Table 1 does the cinema take the most money from tickets per week?',
      options: prices.map((pr, i) => ({
        text: euro(pr),
        ...(i === best ? { correct: true } : {}),
        why: i === best
          ? `${euro(pr)} × ${whole(tickets[i])} = €${whole(revenues[i])}, the largest of the four.`
          : `${euro(pr)} × ${whole(tickets[i])} = €${whole(revenues[i])}, less than the €${whole(revenues[best])} at ${euro(prices[best])}.`,
      })),
      explanation: `Revenue is price times tickets sold: ${prices.map((pr, i) => `${euro(pr)} gives €${whole(revenues[i])}`).join(', ')}. The most is at ${euro(prices[best])}. Neither the lowest price, with the most tickets, nor the highest price brings in the most.`,
    },
    {
      type: 'D', level: 1,
      stem: 'A railway company finds that demand for its tickets is inelastic at its current fares. It raises its fares a little. What happens to its revenue from tickets?',
      options: [
        { text: 'It rises.', correct: true, why: 'With inelastic demand the higher price outweighs the smaller number of tickets sold.' },
        { text: 'It falls, because fewer tickets are sold.', why: 'Fewer tickets are sold, but with inelastic demand the quantity falls by a smaller percentage than the price rises.' },
        { text: 'It stays the same.', why: 'Revenue stays the same only when demand is unit elastic.' },
        { text: 'It cannot be said without knowing the company\'s costs.', why: 'Revenue is price times quantity; costs do not enter it. The elasticity alone settles the direction.' },
      ],
      explanation: 'The fourth paragraph: if demand is inelastic, a price rise raises revenue. Measured by the midpoint method, the quantity falls by a smaller percentage than the price rises, so price times quantity goes up.',
    },
    {
      type: 'C', level: 2,
      stem: 'Following the text, for which of these is demand likely to be the most elastic?',
      options: [
        { text: 'Tap water for a household over the next week.', why: 'A necessity with no easy substitute, over a short time: demand is likely to be inelastic.' },
        { text: 'A medicine that a patient needs and that has no substitute.', why: 'A necessity without substitutes: demand is likely to be inelastic.' },
        { text: 'Electricity for a home over the next week.', why: 'Over a week a household can hardly change its appliances or supplier, and it needs electricity: demand is likely to be inelastic.' },
        { text: 'One brand of bottled water in a supermarket that sells several brands.', correct: true, why: 'Other brands are close substitutes on the same shelf, so buyers switch easily when this one becomes dearer.' },
      ],
      explanation: 'The fifth paragraph names close substitutes as a cause of elastic demand. One brand of bottled water has several close substitutes on the same shelf. The other three are necessities without easy substitutes, and for tap water and electricity the time to find alternatives is also short.',
    },
    {
      type: 'T', level: 3,
      stem: `A museum raises its entry price from ${euro(m.p1)} to ${euro(m.p2)}. At ${euro(m.p1)} it sold ${whole(m.q1)} tickets a week. Over this range its price elasticity of demand, by the midpoint method, is ${signed(m.e, 1)}. How many tickets a week does it sell at ${euro(m.p2)}?`,
      options: numericOptions(
        { value: q2, why: `From ${whole(m.q1)} to ${whole(q2)} is a fall of ${whole(m.q1 - q2)} against an average of ${whole((m.q1 + q2) / 2)}: ${pct(qChange6)}, which is ${Math.abs(m.e)} × ${pct(priceChange6)}.` },
        [
          { value: q2fromStart, why: `This takes ${pct(qChange6)} off the old quantity, ${whole(m.q1)}. In the midpoint method the percentage is of the average of the old and new quantities.` },
          { value: q2samePercent, why: `This lets the quantity fall by the same ${pct(priceChange6)} as the price rose, which ignores the elasticity of ${signed(m.e, 1)}.` },
          { value: q2sameRevenue, why: 'This keeps revenue the same, which would need an elasticity of −1.' },
        ],
        whole,
      ),
      explanation: `Price: a change of ${m.p2 - m.p1} against an average of ${(m.p1 + m.p2) / 2} is ${pct(priceChange6)}. With an elasticity of ${signed(m.e, 1)} the quantity changes by ${signed(m.e, 1)} × ${pct(priceChange6)} = −${pct(qChange6)} of the average quantity. The quickest route is to test the options: for ${whole(q2)}, the fall is ${whole(m.q1 - q2)} against an average of ${whole((m.q1 + q2) / 2)}, which is ${pct(qChange6)}. The algebra gives the same. Call the new quantity x:(x − ${whole(m.q1)}) ÷ ((x + ${whole(m.q1)}) ÷ 2) = −${fixed(-qChange6, 2)}, so x − ${whole(m.q1)} = −${fixed(-qChange6 / 2, 2)} × (x + ${whole(m.q1)}). That gives ${fixed(1 - qChange6 / 2, 2)} × x = ${fixed(1 + qChange6 / 2, 2)} × ${whole(m.q1)}, so x = ${whole(q2)}.`,
    },
    {
      type: 'S', level: 2,
      stem: 'A seller raises the price of a good while nothing else changes, and the revenue from it falls. Which statement must be true about demand over this price range, measured by the midpoint method?',
      options: [
        { text: 'The elasticity lies between 0 and −1.', why: 'That is inelastic demand, under which a price rise would raise revenue.' },
        { text: 'The quantity fell by a smaller percentage than the price rose.', why: 'With midpoint percentages, price times quantity would then have risen. Revenue fell, so the quantity fell by the larger percentage.' },
        { text: 'Demand is elastic.', correct: true, why: 'Only elastic demand makes revenue fall when the price rises.' },
        { text: 'The good is a necessity.', why: 'Demand for necessities tends to be inelastic, under which a price rise would raise revenue.' },
      ],
      explanation: 'By the rules in the fourth paragraph, a price rise lowers revenue only when demand is elastic; inelastic demand raises revenue, and unit elastic demand leaves it unchanged. So demand must be elastic over this range.',
    },
  ],
};

// Practice set, business administration. Subject: net present value.
import { fixed, numericOptions, p, whole } from '../lib.mjs';

// ---------- Table 1: discount factors, rounded to three decimals as printed; all sums use the printed values ----------
const rates = [0.05, 0.1];
const years = [1, 2, 3];
const factor = (r, t) => Number((1 / (1 + r) ** t).toFixed(3));
const printed = rates.flatMap((r) => years.map((t) => factor(r, t)));
if (new Set(printed).size !== printed.length) throw new Error('every factor in Table 1 must be different');
const f = (r, t) => factor(r, t);

// The project: invest now, receive the same amount at the end of each of three years.
const invest = 12000;
const inflow = 5000;
const pv = (r, flows) => flows.reduce((s, c, i) => s + c * f(r, i + 1), 0);
const flowsA = years.map(() => inflow);
const npv = (r, flows, i0 = invest) => pv(r, flows) - i0;
const npv10 = npv(0.1, flowsA);
const npv5 = npv(0.05, flowsA);
if (!(npv10 > 0 && npv5 > npv10)) throw new Error('the project must stay worth doing at 10% and be worth more at 5%');

// Question 2: one payment in year 2 at 10%.
const pv2 = inflow * f(0.1, 2);
// Question 6: a project paying everything at the end.
const lump = inflow * years.length;
const npvB = lump * f(0.1, 3) - invest;
const npvBoneYear = lump * f(0.1, 1) - invest;
if (!(npvB < 0 && npvBoneYear > 0)) throw new Error('question 6 options need these signs');

// Question 5: another project's NPV, given.
const npvOther = -200;

const euro = (v) => (v < 0 ? `−€${whole(-v)}` : `€${whole(v)}`);
const pct = (r) => `${Math.round(r * 100)}%`;

export default {
  id: 'p14',
  set: 'practice',
  area: 'business administration',
  title: 'Net Present Value',
  facts: [
    { claim: 'Money now is worth more than the same amount later, because it can be invested and earn interest (time value of money).', source: 'https://en.wikipedia.org/wiki/Present_value', read: '2026-11-16' },
    { claim: 'Present value PV = C ÷ (1 + i)^t; the term 1 ÷ (1 + i)^t is the discount factor.', source: 'https://en.wikipedia.org/wiki/Net_present_value', read: '2026-11-16' },
    { claim: 'Net present value is the sum of the discounted future cash flows minus the initial investment.', source: 'https://en.wikipedia.org/wiki/Net_present_value', read: '2026-11-16' },
    { claim: 'A project with a positive NPV may be accepted and one with a negative NPV may be rejected; at zero the investor is indifferent.', source: 'https://en.wikipedia.org/wiki/Net_present_value', read: '2026-11-16' },
    { claim: 'The higher the discount rate, the lower the present value of a future amount.', source: 'https://en.wikipedia.org/wiki/Present_value', read: '2026-11-16' },
  ],
  blocks: [
    p(
      'A euro today is worth more than a euro in a year, because today\'s euro can be invested and earn interest in the meantime.',
      'So when a firm decides whether to invest, it cannot simply add up payments that arrive at different times.',
      'It first converts every future payment into its value today, its present value.',
    ),
    p(
      'If money can earn a rate r per year, an amount C received in t years has the present value',
    ),
    { type: 'formula', text: 'PV = C ÷ (1 + r)^t' },
    p(
      'The number 1 ÷ (1 + r)^t is called the discount factor: the present value is the amount times the discount factor.',
      'The rate r is called the discount rate; a firm usually takes the return it could earn on another investment of similar risk.',
      'The further away a payment is, and the higher the discount rate, the smaller the discount factor, and so the less the payment is worth today.',
      'Table 1 gives the discount factors for two rates; the questions use these rounded values.',
    ),
    {
      type: 'table',
      caption: 'Table 1. Discount factors 1 ÷ (1 + r)^t, rounded to three decimals.',
      head: ['Years from now (t)', ...rates.map((r) => `r = ${pct(r)}`)],
      rows: years.map((t) => [`${t}`, ...rates.map((r) => fixed(f(r, t), 3))]),
    },
    p(
      'The net present value (NPV) of a project is the sum of the present values of all the payments it brings in, minus the investment it needs now:',
    ),
    { type: 'formula', text: 'NPV = PV of all future cash flows − investment today' },
    p(
      'A positive NPV means the project\'s return is higher than the discount rate: it is worth more than the alternative.',
      'A negative NPV means its return is lower.',
      'Under the NPV rule a firm accepts projects with a positive NPV and rejects those with a negative one; at an NPV of exactly zero it is indifferent.',
      `In the questions, a firm can invest ${euro(invest)} today in a machine that brings in ${euro(inflow)} at the end of each of the next ${years.length} years.`,
      'All cash flows are assumed to arrive at the end of the year in which they occur.',
    ),
  ],
  questions: [
    {
      type: 'R', level: 1,
      stem: 'According to the text, why is a euro today worth more than a euro in a year?',
      options: [
        { text: 'Because prices always rise from one year to the next.', why: 'The text does not argue from prices; its reason is that money can earn interest in the meantime.' },
        { text: 'Because today\'s euro can be invested and earn interest until then.', correct: true, why: 'This is the reason the first paragraph gives.' },
        { text: 'Because a payment in the future may not be made at all.', why: 'Risk can matter in practice, but it is not the reason the text gives.' },
        { text: 'Because the discount factor for one year is greater than 1.', why: 'Discount factors for future years are less than 1; that is why future payments are worth less today.' },
      ],
      explanation: 'The first paragraph: today\'s euro can be invested and earn interest in the meantime, so it is worth more than a euro received later.',
    },
    {
      type: 'F', level: 1,
      stem: `Using Table 1, what is the present value of ${euro(inflow)} received in 2 years at a discount rate of ${pct(0.1)}?`,
      options: numericOptions(
        { value: pv2, why: `${euro(inflow)} × ${fixed(f(0.1, 2), 3)}, the factor for t = 2 at ${pct(0.1)}.` },
        [
          { value: inflow * f(0.05, 2), why: `This uses the factor for ${pct(0.05)}, from the wrong column.` },
          { value: inflow * f(0.1, 1), why: 'This uses the factor for one year, from the wrong row.' },
          { value: inflow, why: 'This is the amount itself, not discounted.' },
        ],
        euro,
      ),
      explanation: `PV = amount × discount factor = ${whole(inflow)} × ${fixed(f(0.1, 2), 3)} = ${euro(pv2)}.`,
    },
    {
      type: 'A', level: 2,
      stem: `What is the net present value of the machine at a discount rate of ${pct(0.1)}?`,
      options: numericOptions(
        { value: npv10, why: `${whole(inflow)} × (${years.map((t) => fixed(f(0.1, t), 3)).join(' + ')}) − ${whole(invest)}.` },
        [
          { value: inflow * (f(0.1, 1) + f(0.1, 2)) - invest, why: `This counts only two of the ${years.length} payments.` },
          { value: inflow * years.length - invest, why: 'This adds the payments without discounting them.' },
          { value: pv(0.1, flowsA), why: 'This is the present value of the payments; the investment still has to be subtracted.' },
        ],
        euro,
      ),
      explanation: `PV of the payments = ${whole(inflow)} × (${years.map((t) => fixed(f(0.1, t), 3)).join(' + ')}) = ${whole(inflow)} × ${fixed(years.reduce((s, t) => s + f(0.1, t), 0), 3)} = ${euro(pv(0.1, flowsA))}. NPV = ${euro(pv(0.1, flowsA))} − ${euro(invest)} = ${euro(npv10)}.`,
    },
    {
      type: 'D', level: 3,
      stem: `How does the net present value of the machine change if the discount rate is ${pct(0.1)} instead of ${pct(0.05)}?`,
      options: [
        { text: 'It stays the same, because the payments do not change.', why: 'The payments are the same, but each is worth less today at a higher rate.' },
        { text: `It rises by ${euro(npv5 - npv10)}.`, why: `This has the direction wrong: a higher rate makes every discount factor smaller.` },
        { text: `It falls by ${euro(npv5 - npv10)}.`, correct: true, why: `From ${euro(npv5)} at ${pct(0.05)} to ${euro(npv10)} at ${pct(0.1)}.` },
        { text: 'It falls to half, because the rate doubles.', why: `The NPV does not change in proportion to the rate: it goes from ${euro(npv5)} to ${euro(npv10)}.` },
      ],
      explanation: `At ${pct(0.05)}: ${whole(inflow)} × (${years.map((t) => fixed(f(0.05, t), 3)).join(' + ')}) − ${whole(invest)} = ${euro(npv5)}. At ${pct(0.1)}: ${euro(npv10)}. The higher rate makes every future payment worth less today, so the NPV falls by ${euro(npv5 - npv10)}.`,
    },
    {
      type: 'C', level: 1,
      stem: `A different project has a net present value of ${euro(npvOther)} at the firm's discount rate. What does this tell the firm?`,
      options: [
        { text: 'The project\'s return is lower than the discount rate, so under the NPV rule it is rejected.', correct: true, why: 'A negative NPV means the project is worth less than the alternative the discount rate stands for.' },
        { text: `The project loses ${euro(-npvOther)} in cash over its life.`, why: 'The NPV compares discounted values. The payments added up without discounting can still exceed the investment.' },
        { text: 'The project would have a positive NPV at a higher discount rate.', why: 'A higher rate lowers every discount factor, so the NPV would fall further below zero.' },
        { text: 'The project would have a positive NPV at every lower discount rate.', why: 'A lower rate raises the NPV, but not necessarily above zero.' },
      ],
      explanation: 'The last paragraph: a negative NPV means the project\'s return is lower than the discount rate, and the NPV rule rejects it. The NPV is not a cash loss: it compares present values, so the undiscounted payments can still be larger than the investment.',
    },
    {
      type: 'T', level: 2,
      stem: `A second machine also costs ${euro(invest)} today, but brings in a single payment of ${euro(lump)} at the end of year ${years.length}. What is its net present value at a discount rate of ${pct(0.1)}?`,
      options: numericOptions(
        { value: npvB, why: `${whole(lump)} × ${fixed(f(0.1, 3), 3)} − ${whole(invest)}.` },
        [
          { value: lump - invest, why: 'This leaves the payment undiscounted.' },
          { value: npvBoneYear, why: `This discounts the payment by one year only. It arrives at the end of year ${years.length}.` },
          { value: lump * f(0.05, 3) - invest, why: `This uses the factor for ${pct(0.05)}, from the wrong column.` },
        ],
        euro,
      ),
      explanation: `The whole ${euro(lump)} arrives at the end of year ${years.length}, so it is multiplied by the factor for t = ${years.length} at ${pct(0.1)}: ${whole(lump)} × ${fixed(f(0.1, 3), 3)} = ${euro(lump * f(0.1, 3))}. NPV = ${euro(lump * f(0.1, 3))} − ${euro(invest)} = ${euro(npvB)}. The payments add up to more than the investment, but they arrive so late that the machine is not worth buying at this rate.`,
    },
    {
      type: 'S', level: 1,
      stem: 'A fixed amount will be received at some time in the future, and the discount rate is above zero. Which statement is always true?',
      options: [
        { text: 'Its present value is larger than the amount.', why: 'Discount factors for future years are below 1, so the present value is smaller.' },
        { text: 'A higher discount rate raises its present value.', why: 'A higher rate lowers every discount factor, as Table 1 shows.' },
        { text: 'Its present value is the amount minus the discount rate times the amount.', why: `For one year at ${pct(0.1)} that gives ${fixed(1 - 0.1, 3)} times the amount; the discount factor is ${fixed(f(0.1, 1), 3)}.` },
        { text: 'The later it is received, the lower its present value.', correct: true, why: 'Each further year divides by (1 + r) once more; in Table 1 the factors fall down every column.' },
      ],
      explanation: 'The present value is the amount times 1 ÷ (1 + r)^t. With r above zero, this factor gets smaller as t grows, as each column of Table 1 shows. So the later the payment, the less it is worth today.',
    },
  ],
};

// Mock 3, passage 3. Area: natural sciences. Subject: exponential and logistic population growth.
import { curve, fixed, graph, numericOptions, p, whole } from '../lib.mjs';

// ---------- Figure 1: exponential and logistic curves from the same start ----------
const n0 = 200;
const K = 1000;
const r = 0.5; // per day
const maxDays = 12;
const maxY = 1400;

const expPop = (t) => n0 * Math.exp(r * t);
const logPop = (t) => (n0 * K * Math.exp(r * t)) / ((K - n0) + n0 * Math.exp(r * t));
const expRate = (n, rate = r) => rate * n;
const logRate = (n, cap = K, rate = r) => (rate * n * (cap - n)) / cap;

// Time at which the exponential curve reaches the top of the plotted frame.
const tExpTop = Math.log(maxY / n0) / r;
if (!(tExpTop > 3 && tExpTop < maxDays)) throw new Error('exponential curve should leave the top cleanly inside the frame');
if (new Set([n0, K / 2, K, maxY, maxDays]).size !== 5) throw new Error('key values on Figure 1 must differ');

// Question 2: available share (K - N0) / K at t = 0 read from Figure 1.
const avail0 = (K - n0) / K;
const used0 = n0 / K;
const ratioToRoom0 = n0 / (K - n0);
const availWrongTop = (maxY - n0) / maxY;

// Question 3: logistic growth rate at N = 800 for the culture in Figure 1.
const n3 = 800;
const ans3 = logRate(n3);
const wrong3OmitShare = r * (K - n3);
const wrong3UsedShare = (r * n3 * n3) / K;
const wrong3Exp = expRate(n3);

// Question 4: stocked trout lake above carrying capacity (N > K).
const lake = { K: 750, N: 900, r: 0.25 };
const lakeRate = logRate(lake.N, lake.K, lake.r);
if (!(lakeRate < 0 && Number.isInteger(lakeRate))) throw new Error('question 4 expects an integer negative rate');

// Question 5: comparing peak logistic growth rates when carrying capacity doubles.
const pond = { r: 0.4, kX: 300, kY: 600 };
const peakX = logRate(pond.kX / 2, pond.kX, pond.r);
const peakY = logRate(pond.kY / 2, pond.kY, pond.r);
if (peakY !== 2 * peakX) throw new Error('question 5 expects peak rate to double when K doubles');

// Question 6: find K from r, N and observed logistic growth rate.
const q6 = { r: 0.5, N: 1200, G: 150 };
const expAtQ6 = expRate(q6.N, q6.r);
const availShare6 = q6.G / expAtQ6;
const ans6 = q6.N / (1 - availShare6);
if (Math.abs(logRate(q6.N, ans6, q6.r) - q6.G) > 1e-9 || !Number.isInteger(ans6)) {
  throw new Error('question 6 K does not reproduce G as a whole number');
}
const wrong6ExpRate = expAtQ6;
const wrong6LinearRoom = q6.N + q6.G / q6.r;
const wrong6InvertedFraction = q6.N / availShare6;

// Question 7 counter-example: symmetric sizes around K / 2 share the same total growth rate.
if (Math.abs(logRate(200) - logRate(800)) > 1e-9) throw new Error('symmetric N values must give equal logistic rates');

const figure1 = graph({
  id: 'p29-fig1',
  w: 480,
  left: 68,
  x: { min: 0, max: maxDays, grid: 2, label: 2, title: 'Time in days' },
  y: { min: 0, max: maxY, grid: 200, label: 200, title: 'Population size N', format: whole },
  body: ({ px, py }) => `
  <line class="curve curve-3" x1="${px(0)}" y1="${py(K)}" x2="${px(maxDays)}" y2="${py(K)}"/>
  <polyline class="curve curve-2" points="${curve(expPop, 0, tExpTop, 48, px, py)}"/>
  <polyline class="curve" points="${curve(logPop, 0, maxDays, 96, px, py)}"/>
  <text class="label-2" x="${px(tExpTop) + 6}" y="${py(maxY) + 18}">Exponential</text>
  <text class="label-1" x="${px(maxDays)}" y="${py(logPop(maxDays)) + 22}" text-anchor="end">Logistic</text>
  <text class="label-3" x="${px(maxDays)}" y="${py(K) - 9}" text-anchor="end">Carrying capacity K</text>`,
});

export default {
  id: 'p29',
  set: 'mock',
  mock: 3,
  area: 'natural sciences',
  title: 'Exponential and Logistic Population Growth',
  facts: [
    { claim: 'Population growth rate equals births minus deaths per unit time; with constant per-capita birth minus death rate r (the intrinsic rate of increase) under unlimited resources, dN/dt = rN, giving exponential growth and a J-shaped curve with an accelerating number added per unit time.', source: 'https://openstax.org/books/biology-2e/pages/45-3-environmental-limits-to-population-growth', read: '2026-11-18' },
    { claim: 'Carrying capacity K is the maximum population size of an organism that a particular environment can sustain indefinitely given finite resources.', source: 'https://openstax.org/books/calculus-volume-2/pages/4-4-the-logistic-equation', read: '2026-11-18' },
    { claim: 'In the logistic model, the available fraction of carrying capacity is (K − N) ÷ K, giving growth rate r × N × (K − N) ÷ K and an S-shaped curve when starting small.', source: 'https://openstax.org/books/biology-2e/pages/45-3-environmental-limits-to-population-growth', read: '2026-11-18' },
    { claim: 'When N is very small relative to K, (K − N) ÷ K is close to 1 and logistic growth resembles exponential growth; at N = K growth is zero; when N > K the factor (K − N) ÷ K is negative and the population decreases towards K.', source: 'https://openstax.org/books/calculus-volume-2/pages/4-4-the-logistic-equation', read: '2026-11-18' },
    { claim: 'Under the logistic equation dP/dt = rP(1 − P/K), the population grows fastest when P = K ÷ 2, half the carrying capacity.', source: 'https://openstax.org/books/calculus-volume-2/pages/4-4-the-logistic-equation', read: '2026-11-18' },
  ],
  blocks: [
    p(
      'Ecologists track how a population of size N changes over time by comparing births and deaths.',
      'The population growth rate is the net number of individuals added per unit of time, and the per-capita growth rate is that rate divided by N, the average net contribution per individual.',
      'When food, space and other resources are abundant, each individual reproduces and survives at a constant net per-capita rate r, called the intrinsic rate of increase.',
      'Under this exponential growth model, the population growth rate is',
    ),
    { type: 'formula', text: 'exponential growth rate = r × N' },
    p(
      'Because r stays constant while N rises, a positive r makes the population add more individuals in each successive time interval than in the one before.',
      'Plotted against time, N follows a steepening J-shaped curve that grows without bound.',
    ),
    p(
      'No natural environment supplies unlimited resources forever.',
      'The carrying capacity K is the maximum population size that a particular environment can sustain indefinitely.',
      'The logistic growth model accounts for limited resources by multiplying the exponential rate by (K − N) ÷ K, the fraction of the carrying capacity still unused:',
    ),
    { type: 'formula', text: 'logistic growth rate = r × N × (K − N) ÷ K' },
    p(
      'Dividing this expression by N shows that the logistic per-capita growth rate is r × (K − N) ÷ K.',
      'When N is very small compared with K, (K − N) ÷ K is close to 1 and logistic growth is nearly exponential.',
      'As N grows, competition for scarce resources lowers the per-capita rate.',
      'Total individuals added per unit of time rise at first because N is growing, reach a maximum at N = K ÷ 2 (half the carrying capacity), and then fall as (K − N) ÷ K shrinks towards zero.',
    ),
    p(
      'At N = K, births and deaths balance, the growth rate is zero, and the curve levels off, forming an S-shaped curve from a small start.',
      'If a population ever starts or is pushed above K, then K − N is negative, making the growth rate negative so that N declines towards K.',
      'Figure 1 compares exponential and logistic trajectories starting from the same initial size with the same positive r.',
    ),
    {
      type: 'figure',
      id: 'p29-fig1',
      caption: 'Figure 1. Exponential and logistic population curves with the same starting size and intrinsic rate r = 0.5 per day.',
      alt: `Population size N from 0 to ${whole(maxY)} against time from 0 to ${maxDays} days. Both curves start at N = ${whole(n0)} at day 0. The exponential curve climbs steeply past ${whole(maxY)} after day 3.9. The logistic curve forms an S-shape and levels off below the dashed horizontal carrying-capacity line at K = ${whole(K)}.`,
      svg: figure1,
    },
  ],
  questions: [
    {
      type: 'R', level: 1,
      stem: 'According to the text, what does the carrying capacity K represent in the logistic growth model?',
      options: [
        { text: 'The maximum population size that a given environment can sustain indefinitely.', correct: true, why: 'This is the definition of carrying capacity K in the third paragraph.' },
        { text: 'The constant per-capita growth rate achieved when resources are unlimited.', why: 'That quantity is the intrinsic rate of increase r, not the carrying capacity K.' },
        { text: 'The largest number of individuals added per day at the steepest part of the curve.', why: 'That is the peak population growth rate, reached at N = K ÷ 2, whereas K is a population size.' },
        { text: 'The minimum starting population required before positive growth can begin.', why: 'In the logistic model any population with 0 < N < K and positive r has a positive growth rate.' },
      ],
      explanation: 'The third paragraph defines the carrying capacity K as the maximum population size that a particular environment can sustain indefinitely.',
    },
    {
      type: 'F', level: 1,
      stem: 'According to Figure 1, what fraction of the carrying capacity K is still unused, (K − N) ÷ K, at day 0?',
      options: numericOptions(
        { value: avail0, why: `Figure 1 shows N = ${whole(n0)} at day 0 and the carrying-capacity line at K = ${whole(K)}, so (${whole(K)} − ${whole(n0)}) ÷ ${whole(K)} = ${fixed(avail0)}.` },
        [
          { value: used0, why: `This is N ÷ K = ${whole(n0)} ÷ ${whole(K)}, the fraction already occupied at day 0 rather than the unused fraction.` },
          { value: ratioToRoom0, why: `This divides ${whole(n0)} by ${whole(K - n0)}, comparing N with K − N instead of dividing K − N by K.` },
          { value: availWrongTop, why: `This takes the top of the vertical axis, ${whole(maxY)}, as K instead of the dashed carrying-capacity line at ${whole(K)}.` },
        ],
        (v) => fixed(v, 2),
      ),
      explanation: `At day 0 both curves start at N = ${whole(n0)}, and the dashed line marks K = ${whole(K)}. The unused fraction is (${whole(K)} − ${whole(n0)}) ÷ ${whole(K)} = ${whole(K - n0)} ÷ ${whole(K)} = ${fixed(avail0)}.`,
    },
    {
      type: 'A', level: 2,
      stem: `In Figure 1 both curves share the intrinsic rate r = ${r} per day. Under the logistic model, at what rate (in individuals per day) is the logistic population growing when it reaches N = ${whole(n3)}?`,
      options: numericOptions(
        { value: ans3, why: `${r} × ${whole(n3)} × (${whole(K)} − ${whole(n3)}) ÷ ${whole(K)} = ${whole(expRate(n3))} × ${fixed((K - n3) / K, 1)} = ${whole(ans3)}.` },
        [
          { value: wrong3OmitShare, why: `This computes r × (K − N) = ${r} × ${whole(K - n3)}, leaving out the factor N ÷ K.` },
          { value: wrong3UsedShare, why: `This multiplies ${r} × ${whole(n3)} by the occupied fraction N ÷ K = ${fixed(n3 / K, 1)} instead of the unused fraction (K − N) ÷ K.` },
          { value: wrong3Exp, why: `This computes the unrestricted exponential rate r × N = ${r} × ${whole(n3)}, ignoring the carrying capacity.` },
        ],
        (v) => `${whole(v)} per day`,
      ),
      explanation: `Figure 1 shows K = ${whole(K)}. Substituting r = ${r}, N = ${whole(n3)} and K = ${whole(K)} into r × N × (K − N) ÷ K gives ${r} × ${whole(n3)} × (${whole(K - n3)} ÷ ${whole(K)}) = ${whole(expRate(n3))} × ${fixed((K - n3) / K, 1)} = ${whole(ans3)} per day.`,
    },
    {
      type: 'C', level: 2,
      stem: `A lake has a carrying capacity of K = ${whole(lake.K)} trout for a population with r = ${lake.r} per year. Fish are released into the lake until N = ${whole(lake.N)} trout are present. According to the logistic model, what happens immediately after release?`,
      options: [
        { text: `The population remains steady at ${whole(lake.N)} trout because it has already passed K.`, why: `Growth is zero only at N = K = ${whole(lake.K)}; above K the factor (K − N) ÷ K is negative.` },
        { text: `The population begins to shrink towards ${whole(lake.K)}, losing at an initial rate of ${whole(-lakeRate)} trout per year.`, correct: true, why: `With N > K, ${lake.r} × ${whole(lake.N)} × (${whole(lake.K)} − ${whole(lake.N)}) ÷ ${whole(lake.K)} = −${whole(-lakeRate)} trout per year.` },
        { text: `The population grows at an initial rate of ${whole(-lakeRate)} trout per year because r and N are positive.`, why: `Although r and N are positive, K − N = ${lake.K} − ${lake.N} = −${lake.N - lake.K} is negative, reversing the sign of the rate.` },
        { text: 'The population falls straight to zero because exceeding K exhausts all resources permanently.', why: 'In the logistic model a population above K declines towards K, where the growth rate returns towards zero.' },
      ],
      explanation: `Substitute into the logistic formula: ${lake.r} × ${whole(lake.N)} × (${whole(lake.K)} − ${whole(lake.N)}) ÷ ${whole(lake.K)} = ${whole(lake.r * lake.N)} × (−${lake.N - lake.K} ÷ ${whole(lake.K)}) = −${whole(-lakeRate)} trout per year. Because N exceeds K, the rate is negative and the population declines towards K.`,
    },
    {
      type: 'D', level: 2,
      stem: `Two isolated ponds hold the same species of microalgae with intrinsic rate r = ${pond.r} per day. Pond X has carrying capacity K = ${whole(pond.kX)} and Pond Y has carrying capacity K = ${whole(pond.kY)}. How does the maximum logistic population growth rate in Pond Y compare with that in Pond X?`,
      options: [
        { text: 'It is the same in both ponds, because both share the same intrinsic rate r.', why: `Peak growth occurs at N = K ÷ 2 and equals r × (K ÷ 2) × (1 ÷ 2), which scales with K: ${peakX} per day in X and ${peakY} per day in Y.` },
        { text: 'It is half as large in Pond Y, because K sits in the denominator of the logistic formula.', why: 'At each pond’s own peak N = K ÷ 2, the fraction (K − N) ÷ K is 1/2 in both ponds while N is twice as large in Pond Y.' },
        { text: 'It is four times as large in Pond Y, because both N and K − N double at the peak.', why: 'Both N and K − N double, giving four times their product, which is then divided by twice K, leaving a factor of two overall.' },
        { text: `It is twice as large in Pond Y, rising from ${whole(peakX)} to ${whole(peakY)} individuals per day.`, correct: true, why: `At N = K ÷ 2 the rate is r × (K ÷ 2) × (1 ÷ 2) = r × K ÷ 4, which doubles from ${whole(peakX)} to ${whole(peakY)} when K doubles.` },
      ],
      explanation: `Logistic growth is fastest at N = K ÷ 2, where (K − N) ÷ K = 1/2. In Pond X, N = ${pond.kX / 2} gives ${pond.r} × ${pond.kX / 2} × 0.5 = ${whole(peakX)} per day. In Pond Y, N = ${pond.kY / 2} gives ${pond.r} × ${pond.kY / 2} × 0.5 = ${whole(peakY)} per day, twice as large.`,
    },
    {
      type: 'T', level: 3,
      stem: `A culture of cells follows the logistic model with intrinsic rate r = ${q6.r} per hour. When the culture reaches N = ${whole(q6.N)} cells, its logistic growth rate is ${whole(q6.G)} cells per hour. What is the carrying capacity K of the culture?`,
      options: numericOptions(
        { value: ans6, why: `Here r × N = ${whole(expAtQ6)}, so (K − ${whole(q6.N)}) ÷ K = ${whole(q6.G)} ÷ ${whole(expAtQ6)} = ${fixed(availShare6)}, meaning ${whole(q6.N)} is ${fixed(1 - availShare6)} of K and K = ${whole(ans6)}.` },
        [
          { value: wrong6ExpRate, why: `This is r × N = ${q6.r} × ${whole(q6.N)} = ${whole(wrong6ExpRate)}, the unrestricted exponential rate in cells per hour, not K.` },
          { value: wrong6LinearRoom, why: `This solves ${q6.r} × (K − ${whole(q6.N)}) = ${whole(q6.G)}, leaving out the factor N ÷ K from the logistic equation.` },
          { value: wrong6InvertedFraction, why: `This sets ${whole(q6.N)} ÷ K = ${fixed(availShare6)} instead of (K − ${whole(q6.N)}) ÷ K = ${fixed(availShare6)}, swapping the used and unused shares.` },
        ],
        (v) => `${whole(v)} cells`,
      ),
      explanation: `At N = ${whole(q6.N)}, the exponential factor r × N is ${q6.r} × ${whole(q6.N)} = ${whole(expAtQ6)} cells per hour. Since the logistic rate is ${whole(q6.G)} cells per hour, the unused fraction (K − N) ÷ K equals ${whole(q6.G)} ÷ ${whole(expAtQ6)} = ${fixed(availShare6)}. Therefore N ÷ K = 1 − ${fixed(availShare6)} = ${fixed(1 - availShare6)}, giving K = ${whole(q6.N)} ÷ ${fixed(1 - availShare6)} = ${whole(ans6)} cells.`,
    },
    {
      type: 'S', level: 3,
      stem: 'A population with positive r follows the logistic model as N rises from a small value below K ÷ 2 towards K. Which statement holds across the entire range 0 < N < K?',
      options: [
        { text: 'Both the per-capita growth rate and the population growth rate decrease steadily across the entire range.', why: 'The population growth rate increases while N is below K ÷ 2 and decreases only after N passes K ÷ 2.' },
        { text: 'The per-capita growth rate stays fixed at r until N reaches K ÷ 2 and begins to fall only above K ÷ 2.', why: 'The logistic per-capita rate is r × (K − N) ÷ K, which decreases continuously with every increase in N.' },
        { text: 'No two different population sizes between 0 and K can produce the same population growth rate.', why: 'Sizes equally far below and above K ÷ 2, such as 200 and 800 when K = 1,000, give the same product N × (K − N) and thus the same rate.' },
        { text: 'The per-capita growth rate falls steadily throughout, whereas the population growth rate rises until K ÷ 2 and then falls.', correct: true, why: 'Per-capita growth is r × (K − N) ÷ K, which drops continuously as N grows, while multiplying by N creates a peak at K ÷ 2.' },
      ],
      explanation: 'In the logistic model, the per-capita growth rate is r × (K − N) ÷ K, which decreases linearly over the whole interval from N = 0 to N = K. The total population growth rate multiplies that falling per-capita rate by the rising population size N, rising until N = K ÷ 2 and falling thereafter towards zero at N = K.',
    },
  ],
};

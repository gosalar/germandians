// Full mock 3, passage 7. Area: engineering. Subject: series and parallel system reliability.
import { fixed, numericOptions, p } from '../lib.mjs';

// ---------- Figure 1: cooling-water reliability block diagram ----------
const rA = 0.9; // Filter A (series)
const rB = 0.7; // Pump B (parallel)
const rC = 0.5; // Pump C (parallel)

const onFigure = [rA, rB, rC];
if (new Set(onFigure).size !== onFigure.length) throw new Error('every reliability on Figure 1 must differ');

const series = (...rs) => rs.reduce((acc, r) => acc * r, 1);
const parallel = (...rs) => 1 - rs.reduce((acc, r) => acc * (1 - r), 1);

const fBC = (1 - rB) * (1 - rC);
const rBC = parallel(rB, rC);
const rSystem = series(rA, rBC);

const rBCAsSeries = series(rB, rC);
const rBCAverage = (rB + rC) / 2;

const rAllSeries = series(rA, rB, rC);
const rSeriesWithAvg = series(rA, rBCAverage);
const rAllParallel = parallel(rA, rB, rC);

if ([rBC, rSystem].some((ans) => onFigure.some((v) => Math.abs(v - ans) < 1e-9))) {
  throw new Error('computed answers must not match a number printed on Figure 1');
}

// Question 5: target reliability for a parallel valve pair.
const v1 = 0.84;
const targetPair = 0.96;
const f1 = 1 - v1;
const fPair = 1 - targetPair;
const f2 = fPair / f1;
const v2 = 1 - f2;
const v2Equal = 1 - Math.sqrt(fPair);
const v2Subtracted = 1 - (f1 - fPair);
if ([v1, targetPair, f2, v2, v2Equal, v2Subtracted].some((x) => onFigure.some((y) => Math.abs(x - y) < 1e-9))) {
  throw new Error('question 5 must not share reliabilities with Figure 1');
}
if (Math.abs(parallel(v1, v2) - targetPair) > 1e-9) throw new Error('question 5 answer check failed');
if (Math.abs(targetPair - f1 - v2) < 1e-9) throw new Error('question 5 must avoid lucky subtraction coincidence');

// Question 6: backing up the weaker vs stronger stage in a 2-stage series line.
const rX = 0.6;
const rY = 0.8;
const rX2 = parallel(rX, rX);
const rY2 = parallel(rY, rY);
const sysBackupX = series(rX2, rY);
const sysBackupY = series(rX, rY2);
if (!(sysBackupX > sysBackupY && rY2 > rX2)) {
  throw new Error('question 6 requires backing up the weaker stage to win despite lower stage reliability');
}

const figure1 = `<svg viewBox="0 0 490 230" role="img" aria-labelledby="p33-fig1-alt">
  <line class="wire" x1="44" y1="115" x2="78" y2="115"/>
  <rect class="part" x="78" y="85" width="112" height="60" rx="4"/>
  <text x="134" y="110" text-anchor="middle">Filter A</text>
  <text class="prob" x="134" y="133" text-anchor="middle">R = ${fixed(rA, 2)}</text>
  <line class="wire" x1="190" y1="115" x2="226" y2="115"/>
  <polyline class="wire" points="226,115 226,56 262,56"/>
  <polyline class="wire" points="226,115 226,174 262,174"/>
  <rect class="part" x="262" y="26" width="116" height="60" rx="4"/>
  <text x="320" y="51" text-anchor="middle">Pump B</text>
  <text class="prob" x="320" y="74" text-anchor="middle">R = ${fixed(rB, 2)}</text>
  <rect class="part" x="262" y="144" width="116" height="60" rx="4"/>
  <text x="320" y="169" text-anchor="middle">Pump C</text>
  <text class="prob" x="320" y="192" text-anchor="middle">R = ${fixed(rC, 2)}</text>
  <polyline class="wire" points="378,56 414,56 414,115"/>
  <polyline class="wire" points="378,174 414,174 414,115"/>
  <line class="wire" x1="414" y1="115" x2="442" y2="115"/>
  <polygon class="dot" points="436,109 436,121 448,115"/>
  <circle class="dot" cx="226" cy="115" r="4"/>
  <circle class="dot" cx="414" cy="115" r="4"/>
  <text x="38" y="121" text-anchor="end">In</text>
  <text x="454" y="121">Out</text>
</svg>`;

export default {
  id: 'p33',
  set: 'mock',
  mock: 3,
  area: 'engineering',
  title: 'Series and Parallel System Reliability',
  facts: [
    { claim: 'System reliability can be evaluated bottom-up from component reliabilities using series, parallel (redundant) and combined block models for non-repairable operating periods.', source: 'https://www.itl.nist.gov/div898/handbook/apr/section1/apr18.htm', read: '2026-11-18' },
    { claim: 'In a series model, components operate or fail independently and the first component failure causes the system to fail, so system reliability is the product of the component reliabilities: R_S = R1 × R2 × … × Rn.', source: 'https://www.itl.nist.gov/div898/handbook/apr/section1/apr182.htm', read: '2026-11-18' },
    { claim: 'In a parallel (active redundant) model with independent components, the system works as long as at least one component works and fails only when all fail, so system failure probability is the product of component failure probabilities: F_S = F1 × F2 × … × Fn, and R_S = 1 − F_S.', source: 'https://www.itl.nist.gov/div898/handbook/apr/section1/apr183.htm', read: '2026-11-18' },
    { claim: 'Complex systems combining series and parallel sections are evaluated by replacing each series or parallel subsystem with an equivalent single block of known reliability and reducing step by step.', source: 'https://www.itl.nist.gov/div898/handbook/apr/section1/apr186.htm', read: '2026-11-18' },
  ],
  blocks: [
    p(
      'In reliability engineering, the reliability R of a component over a stated operating period, such as one year of continuous service, is the probability that it performs its function throughout that period without failing.',
      'As a probability, R lies from 0 to 1, and the probability that the component fails during the period is F = 1 − R.',
      'Throughout this passage, component failures are statistically independent: whether one part fails does not alter the probability that any other part fails.',
    ),
    p(
      'Engineers represent how parts depend on one another with a reliability block diagram.',
      'The diagram shows logical dependence rather than physical wiring: the system succeeds whenever at least one unbroken path of working blocks connects the input (In) to the output (Out).',
    ),
    p(
      'Components stand in series when every one of them must work for the system to work, so the first component failure stops the system.',
      'For n independent components with reliabilities R1, R2, …, Rn in series, the system reliability is their product:',
    ),
    { type: 'formula', text: 'R_series = R1 × R2 × … × Rn' },
    p(
      'Because multiplying by a number below 1 makes a positive value smaller, adding an imperfect part in series always lowers reliability below that of the weakest part in the chain.',
    ),
    p(
      'To guard against failure, engineers add redundancy by placing components in parallel.',
      'In active parallel redundancy, all branches operate and the group succeeds as long as at least one branch works; it fails only when every branch fails during the period.',
      'For independent branches, the failure probability of the parallel group is the product of the individual failure probabilities:',
    ),
    { type: 'formula', text: 'F_parallel = (1 − R1) × (1 − R2) × … × (1 − Rn)' },
    p(
      'Subtracting this combined failure probability from 1 gives the reliability of the parallel group:',
    ),
    { type: 'formula', text: 'R_parallel = 1 − (1 − R1) × (1 − R2) × … × (1 − Rn)' },
    p(
      'Adding a parallel branch always raises reliability above that of the single most reliable branch in the group.',
      'A diagram that mixes series and parallel sections is solved in stages: replace each parallel group with one equivalent block carrying its R_parallel, then multiply along the series chain.',
      'Figure 1 shows the block diagram of a furnace cooling-water line over one year: water must pass through Filter A and be driven by at least one of the two pumps, B or C.',
    ),
    {
      type: 'figure',
      id: 'p33-fig1',
      caption: 'Figure 1. Reliability block diagram of a cooling-water line over one year of service.',
      alt: `A reliability block diagram from In on the left to Out on the right. From In, a single path passes through Filter A (R = ${fixed(rA, 2)}) and then divides into two parallel branches: an upper branch with Pump B (R = ${fixed(rB, 2)}) and a lower branch with Pump C (R = ${fixed(rC, 2)}). The two branches join again before Out.`,
      svg: figure1,
    },
  ],
  questions: [
    {
      type: 'R', level: 1,
      stem: 'According to the text, what happens to system reliability when one more independent component with reliability strictly between 0 and 1 is added in series?',
      options: [
        { text: 'It rises above the reliability of the strongest component in the chain.', why: 'Reliability rises above the strongest component when a redundant branch is added in parallel, not in series.' },
        { text: 'It falls, ending up below the reliability of the weakest component in the chain.', correct: true, why: 'In series R_series multiplies all component reliabilities; multiplying by another number below 1 reduces the product below the smallest factor.' },
        { text: 'It settles at the average of the existing system reliability and the new component.', why: 'Series reliabilities are multiplied, not averaged; an average would lie between the two values rather than below both.' },
        { text: 'It stays unchanged, because the failures of the components are independent.', why: 'Independence justifies multiplying the probabilities; it does not keep the product from shrinking when another factor below 1 is included.' },
      ],
      explanation: 'The fourth paragraph explains that multiplying by a number below 1 makes a positive product smaller, so adding an imperfect component in series always lowers system reliability below the weakest component in the chain.',
    },
    {
      type: 'F', level: 1,
      stem: 'In Figure 1, which single-component failure stops cooling water from reaching Out when the other two components keep working?',
      options: [
        { text: 'Failure of Filter A alone.', correct: true, why: 'Every path from In to Out passes through Filter A, so if Filter A fails no unbroken path of working blocks remains.' },
        { text: 'Failure of Pump B alone.', why: 'When Pump B fails while Filter A and Pump C work, the lower branch through Filter A and Pump C still connects In to Out.' },
        { text: 'Failure of Pump C alone.', why: 'When Pump C fails while Filter A and Pump B work, the upper branch through Filter A and Pump B still connects In to Out.' },
        { text: 'Filter A and Pump B together, because no single part can stop the line.', why: 'Redundancy covers only the pump stage; Filter A has no parallel backup, so its failure alone stops the line.' },
      ],
      explanation: 'A system in a reliability block diagram works whenever an unbroken path of working blocks links In to Out. Filter A sits alone in series with the pump pair, so its failure breaks every path; either pump can fail alone while the other keeps the path open.',
    },
    {
      type: 'A', level: 2,
      stem: 'What is the combined reliability of the parallel pump pair (Pump B and Pump C) in Figure 1 over the one-year period?',
      options: numericOptions(
        { value: rBC, why: `F_parallel = (1 − ${fixed(rB, 2)}) × (1 − ${fixed(rC, 2)}) = ${fixed(1 - rB, 2)} × ${fixed(1 - rC, 2)} = ${fixed(fBC, 2)}, so R_parallel = 1 − ${fixed(fBC, 2)} = ${fixed(rBC, 2)}.` },
        [
          { value: fBC, why: `This is ${fixed(1 - rB, 2)} × ${fixed(1 - rC, 2)}, the probability that both pumps fail. It still has to be subtracted from 1.` },
          { value: rBCAsSeries, why: `This multiplies ${fixed(rB, 2)} × ${fixed(rC, 2)} as if both pumps stood in series and both had to work.` },
          { value: rBCAverage, why: `This averages ${fixed(rB, 2)} and ${fixed(rC, 2)}. Parallel redundancy must give a reliability above ${fixed(rB, 2)}.` },
        ],
        (v) => fixed(v, 2),
      ),
      explanation: `Pump B fails with probability 1 − ${fixed(rB, 2)} = ${fixed(1 - rB, 2)}, and Pump C fails with probability 1 − ${fixed(rC, 2)} = ${fixed(1 - rC, 2)}. Because both must fail for the parallel stage to fail, F_parallel = ${fixed(1 - rB, 2)} × ${fixed(1 - rC, 2)} = ${fixed(fBC, 2)}, giving R_parallel = 1 − ${fixed(fBC, 2)} = ${fixed(rBC, 2)}.`,
    },
    {
      type: 'A', level: 2,
      stem: 'What is the reliability of the whole cooling-water line in Figure 1 over the one-year period?',
      options: numericOptions(
        { value: rSystem, why: `Replace the parallel pumps with an equivalent block of reliability ${fixed(rBC, 2)}, then multiply in series with Filter A: ${fixed(rA, 2)} × ${fixed(rBC, 2)} = ${fixed(rSystem, 3)}.` },
        [
          { value: rAllSeries, why: `This multiplies ${fixed(rA, 2)} × ${fixed(rB, 2)} × ${fixed(rC, 2)}, treating all three components as a single series chain.` },
          { value: rSeriesWithAvg, why: `This multiplies Filter A (${fixed(rA, 2)}) by ${fixed(rBCAverage, 2)}, the average of the two pump reliabilities rather than their parallel reliability.` },
          { value: rAllParallel, why: `This computes 1 − ${fixed(1 - rA, 2)} × ${fixed(1 - rB, 2)} × ${fixed(1 - rC, 2)}, treating Filter A as if it also stood in parallel with the pumps.` },
        ],
        (v) => fixed(v, 3),
      ),
      explanation: `Reduce the diagram in two steps. First, the parallel pump pair has reliability 1 − (1 − ${fixed(rB, 2)}) × (1 − ${fixed(rC, 2)}) = ${fixed(rBC, 2)}. Second, that equivalent block stands in series with Filter A (${fixed(rA, 2)}), so R_system = ${fixed(rA, 2)} × ${fixed(rBC, 2)} = ${fixed(rSystem, 3)}.`,
    },
    {
      type: 'T', level: 3,
      stem: `A satellite fuel line uses Valve 1, whose mission reliability is ${fixed(v1, 2)}, and engineers place an independent backup Valve 2 in parallel with it so the pair fails only if both valves fail. What mission reliability must Valve 2 have for the parallel pair to achieve a combined reliability of ${fixed(targetPair, 2)}?`,
      options: numericOptions(
        { value: v2, why: `The pair's allowed failure probability is 1 − ${fixed(targetPair, 2)} = ${fixed(fPair, 2)}. Valve 1 fails with probability ${fixed(f1, 2)}, so F2 = ${fixed(fPair, 2)} ÷ ${fixed(f1, 2)} = ${fixed(f2, 2)} and R2 = 1 − ${fixed(f2, 2)} = ${fixed(v2, 2)}.` },
        [
          { value: f2, why: `This is F2 = ${fixed(fPair, 2)} ÷ ${fixed(f1, 2)}, Valve 2's failure probability rather than its reliability 1 − F2.` },
          { value: v2Equal, why: `This solves (1 − R)² = ${fixed(fPair, 2)}, which assumes both valves have the same reliability instead of using ${fixed(v1, 2)} for Valve 1.` },
          { value: v2Subtracted, why: `This subtracts ${fixed(fPair, 2)} from ${fixed(f1, 2)} (${fixed(f1 - fPair, 2)}) and takes 1 − ${fixed(f1 - fPair, 2)}, treating parallel failure probabilities as subtracted rather than multiplied.` },
        ],
        (v) => fixed(v, 2),
      ),
      explanation: `For two independent valves in parallel, F_parallel = (1 − R1) × (1 − R2). Here F_parallel = 1 − ${fixed(targetPair, 2)} = ${fixed(fPair, 2)} and 1 − R1 = 1 − ${fixed(v1, 2)} = ${fixed(f1, 2)}. Dividing gives 1 − R2 = ${fixed(fPair, 2)} ÷ ${fixed(f1, 2)} = ${fixed(f2, 2)}, so R2 = 1 − ${fixed(f2, 2)} = ${fixed(v2, 2)}.`,
    },
    {
      type: 'D', level: 2,
      stem: `A monitoring chain consists of Sensor X (reliability ${fixed(rX, 2)}) in series with Recorder Y (reliability ${fixed(rY, 2)}), with independent failures. An engineer can add either one identical backup sensor in parallel with X, or one identical backup recorder in parallel with Y, but not both. Which option produces the higher overall reliability, and why?`,
      options: [
        { text: `Backing up Recorder Y, because two ${fixed(rY, 2)} units in parallel reach ${fixed(rY2, 2)}, higher than two ${fixed(rX, 2)} units at ${fixed(rX2, 2)}.`, why: `Although ${fixed(rY2, 2)} exceeds ${fixed(rX2, 2)}, leaving Sensor X unbacked keeps a ${fixed(rX, 2)} bottleneck in series, giving ${fixed(rX, 2)} × ${fixed(rY2, 2)} = ${fixed(sysBackupY, 3)}.` },
        { text: 'Both options produce the same overall reliability, because series multiplication does not depend on stage order.', why: `Stage order does not change a fixed product, but the two choices form different products: ${fixed(rX2, 2)} × ${fixed(rY, 2)} = ${fixed(sysBackupX, 3)} versus ${fixed(rX, 2)} × ${fixed(rY2, 2)} = ${fixed(sysBackupY, 3)}.` },
        { text: `Backing up Sensor X, because raising the weaker ${fixed(rX, 2)} stage to ${fixed(rX2, 2)} lifts the series product more than raising ${fixed(rY, 2)} to ${fixed(rY2, 2)}.`, correct: true, why: `With X backed up, system reliability is ${fixed(rX2, 2)} × ${fixed(rY, 2)} = ${fixed(sysBackupX, 3)}, higher than ${fixed(rX, 2)} × ${fixed(rY2, 2)} = ${fixed(sysBackupY, 3)} when Y is backed up.` },
        { text: 'Neither option raises overall reliability, because adding a third part introduces an extra failure chance.', why: `A parallel backup adds an alternative working path rather than a series bottleneck, so either backup raises system reliability above ${fixed(series(rX, rY), 3)}.` },
      ],
      explanation: `Two Sensor X units in parallel have reliability 1 − (1 − ${fixed(rX, 2)})² = ${fixed(rX2, 2)}, giving a series system reliability of ${fixed(rX2, 2)} × ${fixed(rY, 2)} = ${fixed(sysBackupX, 3)}. Two Recorder Y units in parallel reach 1 − (1 − ${fixed(rY, 2)})² = ${fixed(rY2, 2)}, but in series with the single Sensor X that gives only ${fixed(rX, 2)} × ${fixed(rY2, 2)} = ${fixed(sysBackupY, 3)}. Reinforcing the weaker series stage removes the tighter bottleneck.`,
    },
  ],
};

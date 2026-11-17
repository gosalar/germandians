// Full mock, passage 4. Area: engineering. Subject: series and parallel circuits.
import { fixed, numericOptions, p } from '../lib.mjs';

// ---------- the circuit in Figure 1 ----------
const V = 36; // volts
const R1 = 8;
const R2 = 20;
const R3 = 5;
const parallel = (...rs) => 1 / rs.reduce((s, r) => s + 1 / r, 0);
const Rp = parallel(R2, R3);
const Rtotal = R1 + Rp;
const I = V / Rtotal;
const V1 = I * R1;
const Vp = I * Rp;
const I2 = Vp / R2;
const I3 = Vp / R3;
const P3 = Vp * I3;
const onFigure = [V, R1, R2, R3];
if (new Set(onFigure).size !== onFigure.length) throw new Error('every number on Figure 1 must be different');
const answers = [Rp, I, P3];
if (answers.some((a) => onFigure.includes(a)) || new Set(answers).size !== answers.length) throw new Error('an answer must not equal a number on the figure or another answer');
if (Math.abs(I2 + I3 - I) > 1e-9 || Math.abs(V1 + Vp - V) > 1e-9) throw new Error('the circuit does not add up');

// Question 6: R3 removed, its branch left open.
const Iafter = V / (R1 + R2);
const V2after = Iafter * R2;
if (!(V2after > Vp)) throw new Error('question 6 expects the voltage across R2 to rise');

const ohm = (v) => `${Number(fixed(v, 2))} Ω`;
const amp = (v) => `${fixed(v, 2)} A`;
const volt = (v) => `${fixed(v, 1)} V`;
const watt = (v) => `${fixed(v, 1)} W`;

// ---------- Figure 1: battery on the left, R1 on the top wire, R2 and R3 side by side on the right ----------
const figure1 = `<svg viewBox="0 0 440 250" role="img" aria-labelledby="p04-fig1-alt">
  <polyline class="wire" points="80,105 80,44 130,44"/>
  <polyline class="wire" points="210,44 380,44"/>
  <polyline class="wire" points="80,121 80,215 380,215"/>
  <polyline class="wire" points="260,44 260,95"/><polyline class="wire" points="260,165 260,215"/>
  <polyline class="wire" points="380,44 380,95"/><polyline class="wire" points="380,165 380,215"/>
  <line x1="58" y1="105" x2="102" y2="105" style="stroke-width:3"/>
  <line x1="69" y1="121" x2="91" y2="121" style="stroke-width:6"/>
  <text class="big" x="50" y="100" text-anchor="end">+</text>
  <text class="big" x="50" y="128" text-anchor="end">${V} V</text>
  <rect class="part" x="130" y="32" width="80" height="24"/>
  <text class="big" x="170" y="22" text-anchor="middle">R1 = ${R1} Ω</text>
  <rect class="part" x="248" y="95" width="24" height="70"/>
  <text class="big" x="238" y="126" text-anchor="end">R2</text>
  <text class="big" x="238" y="152" text-anchor="end">${R2} Ω</text>
  <rect class="part" x="368" y="95" width="24" height="70"/>
  <text class="big" x="402" y="126">R3</text>
  <text class="big" x="402" y="152">${R3} Ω</text>
  <circle class="dot" cx="260" cy="44" r="4.5"/><circle class="dot" cx="260" cy="215" r="4.5"/>
</svg>`;

export default {
  id: 'p04',
  set: 'mock',
  area: 'engineering',
  title: 'Series and Parallel Circuits',
  facts: [
    { claim: "Ohm's law: V = I R, for ohmic materials; the ohm is a volt per ampere.", source: 'https://openstax.org/books/college-physics-2e/pages/20-2-ohms-law-resistance-and-simple-circuits', read: '2026-11-16' },
    { claim: 'In series the same current flows through each resistor, the total resistance is the sum, and the voltage drops add up to the source voltage.', source: 'https://openstax.org/books/college-physics-2e/pages/21-1-resistors-in-series-and-parallel', read: '2026-11-16' },
    { claim: 'In parallel each resistor has the same voltage across it, the branch currents add up to the total current, 1/Rp = 1/R1 + 1/R2 + …, and Rp is smaller than the smallest resistor (connecting wires of negligible resistance).', source: 'https://openstax.org/books/college-physics-2e/pages/21-1-resistors-in-series-and-parallel', read: '2026-11-16' },
    { claim: 'The sum of the currents entering a junction equals the sum of the currents leaving it.', source: 'https://openstax.org/books/college-physics-2e/pages/21-3-kirchhoffs-rules', read: '2026-11-16' },
    { claim: 'Electric power P = I V, in watts; for a resistor it also equals I²R and V²/R.', source: 'https://openstax.org/books/college-physics-2e/pages/20-4-electric-power-and-energy', read: '2026-11-16' },
  ],
  blocks: [
    p(
      'An electric circuit is a closed path along which charge can flow.',
      'Three quantities describe it.',
      'The current I, measured in amperes (A), is how much charge passes a point each second.',
      'The voltage V, measured in volts (V), drives the current; a battery supplies it.',
      'The resistance R, measured in ohms (Ω), is how strongly a component opposes the current.',
      "For the resistors in this passage the three are linked by Ohm's law:",
    ),
    { type: 'formula', text: 'V = I × R' },
    p(
      'Resistors can be joined in two basic ways.',
      'In series they lie one after another on a single path, so the same current flows through each.',
      'For two resistors Ra and Rb their resistances add up, R = Ra + Rb, and the voltages across them add up to the voltage of the source.',
      'The larger resistance takes the larger share of the voltage.',
    ),
    p(
      'In parallel the resistors sit on separate branches between the same two junctions, the points where the wire divides and joins again.',
      'Each branch therefore has the same voltage across it.',
      'The current divides at the first junction and comes together at the second; the currents in the branches add up to the current that arrives.',
      'The branch with the smaller resistance carries the larger current.',
      'The combined resistance R of two resistors Ra and Rb in parallel follows from',
    ),
    { type: 'formula', text: '1/R = 1/Ra + 1/Rb' },
    p(
      'Adding a branch gives the current an extra path, so the combined resistance is always smaller than the smallest resistance in the group.',
      'A circuit that mixes both arrangements is solved in steps: replace each parallel group by its combined resistance, add the resistances in series, and use Ohm\'s law for the current.',
    ),
    p(
      'A resistor turns electrical energy into heat.',
      'The power P, in watts (W), is the energy it converts each second:',
    ),
    { type: 'formula', text: 'P = V × I' },
    p('Here V is the voltage across that resistor and I the current through it. Figure 1 shows a circuit with one resistor in series and two in parallel; the connecting wires have no resistance.'),
    {
      type: 'figure',
      id: 'p04-fig1',
      caption: 'Figure 1. A circuit with a battery and three resistors.',
      alt: `A ${V} V battery. From it the wire runs through resistor R1 (${R1} Ω) to a junction, where it divides into two branches: one through R2 (${R2} Ω) and one through R3 (${R3} Ω). The branches join again at a second junction, and the wire returns to the battery.`,
      svg: figure1,
    },
  ],
  questions: [
    {
      type: 'R', level: 1,
      stem: 'According to the text, what is the same for every branch of a parallel arrangement?',
      options: [
        { text: 'The current through it.', why: 'The current divides between the branches; the branch with the smaller resistance carries more.' },
        { text: 'The power converted in it.', why: 'P = V × I. The voltage is the same, but the currents differ, so the powers differ too.' },
        { text: 'The voltage across it.', correct: true, why: 'All branches lie between the same two junctions, so each has the same voltage across it.' },
        { text: 'The resistance in it.', why: 'Branches can hold any resistances; in Figure 1 they are different.' },
      ],
      explanation: 'The third paragraph says that each branch of a parallel arrangement has the same voltage across it, because all branches connect the same two junctions.',
    },
    {
      type: 'F', level: 1,
      stem: 'In Figure 1, which resistor carries the whole current that leaves the battery?',
      options: [
        { text: 'R1 only.', correct: true, why: 'R1 lies on the single path between the battery and the first junction, so it is in series with the battery and the parallel pair.' },
        { text: 'R2 only.', why: 'R2 is on one of two branches; it carries only part of the current.' },
        { text: 'R3 only.', why: 'R3 is on one of two branches; it carries only part of the current.' },
        { text: 'R2 and R3, each of them.', why: 'The current divides at the junction; each branch carries part of it, and the two parts add up to the whole.' },
      ],
      explanation: 'The current from the battery flows through R1 before it reaches the junction where it divides between R2 and R3. R1 is in series with the rest of the circuit, so it carries the whole current.',
    },
    {
      type: 'A', level: 2,
      stem: 'What is the combined resistance of R2 and R3 in Figure 1?',
      options: numericOptions(
        { value: Rp, why: `1/R = 1/${R2} + 1/${R3} = ${fixed(1 / Rp, 2)}, so R = ${ohm(Rp)}.` },
        [
          { value: 1 / Rp, why: `This is 1/R. The sum 1/${R2} + 1/${R3} still has to be turned upside down.` },
          { value: (R2 + R3) / 2, why: 'This is the average of the two. The combined resistance must be smaller than the smaller of them.' },
          { value: R2 + R3, why: 'This adds the resistances as if they were in series.' },
        ],
        ohm,
      ),
      explanation: `For two resistors in parallel, 1/R = 1/${R2} + 1/${R3} = ${fixed(1 / R2, 2)} + ${fixed(1 / R3, 2)} = ${fixed(1 / Rp, 2)}, so R = 1 ÷ ${fixed(1 / Rp, 2)} = ${ohm(Rp)}. As the text says, this is smaller than ${R3} Ω, the smaller of the two.`,
    },
    {
      type: 'A', level: 2,
      stem: 'What current leaves the battery in Figure 1?',
      options: numericOptions(
        { value: I, why: `The total resistance is ${R1} + ${fixed(Rp, 0)} = ${fixed(Rtotal, 0)} Ω, and ${V} ÷ ${fixed(Rtotal, 0)} = ${amp(I)}.` },
        [
          { value: V / (R1 + R2 + R3), why: `This treats all three resistors as if they were in series: ${V} ÷ ${R1 + R2 + R3}.` },
          { value: V / (R1 + (R2 + R3) / 2), why: `This uses ${fixed((R2 + R3) / 2, 1)} Ω, the average of R2 and R3, for the parallel pair.` },
          { value: V / Rp, why: `This divides the battery voltage by the parallel pair alone and leaves out R1.` },
        ],
        amp,
      ),
      explanation: `Replace R2 and R3 by their combined resistance, ${ohm(Rp)}. It is in series with R1, so the total is ${R1} + ${fixed(Rp, 0)} = ${fixed(Rtotal, 0)} Ω. Ohm's law: I = ${V} ÷ ${fixed(Rtotal, 0)} = ${amp(I)}.`,
    },
    {
      type: 'S', level: 2,
      stem: 'Which statement is true for any two resistors connected in parallel?',
      options: [
        { text: 'The larger resistor carries the larger current.', why: 'Both have the same voltage across them, so by I = V ÷ R the larger resistor carries the smaller current.' },
        { text: 'Their combined resistance is half the sum of the two.', why: 'That is their average. The combined resistance is smaller than the smaller of the two, so it is below the average.' },
        { text: 'The same current flows through each of them.', why: 'That holds for resistors in series. In parallel the currents are equal only if the resistances are.' },
        { text: 'Their combined resistance is smaller than the smaller of the two.', correct: true, why: 'Each branch is an extra path for the current, as the fourth paragraph says.' },
      ],
      explanation: `The fourth paragraph states that the combined resistance of a parallel group is always smaller than its smallest resistance. In Figure 1: ${ohm(Rp)} against ${R3} Ω and ${R2} Ω.`,
    },
    {
      type: 'D', level: 3,
      stem: 'R3 is taken out of the circuit in Figure 1, leaving its branch open, so no current can flow through it. Everything else stays the same, and the battery keeps its voltage. What happens to the voltage across R2?',
      options: [
        { text: 'It falls to zero.', why: 'R2 is still connected to the battery through R1, so current still flows through it.' },
        { text: 'It falls.', why: `The total resistance rises, which lowers the current and so the voltage across R1. The battery voltage is fixed, so more of it is left for R2.` },
        { text: 'It stays the same.', why: `Branches in parallel share one voltage, but that voltage is what the battery leaves after R1, and it changes when the current changes.` },
        { text: 'It rises.', correct: true, why: `The total resistance rises from ${fixed(Rtotal, 0)} to ${R1 + R2} Ω, so the current falls and R1 takes less of the voltage; more is left for R2, which rises from ${volt(Vp)} to ${volt(V2after)}.` },
      ],
      explanation: `Without R3 the circuit is R1 and R2 in series: ${R1} + ${R2} = ${R1 + R2} Ω instead of ${fixed(Rtotal, 0)} Ω. The current falls from ${amp(I)} to ${amp(Iafter)}, so the voltage across R1 falls from ${volt(V1)} to ${volt(Iafter * R1)}. The rest of the ${V} V, ${volt(V2after)}, is now across R2, up from ${volt(Vp)}.`,
    },
    {
      type: 'T', level: 3,
      stem: 'What power is converted into heat in R3 in Figure 1?',
      options: numericOptions(
        { value: P3, why: `R3 has ${volt(Vp)} across it and carries ${amp(I3)}: ${volt(Vp)} × ${amp(I3)}.` },
        [
          { value: Vp * I, why: `This multiplies the voltage across R3 by the whole current, ${amp(I)}. Only ${amp(I3)} of it flows through R3.` },
          { value: I3 * R3, why: `This is I × R for R3, which is its voltage in volts, not its power.` },
          { value: V ** 2 / R3, why: `This puts the full ${V} V of the battery across R3. R1 takes ${volt(V1)} of it.` },
        ],
        watt,
      ),
      explanation: `The current is ${amp(I)} (total resistance ${fixed(Rtotal, 0)} Ω). The voltage across the parallel pair is ${amp(I)} × ${ohm(Rp)} = ${volt(Vp)}, so the current through R3 is ${volt(Vp)} ÷ ${R3} Ω = ${amp(I3)}. P = V × I = ${volt(Vp)} × ${amp(I3)} = ${watt(P3)}.`,
    },
  ],
};

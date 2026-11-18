// Mock 3, passage 4. Area: engineering. Subject: meshing gears, gear ratios, speed, direction and torque.
import { numericOptions, p, whole } from '../lib.mjs';

// ---------- Figure 1: three meshing external spur gears A -> B -> C ----------
const nA = 15;
const nB = 30;
const nC = 45;
const speedA = 360; // rev/min, clockwise
const torqueA = 18; // N·m

const onFigure = [nA, nB, nC, speedA, torqueA];
if (new Set(onFigure).size !== onFigure.length) throw new Error('every number on Figure 1 must be different');

// Simple train with B as idler: overall ratio is nC / nA.
const ratioAB = nB / nA;
const ratioBC = nC / nB;
const ratioAC = nC / nA;
if (Math.abs(ratioAB * ratioBC - ratioAC) > 1e-9) throw new Error('idler tooth count must cancel');

const speedB = speedA / ratioAB;
const speedC = speedA / ratioAC;
const wrong3OnlyBC = speedA * (nB / nC);
const wrong3Inverted = speedA * ratioAC;

const torqueC = torqueA * ratioAC;
const wrong4Divided = torqueA / ratioAC;
const wrong4AtB = torqueA * ratioAB;
const wrong4AddedTeeth = torqueA * ((nB + nC) / nA);

if ([speedC, torqueC].some((v) => onFigure.includes(v)) || speedC === torqueC) {
  throw new Error('answers must not repeat a figure value or each other');
}

// Question 5: replacing idler B (30 teeth) with a 60-tooth idler.
const nB2 = 60;
if ((nB2 / nA) * (nC / nB2) !== ratioAC) throw new Error('new idler must leave overall ratio unchanged');

// Question 6: two-stage compound gearbox (two gears fixed on the intermediate shaft).
const comp = { inSpeed: 1344, n1: 16, n2: 48, n3: 24, n4: 96 };
const rStage1 = comp.n2 / comp.n1;
const rStage2 = comp.n4 / comp.n3;
const rCompound = rStage1 * rStage2;
const ans6 = comp.inSpeed / rCompound;
const wrong6DivToothCount = comp.inSpeed / comp.n2;
const wrong6AddStages = comp.inSpeed / (rStage1 + rStage2);
const wrong6AsIdler = comp.inSpeed / (comp.n4 / comp.n1);
if (![ans6, wrong6DivToothCount, wrong6AddStages, wrong6AsIdler].every(Number.isInteger)) {
  throw new Error('question 6 expects exact integer speeds');
}
if ([comp.inSpeed, comp.n1, comp.n2, comp.n3, comp.n4, ans6].some((v) => onFigure.includes(v))) {
  throw new Error('question 6 numbers must stay distinct from Figure 1');
}

const rpm = (v) => `${whole(v)} rev/min`;
const nm = (v) => `${whole(v)} N·m`;

// ---------- Figure 1: pitch circles tangent in exact 1 : 2 : 3 tooth-count proportion ----------
const scale = 1.65; // px per tooth
const rA = nA * scale;
const rB = nB * scale;
const rC = nC * scale;
const cy = 108;
const cxA = 74;
const cxB = cxA + rA + rB;
const cxC = cxB + rB + rC;
const r1 = (x) => Math.round(x * 10) / 10;

const figure1 = `<svg viewBox="0 0 460 226" role="img" aria-labelledby="p30-fig1-alt">
  <circle class="part" cx="${r1(cxA)}" cy="${cy}" r="${r1(rA)}"/>
  <circle class="part" cx="${r1(cxB)}" cy="${cy}" r="${r1(rB)}"/>
  <circle class="part" cx="${r1(cxC)}" cy="${cy}" r="${r1(rC)}"/>
  <circle class="dot" cx="${r1(cxA)}" cy="${cy}" r="4"/>
  <circle class="dot" cx="${r1(cxB)}" cy="${cy}" r="4"/>
  <circle class="dot" cx="${r1(cxC)}" cy="${cy}" r="4"/>
  <path class="wire" d="M ${r1(cxA - 18)} ${r1(cy - rA - 14)} Q ${r1(cxA)} ${r1(cy - rA - 26)}, ${r1(cxA + 18)} ${r1(cy - rA - 14)}"/>
  <polygon class="dot" points="${r1(cxA + 21)},${r1(cy - rA - 11)} ${r1(cxA + 11)},${r1(cy - rA - 12)} ${r1(cxA + 17)},${r1(cy - rA - 20)}"/>
  <text x="${r1(cxA)}" y="26" text-anchor="middle">Clockwise</text>
  <text class="prob" x="${r1(cxA)}" y="${r1(cy + rA + 24)}" text-anchor="middle">Gear A</text>
  <text x="${r1(cxA)}" y="${r1(cy + rA + 45)}" text-anchor="middle">${nA} teeth</text>
  <text x="${r1(cxA)}" y="${r1(cy + rA + 66)}" text-anchor="middle">${rpm(speedA)}, ${nm(torqueA)}</text>
  <text class="prob" x="${r1(cxB)}" y="${r1(cy - rB - 12)}" text-anchor="middle">Gear B (${nB} teeth)</text>
  <text class="prob" x="${r1(cxC)}" y="${r1(cy - rC - 10)}" text-anchor="middle">Gear C (${nC} teeth)</text>
</svg>`;

export default {
  id: 'p30',
  set: 'mock',
  mock: 3,
  area: 'engineering',
  title: 'Gear Ratios, Speed and Torque',
  facts: [
    { claim: 'Meshing spur gears roll on their pitch circles without slipping and share the same circular pitch, so pitch radii are in the same ratio as tooth counts: r_out ÷ r_in = N_out ÷ N_in.', source: 'https://en.wikipedia.org/wiki/Gear_train', read: '2026-11-18' },
    { claim: 'Gear ratio (mechanical advantage) R = N_out ÷ N_in = ω_in ÷ ω_out, so rotational speed is inversely proportional to tooth count.', source: 'https://phys.libretexts.org/Courses/Prince_Georges_Community_College/General_Physics_I%3A_Classical_Mechanics/25%3A_Simple_Machines/25.06%3A_Gears', read: '2026-11-18' },
    { claim: 'Rotational power is P = τ × ω (torque times angular speed); in an ideal gear set with no friction losses, input power equals output power, so τ_out ÷ τ_in = ω_in ÷ ω_out = N_out ÷ N_in.', source: 'https://openstax.org/books/university-physics-volume-1/pages/10-8-work-and-power-for-rotational-motion', read: '2026-11-18' },
    { claim: 'Two external gears that mesh directly turn in opposite directions; an intermediate idler gear reverses the direction again without altering the overall gear ratio N_last ÷ N_first.', source: 'https://en.wikipedia.org/wiki/Gear_train', read: '2026-11-18' },
    { claim: 'In a compound (multi-stage) gear train with two gears of different sizes fixed on the same intermediate shaft, the overall gear ratio is the product of the individual stage ratios.', source: 'https://en.wikipedia.org/wiki/Gear_train', read: '2026-11-18' },
  ],
  blocks: [
    p(
      'Toothed wheels, or gears, transmit rotation from a driving (input) shaft to a driven (output) shaft without slipping.',
      'For two external gears to mesh smoothly, their teeth must have the same spacing around the rim, so each gear’s effective radius is proportional to its number of teeth N.',
      'Where the two rims meet they push each other in the same tangential direction, which makes external gears in direct contact turn in opposite senses: if the input gear turns clockwise, the gear meshing with it turns anticlockwise.',
    ),
    p(
      'Because teeth pass the point of contact one for one, a gear with more teeth completes fewer revolutions in a given time.',
      'With N_in and N_out for the tooth counts of the input and output gears, and ω_in and ω_out for their rotational speeds (measured in revolutions per minute, rev/min, or radians per second, rad/s), the gear ratio R is',
    ),
    { type: 'formula', text: 'R = N_out ÷ N_in = ω_in ÷ ω_out' },
    p(
      'Rearranging gives ω_out = ω_in ÷ R: when a small gear drives a larger gear, R is greater than 1 and rotational speed drops.',
      'Turning effort on a shaft is measured by torque τ, in newton metres (N·m).',
      'Rotational power, in watts (W), is torque times angular speed in rad/s.',
      'In an ideal gear train with negligible friction, all input power reaches the output, so slowing the shaft multiplies its torque by the same ratio R:',
    ),
    { type: 'formula', text: 'τ_out ÷ τ_in = ω_in ÷ ω_out = N_out ÷ N_in' },
    p(
      'When an intermediate gear on its own shaft sits between the input and output gears and meshes with both, without delivering power to its own shaft, it is called an idler gear.',
      'Across the two meshes, R = (N_idler ÷ N_in) × (N_out ÷ N_idler) = N_out ÷ N_in: the idler’s tooth count cancels out, leaving output speed and torque unchanged while reversing the direction a second time so input and output turn the same way.',
      'To multiply ratios instead, a compound gear train fixes two gears of different tooth counts rigidly onto the same intermediate shaft so both turn together; the overall gear ratio is then the product of the stage ratios, R_total = R₁ × R₂.',
      'Figure 1 shows a three-gear train drawn on its effective circles.',
    ),
    {
      type: 'figure',
      id: 'p30-fig1',
      caption: 'Figure 1. Three meshing external gears on separate parallel shafts.',
      alt: `Three tangent circles from left to right. Gear A has ${nA} teeth, turns clockwise at ${rpm(speedA)}, and receives an input torque of ${nm(torqueA)}. Gear B in the middle meshes with A and C and has ${nB} teeth. Gear C on the right meshes with B and has ${nC} teeth.`,
      svg: figure1,
    },
  ],
  questions: [
    {
      type: 'R', level: 1,
      stem: 'According to the text, what happens when a smaller input gear meshes directly with a larger output gear in an ideal two-gear pair?',
      options: [
        { text: 'Both rotational speed and transmitted torque increase at the output gear.', why: 'With power conserved, speed and torque change in opposite proportions, never both upward.' },
        { text: 'Rotational speed increases, transmitted torque decreases, and both gears turn the same way.', why: 'Driving a larger gear reduces speed, increases torque, and reverses the direction of rotation.' },
        { text: 'Rotational speed decreases, transmitted torque increases, and the direction of rotation reverses.', correct: true, why: 'With N_out > N_in, R exceeds 1, dividing speed by R, multiplying torque by R, and reversing the sense of rotation.' },
        { text: 'Rotational speed and transmitted torque stay unchanged while only the direction reverses.', why: 'Speed and torque stay equal only when both gears have the same tooth count (R = 1).' },
      ],
      explanation: 'When N_out is greater than N_in, the gear ratio R = N_out ÷ N_in is greater than 1. The output rotational speed ω_in ÷ R decreases, the output torque τ_in × R increases, and the direct external mesh reverses the direction of rotation.',
    },
    {
      type: 'F', level: 1,
      stem: 'In Figure 1, Gear A turns clockwise. In which directions do Gear B and Gear C turn?',
      options: [
        { text: 'Gear B turns clockwise and Gear C turns anticlockwise.', why: 'Gear B meshes directly with clockwise Gear A, so Gear B must turn anticlockwise.' },
        { text: 'Gear B turns anticlockwise and Gear C turns clockwise.', correct: true, why: 'Each external mesh reverses direction once: clockwise at A becomes anticlockwise at B and clockwise again at C.' },
        { text: 'Both Gear B and Gear C turn anticlockwise.', why: 'Gear C meshes externally with anticlockwise Gear B, reversing the rotation back to clockwise.' },
        { text: 'Both Gear B and Gear C turn clockwise.', why: 'Two external gears that mesh directly always turn in opposite directions.' },
      ],
      explanation: 'Every direct mesh between two external gears reverses the sense of rotation. Clockwise Gear A drives Gear B anticlockwise, and anticlockwise Gear B drives Gear C clockwise.',
    },
    {
      type: 'A', level: 2,
      stem: 'What is the rotational speed of Gear C in Figure 1?',
      options: numericOptions(
        { value: speedC, why: `Gear B is an idler, so R = ${nC} ÷ ${nA} = ${ratioAC} and ω_C = ${speedA} ÷ ${ratioAC} = ${whole(speedC)} rev/min.` },
        [
          { value: speedB, why: `This is the speed of Gear B, ${speedA} × (${nA} ÷ ${nB}) = ${whole(speedB)} rev/min, stopping after the first mesh.` },
          { value: wrong3OnlyBC, why: `This applies only the second mesh ratio (${nB} ÷ ${nC}) directly to ${speedA} rev/min, as if Gear B turned at ${speedA} rev/min.` },
          { value: wrong3Inverted, why: `This multiplies ${speedA} rev/min by the gear ratio ${ratioAC} instead of dividing by it.` },
        ],
        rpm,
      ),
      explanation: `Across the two meshes, ω_B = ${speedA} × (${nA} ÷ ${nB}) = ${whole(speedB)} rev/min and ω_C = ${whole(speedB)} × (${nB} ÷ ${nC}) = ${rpm(speedC)}. Equivalently, Gear B's ${nB} teeth cancel out, giving ${speedA} × (${nA} ÷ ${nC}) = ${rpm(speedC)}.`,
    },
    {
      type: 'A', level: 2,
      stem: 'Assuming negligible friction and that no power is taken from Gear B’s shaft, what torque is delivered to Gear C’s shaft in Figure 1?',
      options: numericOptions(
        { value: torqueC, why: `The overall gear ratio from A to C is ${nC} ÷ ${nA} = ${ratioAC}, so τ_C = ${torqueA} × ${ratioAC} = ${whole(torqueC)} N·m.` },
        [
          { value: wrong4Divided, why: `This divides ${nm(torqueA)} by ${ratioAC}, treating torque as if it fell with tooth count like rotational speed.` },
          { value: wrong4AtB, why: `This computes ${torqueA} × (${nB} ÷ ${nA}) = ${nm(wrong4AtB)}, the torque at Gear B rather than at Gear C.` },
          { value: wrong4AddedTeeth, why: `This adds the tooth counts of B and C, computing ${torqueA} × ((${nB} + ${nC}) ÷ ${nA}) instead of cancelling the idler.` },
        ],
        nm,
      ),
      explanation: `With no friction and no power drawn from Gear B, Gear B acts as an idler and the overall gear ratio is N_C ÷ N_A = ${nC} ÷ ${nA} = ${ratioAC}. Transmitted torque scales with the gear ratio: τ_C = ${torqueA} × ${ratioAC} = ${nm(torqueC)}.`,
    },
    {
      type: 'D', level: 2,
      stem: `Suppose Gear B (${nB} teeth) in Figure 1 is replaced by a ${nB2}-tooth gear on a repositioned middle shaft so that A still meshes with B and B still meshes with C, while Gear A keeps the same speed and torque. What changes at Gear C?`,
      options: [
        { text: 'Gear C’s rotational speed halves and its transmitted torque doubles.', why: `Gear B is an idler: (${nB2} ÷ ${nA}) × (${nC} ÷ ${nB2}) still equals ${nC} ÷ ${nA} = ${ratioAC}.` },
        { text: 'Gear C’s rotational speed doubles and its transmitted torque halves.', why: `Only Gear B’s own rotational speed changes; the ratio between A and C stays ${nC} ÷ ${nA}.` },
        { text: 'Gear C keeps the same speed and torque, and reverses its direction of rotation.', why: 'There are still two external meshes between A and C, so Gear C still turns clockwise.' },
        { text: 'Neither Gear C’s rotational speed, nor its torque, nor its direction of rotation changes.', correct: true, why: `The idler’s tooth count ${nB2} cancels out of the overall ratio ${nC} ÷ ${nA}, and one idler still gives two reversals.` },
      ],
      explanation: `Replacing one idler gear with another of ${nB2} teeth changes Gear B's speed, while (${nB2} ÷ ${nA}) × (${nC} ÷ ${nB2}) = ${nC} ÷ ${nA} = ${ratioAC} leaves Gear C's speed, torque and clockwise direction unchanged.`,
    },
    {
      type: 'T', level: 3,
      stem: `In a two-stage compound gearbox, a motor drives a ${comp.n1}-tooth input gear at ${rpm(comp.inSpeed)}. That gear meshes with a ${comp.n2}-tooth gear fixed to an intermediate shaft. A second gear of ${comp.n3} teeth fixed rigidly to that same intermediate shaft meshes with a ${comp.n4}-tooth gear on the output shaft. What is the rotational speed of the output shaft?`,
      options: numericOptions(
        { value: ans6, why: `Stage 1 has ratio ${comp.n2} ÷ ${comp.n1} = ${rStage1} and stage 2 has ratio ${comp.n4} ÷ ${comp.n3} = ${rStage2}; R_total = ${rStage1} × ${rStage2} = ${rCompound}, giving ${whole(comp.inSpeed)} ÷ ${rCompound} = ${whole(ans6)} rev/min.` },
        [
          { value: wrong6DivToothCount, why: `This divides ${whole(comp.inSpeed)} by the tooth count ${comp.n2} instead of the stage tooth ratio.` },
          { value: wrong6AddStages, why: `This adds the two stage ratios (${rStage1} + ${rStage2} = ${rStage1 + rStage2}) instead of multiplying them.` },
          { value: wrong6AsIdler, why: `This computes ${whole(comp.inSpeed)} ÷ (${comp.n4} ÷ ${comp.n1}), treating the two-gear intermediate shaft as if it were a single idler gear.` },
        ],
        rpm,
      ),
      explanation: `Stage 1 slows the intermediate shaft to ${whole(comp.inSpeed)} ÷ (${comp.n2} ÷ ${comp.n1}) = ${whole(comp.inSpeed)} ÷ ${rStage1} = ${whole(comp.inSpeed / rStage1)} rev/min. Because the ${comp.n3}-tooth gear is fixed to that same shaft, it also turns at ${whole(comp.inSpeed / rStage1)} rev/min and drives the ${comp.n4}-tooth output gear at ${whole(comp.inSpeed / rStage1)} ÷ (${comp.n4} ÷ ${comp.n3}) = ${whole(comp.inSpeed / rStage1)} ÷ ${rStage2} = ${rpm(ans6)}.`,
    },
    {
      type: 'S', level: 3,
      stem: 'An ideal simple gear train consists of k external gears G₁, G₂, …, Gₖ (with k ≥ 2), each on its own shaft and meshing directly with the next gear in line. Power enters only at G₁ and leaves only at Gₖ. Which statement must be true?',
      options: [
        { text: 'Gₖ turns in the same direction as G₁ whenever the total number of gears k is even.', why: 'A chain of k gears has k − 1 meshes; when k is even, k − 1 is odd, so Gₖ turns opposite to G₁ (as for k = 2).' },
        { text: 'The output torque on Gₖ equals the input torque on G₁ whenever every gear in the chain has a different tooth count.', why: 'Output torque equals τ₁ × (Nₖ ÷ N₁), which equals τ₁ only when G₁ and Gₖ have the same tooth count.' },
        { text: 'Putting the gear with the most teeth in the middle of the chain increases the torque on Gₖ without changing Gₖ’s speed.', why: 'Every intermediate gear G₂ to Gₖ₋₁ is an idler whose tooth count cancels out of both the speed ratio and the torque ratio.' },
        { text: 'Gₖ turns in the same direction as G₁ when k is odd, and the torque ratio τₖ ÷ τ₁ depends only on the tooth counts of G₁ and Gₖ.', correct: true, why: 'With k odd there are an even number k − 1 of direction reversals, and every intermediate tooth count cancels in the product of ratios.' },
      ],
      explanation: 'Between k gears in a single line there are k − 1 external meshes, each reversing the direction once. An even number of reversals restores the original direction, which happens when k − 1 is even, that is, when k is odd (such as k = 3 in Figure 1). Multiplying the mesh ratios telescopes every intermediate tooth count, leaving R = Nₖ ÷ N₁ for both speed and torque.',
    },
  ],
};

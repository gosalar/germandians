// Practice set, engineering. Subject: levers, torque and mechanical advantage.
import { fixed, numericOptions, p, whole } from '../lib.mjs';

// ---------- the lever in Figure 1 (a first-class lever; the bar's own weight is ignored) ----------
const load = 1200; // N
const loadArm = 0.4; // m
const effortArm = 1.6; // m
const effort = (load * loadArm) / effortArm;
const ma = load / effort;
if (Math.abs(ma - effortArm / loadArm) > 1e-9) throw new Error('MA must equal the ratio of the arms');
const onFigure = [load, loadArm, effortArm];
if (new Set(onFigure).size !== onFigure.length) throw new Error('every number on Figure 1 must be different');

// Question 4: the effort applied twice as far from the pivot.
const effortFar = (load * loadArm) / (2 * effortArm);

// Question 6: how far the effort end moves.
const lift = 5; // cm
const effortMove = lift * (effortArm / loadArm);

// Question 7: a seesaw.
const child = { weight: 360, arm: 1.5 };
const heavy = 450;
if (child.weight * child.arm === heavy) throw new Error('question 7: the torque must not equal the second weight');
const heavyArm = (child.weight * child.arm) / heavy;
if ([effort, load].includes(child.weight) || [effort, load].includes(heavy)) throw new Error('question 7 must not print an answer from another question');

const N = (v) => `${whole(v)} N`;
const m = (v) => `${Number(fixed(v, 2))} m`;
const cm = (v) => `${Number(fixed(v, 2))} cm`;

// ---------- Figure 1 ----------
const scale = 190; // px per metre
const x0 = 40;
const pivotX = x0 + loadArm * scale;
const effortX = pivotX + effortArm * scale;
const arrow = (x, y1, y2) => `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2 - 10}" style="stroke-width:3"/><polygon class="dot" points="${x - 7},${y2 - 12} ${x + 7},${y2 - 12} ${x},${y2}"/>`;
const figure1 = `<svg viewBox="0 0 460 225" role="img" aria-labelledby="p13-fig1-alt">
  <rect class="part" x="${x0 - 6}" y="96" width="${effortX - x0 + 12}" height="10"/>
  <polygon class="part" points="${pivotX},106 ${pivotX - 18},146 ${pivotX + 18},146"/>
  <line x1="${pivotX - 40}" y1="146" x2="${pivotX + 40}" y2="146"/>
  ${arrow(x0, 34, 95)}
  ${arrow(effortX, 34, 95)}
  <text class="big" x="${x0 - 4}" y="24">Load ${N(load)}</text>
  <text class="big" x="${effortX + 4}" y="24" text-anchor="end">Effort F</text>
  <text class="big" x="${pivotX + 26}" y="140">Pivot</text>
  <line x1="${x0}" y1="176" x2="${x0}" y2="190"/><line x1="${pivotX}" y1="176" x2="${pivotX}" y2="190"/><line x1="${effortX}" y1="176" x2="${effortX}" y2="190"/>
  <line x1="${x0}" y1="183" x2="${effortX}" y2="183"/>
  <text class="big" x="${(x0 + pivotX) / 2}" y="214" text-anchor="middle">${m(loadArm)}</text>
  <text class="big" x="${(pivotX + effortX) / 2}" y="214" text-anchor="middle">${m(effortArm)}</text>
</svg>`;

export default {
  id: 'p13',
  set: 'practice',
  area: 'engineering',
  title: 'Levers and Mechanical Advantage',
  facts: [
    { claim: 'Torque τ = rF sin θ: the force times the perpendicular lever arm from the pivot; unit newton metre.', source: 'https://openstax.org/books/college-physics-2e/pages/9-2-the-second-condition-for-equilibrium', read: '2026-11-16' },
    { claim: 'For rotational equilibrium the net torque is zero: counterclockwise and clockwise torques balance.', source: 'https://openstax.org/books/college-physics-2e/pages/9-2-the-second-condition-for-equilibrium', read: '2026-11-16' },
    { claim: 'Mechanical advantage MA = output force ÷ input force; for a lever without friction MA = l_i ÷ l_o, the input arm over the output arm.', source: 'https://openstax.org/books/college-physics-2e/pages/9-5-simple-machines', read: '2026-11-16' },
    { claim: 'A simple machine cannot do more work than the energy put into it; a gain in force comes at the expense of the distance through which the input force acts.', source: 'https://openstax.org/books/college-physics-2e/pages/9-5-simple-machines', read: '2026-11-16' },
    { claim: 'Lever classes: first class, fulcrum between effort and load (seesaw, crowbar); second class, load between fulcrum and effort (wheelbarrow, nutcracker); third class, effort between fulcrum and load (tweezers). Effort is the input force, load the output force.', source: 'https://en.wikipedia.org/wiki/Lever', read: '2026-11-16' },
  ],
  blocks: [
    p(
      'A lever is a rigid bar that can turn about a fixed point, the pivot.',
      'A force applied at one point, the effort, makes the bar push or lift at another point, against the load.',
      'Many levers let people move heavy things with small forces.',
      'A crowbar, a wheelbarrow and a pair of tweezers are all levers, though not every lever reduces the force needed.',
    ),
    p(
      'How strongly a force turns the bar is measured by its torque, also called its moment:',
    ),
    { type: 'formula', text: 'torque = force × distance from the pivot' },
    p(
      'Here the distance is measured at right angles to the force, from the pivot to the line along which the force acts.',
      'Force is measured in newtons (N) and torque in newton metres (N·m).',
      'A force tends to turn the bar either clockwise or anticlockwise.',
      'The bar is balanced, and does not start to turn, when the clockwise torques add up to the same total as the anticlockwise ones.',
      'So a small force far from the pivot can balance a large force close to it.',
    ),
    p(
      'The mechanical advantage of a lever is the load divided by the effort that balances it.',
      'For a balanced lever whose forces act at right angles to the bar, it equals the effort arm divided by the load arm, where each arm is the distance from the pivot to that force:',
    ),
    { type: 'formula', text: 'mechanical advantage = load ÷ effort = effort arm ÷ load arm' },
    p(
      'Levers come in three classes.',
      'In a first-class lever the pivot lies between the effort and the load, as in a seesaw or a crowbar.',
      'In a second-class lever the load lies between the pivot and the effort, as in a wheelbarrow or a nutcracker.',
      'In a third-class lever the effort lies between the pivot and the load, as in tweezers; its mechanical advantage is less than 1, but the load end moves farther and faster than the hand.',
    ),
    p(
      'A lever does not create energy.',
      'When a lever with a mechanical advantage greater than 1 turns, the effort end moves through a larger distance than the load end; for a straight bar the two distances are in the same ratio as the arms.',
      'Figure 1 shows a bar used to lift a heavy stone. Its own weight can be ignored, and both forces act straight down, at right angles to the bar.',
    ),
    {
      type: 'figure',
      id: 'p13-fig1',
      caption: 'Figure 1. A bar resting on a pivot, used to lift a stone.',
      alt: `A horizontal bar on a pivot. At the left end the stone presses down with a load of ${N(load)}, ${m(loadArm)} from the pivot. At the right end, ${m(effortArm)} from the pivot on the other side, a downward effort F is applied.`,
      svg: figure1,
    },
  ],
  questions: [
    {
      type: 'R', level: 1,
      stem: 'According to the text, what is the torque of a force about the pivot?',
      options: [
        { text: 'The force times its distance from the pivot, measured at right angles to the force.', correct: true, why: 'This is the formula and the definition of the distance in the second and third paragraphs.' },
        { text: 'The force divided by its distance from the pivot, measured along the bar.', why: 'Torque grows with the distance: a force far from the pivot turns the bar more strongly.' },
        { text: 'The load divided by the effort that balances the bar.', why: 'That is the mechanical advantage.' },
        { text: 'The distance through which the force moves the end of the bar.', why: 'That is a distance, measured in metres. Torque is measured in newton metres.' },
      ],
      explanation: 'The second and third paragraphs define torque as force × distance from the pivot, where the distance is measured at right angles to the force. Its unit is the newton metre.',
    },
    {
      type: 'F', level: 1,
      stem: 'What class of lever does Figure 1 show?',
      options: [
        { text: 'A second-class lever.', why: 'In a second-class lever the load lies between the pivot and the effort. In Figure 1 the load is at one end.' },
        { text: 'A first-class lever.', correct: true, why: 'The pivot lies between the load (left end) and the effort (right end).' },
        { text: 'A third-class lever.', why: 'In a third-class lever the effort lies between the pivot and the load. In Figure 1 the effort is at one end.' },
        { text: 'None of the three classes.', why: 'The classes depend only on the order of pivot, effort and load along the bar, not on the direction of the forces.' },
      ],
      explanation: 'In Figure 1 the order along the bar is load, pivot, effort: the pivot lies between the two forces, which the text calls a first-class lever, like a seesaw or a crowbar.',
    },
    {
      type: 'A', level: 2,
      stem: 'What effort F balances the lever in Figure 1?',
      options: numericOptions(
        { value: effort, why: `${N(load)} × ${m(loadArm)} = F × ${m(effortArm)}.` },
        [
          { value: load * loadArm, why: `This is the torque of the load, ${whole(load * loadArm)} N·m, not a force. It still has to be divided by the effort arm.` },
          { value: load, why: 'This would balance only if both arms were equal. The effort acts four times as far from the pivot.' },
          { value: (load * effortArm) / loadArm, why: 'This swaps the arms: it multiplies the load by the long arm and divides by the short one.' },
        ],
        N,
      ),
      explanation: `For balance the anticlockwise torque of the load equals the clockwise torque of the effort: ${whole(load)} × ${fixed(loadArm, 1)} = F × ${fixed(effortArm, 1)}, so F = ${whole(load * loadArm)} ÷ ${fixed(effortArm, 1)} = ${N(effort)}. The mechanical advantage is ${whole(load)} ÷ ${whole(effort)} = ${ma}, the same as ${fixed(effortArm, 1)} ÷ ${fixed(loadArm, 1)}.`,
    },
    {
      type: 'D', level: 2,
      stem: 'The bar in Figure 1 is replaced by a longer one, so that the effort acts twice as far from the pivot as before. The load and its distance from the pivot stay the same. What happens to the effort needed to balance the stone?',
      options: [
        { text: 'It doubles.', why: 'A longer effort arm gives the effort more torque, so less force is needed, not more.' },
        { text: 'It stays the same.', why: 'The torque of the effort grows with its distance from the pivot, so the same torque needs less force.' },
        { text: 'It falls to a quarter.', why: 'The torque is force × distance, both to the first power: doubling the distance halves the force needed.' },
        { text: 'It halves.', correct: true, why: `The load's torque stays the same; with twice the distance, half the force gives it: ${N(effortFar)} instead of ${N(effort)}.` },
      ],
      explanation: `The effort must supply the load's torque, ${whole(load * loadArm)} N·m. Torque = force × distance, so at twice the distance half the force is enough: ${whole(load * loadArm)} ÷ ${fixed(2 * effortArm, 1)} = ${N(effortFar)}.`,
    },
    {
      type: 'C', level: 1,
      stem: 'Which of these is a second-class lever?',
      options: [
        { text: 'A seesaw.', why: 'The pivot is in the middle, between the two forces: a first-class lever.' },
        { text: 'Tweezers.', why: 'The fingers press between the joined end and the tips that grip: the effort is in the middle, a third-class lever.' },
        { text: 'A wheelbarrow.', correct: true, why: 'The wheel is the pivot, the load sits in the middle, and the hands lift at the far end.' },
        { text: 'A crowbar.', why: 'The bar rests on a point between the hands and the object it moves: a first-class lever.' },
      ],
      explanation: 'In a second-class lever the load lies between the pivot and the effort. In a wheelbarrow the pivot is the wheel, the load is in the barrow, and the effort is applied at the handles, farther from the wheel than the load.',
    },
    {
      type: 'T', level: 2,
      stem: `The stone in Figure 1 is to be lifted by ${cm(lift)}. How far must the effort end of the bar move down?`,
      options: numericOptions(
        { value: effortMove, why: `The effort arm is ${effortArm / loadArm} times the load arm, so the effort end moves ${effortArm / loadArm} times as far.` },
        [
          { value: lift * (loadArm / effortArm), why: 'This divides by the ratio of the arms. The end with the longer arm moves farther, not less far.' },
          { value: lift, why: 'Both ends would move equally only if the arms were equal.' },
          { value: lift * (effortArm / loadArm) ** 2, why: 'This applies the ratio of the arms twice. The distances are in the same ratio as the arms, once.' },
        ],
        cm,
      ),
      explanation: `For a straight bar the distances moved are in the same ratio as the arms: ${fixed(effortArm, 1)} ÷ ${fixed(loadArm, 1)} = ${effortArm / loadArm}, so the effort end moves ${effortArm / loadArm} × ${cm(lift)} = ${cm(effortMove)}. The effort is a quarter of the load but moves four times as far, so the work done is the same at both ends.`,
    },
    {
      type: 'A', level: 3,
      stem: `On a seesaw, a child weighing ${N(child.weight)} sits ${m(child.arm)} from the pivot. How far from the pivot, on the other side, must a child weighing ${N(heavy)} sit to balance the seesaw? Ignore the weight of the seesaw itself.`,
      options: numericOptions(
        { value: heavyArm, why: `${whole(child.weight)} × ${fixed(child.arm, 1)} = ${whole(heavy)} × d.` },
        [
          { value: child.weight / heavy, why: `This is the ratio of the weights, ${whole(child.weight)} ÷ ${whole(heavy)}, without the distance of ${m(child.arm)}.` },
          { value: child.arm, why: 'The same distance would balance only two equal weights.' },
          { value: (heavy * child.arm) / child.weight, why: 'This puts the heavier child farther out, which would tip the seesaw towards that child.' },
        ],
        m,
      ),
      explanation: `The torques must be equal: ${whole(child.weight)} × ${fixed(child.arm, 1)} = ${whole(child.weight * child.arm)} N·m = ${whole(heavy)} × d, so d = ${whole(child.weight * child.arm)} ÷ ${whole(heavy)} = ${m(heavyArm)}. The heavier child sits closer to the pivot.`,
    },
  ],
};

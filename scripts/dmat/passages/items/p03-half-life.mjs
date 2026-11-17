// Full mock, passage 3. Area: natural sciences. Subject: radioactive decay and half-life.
import { curve, fixed, graph, numericOptions, p, percent, whole } from '../lib.mjs';

// ---------- the sample in Figure 1 ----------
const a0 = 1600; // becquerel at the start
const half = 3; // hours
const activity = (t, start = a0, h = half) => start * 0.5 ** (t / h);
const span = 12; // hours shown
const shown = [0, 3, 6, 9, 12].map((t) => activity(t));
if (new Set(shown).size !== shown.length) throw new Error('the values the figure passes through must differ');

// Question 2: a time that is not a whole number of half-lives, to show the reading 1.5 h is wrong.
const early = half / 2;

// Question 3: beyond the end of the graph.
const later = 15;
const afterLater = activity(later);
if (later <= span || later % half !== 0) throw new Error('question 3 needs a whole number of half-lives beyond the graph');

// Question 4: share of the nuclei decayed after 9 hours (activity is proportional to the number of nuclei).
const t4 = 9;
const decayed = (t) => 1 - 0.5 ** (t / half);

// Question 5: an isotope with twice the half-life, same starting activity.
const longer = 2 * half;
const ratio5 = activity(span, a0, longer) / activity(span);
if (ratio5 !== 4) throw new Error('question 5 options are written for a ratio of four');

// Question 6: find a half-life from two measurements.
const m0 = 2000;
const m1 = 250;
const minutes = 36;
const halvings = Math.log2(m0 / m1);
if (!Number.isInteger(halvings)) throw new Error('question 6 needs a whole number of halvings');
const found = minutes / halvings;

// Question 7: working backwards from the activity needed at the time of use to the activity when sent.
const needed = 150; // becquerel at the time of use
const hSent = 8; // hours
const trip = 32; // hours between sending and use
const halvings7 = trip / hSent;
const sent = needed * 2 ** halvings7;
if (!Number.isInteger(halvings7) || halvings7 < 3) throw new Error('question 7 needs a whole number of half-lives, at least three');
const values7 = [sent, needed * halvings7, needed * 2 ** (halvings7 - 1), needed * 2];
if (values7.some((v) => shown.includes(v) || [needed, m0, m1].includes(v))) throw new Error('question 7: no option may repeat a number from the figure or another question');

const figure1 = graph({
  id: 'p03-fig1',
  x: { min: 0, max: span, grid: 1, label: 1, title: 'Time in hours' },
  y: { min: 0, max: a0, grid: 200, label: 400, title: 'Activity in Bq', format: whole },
  body: ({ px, py }) => `<polyline class="curve" points="${curve((t) => activity(t), 0, span, 96, px, py)}"/>`,
});

export default {
  id: 'p03',
  set: 'mock',
  area: 'natural sciences',
  title: 'Radioactive Decay and Half-Life',
  facts: [
    { claim: 'Radioactive decay is random at the level of single atoms: it is impossible to predict when a particular atom will decay.', source: 'https://en.wikipedia.org/wiki/Radioactive_decay', read: '2026-11-16' },
    { claim: 'The half-life is the time in which half of the original radioactive nuclei in a sample decay; after each further half-life, half of the remainder decays.', source: 'https://openstax.org/books/college-physics-2e/pages/31-5-half-life-and-activity', read: '2026-11-16' },
    { claim: 'The number remaining after time t is N(t) = N0 × (1/2)^(t / t½).', source: 'https://en.wikipedia.org/wiki/Half-life', read: '2026-11-16' },
    { claim: 'Half-life is constant over the lifetime of an exponentially decaying quantity; it does not depend on how much is present.', source: 'https://en.wikipedia.org/wiki/Half-life', read: '2026-11-16' },
    { claim: 'Activity is the number of decays per unit time; its SI unit is the becquerel, 1 Bq = 1 decay per second.', source: 'https://openstax.org/books/college-physics-2e/pages/31-5-half-life-and-activity', read: '2026-11-16' },
    { claim: 'Activity R = 0.693 N / t½ is proportional to the number of radioactive nuclei, so it also halves every half-life.', source: 'https://openstax.org/books/college-physics-2e/pages/31-5-half-life-and-activity', read: '2026-11-16' },
    { claim: 'Half-lives vary widely from one nuclide to another.', source: 'https://openstax.org/books/college-physics-2e/pages/31-5-half-life-and-activity', read: '2026-11-16' },
  ],
  blocks: [
    p(
      'The nucleus of a radioactive atom is unstable.',
      'Sooner or later it decays: it gives off radiation and usually becomes a different nucleus.',
      'When one particular nucleus will decay cannot be predicted; it happens at random.',
      'A sample of material, however, holds an enormous number of nuclei, and so many random events together follow a regular pattern.',
    ),
    p(
      'The half-life of a radioactive isotope, written T½, is the time in which half of the radioactive nuclei present in a sample decay.',
      'For a single nucleus it is the time in which it has a 50% chance of decaying; across the many nuclei of a sample, that chance shows up as half of them decaying.',
      'During the next half-life, half of those that are left decay, and so on.',
      'After one half-life half of the nuclei remain, after two a quarter, after three an eighth.',
      'The number of radioactive nuclei left after a time t is',
    ),
    { type: 'formula', text: 'N = N₀ × (1/2)^(t ÷ T½)' },
    p(
      'where N₀ is the number at the start.',
      'The quotient t ÷ T½ counts how many half-lives have passed; it need not be a whole number.',
      'Half-lives differ widely from one isotope to another, but the half-life of a given isotope is fixed: it does not depend on how large the sample is.',
    ),
    p(
      'Nuclei cannot easily be counted, but their decays can.',
      'The activity A of a sample is the number of nuclei that decay per second.',
      'Its unit is the becquerel (Bq): 1 Bq is one decay per second.',
      'The activity is proportional to the number of radioactive nuclei present, so it halves in every half-life too:',
    ),
    { type: 'formula', text: 'A = A₀ × (1/2)^(t ÷ T½)' },
    p(
      'Figure 1 shows how the activity of one sample falls over twelve hours.',
      'The curve falls steeply at first and then more and more slowly, because each half-life removes the same fraction of what is left, not the same amount.',
      'The half-life can be read from such a curve: it is the time the activity takes to fall from any value to half that value.',
    ),
    {
      type: 'figure',
      id: 'p03-fig1',
      caption: 'Figure 1. The activity of a sample of one radioactive isotope over twelve hours.',
      alt: `A falling curve. Activity in becquerel against time in hours. It starts at ${whole(a0)} Bq at 0 hours and passes through ${[3, 6, 9, 12].map((t) => `${whole(activity(t))} Bq at ${t} hours`).join(', ')}. The grid has a line every hour and every 200 Bq.`,
      svg: figure1,
    },
  ],
  questions: [
    {
      type: 'F', level: 1,
      stem: 'According to Figure 1, what is the half-life of this isotope?',
      options: numericOptions(
        { value: half, why: `The activity falls from ${whole(a0)} Bq to ${whole(activity(half))} Bq, half its starting value, in ${half} hours.` },
        [
          { value: early, why: `At ${fixed(early, 1)} hours the activity is still about ${whole(Math.round(activity(early) / 10) * 10)} Bq, more than half of ${whole(a0)} Bq.` },
          { value: 2 * half, why: `By ${2 * half} hours the activity has fallen to ${whole(activity(2 * half))} Bq, a quarter of the start. That is two half-lives.` },
          { value: span, why: `${span} hours is the whole graph. By then the activity has fallen to ${whole(activity(span))} Bq, a sixteenth of the start.` },
        ],
        (v) => `${fixed(v, 1)} hours`,
      ),
      explanation: `Find the time at which the activity is half its starting value: ${whole(activity(half))} Bq is half of ${whole(a0)} Bq, and the curve reaches it at ${half} hours. The same time takes it from ${whole(activity(half))} to ${whole(activity(2 * half))} Bq.`,
    },
    {
      type: 'R', level: 1,
      stem: 'According to the text, what is the half-life of a radioactive isotope?',
      options: [
        { text: 'The time in which half of the radioactive nuclei present in a sample decay.', correct: true, why: 'This is the definition in the second paragraph.' },
        { text: 'Half of the time it takes for every nucleus in a sample to decay.', why: 'Each half-life removes half of what is left, so after two half-lives a quarter of the nuclei still remains. Halving never reaches zero, so there is no fixed time at which every nucleus has gone.' },
        { text: 'The time after which one particular nucleus is certain to have decayed.', why: 'The text says the decay of one particular nucleus happens at random and cannot be predicted.' },
        { text: 'The time in which the activity of a sample falls by a fixed number of becquerels.', why: `The activity falls by a fixed fraction, not a fixed amount: in Figure 1 it drops by ${whole(a0 - activity(3))} Bq in the first three hours and by ${whole(activity(3) - activity(6))} Bq in the next three.` },
      ],
      explanation: 'The second paragraph defines the half-life as the time in which half of the radioactive nuclei present in a sample decay.',
    },
    {
      type: 'A', level: 2,
      stem: `The sample in Figure 1 is measured again ${later} hours after the start. What activity is found?`,
      options: numericOptions(
        { value: afterLater, why: `${later} hours are ${later / half} half-lives, so the activity is ${whole(a0)} × (1/2)^${later / half}.` },
        [
          { value: activity(later + half), why: `This halves the activity ${later / half + 1} times. ${later} ÷ ${half} = ${later / half}.` },
          { value: activity(later - half), why: `This is the activity after ${later - half} hours, one half-life too few.` },
          { value: a0 / (later / half), why: `This divides ${whole(a0)} by ${later / half}, the number of half-lives. Each half-life halves the activity, so it must be divided by 2 that many times.` },
        ],
        (v) => `${whole(v)} Bq`,
      ),
      explanation: `t ÷ T½ = ${later} ÷ ${half} = ${later / half}. A = ${whole(a0)} × (1/2)^${later / half} = ${whole(a0)} ÷ ${2 ** (later / half)} = ${whole(afterLater)} Bq.`,
    },
    {
      type: 'A', level: 2,
      stem: `For the sample in Figure 1, what percentage of the radioactive nuclei present at the start have decayed after ${t4} hours?`,
      options: numericOptions(
        { value: decayed(t4), why: `${t4} hours are ${t4 / half} half-lives, so 1/${2 ** (t4 / half)} of the nuclei remain and the rest have decayed.` },
        [
          { value: 1 - decayed(t4), why: 'This is the share that remains, not the share that has decayed.' },
          { value: decayed(t4 - half), why: `This is the share decayed after ${t4 - half} hours, two half-lives.` },
          { value: decayed(t4 + half), why: `This is the share decayed after ${t4 + half} hours, four half-lives.` },
        ],
        percent,
      ),
      explanation: `The activity is proportional to the number of radioactive nuclei, so the nuclei halve every ${half} hours as the activity does. After ${t4} hours, ${t4 / half} half-lives, 1/${2 ** (t4 / half)} = ${percent(1 - decayed(t4))} remain, so ${percent(decayed(t4))} have decayed. Figure 1 agrees: ${whole(activity(t4))} Bq is 1/${2 ** (t4 / half)} of ${whole(a0)} Bq.`,
    },
    {
      type: 'D', level: 2,
      stem: `A second isotope has a half-life twice as long as the one in Figure 1. A sample of it starts with the same activity as the sample in Figure 1. How does its activity after ${span} hours compare with the activity of the sample in Figure 1 after ${span} hours?`,
      options: [
        { text: 'It is half as large.', why: 'A longer half-life means slower decay, so more activity is left, not less.' },
        { text: 'It is the same.', why: `Both start at ${whole(a0)} Bq, but the second sample halves only every ${longer} hours.` },
        { text: 'It is twice as large.', why: `This assumes the activity is proportional to the half-life. In ${span} hours the first sample halves ${span / half} times and the second ${span / longer} times.` },
        { text: `It is ${['', '', 'twice', 'three times', 'four times'][ratio5]} as large.`, correct: true, why: `${whole(activity(span, a0, longer))} Bq against ${whole(activity(span))} Bq.` },
      ],
      explanation: `In ${span} hours the first sample passes ${span / half} half-lives and falls to ${whole(a0)} ÷ ${2 ** (span / half)} = ${whole(activity(span))} Bq. The second passes ${span / longer} and falls to ${whole(a0)} ÷ ${2 ** (span / longer)} = ${whole(activity(span, a0, longer))} Bq, which is ${ratio5} times as much.`,
    },
    {
      type: 'T', level: 3,
      stem: `The activity of a sample of another isotope falls from ${whole(m0)} Bq to ${whole(m1)} Bq in ${minutes} minutes. What is the half-life of this isotope?`,
      options: numericOptions(
        { value: found, why: `${whole(m0)} → ${whole(m0 / 2)} → ${whole(m0 / 4)} → ${whole(m1)} is ${halvings} halvings in ${minutes} minutes.` },
        [
          { value: minutes / (m0 / m1), why: `This divides ${minutes} minutes by ${m0 / m1}, the factor by which the activity fell. The factor ${m0 / m1} is ${halvings} halvings, so the time is divided by ${halvings}.` },
          { value: minutes / (halvings + 1), why: `This counts ${halvings + 1} halvings. ${whole(m0)} Bq halved ${halvings + 1} times would be ${whole(m0 / 2 ** (halvings + 1))} Bq.` },
          { value: minutes / 2, why: `This assumes the activity halved once in ${minutes} minutes. It fell to 1/${m0 / m1} of its value.` },
        ],
        (v) => `${fixed(v, 1)} minutes`,
      ),
      explanation: `${whole(m1)} Bq is 1/${m0 / m1} of ${whole(m0)} Bq, and ${m0 / m1} = 2^${halvings}, so ${halvings} half-lives have passed: ${whole(m0)} → ${whole(m0 / 2)} → ${whole(m0 / 4)} → ${whole(m1)}. ${minutes} ÷ ${halvings} = ${fixed(found, 1)} minutes.`,
    },
    {
      type: 'T', level: 3,
      stem: `A hospital orders a sample of an isotope whose half-life is ${hSent} hours. The sample is used ${trip} hours after it is sent, and at that moment its activity must be ${whole(needed)} Bq. What activity must the sample have when it is sent?`,
      options: numericOptions(
        { value: sent, why: `${trip} hours are ${halvings7} half-lives, so the activity falls to 1/${2 ** halvings7} of its value on the way. ${whole(needed)} × ${2 ** halvings7} = ${whole(sent)}.` },
        [
          { value: needed * halvings7, why: `This multiplies ${whole(needed)} Bq by ${halvings7}, the number of half-lives. Each half-life halves the activity, so the value at the start is ${whole(needed)} Bq doubled ${halvings7} times.` },
          { value: needed * 2 ** (halvings7 - 1), why: `This doubles ${whole(needed)} Bq ${halvings7 - 1} times, which covers ${(halvings7 - 1) * hSent} hours. In ${trip} hours ${halvings7} half-lives pass.` },
          { value: needed * 2, why: `This doubles ${whole(needed)} Bq once, as if the ${trip} hours were a single half-life. They are ${halvings7} half-lives.` },
        ],
        (v) => `${whole(v)} Bq`,
      ),
      explanation: `t ÷ T½ = ${trip} ÷ ${hSent} = ${halvings7}, so A = A₀ × (1/2)^${halvings7} = A₀ ÷ ${2 ** halvings7}. The activity at the time of use must be ${whole(needed)} Bq, so A₀ = ${whole(needed)} × ${2 ** halvings7} = ${whole(sent)} Bq. Check by halving: ${Array.from({ length: halvings7 + 1 }, (_, i) => whole(sent / 2 ** i)).join(' → ')}.`,
    },
  ],
};

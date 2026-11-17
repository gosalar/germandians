// Practice set, natural sciences. Subject: the pH scale.
import { fixed, numericOptions, p, whole } from '../lib.mjs';

const pH = (h) => Number((-Math.log10(h)).toFixed(6));
const KW_P = 14; // pH + pOH at 25 °C
const sci = (exp) => `1 × 10⁻${String(Math.round(-exp)).split('').map((d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]).join('')}`;

// ---------- Table 1: four solutions at 25 °C ----------
const solutions = [
  { name: 'W', exp: -3 },
  { name: 'X', exp: -9 },
  { name: 'Y', exp: -6 },
  { name: 'Z', exp: -11 },
];
for (const s of solutions) s.h = 10 ** s.exp;
if (new Set(solutions.map((s) => s.exp)).size !== solutions.length) throw new Error('every concentration in Table 1 must differ');
const byAcidity = [...solutions].sort((a, b) => b.h - a.h);
const most = byAcidity[0];

// Question 3: pOH of X.
const X = solutions.find((s) => s.name === 'X');
const pOHx = KW_P - pH(X.h);
if ([pH(X.h), 7].includes(pOHx)) throw new Error('question 3: the answer must differ from the pH and from 7');

// Question 4: W against Y.
const W = solutions.find((s) => s.name === 'W');
const Y = solutions.find((s) => s.name === 'Y');
const ratio4 = W.h / Y.h;

// Question 5: dilution of W.
const taken = 10; // mL
const madeUpTo = 1000; // mL
const diluted = (W.h * taken) / madeUpTo;
const pH5 = pH(diluted);
if (diluted < 100 * 1e-7) throw new Error('question 5: water\'s own ions must stay negligible');

// Question 6: a pOH given.
const pOH6 = 4;
const pH6 = KW_P - pOH6;
if (pH6 === 7) throw new Error('question 6 needs a solution that is not neutral');

// Question 7: doubling the concentration.
const shift7 = Math.log10(2);

const fmt = (v) => `${Number(fixed(v, 3))}`;

export default {
  id: 'p12',
  set: 'practice',
  area: 'natural sciences',
  title: 'The pH Scale',
  facts: [
    { claim: 'pH = −log[H3O+], with the molar concentration; likewise pOH = −log[OH−]; and [H3O+] = 10^−pH.', source: 'https://openstax.org/books/chemistry-2e/pages/14-2-ph-and-poh', read: '2026-11-16' },
    { claim: 'At 25 °C pure water and every neutral solution have [H3O+] = [OH−] = 1.0 × 10^−7 M, pH 7; acidic solutions have pH < 7 and basic solutions pH > 7.', source: 'https://openstax.org/books/chemistry-2e/pages/14-2-ph-and-poh', read: '2026-11-16' },
    { claim: 'At 25 °C Kw = [H3O+][OH−] = 1.0 × 10^−14, so pH + pOH = 14.00.', source: 'https://openstax.org/books/chemistry-2e/pages/14-2-ph-and-poh', read: '2026-11-16' },
    { claim: 'A strong acid ionises completely; a weak acid is only partly ionised, and its percent ionisation typically decreases as its concentration increases, so it rises as the acid is diluted.', source: 'https://openstax.org/books/chemistry-2e/pages/14-3-relative-strengths-of-acids-and-bases', read: '2026-11-16' },
    { claim: 'pH is a logarithmic scale; the range is commonly 0 to 14, but values below 0 or above 14 can occur for very concentrated solutions.', source: 'https://en.wikipedia.org/wiki/PH', read: '2026-11-16' },
  ],
  blocks: [
    p(
      'Water always contains a few hydronium ions, H₃O⁺, and hydroxide ions, OH⁻.',
      'An acid dissolved in water raises the concentration of hydronium ions; a base raises that of hydroxide ions.',
      'Concentrations are measured in moles per litre (mol/L), and the concentration of hydronium ions is written [H₃O⁺].',
    ),
    p(
      'These concentrations span many powers of ten, so chemists describe them with the pH, a logarithmic scale:',
    ),
    { type: 'formula', text: 'pH = −log₁₀ [H₃O⁺], so [H₃O⁺] = 10^(−pH) mol/L' },
    p(
      'For a concentration that is an exact power of ten the pH is simply the exponent without its minus sign: [H₃O⁺] = 1 × 10⁻⁴ mol/L gives a pH of 4.',
      'Because of the minus sign, a higher concentration of hydronium ions means a lower pH.',
      'Because the scale is logarithmic, a solution whose pH is one unit lower has ten times the concentration of hydronium ions, and one whose pH is two units lower has a hundred times as much.',
    ),
    p(
      'At 25 °C, pure water has [H₃O⁺] = [OH⁻] = 1 × 10⁻⁷ mol/L, so its pH is 7.',
      'A solution with pH 7 at this temperature is called neutral: it has as many hydronium as hydroxide ions.',
      'A solution with a pH below 7 is acidic, and one with a pH above 7 is basic.',
      'Most solutions lie between 0 and 14, although very concentrated ones can go beyond.',
    ),
    p(
      'The hydroxide ions are described in the same way by the pOH, −log₁₀ [OH⁻].',
      'In every solution in water at 25 °C the product of the two concentrations is fixed, [H₃O⁺] × [OH⁻] = 1 × 10⁻¹⁴ (mol/L)², so',
    ),
    { type: 'formula', text: 'pH + pOH = 14 (at 25 °C)' },
    p(
      'Even a basic solution therefore contains some hydronium ions, only fewer than hydroxide ions.',
      'A strong acid ionises completely, each molecule giving its hydrogen ion to water, so adding water to it simply spreads the hydronium ions through a larger volume and lowers their concentration in proportion, as long as [H₃O⁺] stays well above the 1 × 10⁻⁷ mol/L of pure water; diluting an acid never makes it basic.',
      'A weak acid behaves differently, because more of it reacts as it is diluted.',
      'Table 1 gives [H₃O⁺] for four solutions at 25 °C.',
    ),
    {
      type: 'table',
      caption: 'Table 1. Concentration of hydronium ions in four solutions at 25 °C.',
      head: ['Solution', '[H₃O⁺] in mol/L'],
      rows: solutions.map((s) => [s.name, sci(s.exp)]),
    },
  ],
  questions: [
    {
      type: 'R', level: 1,
      stem: 'According to the text, what is true of a solution with a pH of 7 at 25 °C?',
      options: [
        { text: 'It contains no hydronium ions.', why: `It contains 1 × 10⁻⁷ mol/L of them, as pure water does. The text says even a basic solution contains some.` },
        { text: 'It is acidic.', why: 'Acidic solutions have a pH below 7.' },
        { text: 'It has as many hydronium ions as hydroxide ions.', correct: true, why: 'This is what the text calls neutral.' },
        { text: 'Its concentration of hydronium ions is 7 mol/L.', why: 'The pH is the exponent without its minus sign: pH 7 means 1 × 10⁻⁷ mol/L.' },
      ],
      explanation: 'The fourth paragraph: at 25 °C a solution with pH 7 is neutral, with as many hydronium as hydroxide ions, 1 × 10⁻⁷ mol/L of each.',
    },
    {
      type: 'F', level: 1,
      stem: 'Which solution in Table 1 is the most acidic?',
      options: solutions.map((s) => ({
        text: `Solution ${s.name}`,
        ...(s === most ? { correct: true } : {}),
        why: s === most
          ? `${sci(s.exp)} mol/L is the highest concentration of hydronium ions in the table, so its pH, ${pH(s.h)}, is the lowest.`
          : `Its pH is ${pH(s.h)}${pH(s.h) > 7 ? ', so it is basic' : `, higher than the ${pH(most.h)} of solution ${most.name}`}. ${sci(s.exp)} is a smaller number than ${sci(most.exp)}.`,
      })),
      explanation: `The most acidic solution has the highest [H₃O⁺], which is the lowest pH. ${sci(most.exp)} mol/L (pH ${pH(most.h)}, solution ${most.name}) is the highest concentration in the table, ${whole(most.h / byAcidity.at(-1).h)} times the lowest (${sci(byAcidity.at(-1).exp)} mol/L, solution ${byAcidity.at(-1).name}). A larger exponent after the minus sign means a smaller number.`,
    },
    {
      type: 'A', level: 2,
      stem: `What is the pOH of solution ${X.name} in Table 1?`,
      options: numericOptions(
        { value: pOHx, why: `The pH of ${X.name} is ${pH(X.h)}, and pH + pOH = ${KW_P}.` },
        [
          { value: pH(X.h), why: `This is the pH of ${X.name}, not its pOH.` },
          { value: KW_P, why: `${KW_P} is what the pH and the pOH add up to, not the pOH itself.` },
          { value: 7, why: 'This is the pH, and the pOH, of a neutral solution. Solution X is not neutral.' },
        ],
        fmt,
      ),
      explanation: `[H₃O⁺] = ${sci(X.exp)} mol/L gives pH ${pH(X.h)}. At 25 °C pH + pOH = ${KW_P}, so pOH = ${KW_P} − ${pH(X.h)} = ${pOHx}.`,
    },
    {
      type: 'D', level: 2,
      stem: `How many times as large is [H₃O⁺] in solution ${W.name} as in solution ${Y.name}?`,
      options: numericOptions(
        { value: ratio4, why: `The pH values differ by ${pH(Y.h) - pH(W.h)} units, and each unit is a factor of ten.` },
        [
          { value: pH(Y.h) / pH(W.h), why: `This divides the pH values, ${pH(Y.h)} ÷ ${pH(W.h)}. The pH is a logarithm, so a difference of pH units is a factor of ten each.` },
          { value: pH(Y.h) - pH(W.h), why: `This is the difference in pH units, not in concentration. Each unit is a factor of ten.` },
          { value: 1 / ratio4, why: `This is the ratio the wrong way round: ${W.name} has the higher concentration.` },
        ],
        (v) => whole(v) === '0' ? fixed(v, 3) : whole(v),
      ),
      explanation: `${W.name} has pH ${pH(W.h)} and ${Y.name} pH ${pH(Y.h)}. A pH ${pH(Y.h) - pH(W.h)} units lower means 10^${pH(Y.h) - pH(W.h)} = ${whole(ratio4)} times the concentration: ${sci(W.exp)} ÷ ${sci(Y.exp)} = ${whole(ratio4)}.`,
    },
    {
      type: 'T', level: 3,
      stem: `Solution ${W.name} is a strong acid. A sample of ${taken} mL is diluted with water to a total volume of ${whole(madeUpTo)} mL at 25 °C. What is the pH of the diluted solution?`,
      options: numericOptions(
        { value: pH5, why: `The volume grows ${madeUpTo / taken} times, so [H₃O⁺] falls to ${sci(Math.log10(diluted))} mol/L.` },
        [
          { value: pH(W.h) - Math.log10(madeUpTo / taken), why: `This lowers the pH. Diluting lowers [H₃O⁺], so the pH rises.` },
          { value: pH(W.h), why: 'This leaves the pH unchanged, but the hydronium ions are now spread through a larger volume.' },
          { value: 7, why: `Diluting makes the solution less acidic, but [H₃O⁺] is still ${sci(Math.log10(diluted))} mol/L, a hundred times that of pure water.` },
        ],
        fmt,
      ),
      explanation: `${taken} mL made up to ${whole(madeUpTo)} mL is a ${madeUpTo / taken}-fold dilution, so [H₃O⁺] falls from ${sci(W.exp)} to ${sci(Math.log10(diluted))} mol/L. A concentration ${madeUpTo / taken} times lower is a pH ${Math.log10(madeUpTo / taken)} units higher: ${pH(W.h)} + ${Math.log10(madeUpTo / taken)} = ${pH5}.`,
    },
    {
      type: 'C', level: 2,
      stem: `At 25 °C a solution has a pOH of ${pOH6}. How is it classified?`,
      options: [
        { text: 'Acidic.', why: `This reads the pOH as if it were the pH. A pOH of ${pOH6} means a pH of ${pH6}.` },
        { text: 'Neutral.', why: 'A neutral solution at 25 °C has pH and pOH both 7.' },
        { text: 'It cannot be told without its concentration of hydronium ions.', why: `At 25 °C the pH follows from the pOH: ${KW_P} − ${pOH6} = ${pH6}.` },
        { text: 'Basic.', correct: true, why: `Its pH is ${KW_P} − ${pOH6} = ${pH6}, above 7.` },
      ],
      explanation: `At 25 °C pH + pOH = ${KW_P}, so the pH is ${KW_P} − ${pOH6} = ${pH6}. A pH above 7 is basic. A low pOH means many hydroxide ions.`,
    },
    {
      type: 'S', level: 3,
      stem: 'The concentration of hydronium ions in a solution doubles. What happens to its pH?',
      options: [
        { text: 'It falls by less than one unit.', correct: true, why: `Doubling is less than the factor of ten that one unit stands for: the pH falls by log₁₀ 2, about ${fixed(shift7, 1)}.` },
        { text: 'It falls by exactly two units.', why: 'Two units stand for a factor of a hundred, not two.' },
        { text: 'It rises by less than one unit.', why: 'More hydronium ions mean a lower pH, because of the minus sign in the definition.' },
        { text: 'It halves.', why: 'The pH is a logarithm: multiplying the concentration by a factor subtracts a fixed amount from the pH, it does not divide it.' },
      ],
      explanation: `A higher [H₃O⁺] gives a lower pH. One unit stands for a factor of ten, and a factor of two is less than that, so the pH falls by less than one unit: −log₁₀ (2 × [H₃O⁺]) = pH − log₁₀ 2, about ${fixed(shift7, 1)} lower.`,
    },
  ],
};

// Full mock 4, passage 1. Area: mathematics. Subject: modular arithmetic and congruences.
import { numericOptions, p, whole } from '../lib.mjs';

// True mathematical remainder in 0 .. n − 1 (JS % keeps the dividend's sign for negatives).
const mod = (a, n) => ((a % n) + n) % n;

// ---------- Figure 1: modulo-7 clockwise cycle ----------
const modFig = 7;
const figNodes = Array.from({ length: modFig }, (_, k) => k);
if (new Set(figNodes).size !== modFig) throw new Error('Figure 1 nodes must be distinct');

// Question 2: advancing clockwise on the modulo-7 cycle.
const q2 = { start: 3, steps: 43 };
const q2Right = mod(q2.start + q2.steps, modFig);
const q2ForgotStart = mod(q2.steps, modFig);
const q2Anticlockwise = mod(q2.start - q2.steps, modFig);
const q2Quotient = Math.floor((q2.start + q2.steps) / modFig);
if (q2Right === q2Quotient || [q2Right, q2ForgotStart, q2Anticlockwise, q2Quotient].includes(q2.start)) {
  throw new Error('question 2 options must avoid quotient coincidence and starting position');
}

// Question 3: reducing before multiplying and adding modulo 9.
const q3 = { a: 904, b: 718, c: 451, n: 9 };
const r3a = mod(q3.a, q3.n);
const r3b = mod(q3.b, q3.n);
const r3c = mod(q3.c, q3.n);
const q3Right = mod(q3.a * q3.b + q3.c, q3.n);
if (q3Right !== mod(r3a * r3b + r3c, q3.n)) throw new Error('modular reduction disagrees with direct arithmetic');
const q3DropC = mod(r3a * r3b, q3.n);
const q3AllAdd = mod(r3a + r3b + r3c, q3.n);
const q3WrongOrder = mod(r3a * (r3b + r3c), q3.n);

// Question 4: negative congruence modulo 8.
const q4Target = -29;
const q4Mod = 8;
const q4Candidates = [19, 20, 21, 29];
if (q4Candidates.filter((x) => mod(x, q4Mod) === mod(q4Target, q4Mod)).length !== 1 || mod(q4Candidates[0], q4Mod) !== mod(q4Target, q4Mod)) {
  throw new Error('question 4 needs 19 as the unique congruent integer');
}

// Question 5: changing operands modulo 12.
const q5 = { aRem: 5, bRem: 7, addA: 26, subB: 12, n: 12 };
const q5Before = mod(q5.aRem * q5.bRem, q5.n);
const q5After = mod((q5.aRem + q5.addA) * (q5.bRem - q5.subB), q5.n);
if (q5Before !== 11 || q5After !== 1) throw new Error('question 5 values mismatch');

// Question 6: verify counter-example for 3x ≡ 3y (mod 12).
const ex6 = { x: 1, y: 5, n: 12 };
if (mod(3 * ex6.x, ex6.n) !== mod(3 * ex6.y, ex6.n) || mod(ex6.x, ex6.n) === mod(ex6.y, ex6.n) || mod(ex6.x, 4) !== mod(ex6.y, 4)) {
  throw new Error('question 6 counter-example failed');
}

// Question 7: exact BigInt check for 3^27 mod 10.
const q7 = { base: 3, exp: 27, n: 10, cycle: 4 };
const q7Right = Number(BigInt(q7.base) ** BigInt(q7.exp) % BigInt(q7.n));
const q7ExpRem = mod(q7.exp, q7.cycle);
if (Number(BigInt(q7.base) ** BigInt(q7.cycle) % BigInt(q7.n)) !== 1 || q7Right !== mod(q7.base ** q7ExpRem, q7.n)) {
  throw new Error('question 7 cycle check failed');
}
const q7DropRem = 1;
const q7RemOne = mod(q7.base ** 1, q7.n);
const q7RemTwo = mod(q7.base ** 2, q7.n);

// ---------- Figure 1 SVG: 7-node clockwise modular circle ----------
const cx = 220;
const cy = 140;
const rad = 92;
const nodeR = 20;
const r1 = (v) => Math.round(v * 10) / 10;
const posAt = (k) => {
  const angle = -Math.PI / 2 + (2 * Math.PI * k) / modFig;
  return { x: r1(cx + rad * Math.cos(angle)), y: r1(cy + rad * Math.sin(angle)), angle };
};
const arcArrows = figNodes.map((k) => {
  const a1 = -Math.PI / 2 + (2 * Math.PI * k) / modFig + 0.25;
  const a2 = -Math.PI / 2 + (2 * Math.PI * (k + 1)) / modFig - 0.25;
  const x1 = r1(cx + rad * Math.cos(a1));
  const y1 = r1(cy + rad * Math.sin(a1));
  const x2 = r1(cx + rad * Math.cos(a2));
  const y2 = r1(cy + rad * Math.sin(a2));
  const tx = Math.cos(a2 + Math.PI / 2);
  const ty = Math.sin(a2 + Math.PI / 2);
  const nx = -ty;
  const ny = tx;
  const bx = x2 - 8 * tx;
  const by = y2 - 8 * ty;
  return `<line x1="${x1}" y1="${y1}" x2="${r1(bx)}" y2="${r1(by)}"/><polygon class="dot" points="${x2},${y2} ${r1(bx + 4.5 * nx)},${r1(by + 4.5 * ny)} ${r1(bx - 4.5 * nx)},${r1(by - 4.5 * ny)}"/>`;
}).join('');
const nodeCircles = figNodes.map((k) => {
  const { x, y } = posAt(k);
  return `<circle class="part" cx="${x}" cy="${y}" r="${nodeR}"/><text class="big" x="${x}" y="${r1(y + 7)}" text-anchor="middle">${k}</text>`;
}).join('');
const figure1 = `<svg viewBox="0 0 440 280" role="img" aria-labelledby="p36-fig1-alt">
  ${arcArrows}
  ${nodeCircles}
  <text class="title" x="${cx}" y="${cy + 6}" text-anchor="middle">mod ${modFig}</text>
</svg>`;

export default {
  id: 'p36',
  set: 'mock',
  mock: 4,
  area: 'mathematics',
  title: 'Modular Arithmetic and Congruences',
  facts: [
    { claim: 'Dividing any integer a by a positive integer modulus n gives a unique integer quotient q and remainder r with a = q × n + r and 0 ≤ r < n; this remainder is written a mod n.', source: 'https://en.wikipedia.org/wiki/Modular_arithmetic', read: '2026-11-18' },
    { claim: 'Two integers a and b are congruent modulo n, written a ≡ b (mod n), when a − b is an integer multiple of n, equivalently when both leave the same remainder on division by n.', source: 'https://openstax.org/books/contemporary-mathematics/pages/3-key-concepts', read: '2026-11-18' },
    { claim: 'Congruence modulo n is compatible with addition, subtraction, multiplication and positive integer powers: if a ≡ c (mod n) and b ≡ d (mod n), then a + b ≡ c + d (mod n) and a × b ≡ c × d (mod n).', source: 'https://en.wikipedia.org/wiki/Modular_arithmetic', read: '2026-11-18' },
    { claim: 'Cancelling a common factor k from k × x ≡ k × y (mod n) does not preserve modulus n when k and n share a factor greater than 1; dividing k × (x − y) = m × n by gcd(k, n) reduces the modulus correspondingly.', source: 'https://en.wikipedia.org/wiki/Modular_arithmetic', read: '2026-11-18' },
  ],
  blocks: [
    p(
      'On a 24-hour clock, 5 hours after 22:00 is 03:00 rather than 27:00, because the count wraps back to 0 every 24 hours.',
      'Modular arithmetic applies the same wrap-around rule to any positive integer n, called the modulus.',
      'Dividing any integer a by n produces a unique integer quotient q and an integer remainder r satisfying a = q × n + r with 0 ≤ r < n.',
      'That remainder r is written a mod n.',
      'Even when a is negative, r stays between 0 and n − 1: for example, −3 = (−1) × 7 + 4, so (−3) mod 7 = 4.',
      `Figure 1 shows the remainders 0 to ${modFig - 1} arranged in a clockwise cycle for modulus ${modFig}: adding 1 steps one place clockwise, so 6 wraps around to 0.`,
    ),
    {
      type: 'figure',
      id: 'p36-fig1',
      caption: `Figure 1. The modulo-${modFig} remainder cycle; each clockwise step adds 1 and wraps from ${modFig - 1} to 0.`,
      alt: `Seven numbered circles 0, 1, 2, 3, 4, 5, 6 arranged clockwise around a ring labelled mod ${modFig}, with arrows from 0 to 1, 1 to 2, up to 6 back to 0.`,
      svg: figure1,
    },
    p(
      'Two integers a and b are called congruent modulo n, written a ≡ b (mod n), when they leave the same remainder on division by n.',
      'Equivalently, their difference is an integer multiple of n:',
    ),
    { type: 'formula', text: 'a ≡ b (mod n)   means   a − b = k × n   for some integer k' },
    p(
      'A major shortcut of modular arithmetic is that numbers can be replaced by their remainders before adding, subtracting or multiplying.',
      'If a ≡ c (mod n) and b ≡ d (mod n), then:',
    ),
    { type: 'formula', text: 'a + b ≡ c + d (mod n)   and   a × b ≡ c × d (mod n)' },
    p(
      'Applying the multiplication rule repeatedly also simplifies powers: if a^m ≡ 1 (mod n), every block of m factors of a contributes 1.',
      'Division, however, needs care: cancelling a factor that shares a common divisor greater than 1 with n does not keep the same modulus n.',
      'For instance, 2 × 4 = 8 and 2 × 1 = 2 both leave remainder 2 modulo 6, so 2 × 4 ≡ 2 × 1 (mod 6), yet 4 is not congruent to 1 modulo 6.',
    ),
  ],
  questions: [
    {
      type: 'R', level: 1,
      stem: 'According to the text, when are two integers a and b congruent modulo n?',
      options: [
        { text: 'When a + b is an integer multiple of n.', why: 'Congruence requires the difference a − b, not the sum a + b, to be a multiple of n; 5 + 2 = 7, yet 5 and 2 have different remainders modulo 7.' },
        { text: 'When a − b is an integer multiple of n, so both leave the same remainder on division by n.', correct: true, why: 'This is the definition and first formula in the second paragraph.' },
        { text: 'When n divided by a − b is an integer.', why: 'a − b must be a multiple of n (such as 14 when n = 7), not a divisor of n.' },
        { text: 'When a and b have the same integer quotient q upon division by n.', why: 'Numbers with the same quotient (such as 8 and 9 for n = 7) have consecutive remainders rather than equal remainders.' },
      ],
      explanation: 'The second paragraph defines a ≡ b (mod n) as leaving the same remainder on division by n, which is equivalent to a − b = k × n for some integer k.',
    },
    {
      type: 'F', level: 1,
      stem: `Starting at ${q2.start} on the modulo-${modFig} cycle in Figure 1 and advancing ${q2.steps} steps clockwise, on which number do you land?`,
      options: numericOptions(
        { value: q2Right, why: `(${q2.start} + ${q2.steps}) mod ${modFig} = ${q2.start + q2.steps} mod ${modFig} = ${q2Right}, since ${q2.start + q2.steps} = ${q2Quotient} × ${modFig} + ${q2Right}.` },
        [
          { value: q2ForgotStart, why: `This computes ${q2.steps} mod ${modFig} = ${q2ForgotStart} as if starting from 0 rather than from ${q2.start}.` },
          { value: q2Anticlockwise, why: `This moves ${q2.steps} steps anticlockwise ((${q2.start} − ${q2.steps}) mod ${modFig} = ${q2Anticlockwise}) instead of clockwise.` },
          { value: q2Quotient, why: `This is the integer quotient ${q2Quotient} of ${q2.start + q2.steps} ÷ ${modFig}, counting full turns rather than the remainder.` },
        ],
        whole,
      ),
      explanation: `Every ${modFig} clockwise steps complete one full turn around Figure 1. Adding the steps gives ${q2.start} + ${q2.steps} = ${q2.start + q2.steps} = ${q2Quotient} × ${modFig} + ${q2Right}, landing on ${q2Right}.`,
    },
    {
      type: 'A', level: 2,
      stem: `What is (${q3.a} × ${q3.b} + ${q3.c}) mod ${q3.n}?`,
      options: numericOptions(
        { value: q3Right, why: `Modulo ${q3.n}, ${q3.a} ≡ ${r3a}, ${q3.b} ≡ ${r3b} and ${q3.c} ≡ ${r3c}, so ${r3a} × ${r3b} + ${r3c} = ${r3a * r3b + r3c} ≡ ${q3Right} (mod ${q3.n}).` },
        [
          { value: q3DropC, why: `This computes (${r3a} × ${r3b}) mod ${q3.n} = 28 mod ${q3.n} = ${q3DropC} and forgets to add ${q3.c} ≡ ${r3c}.` },
          { value: q3AllAdd, why: `This adds ${r3a} + ${r3b} + ${r3c} = ${r3a + r3b + r3c} ≡ ${q3AllAdd} instead of multiplying ${r3a} and ${r3b}.` },
          { value: q3WrongOrder, why: `This adds before multiplying: ${r3a} × (${r3b} + ${r3c}) = 32 ≡ ${q3WrongOrder} (mod ${q3.n}).` },
        ],
        whole,
      ),
      explanation: `Reduce each number modulo ${q3.n} first: ${q3.a} = 100 × ${q3.n} + ${r3a}, ${q3.b} = 79 × ${q3.n} + ${r3b}, and ${q3.c} = 50 × ${q3.n} + ${r3c}. Then (${r3a} × ${r3b} + ${r3c}) = 29 = 3 × ${q3.n} + ${q3Right}, so the remainder is ${q3Right}.`,
    },
    {
      type: 'C', level: 2,
      stem: `Which of the following integers is congruent to −29 modulo ${q4Mod}?`,
      options: [
        { text: '19', correct: true, why: '19 − (−29) = 48 = 6 × 8, so both leave remainder 3 when divided by 8 (−29 = −4 × 8 + 3).' },
        { text: '20', why: '20 − (−29) = 49, which is a multiple of 7 rather than 8.' },
        { text: '21', why: '21 leaves remainder 5 modulo 8 (the remainder of +29, ignoring the minus sign on −29).' },
        { text: '29', why: '29 − (−29) = 58, which is not divisible by 8; −29 ≡ 3 whereas +29 ≡ 5 (mod 8).' },
      ],
      explanation: `Write −29 = (−4) × 8 + 3, so (−29) mod 8 = 3. Checking the options modulo 8 gives 19 = 2 × 8 + 3 (difference 19 − (−29) = 48 = 6 × 8), whereas 20, 21 and 29 leave remainders 4, 5 and 5.`,
    },
    {
      type: 'D', level: 2,
      stem: `Two integers a and b satisfy a ≡ ${q5.aRem} (mod ${q5.n}) and b ≡ ${q5.bRem} (mod ${q5.n}). Next, a is increased by ${q5.addA} and b is decreased by ${q5.subB}. How does the remainder (a × b) mod ${q5.n} change?`,
      options: [
        { text: `It falls from ${q5Before} to ${q5After}.`, correct: true, why: `Before: ${q5.aRem} × ${q5.bRem} = 35 ≡ ${q5Before} (mod ${q5.n}). Adding ${q5.addA} ≡ 2 makes a ≡ 7 while subtracting ${q5.subB} leaves b ≡ 7, and 7 × 7 = 49 ≡ ${q5After} (mod ${q5.n}).` },
        { text: `It rises from ${q5Before} to 13.`, why: `A remainder modulo ${q5.n} must lie between 0 and ${q5.n - 1}; 13 is outside that range.` },
        { text: `It falls from ${q5Before} to 9.`, why: `Increasing a by 2 adds 2 × b ≡ 14 ≡ 2 (mod ${q5.n}) to ${q5Before}, wrapping to ${q5After} rather than subtracting 2.` },
        { text: `It stays at ${q5Before}.`, why: `Subtracting ${q5.subB} leaves b unchanged modulo ${q5.n}, but ${q5.addA} = 2 × ${q5.n} + 2 changes a modulo ${q5.n}.` },
      ],
      explanation: `Initially, a × b ≡ ${q5.aRem} × ${q5.bRem} = 35 = 2 × ${q5.n} + ${q5Before}, so the remainder is ${q5Before}. Since ${q5.addA} ≡ 2 (mod ${q5.n}) and ${q5.subB} ≡ 0 (mod ${q5.n}), the new remainders are a ≡ 7 and b ≡ 7, giving 7 × 7 = 49 = 4 × ${q5.n} + ${q5After}.`,
    },
    {
      type: 'S', level: 3,
      stem: 'For two integers x and y, it is given that 3 × x ≡ 3 × y (mod 12). Which statement about x and y must be true?',
      options: [
        { text: 'x ≡ y (mod 12) must hold, because the common factor 3 cancels on both sides.', why: '3 shares the factor 3 with 12; for x = 1 and y = 5, 3 × 1 = 3 and 3 × 5 = 15 ≡ 3 (mod 12), yet 1 and 5 are not congruent modulo 12.' },
        { text: 'x ≡ y (mod 3) must hold, because both sides contain a factor of 3.', why: '3 × (x − y) = 12 × k divides by 3 to give x − y = 4 × k; for x = 1 and y = 5, 5 − 1 = 4 is not a multiple of 3.' },
        { text: 'x ≡ 0 (mod 4) and y ≡ 0 (mod 4) must both hold.', why: 'Only the difference x − y must be a multiple of 4; x = 1 and y = 5 satisfy the congruence without either being a multiple of 4.' },
        { text: 'x ≡ y (mod 4) must hold, though x and y need not be congruent modulo 12.', correct: true, why: 'By definition 3 × x − 3 × y = 12 × k for some integer k; dividing both sides by 3 gives x − y = 4 × k, which means x ≡ y (mod 4).' },
      ],
      explanation: 'By the first formula, 3 × x ≡ 3 × y (mod 12) means 3 × (x − y) = 12 × k for some integer k. Dividing this integer equation by 3 gives x − y = 4 × k, which is exact equivalence to x ≡ y (mod 4). Taking k = 1 (for instance x = 5, y = 1) shows x and y need not be congruent modulo 12.',
    },
    {
      type: 'T', level: 3,
      stem: `What is ${q7.base}^${q7.exp} mod ${q7.n}?`,
      options: numericOptions(
        { value: q7Right, why: `${q7.base}^4 = 81 ≡ 1 (mod ${q7.n}) and ${q7.exp} = 4 × 6 + 3, so ${q7.base}^${q7.exp} = (${q7.base}^4)^6 × ${q7.base}^3 ≡ 1^6 × 27 ≡ ${q7Right} (mod ${q7.n}).` },
        [
          { value: q7DropRem, why: `This stops at ${q7.base}^4 ≡ 1 (mod ${q7.n}) and leaves out the remaining three factors (${q7.base}^3 = 27 ≡ ${q7Right}).` },
          { value: q7RemOne, why: `This treats the leftover exponent ${q7.exp} mod 4 as 1 instead of 3 (or reports the exponent remainder 3 directly).` },
          { value: q7RemTwo, why: `This stops one step early in the 4-step cycle (${q7.base}^2 = ${q7RemTwo} instead of ${q7.base}^3 = 27 ≡ ${q7Right}).` },
        ],
        whole,
      ),
      explanation: `Compute the first few powers of ${q7.base} modulo ${q7.n}: ${q7.base}^1 ≡ 3, ${q7.base}^2 ≡ 9, ${q7.base}^3 = 27 ≡ 7, and ${q7.base}^4 = 81 ≡ 1 (mod ${q7.n}). Since ${q7.exp} = 4 × 6 + 3, ${q7.base}^${q7.exp} = (${q7.base}^4)^6 × ${q7.base}^3 ≡ 1^6 × 7 = ${q7Right} (mod ${q7.n}).`,
    },
  ],
};

// Practice set, computational sciences. Subject: Boolean logic and truth tables.
import { numericOptions, p, whole } from '../lib.mjs';

// ---------- the operations, run in code: every truth value below is computed ----------
const AND = (a, b) => a && b;
const OR = (a, b) => a || b;
const XOR = (a, b) => a !== b;
const NOT = (a) => !a;
const NAND = (a, b) => !(a && b);
const NOR = (a, b) => !(a || b);
const bit = (v) => (v ? '1' : '0');
/** Every combination of n inputs, in the usual order 0…0 to 1…1. */
const inputs = (n) => Array.from({ length: 2 ** n }, (_, i) => Array.from({ length: n }, (_, k) => Boolean((i >> (n - 1 - k)) & 1)));
const same = (f, g, n) => inputs(n).every((xs) => f(...xs) === g(...xs));

// Table 1
const table = inputs(2).map(([a, b]) => [bit(a), bit(b), bit(AND(a, b)), bit(OR(a, b)), bit(XOR(a, b))]);

// Question 2: where OR and XOR differ.
const differ = inputs(2).filter(([a, b]) => OR(a, b) !== XOR(a, b));
if (differ.length !== 1) throw new Error('question 2 needs exactly one row where OR and XOR differ');

// Question 3: (A OR B) AND NOT C.
const f3 = (a, b, c) => AND(OR(a, b), NOT(c));
const cases3 = [[false, false, false], [true, false, true], [true, true, true], [false, true, false]];
if (cases3.filter((xs) => f3(...xs)).length !== 1) throw new Error('question 3 needs exactly one true case');
const show3 = ([a, b, c]) => `A = ${bit(a)}, B = ${bit(b)}, C = ${bit(c)}`;

// Question 4: rows of a truth table.
const before = 3;
const added = 2;
const rows = (n) => inputs(n).length;

// Question 5: De Morgan.
const target5 = (a, b) => NOT(OR(a, b));
const options5 = [
  { text: '(NOT A) OR (NOT B)', f: (a, b) => OR(NOT(a), NOT(b)) },
  { text: '(NOT A) AND (NOT B)', f: (a, b) => AND(NOT(a), NOT(b)) },
  { text: '(NOT A) AND B', f: (a, b) => AND(NOT(a), b) },
  { text: 'NOT (A AND B)', f: (a, b) => NOT(AND(a, b)) },
];
if (options5.filter((o) => same(o.f, target5, 2)).length !== 1) throw new Error('question 5 needs exactly one equivalent expression');
const firstDiff = (f, g, n) => inputs(n).find((xs) => f(...xs) !== g(...xs));

// Question 6: the heater. Inputs: C cold, P and Q people at home, W window open.
const spec6 = (c, pp, q, w) => c && (pp || q) && !w;
const options6 = [
  { text: 'C AND (P OR Q) AND (NOT W)', f: (c, pp, q, w) => AND(AND(c, OR(pp, q)), NOT(w)) },
  { text: 'C AND P AND Q AND (NOT W)', f: (c, pp, q, w) => AND(AND(AND(c, pp), q), NOT(w)) },
  { text: '(C AND P) OR (Q AND (NOT W))', f: (c, pp, q, w) => OR(AND(c, pp), AND(q, NOT(w))) },
  { text: '(C AND (P OR Q)) OR (NOT W)', f: (c, pp, q, w) => OR(AND(c, OR(pp, q)), NOT(w)) },
];
if (options6.filter((o) => same(o.f, spec6, 4)).length !== 1 || !same(options6[0].f, spec6, 4)) throw new Error('question 6: only the first expression may match the rule');
const counter6 = options6.map((o) => firstDiff(o.f, spec6, 4));
const show6 = (xs) => (xs ? `C = ${bit(xs[0])}, P = ${bit(xs[1])}, Q = ${bit(xs[2])}, W = ${bit(xs[3])}` : '');

// Question 7: the gate that gives 0 only when both inputs are 1.
const zeroOnlyAt11 = (g) => inputs(2).every(([a, b]) => (g(a, b) === false) === (a && b));
const gates7 = [['AND', AND], ['NOR', NOR], ['NAND', NAND], ['XOR', XOR]];
if (gates7.filter(([, g]) => zeroOnlyAt11(g)).length !== 1) throw new Error('question 7 needs exactly one gate with the property');
const zeros = (g) => inputs(2).filter(([a, b]) => !g(a, b)).map(([a, b]) => `${bit(a)}${bit(b)}`).join(', ');

export default {
  id: 'p11',
  set: 'practice',
  area: 'computational sciences',
  title: 'Boolean Logic and Truth Tables',
  facts: [
    { claim: 'AND is true only when both inputs are true; OR is true when at least one input is true; NOT inverts its input.', source: 'https://en.wikipedia.org/wiki/Truth_table', read: '2026-11-16' },
    { claim: 'XOR is true exactly when its two inputs differ.', source: 'https://en.wikipedia.org/wiki/Exclusive_or', read: '2026-11-16' },
    { claim: 'NAND is the negation of AND and NOR the negation of OR; logic gates implement these operations in circuits.', source: 'https://en.wikipedia.org/wiki/Logic_gate', read: '2026-11-16' },
    { claim: 'A truth table for n inputs has 2^n rows.', source: 'https://en.wikipedia.org/wiki/Truth_table', read: '2026-11-16' },
    { claim: "De Morgan's laws: NOT (A OR B) = (NOT A) AND (NOT B); NOT (A AND B) = (NOT A) OR (NOT B), with OR inclusive.", source: 'https://en.wikipedia.org/wiki/De_Morgan%27s_laws', read: '2026-11-16' },
  ],
  blocks: [
    p(
      'Computers make decisions with Boolean logic, named after the mathematician George Boole.',
      'A Boolean value is either true or false, written 1 and 0.',
      'Operations combine such values into new ones.',
      'A AND B is true only when A and B are both true.',
      'A OR B is true when at least one of them is true, including when both are.',
      'NOT A is true when A is false, and false when A is true.',
      'A XOR B, the exclusive or, is true when exactly one of A and B is true, that is, when the two differ.',
    ),
    p(
      'Two further operations reverse the result of another.',
      'A NAND B means NOT (A AND B), and A NOR B means NOT (A OR B).',
      'In an electronic circuit each operation is carried out by a logic gate, which takes one or more input signals, each high (1) or low (0), and produces an output signal.',
    ),
    p(
      'A truth table lists the output for every possible combination of inputs.',
      'Each input can be 0 or 1, so every extra input doubles the number of combinations: a table for n inputs has 2ⁿ rows.',
      'Table 1 is the truth table of three operations for two inputs.',
    ),
    {
      type: 'table',
      caption: 'Table 1. Truth table of AND, OR and XOR.',
      head: ['A', 'B', 'A AND B', 'A OR B', 'A XOR B'],
      rows: table,
    },
    p(
      'Longer expressions are worked out step by step.',
      'Brackets are worked out first, and NOT applies only to the value or bracket that directly follows it.',
      'Two expressions are equivalent if they give the same output in every row of their truth table.',
      'Two useful equivalences are known as De Morgan\'s laws:',
    ),
    { type: 'formula', text: 'NOT (A AND B) = (NOT A) OR (NOT B)' },
    { type: 'formula', text: 'NOT (A OR B) = (NOT A) AND (NOT B)' },
    p(
      'In words: "not both" means "at least one is not", and "neither" means "both are not".',
      'Engineers use such laws to rewrite a circuit with fewer or cheaper gates without changing what it does.',
    ),
  ],
  questions: [
    {
      type: 'R', level: 1,
      stem: 'According to the text, when is A XOR B true?',
      options: [
        { text: 'When A and B are both true.', why: 'Then A and B do not differ, so A XOR B is false. This is where XOR differs from OR.' },
        { text: 'When at least one of A and B is true.', why: 'That describes OR, which is also true when both are.' },
        { text: 'When A and B are both false.', why: 'Then A and B do not differ, so A XOR B is false.' },
        { text: 'When exactly one of A and B is true.', correct: true, why: 'This is the definition in the first paragraph: XOR is true when the two inputs differ.' },
      ],
      explanation: 'The first paragraph: A XOR B is true when exactly one of A and B is true, that is, when they differ. Table 1 shows 1 in the two rows where A and B differ.',
    },
    {
      type: 'F', level: 1,
      stem: 'According to Table 1, for which inputs do A OR B and A XOR B give different outputs?',
      options: inputs(2).map(([a, b]) => ({
        text: `A = ${bit(a)}, B = ${bit(b)}`,
        ...(OR(a, b) !== XOR(a, b) ? { correct: true } : {}),
        why: OR(a, b) !== XOR(a, b)
          ? `A OR B is ${bit(OR(a, b))} but A XOR B is ${bit(XOR(a, b))}: OR includes the case where both are true, XOR does not.`
          : `In this row both give ${bit(OR(a, b))}.`,
      })),
      explanation: `Compare the last two columns of Table 1 row by row. They agree in three rows and differ only where A = ${bit(differ[0][0])} and B = ${bit(differ[0][1])}: OR gives 1, XOR gives 0.`,
    },
    {
      type: 'A', level: 2,
      stem: 'For which of these inputs is (A OR B) AND (NOT C) true?',
      options: cases3.map((xs) => ({
        text: show3(xs),
        ...(f3(...xs) ? { correct: true } : {}),
        why: f3(...xs)
          ? `A OR B is ${bit(OR(xs[0], xs[1]))} and NOT C is ${bit(NOT(xs[2]))}, so the AND is 1.`
          : OR(xs[0], xs[1])
            ? `A OR B is 1, but C = 1 makes NOT C 0, so the AND is 0.`
            : 'A OR B is 0, so the AND is 0 whatever C is.',
      })),
      explanation: 'Work out the bracket first. The expression is true only when A OR B is 1 and NOT C is 1, that is, when at least one of A and B is 1 and C is 0. Only one of the four inputs meets both conditions.',
    },
    {
      type: 'D', level: 2,
      stem: `The truth table of a circuit with ${before} inputs has ${rows(before)} rows. The circuit gets ${added} more inputs. How many rows does its truth table have now?`,
      options: numericOptions(
        { value: rows(before + added), why: `2^${before + added}: each of the ${added} new inputs doubles the number of rows.` },
        [
          { value: rows(before) + added, why: `This adds one row per new input. Each new input doubles the number of rows.` },
          { value: rows(before + 1), why: 'This doubles only once, as if one input had been added.' },
          { value: rows(before + added + 1), why: `This is 2^${before + added + 1}, one doubling too many.` },
        ],
        whole,
      ),
      explanation: `A table for n inputs has 2ⁿ rows. With ${before + added} inputs that is 2^${before + added} = ${rows(before + added)}: the ${rows(before)} rows are doubled ${added} times.`,
    },
    {
      type: 'S', level: 2,
      stem: 'Which expression gives the same output as NOT (A OR B) for every combination of A and B?',
      options: options5.map((o) => {
        const d = firstDiff(o.f, target5, 2);
        return {
          text: o.text,
          ...(d ? {} : { correct: true }),
          why: d
            ? `For A = ${bit(d[0])}, B = ${bit(d[1])} it gives ${bit(o.f(...d))}, but NOT (A OR B) gives ${bit(target5(...d))}.`
            : 'This is the second of De Morgan\'s laws: "neither A nor B" means "not A and not B".',
        };
      }),
      explanation: 'By De Morgan\'s second law, NOT (A OR B) = (NOT A) AND (NOT B). The other expressions each differ from it in at least one row; NOT (A AND B) is the other law\'s left-hand side, which equals (NOT A) OR (NOT B).',
    },
    {
      type: 'T', level: 3,
      stem: 'A heater should run when it is cold (C = 1) and at least one of two people, P and Q, is at home (P = 1 or Q = 1, or both), but never while the window is open (W = 1). Which expression switches the heater on exactly when it should run?',
      options: options6.map((o, i) => ({
        text: o.text,
        ...(i === 0 ? { correct: true } : {}),
        why: i === 0
          ? 'Cold, and at least one person at home, and the window not open: each condition is one part of the AND.'
          : `For ${show6(counter6[i])} this gives ${bit(o.f(...counter6[i]))}, but the heater should ${spec6(...counter6[i]) ? 'run' : 'stay off'}.`,
      })),
      explanation: 'Translate each condition: cold is C; at least one person at home is P OR Q, which needs brackets because it must be worked out before the AND; the window not open is NOT W. All three must hold, so they are joined by AND: C AND (P OR Q) AND (NOT W).',
    },
    {
      type: 'C', level: 2,
      stem: 'Which gate gives the output 0 only when both of its inputs are 1?',
      options: gates7.map(([name, g]) => ({
        text: name,
        ...(zeroOnlyAt11(g) ? { correct: true } : {}),
        why: zeroOnlyAt11(g)
          ? 'NAND is NOT (A AND B). A AND B is 1 only when both inputs are 1, so NAND is 0 only then.'
          : `${name} gives 0 for the inputs ${zeros(g)}.`,
      })),
      explanation: 'A NAND B means NOT (A AND B). AND gives 1 only when both inputs are 1, so NAND gives 0 only when both inputs are 1 and 1 in every other case.',
    },
  ],
};

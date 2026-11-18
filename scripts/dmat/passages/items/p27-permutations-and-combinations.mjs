// Mock 3, passage 1. Area: mathematics. Subject: permutations and combinations without repetition.
import { numericOptions, p, whole } from '../lib.mjs';

// ---------- counting functions, computed in code ----------
const fact = (n) => {
  if (!Number.isInteger(n) || n < 0) throw new Error(`invalid factorial input ${n}`);
  let out = 1;
  for (let i = 2; i <= n; i++) out *= i;
  return out;
};
const perm = (n, r) => fact(n) / fact(n - r);
const comb = (n, r) => fact(n) / (fact(r) * fact(n - r));

// Check the fundamental identities used in the text and questions.
for (let n = 4; n <= 11; n++) {
  for (let r = 0; r <= n; r++) {
    if (perm(n, r) !== comb(n, r) * fact(r)) throw new Error('P(n, r) must equal C(n, r) * r!');
    if (comb(n, r) !== comb(n, n - r)) throw new Error('symmetry C(n, r) = C(n, n - r) failed');
  }
}

// Worked example in the text: choosing 2 items from 4 distinct items.
const ex = { n: 4, r: 2 };
const exPerm = perm(ex.n, ex.r);
const exComb = comb(ex.n, ex.r);

// Table 1: selections of r = 3 items from pools of size n = 5, 6, 7, 8.
const tableR = 3;
const tableNs = [5, 6, 7, 8];
const tableRows = tableNs.map((n) => [whole(n), whole(perm(n, tableR)), whole(comb(n, tableR))]);
const tableValues = tableNs.flatMap((n) => [n, perm(n, tableR), comb(n, tableR)]);
if (new Set(tableValues).size !== tableValues.length) throw new Error('every number in Table 1 must be different');

// Question 2: classification pool size kept distinct from Question 3.
const q2 = { n: 12, r: 3 };

// Question 3: C(8, 5) via symmetry C(8, 5) = C(8, 3) from Table 1.
const q3 = { n: 8, r: 5 };
const ans3 = comb(q3.n, q3.r);
if (q3.n - q3.r !== tableR || !tableNs.includes(q3.n)) throw new Error('question 3 must link to Table 1 by symmetry');

// Question 4: 4-digit keypad codes from digits 1 to 9 without repetition.
const q4 = { n: 9, r: 4 };
const ans4 = perm(q4.n, q4.r);
const q4Comb = comb(q4.n, q4.r);
const q4WithRepeat = q4.n ** q4.r;
const q4WrongDenom = fact(q4.n) / fact(q4.r);

// Question 5: switching from an unordered group of 4 out of 10 to 4 distinct roles.
const q5 = { n: 10, r: 4 };
const factor5 = perm(q5.n, q5.r) / comb(q5.n, q5.r);
if (factor5 !== fact(q5.r)) throw new Error('question 5 factor must be r!');

// Question 6: 2 physicists from 6 and 2 chemists from 5.
const phys = { n: 6, r: 2 };
const chem = { n: 5, r: 2 };
const ans6 = comb(phys.n, phys.r) * comb(chem.n, chem.r);
const q6Added = comb(phys.n, phys.r) + comb(chem.n, chem.r);
const q6Unrestricted = comb(phys.n + chem.n, phys.r + chem.r);
const q6Ordered = perm(phys.n, phys.r) * perm(chem.n, chem.r);

const numericAnswers = [ans3, ans4, ans6];
if (new Set(numericAnswers).size !== numericAnswers.length) throw new Error('numeric answers must all differ');
if ([ans4, ans6].some((a) => tableValues.includes(a))) throw new Error('questions 4 and 6 must not repeat a number from Table 1');

// Question 7: counter-examples for false general statements when 2 <= r <= n - 2.
const c7 = { n: 5, r: 2 };
if (!(c7.r >= 2 && c7.r <= c7.n - 2)) throw new Error('counter-example must satisfy 2 <= r <= n - 2');
if (perm(c7.n, c7.r) === perm(c7.n, c7.n - c7.r)) throw new Error('counter-example needs unequal permutations');
if (comb(2 * c7.n, c7.r) === 2 * comb(c7.n, c7.r)) throw new Error('counter-example needs C(2n, r) != 2 C(n, r)');

export default {
  id: 'p27',
  set: 'mock',
  mock: 3,
  area: 'mathematics',
  title: 'Permutations and Combinations',
  facts: [
    { claim: 'Multiplication principle: if a first task can be done in m ways and a second task in n ways after the first, the two tasks together can be done in m × n ways.', source: 'https://openstax.org/books/college-algebra-2e/pages/9-5-counting-principles', read: '2026-11-18' },
    { claim: 'For a positive whole number n, n! is the product of all whole numbers from n down to 1, and 0! is defined to equal 1.', source: 'https://openstax.org/books/contemporary-mathematics/pages/7-2-permutations', read: '2026-11-18' },
    { claim: 'A permutation is an ordered selection without repetition; the number of permutations of r objects taken from n distinct objects is P(n, r) = n! ÷ (n − r)!, and ordering all n objects gives P(n, n) = n!.', source: 'https://openstax.org/books/college-algebra-2e/pages/9-5-counting-principles', read: '2026-11-18' },
    { claim: 'A combination is a selection of r objects from n distinct objects in which order does not matter; P(n, r) = C(n, r) × r!, so C(n, r) = n! ÷ (r! × (n − r)!).', source: 'https://openstax.org/books/contemporary-mathematics/pages/7-3-combinations', read: '2026-11-18' },
    { claim: 'Choosing r objects from n distinct objects leaves n − r objects unchosen, so C(n, r) = C(n, n − r).', source: 'https://openstax.org/books/college-algebra-2e/pages/9-5-counting-principles', read: '2026-11-18' },
    { claim: 'When independent unordered selections are made from separate groups, each group is counted with combinations and the counts are multiplied by the multiplication principle.', source: 'https://openstax.org/books/contemporary-mathematics/pages/7-3-combinations', read: '2026-11-18' },
  ],
  blocks: [
    p(
      'Counting possibilities without listing every one rests on the multiplication principle: if a first step can be carried out in m ways and, after each of them, a second step can be carried out in n ways, the two steps together can be carried out in m × n ways.',
      'The same rule extends to any number of steps in sequence.',
      'When n distinct items are placed in a row with no item repeated, there are n choices for the first place, n − 1 remaining choices for the second, and so on down to 1 for the last.',
      'That product of all whole numbers from n down to 1 is called the factorial of n and written n!; by definition, 0! = 1.',
    ),
    p(
      'Often only r items are selected from n distinct items, again without repeating any item.',
      'Whether two selections count as different then depends on whether the order of the chosen items matters.',
      'An ordered selection of r items from n distinct items is called a permutation, and its count is written P(n, r).',
      'Filling r places in order multiplies r descending factors starting at n, which factorials write compactly as',
    ),
    { type: 'formula', text: 'P(n, r) = n! ÷ (n − r)!' },
    p(
      'Dividing n! by (n − r)! cancels the factors for the n − r items left out.',
      'When all n items are arranged in order, r equals n and P(n, n) = n! ÷ 0! = n!.',
      `For ${ex.n} distinct items taken ${ex.r} at a time, P(${ex.n}, ${ex.r}) = ${ex.n}! ÷ ${ex.n - ex.r}! = ${ex.n} × ${ex.n - 1} = ${exPerm}.`,
    ),
    p(
      'An unordered selection of r items from n distinct items is called a combination, and its count is written C(n, r).',
      'Here rearranging the same r chosen items does not create a new outcome: a committee of three members with equal duties is the same committee whichever member is named first.',
      'Each combination of r items yields r! different permutations once those r items are placed in every possible order, so P(n, r) = C(n, r) × r!, giving',
    ),
    { type: 'formula', text: 'C(n, r) = P(n, r) ÷ r! = n! ÷ (r! × (n − r)!)' },
    p(
      `For ${ex.n} items taken ${ex.r} at a time, C(${ex.n}, ${ex.r}) = ${exPerm} ÷ ${ex.r}! = ${exComb}.`,
      'Every choice of r items to take is also a choice of n − r items to leave behind, so C(n, r) always equals C(n, n − r).',
      `Table 1 compares P(n, ${tableR}) and C(n, ${tableR}) for pools of ${tableNs[0]} to ${tableNs.at(-1)} distinct items.`,
    ),
    {
      type: 'table',
      caption: `Table 1. Ordered and unordered selections of r = ${tableR} items from n distinct items.`,
      head: ['Items in pool (n)', `Permutations P(n, ${tableR})`, `Combinations C(n, ${tableR})`],
      rows: tableRows,
    },
  ],
  questions: [
    {
      type: 'R', level: 1,
      stem: 'According to the text, when is a selection of r items from n distinct items counted as a combination rather than a permutation?',
      options: [
        { text: 'When rearranging the chosen items does not count as a different outcome.', correct: true, why: 'The fourth paragraph defines a combination as an unordered selection, where the same r items in another order form the same selection.' },
        { text: 'When the same item from the pool may be chosen more than once.', why: 'Neither permutations nor combinations in the text allow repetition: both draw from n distinct items without repeating any item.' },
        { text: 'When every item in the pool of n items is included in the selection.', why: 'Selecting all n items is still a permutation when order matters, giving P(n, n) = n! ordered arrangements.' },
        { text: 'When selections are made in two steps rather than in a single step.', why: 'Both permutations and multi-step combinations can be built in stages; what separates combinations from permutations is whether order matters.' },
      ],
      explanation: 'A permutation counts ordered selections and a combination counts unordered selections. When changing the order of the chosen items leaves the outcome unchanged, the selection is a combination.',
    },
    {
      type: 'C', level: 1,
      stem: `In which of these situations is the number of possible outcomes given by P(${q2.n}, ${q2.r}) rather than C(${q2.n}, ${q2.r})?`,
      options: [
        { text: `Picking ${q2.r} novels from a shelf of ${q2.n} distinct novels to take on a train journey.`, why: `Taking the same ${q2.r} novels in a different order puts the exact same set of books in the bag, so order does not matter: C(${q2.n}, ${q2.r}).` },
        { text: `Choosing ${q2.r} delegates with identical duties from a department of ${q2.n} staff members.`, why: `Because the duties are identical, naming the same ${q2.r} people in another order gives the same delegation: C(${q2.n}, ${q2.r}).` },
        { text: `Selecting ${q2.r} soup flavours from ${q2.n} distinct options to serve together at a buffet.`, why: `Choosing the same ${q2.r} flavours in another sequence places the same ${q2.r} soups on the buffet: C(${q2.n}, ${q2.r}).` },
        { text: `Assigning first, second and third prize to ${q2.r} finalists in a contest of ${q2.n} entrants.`, correct: true, why: `First, second and third prize are distinct places, so swapping two winners produces a different result: P(${q2.n}, ${q2.r}).` },
      ],
      explanation: `P(${q2.n}, ${q2.r}) counts ordered selections without repetition. Awarding first, second and third prize distinguishes the order of the ${q2.r} chosen entrants, whereas the other three choices form unordered groups of ${q2.r}.`,
    },
    {
      type: 'F', level: 2,
      stem: `A laboratory has ${q3.n} distinct sensors and chooses ${q3.r} of them to calibrate together, with order playing no part. Using Table 1, how many different groups of ${q3.r} sensors can be chosen?`,
      options: numericOptions(
        { value: ans3, why: `By symmetry, C(${q3.n}, ${q3.r}) = C(${q3.n}, ${q3.n} − ${q3.r}) = C(${q3.n}, ${tableR}), which Table 1 gives as ${whole(ans3)}.` },
        [
          { value: comb(q3.r, tableR), why: `This reads C(${q3.r}, ${tableR}) from the row n = ${q3.r}, confusing the selection size ${q3.r} with the pool size ${q3.n}.` },
          { value: q3.n * q3.r, why: `This multiplies ${q3.n} by ${q3.r} instead of counting unordered selections of ${q3.r} sensors from ${q3.n}.` },
          { value: perm(q3.n, tableR), why: `This reads P(${q3.n}, ${tableR}) = ${whole(perm(q3.n, tableR))} from Table 1, which counts ordered selections of ${tableR} rather than combinations.` },
        ],
        whole,
      ),
      explanation: `Choosing ${q3.r} sensors to calibrate leaves ${q3.n} − ${q3.r} = ${tableR} sensors unchosen, so C(${q3.n}, ${q3.r}) = C(${q3.n}, ${tableR}). In Table 1, the row for n = ${q3.n} gives C(${q3.n}, ${tableR}) = ${whole(ans3)}.`,
    },
    {
      type: 'A', level: 2,
      stem: `A keypad lock uses ${q4.r}-digit codes formed from the ${q4.n} digits 1 to ${q4.n}, with no digit used more than once. How many different ${q4.r}-digit codes are possible?`,
      options: numericOptions(
        { value: ans4, why: `Order matters in a code and digits cannot repeat: P(${q4.n}, ${q4.r}) = ${q4.n} × ${q4.n - 1} × ${q4.n - 2} × ${q4.n - 3} = ${whole(ans4)}.` },
        [
          { value: q4Comb, why: `This is C(${q4.n}, ${q4.r}), which treats the same ${q4.r} digits in different orders as the same code.` },
          { value: q4WithRepeat, why: `This is ${q4.n}^${q4.r} = ${whole(q4WithRepeat)}, which allows digits to be repeated.` },
          { value: q4WrongDenom, why: `This divides ${q4.n}! by ${q4.r}! instead of (${q4.n} − ${q4.r})!, multiplying one factor too many.` },
        ],
        whole,
      ),
      explanation: `In a lock code the order of the digits matters and repetition is forbidden, so the count is P(${q4.n}, ${q4.r}) = ${q4.n}! ÷ (${q4.n} − ${q4.r})! = ${q4.n}! ÷ ${q4.n - q4.r}! = ${q4.n} × ${q4.n - 1} × ${q4.n - 2} × ${q4.n - 3} = ${whole(ans4)}.`,
    },
    {
      type: 'D', level: 2,
      stem: `From ${q5.n} distinct applicants, an organiser first counts the unordered groups of ${q5.r} panellists. She then decides instead to assign the ${q5.r} chosen panellists to ${q5.r} distinct speaking slots: first, second, third and fourth. How does the number of possible outcomes change?`,
      options: [
        { text: `It becomes ${whole(factor5)} times as large, because each group of ${q5.r} can fill the ${q5.r} slots in ${q5.r}! ways.`, correct: true, why: `P(${q5.n}, ${q5.r}) = C(${q5.n}, ${q5.r}) × ${q5.r}!, and ${q5.r}! = ${q5.r} × ${q5.r - 1} × ${q5.r - 2} × 1 = ${whole(factor5)}.` },
        { text: `It becomes ${q5.r} times as large, because there are ${q5.r} distinct speaking slots to assign.`, why: `Assigning ${q5.r} people to ${q5.r} distinct slots gives ${q5.r}! = ${whole(factor5)} orders per group, not ${q5.r}.` },
        { text: `It becomes ${q5.n} times as large, because any of the ${q5.n} applicants can take the first slot.`, why: `The ratio of P(${q5.n}, ${q5.r}) to C(${q5.n}, ${q5.r}) is ${q5.r}!, which depends on ${q5.r}, not on the pool size ${q5.n}.` },
        { text: `It becomes ${whole(factor5)} times smaller, because fixing the speaking order restricts the choices.`, why: 'Distinguishing the order splits each unordered group into many distinct outcomes, so the count grows rather than shrinks.' },
      ],
      explanation: `Unordered groups are counted by C(${q5.n}, ${q5.r}), while ordered assignments to ${q5.r} distinct slots are counted by P(${q5.n}, ${q5.r}). Because P(n, r) = C(n, r) × r!, the count multiplies by ${q5.r}! = ${whole(factor5)}.`,
    },
    {
      type: 'T', level: 3,
      stem: `A research institute has ${phys.n} physicists and ${chem.n} chemists. It forms a ${phys.r + chem.r}-person safety committee consisting of ${phys.r} physicists and ${chem.r} chemists, all serving in the same role. How many different committees can be formed?`,
      options: numericOptions(
        { value: ans6, why: `Choose the physicists in C(${phys.n}, ${phys.r}) = ${comb(phys.n, phys.r)} ways and the chemists in C(${chem.n}, ${chem.r}) = ${comb(chem.n, chem.r)} ways, then multiply: ${comb(phys.n, phys.r)} × ${comb(chem.n, chem.r)} = ${whole(ans6)}.` },
        [
          { value: q6Added, why: `This adds C(${phys.n}, ${phys.r}) = ${comb(phys.n, phys.r)} and C(${chem.n}, ${chem.r}) = ${comb(chem.n, chem.r)} instead of multiplying them by the multiplication principle.` },
          { value: q6Unrestricted, why: `This is C(${phys.n + chem.n}, ${phys.r + chem.r}) = ${whole(q6Unrestricted)}, which counts all ${phys.r + chem.r}-person committees including those without ${phys.r} from each group.` },
          { value: q6Ordered, why: `This multiplies P(${phys.n}, ${phys.r}) = ${perm(phys.n, phys.r)} by P(${chem.n}, ${chem.r}) = ${perm(chem.n, chem.r)}, as if the members held distinct offices.` },
        ],
        whole,
      ),
      explanation: `All members share the same role, so each discipline is an unordered selection: C(${phys.n}, ${phys.r}) = (${phys.n} × ${phys.n - 1}) ÷ 2 = ${comb(phys.n, phys.r)} ways for the physicists, and C(${chem.n}, ${chem.r}) = (${chem.n} × ${chem.n - 1}) ÷ 2 = ${comb(chem.n, chem.r)} ways for the chemists. Every pair of physicists can be combined with every pair of chemists, so by the multiplication principle there are ${comb(phys.n, phys.r)} × ${comb(chem.n, chem.r)} = ${whole(ans6)} committees.`,
    },
    {
      type: 'S', level: 3,
      stem: 'Let n and r be whole numbers with 2 ≤ r ≤ n − 2. Which statement must be true for every such pair of n and r?',
      options: [
        { text: 'C(n, r) is greater than P(n, r).', why: `Since P(n, r) = C(n, r) × r! and r! is at least 2! = 2, P(n, r) is always larger than C(n, r): for n = ${c7.n}, r = ${c7.r}, C(${c7.n}, ${c7.r}) = ${comb(c7.n, c7.r)} while P(${c7.n}, ${c7.r}) = ${perm(c7.n, c7.r)}.` },
        { text: 'P(n, r) equals P(n, n − r).', why: `Symmetry holds for combinations, not permutations in general: for n = ${c7.n}, r = ${c7.r}, P(${c7.n}, ${c7.r}) = ${perm(c7.n, c7.r)} whereas P(${c7.n}, ${c7.n - c7.r}) = ${perm(c7.n, c7.n - c7.r)}.` },
        { text: 'P(n, n − r) divided by C(n, r) equals (n − r)!.', correct: true, why: 'By symmetry C(n, r) = C(n, n − r), and P(n, n − r) = C(n, n − r) × (n − r)!, so their quotient is (n − r)!.' },
        { text: 'Doubling n while keeping r fixed doubles C(n, r).', why: `C(n, r) grows faster than n: for n = ${c7.n}, r = ${c7.r}, C(${c7.n}, ${c7.r}) = ${comb(c7.n, c7.r)}, whereas C(${2 * c7.n}, ${c7.r}) = ${comb(2 * c7.n, c7.r)}, more than four times as large.` },
      ],
      explanation: 'Combine the two rules in the text: first, C(n, r) = C(n, n − r); second, P(n, k) = C(n, k) × k! for any selection size k. Setting k = n − r gives P(n, n − r) = C(n, n − r) × (n − r)! = C(n, r) × (n − r)!, so dividing P(n, n − r) by C(n, r) always leaves (n − r)!.',
    },
  ],
};

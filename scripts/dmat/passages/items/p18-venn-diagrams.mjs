// Full mock 2, passage 1. Area: mathematics. Subject: sets, Venn diagrams and inclusion–exclusion.
import { numericOptions, p, whole } from '../lib.mjs';

// ---------- Figure 1: leisure-centre survey ----------
const onlyP = 34;
const bothPG = 22;
const onlyG = 46;
const neitherPG = 18;

const nP = onlyP + bothPG;
const nG = onlyG + bothPG;
const unionPG = nP + nG - bothPG;
const totalU = unionPG + neitherPG;

if (unionPG !== onlyP + bothPG + onlyG) throw new Error('inclusion–exclusion must match the sum of the three circle regions');
const onFigure = [onlyP, bothPG, onlyG, neitherPG];
if (new Set(onFigure).size !== onFigure.length) throw new Error('every region count on Figure 1 must be different');
if (totalU === 100) throw new Error('avoid a total of 100 so counts cannot be confused with percentages');

// Question 3: members moving from neither facility into both facilities.
const moveBoth = 8;
if (moveBoth >= neitherPG) throw new Error('question 3 move exceeds the neither region');
const nPAfter = nP + moveBoth;
const nGAfter = nG + moveBoth;
const bothAfter = bothPG + moveBoth;
const unionAfter = nPAfter + nGAfter - bothAfter;
if (unionAfter - unionPG !== moveBoth || nPAfter - nP !== moveBoth) throw new Error('question 3 changes do not match');

// Question 4: library survey (separate numbers from Figure 1).
const lib = { total: 150, fiction: 95, nonFiction: 80, neither: 15 };
const libUnion = lib.total - lib.neither;
const libBoth = lib.fiction + lib.nonFiction - libUnion;
const libNoNeither = lib.fiction + lib.nonFiction - lib.total;
const libFictionOnly = lib.fiction - libBoth;
if (libBoth <= 0 || libNoNeither <= 0) throw new Error('question 4 needs positive counts');
if ([libBoth, libNoNeither, libFictionOnly, libUnion].some((v) => onFigure.includes(v) || v === nG)) {
  throw new Error('question 4 options must not repeat Figure 1 numbers or question 2 answer');
}

// Question 5: counter-example for equal sizes.
const subSmall = 10;
const subLarge = 30;
if (subSmall >= subLarge) throw new Error('question 5 example needs strictly smaller subset');

// Question 6: bounds on an overlap when only totals are known.
const grp = { total: 100, spanish: 65, french: 55 };
const minOverlap = grp.spanish + grp.french - grp.total;
const maxOverlap = Math.min(grp.spanish, grp.french);
const sizeDiff = Math.abs(grp.spanish - grp.french);
const largerSet = Math.max(grp.spanish, grp.french);
if (!(minOverlap > 0 && minOverlap !== sizeDiff && maxOverlap < largerSet)) {
  throw new Error('question 6 bounds must be distinct and non-trivial');
}

// Question 7: three-set workshop modules.
const w = { a: 45, b: 38, c: 32, ab: 16, ac: 12, bc: 10, abc: 5 };
const sumSingles = w.a + w.b + w.c;
const sumPairs = w.ab + w.ac + w.bc;
const union3 = sumSingles - sumPairs + w.abc;
const wrongSubAbc = sumSingles - sumPairs - w.abc;
const wrongDropAbc = sumSingles - sumPairs;
// Verify every atomic region of the 3-set Venn diagram is non-negative!
const onlyAB = w.ab - w.abc;
const onlyAC = w.ac - w.abc;
const onlyBC = w.bc - w.abc;
const onlyA = w.a - onlyAB - onlyAC - w.abc;
const onlyB = w.b - onlyAB - onlyBC - w.abc;
const onlyC = w.c - onlyAC - onlyBC - w.abc;
if ([onlyAB, onlyAC, onlyBC, onlyA, onlyB, onlyC, w.abc].some((v) => v < 0)) {
  throw new Error('question 7 three-set counts do not form a valid Venn diagram');
}
if (onlyA + onlyB + onlyC + onlyAB + onlyAC + onlyBC + w.abc !== union3) {
  throw new Error('question 7 regions do not sum to union3');
}

// ---------- Figure 1 ----------
const figure1 = `<svg viewBox="0 0 460 270" role="img" aria-labelledby="p18-fig1-alt">
  <rect class="part" x="18" y="18" width="424" height="234" rx="6"/>
  <text class="title" x="34" y="46">U</text>
  <circle class="curve" cx="185" cy="146" r="82"/>
  <circle class="curve curve-2" cx="275" cy="146" r="82"/>
  <text class="label-1" x="148" y="50" text-anchor="middle">Pool (P)</text>
  <text class="label-2" x="312" y="50" text-anchor="middle">Gym (G)</text>
  <text class="big" x="148" y="154" text-anchor="middle">${onlyP}</text>
  <text class="big" x="230" y="154" text-anchor="middle">${bothPG}</text>
  <text class="big" x="312" y="154" text-anchor="middle">${onlyG}</text>
  <text class="big" x="404" y="232" text-anchor="middle">${neitherPG}</text>
</svg>`;

export default {
  id: 'p18',
  set: 'mock',
  mock: 2,
  area: 'mathematics',
  title: 'Sets and Venn Diagrams',
  facts: [
    { claim: 'A set is a well-defined collection of objects called elements; the cardinality n(A) of a finite set A is the number of elements it contains.', source: 'https://openstax.org/books/contemporary-mathematics/pages/1-key-concepts', read: '2026-11-18' },
    { claim: 'In a Venn diagram, a rectangle represents the universal set U and circles inside it represent sets; the complement A′ holds all elements of U that are not in A, so n(A) + n(A′) = n(U).', source: 'https://openstax.org/books/contemporary-mathematics/pages/1-key-concepts', read: '2026-11-18' },
    { claim: 'The intersection A ∩ B holds elements in both A and B, the union A ∪ B holds elements in A, in B, or in both, disjoint sets have no elements in common, and A is a subset of B if every element of A is also in B.', source: 'https://openstax.org/books/introductory-business-statistics-2e/pages/3-5-venn-diagrams', read: '2026-11-18' },
    { claim: 'Inclusion–exclusion for two finite sets: n(A ∪ B) = n(A) + n(B) − n(A ∩ B).', source: 'https://en.wikipedia.org/wiki/Inclusion%E2%80%93exclusion_principle', read: '2026-11-18' },
    { claim: 'Inclusion–exclusion for three finite sets: n(A ∪ B ∪ C) = n(A) + n(B) + n(C) − n(A ∩ B) − n(A ∩ C) − n(B ∩ C) + n(A ∩ B ∩ C).', source: 'https://openstax.org/books/contemporary-mathematics/pages/1-5-set-operations-with-three-sets', read: '2026-11-18' },
  ],
  blocks: [
    p(
      'A set is a well-defined collection of distinct objects, called its elements.',
      'In a counting problem, all objects under consideration form the universal set, written U.',
      'For any finite set A, its size (or cardinality), written n(A), is the number of elements in A.',
      'A Venn diagram shows U as a rectangle and each set inside U as a circle.',
      'When two circles A and B cross, they split the rectangle into four separate regions: elements in A only, elements in both A and B, elements in B only, and elements in neither set.',
    ),
    p(
      'Three operations build new sets from existing ones.',
      'The intersection, written A ∩ B, contains the elements that belong to both A and B.',
      'Two sets with no elements in common have n(A ∩ B) = 0 and are called disjoint.',
      'The union, written A ∪ B, contains every element that belongs to A, to B, or to both.',
      'The complement of A, written A′, contains every element of U that is not in A, so n(A) + n(A′) = n(U).',
      'If every element of A also belongs to B, then A is called a subset of B, and the circle for A lies wholly inside the circle for B.',
    ),
    {
      type: 'figure',
      id: 'p18-fig1',
      caption: `Figure 1. How ${whole(totalU)} leisure-centre members used the pool (P) and the gym (G) last month.`,
      alt: `A Venn diagram inside a rectangle U representing ${whole(totalU)} members. Two overlapping circles are labelled Pool (P) and Gym (G). Pool only: ${onlyP}. Overlap of Pool and Gym: ${bothPG}. Gym only: ${onlyG}. Outside both circles: ${neitherPG}.`,
      svg: figure1,
    },
    p(
      `Figure 1 records how ${whole(totalU)} members of a leisure centre used the pool (P) and the gym (G) last month.`,
      `Each number counts a single region, so ${onlyP} used the pool only and ${bothPG} used both facilities, giving n(P) = ${onlyP} + ${bothPG} = ${nP}.`,
      'When two sets overlap, adding n(A) and n(B) counts every element of A ∩ B twice, once in each circle.',
      'Subtracting the overlap once gives the inclusion–exclusion rule for two sets:',
    ),
    { type: 'formula', text: 'n(A ∪ B) = n(A) + n(B) − n(A ∩ B)' },
    p(
      'For three sets A, B and C, adding n(A), n(B) and n(C) counts elements in two sets twice and elements in all three sets (A ∩ B ∩ C) three times.',
      'Subtracting the three pairwise overlaps removes those three-set elements three times as well, leaving them uncounted, so they are added back once:',
    ),
    { type: 'formula', text: 'n(A ∪ B ∪ C) = n(A) + n(B) + n(C) − n(A ∩ B) − n(A ∩ C) − n(B ∩ C) + n(A ∩ B ∩ C)' },
  ],
  questions: [
    {
      type: 'R', level: 1,
      stem: 'According to the text, why is n(A ∩ B) subtracted in the formula for n(A ∪ B)?',
      options: [
        { text: 'Because adding n(A) and n(B) counts every element in both sets twice.', correct: true, why: 'Every element in A ∩ B is counted once in n(A) and a second time in n(B), as the third paragraph states.' },
        { text: 'Because elements in A ∩ B do not belong to the union A ∪ B.', why: 'Elements in both sets do belong to A ∪ B; one copy of them stays after the second copy is removed.' },
        { text: 'Because n(A) and n(B) also count the elements outside both circles.', why: 'Elements outside both circles belong to neither A nor B, so neither n(A) nor n(B) counts them.' },
        { text: 'Because two sets in a Venn diagram cannot have the same size.', why: 'Two sets can have the same size whether or not they overlap; subtraction corrects double counting.' },
      ],
      explanation: 'The union A ∪ B includes elements in A, in B, or in both. Summing n(A) and n(B) counts every element of the overlap A ∩ B twice, so n(A ∩ B) is subtracted once.',
    },
    {
      type: 'F', level: 1,
      stem: 'According to Figure 1, how many members used the gym last month, that is, what is n(G)?',
      options: numericOptions(
        { value: nG, why: `Circle G combines "gym only" and "both": ${onlyG} + ${bothPG} = ${nG}.` },
        [
          { value: bothPG, why: 'This is n(P ∩ G), the members who used both facilities, leaving out those who used the gym only.' },
          { value: onlyG, why: `This is only the part of circle G outside circle P. Circle G also holds the ${bothPG} members in the overlap.` },
          { value: unionPG, why: 'This is n(P ∪ G), all members who used the pool, the gym, or both.' },
        ],
        whole,
      ),
      explanation: `Each number in Figure 1 gives the count of one region. Circle G consists of two regions, gym only (${onlyG}) and both pool and gym (${bothPG}), so n(G) = ${onlyG} + ${bothPG} = ${nG}.`,
    },
    {
      type: 'D', level: 2,
      stem: `Suppose ${moveBoth} of the members in Figure 1 who used neither facility start using both the pool and the gym, while every other member's usage stays the same. What happens to n(P) and to n(P ∪ G)?`,
      options: [
        { text: `Both n(P) and n(P ∪ G) rise by ${2 * moveBoth}.`, why: `Only ${moveBoth} members changed their habits; n(P) + n(G) rises by ${2 * moveBoth}, not n(P) or the union.` },
        { text: `Both n(P) and n(P ∪ G) rise by ${moveBoth}.`, correct: true, why: `Each of the ${moveBoth} members enters circle P and enters P ∪ G once; in the formula, +${moveBoth} in n(G) cancels −${moveBoth} from the overlap.` },
        { text: `n(P) rises by ${moveBoth}, and n(P ∪ G) rises by ${2 * moveBoth}.`, why: `This adds +${moveBoth} in n(P) and +${moveBoth} in n(G) without subtracting the +${moveBoth} increase in n(P ∩ G).` },
        { text: `n(P) stays the same, and n(P ∪ G) rises by ${moveBoth}.`, why: `The overlap P ∩ G lies inside circle P, so joining both facilities also adds ${moveBoth} members to P.` },
      ],
      explanation: `The overlap region increases by ${moveBoth} and the region outside both circles drops by ${moveBoth}. Since P ∩ G is part of P and part of P ∪ G, both n(P) and n(P ∪ G) increase by ${moveBoth}. By the formula, (${moveBoth} + ${moveBoth}) − ${moveBoth} = ${moveBoth}.`,
    },
    {
      type: 'A', level: 2,
      stem: `A library surveys ${whole(lib.total)} readers about books borrowed in a month: ${lib.fiction} borrowed fiction, ${lib.nonFiction} borrowed non-fiction, and ${lib.neither} borrowed neither. How many readers borrowed both fiction and non-fiction?`,
      options: numericOptions(
        { value: libBoth, why: `n(F ∪ N) = ${lib.total} − ${lib.neither} = ${libUnion}, so n(F ∩ N) = ${lib.fiction} + ${lib.nonFiction} − ${libUnion} = ${libBoth}.` },
        [
          { value: libNoNeither, why: `This computes ${lib.fiction} + ${lib.nonFiction} − ${lib.total}, forgetting that ${lib.neither} of the ${lib.total} readers borrowed neither.` },
          { value: libFictionOnly, why: `This is the number who borrowed fiction only (${lib.fiction} − ${libBoth}), not those who borrowed both.` },
          { value: libUnion, why: `This is n(F ∪ N) = ${lib.total} − ${lib.neither}, the number who borrowed at least one kind of book.` },
        ],
        whole,
      ),
      explanation: `Of the ${lib.total} readers, ${lib.neither} borrowed neither kind, so n(F ∪ N) = ${lib.total} − ${lib.neither} = ${libUnion}. Rearranging n(F ∪ N) = n(F) + n(N) − n(F ∩ N) gives n(F ∩ N) = ${lib.fiction} + ${lib.nonFiction} − ${libUnion} = ${libBoth}.`,
    },
    {
      type: 'C', level: 2,
      stem: 'For two non-empty finite sets A and B, it is found that n(A ∪ B) = n(B). What must be true about A and B?',
      options: [
        { text: 'Every element of A is also an element of B, so A is a subset of B.', correct: true, why: 'From n(A ∪ B) = n(A) + n(B) − n(A ∩ B), setting n(A ∪ B) = n(B) gives n(A) = n(A ∩ B), so all of A lies in B.' },
        { text: 'A and B are disjoint sets with no elements in common.', why: 'For disjoint sets n(A ∩ B) = 0, giving n(A ∪ B) = n(A) + n(B), which is larger than n(B) when A is non-empty.' },
        { text: 'A and B contain the same number of elements.', why: `Set A can be smaller than B; if a set of ${subSmall} elements lies wholly inside a set of ${subLarge}, n(A ∪ B) is still ${subLarge}.` },
        { text: 'Every element of B is also an element of A, so B is a subset of A.', why: 'That would give n(A ∪ B) = n(A), which equals n(B) only in the special case where n(A) = n(B).' },
      ],
      explanation: 'Substitute n(A ∪ B) = n(B) into n(A ∪ B) = n(A) + n(B) − n(A ∩ B). Cancelling n(B) leaves n(A) = n(A ∩ B): every element of A belongs to both A and B, which means A is a subset of B.',
    },
    {
      type: 'S', level: 3,
      stem: `In a group of ${grp.total} applicants, ${grp.spanish} speak Spanish (S) and ${grp.french} speak French (F). No other information is given. Which pair gives the smallest and largest values that n(S ∩ F) can take?`,
      options: [
        { text: `Smallest 0, largest ${maxOverlap}.`, why: `An overlap of 0 would make n(S ∪ F) = ${grp.spanish} + ${grp.french} = ${grp.spanish + grp.french}, which exceeds the ${grp.total} applicants in the group.` },
        { text: `Smallest ${sizeDiff}, largest ${largerSet}.`, why: `${sizeDiff} is the difference ${grp.spanish} − ${grp.french}, and ${largerSet} exceeds n(F) = ${grp.french}, though an intersection cannot exceed the smaller set.` },
        { text: `Smallest ${minOverlap}, largest ${largerSet}.`, why: `The smallest value ${minOverlap} is right, but n(S ∩ F) cannot exceed n(F) = ${grp.french}, the size of the smaller set.` },
        { text: `Smallest ${minOverlap}, largest ${maxOverlap}.`, correct: true, why: `n(S ∪ F) ≤ ${grp.total} forces n(S ∩ F) ≥ ${grp.spanish} + ${grp.french} − ${grp.total} = ${minOverlap}, and n(S ∩ F) ≤ n(F) caps it at ${maxOverlap} when F is a subset of S.` },
      ],
      explanation: `Because S ∪ F lies inside the group of ${grp.total}, n(S ∪ F) = ${grp.spanish} + ${grp.french} − n(S ∩ F) ≤ ${grp.total}, so n(S ∩ F) ≥ ${minOverlap} (reached when every applicant speaks at least one of the two languages). Every person in S ∩ F also belongs to F, so n(S ∩ F) ≤ ${maxOverlap} (reached when every French speaker also speaks Spanish).`,
    },
    {
      type: 'T', level: 3,
      stem: `At a training workshop, ${w.a} participants took module A, ${w.b} took module B, and ${w.c} took module C. Exactly ${w.ab} took both A and B, ${w.ac} took both A and C, ${w.bc} took both B and C, and ${w.abc} took all three modules. How many participants took at least one of the three modules?`,
      options: numericOptions(
        { value: union3, why: `${w.a} + ${w.b} + ${w.c} − ${w.ab} − ${w.ac} − ${w.bc} + ${w.abc} = ${union3}.` },
        [
          { value: wrongSubAbc, why: `This subtracts the ${w.abc} who took all three at the end (${sumSingles} − ${sumPairs} − ${w.abc}) instead of adding them back.` },
          { value: wrongDropAbc, why: `This stops at ${sumSingles} − ${sumPairs} and forgets to add back the ${w.abc} participants removed three times with the pairwise overlaps.` },
          { value: sumSingles, why: `This adds ${w.a} + ${w.b} + ${w.c} without removing any of the overlaps between the modules.` },
        ],
        whole,
      ),
      explanation: `Apply the three-set inclusion–exclusion formula: n(A ∪ B ∪ C) = (${w.a} + ${w.b} + ${w.c}) − (${w.ab} + ${w.ac} + ${w.bc}) + ${w.abc} = ${sumSingles} − ${sumPairs} + ${w.abc} = ${union3}.`,
    },
  ],
};
